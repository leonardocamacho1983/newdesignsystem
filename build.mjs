/* Gera dist/cadrian-brand.html: uma página única, autocontida, para enviar a
   quem não vai clonar o repositório (ou publicar como artifact). */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const read = (p) => readFileSync(p, 'utf8');
let html = read('index.html');

const inline = (tag, file) => {
  html = html.replace(tag, () =>
    tag.startsWith('<link')
      ? `<style>\n${read(file)}\n</style>`
      : `<script type="module">\n${read(file)}\n</script>`
  );
};

inline('<link rel="stylesheet" href="tokens/tokens.css">', 'tokens/tokens.css');
inline('<link rel="stylesheet" href="src/cadrian.css">', 'src/cadrian.css');

/* O módulo passa a ser inline: troca o import por um IIFE no mesmo escopo. */
const engine = read('src/dither.js')
  .replace(/^export /gm, '')
  .replace(/\n?if \(typeof document[\s\S]*$/, '\n');
html = html
  .replace("import { init } from './src/dither.js';", engine)
  .replace('<link rel="icon" href="assets/favicon.svg">',
    `<link rel="icon" href="data:image/svg+xml;base64,${Buffer.from(read('assets/favicon.svg')).toString('base64')}">`)
  .replace('<img src="assets/mark.svg" alt="Símbolo Cadrian" width="88" height="88" style="display:block">',
    read('assets/mark.svg').replace('<svg ', '<svg width="88" height="88" style="display:block" '));

mkdirSync('dist', { recursive: true });
writeFileSync('dist/cadrian-brand.html', html);
console.log(`dist/cadrian-brand.html · ${(html.length / 1024).toFixed(0)} KB`);
