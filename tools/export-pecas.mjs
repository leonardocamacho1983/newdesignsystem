/* ==========================================================================
   Exporta as PEÇAS reais: arquivos prontos para publicar, enviar e imprimir.

   Diferente do export-kv.mjs, que gera imagens de marca, aqui saem os
   entregáveis — capa e avatar de LinkedIn nos pixels que a plataforma usa, e
   os documentos em PDF de verdade.

   Uso:  node tools/export-pecas.mjs [destino]
   Requer o servidor local em :8899 e o Chromium do Playwright.
   ========================================================================== */
import { chromium } from 'playwright';
import { mkdirSync, existsSync, readFileSync, statSync } from 'node:fs';

const DESTINO = process.argv[2] || 'dist/pecas';
const HOST = 'http://localhost:8899';
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const ESPELHO = '_fontes/fonts-abs.css';
async function comFontes(page) {
  if (!existsSync(ESPELHO)) return;
  const css = readFileSync(ESPELHO, 'utf8');
  await page.route('https://fonts.googleapis.com/**', (r) =>
    r.fulfill({ status: 200, contentType: 'text/css', body: css }));
}

/* O motor desenha por IntersectionObserver: sem passar por toda a página, o
   documento sai com metade dos grafismos em branco. */
async function rolarTudo(page) {
  const h = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < Math.ceil(h / 600) + 2; y++) {
    await page.evaluate((k) => scrollTo(0, k * 600), y);
    await page.waitForTimeout(140);
  }
  await page.waitForTimeout(2200);
  await page.evaluate(() => scrollTo(0, 0));
}

const kb = (f) => `${(statSync(f).size / 1024).toFixed(0)} KB`;
const browser = await chromium.launch({ executablePath: CHROME });
mkdirSync(DESTINO, { recursive: true });

/* --- LinkedIn: os pixels que a plataforma usa de fato ------------------- */
const IMAGENS = [
  { arquivo: 'linkedin-capa.png',   url: '/kv.html?solo=costura&fmt=capa&cell=4', w: 1584, h: 396 },
  { arquivo: 'linkedin-avatar.png', url: '/kv.html?solo=avatar&cell=2',           w: 400,  h: 400 },
];
for (const im of IMAGENS) {
  const page = await browser.newPage({ viewport: { width: im.w, height: im.h }, deviceScaleFactor: 1 });
  await comFontes(page);
  await page.goto(HOST + im.url, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => document.documentElement.dataset.kvPronto === '1');
  await page.waitForTimeout(400);
  await page.locator('#solo').screenshot({ path: `${DESTINO}/${im.arquivo}` });
  await page.close();
  console.log(`${DESTINO}/${im.arquivo}  ${im.w}×${im.h}  ${kb(`${DESTINO}/${im.arquivo}`)}`);
}

/* --- Documentos em PDF --------------------------------------------------- */
const DOCS = [
  { arquivo: 'linkedin-carrossel.pdf', url: '/carrossel.html',
    largura: '1080px', altura: '1350px', nota: 'documento do LinkedIn' },
  { arquivo: 'proposta.pdf', url: '/proposta.html?ref=MODELO',
    formato: 'A4', nota: 'proposta para enviar' },
  { arquivo: 'deck.pdf', url: '/deck.html',
    largura: '1600px', altura: '900px', nota: 'deck em paisagem' },
];
for (const doc of DOCS) {
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 1 });
  await comFontes(page);
  await page.goto(HOST + doc.url, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  /* O deck esconde os slides fora do atual; a folha de impressão os revela,
     então é preciso emular `print` ANTES de desenhar para todos terem tamanho. */
  await page.emulateMedia({ media: 'print' });
  await rolarTudo(page);
  await page.evaluate(() => {
    /* Redesenha tudo agora que a mídia de impressão deu tamanho aos slides. */
    for (const c of document.querySelectorAll('canvas[data-cmc-dither]')) delete c.dataset.cmcDone;
  });
  await page.evaluate(() => window.dispatchEvent(new Event('resize')));
  await rolarTudo(page);
  await page.pdf({
    path: `${DESTINO}/${doc.arquivo}`,
    printBackground: true,
    ...(doc.formato ? { format: doc.formato } : { width: doc.largura, height: doc.altura }),
    margin: doc.formato ? undefined : { top: '0', right: '0', bottom: '0', left: '0' },
  });
  await page.close();
  console.log(`${DESTINO}/${doc.arquivo}  ${doc.nota}  ${kb(`${DESTINO}/${doc.arquivo}`)}`);
}

await browser.close();
console.log(`\n${IMAGENS.length} imagens + ${DOCS.length} documentos em ${DESTINO}/`);
