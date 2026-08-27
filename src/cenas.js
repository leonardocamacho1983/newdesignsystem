/* ==========================================================================
   IA Assessment · Banana Milk — de cena a tela

   `src/deck23.js` diz O QUE cada cena argumenta. Este arquivo diz COMO ela
   aparece: quais painéis, qual arte, qual modo de palco, qual acento. A
   separação é a mesma de kv.js e existe pela mesma razão — HTML escrito à mão
   para 23 cenas divergiria do conteúdo no primeiro ajuste, e em silêncio.

   --- Duas montagens, e a escolha é por argumento -------------------------

   `troca`   — os painéis TROCAM: cada beat mostra um painel e esconde o
               anterior. É para quando cada beat é uma coisa diferente.
   `constroi`— um painel só, sempre visível, e o que revela por beat são os
               elementos dentro dele (`data-beat`, `data-beat-so`). É para
               quando a lista É o argumento se acumulando, e para os diagramas,
               em que o beat é o desenho se construindo.

   `troca` não é gosto: com painéis empilhados, 22 das 23 cenas da versão
   anterior transbordavam o 16:9, algumas por 700px num espaço de 419.

   --- A regra dos dois registros, aplicada por construção -----------------

   O acento é lido AQUI e só existe quando `registro === 'cliente'`. Não é uma
   convenção que alguém precisa lembrar: uma cena `camacho` não tem por onde
   receber cor, porque a função que devolve o acento devolve null para ela.
   ========================================================================== */
import { ACENTOS, PERSONAGEM_EM } from './deck23.js';
import { exclusao, escada, nucleo, nucleoInvertido, quadrante, comparacao } from './diagramas.js';
import { figura } from './personagem.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const li = (x, a = '') => `<li ${a}>${esc(x)}</li>`;

/* O acento de cada cena do cliente. Um por cena, dos quatro da embalagem —
   índice, não decoração: a mesma cor não reaparece em duas cenas seguidas. */
const ACENTO_DA_CENA = {
  2: ACENTOS.coral, 3: ACENTOS.azul, 4: ACENTOS.coral,
  5: ACENTOS.cacau, 6: ACENTOS.amarelo, 7: ACENTOS.azul,
};

/** Cor da cena, ou null. Cena `camacho` não tem por onde receber cor. */
export function acentoDe(c) {
  return c.registro === 'cliente' ? (ACENTO_DA_CENA[c.n] || null) : null;
}

/* ==========================================================================
   Arte — só três cenas têm canvas
   --------------------------------------------------------------------------
   E é decisão, não economia. O motor é o registro do diagnóstico; ligá-lo em
   todas as cenas transformaria a peça no que você já criticou uma vez — o
   mesmo grafismo cinza repetido. Ele entra onde a arte É o argumento: a
   costura que resolve (1), o erro de registro (4) e o vão temporal (7).
   ========================================================================== */
const ARTE = {
  /* A costura resolvendo. A clareira é declarada e é dela que sai --cl: o tipo
     não passa da borda do clarão, em vez de flutuar sobre a arte. */
  1: {
    base: { shape: 'weave', ramp: [0.03, 0.5], cell: 4, seed: 7,
            /* w 0.70 e nao 0.60: --cl sai daqui, e com 0.60 a manchete da capa
               quebrava em quatro linhas, ocupava 369px dos 412 do meio e
               deixava 11px para o painel. A clareira dimensiona o tipo.
               A altura tambem importa: com h 0.74 o clarao cobria quase o
               quadro inteiro e a costura virava um borrao no canto. Ela ocupa a
               metade de baixo, que e onde ha o que ver. */
            clareira: [{ x: 0.04, y: 0.04, w: 0.70, h: 0.44, soft: 0.10, piso: 0.03 }] },
    beats: { 1: { ramp: [0.03, 1] } },
  },
  /* Erro de registro de impressão: a mesma palavra composta com ela mesma,
     fora de registro, convergindo para zero. `deslocar` entrou no motor para
     isto — "integrar significados", desenhado em vez de dito. */
  4: {
    base: { shape: 'compor', ramp: [1, 1], cell: 3, seed: 11, texture: 'screen',
            opts: { modo: 'max',
                    a: { shape: 'text', opts: { text: 'receita', fit: 0.78 }, desloca: [-0.018, -0.012] },
                    b: { shape: 'text', opts: { text: 'receita', fit: 0.78 }, desloca: [0.018, 0.012] } } },
    beats: {
      1: { opts: { a: { shape: 'text', opts: { text: 'receita', fit: 0.78 }, desloca: [-0.008, -0.005] },
                   b: { shape: 'text', opts: { text: 'receita', fit: 0.78 }, desloca: [0.008, 0.005] } } },
      2: { opts: { a: { shape: 'text', opts: { text: 'receita', fit: 0.78 }, desloca: [0, 0] },
                   b: { shape: 'text', opts: { text: 'receita', fit: 0.78 }, desloca: [0, 0] } } },
    },
  },
  /* O vão entre o fato e a ação. ramp [1,1] e não [0,1]: a rampa global
     multiplicaria o gradiente do próprio campo e o argumento sumiria — bonito
     e mudo, que é a pior forma de errar. */
  7: {
    base: { shape: 'intervalo', ramp: [1, 1], cell: 4, seed: 7,
            opts: { vaos: [[0.10, 0.92]], marcas: [[0.10]], alt: 0.5 } },
    beats: {
      1: { opts: { vaos: [[0.10, 0.92]], marcas: [[0.10, 0.34, 0.58, 0.92]], alt: 0.5 } },
      2: { opts: { vaos: [[0.10, 0.92]], marcas: [[0.10, 0.34, 0.58, 0.76, 0.92]], alt: 0.5 } },
    },
  },
};

/**
 * A arte da cena num beat, como estado ABSOLUTO e não delta.
 * É o que faz voltar um passo, `End`, redimensionar e imprimir desenharem
 * certo sem replay de animação nenhuma.
 */
export function arteNoBeat(c, k) {
  const a = ARTE[c.n];
  if (!a) return null;
  let cfg = { ...a.base };
  for (let i = 1; i <= k; i++) {
    const b = a.beats[i];
    if (b) cfg = { ...cfg, ...b, opts: { ...cfg.opts, ...(b.opts || {}) } };
  }
  return cfg;
}

/** O modo de palco de cada cena. Sai do que ela guarda, não do gosto. */
export function modoDe(c) {
  if (DIAGRAMA.has(c.dispositivo)) return 'matriz';
  if (c.n === 1) return 'sangria';
  if (c.n === 7) return 'pe';
  if (c.n === 4) return 'faixa';
  return 'borda';
}

const DIAGRAMA = new Set(['exclusao', 'escada', 'nucleo', 'nucleo-invertido',
                          'quadrante', 'quadrante-cheio', 'comparacao', 'assentamento']);

/** `constroi` para diagrama e para lista que se acumula; `troca` no resto. */
/* 22 saiu daqui: o assentamento, o valor e as nove inclusoes nao cabem num
   painel so — a lista crescia e espremia o desenho ate virar um fio. Sao tres
   coisas diferentes e a cena tem tres beats. Que sejam dois paineis. */
const CONSTROI = new Set([5, 10, 11, 13, 14, 15, 17, 19, 20, 21]);
export const montagemDe = (c) => (CONSTROI.has(c.n) ? 'constroi' : 'troca');

/* --- blocos ---------------------------------------------------------------- */
/* A margem do olho e 0.8cqi e nao 1.4: no modo `pe` o painel tem 117px de
   altura util, e 22px de margem eram a diferenca entre caber e transbordar. */
const lista = (xs, cols = 2, olho = '') =>
  (olho ? `<p class="dk__olho" style="margin-bottom:0.8cqi">${esc(olho)}</p>` : '')
  + `<ul class="dk__lista" style="--cols:${cols}">${xs.map((x) => li(x)).join('')}</ul>`;

const passos = (xs, olho = '') =>
  (olho ? `<p class="dk__olho" style="margin-bottom:0.8cqi">${esc(olho)}</p>` : '')
  + `<ol class="dk__passos" style="--cols:${xs.length > 5 ? 2 : 1}">${xs.map((x) => li(x)).join('')}</ol>`;

const fecho = (t) => `<p class="dk__fecho">${esc(t)}</p>`;

const tabela = (t, porBeat = false) =>
  `<table class="dk__tab"><thead><tr>${t.cols.map((x) => `<th>${esc(x)}</th>`).join('')}</tr></thead>`
  + `<tbody>${t.linhas.map((l, i) => `<tr>${l.map((x) =>
      `<td${porBeat ? ` data-beat="${i + 1}"` : ''}>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;

const blocos = (pares, cols = 2) =>
  `<div class="dk__blocos" style="--cols:${cols}">` + pares.map(([h, t], i) =>
    `<div class="dk__bloco"><h4>${String(i + 1).padStart(2, '0')} · ${esc(h)}</h4><p>${esc(t)}</p></div>`).join('')
  + '</div>';

const valor = (v, rot) => `<div class="dk__valor"><span>${esc(rot)}</span><b>${esc(v)}</b></div>`;

/* ==========================================================================
   Os dezenove dispositivos
   ========================================================================== */
const DISPOSITIVOS = {

  /* 01 — Capa. A costura resolve e os dois nomes assentam. */
  /* O nome do cliente sai do slot, nao do texto: `pe` traz "Banana Milk ·
     Agosto de 2026" e o slot ja diz Banana Milk — juntos, a capa dizia o nome
     duas vezes seguidas. Quando o logotipo vetorial chegar em cliente/, ele
     entra no slot e a data continua onde esta. */
  weave: (c) => [`<div class="dk__capa-pe">
      <span class="dk__lockup-slot" data-slot="lockup">Banana&nbsp;Milk</span>
      <span>${esc(c.pe.split('·').pop().trim())}</span></div>`],

  /* 02 — A citação recua: o valor não está no pedido, está no que ele quer dizer. */
  recuo: (c) => [
    `<blockquote class="dk__cita"><p>“${esc(c.citacao)}”</p><cite>${esc(c.citacaoDe)}</cite></blockquote>`,
    `<blockquote class="dk__cita dk__cita--peq" style="margin-bottom:2.4cqi">
       <p>“${esc(c.citacao)}”</p></blockquote>` + lista(c.lista, 2, c.listaOlho),
  ],

  /* 03 — Os seis ambientes entram e NADA os liga. A ausência é o argumento. */
  soltos: (c) => [
    `<div class="dk__nums" style="--cols:3">` + c.numeros.map(([n, r]) =>
      `<div class="dk__num"><b>${esc(n)}</b><span>${esc(r)}</span></div>`).join('') + '</div>',
    lista(c.ambientes, 3, 'Onde a informação vive hoje') + fecho(c.fecho),
  ],

  /* 04 — Se o conceito muda, o número muda. */
  /* Lista e não tabela. Em `faixa` o tipo tem 62% da largura, e uma tabela de
     duas colunas ali quebra cada célula em duas linhas: media 14px de
     transbordo com --cp já no piso. São seis ambiguidades, não uma matriz —
     "Volume — unidade, pack ou caixa?" cabe numa linha e diz o mesmo. */
  desregistro: (c) => [
    lista(c.tabela.linhas.map(([a, b]) => `${a} — ${b.toLowerCase()}`), 1, c.tabela.cols.join(' · ')),
    fecho(c.fecho)],

  /* 06 — Quatro dimensões travam num bloco: o objeto é o SKU dentro de uma condição. */
  chave: (c) => [
    `<ul class="dk__chave">` + c.chave.map((x, i) =>
      (i ? '<span class="dk__chave__mais">+</span>' : '')
      + `<li data-acento style="--ac:var(--slide-acento)">${esc(x)}</li>`).join('') + '</ul>',
    `<ul class="dk__cadeia">` + c.cadeia.map((x) => li(x)).join('') + '</ul>'
      + `<p class="dk__fecho" style="margin-top:2cqi">= ${esc(c.resultado)}</p>`,
  ],

  /* 07 — O vão entre o fato e a ação. */
  /* Três colunas: o modo `pe` reserva 15cqi para o eixo de tempo embaixo, e
     seis itens em duas colunas transbordavam 25px com --cp no piso. */
  /* Sem olho dentro do painel: o modo `pe` reserva 15cqi para o eixo de tempo
     e sobram 117px de altura util. O olho custava 41px deles, e ele tem lugar
     proprio — a linha de cima da cena, que existe exatamente para isso. */
  vao: (c) => [lista(c.lista, 3), fecho(c.fecho)],

  /* 08 — Agent Readiness. Estados qualitativos, e por isso SEM medidor: um
     gauge aqui prometeria uma medição que o assessment não fez. */
  estados: (c) => [tabela(c.tabela, true), fecho(c.fecho)],

  /* 09 — Cada definição ocupa a tela sozinha. */
  termos: (c) => c.termos.map(([t, d]) =>
    `<div class="dk__cita"><cite>${esc(t)}</cite><p style="font-size:calc(3.4cqi * var(--cp,1))">${esc(d)}</p></div>`),

  /* 12 — Primeira entrega. */
  passos: (c) => [passos(c.passos, c.olho), fecho(c.fecho)],

  /* 13 — Só as perguntas. A última sobe de peso: é ela que separa um chatbot
     de uma capacidade gerencial. */
  perguntas: (c) => [
    `<ul class="dk__lista" style="--cols:2">` + c.perguntas.map((x, i) =>
      li(x, `data-beat="${Math.min(3, Math.ceil((i + 1) / 3))}"`
        + (i === c.perguntas.length - 1 ? ' style="font-size:calc(2.7cqi * var(--cp,1))"' : ''))).join('')
    + '</ul>' + `<p class="dk__fecho" data-beat="3" style="margin-top:2cqi">${esc(c.fecho)}</p>`],

  /* 16 — Nem tudo que gera valor deve começar agora. */
  criterios: (c) => [
    lista(c.criterios, 2, c.olho),
    `<p class="dk__fecho">${esc(c.recomendacao)}</p>`
      + `<p class="dk__fecho" style="margin-top:1.6cqi;opacity:.62">${esc(c.fecho)}</p>`,
  ],

  /* 17 — A travessia. Não é tabela de duas colunas: a seta é o conteúdo, e uma
     tabela diria "os dois estados coexistem", que é o contrário da fala. */
  travessia: (c) => [
    `<ul class="dk__travessia">` + c.tabela.linhas.map(([a, b], i) =>
      `<li data-beat="${Math.min(2, Math.ceil((i + 1) / 3))}">`
      + `<span>${esc(a)}</span><i>→</i><span>${esc(b)}</span></li>`).join('') + '</ul>'
    + `<div style="display:flex;align-items:flex-end;justify-content:space-between;gap:3cqi;margin-top:1.2cqi">`
    + `<p class="dk__fecho" data-beat="3">${esc(c.fecho)}</p>`
    + figura('andando', { alt: 9, b: 3, rot: 'Quem passa a conduzir a operação' })
    + `</div>`],

  /* 18 — O ativo permanece. A frase final fica SOZINHA: é a que diz que a
     Banana Milk não sai daqui dependente de mim. */
  entregas: (c) => [lista(c.entregas, 3, c.olho), fecho(c.fecho)],

  /* 21 — Três níveis, sem pré-destaque. Se a recomendação já estiver marcada
     aqui, a cena 22 não tem o que fazer. */
  niveis: (c) => [
    `<div class="dk__niveis">` + c.niveis.map((n, i) =>
      `<div data-beat="${i + 1}"><h4>${esc(n.nome)}</h4><b>${esc(n.mes)}</b>`
      + `<span>${esc(n.ano)} por ano</span><span>${esc(n.ded)}</span><span>${esc(n.papel)}</span></div>`).join('')
    + '</div>'],

  /* 23 — Tudo limpa. A frase final fica sozinha; no último beat, as duas marcas. */
  fecho: (c) => [
    passos(c.passos, c.olho),
    `<p class="dk__fecho" style="font-size:calc(3.2cqi * var(--cp,1))">${esc(c.fecho)}</p>`,
    `<div style="display:flex;align-items:flex-end;justify-content:space-between;gap:4cqi">
       <div class="dk__valor"><span>Camacho · Banana Milk</span><b style="font-size:3.4cqi">Clareza é vantagem.</b></div>`
      + figura('conduzindo', { alt: 16, rot: 'Quem conduz a operação daqui em diante' }) + `</div>`,
  ],

  /* --- os oito diagramas: um painel só, e o beat é o desenho se construindo */
  exclusao: (c) => [exclusao(c, 'exc')],
  escada: (c) => [escada(c.degraus, 'esc')
    + `<div class="dk__legenda">` + c.degraus.map(([, d], i) =>
        `<p data-beat-so="${i + 1}">${esc(d)}</p>`).join('')
    + `<p data-beat-so="6">${esc(c.faixa)}</p></div>`],
  nucleo: (c) => [nucleo(c.tabela.linhas, 'nuc')],
  'nucleo-invertido': (c) => [nucleoInvertido(c.frentes, c.valor, c.valorRot, c.nota, 'nvi')],
  quadrante: (c) => [quadrante(c, 'qd')],
  'quadrante-cheio': (c, todas) => [quadrante(todas.find((x) => x.n === 14), 'qdc', c.portfolio)],
  comparacao: (c) => [comparacao(c.caminhos, c.fecho, 'cmp')],
  /* 22 — O assentamento. Índice 2 e não 1: a recomendada é "Programa
     integrado", a terceira linha. "A do meio" é a coluna do meio da tabela de
     níveis da cena 21, que é outro objeto. */
  /* O desenho assentado e o argumento; o valor e a legenda dele. Na primeira
     montagem o valor tinha 6.4cqi e a comparacao ficava do tamanho de uma nota
     de rodape — o slide dizia "R$ 20 mil" e escondia por que. */
  assentamento: (c, todas) => [
    /* O gesto sozinho: a coluna do meio ganha peso e as outras recuam. E o
       unico momento de enfase do Ato 3, e ele nao divide a tela com nada. */
    comparacao(todas.find((x) => x.n === 20).caminhos, '', 'ass', 2),
    /* Depois, o que isso e e o que inclui. */
    `<div class="dk__assenta-pe">`
    + `<div class="dk__valor"><span>A opção recomendada</span><b>${esc(c.valor)}</b></div>`
    + lista(c.inclui, 3, 'O que inclui') + `</div>`],
};

/** Os painéis de uma cena, na ordem dos beats. */
export function paineisDe(c, todas) {
  const f = DISPOSITIVOS[c.dispositivo];
  if (!f) throw new Error(`cena ${c.n}: dispositivo "${c.dispositivo}" não tem renderizador`);
  return f(c, todas);
}

/* --- Conferências, para a rodada poder reprovar sozinha -------------------- */

/** Todo dispositivo de deck23 tem renderizador aqui? */
export function dispositivosSemRenderizador(cenas) {
  return cenas.filter((c) => !DISPOSITIVOS[c.dispositivo]).map((c) => c.n);
}

/** O personagem só pode existir nas cenas de PERSONAGEM_EM. É a regra mais
    fácil de quebrar "só nesse caso", então ela é medida e não lembrada. */
export function personagemForaDeLugar(cenas) {
  return cenas.filter((c) => paineisDe(c, cenas).join('').includes('dk__figura')
                          && !PERSONAGEM_EM.includes(c.n)).map((c) => c.n);
}

/** Cor em cena `camacho` reprova a rodada.

    Cobre o acento E qualquer hexadecimal no HTML da cena. A primeira versao
    olhava so o acento e deixou passar o personagem, que chegava amarelo numa
    tela de registro `camacho` — cor entrando por um caminho que a conferencia
    nao vigiava. */
export function corIndevida(cenas) {
  return cenas.filter((c) => c.registro !== 'cliente'
    && (acentoDe(c) || /#[0-9A-Fa-f]{6}/.test(paineisDe(c, cenas).join('')))).map((c) => c.n);
}
