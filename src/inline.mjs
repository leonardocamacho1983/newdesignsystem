/* ==========================================================================
   Camacho — Embutimento
   --------------------------------------------------------------------------
   O que transforma um HTML com `<link>` e `import` num arquivo autocontido.

   Isto vivia inteiro dentro de build.mjs, como constante local. Enquanto
   houvesse um consumidor só, tudo bem; com dois (as páginas do guia e os
   cards do design system), copiar seria a divergência que este repositório
   passa o tempo todo evitando — e ela seria silenciosa, porque um módulo
   embutido pela metade não emite erro nenhum.
   ========================================================================== */
import { readFileSync } from 'node:fs';

export const read = (p) => readFileSync(p, 'utf8');
export const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/* As folhas que as páginas linkam, na ordem em que são procuradas. */
export const CSS = ['tokens/tokens.css', 'src/camacho.css', 'src/guide.css', 'src/site.css'];

/**
 * Lê os módulos ES e devolve o texto pronto para virar código inline.
 *
 * O bootstrap automático do motor sai: na página embutida quem chama `init`
 * é o script da própria página. O corte ancora em `document.readyState`, que
 * só existe nesse bloco — a versão anterior ancorava em `if (typeof document`
 * e, quando o motor ganhou uma segunda guarda dessas no topo do arquivo, comeu
 * 90% do código sem reclamar.
 */
export function modulos() {
  const m = {
    dither: read('src/dither.js')
      .replace(/^export /gm, '')
      .replace(/\n?if \(typeof document !== 'undefined'\) \{\s*\n\s*document\.readyState[\s\S]*$/, '\n'),
    brand: read('src/brand.js').replace(/^export /gm, ''),
    kv: read('src/kv.js').replace(/^export /gm, ''),
    direcao: read('src/direcao.js').replace(/^export /gm, ''),
    apresentacao: read('src/apresentacao.js').replace(/^export /gm, ''),
    deck23: read('src/deck23.js').replace(/^export /gm, ''),
    diagramas: read('src/diagramas.js').replace(/^export /gm, ''),
  };

  /* Trava: um módulo embutido pela metade não emite erro nenhum — a página sai,
     o guard de referência local passa, e só um olho no resultado perceberia que
     o motor sumiu. Conferir que o que sobreviveu ao corte ainda declara o que
     promete é o que transforma isso em falha de build. */
  const INTEIRO = [
    ['src/dither.js', m.dither, ['const fields', 'function render', 'function resolve', 'function init']],
    ['src/brand.js', m.brand, ['const BRAND', 'function applyBrand']],
    ['src/kv.js', m.kv, ['const FORMATOS', 'const KVS', 'function ajustar']],
    ['src/direcao.js', m.direcao, ['const REGISTROS', 'function ajustarRegistro']],
    ['src/apresentacao.js', m.apresentacao, ['const PARADAS', 'const SECOES', 'function arteNoBeat']],
    ['src/deck23.js', m.deck23, ['const ATOS', 'const CENAS', 'const PERSONAGEM_EM']],
    ['src/diagramas.js', m.diagramas, ['function noBeat', 'function exclusao', 'function escada',
                                       'function nucleo', 'function quadrante', 'function comparacao']],
  ];
  for (const [nome, texto, marcas] of INTEIRO) {
    const faltando = marcas.filter((x) => !texto.includes(x));
    if (faltando.length) {
      throw new Error(`${nome}: o módulo embutido perdeu ${faltando.join(', ')} — o corte comeu código.`);
    }
  }
  return m;
}

/** Troca cada `<link rel="stylesheet">` conhecido pelo `<style>` correspondente. */
export function embutirCss(html) {
  for (const file of CSS) {
    html = html.replace(`<link rel="stylesheet" href="${file}">`, () => `<style>\n${read(file)}\n</style>`);
  }
  return html;
}

/** Troca cada `import … from './src/x.js'` pelo próprio código, no mesmo escopo. */
export function embutirModulos(html, m = modulos()) {
  return html
    .replace(/import \{[^}]+\} from '\.\/src\/dither\.js';\n?/, m.dither)
    .replace(/import \{[^}]+\} from '\.\/src\/brand\.js';\n?/, m.brand)
    .replace(/import \{[^}]+\} from '\.\/src\/kv\.js';\n?/, m.kv)
    .replace(/import \{[^}]+\} from '\.\/src\/direcao\.js';\n?/, m.direcao)
    .replace(/import \{[^}]+\} from '\.\/src\/apresentacao\.js';\n?/, m.apresentacao)
    /* deck23 antes de diagramas: o import de diagramas pode ocupar duas linhas
       e a regex de cada um só casa o seu próprio caminho, então a ordem aqui é
       só legibilidade — o que NÃO pode faltar é a entrada, nos três pontos. */
    .replace(/import \{[^}]+\} from '\.\/src\/deck23\.js';\n?/, m.deck23)
    .replace(/import \{[\s\S]*?\}\s*\n?\s*from '\.\/src\/diagramas\.js';\n?/, m.diagramas);
}

/**
 * As duas travas de autocontenção. Devolve a lista de problemas; quem chama
 * decide se avisa ou derruba.
 *
 * `permitido` são os destinos legítimos (links entre páginas do próprio dist).
 */
export function pendencias(html, permitido = new Set()) {
  /* Qualquer referência local sobrevivente quebraria a página autocontida (e um
     artifact publicado, onde o host bloqueia origens externas). */
  const soltas = [...html.matchAll(/(?:href|src)="((?!https?:|data:|mailto:|tel:|#)[^"]+)"/g)]
    .map((x) => x[1])
    .filter((ref) => !permitido.has(ref.split('?')[0]));

  /* Um `import … from './src/x.js'` não tem href nem src, então passa reto pelo
     guard acima e só quebra em runtime. Exige `./src/` e ponto-e-vírgula: é a
     forma de um import de verdade, e não casa com exemplos que vivem em
     comentário. */
  const imports = [...html.matchAll(/^\s*import\s+\{[^}]*\}\s+from\s+'(\.\/src\/[^']+)';/gm)].map((x) => x[1]);

  return { soltas, imports };
}
