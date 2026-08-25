/* Renderiza N estados do mesmo campo numa folha de contato, para julgar se uma
   primitiva aguenta todos os argumentos que se quer fazer com ela. */
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1400, height: 1000 } });
const src = readFileSync(process.argv[2], 'utf8');
const estados = JSON.parse(readFileSync(process.argv[3], 'utf8'));
const errs = []; p.on('pageerror', (e) => errs.push(e.message));
await p.goto('http://localhost:8899/_banca.html', { waitUntil: 'load' });
await p.waitForFunction(() => document.documentElement.dataset.pronto === '1');
const r = await p.evaluate(({ src, estados }) => {
  const c = document.getElementById('c');
  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:14px;padding:14px;background:#000';
  document.body.innerHTML = ''; document.body.appendChild(wrap);
  const fab = new Function('clamp01', 'edge', 'return (' + src + ')')(
    (x) => x < 0 ? 0 : x > 1 ? 1 : x,
    (d, s) => { const t = 0.5 - d / (2 * (s || 0.012)); return t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t); });
  try {
    for (const e of estados) {
      const box = document.createElement('div');
      box.style.cssText = 'position:relative;aspect-ratio:16/6;color:#fff';
      const cv = document.createElement('canvas');
      cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
      const rot = document.createElement('span');
      rot.textContent = e.nome;
      rot.style.cssText = 'position:absolute;left:6px;top:4px;font:11px monospace;color:#fff;z-index:2;mix-blend-mode:difference';
      box.append(cv, rot); wrap.appendChild(box);
      window.__b.render(cv, { shape: fab(e.opts), ramp: [0, 1], cell: 3, seed: 7 });
    }
    return 'ok';
  } catch (err) { return 'ERRO: ' + err.message; }
}, { src, estados });
console.log(r, errs.join(' '));
await p.screenshot({ path: '/tmp/estados.png', fullPage: true });
await b.close();
