/* Gera as versões autocontidas (dist/) das páginas do guia: um arquivo só,
   sem nenhuma referência local, pronto para mandar por e-mail ou publicar. */
import { writeFileSync, mkdirSync } from 'node:fs';
import { buildTokens } from './tokens/build-tokens.mjs';
import { read, escapeRe, modulos, embutirCss, embutirModulos, pendencias } from './src/inline.mjs';

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
  { src: 'site.html',       out: 'camacho-site',       url: 'https://claude.ai/code/artifact/9e647b50-f137-4809-99bb-24a33fa5fb7f' },
  { src: 'deck.html',       out: 'camacho-deck',       url: 'https://claude.ai/code/artifact/45cd514d-11de-4b2b-b697-5b96a37c055d' },
  { src: 'proposta.html',   out: 'camacho-proposta',   url: 'https://claude.ai/code/artifact/db54627a-1bd4-4187-980e-1f5d7732ec38' },
  { src: 'assinatura.html', out: 'camacho-assinatura', url: 'https://claude.ai/code/artifact/53ba8c56-291d-4762-85c2-f84a59928bf9' },
  { src: 'carrossel.html',  out: 'camacho-carrossel',  url: 'https://claude.ai/code/artifact/2f6e7c1e-5e81-4fab-a4df-4c29fc946288' },
  { src: 'kv.html',         out: 'camacho-kv',         url: 'https://claude.ai/code/artifact/448e707f-5e22-4fcf-a574-aaacd463b0fa' },
  { src: 'aplicacoes.html', out: 'camacho-aplicacoes', url: 'https://claude.ai/code/artifact/40b9d44b-fb1e-4c86-b6ba-bde9c92e27a0' },
  { src: 'direcao.html',    out: 'camacho-direcao',    url: 'https://claude.ai/code/artifact/84f1b1bf-8106-47d9-b5be-91fbce49670f' },
  { src: 'bananamilk.html', out: 'camacho-bananamilk', url: 'https://claude.ai/code/artifact/55219b6b-71d5-4d69-9aad-a2d17a156e57' },
  { src: 'bananamilk-documento.html', out: 'camacho-bananamilk-doc', url: '' },
];

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

const M = modulos();

const favicon = Buffer.from(read('assets/favicon.svg')).toString('base64');

mkdirSync('dist', { recursive: true });

for (const page of PAGES) {
  let html = read(page.src);

  html = embutirCss(html);

  /* O módulo passa a ser inline: troca o import por um IIFE no mesmo escopo. */
  html = embutirModulos(html, M)
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

  /* As duas travas de autocontenção vivem em src/inline.mjs, para o exportador
     de cards do design system usar exatamente as mesmas. Links entre as
     próprias páginas do dist são destinos legítimos. */
  const { soltas, imports } = pendencias(html, new Set(PAGES.map((p) => `${p.out}.html`)));
  if (imports.length) {
    console.error(`${page.src}: import relativo sobreviveu ao embutimento:\n  ${imports.join('\n  ')}`);
    process.exit(1);
  }
  if (soltas.length) {
    console.error(`${page.src}: referências locais não embutidas:\n  ${soltas.join('\n  ')}`);
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
