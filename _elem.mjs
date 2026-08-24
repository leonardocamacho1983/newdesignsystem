import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
const css = readFileSync('_fontes/fonts-abs.css', 'utf8');
await p.route('https://fonts.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'text/css', body: css }));
await p.goto('http://localhost:8899/kv.html', { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);
const H = await p.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < Math.ceil(H / 700) + 2; y++) { await p.evaluate((k) => scrollTo(0, k * 700), y); await p.waitForTimeout(150); }
await p.waitForTimeout(2500);
const cs = await p.locator('#galeria canvas').all();
for (let i = 0; i < cs.length; i++) await cs[i].screenshot({ path: `${process.argv[2]}/el-${process.argv[3]}-${i}.png` });
console.log('capturados', cs.length);
await b.close();
