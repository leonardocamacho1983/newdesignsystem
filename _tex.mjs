/* Folha de contato de configs completas do motor. */
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1400, height: 1000 } });
const css = readFileSync('_fontes/fonts-abs.css', 'utf8');
await p.route('https://fonts.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'text/css', body: css }));
const errs = []; p.on('pageerror', (e) => errs.push(e.message));
await p.goto('http://localhost:8899/_banca.html', { waitUntil: 'load' });
await p.waitForFunction(() => document.documentElement.dataset.pronto === '1');
await p.evaluate(() => document.fonts.ready);
const estados = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const r = await p.evaluate((estados) => {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:12px;background:#000';
  document.body.innerHTML = ''; document.body.appendChild(wrap);
  try {
    for (const e of estados) {
      const box = document.createElement('div');
      box.style.cssText = 'position:relative;aspect-ratio:16/7;color:#fff';
      const cv = document.createElement('canvas');
      cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
      const rot = document.createElement('span');
      rot.textContent = e.nome;
      rot.style.cssText = 'position:absolute;left:6px;top:4px;font:11px monospace;color:#fff;z-index:2;mix-blend-mode:difference';
      box.append(cv, rot); wrap.appendChild(box);
      window.__b.render(cv, { seed: 7, ...e.opts });
    }
    return 'ok';
  } catch (err) { return 'ERRO: ' + err.message; }
}, estados);
console.log(r, errs.join(' '));
await p.screenshot({ path: '/tmp/tex.png', fullPage: true });
await b.close();
