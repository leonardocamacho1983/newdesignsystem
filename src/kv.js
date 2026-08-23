/* ==========================================================================
   Camacho — Key Visuals
   --------------------------------------------------------------------------
   Os KVs são DADO, não markup: esta lista alimenta a página do guia e o
   exportador de PNG/vídeo. Um KV escrito à mão nos dois lugares divergiria no
   primeiro ajuste.

   Cada KV é uma ideia da marca desenhada pelo motor. Nenhuma imagem externa:
   o sistema inteiro é gerado, e material emprestado seria a única coisa na
   marca que ninguém consegue reproduzir a partir do código.
   ========================================================================== */

/** Campos disponíveis, com o par fundo/tinta. */
export const CAMPOS = {
  escuro: { bg: '#000000', ink: '#FFFFFF', classe: '' },
  papel:  { bg: '#F2F0EE', ink: '#000000', classe: 'kv--papel' },
  branco: { bg: '#FFFFFF', ink: '#000000', classe: 'kv--branco' },
};

/** Formatos de saída. `w`/`h` são a resolução de exportação. */
/* `base` é a única medida de tipo de cada formato, em cqi: manchete, apoio,
   url, lockup, gap e padding derivam dela. Peça larga precisa de tipo menor
   em relação à largura; peça alta, maior — é a mesma composição, calibrada. */
export const FORMATOS = [
  /* Valores calibrados por medição, não por estimativa: cada um é o que deixa
     o grafismo com cerca de metade da altura da peça (mais, nos verticais). */
  { id: '16x9',  nome: 'Apresentação e site',  ar: '16/9',  w: 2560, h: 1440, base: 5 },
  { id: '21x9',  nome: 'Hero e banner',        ar: '21/9',  w: 2520, h: 1080, base: 4 },
  { id: '1x1',   nome: 'Post',                 ar: '1/1',   w: 1440, h: 1440, base: 9 },
  { id: '4x5',   nome: 'Feed vertical',        ar: '4/5',   w: 1440, h: 1800, base: 11 },
  { id: '9x16',  nome: 'Story',                ar: '9/16',  w: 1080, h: 1920, base: 14 },
  /* Capa de LinkedIn: a proporção e os pixels são os que a plataforma usa. */
  { id: 'capa',  nome: 'Capa de LinkedIn',      ar: '1584/396', w: 1584, h: 396, base: 3.4 },
];

/**
 * Os quatro KVs. Cada um carrega uma das ideias da marca — e só uma, porque
 * um key visual que diz duas coisas não diz nenhuma.
 */
export const KVS = [
  {
    id: 'costura',
    rotulo: 'KV 01 · A costura',
    ideia: 'A tese: o lado técnico e o humano costurados na estratégia do negócio.',
    manchete: 'Clareza\né vantagem.',
    apoio: 'Estratégia, IA e liderança para transformar e escalar empresas.',
    campo: 'escuro',
    shape: 'weave',
    ramp: [0.04, 1],
    angle: 0,
    seed: 7,
    cell: 4,
  },
  {
    id: 'clareza',
    rotulo: 'KV 02 · Complexidade vira clareza',
    ideia: 'A cadeia da marca, com a própria assinatura como grafismo.',
    manchete: null,                    /* o grafismo É a manchete */
    apoio: 'Do diagnóstico à capacidade instalada.',
    campo: 'escuro',
    shape: 'text',
    opts: { text: 'Clareza\né vantagem', fit: 0.96 },
    ramp: [0.06, 1],
    angle: 0,
    seed: 11,
    cell: 4,
  },
  {
    id: 'lacuna',
    rotulo: 'KV 03 · A lacuna que se mede',
    ideia: 'A marca como instrumento: a abertura do símbolo é a lacuna de capacidade.',
    manchete: 'A lacuna\ndá para medir.',
    apoio: 'AI Assessment & Opportunities.',
    campo: 'papel',
    shape: 'gauge',
    ramp: [0.12, 1],
    angle: 0,
    seed: 23,
    cell: 4,
  },
  {
    id: 'capacidade',
    rotulo: 'KV 04 · O que fica',
    ideia: 'Transferência de capacidade: um lado esvazia, o outro enche.',
    manchete: 'O objetivo não é\ndependência.',
    apoio: 'A empresa precisa sustentar o que foi construído.',
    campo: 'escuro',
    shape: 'handoff',
    ramp: [0.12, 1],
    angle: 0,
    seed: 31,
    cell: 4,
  },
];

/**
 * Ajustes por formato. O motor é ciente de proporção, então quase nada precisa
 * mudar — o que muda é a célula (peça pequena pede grão mais fino) e, nos
 * verticais, a direção da rampa, para que ela corra no eixo longo da peça.
 */
export function ajustar(kv, formato) {
  const vertical = formato.id === '9x16' || formato.id === '4x5';
  return {
    ...kv,
    cell: formato.id === '9x16' ? 3 : kv.cell,
    /* Rampa no eixo longo: em peça vertical, adensar de baixo para cima diz a
       mesma coisa que da esquerda para a direita em peça horizontal. */
    angle: vertical && kv.shape !== 'text' ? 90 : kv.angle,
  };
}

/** Config do motor a partir de um KV já ajustado. */
export function configDoKV(kv, campo = CAMPOS[kv.campo]) {
  return {
    shape: kv.shape,
    opts: kv.opts || null,
    ramp: kv.ramp,
    angle: kv.angle,
    cell: kv.cell,
    seed: kv.seed,
    color: campo.ink,
  };
}
