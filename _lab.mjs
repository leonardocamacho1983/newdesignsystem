/* Captura a folha de contato dos diagramas e reprova a rodada se houver erro
   de página. `page.on('pageerror')` ligado não é zelo: um módulo que quebra
   deixa a página em branco e um screenshot bonito de nada. */
import { chromium } from 'playwright';
import { readFileSync, existsSync } from 'node:fs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1600, height: 1200 }, deviceScaleFactor: 2 });
const errs = []; p.on('pageerror', (e) => errs.push(e.message));
p.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
if (existsSync('_fontes/fonts-abs.css')) {
  const css = readFileSync('_fontes/fonts-abs.css', 'utf8');
  await p.route('https://fonts.googleapis.com/**', (r) => r.fulfill({ contentType: 'text/css', body: css }));
}
await p.goto('http://localhost:8899/' + (process.argv[2] || 'diagramas-lab.html'), { waitUntil: 'networkidle' });
try { await p.waitForFunction(() => document.documentElement.dataset.pronto === '1', null, { timeout: 8000 }); } catch (e) { console.log("NAO FICOU PRONTO"); }
const n = await p.evaluate(() => document.querySelectorAll('.dg').length);
console.log('svgs:', n, '| erros:', errs.length ? errs.join(' || ') : 'nenhum');
const secs = await p.$$('.lb__sec');
for (let i = 0; i < secs.length; i++) {
  const id = await secs[i].evaluate((el) => el.querySelector('h2').textContent.trim());
  await secs[i].screenshot({ path: `/tmp/dg-${String(i).padStart(2, '0')}.png` });
  console.log('  ', id);
}
await b.close();
process.exit(errs.length ? 1 : 0);
