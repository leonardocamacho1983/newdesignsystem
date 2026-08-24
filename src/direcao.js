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
  /* ---- Camada 1: COMPOSIÇÃO -------------------------------------------
     Onde o tipo senta em relação à densidade. É gramática, não direção de
     arte: os cinco são a mesma operação com o texto em lugares diferentes.
     Ficam porque são a base que as peças usam todo dia — e porque servem de
     controle para a camada de baixo. */
  {
    id: 'corte',
    camada: 'composicao',
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
    camada: 'composicao',
    nome: 'Campo',
    regra: 'O grafismo sangra pela peça inteira; o tipo senta numa clareira de densidade.',
    quando: 'Quando a peça precisa de presença antes de precisar de argumento: '
          + 'capa, abertura de deck, banner. A clareira é o que permite isso sem cortina.',
    layout: 'sangria',
    voz: 'sistema',
    campo: 'escuro',
    shape: 'fill', ramp: [0.05, 0.62], angle: 0, cell: 4, seed: 23,
    copiaY: 0.46,
    manchete: 'Complexidade\nvira clareza.',
    apoio: 'Do diagnóstico à capacidade instalada.',
    formatos: GRADE,
  },
  {
    id: 'trama',
    camada: 'composicao',
    nome: 'Trama',
    regra: 'O campo É o léxico: as palavras da marca são as partículas.',
    quando: 'Peça que fala do método ou do repertório. A rampa decide onde a '
          + 'palavra se lê e onde ela vira grão — a tese aplicada ao próprio vocabulário.',
    layout: 'sangria',
    voz: 'sistema',
    campo: 'escuro',
    shape: 'trama', ramp: [0.05, 1], angle: 0, cell: 3, seed: 11,
    opts: { corpo: 0.052 },
    copiaY: 0.48,
    manchete: 'Seis etapas.\nUma delas todo\nprojeto pula.',
    apoio: 'Diagnosticar · Priorizar · Estruturar · Implementar · Incorporar · Medir',
    formatos: GRADE,
  },
  {
    id: 'figura',
    camada: 'composicao',
    nome: 'Figura',
    regra: 'Uma figura que só existe onde o campo resolve.',
    quando: 'Peça que é SOBRE alguma coisa — um tema editorial, um cliente. '
          + 'Peça institucional continua abstrata: figura sem assunto é ornamento.',
    layout: 'sangria',
    voz: 'editorial',
    campo: 'escuro',
    shape: 'cidade', ramp: [0.06, 1], angle: 0, cell: 4, seed: 31,
    copiaY: 0.52,
    manchete: 'A cidade\ncomo sistema\nde decisão.',
    apoio: 'Cidadania digital e a dinâmica dos centros urbanos.',
    formatos: GRADE,
  },
  {
    id: 'palavra',
    camada: 'composicao',
    nome: 'Palavra',
    regra: 'O tipo é a imagem, denso o bastante para ler perfeitamente.',
    quando: 'Quando a frase já é a peça e qualquer grafismo ao lado dela competiria. '
          + 'Não leva manchete: haveria duas.',
    layout: 'muda',
    voz: 'sistema',
    campo: 'escuro',
    shape: 'text', ramp: [0.14, 1], angle: 0, cell: 3, seed: 17,
    opts: { text: 'Clareza\né vantagem', fit: 0.96 },
    /* Em retrato a mesma frase em duas linhas largas encolhe até virar
       borrão — medido na matriz, em A4 e 4:5. O tipo dissolvido se ajusta à
       CAIXA, então peça alta pede quebra alta. Não é preferência: é a mesma
       frase, quebrada para o formato que a recebe. */
    optsAlto: { text: 'Clareza\né\nvantagem', fit: 0.9 },
    manchete: null,
    apoio: null,   /* o pé já carrega o domínio; repetir daria a mesma linha duas vezes */
    formatos: GRADE,
  },

  /* ---- Camada 2: MATERIAL ----------------------------------------------
     O que a PARTÍCULA está fazendo. Aqui estava o mundo parado: nenhuma peça
     do sistema tinha usado `texture`, nenhuma tinha saído do campo escuro,
     a célula nunca saiu de 3 ou 4, e o motor sempre aceitou uma função como
     forma sem que ninguém compusesse dois campos.

     Estes registros não movem o texto de lugar. Trocam o material. */

  {
    id: 'impressao',
    camada: 'material',
    nome: 'Impressão',
    regra: 'Ponto ordenado, tinta sobre papel. O sistema como impresso, não como tela.',
    quando: 'Relatório, cartão, proposta — tudo que sai numa folha. O grão '
          + 'estocástico é uma textura de tela; o ponto ordenado é de gráfica, '
          + 'e ele muda a temperatura da marca inteira sem trocar uma forma.',
    layout: 'faixa',
    voz: 'sistema',
    campo: 'papel',
    shape: 'weave', ramp: [0.14, 1], angle: 0, cell: 6, seed: 7,
    texture: 'halftone',
    manchete: 'Clareza\né vantagem.',
    apoio: 'Estratégia, IA e liderança para transformar e escalar empresas.',
    formatos: GRADE,
  },
  {
    id: 'interferencia',
    camada: 'material',
    nome: 'Interferência',
    regra: 'Duas grades fora de fase. O ruído não está em nenhuma das duas — está na relação.',
    quando: 'A tese, desenhada por física em vez de ilustração: dois sistemas '
          + 'que não conversam produzem ruído, e alinhados o ruído desaparece. '
          + 'É o diagnóstico da marca (separar técnico de humano é o que faz '
          + 'a transformação falhar) sem precisar de metáfora.',
    layout: 'sangria',
    voz: 'sistema',
    campo: 'papel',
    shape: 'interferencia', ramp: [0.7, 1], angle: 0, cell: 3, seed: 7,
    texture: 'halftone',
    opts: { passo: 0.07, giro: 10 },
    copiaY: 0.5,
    manchete: 'O ruído está\nna relação.',
    apoio: 'Separar o técnico do humano é o que faz a transformação falhar.',
    formatos: GRADE,
  },
  {
    id: 'instrumento',
    camada: 'material',
    nome: 'Instrumento',
    regra: 'A marca em N aberturas vira escala. O símbolo é o instrumento do diagnóstico.',
    quando: 'Avaliação de maturidade, nível, lacuna. A abertura do C representa '
          + 'a distância entre a complexidade enfrentada e a capacidade instalada '
          + '— então a mesma letra, repetida em aberturas, JÁ é uma medição. '
          + 'Para uma prática cuja porta de entrada é diagnóstico, o logo virar '
          + 'o instrumento é o oposto de ornamento.',
    layout: 'faixa',
    voz: 'medida',
    campo: 'papel',
    shape: 'gauge', ramp: [0.12, 1], angle: 0, cell: 4, seed: 23,
    texture: 'halftone',
    manchete: 'A lacuna\ndá para medir.',
    apoio: 'Seis dimensões, uma leitura, a sequência que fecha as lacunas na ordem certa.',
    formatos: GRADE,
  },
  {
    id: 'costura',
    camada: 'material',
    nome: 'Costura',
    regra: 'Dois campos, um operador: a palavra só existe onde o entrelace passa.',
    quando: 'O diferencial da marca escrito em vez de desenhado. O motor sempre '
          + 'aceitou uma função como forma; compor texto com o entrelace faz a '
          + 'mensagem depender do cruzamento dos dois fios — que é literalmente '
          + 'o argumento.',
    layout: 'muda',
    voz: 'sistema',
    campo: 'escuro',
    shape: 'compor', ramp: [0.35, 1], angle: 0, cell: 3, seed: 7,
    opts: {
      a: { shape: 'text', opts: { text: 'Clareza', fit: 0.95 } },
      b: { shape: 'weave', opts: { w: 0.75, amp: 0.6, cycles: 1.4 } },
      modo: 'min',
    },
    optsAlto: {
      a: { shape: 'text', opts: { text: 'Clareza', fit: 0.9 } },
      b: { shape: 'weave', opts: { w: 0.9, amp: 0.7, cycles: 1.1 } },
      modo: 'min',
    },
    manchete: null,
    apoio: null,
    formatos: GRADE,
  },
  {
    id: 'escala',
    camada: 'material',
    nome: 'Escala',
    regra: 'A célula como variável de expressão: a mesma forma, do fotográfico ao brutal.',
    quando: 'Peça que precisa de peso físico — pôster, abertura, capa grande. '
          + 'A célula é medida em px lógicos e sempre ficou em 3 ou 4; a 12 ou '
          + '18 a partícula deixa de ser textura e vira objeto.',
    layout: 'faixa',
    voz: 'sistema',
    campo: 'branco',
    shape: 'text', ramp: [0.2, 1], angle: 0, cell: 12, seed: 17,
    texture: 'halftone',
    opts: { text: 'Clareza', fit: 0.95 },
    optsAlto: { text: 'Clareza', fit: 0.9 },
    manchete: null,
    apoio: 'A partícula deixa de ser textura e vira objeto.',
    formatos: GRADE,
  },
];

/**
 * O repertório de figuras. Cada uma é recrutada por um ASSUNTO, não pela
 * marca — é a regra do registro Figura desenhada em quatro casos. Peça
 * institucional continua abstrata; estas existem porque a peça é sobre
 * alguma coisa.
 */
export const FIGURAS = [
  { shape: 'cidade', assunto: 'Editorial',
    manchete: 'A cidade\ncomo sistema\nde decisão.',
    apoio: 'Cidadania digital e a dinâmica dos centros urbanos.' },
  { shape: 'pessoa', assunto: 'O fio humano',
    manchete: 'Ninguém decide\nmelhor sozinho.',
    apoio: 'Liderança, times e a parte da transformação que não é técnica.' },
  { shape: 'arvore', assunto: 'Capacidade instalada',
    manchete: 'O que fica\ndepois que eu saio.',
    apoio: 'Capacidade que cresce sem depender de quem plantou.' },
  { shape: 'banana', assunto: 'Cliente · Bananamilk',
    manchete: 'A operação\ninteira, legível.',
    apoio: 'Do dado disperso ao painel que a diretoria usa para decidir.' },
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
    /* Duas clareiras. A de cima não é escolha do registro: toda peça tem a
       assinatura no alto à esquerda, então a faixa que a protege é propriedade
       do componente. `piso` baixo porque texto pequeno não sobrevive nem a 6%
       de partícula — medido, com grão cruzando o lockup.

       As duas TRANSBORDAM a peça. Clareira que termina exatamente na borda
       tem a transição suave mordendo para dentro: a proteção afrouxa
       justamente no rodapé, e a partícula volta para cima da linha de apoio.
       Foi o que a primeira rodada mostrou no canto inferior direito. */
    clareira: reg.copiaY
      ? [
          { x: -0.2, y: -0.3, w: 0.85, h: 0.3 + (alto ? 0.13 : 0.2), soft: 0.1, piso: 0.02 },
          { x: -0.2, y: reg.copiaY + (alto ? 0.1 : 0), w: 1.4,
            h: 1.3 - reg.copiaY - (alto ? 0.1 : 0), soft: 0.14, piso: 0.02 },
        ]
      : null,
    /* O cartão não carrega linha de apoio — a mesma conta de legibilidade que
       vale para os KVs (6 pt é o piso a 85 mm de largura). */
    apoio: formato.id === 'cartao' ? null : reg.apoio,
    opts: alto && reg.optsAlto ? reg.optsAlto : reg.opts,
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
