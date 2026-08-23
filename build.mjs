/* Gera as versões autocontidas (dist/) das páginas do guia: um arquivo só,
   sem nenhuma referência local, pronto para mandar por e-mail ou publicar. */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { buildTokens } from './tokens/build-tokens.mjs';

const read = (p) => readFileSync(p, 'utf8');

/* Tabela única do projeto. `out` é ENDEREÇO, `src` e conteúdo são ASSUNTO:
   o nome do arquivo em dist/ é o caminho de publicação a que o artifact está
   ligado, então ele nunca muda — publicar um caminho novo criaria um artifact
   novo e deixaria a URL já compartilhada servindo conteúdo velho. Os nomes
   `cadrian-*` são legado congelado de propósito; a URL pública não os contém.
   Tudo o que depende de nome de arquivo é derivado daqui. */
const PAGES = [
  { src: 'index.html',      out: 'cadrian-brand',     url: 'https://claude.ai/code/artifact/dbceae6a-0ea9-4fcf-9845-bdc238b4baa4' },
  { src: 'extensoes.html',  out: 'cadrian-extensoes', url: 'https://claude.ai/code/artifact/95583fc1-01c2-4af8-9633-e85ff9e88cf2' },
  { src: 'posicionamento.html', out: 'cadrian-nome',  url: 'https://claude.ai/code/artifact/6b3b6d9b-cfb8-4ed7-a6ef-7645e19f5f60' },
  { src: 'studio.html',     out: 'cadrian-studio',    url: 'https://claude.ai/code/artifact/69880886-1e89-49c8-b91a-af90a47f35a5' },
  /* Página nova: escolhe o nome que quiser; a url entra depois da primeira
     publicação. Até lá o aviso em stderr lembra que falta. */
  { src: 'kv.html',         out: 'camacho-kv',         url: 'https://claude.ai/code/artifact/448e707f-5e22-4fcf-a574-aaacd463b0fa' },
  { src: 'aplicacoes.html', out: 'camacho-aplicacoes', url: 'https://claude.ai/code/artifact/40b9d44b-fb1e-4c86-b6ba-bde9c92e27a0' },
];

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/* Primeiro os tokens: o JSON é derivado do CSS, e a checagem de fechamento
   derruba o build se algum token referenciado não existir. */
const tk = buildTokens({ paginas: PAGES.map((p) => p.src) });
console.log(`tokens/tokens.json · ${tk.token} tokens + ${tk.inverso} de inversão`);

/* Uma página recém-criada ainda não tem UUID. Avisar em vez de falhar: o
   esquecimento silencioso era o modo de falha — gerava artifact com link
   quebrado sem nada reclamar. */
for (const p of PAGES) {
  if (!p.url) console.warn(`aviso: ${p.out} ainda não tem url publicada — links para ela ficarão locais no -artifact.html`);
}

const engine = read('src/dither.js')
  .replace(/^export /gm, '')
  .replace(/\n?if \(typeof document[\s\S]*$/, '\n');

const brand = read('src/brand.js').replace(/^export /gm, '');
const kv = read('src/kv.js').replace(/^export /gm, '');

const favicon = Buffer.from(read('assets/favicon.svg')).toString('base64');

mkdirSync('dist', { recursive: true });

for (const page of PAGES) {
  let html = read(page.src);

  for (const file of ['tokens/tokens.css', 'src/camacho.css', 'src/guide.css']) {
    html = html.replace(`<link rel="stylesheet" href="${file}">`,
      () => `<style>\n${read(file)}\n</style>`);
  }

  /* O módulo passa a ser inline: troca o import por um IIFE no mesmo escopo. */
  html = html
    .replace(/import \{[^}]+\} from '\.\/src\/dither\.js';\n?/, engine)
    .replace(/import \{[^}]+\} from '\.\/src\/brand\.js';\n?/, brand)
    .replace(/import \{[^}]+\} from '\.\/src\/kv\.js';\n?/, kv)
    .replace('<link rel="icon" href="assets/favicon.svg">',
      `<link rel="icon" href="data:image/svg+xml;base64,${favicon}">`);

  /* Links entre as páginas apontam para os arquivos gerados, preservando
     qualquer query string (ex.: ?brand=Camacho). */
  for (const other of PAGES) {
    html = html.replace(
      new RegExp(`href="${escapeRe(other.src)}(\\?[^"]*)?"`, 'g'),
      (_, q) => `href="${other.out}.html${q || ''}"`,
    );
  }

  /* Trava: qualquer referência local sobrevivente quebraria a página
     autocontida (e um artifact publicado, onde o host bloqueia origens
     externas). Links entre as próprias páginas do dist são esperados. */
  const allowed = new Set(PAGES.map((p) => `${p.out}.html`));
  const dangling = [...html.matchAll(/(?:href|src)="((?!https?:|data:|#)[^"]+)"/g)]
    .map((m) => m[1])
    .filter((ref) => !allowed.has(ref.split('?')[0]));
  if (dangling.length) {
    console.error(`${page.src}: referências locais não embutidas:\n  ${dangling.join('\n  ')}`);
    process.exit(1);
  }

  writeFileSync(`dist/${page.out}.html`, html);

  /* Variante fragmento: sem <!doctype>/<html>/<head>/<body>, para hosts que
     fornecem o próprio esqueleto de página (ex.: publicação como artifact).
     Lá não existe sistema de arquivos: os links viram as URLs publicadas. */
  let fragment = html;
  for (const other of PAGES) {
    if (!other.url) continue;
    fragment = fragment.replace(
      new RegExp(`href="${escapeRe(`${other.out}.html`)}(\\?[^"]*)?"`, 'g'),
      (_, q) => `href="${other.url}${q || ''}"`,
    );
  }
  const head = fragment.slice(fragment.indexOf('<head>') + 6, fragment.indexOf('</head>'));
  const body = fragment.slice(fragment.indexOf('<body>') + 6, fragment.lastIndexOf('</body>'));
  writeFileSync(`dist/${page.out}-artifact.html`, head.trim() + '\n' + body.trim() + '\n');

  console.log(`dist/${page.out}.html · ${(html.length / 1024).toFixed(0)} KB`);
}
