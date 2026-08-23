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
  chevrons: ({ n = 3, gap = 0.02, soft = 0.012 } = {}) => (u, v, ar) => {
    const span = (1 - gap * (n - 1)) / n;
    for (let i = 0; i < n; i++) {
      const t = (u - i * (span + gap)) / span;
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
  layers: ({ n = 3, rx = 0.3, soft = 0.014 } = {}) => (u, v, ar) => {
    const ry = ar * 0.11, gap = ar * 0.34;
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

function rampAt(u, v, ar, { from, to, angle, curve, mirror }) {
  let t = axis(u, v, ar, angle);
  /* mirror: pico no centro do eixo, dispersando para os dois lados */
  if (mirror) t = 1 - Math.abs(t * 2 - 1);
  return from + (to - from) * Math.pow(t, curve);
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
  scale: true,       /* partícula cresce com a densidade local */
  mirror: false,     /* rampa espelhada: denso no centro, disperso nas pontas */
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
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth || 640;
  const h = canvas.clientHeight || 240;
  if (!w || !h) return;

  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
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

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const u = ((i + 0.5) * cell) / w;
      const v = ((j + 0.5) * cell) / w;   /* mesma escala de u: preserva proporção */
      const cov = field(u, v, ar);
      if (cov <= 0) continue;

      let d = cov * rampAt(u, v, ar,
        { from, to, angle: cfg.angle, curve: cfg.curve, mirror: cfg.mirror });
      /* Revelação: uma frente de onda atravessa o eixo da rampa, resolvendo
         primeiro a ponta densa (sinal) e depois a dispersa (ruído). */
      if (p < 1) {
        const BAND = 0.55;
        const behind = 1 - axis(u, v, ar, cfg.angle);
        d *= clamp01((p - behind * BAND) / (1 - BAND));
      }

      const r = hash(i, j, cfg.seed);
      if (r >= d) continue;

      const size = cfg.scale
        ? Math.max(1, cell * (0.5 + 0.5 * clamp01(d)))
        : Math.max(1, cell * 0.8);
      const jx = (hash(i, j, cfg.seed + 11) - 0.5) * cfg.jitter * cell;
      const jy = (hash(i, j, cfg.seed + 23) - 0.5) * cfg.jitter * cell;
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
