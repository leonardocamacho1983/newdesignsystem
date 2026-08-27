/* Transbordo em SVG não é o mesmo que em HTML: nada estoura um contêiner, o
   desenho só sai do viewBox e some. Um rótulo cortado não emite erro nenhum —
   foi assim que "Capacidade conforme dedicação" chegou truncada na primeira
   rodada e passou por acabamento ruim em vez de informação perdida.

   Isto mede: para cada elemento com caixa, o bbox contra o viewBox. */
import { chromium } from 'playwright';
/* Pagina e seletor sao ARGUMENTO. Com o nome fixo no codigo o arnes media
   alegremente a peca errada e reportava tudo em ordem. */
const PAGINA = process.env.PAGINA || 'diagramas-lab.html';
const SEL = process.env.SEL || '.lb__quadro' + ' .dg';
import { readFileSync, existsSync } from 'node:fs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1600, height: 1200 } });
const errs = []; p.on('pageerror', (e) => errs.push(e.message));
if (existsSync('_fontes/fonts-abs.css')) {
  const css = readFileSync('_fontes/fonts-abs.css', 'utf8');
  await p.route('https://fonts.googleapis.com/**', (r) => r.fulfill({ contentType: 'text/css', body: css }));
}
await p.goto(`http://localhost:8899/${PAGINA}`, { waitUntil: 'networkidle' });
await p.waitForFunction(() => document.documentElement.dataset.pronto === '1'
  || document.documentElement.dataset.apPronto === '1');
const r = await p.evaluate((SEL) => {
  const fora = [];
  for (const sv of document.querySelectorAll(SEL)) {
    const [, , W, H] = sv.getAttribute('viewBox').split(' ').map(Number);
    for (const el of sv.querySelectorAll('text, rect, line, path, circle')) {
      let bb; try { bb = el.getBBox(); } catch { continue; }
      if (!bb.width && !bb.height) continue;
      const m = 0.6;   // tolerância de sub-pixel do próprio traço
      if (bb.x < -m || bb.y < -m || bb.x + bb.width > W + m || bb.y + bb.height > H + m) {
        fora.push({ dg: sv.dataset.dg, tag: el.tagName,
          txt: (el.textContent || '').slice(0, 34),
          box: [bb.x, bb.y, bb.width, bb.height].map((n) => Math.round(n)), vb: [W, H] });
      }
    }
  }
  return fora;
}, SEL);
console.log('fora do viewBox:', r.length);
for (const f of r) console.log(' ', f.dg, f.tag, JSON.stringify(f.box), 'vb', f.vb, '·', f.txt);
console.log('erros de página:', errs.length ? errs.join(' || ') : 'nenhum');
await b.close();
