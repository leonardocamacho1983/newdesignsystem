/* Prova do laço empilhado: chama resolve() N vezes seguidas no mesmo canvas e
   conta quantas callbacks de rAF ficam vivas por quadro. Um laço = ~1/quadro. */
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const N = Number(process.argv[2] || 12);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const css = readFileSync('_fontes/fonts-abs.css', 'utf8');
await p.route('https://fonts.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'text/css', body: css }));
await p.goto('http://localhost:8899/kv.html?solo=clareza&fmt=16x9&cell=6', { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);
await p.waitForFunction(() => document.documentElement.dataset.kvPronto === '1');

const r = await p.evaluate(async (N) => {
  const c = document.querySelector('#solo canvas');
  const { resolve } = window.__kv;
  if (!resolve) return { erro: 'resolve não exposto em window.__kv' };
  /* Conta callbacks executadas e quadros decorridos. */
  let chamadas = 0, quadros = 0;
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (fn) => raf((t) => { chamadas++; fn(t); });
  const cfg = { shape: 'weave', ramp: [0.04, 1], cell: 6, seed: 7 };
  for (let i = 0; i < N; i++) resolve(c, cfg, 3000);
  await new Promise((ok) => {
    const conta = () => { quadros++; quadros < 30 ? raf(conta) : ok(); };
    raf(conta);
  });
  return { chamadas, quadros, porQuadro: chamadas / quadros };
}, N);

console.log(r.erro ? r.erro
  : `${N} resolve() no mesmo canvas · ${r.chamadas} callbacks em ${r.quadros} quadros · ${r.porQuadro.toFixed(1)} laços vivos por quadro`);
await b.close();
