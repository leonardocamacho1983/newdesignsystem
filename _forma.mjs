/* Renderiza um campo escrito como corpo de função, para iterar sem editar o motor. */
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:8899/_banca.html', { waitUntil: 'load' });
await p.waitForFunction(() => document.documentElement.dataset.pronto === '1');
const src = readFileSync(process.argv[2], 'utf8');
const errs = []; p.on('pageerror', (e) => errs.push(e.message));
const r = await p.evaluate((src) => {
  const { render, c } = window.__b;
  try {
    const f = new Function('clamp01', 'edge', 'caixa', 'return (' + src + ')')(
      (x) => x < 0 ? 0 : x > 1 ? 1 : x,
      (d, s) => { const t = 0.5 - d / (2 * (s || 0.014)); return t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t); },
      (x, y, w, h) => { const dx = Math.abs(x) - w, dy = Math.abs(y) - h;
        return dx > 0 && dy > 0 ? Math.hypot(dx, dy) : Math.max(dx, dy); });
    render(c, { shape: f, ramp: [0.85, 0.95], cell: 4, seed: 7 });
    return 'ok';
  } catch (e) { return 'ERRO: ' + e.message; }
}, src);
console.log(r, errs.join(' '));
await p.locator('#c').screenshot({ path: '/tmp/forma.png' });
await b.close();
