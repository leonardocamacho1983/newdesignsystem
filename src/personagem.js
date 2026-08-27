/* ==========================================================================
   O personagem — um só, em quatro posturas

   Extraído de direcao-bananamilk.html, onde ele nasceu como um dos doze
   registros da faixa de direção de arte. Vira módulo porque três cenas do
   assessment precisam dele e uma cópia em cada seria a divergência que este
   repositório passa o tempo todo evitando.

   O que muda entre as posturas é SÓ o ângulo das pernas e a inclinação do
   corpo. Se mudasse o desenho, seriam quatro personagens e não um — e a
   promessa da faixa era exatamente essa: um personagem que muda de postura
   conforme a capacidade.

   --- Onde ele aparece, e o que a ausência significa ----------------------

   Por ASSUNTO, não por ato: só onde a capacidade do cliente é o que está em
   jogo. São três momentos no deck inteiro — cena 10 (o último degrau da
   escada), cena 17 (o fecho da travessia) e cena 23 (a decisão). A lista viva
   em PERSONAGEM_EM, em src/deck23.js.

   Fora daí ele não existe, e a ausência quer dizer que ainda não há quem
   dirija. É a regra mais fácil de quebrar "só nesse caso", e por isso a
   conferência é automática.
   ========================================================================== */

/** As quatro posturas, na ordem em que a capacidade cresce. */
export const POSTURAS = {
  parado:     { giro: 0,   perna: [3, -3] },
  olhando:    { giro: -4,  perna: [10, -6] },
  andando:    { giro: -10, perna: [22, -14] },
  conduzindo: { giro: -14, perna: [30, -20], prancha: true },
};

/* As cores da embalagem. Vivem aqui e não em tokens/: a fundação do Camacho é
   monocromática, e o personagem é do cliente.

   --- E por isso ele tem duas versões ------------------------------------

   As três cenas em que ele aparece — 10, 17 e 23 — são todas de registro
   `camacho`: método, capacidade, decisão. Um boneco amarelo com sapato branco
   numa tela dessas é exatamente o vazamento que a regra dos dois registros
   existe para impedir, e foi o que apareceu na primeira leitura.

   Em `camacho` ele vira traço: sem preenchimento, tudo em currentColor, e por
   isso funciona igual no papel e no escuro. A cor volta inteira se ele algum
   dia entrar numa cena do cliente. */
const AMARELO = '#EFBE2E', PRETO = '#171717', BRANCO = '#FFFFFF';

/**
 * O corpo do personagem, como fragmento SVG — sem `<svg>` em volta, para poder
 * entrar tanto numa peça inteira quanto dentro do `<g>` de um diagrama.
 * A caixa útil é `viewBox="20 10 180 245"`.
 */
export function personagem({ giro = 0, perna = [8, -8], prancha = false, mono = true } = {}) {
  const corpo = mono ? 'none' : AMARELO;
  const tinta = mono ? 'currentColor' : PRETO;
  const sola  = mono ? 'none' : BRANCO;
  const roda  = mono ? 'none' : AMARELO;
  const traco = mono ? ' stroke="currentColor" stroke-width="5"' : '';
  return `
  <g transform="translate(100 46) rotate(${giro})">
    <path d="M 4 0 C -16 26 -20 74 -6 108 L 40 108 C 46 70 36 26 22 0 Z" fill="${corpo}"${traco}/>
    <path d="M 4 0 L 12 -14" stroke="${tinta}" stroke-width="9" stroke-linecap="round"/>
    <circle cx="6"  cy="40" r="3.4" fill="${tinta}"/>
    <circle cx="24" cy="38" r="3.4" fill="${tinta}"/>
    <path d="M 6 52 Q 15 60 26 50" fill="none" stroke="${tinta}"
          stroke-width="3" stroke-linecap="round"/>
  </g>
  <g stroke="${tinta}" stroke-width="${mono ? 8 : 17}" stroke-linecap="round" fill="none">
    <path d="M 104 150 L ${104 + perna[0]} 208"/>
    <path d="M 118 150 L ${118 + perna[1]} 208"/>
  </g>
  <g fill="${sola}" stroke="${tinta}" stroke-width="3">
    <ellipse cx="${104 + perna[0] + 4}" cy="212" rx="15" ry="7"/>
    <ellipse cx="${118 + perna[1] + 4}" cy="212" rx="15" ry="7"/>
  </g>
  ${prancha ? `
    <path d="M 62 226 L 168 226" stroke="${tinta}" stroke-width="5" stroke-linecap="round"/>
    <circle cx="82"  cy="234" r="6" fill="${roda}" stroke="${tinta}" stroke-width="3"/>
    <circle cx="148" cy="234" r="6" fill="${roda}" stroke="${tinta}" stroke-width="3"/>` : ''}`;
}

/**
 * O personagem numa peça sozinha, pronto para entrar no HTML de uma cena.
 * `postura` é uma chave de POSTURAS; `alt` é a altura em cqi.
 *
 * Entra sempre por beat: quem chama passa `b`, e o CSS de `.dg`/`[data-beat]`
 * cuida do estado. Ele nunca aparece junto com a manchete — chega no fecho.
 */
export function figura(postura = 'parado', { alt = 22, b = null, rot = '', mono = true } = {}) {
  const p = { ...(POSTURAS[postura] || POSTURAS.parado), mono };
  return `<div class="dk__figura" style="--fig:${alt}cqi"`
    + (b != null ? ` data-beat="${b}"` : '') + `>`
    + `<svg viewBox="20 10 180 245" role="img" aria-label="${rot || 'Quem conduz a operação'}">`
    + personagem(p) + `</svg></div>`;
}
