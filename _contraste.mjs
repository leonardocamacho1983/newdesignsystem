/* Contraste de cada rótulo de serviço contra o campo em que ele vive. Opacidade
   é a forma mais fácil de deixar um desenho elegante e ilegível: o valor que
   parece "discreto" na tela do autor é o que some na projeção. Aqui ele é lido
   do pixel composto, não estimado. */
import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1600, height: 1200 } });
await p.goto('http://localhost:8899/diagramas-lab.html', { waitUntil: 'networkidle' });
await p.waitForFunction(() => document.documentElement.dataset.pronto === '1');
const r = await p.evaluate(() => {
  const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const L = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const rgb = (s) => s.match(/\d+/g).slice(0, 3).map(Number);
  const mix = (fg, a, bg) => fg.map((c, i) => c * a + bg[i] * (1 - a));
  const razao = (a, b) => { const [x, y] = [L(a), L(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const saida = [];
  for (const cel of document.querySelectorAll('.lb__quadro')) {
    const campo = rgb(getComputedStyle(cel).backgroundColor);
    const sv = cel.querySelector('.dg');
    const tinta = rgb(getComputedStyle(sv).color);
    const vistos = new Map();
    for (const t of sv.querySelectorAll('text')) {
      const a = +t.getAttribute('fill-opacity');
      const tam = +t.getAttribute('font-size');
      const k = `${a}@${tam}`;
      if (!vistos.has(k)) vistos.set(k, { a, tam, ex: t.textContent.slice(0, 26) });
    }
    for (const v of vistos.values()) {
      saida.push({ dg: sv.dataset.dg, campo: campo.join(','), op: v.a, tam: v.tam,
        r: +razao(mix(tinta, v.a, campo), campo).toFixed(2), ex: v.ex });
    }
  }
  return saida;
});
r.sort((a, b) => a.r - b.r);
const piso = 4.5;
for (const x of r) {
  console.log(`${x.r < piso ? 'BAIXO' : '  ok '} ${String(x.r).padStart(5)} · ${x.dg.padEnd(4)}`
    + ` op ${x.op} · ${x.tam}px · campo ${x.campo} · ${x.ex}`);
}
console.log(`\nabaixo de ${piso}:1 — ${r.filter((x) => x.r < piso).length} de ${r.length}`);
await b.close();
