/* Captura cenas da apresentação em estados específicos: "N:beat" por argumento. */
import { chromium } from 'playwright';
/* A página é ARGUMENTO, não constante. Com o nome fixo no código este arnês
   media alegremente o deck errado e reportava 0 transbordando. */
const PAGINA = process.env.PAGINA || 'assessment.html';
import { readFileSync } from 'node:fs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
const css = readFileSync('_fontes/fonts-abs.css', 'utf8');
await p.route('https://fonts.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'text/css', body: css }));
const errs = []; p.on('pageerror', (e) => errs.push(e.message));
for (const arg of process.argv.slice(2)) {
  const [n, k = 0] = arg.split(':');
  await p.goto(`http://localhost:8899/${PAGINA}?parada=${n}&beat=${k}`, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForFunction(() => document.documentElement.dataset.apPronto === '1');
  await p.waitForTimeout(1500);
  await p.locator('#palco').screenshot({ path: `/tmp/p-${n}-${k}.png` });
}
console.log(errs.length ? 'ERROS:\n' + errs.join('\n') : 'sem erros de página');
await b.close();
