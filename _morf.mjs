/* Mede e captura o morf weave→banana numa bancada isolada. */
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const css = readFileSync('_fontes/fonts-abs.css', 'utf8');
await p.route('https://fonts.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'text/css', body: css }));
const errs = []; p.on('pageerror', (e) => errs.push(e.message));
await p.goto('http://localhost:8899/_banca.html', { waitUntil: 'load' });
await p.waitForFunction(() => document.documentElement.dataset.pronto === '1');
await p.evaluate(() => document.fonts.ready);

const cell = Number(process.argv[2] || 4);
const r = await p.evaluate((cell) => {
  const { render, mistura, fields, c } = window.__b;
  const a = fields.weave({}), z = fields.banana({});
  render(c, { shape: mistura(a, z, 0.5), ramp: [0.06, 1], cell, seed: 7 });
  const t0 = performance.now();
  for (let i = 0; i < 60; i++) render(c, { shape: mistura(a, z, i / 60, 0), ramp: [0.06, 1], cell, seed: 7 });
  return { porQuadro: (performance.now() - t0) / 60, w: c.clientWidth, h: c.clientHeight };
}, cell);
console.log(`morf weave→banana · cell=${cell} · ${r.w}x${r.h} · ${r.porQuadro.toFixed(2)} ms/quadro (orçamento 16,7)`);
for (const t of [0, 0.35, 0.65, 1]) {
  await p.evaluate(({ t, cell }) => {
    const { render, mistura, fields, c } = window.__b;
    render(c, { shape: mistura(fields.weave({}), fields.banana({}), t, 0), ramp: [0.06, 1], cell, seed: 7 });
  }, { t, cell });
  await p.locator('#c').screenshot({ path: `/tmp/morf-${t}.png` });
}
console.log(errs.length ? 'ERROS: ' + errs.join('\n') : 'sem erros de página');
await b.close();
