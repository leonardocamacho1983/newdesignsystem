/* Gera as versões autocontidas (dist/) das páginas do guia: um arquivo só,
   sem nenhuma referência local, pronto para mandar por e-mail ou publicar. */
import { writeFileSync, mkdirSync } from 'node:fs';
import { Script } from 'node:vm';
import { buildTokens } from './tokens/build-tokens.mjs';
import { read, escapeRe, modulos, embutirCss, embutirModulos, pendencias, chegaram } from './src/inline.mjs';

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
  { src: 'bananamilk-documento.html', out: 'camacho-bananamilk-doc', url: 'https://claude.ai/code/artifact/af0c7887-e9d6-4d96-a324-f236e3379d43' },
  { src: 'foto-lab.html',   out: 'camacho-foto-lab',   url: 'https://claude.ai/code/artifact/ff539933-31cf-4694-8aca-44680536558e' },
  { src: 'direcao-bananamilk.html', out: 'camacho-direcao-bm', url: 'https://claude.ai/code/artifact/55c53b64-5b8a-47ba-8b29-7e1861a023bd' },
  /* Bancada, não entrega: sai do repositório quando as 23 cenas estiverem de
     pé. Entra em PAGES mesmo assim, porque é aqui que os dois guards de
     autocontenção examinam src/diagramas.js e src/deck23.js pela primeira vez. */
  { src: 'diagramas-lab.html', out: 'camacho-diagramas-lab', url: 'https://claude.ai/code/artifact/6a594b93-d030-4cc8-93a8-5b568038cdd6' },
  { src: 'assessment.html', out: 'camacho-assessment', url: 'https://claude.ai/code/artifact/1fc3a780-4202-4ef0-b316-24aa3a105414' },
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
  /* Quinta trava, e a mais barata de todas: o pacote embutido COMPILA?

     Cada modulo vira ES module num escopo proprio na fonte, e cai no MESMO
     escopo quando e embutido. Dois `const esc` em arquivos diferentes viram
     `Identifier 'esc' has already been declared` — erro de SINTAXE, que mata o
     script inteiro antes da primeira linha rodar. A pagina sai, os guards de
     autocontencao passam, todos os marcadores estao presentes, e a peca nao
     desenha nada.

     Foi assim que a apresentacao foi publicada morta. Os arneses rodavam contra
     a FONTE, onde os escopos sao separados, e nao viam. Compilar o resultado
     custa milissegundos e cobre a classe inteira. */
  for (const m of html.matchAll(/<script(?: type="module")?>([\s\S]*?)<\/script>/g)) {
    if (!m[1].trim()) continue;
    /* Compila embrulhado numa função async: `new Script` compila como script
       CLÁSSICO, e `await` no topo — que studio.html usa e que é perfeitamente
       válido num módulo — viraria erro. O embrulho legaliza o await e não
       esconde nada do que importa: dois `const` com o mesmo nome continuam
       sendo colisão dentro do mesmo escopo de função. */
    try { new Script(`(async()=>{\n${m[1]}\n})()`); } catch (e) {
      console.error(`${page.src}: o script embutido nao compila — ${e.message}`);
      process.exit(1);
    }
  }

  /* Terceira trava: o modulo importado pela fonte chegou mesmo na pagina? As
     outras duas olham o que SOBROU (import relativo, referencia local). Esta
     olha o que FALTOU, que e o modo de falha silencioso — pagina construida,
     build 0, e o modulo simplesmente ausente. */
  const faltas = chegaram(read(page.src), html);
  if (faltas.length) {
    console.error(`${page.src}: modulo importado nao chegou na pagina construida:\n  ${faltas.join('\n  ')}`);
    process.exit(1);
  }

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
  /* O corte por REGEX, e não por `indexOf('<body>')`.

     `indexOf` casava a string literal e devolvia −1 nas cinco páginas cujo body
     tem atributo — assessment, bananamilk, deck, proposta, bananamilk-documento.
     E `−1 + 6 = 5` fazia o corte começar no byte 5 do arquivo: o fragmento saía
     com o `<head>` inteiro DUAS vezes e a emenda literal `type html>`, que é o
     byte 5 de `<!doctype html>`, aparecendo escrita na tela. Uns 67 KB de lixo
     em cada um, e nada no build reclamava.

     O defeito estava aqui desde que a variante fragmento nasceu, quando todas
     as páginas ainda tinham `<body>` sem atributo — cresceu junto com o
     repositório sem nunca ser exercitado. */
  const mHead = fragment.match(/<head[^>]*>/);
  const mBody = fragment.match(/<body([^>]*)>/);
  if (!mHead || !mBody) {
    console.error(`${page.src}: não achei <head> ou <body> para recortar o fragmento.`);
    process.exit(1);
  }
  const head = fragment.slice(mHead.index + mHead[0].length, fragment.indexOf('</head>'));
  const body = fragment.slice(mBody.index + mBody[0].length, fragment.lastIndexOf('</body>'));

  /* As classes do <body> não podem depender de o host preservá-las. O parser só
     funde atributo quando o body do host ainda não tem aquela propriedade, e a
     única regra que depende de `.dk` é a que pinta a peça inteira de preto:
     falhar ali é a apresentação toda em preto sobre claro. Então o fragmento
     leva as classes consigo e as aplica ele mesmo. */
  const classes = (mBody[1].match(/class="([^"]*)"/) || [, ''])[1].trim();
  /* O `style` do body viaja pelo mesmo motivo que a classe: proposta.html e
     bananamilk-documento.html declaram o fundo do papel ali, e sem ele o
     documento sai sobre o fundo que o host tiver. */
  const estilo = (mBody[1].match(/style="([^"]*)"/) || [, ''])[1].trim();
  const cmds = [];
  if (classes) cmds.push(`document.body.classList.add(${classes.split(/\s+/).map((c) => JSON.stringify(c)).join(', ')});`);
  if (estilo) cmds.push(`document.body.style.cssText += ${JSON.stringify(';' + estilo)};`);
  const aplicaClasse = cmds.length ? `<script>${cmds.join(' ')}</script>\n` : '';

  const frag = head.trim() + '\n' + aplicaClasse + body.trim() + '\n';

  /* Quarta trava. As outras três olham o que sobrou ou o que faltou; esta olha
     a FORMA do recorte, e cada item é o sintoma exato do bug que ela previne. */
  const doente = [];
  /* Compara com `fragment` e não com `html`: os links do fragmento já foram
     reescritos para URLs de artifact, que são mais longas que `x.html`. Medir
     contra a página antes dessa troca acusava crescimento em página sã. */
  if (frag.length >= fragment.length) doente.push(`fragmento maior que a página inteira (${frag.length} ≥ ${fragment.length}) — o corte pegou o arquivo em vez do miolo`);
  if ((frag.match(/<title>/g) || []).length > 1) doente.push('dois <title> — o cabeçalho entrou duas vezes');
  if (frag.includes('type html>')) doente.push('emenda `type html>` — o corte começou no meio do doctype');
  /* `(\s[^>]*)?` e não `[^>]*`: sem exigir o espaço, `head` casava o começo de
     `<header class="hero">` e a trava reprovava a página inicial, que estava sã. */
  if (/<\/?(html|head|body)(\s[^>]*)?>/i.test(frag)) doente.push('sobrou <html>, <head> ou <body> no fragmento');
  if (doente.length) {
    console.error(`${page.src}: fragmento malformado:\n  ${doente.join('\n  ')}`);
    process.exit(1);
  }

  writeFileSync(`dist/${page.out}-artifact.html`, frag);

  console.log(`dist/${page.out}.html · ${(html.length / 1024).toFixed(0)} KB`);
}
