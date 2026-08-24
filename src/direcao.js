/* ==========================================================================
   Camacho — Direção de arte
   --------------------------------------------------------------------------
   Um REGISTRO é uma regra sobre onde o tipo pode sentar em relação à
   densidade, qual das três vozes fala, e o que a peça pode conter. Não é um
   humor nem uma paleta: é uma regra verificável.

   Isto é DADO, pela mesma razão que os KVs são (src/kv.js): a matriz atravessa
   seis formatos, e um registro escrito à mão em cada célula divergiria no
   primeiro ajuste. Sem `import` aqui — o build embute este arquivo por
   substituição de texto na página, e um import relativo sobreviveria ao
   embutimento e daria 404 no dist.

   A regra da casa é que grafismo não cruza com tipografia. Três destes
   registros põem tipo sobre campo cheio, e eles só são possíveis porque a
   `clareira` do motor faz a densidade desabar onde o texto vai: não há
   partícula sob o tipo para cruzar. Cortina de gradiente por cima seria o
   remendo que já falhou uma vez neste repositório.
   ========================================================================== */

/** Os formatos que a matriz atravessa, na ordem em que o exercício pede. */
export const GRADE = ['16x9', 'a4', '21x9', 'cartao', '1x1', '4x5'];

/** As três vozes, como propriedades que a peça consome. */
export const VOZES = {
  sistema:   { fonte: 'var(--cmc-font)',       peso: 300, track: '-0.035em' },
  editorial: { fonte: 'var(--cmc-font-serif)', peso: 400, track: '-0.005em' },
  medida:    { fonte: 'var(--cmc-font-mono)',  peso: 400, track: '-0.02em'  },
};

/**
 * Os registros.
 *
 * `layout` decide a composição:
 *   faixa    três faixas — assinatura, grafismo, manchete. O padrão do sistema.
 *   sangria  o grafismo ocupa a peça inteira e o tipo senta na clareira.
 *   muda     a peça não tem manchete: o grafismo É a manchete.
 *
 * `formatos` é a lista onde o registro funciona. Quando ela não é a grade
 * inteira, `nota` diz por quê — um buraco medido é achado, não omissão.
 */
export const REGISTROS = [
  {
    id: 'corte',
    nome: 'Corte',
    regra: 'A textura ocupa um lado; o tipo senta em terreno limpo do outro.',
    quando: 'O padrão. É o que o hero do site e todo KV já fazem — entra aqui '
          + 'como controle contra o qual os outros cinco são julgados, não como novidade.',
    layout: 'faixa',
    voz: 'sistema',
    campo: 'escuro',
    shape: 'weave', ramp: [0.04, 1], angle: 0, cell: 4, seed: 7,
    manchete: 'Clareza\né vantagem.',
    apoio: 'Estratégia, IA e liderança para transformar e escalar empresas.',
    formatos: GRADE,
  },
  {
    id: 'campo',
    nome: 'Campo',
    regra: 'O grafismo sangra pela peça inteira; o tipo senta numa clareira de densidade.',
    quando: 'Quando a peça precisa de presença antes de precisar de argumento: '
          + 'capa, abertura de deck, banner. A clareira é o que permite isso sem cortina.',
    layout: 'sangria',
    voz: 'sistema',
    campo: 'escuro',
    shape: 'fill', ramp: [0.06, 0.92], angle: 180, cell: 4, seed: 23,
    clareira: { x: 0, y: 0.44, w: 1, h: 0.56, soft: 0.14 },
    manchete: 'Complexidade\nvira clareza.',
    apoio: 'Do diagnóstico à capacidade instalada.',
    formatos: GRADE,
  },
  {
    id: 'trama',
    nome: 'Trama',
    regra: 'O campo É o léxico: as palavras da marca são as partículas.',
    quando: 'Peça que fala do método ou do repertório. A rampa decide onde a '
          + 'palavra se lê e onde ela vira grão — a tese aplicada ao próprio vocabulário.',
    layout: 'sangria',
    voz: 'sistema',
    campo: 'escuro',
    shape: 'trama', ramp: [0.05, 1], angle: 0, cell: 3, seed: 11,
    opts: { corpo: 0.052 },
    clareira: { x: 0, y: 0.46, w: 1, h: 0.54, soft: 0.16 },
    manchete: 'Seis etapas.\nUma delas todo\nprojeto pula.',
    apoio: 'Diagnosticar · Priorizar · Estruturar · Implementar · Incorporar · Medir',
    formatos: GRADE,
  },
  {
    id: 'figura',
    nome: 'Figura',
    regra: 'Uma figura que só existe onde o campo resolve.',
    quando: 'Peça que é SOBRE alguma coisa — um tema editorial, um cliente. '
          + 'Peça institucional continua abstrata: figura sem assunto é ornamento.',
    layout: 'sangria',
    voz: 'editorial',
    campo: 'escuro',
    shape: 'cidade', ramp: [0.06, 1], angle: 0, cell: 4, seed: 31,
    clareira: { x: 0, y: 0.5, w: 1, h: 0.5, soft: 0.16 },
    manchete: 'A cidade\ncomo sistema\nde decisão.',
    apoio: 'Cidadania digital e a dinâmica dos centros urbanos.',
    formatos: GRADE,
  },
  {
    id: 'palavra',
    nome: 'Palavra',
    regra: 'O tipo é a imagem, denso o bastante para ler perfeitamente.',
    quando: 'Quando a frase já é a peça e qualquer grafismo ao lado dela competiria. '
          + 'Não leva manchete: haveria duas.',
    layout: 'muda',
    voz: 'sistema',
    campo: 'escuro',
    shape: 'text', ramp: [0.14, 1], angle: 0, cell: 3, seed: 17,
    opts: { text: 'Clareza\né vantagem', fit: 0.96 },
    manchete: null,
    apoio: 'camacho.ai',
    formatos: GRADE,
  },
];

/** Ajusta um registro ao formato. Mesma função que `ajustar` faz para os KVs. */
export function ajustarRegistro(reg, formato) {
  const vertical = formato.id === '9x16' || formato.id === '4x5' || formato.id === 'a4';
  const alto = vertical || formato.id === '1x1';
  return {
    ...reg,
    /* Rampa no eixo longo em peça vertical — menos no tipo dissolvido, onde
       girar a rampa leria como degradê sobre as letras. */
    angle: vertical && reg.shape !== 'text' && reg.shape !== 'trama' ? 90 : reg.angle,
    /* A clareira mora na parte de baixo, que é onde a cópia senta. Em peça
       alta ela precisa de menos altura relativa: o mesmo texto ocupa uma
       fração menor da peça. */
    clareira: reg.clareira && alto
      ? { ...reg.clareira, y: reg.clareira.y + 0.12, h: reg.clareira.h - 0.12 }
      : reg.clareira,
    /* O cartão não carrega linha de apoio — a mesma conta de legibilidade que
       vale para os KVs (6 pt é o piso a 85 mm de largura). */
    apoio: formato.id === 'cartao' ? null : reg.apoio,
  };
}

/** Config do motor a partir de um registro já ajustado. */
export function configDoRegistro(reg, campo) {
  return {
    shape: reg.shape,
    opts: reg.opts || null,
    ramp: reg.ramp,
    angle: reg.angle,
    cell: reg.cell,
    seed: reg.seed,
    clareira: reg.clareira || null,
    texture: reg.texture || 'grain',
    color: campo.ink,
  };
}

/**
 * A célula é medida em px lógicos, então a mesma peça numa miniatura de 280 px
 * e num export de 2560 px teria pesos de grão completamente diferentes.
 * Escalar pela largura mantém o grão com o MESMO peso visual — e é na
 * miniatura, não no export, que a direção de arte é julgada.
 */
export function celulaPara(cell, largura, projeto = 1280) {
  return Math.min(24, Math.max(2, Math.round(cell * (largura / projeto))));
}
