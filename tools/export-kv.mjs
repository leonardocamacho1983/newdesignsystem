/* ==========================================================================
   Exporta os key visuals em PNG e a micro-animação em vídeo.

   O alvo de renderização é a PRÓPRIA página kv.html, em modo solo. Recriar a
   composição aqui daria dois códigos para a mesma peça, e eles divergiriam no
   primeiro ajuste — o guia publicado deixaria de mostrar o que o arquivo tem.

   Uso:  node tools/export-kv.mjs [destino]
   Requer o servidor local em :8899 e o Chromium do Playwright.
   ========================================================================== */
import { chromium } from 'playwright';
import { mkdirSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { KVS, FORMATOS } from '../src/kv.js';

const DESTINO = process.argv[2] || 'dist/kv';
const BASE = 'http://localhost:8899/kv.html';
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

/* A célula é medida em px lógicos, então uma peça exportada grande ficaria com
   grão fino demais se mantivesse o valor da tela. Escalar pela largura mantém
   o MESMO peso visual de grão em qualquer resolução. */
const LARGURA_DE_PROJETO = 1280;
const celulaPara = (kv, largura) =>
  Math.min(24, Math.max(2, Math.round(kv.cell * (largura / LARGURA_DE_PROJETO))));

/* O Chromium deste ambiente não alcança o Google Fonts; quando existe um
   espelho local, ele é servido no lugar. Fora daqui, a rota simplesmente não
   intercepta e a página busca as fontes normalmente. */
const ESPELHO = '_fontes/fonts-abs.css';
async function comFontes(page) {
  if (!existsSync(ESPELHO)) return;
  const css = readFileSync(ESPELHO, 'utf8');
  await page.route('https://fonts.googleapis.com/**', (r) =>
    r.fulfill({ status: 200, contentType: 'text/css', body: css }));
}

async function abrirPeca(browser, { kv, formato, cell, largura, altura }) {
  const page = await browser.newPage({
    viewport: { width: largura, height: altura },
    deviceScaleFactor: 1,
  });
  await comFontes(page);
  await page.goto(`${BASE}?solo=${kv.id}&fmt=${formato.id}&cell=${cell}`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => document.documentElement.dataset.kvPronto === '1');
  await page.waitForTimeout(400);
  return page;
}

const browser = await chromium.launch({ executablePath: CHROME });
mkdirSync(DESTINO, { recursive: true });

/* --- 1. PNG de cada KV em cada formato ---------------------------------- */
let n = 0;
for (const kv of KVS) {
  for (const formato of FORMATOS) {
    const cell = celulaPara(kv, formato.w);
    const page = await abrirPeca(browser, {
      kv, formato, cell, largura: formato.w, altura: formato.h,
    });
    const arquivo = `${DESTINO}/camacho-kv-${kv.id}-${formato.id}.png`;
    await page.locator('#solo').screenshot({ path: arquivo });
    await page.close();
    n++;
    console.log(`${arquivo}  ${formato.w}×${formato.h}  célula ${cell}px`);
  }
}

/* --- 2. Micro-animação -------------------------------------------------- */
/* Quadro a quadro pelo parâmetro `progress` do motor, em vez de gravar a tela:
   o resultado é determinístico e cai exatamente na duração pedida.

   Saída em GIF e WebP animados, ambos sem perda. Para partícula de borda dura
   isso importa: qualquer codec com perda borra o grão, que é justamente a
   assinatura da marca. E os dois embutem em e-mail, apresentação e social sem
   player. Quem precisar de MP4 converte a partir do WebP. */
const FPS = 25;
const DUR = 2.0;
const QUADROS = Math.round(FPS * DUR);
const LARGURA_ANIM = 1280;

for (const kv of KVS.slice(0, 2)) {
  const formato = FORMATOS[0];
  const largura = LARGURA_ANIM;
  const altura = Math.round(largura * formato.h / formato.w);
  const cell = celulaPara(kv, largura);
  const page = await abrirPeca(browser, { kv, formato, cell, largura, altura });
  const tmp = `${DESTINO}/.quadros-${kv.id}`;
  mkdirSync(tmp, { recursive: true });

  for (let i = 0; i < QUADROS; i++) {
    const t = i / (QUADROS - 1);
    await page.evaluate(([t, id, fmtId, cell]) => {
      const { render, KVS, FORMATOS, CAMPOS, ajustar, configDoKV } = window.__kv;
      const kv = KVS.find((k) => k.id === id);
      const formato = FORMATOS.find((f) => f.id === fmtId);
      const cfg = configDoKV({ ...ajustar(kv, formato), cell }, CAMPOS[kv.campo]);
      /* mesma curva de saída do resolve() do motor */
      render(document.querySelector('#solo canvas'), { ...cfg, progress: 1 - Math.pow(1 - t, 3) });
    }, [t, kv.id, formato.id, cell]);
    await page.locator('#solo').screenshot({ path: `${tmp}/${String(i).padStart(4, '0')}.png` });
  }
  await page.close();

  execFileSync('python3', ['tools/anim-frames.py', tmp,
    `${DESTINO}/camacho-kv-${kv.id}-anim`, String(Math.round(1000 / FPS))], { stdio: 'inherit' });

  rmSync(tmp, { recursive: true, force: true });
  console.log(`animação ${kv.id}: ${largura}×${altura} · ${QUADROS} quadros a ${FPS}fps`);
}

await browser.close();
console.log(`\n${n} PNGs + ${KVS.slice(0, 2).length} animações em ${DESTINO}/`);
