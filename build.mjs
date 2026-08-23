/* Gera as versões autocontidas (dist/) das páginas do guia: um arquivo só,
   sem nenhuma referência local, pronto para mandar por e-mail ou publicar. */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const read = (p) => readFileSync(p, 'utf8');

const PAGES = [
  { src: 'index.html', out: 'cadrian-brand' },
  { src: 'extensoes.html', out: 'cadrian-extensoes' },
];

const engine = read('src/dither.js')
  .replace(/^export /gm, '')
  .replace(/\n?if \(typeof document[\s\S]*$/, '\n');

const favicon = Buffer.from(read('assets/favicon.svg')).toString('base64');

mkdirSync('dist', { recursive: true });

for (const page of PAGES) {
  let html = read(page.src);

  for (const file of ['tokens/tokens.css', 'src/cadrian.css', 'src/guide.css']) {
    html = html.replace(`<link rel="stylesheet" href="${file}">`,
      () => `<style>\n${read(file)}\n</style>`);
  }

  /* O módulo passa a ser inline: troca o import por um IIFE no mesmo escopo. */
  html = html
    .replace(/import \{[^}]+\} from '\.\/src\/dither\.js';/, engine)
    .replace('<link rel="icon" href="assets/favicon.svg">',
      `<link rel="icon" href="data:image/svg+xml;base64,${favicon}">`)
    /* entre as páginas do dist os links apontam para os arquivos gerados */
    .replace(/href="index\.html"/g, 'href="cadrian-brand.html"')
    .replace(/href="extensoes\.html"/g, 'href="cadrian-extensoes.html"');

  /* Trava: qualquer referência local sobrevivente quebraria a página
     autocontida (e um artifact publicado, onde o host bloqueia origens
     externas). Links entre as próprias páginas do dist são esperados. */
  const dangling = [...html.matchAll(/(?:href|src)="((?!https?:|data:|#|cadrian-)[^"]+)"/g)]
    .map((m) => m[1]);
  if (dangling.length) {
    console.error(`${page.src}: referências locais não embutidas:\n  ${dangling.join('\n  ')}`);
    process.exit(1);
  }

  writeFileSync(`dist/${page.out}.html`, html);

  /* Variante fragmento: sem <!doctype>/<html>/<head>/<body>, para hosts que
     fornecem o próprio esqueleto de página (ex.: publicação como artifact). */
  const head = html.slice(html.indexOf('<head>') + 6, html.indexOf('</head>'));
  const body = html.slice(html.indexOf('<body>') + 6, html.lastIndexOf('</body>'));
  writeFileSync(`dist/${page.out}-artifact.html`, head.trim() + '\n' + body.trim() + '\n');

  console.log(`dist/${page.out}.html · ${(html.length / 1024).toFixed(0)} KB`);
}
