import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1200, height: 1400 }, deviceScaleFactor: 2 });
p.on('pageerror', e => console.log('ERRO:', e.message));
await p.goto('http://localhost:8899/_formas.html', { waitUntil: 'load' });
await p.waitForTimeout(2000);
await p.screenshot({ path: process.argv[2] + '/formas.png', fullPage: true });
await b.close();
