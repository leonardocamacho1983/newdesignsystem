/* ==========================================================================
   IA Assessment · Banana Milk — os cinco diagramas

   Cinco argumentos que o motor de partículas NÃO deve desenhar. Partícula é
   campo contínuo; estes cinco são discretos — pertencer, ordenar, ramificar,
   classificar, escolher. Passá-los pelo dither produziria de novo "o mesmo
   tipo de gráfico", que é exatamente a crítica que originou este arquivo.

   SVG escrito à mão: `viewBox`, `currentColor`, seta em `<defs><marker>`,
   texto entre 11 e 13px na escala desenhada. Sem `<script>`, sem `<style>` e
   sem `<foreignObject>` dentro do fragmento — os dois guards de autocontenção
   do build reprovam, e o fragmento precisa sobreviver a `innerHTML`.

   --- O beat é ATRIBUTO, não animação --------------------------------------

   Cada função emite o desenho INTEIRO, com `data-b` (o beat em que o elemento
   entra) e, quando some, `data-ate`. Quem muda o estado é `noBeat(raiz, b)`,
   que só troca classe. Assim o estado final é alcançável direto — voltar um
   passo, `End`, redimensionar, imprimir e `prefers-reduced-motion` passam
   todos pelo mesmo caminho.

   Isto é a correção do bug do `morf`, que só resolvia dentro de `anima()`: um
   desenho que só sabe se desenhar animando desenha errado em quatro situações
   que ninguém testa.
   ========================================================================== */

/* --- utilidades ---------------------------------------------------------- */

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** `data-b`/`data-ate` como string de atributo. `b` 1 é "desde o começo". */
const em = (b, ate) => `data-b="${b}"${ate ? ` data-ate="${ate}"` : ''}`;

/* O piso de opacidade dos rótulos de serviço, e ele é MEDIDO, não escolhido.

   Medindo o pixel composto: a mesma opacidade rende 6,27:1 no campo escuro e
   4,61:1 no campo papel. Tinta preta sobre claro perde contraste bem mais
   rápido do que tinta branca sobre preto, então o valor que parece discreto no
   escuro já sumiu no papel. Abaixo de 0,55 o rótulo de 11px cai para 2,8:1 —
   e ele carrega os números ordinais e os cabeçalhos de coluna.

   Fica como trava e não como convenção porque a próxima opacidade baixa vai
   ser escrita por hábito, num rótulo que ninguém vai medir de novo. */
const PISO_ROT = 0.55;

/** Rótulo mono, o tipo de serviço do desenho: eixo, legenda, nota. */
const rot = (x, y, txt, o = {}) => {
  const { anc = 'start', tam = 11, b = 1, ate = 0, gir = 0, cls = '' } = o;
  const op = Math.max(o.op ?? PISO_ROT, PISO_ROT);
  const g = gir ? ` transform="rotate(${gir} ${x} ${y})"` : '';
  return `<text x="${x}" y="${y}" class="dg__rot ${cls}" text-anchor="${anc}" font-size="${tam}"`
       + ` fill="currentColor" fill-opacity="${op}" ${em(b, ate)}${g}>${esc(txt)}</text>`;
};

/** Texto de conteúdo — nome de degrau, de célula, de caminho. */
const txt = (x, y, s, o = {}) => {
  const { anc = 'start', tam = 15, op = 1, b = 1, ate = 0, peso = 400, cls = '' } = o;
  return `<text x="${x}" y="${y}" class="dg__txt ${cls}" text-anchor="${anc}" font-size="${tam}"`
       + ` font-weight="${peso}" fill="currentColor" fill-opacity="${op}" ${em(b, ate)}>${esc(s)}</text>`;
};

/** Quebra em linhas de no máximo `max` caracteres. SVG não quebra texto
    sozinho, e um rótulo de três palavras dentro de uma caixa de 168px sai
    pela borda sem avisar — foi o que aconteceu com "adoção e desenvolvimento
    do time" na primeira rodada. */
const quebra = (s, max) => {
  const out = []; let linha = '';
  for (const w of String(s).split(' ')) {
    if (linha && (linha + ' ' + w).length > max) { out.push(linha); linha = w; }
    else linha = linha ? linha + ' ' + w : w;
  }
  if (linha) out.push(linha);
  return out;
};

/** A seta. Um marker por instância, porque o id é global no documento. */
const defsSeta = (id) => `<defs>`
  + `<marker id="${id}-s" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6"`
  + ` orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="currentColor"/></marker>`
  + `</defs>`;

const svg = (id, w, h, rotulo, corpo) =>
  `<svg class="dg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(rotulo)}"`
  + ` preserveAspectRatio="xMidYMid meet" data-dg="${id}">${defsSeta(id)}${corpo}</svg>`;

/**
 * Aplica o beat. Só troca classe: quem anima é o CSS da página.
 * Um elemento sem `data-b` é permanente — moldura, eixo, o que existe sempre.
 */
export function noBeat(raiz, beat) {
  if (!raiz) return;
  raiz.dataset.beat = String(beat);
  for (const el of raiz.querySelectorAll('[data-b]')) {
    const b = +el.dataset.b;
    const ate = +el.dataset.ate || Infinity;
    const on = beat >= b && beat <= ate;
    el.classList.toggle('dg--on', on);
    el.classList.toggle('dg--off', !on);
  }
}

/** Quantos beats cada diagrama tem. Confere contra `beats` em deck23.js. */
export const BEATS = {
  exclusao: 4, escada: 6, nucleo: 3, nucleoInvertido: 4,
  quadrante: 4, quadranteCheio: 5, comparacao: 3,
};

/* ==========================================================================
   1 · EXCLUSÃO — cena 5
   --------------------------------------------------------------------------
   O único risco de CORREÇÃO do deck. O texto diz que −R$ 636,8 mil e
   R$ 222,9 mil não podem ser somados nem subtraídos. Cascata, barra empilhada
   ou qualquer par de retângulos em escala comum sugerem soma.

   Por isso: colchetes (notação de conjunto), nenhum eixo, nenhuma escala,
   nenhum sinal de operação em lugar nenhum. A pergunta que a imagem faz é
   "dentro ou fora?".

   As quatro barras anônimas dentro do colchete são as linhas que FORAM
   classificadas. Não têm número e não têm rótulo individual, de propósito: o
   assessment não me deu esses valores e desenhar cinco linhas com cifras seria
   inventar dado. Elas existem só para o colchete ler como subtotal.
   ========================================================================== */

export function exclusao(d, id = 'exc') {
  const W = 720, H = 430;
  const L = 60, R = 470;             // as duas hastes do colchete
  const dentro = d.valores.find((v) => v.dentro);
  const fora = d.valores.find((v) => !v.dentro);
  const bracket = (y0, y1, b, ate) =>
    `<path d="M ${L + 16} ${y0} H ${L} V ${y1} H ${L + 16}" class="dg__col" fill="none"`
    + ` stroke="currentColor" stroke-width="2" ${em(b, ate)}/>`
    + `<path d="M ${R - 16} ${y0} H ${R} V ${y1} H ${R - 16}" class="dg__col" fill="none"`
    + ` stroke="currentColor" stroke-width="2" ${em(b, ate)}/>`;

  /* As linhas que FORAM classificadas. Sem número e sem rótulo individual, de
     propósito: o assessment não deu esses valores, e desenhar cifras seria
     inventar dado. Régua de livro-caixa, não barra — na primeira rodada eram
     retângulos arredondados e liam como esqueleto de carregamento. */
  const anon = [300, 246, 322].map((w, i) =>
    `<line x1="${L + 34}" y1="${100 + i * 24}" x2="${L + 34 + w}" y2="${100 + i * 24}"`
    + ` stroke="currentColor" stroke-opacity="0.22" stroke-width="2" ${em(1)}/>`).join('');

  return svg(id, W, H,
    `${dentro.rot}: ${dentro.v}, dentro do subtotal. ${fora.rot}: ${fora.v}, fora do subtotal. `
    + 'Os dois valores não se somam nem se subtraem.',
    /* beat 2 — o colchete alto, ainda com as duas linhas dentro */
    bracket(72, 322, 2, 2)
    /* beat 3 — o colchete recua e deixa de fora a linha que não entrou */
    + bracket(72, 258, 3)
    + anon
    + rot(L + 34, 86, 'linhas classificadas', { b: 1 })

    /* a linha que entrou */
    + rot(L + 34, 218, dentro.rot, { b: 1 })
    + txt(L + 34, 248, dentro.v, { tam: 30, b: 1 })

    /* A linha que não entrou. O rótulo viaja DENTRO do grupo: solto, ele ficava
       parado enquanto o valor dava o passo, e os dois se atropelavam. */
    + `<g class="dg__fora" ${em(1)}>`
    + rot(L + 34, 286, fora.rot, { b: 1 })
    + txt(L + 34, 316, fora.v, { tam: 30, b: 1 })
    + rot(L + 34, 338, 'não entra em subtotal nenhum', { b: 3, op: 0.75 })
    + `</g>`

    /* a razão e o fecho */
    + rot(L, 396, d.razao, { b: 4, tam: 12 })
    + rot(L, 418, d.fecho, { b: 4, tam: 12, op: 0.85 }));
}

/* ==========================================================================
   2 · ESCADA — cena 10
   --------------------------------------------------------------------------
   Cinco capacidades, não cinco projetos: a fala diz explicitamente que não é
   sequência rígida. Por isso o desenho carrega ORDEM e não carrega cronograma
   — nenhuma data, nenhum trimestre, nenhum eixo de tempo.

   As definições de cada degrau não entram aqui. São frases, e frase em desenho
   vira ruído: elas vivem na coluna de HTML da cena, reveladas pelo mesmo beat.
   ========================================================================== */

export function escada(degraus, id = 'esc') {
  const W = 720, H = 400;
  const x0 = 52, base = 300, larg = 122, alt = 44;
  let corpo = '';
  degraus.forEach(([nome], i) => {
    const x = x0 + i * larg, topo = base - (i + 1) * alt;
    corpo += `<path d="M ${x} ${base} V ${topo} H ${x + larg}" class="dg__deg" fill="none"`
           + ` stroke="currentColor" stroke-width="2" ${em(i + 1)}/>`;
    corpo += `<rect x="${x}" y="${topo}" width="${larg}" height="${base - topo}"`
           + ` fill="currentColor" fill-opacity="0.04" ${em(i + 1)}/>`;
    /* o último degrau fecha o perfil descendo até a base: sem isso a escada
       fica aberta à direita e o desenho parece cortado, não terminado */
    if (i === degraus.length - 1) {
      corpo += `<line x1="${x + larg}" y1="${topo}" x2="${x + larg}" y2="${base}"`
             + ` stroke="currentColor" stroke-width="2" ${em(i + 1)}/>`;
    }
    /* O nome deita sobre a pisada do degrau. O último alinha à DIREITA: com
       alinhamento à esquerda, "Progressivamente autônomo" saía pela borda do
       quadro — e um rótulo cortado não é acabamento ruim, é informação perdida. */
    const fim = i === degraus.length - 1;
    corpo += txt(fim ? x + larg : x + 10, topo - 12, nome,
      { tam: 13, b: i + 1, anc: fim ? 'end' : 'start' });
    corpo += rot(fim ? x + larg : x + 10, topo - 28, String(i + 1).padStart(2, '0'),
      { tam: 11, b: i + 1, anc: fim ? 'end' : 'start' });
  });
  /* Sem linha de base. Uma régua embaixo de cinco formas que sobem transforma
     escada em gráfico de colunas, e coluna promete uma quantidade medida —
     que é justamente o que a fala nega: são capacidades, não números. */

  /* a faixa: dependência → autonomia. Um segmento por beat, seta só no fim. */
  const fy = 348;
  const passos = ['dependência', 'visibilidade', 'antecipação', 'coordenação', 'autonomia'];
  passos.forEach((p, i) => {
    const a = x0 + i * larg, b = a + larg;
    corpo += `<line x1="${a}" y1="${fy}" x2="${b}" y2="${fy}" stroke="currentColor"`
           + ` stroke-width="2" stroke-opacity="0.5" class="dg__faixa" ${em(i + 1)}`
           + (i === 4 ? ` marker-end="url(#${id}-s)"` : '') + `/>`;
    corpo += rot(a + larg / 2, fy + 20, p, { anc: 'middle', b: i + 1 });
  });

  /* âncora do personagem no último degrau. Ele entra como módulo, num passo
     posterior; aqui fica só o lugar, e a cena 10 é uma das três de PERSONAGEM_EM. */
  corpo += `<g class="dg__personagem" data-slot="personagem"`
         + ` transform="translate(${x0 + 5 * larg - 58} ${base - 5 * alt - 96})" ${em(6)}></g>`;

  return svg(id, W, H,
    'Escada de cinco capacidades, de legível a progressivamente autônomo, '
    + 'sobre uma faixa que vai de dependência a autonomia.', corpo);
}

/* ==========================================================================
   3 · NÚCLEO e NÚCLEO INVERTIDO — cenas 11 e 19
   --------------------------------------------------------------------------
   Um desenho, duas leituras, e essa economia É o argumento comercial: na 11,
   uma fundação e cinco braços; na 19, seis compras separadas, cada uma
   refazendo A SUA fundação. O desperdício não é dito, é desenhado — seis
   fundações onde havia uma.

   O bloco de fundação é literalmente o mesmo retângulo nos dois, mesmo
   tamanho e mesmo traço. Se ele mudar, a inversão deixa de ler como inversão.
   ========================================================================== */

/** A medida da fundação. Uma constante, e não dois números iguais em dois
    lugares: dois números iguais divergem no primeiro ajuste. */
export const FUND_W = 168, FUND_H = 56;

/** O bloco de fundação. Idêntico nas duas cenas — é a peça que se repete. */
const fundacao = (x, y, w, h, atrs = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="currentColor"`
  + ` fill-opacity="0.10" stroke="currentColor" stroke-width="2" ${atrs}/>`;

export function nucleo(dados, id = 'nuc') {
  const W = 720, H = 420;
  /* 168 x 56 é a medida da fundação, e ela é COMPARTILHADA com a cena 19.
     Se as duas divergirem, a inversão do slide 19 deixa de ler como inversão
     e o argumento comercial inteiro cai. */
  const cx = 74, cy = 182, cw = FUND_W, ch = FUND_H;
  const bx = 430, bw = 240, bh = 50, gap = 18;
  const n = dados.length;
  const y0 = (H - (n * bh + (n - 1) * gap)) / 2;

  let corpo = fundacao(cx, cy, cw, ch, em(1));
  corpo += txt(cx + 16, cy + 30, 'Fundação', { tam: 15, b: 1 });
  corpo += rot(cx + 16, cy + 50, 'construída uma vez', { b: 1 });

  dados.forEach(([cap], i) => {
    const y = y0 + i * (bh + gap);
    corpo += `<rect x="${bx}" y="${y}" width="${bw}" height="${bh}" rx="4" fill="none"`
           + ` stroke="currentColor" stroke-width="1.5" stroke-opacity="0.55" ${em(2)}/>`;
    corpo += txt(bx + 14, y + bh / 2 + 5, cap, { tam: 13, b: 2 });
    corpo += `<path d="M ${cx + cw + 10} ${cy + ch / 2} C ${bx - 90} ${cy + ch / 2},`
           + ` ${bx - 90} ${y + bh / 2}, ${bx - 10} ${y + bh / 2}" fill="none"`
           + ` stroke="currentColor" stroke-width="1.5" stroke-opacity="0.45"`
           + ` marker-end="url(#${id}-s)" ${em(2)}/>`;
  });
  /* Rotula UMA vez — a mesma codificação repetida cinco vezes é legenda, não
     dado. Fica ACIMA do pescoço do leque: no meio dele, atravessava as cinco
     curvas e virava ruído em cima do próprio rótulo. */
  corpo += rot(cx + cw + 6, cy - 10, 'reutiliza', { b: 2, op: 0.7 });
  corpo += rot(cx, H - 22, 'Construir uma vez. Reutilizar em cada nova aplicação.',
    { tam: 12, b: 3, op: 0.85 });

  return svg(id, W, H,
    'Uma fundação única, à esquerda, reutilizada por cinco aplicações à direita.', corpo);
}

export function nucleoInvertido(frentes, valor, valorRot, nota, id = 'nvi') {
  const W = 900, H = 510;
  const cols = 3, gap = 30, x0 = 52;
  const passoX = FUND_W + gap;
  const linhaY = [76, 252];          // duas fileiras de três; ver abaixo

  /* Por que 3 x 2 e não seis colunas: a fundação tem de ser LITERALMENTE o
     mesmo retângulo da cena 11. Em seis colunas ela caberia com 104px, e uma
     fundação menor aqui do que lá diria exatamente o contrário do argumento —
     que reconstruir sai barato. Com 168px ela é a mesma, e são seis. */
  let corpo = rot(x0, 52, 'Normalmente contratadas como frentes diferentes', { b: 1 });

  frentes.forEach((f, i) => {
    const x = x0 + (i % cols) * passoX;
    const topo = linhaY[Math.floor(i / cols)];
    corpo += `<rect x="${x}" y="${topo}" width="${FUND_W}" height="46" rx="4" fill="none"`
           + ` stroke="currentColor" stroke-width="1.5" stroke-opacity="0.55" ${em(1)}/>`;
    const linhas = quebra(f, 24);
    linhas.forEach((parte, k) => {
      corpo += txt(x + FUND_W / 2, topo + 28 - (linhas.length - 1) * 7 + k * 14, parte,
        { anc: 'middle', tam: 12, b: 1 });
    });
    corpo += `<line x1="${x + FUND_W / 2}" y1="${topo + 54}" x2="${x + FUND_W / 2}" y2="${topo + 84}"`
           + ` stroke="currentColor" stroke-width="1.5" stroke-opacity="0.45"`
           + ` marker-end="url(#${id}-s)" ${em(2)}/>`;
    /* A MESMA fundação da cena 11, repetida uma vez por compra. É o desperdício. */
    corpo += fundacao(x, topo + 92, FUND_W, FUND_H, em(2));
    corpo += rot(x + FUND_W / 2, topo + 92 + FUND_H / 2 + 4, 'fundação',
      { anc: 'middle', tam: 11.5, b: 2, op: 0.7 });
  });

  /* A legenda fica na coluna livre à direita, fora do caminho das setas. */
  const lx = x0 + cols * passoX + 16;
  corpo += rot(lx, 120, 'cada contratação', { b: 2 });
  corpo += rot(lx, 138, 'reconstrói a fundação', { b: 2 });
  corpo += txt(lx, 230, `${frentes.length} contratações`, { tam: 15, b: 2 });
  corpo += txt(lx, 254, `${frentes.length} fundações`, { tam: 15, b: 2 });

  corpo += rot(x0, 436, valorRot, { b: 3 });
  corpo += txt(x0, 472, valor, { tam: 32, b: 3 });
  corpo += rot(x0, 496, nota, { b: 4, tam: 11 });

  return svg(id, W, H,
    `${frentes.length} frentes contratadas separadamente, cada uma reconstruindo a mesma `
    + `fundação. ${valorRot}: ${valor}.`, corpo);
}

/* ==========================================================================
   4 · QUADRANTE — cenas 14 e 15
   --------------------------------------------------------------------------
   São UM objeto em dois estados, não dois slides. Os eixos desenham na 14, os
   quatro nomes pousam, e na 15 o mesmo quadrante recebe as dezesseis
   oportunidades. Se a 15 virar lista, a 14 não vale o tempo que custa.

   A ordem de `celulas` em deck23.js é a de leitura da matriz, começando pelo
   alto à esquerda: Inteligência, Autonomia, Visibilidade, Orquestração.
   ========================================================================== */

export function quadrante(cena, id = 'qd', portfolio = null) {
  const W = 760, H = 540;
  /* O deslocamento de beats entre as duas cenas. Na 14 o quadrante SE CONSTRÓI
     em quatro beats. Na 15 ele já está pronto no primeiro — o que entra são as
     dezesseis oportunidades, um grupo por beat.

     Na primeira rodada eu deixei os grupos começarem no beat 4 nas duas, e a
     cena 15 terminava com dois quadrantes vazios: só quatro das dezesseis
     oportunidades chegavam a aparecer. Não dava erro nenhum; só desenhava
     metade do portfólio e ficava calado. */
  const b = portfolio ? { eixoX: 1, eixoY: 1, nomes: 1, grupo0: 2 }
                      : { eixoX: 1, eixoY: 2, nomes: 3, grupo0: 4 };
  const x0 = 92, y0 = 44, x1 = 700, y1 = 452;
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
  const { eixos, celulas } = cena;

  let corpo = '';
  /* moldura recessiva: existe desde sempre, não é beat */
  corpo += `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="none"`
         + ` stroke="currentColor" stroke-opacity="0.18" stroke-width="1"/>`;

  /* beat 1 — o eixo horizontal: observar → agir */
  corpo += `<line x1="${x0}" y1="${my}" x2="${x1}" y2="${my}" stroke="currentColor"`
         + ` stroke-width="1.5" stroke-opacity="0.4" marker-end="url(#${id}-s)" ${em(b.eixoX)}/>`;
  corpo += rot(x0, y1 + 26, eixos.x[0], { b: b.eixoX });
  corpo += rot(x1, y1 + 26, eixos.x[1], { anc: 'end', b: b.eixoX });

  /* beat 2 — o eixo vertical: reagir → antecipar, e ele aponta para CIMA */
  corpo += `<line x1="${mx}" y1="${y1}" x2="${mx}" y2="${y0}" stroke="currentColor"`
         + ` stroke-width="1.5" stroke-opacity="0.4" marker-end="url(#${id}-s)" ${em(b.eixoY)}/>`;
  corpo += rot(x0 - 18, y0 + 8, eixos.y[0], { anc: 'middle', gir: -90, b: b.eixoY });
  corpo += rot(x0 - 18, y1 - 8, eixos.y[1], { anc: 'middle', gir: -90, b: b.eixoY });

  /* beat 3 — os quatro nomes pousam */
  const cel = [[x0, y0], [mx, y0], [x0, my], [mx, my]];
  celulas.forEach(([nome, gloss], i) => {
    const [cx, cy] = cel[i];
    const bx = cx + 20, by = cy + 34;
    corpo += txt(bx, by, nome, { tam: 18, b: b.nomes });
    corpo += rot(bx, by + 20, gloss, { tam: 11.5, b: b.nomes });
    if (portfolio && portfolio[nome]) {
      portfolio[nome].forEach((item, k) => {
        corpo += `<circle cx="${bx + 4}" cy="${by + 52 + k * 26}" r="2.5" fill="currentColor"`
               + ` fill-opacity="0.5" ${em(b.grupo0 + i)}/>`;
        corpo += txt(bx + 16, by + 56 + k * 26, item, { tam: 13, b: b.grupo0 + i });
      });
    }
  });

  if (!portfolio) {
    corpo += rot(x0, y1 + 60, 'Não é preciso começar pela autonomia.',
      { b: b.grupo0, tam: 12, op: 0.85 });
  }

  return svg(id, W, H,
    `Quadrante de ${eixos.x[0]} a ${eixos.x[1]} e de ${eixos.y[1]} a ${eixos.y[0]}, `
    + `com quatro espaços de valor: ${celulas.map((c) => c[0]).join(', ')}.`
    + (portfolio ? ' Cada espaço povoado por quatro oportunidades.' : ''), corpo);
}

/* ==========================================================================
   5 · COMPARAÇÃO — cena 20, com o assentamento da 22
   --------------------------------------------------------------------------
   Três caminhos, três linhas iguais. NÃO leva barra, escala nem eixo comum: os
   valores estão em unidades diferentes — um total de projeto contra dois
   valores mensais. Eixo compartilhado entre unidades diferentes é o erro mais
   comum de gráfico que existe, e aqui ele inventaria uma comparação que os
   números não sustentam.

   `assenta` é o índice da linha que ganha peso; as outras recuam. É o único
   gesto de ênfase do Ato 3, e é opacidade e peso — não brilho, não cor.
   A cena 20 chama com `assenta = -1`. Quem assenta é a 22.
   ========================================================================== */

export function comparacao(caminhos, fecho, id = 'cmp', assenta = -1) {
  /* 860 e não 720: em 720 "Capacidade conforme dedicação" e "Múltiplos perfis
     e contratação" saíam pela borda direita, cortadas no meio da palavra. Não
     é acabamento — é a coluna que diz o que cada caminho custa em capacidade,
     e ela chegava truncada. */
  const W = 860, H = 372;
  const x0 = 52, xInv = 300, xLim = 566;
  const y0 = 78, lh = 76;

  let corpo = rot(x0, 52, 'caminho', { tam: 11 })
            + rot(xInv, 52, 'investimento', { tam: 11 })
            + rot(xLim, 52, 'o que limita', { tam: 11 })
            + `<line x1="${x0}" y1="62" x2="${W - 52}" y2="62" stroke="currentColor"`
            + ` stroke-opacity="0.25" stroke-width="1"/>`;

  caminhos.forEach((c, i) => {
    const y = y0 + i * lh;
    const dest = assenta === i;
    const recua = assenta >= 0 && !dest;
    const cls = dest ? 'dg__linha dg__linha--assenta' : recua ? 'dg__linha dg__linha--recua' : 'dg__linha';
    corpo += `<g class="${cls}" ${em(i + 1)}>`;
    corpo += txt(x0, y + 22, c.nome, { tam: 17, peso: dest ? 500 : 400 });
    corpo += txt(xInv, y + 22, c.inv, { tam: 15 });
    quebra(c.lim, 26).forEach((linha, k) => {
      corpo += rot(xLim, y + 22 + k * 16, linha, { tam: 12, op: 0.6 });
    });
    corpo += `<line x1="${x0}" y1="${y + 44}" x2="${W - 52}" y2="${y + 44}"`
           + ` stroke="currentColor" stroke-opacity="0.14" stroke-width="1"/>`;
    corpo += `</g>`;
  });

  corpo += rot(x0, H - 22, fecho, { b: 3, tam: 12, op: 0.85 });

  return svg(id, W, H,
    'Três caminhos para a mesma capacidade, com investimento e limite de cada um. '
    + 'Sem escala comum: os valores estão em unidades diferentes.', corpo);
}
