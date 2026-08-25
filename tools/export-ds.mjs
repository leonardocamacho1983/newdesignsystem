/* ==========================================================================
   Camacho — Exporta o sistema como projeto de design system

   Gera `ds/`: um HTML de preview por card, autocontido, com o marcador
   `@dsCard` na primeira linha — que é como o painel do Claude Design monta o
   índice. De lá o pacote sobe com create_project + finalize_plan + write_files.

   Os cards saem dos MESMOS dados que alimentam as páginas do guia
   (src/direcao.js, src/kv.js, os campos de src/dither.js, os tokens do CSS).
   Nada de composição escrita à mão aqui: dois códigos para a mesma peça
   divergiriam no primeiro ajuste, e é o erro que este repositório já cometeu.

   INCERTEZA CONHECIDA: a documentação da ferramenta mostra o marcador só com
   `group`, mas o registro legado (`register_assets`) recebe name, subtitle,
   viewport {width,height} e group. Emitimos os cinco, achatando o viewport em
   width/height. Se o painel ler só `group`, o resto vem por `register_assets`,
   que continua existindo justamente para projetos sem marcador completo.

   As alturas declaradas saem de MEDIÇÃO, não de estimativa — `_alturas.mjs`
   abre cada card e mede `main.ds`. Chute aqui vira área morta ou corte na
   miniatura do painel.

   Uso:  node tools/export-ds.mjs [destino]
   ========================================================================== */
import { mkdirSync, writeFileSync, readdirSync, rmSync, existsSync, statSync } from 'node:fs';
import { dirname } from 'node:path';
import { read, modulos, pendencias } from '../src/inline.mjs';
import { fields } from '../src/dither.js';
import { FORMATOS, CAMPOS, KVS, ajustar, configDoKV } from '../src/kv.js';
import { REGISTROS, GRADE, VOZES, FIGURAS, ajustarRegistro, configDoRegistro } from '../src/direcao.js';
import { BRAND } from '../src/brand.js';

/* Dois modos. AUTOCONTIDO (padrão) é o pacote que o /design-sync lê do
   GitHub: cada card carrega tudo. VINCULADO extrai o motor e o CSS para dois
   arquivos na raiz do projeto e deixa os cards finos — é o modo do envio por
   MCP, onde o conteúdo passa pelo contexto do agente e 1,97 MB não cabe.
   `render_preview` confirma que subrecurso relativo resolve. */
const VINCULADO = process.argv.includes('--vinculado');
const DESTINO = process.argv.find((a, i) => i >= 2 && !a.startsWith('--')) || (VINCULADO ? 'ds-link' : 'ds');
const M = modulos();

/* Só o que o card usa. Um card de cor não precisa carregar 43 KB de motor
   gráfico, e o teto por arquivo do Claude Design é 256 KiB. */
const TOKENS = read('tokens/tokens.css');
const COMPONENTES = read('src/camacho.css');
const PECAS = read('src/site.css');

const FONTES = 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500'
  + '&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400'
  + '&family=IBM+Plex+Mono:wght@400;500&display=swap';

const MARCA_SVG = `<svg class="cmc-lockup__mark" viewBox="0 0 64 64" aria-hidden="true">
  <path fill="currentColor" fill-rule="evenodd" d="M32 12a20 20 0 1 0 0 40 20 20 0 0 0 19.6-16H41.2A10.5 10.5 0 1 1 41.2 28h10.4A20 20 0 0 0 32 12Z"/></svg>`;
const lockup = (cls = '') => `<span class="cmc-lockup ${cls}">${MARCA_SVG}<span class="cmc-lockup__word">${BRAND.name}</span></span>`;

/* Folha própria dos cards: só o andaime da moldura, nada que seja do sistema.
   guide.css é documentação e não vai junto — misturar andaime com sistema é
   exatamente o que a separação em src/guide.css existe para impedir. */
const FOLHA = `
  body { background: var(--cmc-bg); color: var(--cmc-text); padding: 40px; }
  .ds { display: flex; flex-direction: column; gap: 32px; max-width: 1160px; margin-inline: auto; }
  .ds__cab { display: flex; flex-direction: column; gap: 6px; border-bottom: var(--cmc-border); padding-bottom: 16px; }
  .ds__nota { margin: 0; max-width: 70ch; color: var(--cmc-text-muted); font-size: var(--cmc-fs-small); line-height: 1.5; }
  .ds__grade { display: grid; gap: 28px; grid-template-columns: repeat(auto-fit, minmax(min(230px, 100%), 1fr)); align-items: start; }
  .ds__item { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
  .ds__rot { font-family: var(--cmc-font-mono); font-size: var(--cmc-fs-micro); color: var(--cmc-text-muted); }
  .ds__quadro { position: relative; aspect-ratio: var(--ar, 16/9); overflow: hidden;
                background: var(--bg, var(--cmc-black)); color: var(--ink, var(--cmc-white)); }
  .ds__quadro canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
  .ds__fila { display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-start; }
  .ds__fila .ds__item { flex: none; width: min-content; }
  .ds__fila .cmc-kv, .ds__fila .ds__quadro { height: var(--alt, 150px); width: auto; }
  .ds__linha { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
  .ds__tabela { width: 100%; border-collapse: collapse; font-size: var(--cmc-fs-small); }
  .ds__tabela th { text-align: left; font-weight: var(--cmc-w-medium); padding: 8px 12px 8px 0; border-bottom: 1px solid var(--cmc-text); }
  .ds__tabela td { padding: 8px 12px 8px 0; border-bottom: var(--cmc-border); vertical-align: top; }
  .ds__tabela code { font-family: var(--cmc-font-mono); font-size: 0.92em; }
`;

/**
 * Monta um card. `precisa` decide o que é embutido — um card sem grafismo não
 * carrega o motor.
 */
function card({ grupo, nome, subtitulo, largura = 1200, altura = 760, corpo, precisa = [] }) {
  /* `dados` não entra: kv.js e direcao.js são consumidos na GERAÇÃO, em Node.
     O card recebe markup pronto com data-attributes — em runtime só o motor
     precisa existir. Estavam sendo embutidos sem serem usados. */
  const motor = precisa.includes('motor');
  const cabeca = VINCULADO
    ? `<link rel="stylesheet" href="../_base.css">`
    : `<style>\n${[TOKENS, COMPONENTES, FOLHA].join('\n')}\n</style>`;
  const js = !motor ? ''
    : VINCULADO ? `<script type="module" src="../_motor.js"></script>`
    : `<script type="module">\n${M.dither}\ninit();\n</script>`;

  return `<!-- @dsCard group="${grupo}" name="${nome}" subtitle="${subtitulo}" width="${largura}" height="${altura}" -->
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${nome} · ${BRAND.name}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONTES}" rel="stylesheet">
${cabeca}
</head>
<body>
<main class="ds">
  <header class="ds__cab">
    <h1 class="cmc-h2" style="margin:0">${nome}</h1>
    <p class="ds__nota">${subtitulo}</p>
  </header>
${corpo}
</main>
${js}
</body>
</html>
`;
}

/* Um canvas do motor, declarativo — mesma gramática das páginas. */
const arte = (cfg, extra = '') => {
  const d = [
    `data-cmc-dither="${cfg.shape}"`,
    `data-ramp="${(cfg.ramp || [0.03, 1]).join(',')}"`,
    `data-cell="${cfg.cell ?? 4}"`,
    `data-seed="${cfg.seed ?? 7}"`,
    cfg.angle ? `data-angle="${cfg.angle}"` : '',
    cfg.texture && cfg.texture !== 'grain' ? `data-texture="${cfg.texture}"` : '',
    cfg.mirror ? 'data-mirror="true"' : '',
    cfg.radial ? 'data-radial="true"' : '',
    cfg.clareira ? `data-clareira='${JSON.stringify(cfg.clareira)}'` : '',
    cfg.opts ? `data-opts='${JSON.stringify(cfg.opts)}'` : '',
  ].filter(Boolean).join(' ');
  return `<canvas ${d} ${extra} aria-hidden="true"></canvas>`;
};

const quadro = (cfg, rotulo, { ar = '16/9', bg, ink } = {}) => `
  <figure class="ds__item">
    <div class="ds__quadro" style="--ar:${ar}${bg ? `;--bg:${bg}` : ''}${ink ? `;--ink:${ink}` : ''}">${arte(cfg)}</div>
    <figcaption class="ds__rot">${rotulo}</figcaption>
  </figure>`;

const bloco = (titulo, dentro, classe = 'ds__grade') =>
  `  <section class="ds__item"><p class="ds__rot">${titulo}</p><div class="${classe}">${dentro}</div></section>`;

/* Peça completa a partir de um registro — a mesma composição do direcao.html,
   derivada dos mesmos dados. */
function peca(reg, formato, { alt = false } = {}) {
  const campo = CAMPOS[reg.campo];
  const a = ajustarRegistro(reg, formato);
  const cfg = configDoRegistro(a, campo);
  const voz = VOZES[reg.voz];
  const mod = a.layout === 'faixa' ? '' : ` cmc-kv--${a.layout}`;
  return `<div class="cmc-kv${mod}" style="--kv-ar:${formato.ar};--kv-bg:${campo.bg};--kv-ink:${campo.ink};--kv-base:${formato.base}cqi;--kv-voz:${voz.fonte};--kv-peso:${voz.peso};--kv-track:${voz.track}">
      <div class="cmc-kv__inner">
        ${lockup('cmc-kv__lockup')}
        <div class="cmc-kv__art">${arte(cfg)}</div>
        <div class="cmc-kv__copy">
          ${a.manchete ? `<h3 class="cmc-kv__hed">${a.manchete.replace(/\n/g, '<br>')}</h3>` : ''}
          <div class="cmc-kv__pe">
            ${a.apoio ? `<p class="cmc-kv__apoio">${a.apoio}</p>` : '<span></span>'}
            <span class="cmc-kv__url">${BRAND.domain}</span>
          </div>
        </div>
      </div>
    </div>`;
}

const fmt = (id) => FORMATOS.find((f) => f.id === id);
const CARDS = [];
const add = (caminho, conteudo) => CARDS.push([caminho, conteudo]);

/* ========================== FUNDAÇÃO ========================== */

const PALETA = [
  ['--cmc-black', '#000000', 'campo escuro, tinta sobre claro'],
  ['--cmc-ink', '#0A0A0A', 'texto corrido'],
  ['--cmc-steel', '#3F3F3F', 'superfície intermediária'],
  ['--cmc-grey-70', '#6E6E6E', 'texto secundário forte'],
  ['--cmc-grey-55', '#8C8C8C', 'rótulo, numeral de processo'],
  ['--cmc-grey-35', '#B5B5B5', 'numeral de apoio'],
  ['--cmc-grey-20', '#D6D6D6', 'régua, borda'],
  ['--cmc-canvas', '#E4E4E4', 'fundo de documentação'],
  ['--cmc-paper', '#F2F0EE', 'campo papel'],
  ['--cmc-white', '#FFFFFF', 'campo branco, partícula sobre escuro'],
];

add('fundacao/cor.html', card({
  grupo: 'Fundação', nome: 'Cor',
  subtitulo: 'Monocromática por argumento, não por estética. Num sistema que comunica nível, o nível é densidade de partícula — uma cor de destaque criaria um segundo sistema concorrendo com o motor gráfico.',
  corpo: `  <div class="ds__grade">
${PALETA.map(([t, hex, uso]) => `    <div class="cmc-swatch"><span class="cmc-swatch__chip" style="--chip:${hex}"></span>
      <span class="ds__rot">${t}</span><span class="cmc-small" style="color:var(--cmc-text-muted)">${hex} · ${uso}</span></div>`).join('\n')}
  </div>`,
}));

add('fundacao/niveis.html', card({
  grupo: 'Fundação', nome: 'Níveis de maturidade',
  subtitulo: 'Cinco níveis, e cada barra é literalmente a densidade do nível desenhada pelo mesmo motor de todo o resto. Nível é densidade, nunca matiz.',
  precisa: ['motor'], altura: 520,
  corpo: `  <div class="ds__item" style="gap:14px">
${[1, 2, 3, 4, 5].map((n) => {
  const d = [0, 0.10, 0.30, 0.52, 0.76, 1.00][n];
  return `    <div style="display:grid;grid-template-columns:minmax(9rem,1fr) minmax(0,3fr) auto;gap:16px;align-items:center">
      <span class="cmc-small">--cmc-level-${n}</span>
      <div class="ds__quadro" style="--ar:auto;height:2.25rem;border-radius:3px">${arte({ shape: 'fill', ramp: [d, d], cell: 3, seed: 11 + n * 7 })}</div>
      <span class="ds__rot">${d.toFixed(2)}</span>
    </div>`;
}).join('\n')}
  </div>`,
}));

const VOZ_AMOSTRA = [
  ['Sistema', 'var(--cmc-font)', 300, '-0.035em', 'Clareza é vantagem', 'Título, interface, rótulo, marca. É a voz que amarra as outras duas.'],
  ['Editorial', 'var(--cmc-font-serif)', 400, '-0.005em', 'Ação, coração, país', 'Diagnóstico, artigo, material de formação — o lado humano.'],
  ['Medição', 'var(--cmc-font-mono)', 400, '-0.02em', '0123456789 · 3/5', 'Indicador, nível, rótulo de dado — o lado técnico.'],
];

add('fundacao/tipografia.html', card({
  grupo: 'Fundação', nome: 'Três vozes',
  subtitulo: 'Uma família por trabalho, e a regra que impede virar mingau: elas se sucedem dentro de um bloco, mas nunca disputam o mesmo papel. Rótulo e número não vão em serifada; texto longo não vai em mono.',
  corpo: `  <div class="ds__item" style="gap:28px">
${VOZ_AMOSTRA.map(([nome, fonte, peso, track, amostra, papel]) => `    <div class="ds__item">
      <span class="ds__rot">${nome} · ${peso} · ${track}</span>
      <p style="margin:0;font-family:${fonte};font-weight:${peso};letter-spacing:${track};font-size:clamp(2rem,4vw,3.25rem);line-height:1.05">${amostra}</p>
      <p class="ds__nota">${papel}</p>
    </div>`).join('\n')}
  </div>`,
}));

const ESCALA = [
  ['cmc-display', 'Clareza é vantagem'], ['cmc-title', 'Clareza é vantagem'],
  ['cmc-h1', 'Clareza é vantagem'], ['cmc-h2', 'Clareza é vantagem'],
  ['cmc-lead', 'Clareza é vantagem'], ['cmc-body', 'Clareza é vantagem'],
  ['cmc-small', 'Clareza é vantagem'], ['cmc-micro', 'Clareza é vantagem'],
];

add('fundacao/escala.html', card({
  grupo: 'Fundação', nome: 'Escala tipográfica',
  subtitulo: 'Oito degraus. Os cinco maiores são fluidos entre 400 e 1600 px de viewport — peças em container query não os usam, derivam a própria medida.',
  corpo: `  <div class="ds__item" style="gap:18px">
${ESCALA.map(([c, t]) => `    <div class="ds__item" style="gap:2px"><span class="ds__rot">.${c}</span><p class="${c}" style="margin:0">${t}</p></div>`).join('\n')}
  </div>`,
}));

add('fundacao/espaco.html', card({
  grupo: 'Fundação', nome: 'Espaço e medida',
  subtitulo: 'Escala base 4, da menor régua ao respiro entre seções. `--cmc-measure` (62ch) é o teto de leitura; `--cmc-control-h` é o que faz botão e tag alinharem lado a lado.',
  altura: 560,
  corpo: `  <div class="ds__item" style="gap:10px">
${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
  const rem = [0, 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8][n];
  return `    <div class="ds__linha"><span class="ds__rot" style="width:8rem">--cmc-sp-${n}</span>
      <span style="display:block;height:12px;width:${rem}rem;background:var(--cmc-text)"></span>
      <span class="ds__rot">${rem}rem</span></div>`;
}).join('\n')}
  </div>`,
}));

/* ============================ MARCA ============================ */

add('marca/lockup.html', card({
  grupo: 'Marca', nome: 'Lockup',
  subtitulo: 'O símbolo com o nome. Herda `currentColor` — nunca fixa preto, senão desaparece em campo escuro. O tamanho sai de `--lockup-size`.',
  altura: 520,
  corpo: `  <div class="ds__grade">
    <div class="ds__item"><span class="ds__rot">padrão</span>${lockup()}</div>
    <div class="ds__item"><span class="ds__rot">--sm</span>${lockup('cmc-lockup--sm')}</div>
    <div class="ds__item"><span class="ds__rot">--lg</span>${lockup('cmc-lockup--lg')}</div>
    <div class="ds__item" style="background:var(--cmc-black);color:var(--cmc-white);padding:20px">
      <span class="ds__rot" style="color:var(--cmc-grey-55)">campo escuro</span>${lockup()}</div>
  </div>`,
}));

add('marca/marca-medida.html', card({
  grupo: 'Marca', nome: 'Marca-medida',
  subtitulo: 'A abertura do C representa a lacuna entre a complexidade enfrentada e a capacidade instalada. Repetida em N aberturas, a mesma letra JÁ é uma escala — para uma prática cuja porta de entrada é diagnóstico, o símbolo virar instrumento é o oposto de ornamento.',
  precisa: ['motor'], altura: 640,
  corpo: `${bloco('a escala completa', quadro({ shape: 'gauge', ramp: [0.12, 1], cell: 4, seed: 23, texture: 'halftone' }, 'gauge · meio-tom sobre papel', { ar: '21/9', bg: '#F2F0EE', ink: '#000' }), 'ds__item')}
${bloco('a abertura, isolada', [0.6, 0.45, 0.3, 0.15, 0.02].map((ap, i) =>
    quadro({ shape: 'mark', ramp: [0.5, 1], cell: 4, seed: 7, texture: 'halftone', opts: { aperture: ap, r: 0.7, w: 0.3 } },
      `abertura ${ap.toFixed(2)}`, { ar: '1/1', bg: '#F2F0EE', ink: '#000' })).join('\n'))}`,
}));

/* ========================= MOTOR GRÁFICO ========================= */

const FORMAS = Object.keys(fields);
/* `foto` fica fora da grade: é o único campo que depende de uma imagem
   externa, então sem fonte registrada ele desenha um quadrado vazio — o que
   num card de vocabulário lê como defeito, e não é. Ele entra abaixo, com a
   condição declarada. */
const ANALITICAS = FORMAS.filter((f) => f !== 'foto');
add('motor/vocabulario.html', card({
  grupo: 'Motor gráfico', nome: 'Vocabulário de formas',
  subtitulo: `As ${FORMAS.length} formas do motor. Cada grafismo é a mesma operação: uma forma amostrada por uma grade de partículas quadradas, cuja probabilidade de existir varia ao longo de uma rampa de densidade. Nenhuma é ornamento — cada uma carrega uma ideia do negócio.`,
  precisa: ['motor'], altura: 1400,
  corpo: `  <div class="ds__grade">
${ANALITICAS.map((f, i) => quadro({ shape: f, ramp: [0.06, 1], cell: 3, seed: 7 + i * 5 }, f)).join('\n')}
  </div>
  <p class="ds__nota"><strong>foto</strong> é a ${FORMAS.length}ª e não aparece acima: é o único campo que não se resolve por conta própria — ele amostra a luminância de uma imagem já decodificada, então só existe quando há foto de verdade. Fotografia entra como prova, nunca como banco de imagem, e no instante em que o motor a amostra ela vira campo, e campo é monocromático.</p>`,
}));

add('motor/texturas.html', card({
  grupo: 'Motor gráfico', nome: 'Texturas',
  subtitulo: 'A mesma forma, três lógicas de marca. `grain` é limiar aleatório — textura de tela. `screen` é Bayer 8×8, trama de impressão. `halftone` varia o tamanho do ponto. Trocar a textura muda a temperatura da marca sem trocar uma forma.',
  precisa: ['motor'],
  corpo: `  <div class="ds__grade">
${[['grain', 'estocástica — o padrão'], ['screen', 'Bayer 8×8, sem jitter'], ['halftone', 'ponto de tamanho variável']]
    .map(([t, nota]) => quadro({ shape: 'weave', ramp: [0.1, 1], cell: 5, seed: 7, texture: t }, `${t} · ${nota}`)).join('\n')}
  </div>`,
}));

add('motor/rampas.html', card({
  grupo: 'Motor gráfico', nome: 'Rampas de densidade',
  subtitulo: 'A rampa é a tese: complexidade → clareza. O que se ganha na ponta densa não é dado limpo, é capacidade. `angle` gira o eixo, `mirror` adensa no centro, `radial` adensa no miolo, `curve` decide quanto tempo a dispersão sobrevive.',
  precisa: ['motor'], altura: 620,
  corpo: `  <div class="ds__grade">
${[
    [{ angle: 0 }, 'linear · 0° (ruído à esquerda)'],
    [{ angle: 180 }, 'linear · 180°'],
    [{ angle: 90 }, 'linear · 90° (de baixo)'],
    [{ mirror: true }, 'mirror · denso no centro'],
    [{ radial: true }, 'radial · denso no miolo'],
  ].map(([extra, nota], i) => quadro({ shape: 'fill', ramp: [0.03, 0.85], cell: 4, seed: 7 + i * 9, ...extra }, nota)).join('\n')}
  </div>`,
}));

add('motor/clareira.html', card({
  grupo: 'Motor gráfico', nome: 'Clareira',
  subtitulo: 'A regra da casa é que grafismo não cruza com tipografia. A clareira faz a densidade DESABAR onde o texto vai — não há partícula sob o tipo para cruzar. É o que torna possível o campo sangrado sem cortina de gradiente por cima, que é o remendo que já falhou uma vez aqui.',
  precisa: ['motor'],
  corpo: `  <div class="ds__grade">
    <figure class="ds__item"><div class="ds__quadro">${arte({ shape: 'fill', ramp: [0.05, 0.95], angle: 180, cell: 4, seed: 7 })}
      <div style="position:absolute;inset:0;display:grid;align-content:center;padding:7%;max-width:55%"><p style="margin:0;font-size:2.2vw;line-height:1.05;font-weight:300">Sem clareira: o tipo não sobrevive.</p></div></div>
      <figcaption class="ds__rot">controle</figcaption></figure>
    <figure class="ds__item"><div class="ds__quadro">${arte({ shape: 'fill', ramp: [0.05, 0.95], angle: 180, cell: 4, seed: 7, clareira: [{ x: -0.2, y: -0.3, w: 0.9, h: 1.35, soft: 0.14, piso: 0.02 }] })}
      <div style="position:absolute;inset:0;display:grid;align-content:center;padding:7%;max-width:55%"><p style="margin:0;font-size:2.2vw;line-height:1.05;font-weight:300">Com clareira: terreno limpo.</p></div></div>
      <figcaption class="ds__rot">clareira à esquerda · soft 0.14 · piso 0.02</figcaption></figure>
  </div>
  <p class="ds__nota"><strong>Medido:</strong> o modo de falha não é borda dura, é o contrário — <code>soft</code> alto demais deixa a partícula voltar para cima do tipo. E clareira que termina exatamente na borda da peça tem a transição mordendo para dentro, então ela precisa transbordar.</p>`,
}));

const PARAMS = [
  ['data-cmc-dither', 'forma', `uma das ${FORMAS.length}`],
  ['data-cell', 'aresta da célula em px lógicos', '4 padrão · 6–8 em peça grande · 12+ vira objeto'],
  ['data-ramp', 'densidade [ruído, sinal]', '0.03,1'],
  ['data-angle', 'eixo da rampa', '0 adensa à direita · 180 à esquerda · 90 embaixo'],
  ['data-curve', 'expoente da rampa', '>1 mantém a dispersão por mais tempo'],
  ['data-seed', 'hash determinístico por célula', 'o mesmo grafismo sempre'],
  ['data-jitter', 'deslocamento dentro da célula', '0.3'],
  ['data-mirror', 'rampa espelhada', 'denso no centro'],
  ['data-radial', 'rampa radial', 'denso no miolo, ignora angle'],
  ['data-texture', 'lógica da marca', 'grain · screen · halftone'],
  ['data-clareira', 'onde a densidade desaba', 'JSON, um retângulo ou uma lista'],
  ['data-tint', 'cor por célula a partir de uma fonte', 'existe para ser julgado, não usado'],
  ['data-opts', 'parâmetros do campo', 'JSON'],
];

add('motor/parametros.html', card({
  grupo: 'Motor gráfico', nome: 'Parâmetros',
  subtitulo: 'A superfície declarativa completa. Um canvas com estes atributos é tudo que uma peça precisa — o motor desenha ao entrar na tela e redesenha ao redimensionar.',
  altura: 640,
  corpo: `  <table class="ds__tabela"><thead><tr><th>atributo</th><th>o que é</th><th>valores</th></tr></thead><tbody>
${PARAMS.map(([a, b, c]) => `    <tr><td><code>${a}</code></td><td>${b}</td><td style="color:var(--cmc-text-muted)">${c}</td></tr>`).join('\n')}
  </tbody></table>
  <p class="ds__nota">Exemplo mínimo: <code>&lt;canvas data-cmc-dither="weave" data-ramp="0.04,1"&gt;&lt;/canvas&gt;</code></p>`,
}));

/* ========================== COMPONENTES ========================== */

add('componentes/controles.html', card({
  grupo: 'Componentes', nome: 'Botões e tags',
  subtitulo: 'Altura única (`--cmc-control-h`) para que botão e tag alinhem lado a lado. `--ghost` herda a cor do campo por `color-mix` em vez de fixar preto — é o que o faz sobreviver em campo escuro.',
  altura: 460,
  corpo: `  <div class="ds__item" style="gap:24px">
    <div class="ds__item"><span class="ds__rot">campo claro</span><div class="cmc-controls">
      <a class="cmc-btn" href="#">Converse comigo</a>
      <a class="cmc-btn cmc-btn--ghost" href="#">Conheça a atuação</a>
      <a class="cmc-tag" href="#"><span>Key visuals</span></a></div></div>
    <div class="ds__item" style="background:var(--cmc-black);color:var(--cmc-white);padding:24px">
      <span class="ds__rot" style="color:var(--cmc-grey-55)">campo escuro</span><div class="cmc-controls">
      <a class="cmc-btn cmc-btn--inverse" href="#">Converse comigo</a>
      <a class="cmc-btn cmc-btn--ghost" href="#">Conheça a atuação</a>
      <a class="cmc-tag" href="#"><span>Key visuals</span></a></div></div>
  </div>`,
}));

add('componentes/superficies.html', card({
  grupo: 'Componentes', nome: 'Superfícies',
  subtitulo: 'Cartão, palco de grafismo e o par do/não faça. O palco (`--stage-ar`) é o quadro genérico onde qualquer forma do motor entra.',
  precisa: ['motor'], altura: 620,
  corpo: `  <div class="ds__grade">
    <div class="cmc-card"><p class="cmc-lead" style="margin:0">Cartão</p><p class="cmc-small" style="margin:0">Superfície com raio e respiro do sistema.</p></div>
    <div class="cmc-card cmc-card--outline"><p class="cmc-lead" style="margin:0">Cartão --outline</p><p class="cmc-small" style="margin:0">Sem preenchimento, só a régua.</p></div>
    <div class="cmc-stage" style="--stage-ar:16/9">${arte({ shape: 'weave', ramp: [0.05, 1], cell: 4, seed: 7 })}</div>
    <div class="cmc-stage cmc-stage--light" style="--stage-ar:16/9">${arte({ shape: 'gauge', ramp: [0.12, 1], cell: 4, seed: 23 })}</div>
  </div>
  <div class="ds__grade">
    <div class="cmc-rule-card cmc-rule-card--do"><span class="cmc-rule-card__flag">Faça</span><p class="cmc-small" style="margin:0">Deixe o tipo sentar onde a densidade cai.</p></div>
    <div class="cmc-rule-card cmc-rule-card--dont"><span class="cmc-rule-card__flag">Não faça</span><p class="cmc-small" style="margin:0">Cortina de gradiente para salvar a manchete.</p></div>
  </div>`,
}));

/* ======================== DIREÇÃO DE ARTE ======================== */

/* Um card por registro. Dois cards de cinco davam quase 4.000 px de altura —
   e no painel do design system cada registro é um tratamento que se consulta
   sozinho, não um capítulo que se rola. */
for (const reg of REGISTROS) {
  const camada = reg.camada === 'composicao' ? 'Composição' : 'Material';
  add(`direcao/${reg.id}.html`, card({
    grupo: 'Direção de arte', nome: `${reg.nome} · ${camada}`,
    subtitulo: `${reg.regra} ${reg.quando}`,
    precisa: ['motor', 'dados'], altura: 640,
    corpo: `  <div class="ds__item">
    <span class="ds__rot">${reg.shape} · ${reg.texture || 'grain'} · campo ${reg.campo} · voz ${reg.voz} · cell ${reg.cell} · rampa ${reg.ramp.join('–')}</span>
    ${peca(reg, fmt('16x9'))}
  </div>`,
  }));
}

add('direcao/formatos.html', card({
  grupo: 'Direção de arte', nome: 'Formatos',
  subtitulo: `Os ${GRADE.length} formatos da matriz, a partir de uma definição só. Cada um tem UMA medida de tipo em cqi (\`base\`), da qual manchete, apoio, url, lockup, gap e padding derivam — é o que faz a mesma peça se recompor de 21:9 a A4 sem layout alternativo.`,
  precisa: ['motor', 'dados'], altura: 700,
  corpo: `  <div class="ds__fila" style="--alt:190px">
${GRADE.map((id) => {
    const f = fmt(id);
    return `    <figure class="ds__item">${peca(REGISTROS[0], f)}<figcaption class="ds__rot">${f.nome}<br>${f.ar.replace('/', ':')} · ${f.w}×${f.h} · base ${f.base}</figcaption></figure>`;
  }).join('\n')}
  </div>`,
}));

add('direcao/figuras.html', card({
  grupo: 'Direção de arte', nome: 'Figuras',
  subtitulo: 'Figura é recrutada pelo ASSUNTO, não pela marca. Peça institucional continua abstrata; figura entra quando a peça é sobre alguma coisa. Todas são 3–5 primitivas compostas, sem máscara e sem arquivo de origem — por isso parecem do sistema em vez de clip-art importado.',
  precisa: ['motor', 'dados'], altura: 620,
  corpo: `  <div class="ds__grade">
${FIGURAS.map((f, i) => quadro({ shape: f.shape, ramp: [0.06, 1], cell: 3, seed: 31 + i * 13 }, `${f.shape} · ${f.assunto}`)).join('\n')}
  </div>`,
}));

/* ============================ PEÇAS ============================ */

add('pecas/key-visuals.html', card({
  grupo: 'Peças', nome: 'Key visuals',
  subtitulo: 'Quatro KVs, uma ideia cada — porque um key visual que diz duas coisas não diz nenhuma. Sem fotografia: um KV se refaz de forma, rampa e semente em qualquer resolução, sem arquivo de origem.',
  precisa: ['motor', 'dados'], altura: 1100,
  corpo: `  <div class="ds__grade">
${KVS.map((kv) => {
    const campo = CAMPOS[kv.campo];
    const a = ajustar(kv, fmt('16x9'));
    return `    <figure class="ds__item">
      <div class="ds__quadro" style="--bg:${campo.bg};--ink:${campo.ink}">${arte(configDoKV(a, campo))}</div>
      <figcaption class="ds__rot">${kv.rotulo}</figcaption>
      <p class="ds__nota">${kv.ideia}</p></figure>`;
  }).join('\n')}
  </div>`,
}));

add('pecas/impressos.html', card({
  grupo: 'Peças', nome: 'Impressos',
  subtitulo: 'Capa de relatório A4 e cartão 85 × 55 mm. No cartão o `base` sai de conta, não de gosto: a 85 mm de largura, 10 é o menor valor que põe a linha mais fina em 6 pt, o piso prático de impressão — e a esse tamanho a tipografia come a peça, então o cartão não carrega linha de apoio.',
  precisa: ['motor', 'dados'], altura: 900,
  corpo: `  <div class="ds__fila" style="--alt:340px">
    <figure class="ds__item">${peca(REGISTROS.find((r) => r.id === 'instrumento'), fmt('a4'))}<figcaption class="ds__rot">Capa A4 · 2480×3508</figcaption></figure>
    <figure class="ds__item">${peca(REGISTROS.find((r) => r.id === 'instrumento'), fmt('cartao'))}<figcaption class="ds__rot">Cartão · 85 × 55 mm</figcaption></figure>
    <figure class="ds__item">${peca(REGISTROS.find((r) => r.id === 'impressao'), fmt('cartao'))}<figcaption class="ds__rot">Cartão · registro Impressão</figcaption></figure>
  </div>`,
}));

add('pecas/social.html', card({
  grupo: 'Peças', nome: 'Social',
  subtitulo: 'Post 1:1 e feed vertical 4:5, nos pixels que a plataforma usa. A mesma definição do slide e da capa — trocar a proporção é trocar um número.',
  precisa: ['motor', 'dados'], altura: 760,
  corpo: `  <div class="ds__fila" style="--alt:300px">
${['1x1', '4x5'].flatMap((id) => ['trama', 'figura'].map((rid) => {
    const f = fmt(id);
    return `    <figure class="ds__item">${peca(REGISTROS.find((r) => r.id === rid), f)}<figcaption class="ds__rot">${f.nome} · ${rid}</figcaption></figure>`;
  })).join('\n')}
  </div>`,
}));

/* Alturas MEDIDAS, não estimadas — `node _alturas.mjs` abre cada card e mede
   `main.ds`. O chute errou por mais de 2× nos dois sentidos: marca-medida
   tinha 640 declarado contra 1362 reais (a peça sairia cortada na miniatura),
   e key-visuals tinha 1100 contra 472 (metade do card era área morta).
   Card novo sem entrada aqui recebe aviso no build. */
const ALTURAS = {
  'componentes/controles.html': 432,
  'componentes/superficies.html': 441,
  'direcao/campo.html': 884,
  'direcao/corte.html': 884,
  'direcao/costura.html': 904,
  'direcao/escala.html': 884,
  'direcao/figura.html': 884,
  'direcao/figuras.html': 423,
  'direcao/formatos.html': 1092,
  'direcao/impressao.html': 904,
  'direcao/instrumento.html': 923,
  'direcao/interferencia.html': 904,
  'direcao/palavra.html': 865,
  'direcao/trama.html': 884,
  'fundacao/cor.html': 993,
  'fundacao/escala.html': 942,
  'fundacao/espaco.html': 458,
  'fundacao/niveis.html': 445,
  'fundacao/tipografia.html': 602,
  'marca/lockup.html': 307,
  'marca/marca-medida.html': 1362,
  'motor/clareira.html': 659,
  'motor/parametros.html': 762,
  'motor/rampas.html': 590,
  'motor/texturas.html': 441,
  'motor/vocabulario.html': 1617,
  'pecas/impressos.html': 1064,
  'pecas/key-visuals.html': 472,
  'pecas/social.html': 945,
};

/* ============================ ESCREVE ============================ */

if (existsSync(DESTINO)) rmSync(DESTINO, { recursive: true });
mkdirSync(DESTINO, { recursive: true });

/* No modo vinculado, os dois arquivos compartilhados vão para a raiz do
   projeto. O motor vai INTEIRO, com os exports e o bootstrap automático — é
   módulo de verdade aqui, não texto colado, então nada precisa ser recortado
   e a trava de integridade do embutimento não se aplica. */
const COMPARTILHADOS = ['_base.css', '_motor.js'];
if (VINCULADO) {
  writeFileSync(`${DESTINO}/_base.css`, [TOKENS, COMPONENTES, FOLHA].join('\n'));
  writeFileSync(`${DESTINO}/_motor.js`, read('src/dither.js'));
  for (const f of COMPARTILHADOS) console.log(`  ${f.padEnd(38)} ${(statSync(`${DESTINO}/${f}`).size / 1024).toFixed(0)} KB`);
}

const LIMITE = 256 * 1024;
let maior = 0, total = 0;

for (const [caminho, bruto] of CARDS) {
  const alvo = `${DESTINO}/${caminho}`;
  if (!ALTURAS[caminho]) console.warn(`aviso: ${caminho} sem altura medida — rode _alturas.mjs e atualize a tabela.`);
  /* O marcador é a primeira linha, então trocar a primeira ocorrência basta. */
  const html = ALTURAS[caminho] ? bruto.replace(/height="\d+"/, `height="${ALTURAS[caminho]}"`) : bruto;
  mkdirSync(dirname(alvo), { recursive: true });

  /* As mesmas travas do build: um card com referência local sobrevivente
     chegaria ao painel do Claude Design como caixa quebrada. */
  /* No modo vinculado as duas referências relativas são legítimas: os arquivos
     existem na raiz do projeto e o preview resolve subrecurso relativo. */
  const { soltas, imports } = pendencias(html, new Set(VINCULADO ? COMPARTILHADOS.map((f) => `../${f}`) : []));
  if (soltas.length || imports.length) {
    console.error(`${caminho}: referência não embutida:\n  ${[...soltas, ...imports].join('\n  ')}`);
    process.exit(1);
  }
  if (!html.startsWith('<!-- @dsCard ')) {
    console.error(`${caminho}: o marcador @dsCard precisa ser a primeira linha.`);
    process.exit(1);
  }

  writeFileSync(alvo, html);
  const tam = statSync(alvo).size;
  if (tam > LIMITE) {
    console.error(`${caminho}: ${(tam / 1024).toFixed(0)} KB passa do teto de 256 KiB por arquivo.`);
    process.exit(1);
  }
  maior = Math.max(maior, tam); total += tam;
  console.log(`  ${caminho.padEnd(38)} ${(tam / 1024).toFixed(0)} KB`);
}

const grupos = [...new Set(CARDS.map(([c]) => c.split('/')[0]))];
console.log(`\n${CARDS.length} cards em ${grupos.length} grupos · maior ${(maior / 1024).toFixed(0)} KB · total ${(total / 1024).toFixed(0)} KB`);
console.log(`destino: ${DESTINO}/`);
