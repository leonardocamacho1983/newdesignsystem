/* Dirige a apresentação COMO ELA É USADA, e não como ela é construída.

   Este arnês existe porque _passe.mjs mentiu por construção. Ele percorreu os
   81 beats disparando `new KeyboardEvent(...)` direto no documento — que é
   exatamente o caminho que o iframe do artifact bloqueia — e reportou tudo
   verde. A peça publicada não avançava com clique nenhum, e a medição não
   tinha como ver isso: eu provei que a navegação funcionava pelo único caminho
   que o usuário não tem.

   Duas diferenças, e as duas são o ponto:

   1. Monta o `-artifact.html` dentro de um `<body>` vazio, que é o que o host
      faz — não a página completa, que só existe em disco.
   2. Navega com `page.mouse.click` e `page.keyboard.press`, que produzem
      evento de verdade, com foco, alvo e coordenada reais.

   Um arnês que simula o evento mede a suposição de quem escreveu. Um que o
   produz mede o comportamento.
*/
import { chromium } from 'playwright';
import { readFileSync, existsSync } from 'node:fs';

const OUT = process.env.OUT || 'camacho-assessment';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
const errs = [];
p.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
p.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
if (existsSync('_fontes/fonts-abs.css')) {
  const css = readFileSync('_fontes/fonts-abs.css', 'utf8');
  await p.route('https://fonts.googleapis.com/**', (r) => r.fulfill({ contentType: 'text/css', body: css }));
}

/* O host monta assim: esqueleto próprio, o fragmento dentro do body. */
const frag = readFileSync(`dist/${OUT}-artifact.html`, 'utf8');
await p.route('http://localhost:8899/__host', (r) => r.fulfill({
  contentType: 'text/html; charset=utf-8',
  body: `<!doctype html><html><head><meta charset="utf-8"></head><body>\n${frag}\n</body></html>`,
}));
await p.goto('http://localhost:8899/__host', { waitUntil: 'load' });
try {
  await p.waitForFunction(() => document.documentElement.dataset.apPronto === '1', null, { timeout: 15000 });
} catch {
  /* Sem `apPronto` a peça pode estar quebrada OU simplesmente não ser navegável
     por beats — proposta e documento são páginas de leitura. A diferença
     importa: uma reprova a rodada, a outra não é assunto deste arnês. */
  const navegavel = await p.evaluate(() => !!document.querySelector('.dk__palco'));
  if (!navegavel) {
    console.log(`  —   · ${OUT} não é peça navegável por beats; nada a dirigir aqui`);
    await b.close(); process.exit(0);
  }
  console.error('a peça não ficou pronta dentro do host.');
  console.error(errs.length ? errs.join('\n') : '(nenhum erro de página — o script pode nem ter rodado)');
  await b.close(); process.exit(1);
}
await p.waitForTimeout(400);

/* Corta a abertura antes de medir: ela dura 12 s no deck de doze e come o
   primeiro clique de propósito. Medir por cima dela seria acusar de defeito um
   comportamento que a peça declara. */
await p.evaluate(() => document.querySelector('.dk__palco').click());
await p.waitForTimeout(500);

const estado = () => p.evaluate(() => {
  const s = document.querySelector('.dk__slide[data-ativo]');
  const vis = [...document.querySelectorAll('.dk__slide[data-ativo] .dk__painel')]
    .findIndex((e) => e.hasAttribute('data-visivel'));
  /* `passo` e não o índice do painel: em cena de diagrama o painel é sempre o
     mesmo e só o desenho muda. Medir pelo painel dava "parou de avançar" na
     cena 5, que estava andando perfeitamente. */
  /* `data-n` no assessment, `data-i` no deck de doze: o arnês serve as duas. */
  return { n: s ? +(s.dataset.n ?? (+s.dataset.i + 1)) : null,
           passo: s ? +s.dataset.passo : -1, painel: vis };
});

const cx = async (frac) => {
  const r = await p.locator('.dk__palco').boundingBox();
  return { x: r.x + r.width * frac, y: r.y + r.height * 0.55 };
};
const clicar = async (frac = 0.6) => { const c = await cx(frac); await p.mouse.click(c.x, c.y); await p.waitForTimeout(140); };

const falhas = [];
const conferir = (ok, o) => { if (!ok) falhas.push(o); console.log(`${ok ? '  ok ' : 'FALHA'} · ${o}`); };

/* 1 — clique no meio avança */
const a0 = await estado();
await clicar(0.6);
const a1 = await estado();
conferir(a1.passo > a0.passo || a1.n > a0.n, `clique no meio avança (${a0.n}:${a0.passo} → ${a1.n}:${a1.passo})`);

/* 2 — clique no primeiro quarto volta */
await clicar(0.1);
const a2 = await estado();
conferir(a2.passo < a1.passo || a2.n < a1.n, `clique na faixa esquerda volta (${a1.n}:${a1.passo} → ${a2.n}:${a2.passo})`);

/* 3 — depois do gesto, a tecla funciona. É a metade que o iframe engolia. */
await p.keyboard.press('ArrowRight');
await p.waitForTimeout(140);
const a3 = await estado();
conferir(a3.passo > a2.passo || a3.n > a2.n, `seta funciona depois do primeiro clique (${a2.n}:${a2.passo} → ${a3.n}:${a3.passo})`);

/* 4 — do começo ao fim só com clique. É a prova que importa. */
await p.keyboard.press('Home');
await p.waitForTimeout(200);
const total = await p.evaluate(() => document.querySelectorAll('.dk__slide').length);
const ultimoPasso = await p.evaluate(() =>
  +document.querySelectorAll('.dk__slide')[document.querySelectorAll('.dk__slide').length - 1].dataset.beats || 0);
let cliques = 0, ultimo = await estado(), parados = 0;
for (let i = 0; i < 400; i++) {
  await clicar(0.6);
  cliques++;
  /* A passagem de ato ENGOLE um clique de propósito: cortar a passagem é a ação
     daquele clique. Então "não andou" só vira falha na segunda tentativa
     seguida — na primeira, espera a passagem sair e tenta de novo. */
  await p.waitForFunction(() => !document.querySelector('.dk__passagem[data-visivel]'),
    null, { timeout: 6000 }).catch(() => {});
  const e = await estado();
  if (e.n === ultimo.n && e.passo === ultimo.passo) {
    if (e.n === total && e.passo >= ultimoPasso - 1) break;
    if (++parados >= 2) { falhas.push(`clique parou de avançar na cena ${e.n}, passo ${e.passo}`); break; }
    continue;
  }
  parados = 0;
  ultimo = e;
  if (e.n === total && e.passo >= ultimoPasso - 1) break;
}
const fim = await estado();
conferir(fim.n === total, `chega na última cena só com clique (${cliques} cliques, parou em ${fim.n}/${total})`);
conferir(errs.length === 0, `sem erro de página${errs.length ? ': ' + errs.join(' || ') : ''}`);

console.log(`\n${falhas.length ? falhas.length + ' FALHA(S)' : 'tudo verde'} · ${OUT}-artifact.html montado como o host monta`);
await b.close();
process.exit(falhas.length ? 1 : 0);
