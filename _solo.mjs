import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const css = readFileSync('_fontes/fonts-abs.css', 'utf8');
const [out, pagina, ...alvos] = process.argv.slice(2);
for (const alvo of alvos) {
  const [q, W, H] = alvo.split('@');
  const p = await b.newPage({ viewport: { width: Number(W), height: Number(H || 900) } });
  await p.route('https://fonts.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'text/css', body: css }));
  await p.goto(`http://localhost:8899/${pagina}?${q}`, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForFunction(() => document.documentElement.dataset.kvPronto === '1', { timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(900);
  await p.locator('#solo').screenshot({ path: `${out}/solo-${q.replace(/[^a-z0-9]+/gi, '_')}.png` });
  await p.close();
}
console.log('ok');
await b.close();
