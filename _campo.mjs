/* Renderiza um campo com opts variadas, rampa chata, para julgar a forma. */
import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:8899/_banca.html', { waitUntil: 'load' });
await p.waitForFunction(() => document.documentElement.dataset.pronto === '1');
const [campo, ...variantes] = process.argv.slice(2);
for (let i = 0; i < variantes.length; i++) {
  await p.evaluate(({ campo, opts }) => {
    const { render, c } = window.__b;
    render(c, { shape: campo, opts: JSON.parse(opts), ramp: [0.85, 0.95], cell: 4, seed: 7 });
  }, { campo, opts: variantes[i] });
  await p.locator('#c').screenshot({ path: `/tmp/campo-${i}.png` });
}
console.log('ok', variantes.length);
await b.close();
