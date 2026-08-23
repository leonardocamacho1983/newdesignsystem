/* Gera tokens/tokens.json a partir de tokens/tokens.css e verifica que todo
   token referenciado existe declarado.

   O JSON era gerado por um comando avulso, livre para divergir do CSS e
   carregando o nome da marca escrito à mão. Aqui ele é derivado a cada build,
   então divergência vira impossível: se o CSS mudou e o JSON não, o git status
   mostra na hora.

   A checagem de fechamento existe porque um token órfão não emite erro — o
   navegador aplica valor vazio e o layout desaba em silêncio. É o modo de
   falha mais caro deste projeto, e o único jeito de pegá-lo é este. */
import { readFileSync, writeFileSync } from 'node:fs';
import { BRAND } from '../src/brand.js';

const read = (p) => readFileSync(p, 'utf8');

/** Extrai `--cmc-nome: valor` de um trecho de CSS. */
function declaracoes(css) {
  const out = {};
  for (const m of css.matchAll(/--cmc-([a-z0-9-]+)\s*:\s*([^;]+);/g)) out[m[1]] = m[2].trim();
  return out;
}

export function buildTokens({
  cssPath = 'tokens/tokens.css',
  jsonPath = 'tokens/tokens.json',
  /* Quem consome tokens: as camadas de CSS mais todas as páginas. A lista de
     páginas vem de quem chama — repeti-la aqui era mais um lugar para esquecer
     de atualizar, que é justamente o acoplamento que a tabela do build tirou. */
  paginas = [],
} = {}) {
  const consumidores = ['src/camacho.css', 'src/guide.css', ...paginas];
  const css = read(cssPath);

  /* O bloco :root traz os tokens do tema claro; o bloco de inversão só
     redefine papéis, e entra separado para não sobrescrever os primitivos —
     o gerador antigo achatava os dois e gravava semânticos como "var(...)". */
  const corte = css.indexOf('/* Campo escuro');
  const root = css.slice(css.indexOf(':root {'), corte === -1 ? undefined : corte);
  const dark = corte === -1 ? '' : css.slice(corte);

  const token = declaracoes(root);
  const inverso = declaracoes(dark);

  /* Fechamento: todo var(--cmc-*) usado tem que existir declarado. */
  const declarados = new Set([...Object.keys(token), ...Object.keys(inverso)]);
  const orfaos = new Map();
  for (const arquivo of consumidores) {
    for (const m of read(arquivo).matchAll(/var\(\s*--cmc-([a-z0-9-]+)/g)) {
      if (!declarados.has(m[1])) {
        if (!orfaos.has(m[1])) orfaos.set(m[1], new Set());
        orfaos.get(m[1]).add(arquivo);
      }
    }
  }
  if (orfaos.size) {
    console.error('tokens: referenciados mas não declarados —');
    for (const [nome, arquivos] of orfaos) console.error(`  --cmc-${nome}  (${[...arquivos].join(', ')})`);
    process.exit(1);
  }

  writeFileSync(jsonPath, `${JSON.stringify({
    name: `${BRAND.name} Design Tokens`,
    version: BRAND.version,
    token,
    inverso,
  }, null, 2)}\n`);

  return { declarados: declarados.size, token: Object.keys(token).length, inverso: Object.keys(inverso).length };
}
