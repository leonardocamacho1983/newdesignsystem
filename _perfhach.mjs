/* Compara o custo por quadro de cada textura, mesmo campo, mesmo tamanho. */
import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:8899/_banca.html', { waitUntil: 'load' });
await p.waitForFunction(() => document.documentElement.dataset.pronto === '1');
const r = await p.evaluate(() => {
  const { render, c } = window.__b;
  const base = { shape: 'weave', ramp: [0.04, 1], cell: 4, seed: 7 };
  const out = {};
  for (const t of ['grain', 'screen', 'halftone', 'hachura']) {
    render(c, { ...base, texture: t, progress: 0.5 });          // aquece
    const t0 = performance.now();
    for (let i = 0; i < 60; i++) render(c, { ...base, texture: t, progress: i / 60 });
    out[t] = (performance.now() - t0) / 60;
  }
  return { out, w: c.clientWidth, h: c.clientHeight };
});
console.log(`${r.w}x${r.h} · cell 4 · ms/quadro (orçamento 16,7):`);
for (const [k, v] of Object.entries(r.out)) console.log(`  ${k.padEnd(9)} ${v.toFixed(2)}`);
await b.close();
