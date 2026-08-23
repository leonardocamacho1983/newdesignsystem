import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1180, height: 1200 }, deviceScaleFactor: 2 });
await p.goto('http://localhost:8899/_tipo.html', { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(1200);
await p.screenshot({ path: process.argv[2] + '/tipo.png', fullPage: true });
await b.close();
