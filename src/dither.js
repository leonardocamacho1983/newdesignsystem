/* ==========================================================================
   Camacho — Dither Engine
   --------------------------------------------------------------------------
   Todo grafismo da marca é a mesma ideia: uma FORMA amostrada por uma GRADE
   de partículas quadradas, cuja probabilidade de existir varia ao longo de
   uma RAMPA. Ruído de um lado, sinal do outro. É a tese da empresa desenhada.

   Uso declarativo:
     <canvas data-cmc-dither="ring" data-ramp="0.02,1" data-angle="0"></canvas>

   Uso programático:
     import { render, fields } from './dither.js'
     render(canvas, { shape: 'chevrons', ramp: [0.05, 1], angle: 180 })
   ========================================================================== */

/* --- PRNG determinístico -------------------------------------------------
   Hash por célula (não sequencial): a mesma célula devolve sempre o mesmo
   número, então redimensionar ou animar não faz o grafismo "ferver". */
function hash(x, y, seed) {
  let h = x * 374761393 + y * 668265263 + seed * 1274126177;
  h = (h ^ (h >>> 13)) >>> 0;
  h = Math.imul(h, 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

/* --- Matriz de Bayer 8×8 -------------------------------------------------
   Limiar ordenado, gerado por recursão em vez de tabelado: a mesma célula
   sempre cai no mesmo degrau, o que produz trama regular de impressão em
   lugar do grão aleatório. */
const BAYER = (() => {
  let m = [[0]];
  while (m.length < 8) {
    const n = m.length, out = [];
    for (let y = 0; y < n * 2; y++) out.push(new Array(n * 2));
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const q = m[y][x] * 4;
      out[y][x] = q; out[y][x + n] = q + 2;
      out[y + n][x] = q + 3; out[y + n][x + n] = q + 1;
    }
    m = out;
  }
  return m.map((row) => row.map((v) => (v + 0.5) / 64));
})();
/* Borda macia: converte distância assinada em cobertura 0..1 */
const edge = (d, soft) => clamp01(0.5 - d / (soft || 0.012));

/* Distância assinada a um retângulo centrado: negativa dentro, positiva fora.
   Fora pelos dois eixos, a distância é ao canto — senão o canto sai quadrado. */
const caixa = (du, dv, hw, hh) => {
  const dx = Math.abs(du) - hw, dy = Math.abs(dv) - hh;
  return dx > 0 && dy > 0 ? Math.hypot(dx, dy) : Math.max(dx, dy);
};

/* --- Campos de forma -----------------------------------------------------
   Cada campo é f(u, v) -> cobertura 0..1, em espaço normalizado onde
   u ∈ [0,1] e v é corrigido pela proporção (v ∈ [0, h/w]). */
/* --- Cache de máscara -----------------------------------------------------
   Campos que rasterizam fora da tela (texto, léxico, foto) são caros: um
   desenho mais um getImageData. O memo NÃO pode viver no closure do campo,
   porque `render` re-invoca a fábrica a cada chamada — numa animação de
   1600 ms isso reconstrói o mesmo desenho a cada quadro. */
const MASCARAS = new Map();

/* Fontes de imagem já decodificadas. O contrato do campo é síncrono, então
   quem carrega é quem chama, antes de renderizar. Só mesma origem ou data:
   URL — imagem de outra origem contamina o canvas e `getImageData` lança. */
const FONTES = new Map();
let GERACAO = 0;

/* Mapa de cor da fonte, para o modo `tint`. Separado da máscara de cobertura
   porque quase nenhuma peça usa cor: pagar o custo em todas seria taxar o
   sistema inteiro por uma exceção. */
function corDaFonte(src, ar) {
  return mascara(`cor|${src}|${ar}|${GERACAO}`, () => {
    const img = FONTES.get(src);
    const W = 256, H = Math.max(1, Math.round(W * ar));
    const rgb = new Uint8Array(W * H * 3);
    if (!img || !img.width) return { rgb, mw: W, mh: H };
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
    const e = Math.max(W / img.width, H / img.height);
    x.drawImage(img, (W - img.width * e) / 2, (H - img.height * e) / 2,
                img.width * e, img.height * e);
    const d = x.getImageData(0, 0, W, H).data;
    for (let k = 0; k < W * H; k++) {
      rgb[k * 3] = d[k * 4]; rgb[k * 3 + 1] = d[k * 4 + 1]; rgb[k * 3 + 2] = d[k * 4 + 2];
    }
    return { rgb, mw: W, mh: H };
  });
}

export function registrarFonte(nome, img) {
  FONTES.set(nome, img);
  GERACAO++;
  return img;
}

/** Carrega e decodifica antes de devolver, que é o que o motor exige. */
export async function carregarFonte(nome, url) {
  const img = new Image();
  img.src = url;
  await img.decode();
  return registrarFonte(nome, img);
}

function mascara(chave, construir) {
  let m = MASCARAS.get(chave);
  if (!m) {
    m = construir();
    /* Teto pequeno: uma página tem poucas máscaras distintas, e segurar todas
       para sempre vazaria memória em quem redimensiona muito. */
    if (MASCARAS.size > 24) MASCARAS.delete(MASCARAS.keys().next().value);
    MASCARAS.set(chave, m);
  }
  return m;
}

/* Máscara construída antes de a fonte carregar sai com métrica de fallback.
   Sem zerar o cache, essa máscara torta sobreviveria ao redesenho que o
   `fonts.ready` dispara — que é justamente o redesenho que existe para
   consertá-la. */
if (typeof document !== 'undefined') document.fonts?.ready.then(() => MASCARAS.clear());

export const fields = {
  /* `k` = meia-altura do campo: deixa toda forma se ajustar à proporção do
     canvas sem que ninguém precise recalcular raios na mão. */

  /* Sinal: o disco cheio. Massa resolvida. */
  disc: ({ r = 0.82, soft = 0.02 } = {}) => (u, v, ar) => {
    const k = Math.min(0.5, ar / 2);
    return edge(Math.hypot(u - 0.5, v - ar / 2) - k * r, soft);
  },

  /* Ruído: o anel. Mesma forma, sem miolo. */
  ring: ({ r = 0.82, w = 0.26, soft = 0.02 } = {}) => (u, v, ar) => {
    const k = Math.min(0.5, ar / 2);
    return edge(Math.abs(Math.hypot(u - 0.5, v - ar / 2) - k * r) - (k * w) / 2, soft);
  },

  /* Deploy: cadência de setas. Velocidade como repetição. */
  chevrons: ({ n = 3, gap = 0.02, inset = 0.03, soft = 0.012 } = {}) => (u, v, ar) => {
    /* `inset` mantém a ponta da última seta dentro do quadro, sem parecer cortada */
    const usable = 1 - inset * 2;
    const span = (usable - gap * (n - 1)) / n;
    for (let i = 0; i < n; i++) {
      const t = (u - inset - i * (span + gap)) / span;
      if (t < 0 || t > 1) continue;
      const half = (1 - t) * ar * 0.46;          /* triângulo apontando à direita */
      return edge(Math.abs(v - ar / 2) - half, soft);
    }
    return 0;
  },

  /* Transform: matriz de blocos. Padrão bruto virando estrutura. */
  bars: ({ cols = 20, rows = 5, duty = 0.5 } = {}) => (u, v, ar) => {
    if ((u * cols) % 1 > duty) return 0;
    const col = Math.floor(u * cols);
    const rv = (v / ar) * rows;
    const row = Math.floor(rv);
    if (row < 0 || row >= rows) return 0;
    /* algumas colunas viram barras inteiras: é o que dá o ritmo do print */
    const full = hash(col, 0, 91) > 0.78;
    if (full) return 1;
    return (rv % 1) < 0.62 && hash(col, row, 17) > 0.22 ? 1 : 0;
  },

  /* Refine: o laço. Círculo com caudas que entram e saem. */
  loop: ({ r = 0.62, w = 0.2, soft = 0.014 } = {}) => (u, v, ar) => {
    const k = Math.min(0.5, ar / 2), R = k * r, W = k * w;
    const cy = ar / 2;
    const ringD = Math.abs(Math.hypot(u - 0.5, v - cy) - R) - W / 2;
    const tailD = Math.abs(v - cy) - W / 2;
    const inTail = u < 0.5 - R * 0.5 || u > 0.5 + R * 0.5;
    return edge(inTail ? Math.min(ringD, tailD) : ringD, soft);
  },

  /* Camadas: losangos isométricos empilhados. Infraestrutura. */
  layers: ({ n = 3, rx = 0.24, soft = 0.014 } = {}) => (u, v, ar) => {
    const ry = ar * 0.15, gap = ar * 0.33;
    const base = ar / 2 - ((n - 1) * gap) / 2;
    for (let i = 0; i < n; i++) {
      const d = Math.abs(u - 0.5) / rx + Math.abs(v - (base + i * gap)) / ry - 1;
      if (d < 0) return edge(d * ry, soft);
    }
    return 0;
  },

  /* A marca: o "C" dele mesmo, dissolvido. Camiseta, capa, hero. */
  mark: ({ r = 0.78, w = 0.3, aperture = 0.36, soft = 0.016 } = {}) => (u, v, ar) => {
    const k = Math.min(0.5, ar / 2), R = k * r, W = k * w, cy = ar / 2;
    if (u > 0.5 && Math.abs(v - cy) < R * aperture) return 0;   /* abertura do C */
    return edge(Math.abs(Math.hypot(u - 0.5, v - cy) - R) - W / 2, soft);
  },

  /* --- Tipografia dissolvida ---------------------------------------------
     Rasteriza o texto num canvas fora da tela e usa o alpha como cobertura.
     Com isso qualquer palavra vira grafismo da marca: manchete de pôster,
     post de social, capa de relatório. A máscara é construída na primeira
     chamada, quando a proporção já é conhecida, e reaproveitada depois. */
  /* `font` é a lista de família CSS: é o que deixa o tipo dissolvido falar as
     três vozes do sistema, e não só a de sistema. */
  text: ({ text = 'Camacho', weight = 300, tracking = '-0.04em', fit = 0.92,
           lineHeight = 0.98, font = '"Inter Tight", "Inter", sans-serif' } = {}) => {
    const chave = `texto|${text}|${weight}|${tracking}|${fit}|${lineHeight}|${font}`;

    const build = (ar) => {
      const W = 900, H = Math.max(1, Math.round(W * ar));
      const c = document.createElement('canvas');
      c.width = W; c.height = H;
      const x = c.getContext('2d', { willReadFrequently: true });
      const rows = String(text).split('\n');
      const setFont = (px) => {
        x.font = `${weight} ${px}px ${font}`;
        if ('letterSpacing' in x) x.letterSpacing = `${px * parseFloat(tracking)}px`;
      };
      x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillStyle = '#fff';

      /* O Chromium soma o espaçamento também DEPOIS do último glifo, então
         measureText devolve mais (ou menos, com tracking negativo) do que a
         mancha real. Descontar isso é o que mantém a linha centrada. */
      const lineWidth = (r, px) => x.measureText(r).width - px * parseFloat(tracking);

      /* Ajusta o corpo até caber na caixa, na altura e na largura. */
      let px = (H / rows.length) * 0.95;
      setFont(px);
      const widest = Math.max(...rows.map((r) => lineWidth(r, px))) || 1;
      if (widest > W * fit) { px *= (W * fit) / widest; setFont(px); }

      const lh = px * lineHeight, total = lh * rows.length;
      rows.forEach((r, i) => x.fillText(
        r,
        (W - lineWidth(r, px)) / 2,
        H / 2 - total / 2 + lh * (i + 0.5),
      ));

      const data = x.getImageData(0, 0, W, H).data;
      const mask = new Uint8Array(W * H);
      for (let k = 0; k < mask.length; k++) mask[k] = data[k * 4 + 3];
      return { mask, mw: W, mh: H };
    };

    /* O memo local existe para o LAÇO: montar a chave e consultar o Map uma
       vez por célula custa mais do que a rasterização que o cache evita —
       medido, 14,8 ms/quadro contra 7,4. O cache de módulo existe para os
       QUADROS: sem ele, cada quadro reconstrói o mesmo desenho. */
    let m = null, memoAr = -1;

    return (u, v, ar) => {
      if (memoAr !== ar) { m = mascara(`${chave}|${ar}`, () => build(ar)); memoAr = ar; }
      const x = (u * m.mw) | 0, y = ((v / ar) * m.mh) | 0;
      if (x < 0 || x >= m.mw || y < 0 || y >= m.mh) return 0;
      return m.mask[y * m.mw + x] / 255;
    };
  },

  /* --- Vocabulário estendido --------------------------------------------
     Cada forma carrega uma ideia do negócio; nenhuma é ornamento. */

  /* Prioritize: muitos entram, poucos saem. O funil. */
  funnel: ({ mouth = 0.9, throat = 0.16, soft = 0.014 } = {}) => (u, v, ar) => {
    const t = clamp01(u);
    const half = (ar / 2) * (mouth - (mouth - throat) * Math.pow(t, 0.7));
    return edge(Math.abs(v - ar / 2) - half, soft);
  },

  /* O sinal literal: onda que sai de plana e ganha amplitude. */
  wave: ({ cycles = 3, amp = 0.3, w = 0.1, soft = 0.014 } = {}) =>
    (u, v, ar) => {
      /* ciclos inteiros: a onda fecha na linha de centro em vez de parecer
         cortada pela borda */
      const swell = Math.pow(u, 1.4);
      const y = ar / 2 + Math.sin(u * cycles * Math.PI * 2) * ar * amp * swell;
      return edge(Math.abs(v - y) - (ar * w) / 2, soft);
    },

  /* Agentes em volta do seu stack: um núcleo e nós em órbita. */
  orbit: ({ nodes = 7, core = 0.22, node = 0.11, ringW = 0.03, soft = 0.012 } = {}) =>
    (u, v, ar) => {
      const k = Math.min(0.5, ar / 2), cy = ar / 2;
      const dist = Math.hypot(u - 0.5, v - cy);
      let cov = edge(dist - k * core, soft);                 /* núcleo */
      cov = Math.max(cov, edge(Math.abs(dist - k * 0.82) - k * ringW, soft)); /* trilha */
      for (let i = 0; i < nodes; i++) {
        const a = (i / nodes) * Math.PI * 2;
        const nx = 0.5 + Math.cos(a) * k * 0.82;
        const ny = cy + Math.sin(a) * k * 0.82;
        cov = Math.max(cov, edge(Math.hypot(u - nx, v - ny) - k * node, soft));
      }
      return cov;
    },

  /* Ganhos que compõem: a escada. */
  staircase: ({ steps = 5, soft = 0.01 } = {}) => (u, v, ar) => {
    const i = Math.min(steps - 1, Math.floor(u * steps));
    const top = ar - ar * ((i + 1) / steps);
    return v >= top ? edge(-0.02, soft) : 0;
  },

  /* Malha de nós conectados: a rede que o sistema vira. */
  mesh: ({ cols = 7, rows = 4, node = 0.028, link = 0.004, pad = 0.07, soft = 0.008 } = {}) =>
    (u, v, ar) => {
      /* `pad` afasta a grade das bordas: nó cortado pela metade lê como defeito */
      const x0 = pad, y0 = ar * pad;
      const gx = (1 - pad * 2) / (cols - 1), gy = (ar - y0 * 2) / (rows - 1);
      const cx = Math.round((u - x0) / gx), cy = Math.round((v - y0) / gy);
      let cov = 0;
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
        const i = cx + dx, j = cy + dy;
        if (i < 0 || i >= cols || j < 0 || j >= rows) continue;
        const px = x0 + i * gx, py = y0 + j * gy;
        cov = Math.max(cov, edge(Math.hypot(u - px, v - py) - node, soft));
        /* liga ao vizinho da direita e ao de baixo */
        if (i + 1 < cols && u >= px && u <= px + gx)
          cov = Math.max(cov, edge(Math.abs(v - py) - link, soft));
        if (j + 1 < rows && v >= py && v <= py + gy)
          cov = Math.max(cov, edge(Math.abs(u - px) - link, soft));
      }
      return cov;
    },

  /* Espiral: o ciclo que não volta ao mesmo ponto. */
  spiral: ({ turns = 2.6, w = 0.05, soft = 0.012 } = {}) => (u, v, ar) => {
    const k = Math.min(0.5, ar / 2), cy = ar / 2;
    const dx = u - 0.5, dy = v - cy;
    const dist = Math.hypot(dx, dy) / k;
    if (dist > 1) return 0;
    const a = (Math.atan2(dy, dx) + Math.PI * 2) % (Math.PI * 2);
    /* distância à volta mais próxima da espiral de Arquimedes */
    const target = dist * turns * Math.PI * 2;
    const delta = ((target - a) / (Math.PI * 2)) % 1;
    const d = Math.min(delta, 1 - delta) / turns;
    return edge(d - w / 2, soft);
  },

  /* Área cheia: cobertura 1 em todo o quadro. Sozinho não desenha nada — o
     que ele faz é entregar a superfície inteira para a rampa, de modo que a
     DENSIDADE vire o conteúdo. É como uma barra de nível é desenhada. */
  fill: () => () => 1,

  /* --- Vocabulário da transformação -------------------------------------
     A costura, a incorporação, a medida e a transferência: as quatro ideias
     que o vocabulário anterior (todo sobre matéria e sistema) não dizia. */

  /* A COSTURA — o grafismo-âncora. Dois fios entram separados, com fases
     opostas, e se entrelaçam até virar um só. É a tese da marca: técnico e
     humano não correm em paralelo, eles se costuram. */
  weave: ({ cycles = 2.5, amp = 0.42, w = 0.09, inset = 0.04, soft = 0.014 } = {}) =>
    (u0, v, ar) => {
      /* `inset` mantém a ponta costurada dentro do quadro: fio encostando na
         borda lê como corte, não como conclusão. */
      const u = (u0 - inset) / (1 - inset * 2);
      if (u < 0 || u > 1) return 0;
      const cy = ar / 2;
      /* A amplitude decai até zero: no fim do percurso os dois fios ocupam
         a mesma linha, que é o que faz "dois viram um" e não "dois lado a lado". */
      const abertura = Math.pow(1 - u, 1.6) * ar * amp;
      const fase = u * cycles * Math.PI * 2;
      const fioA = cy + Math.sin(fase) * abertura;
      const fioB = cy - Math.sin(fase) * abertura;
      const meia = (ar * w) / 2;
      return Math.max(
        edge(Math.abs(v - fioA) - meia, soft),
        edge(Math.abs(v - fioB) - meia, soft),
      );
    },

  /* INCORPORAR — pessoas entrando em sintonia. Marcas dispersas à esquerda
     que se alinham numa linha à direita. O desalinhamento é função de x, não
     do tempo: o mesmo grafismo sempre, sem animação por trás. */
  cohort: ({ n = 9, r = 0.62, inset = 0.04, soft = 0.012 } = {}) => (u, v, ar) => {
    const cy = ar / 2, util = 1 - inset * 2, passo = util / n;
    /* O raio precisa respeitar os dois eixos: só horizontal estoura em 1:1,
       só vertical some em faixa larga e baixa como o palco do slide (16:6). */
    const R = Math.min(passo * r, ar * 0.16);
    let cov = 0;
    const col = Math.round((u - inset) / passo);
    for (let d = -1; d <= 1; d++) {
      const i = col + d;
      if (i < 0 || i >= n) continue;
      const cx = inset + (i + 0.5) * passo;
      const t = (cx - inset) / util;
      /* dispersão que se fecha conforme avança */
      const solta = (hash(i, 0, 41) - 0.5) * 2;
      const y = cy + solta * (ar / 2 - R) * 0.9 * Math.pow(1 - t, 1.7);
      cov = Math.max(cov, edge(Math.hypot(u - cx, v - y) - R, soft));
    }
    return cov;
  },

  /* MEDIR — a marca virando instrumento. O mesmo "C" repetido com a abertura
     fechando: uma escala de maturidade. Aberto = lacuna grande; quase fechado
     = capacidade instalada. */
  gauge: ({ n = 5, w = 0.34, de = 0.62, ate = 0.06, inset = 0.05, soft = 0.014 } = {}) =>
    (u, v, ar) => {
      /* A escala corre no eixo LONGO do quadro. Numa peça alta, uma fileira
         horizontal ocuparia uma faixa fina e ficaria boiando — a forma saber a
         proporção em que está é o mesmo princípio de todo o motor. */
      const empilha = ar > 1.15;
      const [eixo, cruz, extEixo, extCruz] = empilha ? [v, u, ar, 1] : [u, v, 1, ar];
      const util = extEixo - inset * 2 * extEixo, passo = util / n;
      const ini = inset * extEixo;
      if (eixo < ini || eixo > extEixo - ini) return 0;
      const i = Math.min(n - 1, Math.floor((eixo - ini) / passo));
      const cEixo = ini + (i + 0.5) * passo, cCruz = extCruz / 2;
      const R = Math.min(passo * 0.38, extCruz * 0.36);
      const W = R * w * 2;
      const t = n === 1 ? 0 : i / (n - 1);
      const abertura = de + (ate - de) * t;      /* fecha ao longo da escala */
      const dEixo = eixo - cEixo, dCruz = cruz - cCruz;
      /* o vão do C aponta para o fim da escala */
      if (dEixo > 0 && Math.abs(dCruz) < R * abertura) return 0;
      return edge(Math.abs(Math.hypot(dEixo, dCruz) - R) - W / 2, soft);
    },

  /* TRANSFERIR — a capacidade mudando de mãos. Um recipiente que esvazia à
     esquerda, um que enche à direita, e o fluxo entre eles. O diferencial
     declarado: o objetivo não é criar dependência permanente. */
  handoff: ({ r = 0.6, w = 0.22, canal = 0.05, vao = 0.58, soft = 0.014 } = {}) =>
    (u, v, ar) => {
      /* A transferência também corre no eixo longo: em peça alta, de cima
         para baixo. */
      const empilha = ar > 1.15;
      const [eixo, cruz, extEixo, extCruz] = empilha ? [v, u, ar, 1] : [u, v, 1, ar];
      const cy = extCruz / 2;
      const xEsq = extEixo * (1 - vao) / 2, xDir = extEixo - xEsq;
      /* o raio precisa caber no eixo curto E na folga entre os dois centros,
         senão em 1:1 os recipientes se atravessam */
      const R = Math.min(extCruz * 0.42, ((xDir - xEsq) / 2) * r);
      const dEsq = Math.hypot(eixo - xEsq, cruz - cy);
      const dDir = Math.hypot(eixo - xDir, cruz - cy);
      /* esquerda: só o contorno (esvaziou) · direita: massa cheia (recebeu) */
      const esq = edge(Math.abs(dEsq - R) - (R * w) / 2, soft);
      const dir = edge(dDir - R, soft);
      /* o canal só existe entre os dois */
      const canalCov = eixo > xEsq && eixo < xDir
        ? edge(Math.abs(cruz - cy) - extCruz * canal, soft) : 0;
      return Math.max(esq, Math.max(dir, canalCov));
    },

  /* Grafismo-âncora: anel de ruído + disco de sinal, lado a lado. */
  /* Trama: o campo É o léxico da marca. Não é textura genérica com palavra
     por cima — as palavras SÃO as partículas, e a rampa decide onde elas
     ficam legíveis e onde viram grão.

     A máscara cobre o quadro inteiro em vez de ladrilhar: ladrilho barato
     mostra a emenda, e emenda num campo sangrado é a primeira coisa que o
     olho acha. O deslocamento por linha sai do hash, não do acaso: a trama
     precisa ser a MESMA em toda renderização da mesma peça. */
  trama: ({
    palavras = ['Diagnosticar', 'Priorizar', 'Estruturar', 'Implementar',
                'Incorporar', 'Medir', 'Clareza é vantagem'],
    corpo = 0.052, entrelinha = 1.2, weight = 400, tracking = '-0.02em',
    sep = '  ·  ', font = '"Inter Tight", "Inter", sans-serif',
  } = {}) => {
    const chave = `trama|${palavras.join('|')}|${corpo}|${entrelinha}|${weight}|${tracking}|${sep}|${font}`;

    const build = (ar) => {
      const W = 1400, H = Math.max(1, Math.round(W * ar));
      const c = document.createElement('canvas');
      c.width = W; c.height = H;
      const x = c.getContext('2d', { willReadFrequently: true });
      const px = W * corpo;
      x.font = `${weight} ${px}px ${font}`;
      if ('letterSpacing' in x) x.letterSpacing = `${px * parseFloat(tracking)}px`;
      x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillStyle = '#fff';

      const lh = px * entrelinha;
      for (let i = 0; i < Math.ceil(H / lh) + 1; i++) {
        let linha = '', j = i;
        /* Duas larguras de texto para que o deslocamento nunca deixe buraco
           na ponta direita. */
        while (x.measureText(linha).width < W * 2) linha += palavras[j++ % palavras.length] + sep;
        x.fillText(linha, -hash(i, 0, 3) * W, lh * (i + 0.5));
      }

      const data = x.getImageData(0, 0, W, H).data;
      const mask = new Uint8Array(W * H);
      for (let k = 0; k < mask.length; k++) mask[k] = data[k * 4 + 3];
      return { mask, mw: W, mh: H };
    };

    let m = null, memoAr = -1;
    return (u, v, ar) => {
      if (memoAr !== ar) { m = mascara(`${chave}|${ar}`, () => build(ar)); memoAr = ar; }
      const x = (u * m.mw) | 0, y = ((v / ar) * m.mh) | 0;
      if (x < 0 || x >= m.mw || y < 0 || y >= m.mh) return 0;
      return m.mask[y * m.mw + x] / 255;
    };
  },

  /* --- Material ----------------------------------------------------------
     Os campos acima decidem ONDE há partícula. Estes decidem o que a partícula
     está fazendo — e é aí que o sistema tinha um mundo inteiro parado. */

  /* Interferência: duas grades de linhas que entram desalinhadas e saem
     coincidindo. O moiré NÃO é desenhado — ele emerge do desencontro, e some
     sozinho quando as duas grades se alinham.

     É a tese da marca desenhada por física em vez de ilustração: dois
     sistemas que não conversam produzem ruído, e o ruído não está em nenhum
     dos dois — está na relação. Alinhados, o ruído desaparece e sobra sinal.
     Nenhum grafismo de duas linhas paralelas diz isso; este diz. */
  interferencia: ({ passo = 0.028, giro = 9, duty = 0.46, soft = 0.004 } = {}) => {
    const grade = (pos) => {
      const f = pos / passo;
      return edge(Math.abs(f - Math.round(f)) * passo - passo * duty * 0.5, soft);
    };
    return (u, v) => {
      /* O desalinhamento é máximo na ponta do ruído e zero na do sinal. */
      const r = (giro * (1 - clamp01(u)) * Math.PI) / 180;
      return grade(v) * grade(-u * Math.sin(r) + v * Math.cos(r));
    };
  },

  /* Composição: dois campos, um operador. O motor sempre aceitou uma função
     como forma, e isso nunca tinha sido usado — dava para escrever a costura
     em vez de desenhá-la.

     `min` é interseção: a palavra só existe ONDE o entrelace passa. Os dois
     fios precisam se cruzar para a mensagem existir, que é literalmente o
     argumento da marca. `sub` é recorte; `max` é união. */
  compor: ({ a = { shape: 'text' }, b = { shape: 'weave' }, modo = 'min' } = {}) => {
    const fa = (fields[a.shape] || fields.disc)(a.opts || {});
    const fb = (fields[b.shape] || fields.disc)(b.opts || {});
    const op = modo === 'max' ? Math.max
             : modo === 'sub' ? (x, y) => Math.min(x, 1 - y)
             : Math.min;
    return (u, v, ar) => op(fa(u, v, ar), fb(u, v, ar));
  },

  /* --- Fotografia -------------------------------------------------------
     A foto entra como PROVA, nunca como banco de imagem. E no instante em que
     ela é amostrada pelo motor, ela deixa de ser fotografia e vira campo: sai
     monocromática, porque a marca tem um canal semântico só e ele é densidade.
     Foto colorida convive com o sistema — mas ao lado dele, num quadro seu, e
     não dissolvida nele.

     A imagem é PRÉ-CONDIÇÃO: o contrato do campo é síncrono, então a fonte
     precisa estar decodificada antes do render. `registrarFonte` guarda; o
     campo consulta pelo nome, o que também é o que permite passar a foto por
     `data-opts` (JSON não carrega um HTMLImageElement).

     A máscara é construída num canvas de 512 e o downscale do próprio
     navegador faz a filtragem — é box filter testado, e evita reimplementar
     tabela de soma acumulada para ganhar a mesma coisa. */
  foto: ({ src = '', inverter = false, ganho = 1, piso = 0 } = {}) => {
    const chave = `foto|${src}|${inverter}|${ganho}|${piso}`;

    const build = (ar) => {
      const img = FONTES.get(src);
      const W = 512, H = Math.max(1, Math.round(W * ar));
      const mask = new Uint8Array(W * H);
      if (!img || !img.width) return { mask, mw: W, mh: H };

      const c = document.createElement('canvas');
      c.width = W; c.height = H;
      const x = c.getContext('2d', { willReadFrequently: true });
      x.imageSmoothingEnabled = true;
      x.imageSmoothingQuality = 'high';
      /* `cover`: a peça tem proporção própria e a foto se encaixa nela sem
         barra preta. Recortar é decisão de enquadramento, não defeito. */
      const e = Math.max(W / img.width, H / img.height);
      const dw = img.width * e, dh = img.height * e;
      x.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);

      const d = x.getImageData(0, 0, W, H).data;
      for (let k = 0; k < mask.length; k++) {
        const i = k * 4;
        const lum = (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;
        const v = inverter ? 1 - lum : lum;
        mask[k] = clamp01(piso + (v - piso) * ganho) * 255;
      }
      return { mask, mw: W, mh: H };
    };

    let m = null, memoAr = -1, geracao = -1;
    return (u, v, ar) => {
      /* `GERACAO` sobe quando uma fonte é registrada: sem isso a máscara vazia
         de antes do carregamento ficaria em cache para sempre. */
      if (memoAr !== ar || geracao !== GERACAO) {
        m = mascara(`${chave}|${ar}|${GERACAO}`, () => build(ar));
        memoAr = ar; geracao = GERACAO;
      }
      const x = (u * m.mw) | 0, y = ((v / ar) * m.mh) | 0;
      if (x < 0 || x >= m.mw || y < 0 || y >= m.mh) return 0;
      return m.mask[y * m.mw + x] / 255;
    };
  },

  /* --- Figuras -----------------------------------------------------------
     Figura não é ornamento: ela só existe onde o campo resolve, que é o
     argumento da marca desenhado sobre um assunto. Peça institucional
     continua abstrata; figura entra quando a peça é SOBRE alguma coisa — um
     tema editorial ou um cliente.

     Todas são 3–5 primitivas compostas com Math.max(edge(...)), igual ao
     resto do vocabulário. Não é economia: é o que faz elas parecerem do
     sistema em vez de clip-art importado, e o que as mantém independentes de
     resolução — sem máscara, sem arquivo de origem, e a mesma figura
     recompõe de 21:9 a 9:16. */

  /* Cidade: o centro urbano, para o assunto editorial. */
  cidade: ({ n = 9, chao = 0.86, topo = 0.10, vao = 0.18, soft = 0.01 } = {}) => {
    /* Alturas fixas, não sorteadas: a silhueta precisa ser a MESMA em toda
       peça, senão a figura troca de identidade ao trocar de formato. */
    const H = [0.42, 0.74, 0.30, 0.96, 0.55, 0.82, 0.34, 0.66, 0.48];
    return (u, v, ar) => {
      const passo = 1 / n;
      const i = Math.floor(u / passo);
      if (i < 0 || i >= n) return 0;
      const util = ar * (chao - topo);
      const alt = util * H[i];
      const y0 = ar * chao;
      return edge(caixa(u - (i + 0.5) * passo, v - (y0 - alt / 2),
                        (passo * (1 - vao)) / 2, alt / 2), soft);
    };
  },

  /* Pessoa: o fio humano. Cabeça e ombros — o corte na altura do queixo é o
     que faz ler busto e não boneco de neve. */
  pessoa: ({ soft = 0.014 } = {}) => (u, v, ar) => {
    const k = Math.min(0.5, ar / 2), cy = ar / 2;
    const cabeca = edge(Math.hypot(u - 0.5, v - (cy - k * 0.55)) - k * 0.34, soft);
    /* Os ombros são a metade de cima de uma elipse que sai pela base da peça.
       O vão entre queixo e ombro precisa MEDIR: na primeira versão ele deu
       0,64k e a figura leu como dois blobs soltos, não como uma pessoa. */
    /* Largos e RASOS. Com rx≈ry a elipse vira círculo e a figura lê como
       boneco de neve nos formatos altos — foi o que a medição mostrou. */
    const rx = k * 1.42, ry = k * 0.88;
    const e = Math.hypot((u - 0.5) / rx, (v - (cy + k * 0.76)) / ry) - 1;
    /* A elipse normalizada não devolve distância real; multiplicar pelo menor
       raio aproxima — mesmo recurso que `layers` usa. */
    const ombros = edge(e * Math.min(rx, ry), soft);
    return Math.max(cabeca, ombros);
  },

  /* Árvore: capacidade que cresce. Copa como massa, não contorno. */
  arvore: ({ soft = 0.014 } = {}) => (u, v, ar) => {
    const k = Math.min(0.5, ar / 2), cy = ar / 2;
    let cov = edge(caixa(u - 0.5, v - (cy + k * 0.58), k * 0.08, k * 0.42), soft);
    for (const [dx, dy, r] of [[0, -0.44, 0.42], [-0.34, -0.08, 0.32], [0.34, -0.08, 0.32]])
      cov = Math.max(cov, edge(Math.hypot(u - (0.5 + k * dx), v - (cy + k * dy)) - k * r, soft));
    return cov;
  },

  /* Banana: um disco menos outro, deslocado. Os bicos saem de graça, no ponto
     em que os dois círculos se cruzam. */
  banana: ({ giro = -38, esc = 0.70, soft = 0.014 } = {}) => (u, v, ar) => {
    const k = Math.min(0.5, ar / 2), s = k * esc;
    const rad = (giro * Math.PI) / 180, cos = Math.cos(rad), sin = Math.sin(rad);
    const du = u - 0.5, dv = v - ar / 2;
    const x = (du * cos + dv * sin) / s;
    const y = (-du * sin + dv * cos) / s + 0.25;   /* centra o crescente */
    /* O deslocamento decide a barriga: 0,30/0,94 deu um crescente fino que
       lia como lua. 0,46/0,78 engorda para 0,68 de espessura. */
    const arco = Math.min(edge((Math.hypot(x, y) - 1) * s, soft),
                          1 - edge((Math.hypot(x, y + 0.46) - 0.78) * s, soft));
    /* O cabo é o que separa fruta de lua crescente. Sai do bico de cima, no
       ponto em que os dois círculos se cruzam (x ≈ 0,76 · y ≈ -0,66). */
    const cabo = edge(caixa(x - 0.80, y + 0.78, 0.085, 0.20) * s, soft);
    return Math.max(arco, cabo);
  },

  noiseToSignal: ({ soft = 0.02 } = {}) => (u, v, ar) => {
    const cy = ar / 2, R = Math.min(0.21, ar * 0.4);
    const a = Math.abs(Math.hypot(u - 0.3, v - cy) - R) - R * 0.28;
    const b = Math.hypot(u - 0.7, v - cy) - R;
    return Math.max(edge(a, soft), edge(b, soft));
  },
};

/* --- Rampa de densidade --------------------------------------------------
   Projeta cada ponto num eixo girado e interpola de `from` a `to`.
   angle 0 = ruído à esquerda; 180 = ruído à direita; 90 = de baixo. */
function axis(u, v, ar, angle) {
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad), sin = Math.sin(rad);
  const proj = (u - 0.5) * cos + (v - ar / 2) * sin;
  const half = (Math.abs(cos) + Math.abs(sin) * ar) / 2;   /* extensão real do eixo */
  return clamp01(proj / (2 * half) + 0.5);
}

/* Posição na rampa, 0 na ponta "ruído" e 1 na ponta "sinal". */
function rampPos(u, v, ar, { angle, mirror, radial }) {
  if (radial) {
    /* denso no miolo, dispersando para fora — para peças centradas */
    const d = Math.hypot(u - 0.5, v - ar / 2) / Math.hypot(0.5, ar / 2);
    return clamp01(1 - d);
  }
  const t = axis(u, v, ar, angle);
  /* mirror: pico no centro do eixo, dispersando para os dois lados */
  return mirror ? 1 - Math.abs(t * 2 - 1) : t;
}

/* Clareira: uma região onde a densidade DESABA até `piso`, para a manchete
   sentar em terreno limpo sem cortina de gradiente por cima.

   É o que torna possível o campo sangrado. A regra da casa é que grafismo
   nunca cruza com tipografia, e o remendo que já falhou aqui foi jogar o
   canvas atrás de tudo com z-index. A clareira resolve pelo outro lado: não
   existe partícula onde o texto vai — não há o que cruzar.

   x/w são fração da LARGURA e y/h fração da ALTURA, que é como a peça é
   pensada; o motor mede v em unidades de largura, então y entra multiplicado
   por ar. `soft` é a largura da transição, e ela precisa ser generosa: borda
   dura devolve um recorte a canivete, que é o defeito que se quer evitar. */
const CLAREIRA = { x: 0, y: 0, w: 0.5, h: 1, soft: 0.14, piso: 0.06 };

function clareiraAt(u, v, ar, c) {
  const dx = Math.max(c.x - u, u - (c.x + c.w));
  const dy = Math.max(c.y * ar - v, v - (c.y + c.h) * ar);
  /* Distância assinada ao retângulo: negativa dentro, positiva fora. Fora
     pelos dois eixos, a distância é ao canto — senão o canto fica quadrado. */
  const d = dx > 0 && dy > 0 ? Math.hypot(dx, dy) : Math.max(dx, dy);
  const dentro = edge(d, c.soft);
  return 1 - dentro * (1 - c.piso);
}

function rampAt(u, v, ar, cfg) {
  const d = cfg.from + (cfg.to - cfg.from) * Math.pow(rampPos(u, v, ar, cfg), cfg.curve);
  if (!cfg.clareira) return d;
  /* Mais de uma clareira porque a peça tem mais de uma zona de texto: a
     assinatura no alto e a manchete embaixo. Vale a MAIS protetora, não o
     produto — duas clareiras sobrepostas multiplicadas escavariam um buraco
     mais fundo do que qualquer uma das duas pede. */
  let m = 1;
  for (const c of cfg.clareira) m = Math.min(m, clareiraAt(u, v, ar, c));
  return d * m;
}

const DEFAULTS = {
  shape: 'disc',
  cell: 4,           /* px lógicos por célula */
  ramp: [0.03, 1],   /* densidade [ruído, sinal] */
  angle: 0,
  curve: 1.35,       /* > 1 mantém a dispersão por mais tempo */
  seed: 7,
  jitter: 0.3,       /* deslocamento dentro da célula */
  color: null,       /* null = herda currentColor do canvas */
  background: null,  /* preenche o fundo antes de desenhar (útil ao exportar) */
  width: null,       /* força a largura em px lógicos, ignorando o layout */
  height: null,      /* idem para a altura — é o que permite exportar grande */
  scale: true,       /* partícula cresce com a densidade local */
  mirror: false,     /* rampa espelhada: denso no centro, disperso nas pontas */
  radial: false,     /* rampa radial: denso no miolo, disperso nas bordas */
  clareira: null,    /* região onde a densidade desaba, para o tipo sentar */
  tint: null,        /* nome de fonte: pinta cada célula com a cor da imagem */
  texture: 'grain',  /* grain (estocástica) | screen (Bayer) | halftone (ponto variável) */
  progress: 1,       /* 0..1 para animar a resolução */
  opts: null,        /* parâmetros do campo */
};

/**
 * Desenha o grafismo de partículas num <canvas>.
 * @param {HTMLCanvasElement} canvas
 * @param {object} config  ver DEFAULTS
 */
export function render(canvas, config = {}) {
  const cfg = { ...DEFAULTS, ...config };
  const ctx = canvas.getContext('2d');
  /* Com width/height explícitos o canvas é desenhado no tamanho pedido em vez
     do tamanho de layout — é o caminho de exportação em alta resolução. Nesse
     caso não há dpr a aplicar: os pixels pedidos já são os pixels finais. */
  const forced = cfg.width != null && cfg.height != null;
  const dpr = forced ? 1 : Math.min(window.devicePixelRatio || 1, 2);
  const w = forced ? cfg.width : (canvas.clientWidth || 640);
  const h = forced ? cfg.height : (canvas.clientHeight || 240);
  if (!w || !h) return;

  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  if (cfg.background) {
    ctx.fillStyle = cfg.background;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.fillStyle =
    cfg.color || getComputedStyle(canvas).getPropertyValue('color').trim() || '#fff';

  const field =
    typeof cfg.shape === 'function'
      ? cfg.shape
      : (fields[cfg.shape] || fields.disc)(cfg.opts || {});

  const ar = h / w;                       /* v vai de 0 a ar */
  const cor = cfg.tint ? corDaFonte(cfg.tint, ar) : null;
  const cell = Math.max(2, cfg.cell);
  const cols = Math.ceil(w / cell);
  const rows = Math.ceil(h / cell);
  const [from, to] = cfg.ramp;
  const p = clamp01(cfg.progress);
  const rampCfg = {
    from, to, angle: cfg.angle, curve: cfg.curve,
    mirror: cfg.mirror, radial: cfg.radial,
    clareira: cfg.clareira
      ? [].concat(cfg.clareira).map((c) => ({ ...CLAREIRA, ...c }))
      : null,
  };

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const u = ((i + 0.5) * cell) / w;
      const v = ((j + 0.5) * cell) / w;   /* mesma escala de u: preserva proporção */
      const cov = field(u, v, ar);
      if (cov <= 0) continue;

      let d = cov * rampAt(u, v, ar, rampCfg);
      /* Revelação: uma frente de onda atravessa o eixo da rampa, resolvendo
         primeiro a ponta densa (sinal) e depois a dispersa (ruído). */
      if (p < 1) {
        const BAND = 0.55;
        const behind = 1 - rampPos(u, v, ar, rampCfg);
        d *= clamp01((p - behind * BAND) / (1 - BAND));
      }
      if (d <= 0) continue;

      /* Meio-tom: a célula sempre existe, o que varia é o tamanho do ponto.
         Trama de impressão, sem ruído — o oposto do grão estocástico. */
      if (cfg.texture === 'halftone') {
        const side = cell * Math.sqrt(clamp01(d)) * 1.05;
        if (side < 0.4) continue;
        const off = (cell - side) / 2;
        ctx.fillRect(i * cell + off, j * cell + off, side, side);
        continue;
      }

      /* Trama ordenada (Bayer) ou grão estocástico: os dois decidem
         presença/ausência, mas um é regular e o outro é aleatório. */
      const threshold = cfg.texture === 'screen'
        ? BAYER[j & 7][i & 7]
        : hash(i, j, cfg.seed);
      if (threshold >= d) continue;

      /* Cor por célula. Existe para ser JULGADA, não para ser usada: com cor,
         deixa de ser possível distinguir "menos partícula" de "partícula mais
         escura", e a marca tem um canal semântico só — densidade é nível.
         Também custa uma troca de estado por célula, contra um fillStyle
         atribuído uma vez para o desenho inteiro. */
      if (cor) {
        const mx = Math.min(cor.mw - 1, (u * cor.mw) | 0);
        const my = Math.min(cor.mh - 1, ((v / ar) * cor.mh) | 0);
        const k = (my * cor.mw + mx) * 3;
        ctx.fillStyle = `rgb(${cor.rgb[k]},${cor.rgb[k + 1]},${cor.rgb[k + 2]})`;
      }

      const size = cfg.scale
        ? Math.max(1, cell * (0.5 + 0.5 * clamp01(d)))
        : Math.max(1, cell * 0.8);
      /* A trama ordenada não recebe jitter: o que a define é o alinhamento. */
      const jit = cfg.texture === 'screen' ? 0 : cfg.jitter;
      const jx = (hash(i, j, cfg.seed + 11) - 0.5) * jit * cell;
      const jy = (hash(i, j, cfg.seed + 23) - 0.5) * jit * cell;
      ctx.fillRect(i * cell + jx, j * cell + jy, size, size);
    }
  }
}

/** Anima a resolução de ruído → forma uma única vez. */
export function resolve(canvas, config = {}, duration = 1600) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return render(canvas, { ...config, progress: 1 });
  }
  const t0 = performance.now();
  const step = (now) => {
    const t = clamp01((now - t0) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    render(canvas, { ...config, progress: eased });
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* --- Bootstrap declarativo ----------------------------------------------- */
const num = (s, f) => (s == null || s === '' ? f : Number(s));

function configFromEl(el) {
  const d = el.dataset;
  return {
    shape: d.cmcDither || 'disc',
    cell: num(d.cell, DEFAULTS.cell),
    ramp: d.ramp ? d.ramp.split(',').map(Number) : DEFAULTS.ramp,
    angle: num(d.angle, DEFAULTS.angle),
    curve: num(d.curve, DEFAULTS.curve),
    seed: num(d.seed, DEFAULTS.seed),
    jitter: num(d.jitter, DEFAULTS.jitter),
    mirror: d.mirror === 'true',
    radial: d.radial === 'true',
    texture: d.texture || DEFAULTS.texture,
    clareira: d.clareira ? JSON.parse(d.clareira) : DEFAULTS.clareira,
    tint: d.tint || DEFAULTS.tint,
    opts: d.opts ? JSON.parse(d.opts) : null,
  };
}

/**
 * Ativa todos os `[data-cmc-dither]` do documento: desenha ao entrar na tela,
 * redesenha ao redimensionar.
 */
export function init(root = document) {
  const nodes = [...root.querySelectorAll('canvas[data-cmc-dither]')];
  if (!nodes.length) return;

  /* O campo `text` mede a fonte para se ajustar. Antes de a Inter Tight
     carregar, a medição sai da fonte de fallback e o grafismo nasce torto —
     então redesenha o que já foi desenhado assim que as fontes ficam prontas. */
  document.fonts?.ready.then(() => {
    nodes.forEach((n) => n.dataset.cmcDone && render(n, configFromEl(n)));
  });

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting || e.target.dataset.cmcDone) continue;
      e.target.dataset.cmcDone = '1';
      resolve(e.target, configFromEl(e.target),
        num(e.target.dataset.duration, 1600));
    }
  }, { rootMargin: '80px' });

  nodes.forEach((n) => io.observe(n));

  let raf;
  addEventListener('resize', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() =>
      nodes.forEach((n) => n.dataset.cmcDone && render(n, configFromEl(n)))
    );
  });
}

if (typeof document !== 'undefined') {
  document.readyState === 'loading'
    ? addEventListener('DOMContentLoaded', () => init())
    : init();
}
