/* Mede o transbordo de cada cena no último beat: quanto o conteúdo do meio
   passa da altura disponível. Um deck que rola não é um deck. */
import { chromium } from 'playwright';
/* A página é ARGUMENTO, não constante. Com o nome fixo no código este arnês
   media alegremente o deck errado e reportava 0 transbordando. */
const PAGINA = process.env.PAGINA || 'assessment.html';
import { readFileSync } from 'node:fs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
const css = readFileSync('_fontes/fonts-abs.css', 'utf8');
await p.route('https://fonts.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'text/css', body: css }));
const errs = []; p.on('pageerror', (e) => errs.push(e.message));
await p.goto(`http://localhost:8899/${PAGINA}?parada=1`, { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);
await p.waitForFunction(() => document.documentElement.dataset.apPronto === '1');
const r = await p.evaluate(() => {
  const out = [];
  document.querySelectorAll('.dk__slide').forEach((s, i) => {
    s.setAttribute('data-ativo', '');
    s.querySelectorAll('[data-beat]').forEach((el) => el.setAttribute('data-visivel', ''));
    s.querySelectorAll('.dk__tab [data-col]').forEach((el) => el.setAttribute('data-visivel', ''));
    /* Mede painel a painel: o pior painel é o que decide se a cena cabe. */
    const paineis = [...s.querySelectorAll('.dk__painel')];
    paineis.forEach((x) => x.setAttribute('data-visivel', ''));
    let pior = 0, alt = 0, cpMin = 1;
    for (const x of paineis) {
      alt = x.clientHeight;
      pior = Math.max(pior, x.scrollHeight - x.clientHeight);
      cpMin = Math.min(cpMin, Number(x.style.getPropertyValue('--cp') || 1));
    }
    out.push({ n: i + 1, modo: s.dataset.arte, sobra: pior, alt, np: paineis.length, cp: cpMin });
    s.removeAttribute('data-ativo');
  });
  return out;
});
let mau = 0;
for (const x of r) {
  const flag = x.sobra > 2 ? `TRANSBORDA +${x.sobra}px` : 'cabe';
  if (x.sobra > 2) mau++;
  console.log(`parada ${String(x.n).padStart(2, '0')} · ${x.modo.padEnd(8)} · ${x.np} painéis · cp ${x.cp.toFixed(2)} · ${flag}`);
}
console.log(`\n${mau} de ${r.length} transbordam`, errs.length ? '· ERROS: ' + errs.join(' ') : '');
await b.close();
