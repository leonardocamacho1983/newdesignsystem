import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const CSS = readFileSync('_fontes/fonts-abs.css', 'utf8');
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const [out, page, sels, W = 1440] = process.argv.slice(2);
const p = await b.newPage({ viewport: { width: Number(W), height: 1000 }, deviceScaleFactor: 2 });
await p.route('https://fonts.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'text/css', body: CSS }));
const errs = []; p.on('pageerror', (e) => errs.push(e.message));
await p.goto(`http://localhost:8899/${page}`, { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);
const H = await p.evaluate(() => document.body.scrollHeight);
const st = await p.evaluate(() => innerHeight * 0.7);
for (let y = 0; y < Math.ceil(H / st) + 2; y++) { await p.evaluate((k) => scrollTo(0, k * innerHeight * 0.7), y); await p.waitForTimeout(150); }
await p.waitForTimeout(2600); await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(400);
for (const s of sels.split(',')) await p.locator(s).first().screenshot({ path: `${out}/${s.replace(/[^a-z0-9]/gi,'')}.png` }).catch(() => console.log('skip', s));
console.log(errs.length ? errs.join('\n') : 'sem erros');
await b.close();
