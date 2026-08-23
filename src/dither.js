/* ==========================================================================
   Cadrian — Dither Engine
   --------------------------------------------------------------------------
   Todo grafismo da marca é a mesma ideia: uma FORMA amostrada por uma GRADE
   de partículas quadradas, cuja probabilidade de existir varia ao longo de
   uma RAMPA. Ruído de um lado, sinal do outro. É a tese da empresa desenhada.

   Uso declarativo:
     <canvas data-cdr-dither="ring" data-ramp="0.02,1" data-angle="0"></canvas>

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

/* --- Campos de forma -----------------------------------------------------
   Cada campo é f(u, v) -> cobertura 0..1, em espaço normalizado onde
   u ∈ [0,1] e v é corrigido pela proporção (v ∈ [0, h/w]). */
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
  text: ({ text = 'Cadrian', weight = 300, tracking = '-0.04em', fit = 0.92,
           lineHeight = 0.98 } = {}) => {
    let mask = null, mw = 0, mh = 0, builtFor = -1;

    const build = (ar) => {
      const W = 900, H = Math.max(1, Math.round(W * ar));
      const c = document.createElement('canvas');
      c.width = W; c.height = H;
      const x = c.getContext('2d', { willReadFrequently: true });
      const rows = String(text).split('\n');
      const setFont = (px) => {
        x.font = `${weight} ${px}px "Inter Tight", "Inter", sans-serif`;
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
      mask = new Uint8Array(W * H);
      for (let k = 0; k < mask.length; k++) mask[k] = data[k * 4 + 3];
      mw = W; mh = H; builtFor = ar;
    };

    return (u, v, ar) => {
      if (builtFor !== ar) build(ar);
      const x = (u * mw) | 0, y = ((v / ar) * mh) | 0;
      if (x < 0 || x >= mw || y < 0 || y >= mh) return 0;
      return mask[y * mw + x] / 255;
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

  /* Grafismo-âncora: anel de ruído + disco de sinal, lado a lado. */
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

function rampAt(u, v, ar, cfg) {
  return cfg.from + (cfg.to - cfg.from) * Math.pow(rampPos(u, v, ar, cfg), cfg.curve);
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
  const cell = Math.max(2, cfg.cell);
  const cols = Math.ceil(w / cell);
  const rows = Math.ceil(h / cell);
  const [from, to] = cfg.ramp;
  const p = clamp01(cfg.progress);
  const rampCfg = {
    from, to, angle: cfg.angle, curve: cfg.curve,
    mirror: cfg.mirror, radial: cfg.radial,
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
    shape: d.cdrDither || 'disc',
    cell: num(d.cell, DEFAULTS.cell),
    ramp: d.ramp ? d.ramp.split(',').map(Number) : DEFAULTS.ramp,
    angle: num(d.angle, DEFAULTS.angle),
    curve: num(d.curve, DEFAULTS.curve),
    seed: num(d.seed, DEFAULTS.seed),
    jitter: num(d.jitter, DEFAULTS.jitter),
    mirror: d.mirror === 'true',
    radial: d.radial === 'true',
    texture: d.texture || DEFAULTS.texture,
    opts: d.opts ? JSON.parse(d.opts) : null,
  };
}

/**
 * Ativa todos os `[data-cdr-dither]` do documento: desenha ao entrar na tela,
 * redesenha ao redimensionar.
 */
export function init(root = document) {
  const nodes = [...root.querySelectorAll('canvas[data-cdr-dither]')];
  if (!nodes.length) return;

  /* O campo `text` mede a fonte para se ajustar. Antes de a Inter Tight
     carregar, a medição sai da fonte de fallback e o grafismo nasce torto —
     então redesenha o que já foi desenhado assim que as fontes ficam prontas. */
  document.fonts?.ready.then(() => {
    nodes.forEach((n) => n.dataset.cdrDone && render(n, configFromEl(n)));
  });

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting || e.target.dataset.cdrDone) continue;
      e.target.dataset.cdrDone = '1';
      resolve(e.target, configFromEl(e.target),
        num(e.target.dataset.duration, 1600));
    }
  }, { rootMargin: '80px' });

  nodes.forEach((n) => io.observe(n));

  let raf;
  addEventListener('resize', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() =>
      nodes.forEach((n) => n.dataset.cdrDone && render(n, configFromEl(n)))
    );
  });
}

if (typeof document !== 'undefined') {
  document.readyState === 'loading'
    ? addEventListener('DOMContentLoaded', () => init())
    : init();
}
