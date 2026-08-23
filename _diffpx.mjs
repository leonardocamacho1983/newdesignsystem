import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const SP = process.argv[2];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage();
for (const n of ['index-1440','extensoes-1440','studio-1440','nome-1440']) {
  const a = readFileSync(`${SP}/base/${n}.png`).toString('base64');
  const c = readFileSync(`${SP}/after/${n}.png`).toString('base64');
  const r = await p.evaluate(async ([a, c]) => {
    const load = (d) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = 'data:image/png;base64,' + d; });
    const [ia, ic] = await Promise.all([load(a), load(c)]);
    const g = (img) => { const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
      const x = cv.getContext('2d'); x.drawImage(img, 0, 0); return x.getImageData(0, 0, cv.width, cv.height).data; };
    const da = g(ia), dc = g(ic), W = ia.width, H = ia.height;
    const rows = [];
    let count = 0, x0 = W, x1 = 0;
    for (let y = 0; y < H; y++) {
      let rowDiff = 0;
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        if (da[i] !== dc[i] || da[i+1] !== dc[i+1] || da[i+2] !== dc[i+2]) {
          rowDiff++; count++; if (x < x0) x0 = x; if (x > x1) x1 = x;
        }
      }
      if (rowDiff) rows.push(y);
    }
    const bandas = [];
    for (const y of rows) {
      const last = bandas[bandas.length - 1];
      if (last && y - last[1] <= 3) last[1] = y; else bandas.push([y, y]);
    }
    return { W, H, pixels: count, pct: (count / (W * H) * 100).toFixed(4), x0, x1, bandas };
  }, [a, c]);
  console.log(`${n}: ${r.pixels} px diferentes (${r.pct}% da página) · faixa x ${r.x0}–${r.x1}`);
  console.log(`   bandas verticais: ${r.bandas.map(([s,e]) => `${s}–${e}`).join(', ') || '(nenhuma)'}`);
}
await b.close();
