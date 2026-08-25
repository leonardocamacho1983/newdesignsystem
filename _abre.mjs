import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1600, height: 1000 } });
const css = readFileSync('_fontes/fonts-abs.css', 'utf8');
await p.route('https://fonts.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'text/css', body: css }));
const errs = []; p.on('pageerror', (e) => errs.push(e.message));
await p.goto('http://localhost:8899/bananamilk.html', { waitUntil: 'load' });
await p.waitForFunction(() => document.documentElement.dataset.apPronto === '1');
for (const t of [600, 3000, 6500, 10000]) {
  await p.waitForTimeout(t === 600 ? 600 : 0);
  await p.locator('#palco').screenshot({ path: `/tmp/abre-${t}.png` });
  if (t !== 10000) await p.waitForTimeout(t === 600 ? 2400 : 3500);
}
const rodou = await p.evaluate(() => !!document.getElementById('abertura').dataset.rodando);
await p.waitForTimeout(3000);
const fim = await p.evaluate(() => ({
  rodando: !!document.getElementById('abertura').dataset.rodando,
  escondida: document.getElementById('abertura').hidden,
  laco: !!document.querySelector('.dk__slide[data-ativo]'),
}));
console.log('durante:', rodou ? 'rodando' : 'NÃO rodou', '· depois:', JSON.stringify(fim));
console.log(errs.length ? 'ERROS: ' + errs.join(' | ') : 'sem erros');
await b.close();
