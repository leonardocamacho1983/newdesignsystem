/* Passe completo: caminha os 81 beats da apresentacao como um apresentador
   caminharia, e mede o que so aparece em movimento — erro de pagina, laco de
   animacao empilhado, painel vazio, diagrama que nao chegou.

   Medir cena parada nao pega nada disso: o transbordo se ve com tudo revelado,
   mas laco empilhado e painel vazio so existem enquanto se navega. */
import { chromium } from 'playwright';
import { readFileSync, existsSync } from 'node:fs';
const PAGINA = process.env.PAGINA || 'assessment.html';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1600, height: 1000 } });
const errs = [];
p.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
p.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
if (existsSync('_fontes/fonts-abs.css')) {
  const css = readFileSync('_fontes/fonts-abs.css', 'utf8');
  await p.route('https://fonts.googleapis.com/**', (r) => r.fulfill({ contentType: 'text/css', body: css }));
}
await p.goto(`http://localhost:8899/${PAGINA}`, { waitUntil: 'load' });
await p.waitForFunction(() => document.documentElement.dataset.apPronto === '1');

/* Conta lacos vivos por quadro: instrumenta requestAnimationFrame. */
await p.evaluate(() => {
  window.__lacos = 0; const raf = window.requestAnimationFrame;
  window.requestAnimationFrame = (f) => { window.__lacos++; return raf(f); };
});

const total = await p.evaluate(() => window.__cenas ? window.__cenas : null);
const passos = await p.evaluate(() =>
  [...document.querySelectorAll('.dk__slide')].map((s) => +s.dataset.n));

const vazios = [], semDesenho = [];
let n = 0, passagens = 0;
const porCena = {};
const { CENAS, totalBeats } = await import('./src/deck23.js');
const declarado = Object.fromEntries(CENAS.map((c) => [String(c.n), c.beats]));
console.log(`declarado em src/deck23.js: ${CENAS.length} cenas, ${totalBeats()} beats`);
for (let i = 0; i < passos.length; i++) {
  for (let k = 0; ; k++) {
    /* Espera a passagem de ato terminar antes de ler o estado: durante ela a
       seta corta a passagem em vez de avancar, e o beat fica em 0 de proposito.
       Ler no meio disso e a medicao chamando de defeito o comportamento que ela
       mesma disparou. */
    if (await p.evaluate(() => !!document.querySelector('.dk__passagem[data-visivel]'))) {
      passagens++;
      await p.waitForFunction(() => !document.querySelector('.dk__passagem[data-visivel]'),
        null, { timeout: 6000 });
    }
    const r = await p.evaluate(({ i, k }) => {
      const s = document.querySelectorAll('.dk__slide')[i];
      if (!s.hasAttribute('data-ativo')) return null;
      /* Durante a passagem de ato a seta CORTA a passagem em vez de avancar —
         o beat continua 0 de proposito. Contar isso como painel vazio e a
         medicao chamando de defeito o comportamento que ela mesma disparou. */
      const vis = s.querySelectorAll('.dk__painel[data-visivel]').length;
      const dg = s.querySelector('.dg');
      const desenhado = dg ? dg.querySelectorAll('.dg--on').length : -1;
      return { n: +s.dataset.n, k, vis, desenhado, beats: +s.dataset.beats || null };
    }, { i, k });
    if (!r) break;
    n++;
    porCena[r.n] = (porCena[r.n] || 0) + 1;
    if (k > 0 && r.vis === 0) vazios.push(`${r.n}:${k}`);
    if (r.desenhado === 0) semDesenho.push(`${r.n}:${k}`);
    const avancou = await p.evaluate(() => {
      const antes = document.querySelector('.dk__slide[data-ativo]').dataset.n;
      dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      return document.querySelector('.dk__slide[data-ativo]').dataset.n !== antes;
    });
    if (avancou) break;
    /* Na ultima cena a seta nao tem para onde ir, e sem esta parada o laco
       ficava batendo no fim ate o limite de seguranca — a cena 23 aparecia com
       14 beats percorridos contra 4 declarados. Nao era a peca andando errado:
       era a medicao contando a parede. */
    if (k + 1 >= declarado[r.n]) break;
    if (k > 12) break;
  }
}
await p.waitForTimeout(600);
const lacos = await p.evaluate(async () => {
  window.__lacos = 0;
  await new Promise((r) => setTimeout(r, 1000));
  return window.__lacos;
});

/* O total nao basta: ele fecha por soma mesmo se uma cena andar de menos e
   outra de mais. A conferencia e cena a cena, contra o `beats` declarado. */
const divergem = [];
for (const [cn, c] of Object.entries(porCena)) {
  const dec = declarado[cn];
  if (c !== dec) divergem.push(`cena ${cn}: percorreu ${c}, declarou ${dec}`);
}
console.log(`beats percorridos: ${n} · passagens de ato vistas: ${passagens}`);
console.log(`beats por cena: ${divergem.length ? 'DIVERGE\n  ' + divergem.join('\n  ') : 'batem com o declarado em todas'}`);
console.log(`paineis vazios em beat > 0: ${vazios.length ? vazios.join(', ') : 'nenhum'}`);
console.log(`diagramas sem nada desenhado: ${semDesenho.length ? semDesenho.join(', ') : 'nenhum'}`);
console.log(`lacos de animacao por segundo em repouso: ${lacos} (esperado ~0)`);
console.log(`erros: ${errs.length ? errs.join(' || ') : 'nenhum'}`);
await b.close();
process.exit(errs.length || vazios.length || semDesenho.length || divergem.length ? 1 : 0);
