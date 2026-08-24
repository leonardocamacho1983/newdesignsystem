# Camacho — Sistema de marca

Sistema de identidade do **Camacho** — consultoria sênior de estratégia,
transformação com IA e desenvolvimento de lideranças. Não é um PDF de manual:
é código executável, e os guias são as próprias peças.

**Guias vivos:** `index.html` (sistema), `posicionamento.html` (tese e oferta),
`aplicacoes.html` (peças da prática), `extensoes.html` (motor gráfico e
laboratório) e `studio.html` (estúdio de print). Todos saem também como arquivo
único autocontido em `dist/`.

---

## A tese

> **Clareza é vantagem.**

Empresas não perdem capacidade por falta de tecnologia, talento ou informação.
Perdem quando a complexidade cresce mais rápido do que sua forma de decidir,
operar e liderar. A cadeia que o trabalho percorre:

**complexidade → clareza → decisões → capacidade de execução**

Essa cadeia é o que a rampa do motor gráfico significa. Todo grafismo é a mesma
operação — uma **forma** amostrada por uma **grade de partículas quadradas**,
cuja probabilidade de existir varia ao longo de uma **rampa de densidade** — e o
que se ganha na ponta densa não é dado limpo: é capacidade.

### A costura

Não são duas ofertas. É uma: transformação com IA que funciona. Para entregá-la
é preciso costurar o lado técnico e o lado humano na estratégia do negócio. O
mercado separa os dois, e separá-los é exatamente o que faz a transformação
falhar. O grafismo-âncora (`weave`) desenha isso: dois fios entram separados e
saem como um.

### O método

Diagnosticar · Priorizar · Estruturar · Implementar · **Incorporar** · Medir

Incorporar é a etapa que quase todo projeto pula, e é onde a capacidade fica
instalada.

## Estrutura

```
tokens/tokens.css        Fonte única de verdade (cor, tipo, espaço, forma, níveis, movimento)
tokens/tokens.json       Gerado do CSS pelo build — nunca editar à mão
tokens/build-tokens.mjs  Gera o JSON e trava o fechamento token/uso
src/dither.js            Motor gráfico: 24 campos de forma, rampa, clareira, texturas, render e animação
src/camacho.css          Componentes do sistema
src/guide.css            Estilos só da documentação — fora do sistema, de propósito
src/brand.js             O nome da marca, num lugar só
src/kv.js                Os key visuals como dado: formatos, campos e calibração
src/site.css             Componentes das peças (site, deck, proposta, carrossel)
tools/export-kv.mjs      Exporta os KVs em PNG e as animações em GIF/WebP
tools/anim-frames.py     Monta as animações a partir dos quadros
tools/export-pecas.mjs   Exporta as peças reais: PNGs de LinkedIn e PDFs
assets/                  Símbolo em SVG (positivo, negativo, glifo, favicon)
build.mjs                Tabela única de páginas; gera dist/ autocontido
```

## Fundação

| | |
|---|---|
| **Cor** | Monocromática **por argumento**. Num sistema que comunica nível (maturidade, prioridade, risco), o nível é densidade de partícula, não matiz — a mesma gramática do motor. Uma cor de destaque criaria um segundo sistema concorrente. |
| **Tipo** | Três vozes: **Inter Tight** (sistema, interface, marca), **Source Serif 4** (diagnóstico, artigo, formação), **IBM Plex Mono** (indicador, nível, dado). Elas se sucedem, mas não disputam papel: rótulo e número não vão em serifada, texto longo não vai em mono. |
| **Marca** | "C" geométrico num squircle. A **abertura** representa a lacuna entre a complexidade enfrentada e a capacidade instalada — daí a marca-medida: o mesmo C em N aberturas é uma escala de maturidade. |
| **Voz** | Primeira pessoa do singular. Quem conduz é uma pessoa, que compõe associados conforme a necessidade. |

## Motor gráfico

```html
<canvas data-cmc-dither="weave" data-ramp="0.04,1" data-angle="0"></canvas>
```

```js
import { render, resolve, fields } from './src/dither.js';
render(canvas, { shape: 'gauge', ramp: [0.1, 1], cell: 4 });
```

**Formas.** Base: `disc` `ring` `chevrons` `bars` `loop` `layers` `mark` `text`
`fill` `noiseToSignal`. Estendidas: `funnel` `wave` `orbit` `staircase` `mesh`
`spiral`. Da transformação: `weave` (a costura) `cohort` (incorporar)
`gauge` (medir) `handoff` (transferir). Figuras: `cidade` `pessoa` `arvore`
`banana`. Ou passe sua própria função `f(u, v, ar) → cobertura 0..1`.

**Figura não é ornamento.** As figuras existem para peça que é *sobre* alguma
coisa — um tema editorial, um cliente. Peça institucional continua abstrata.
Todas são 3–5 primitivas compostas com `Math.max(edge(...))`, igual ao resto do
vocabulário: é o que faz elas parecerem do sistema em vez de clip-art, e o que
as mantém sem máscara, sem arquivo de origem e independentes de resolução.

**Clareira.** `clareira: {x, y, w, h, soft, piso}` faz a densidade desabar numa
região, para a manchete sentar em terreno limpo sem cortina de gradiente. É o
que torna possível o campo sangrado sem violar a regra de que grafismo não
cruza com tipografia. `x`/`w` em fração da largura, `y`/`h` da altura.

**Texturas.** A mesma forma, três lógicas: `grain` (limiar aleatório — padrão),
`screen` (Bayer 8×8, trama de impressão), `halftone` (varia o tamanho do ponto).

**Tipografia dissolvida.** O campo `text` rasteriza a palavra fora da tela e usa
o alpha como cobertura — qualquer manchete vira grafismo da marca. A opção
`font` escolhe a família, então o tipo dissolvido fala as três vozes.

| Parâmetro | |
|---|---|
| `cell` | Aresta da célula em px. 4 padrão; 6–8 em peças grandes. |
| `ramp` | `[densidade mínima, máxima]`. |
| `angle` | 0° adensa à direita · 180° à esquerda · 90° embaixo. |
| `mirror` | Denso no centro, disperso nas duas pontas. |
| `radial` | Denso no miolo. Funciona em qualquer proporção. |
| `texture` | `grain` · `screen` · `halftone`. |
| `seed` | Hash determinístico por célula — o mesmo grafismo sempre. |
| `width`/`height` | Renderiza no tamanho pedido, ignorando o layout: é o caminho de exportação em alta resolução. |

## Key visuals

Quatro KVs — a costura, complexidade vira clareza, a lacuna que se mede e o que
fica — cada um com uma ideia só, em cinco formatos de 21:9 a 9:16. Vivem em
`kv.html`, definidos como dado em `src/kv.js`.

```bash
node tools/export-kv.mjs            # 20 PNGs + 2 animações em dist/kv/
node tools/export-kv.mjs caminho    # ou em outro destino
```

O alvo de renderização é a própria `kv.html` em modo solo (`?solo=&fmt=`), e
não uma segunda composição escrita no exportador: dois códigos para a mesma
peça divergiriam no primeiro ajuste. A célula escala com a largura de saída,
para o grão manter o mesmo peso visual em qualquer resolução.

**Sem fotografia, e não por purismo.** Um KV se reproduz exatamente com forma,
rampa e semente, em qualquer resolução, sem arquivo de origem. Uma foto de banco
seria a única peça da marca que ninguém consegue refazer — e a única que outra
empresa pode estar usando na mesma semana.

As animações saem em GIF e WebP, ambos sem perda: a marca é feita de partícula
de borda dura, e codec com perda borra exatamente o grão que a identifica.

## Peças

Entregáveis que funcionam, não imagens de entregáveis:

| Peça | Arquivo | O que é |
|---|---|---|
| Site | `site.html` | Landing page com hero, problema, atuação, método e contato |
| Deck | `deck.html` | Nove slides navegáveis por teclado; imprime em paisagem |
| Proposta | `proposta.html` | Documento para ler e enviar; `?ref=` e `?data=` geram a versão de cada cliente |
| Carrossel | `carrossel.html` | Documento de LinkedIn em seis páginas 1080×1350 |
| Assinatura | `assinatura.html` | Tabela com estilo inline, com botão de copiar |

```bash
node tools/export-pecas.mjs          # capa e avatar de LinkedIn + 3 PDFs
```

**A assinatura não tem logo, e isso é decisão, não esquecimento.** Símbolo em
e-mail exige um PNG hospedado em URL pública, e vários clientes bloqueiam imagem
remota por padrão — a marca viraria um retângulo vazio no primeiro contato. Até
haver domínio no ar, a assinatura tipográfica é a que sempre funciona.

**Exportar PDF exige emular mídia de impressão antes de desenhar.** O deck
esconde os slides fora do atual, e um elemento escondido tem tamanho zero: sem
emular `print` primeiro, o motor desenha em cima de nada e metade das páginas
sai vazia.

## Trocar o nome da marca

O nome mora em `src/brand.js`; as páginas declaram encaixes (`data-brand="name"`)
que o módulo preenche. Qualquer página aceita `?brand=` na URL para experimentar.
O símbolo é o único ponto dependente do nome — ele é uma letra.

## Rodar

```bash
python3 -m http.server 8899     # módulos ES exigem http, não file://
node build.mjs                  # tokens + páginas autocontidas em dist/
```

`build.mjs` falha se qualquer `href`/`src` local sobreviver ao embutimento, e
`build-tokens.mjs` falha se algum `var(--cmc-*)` referenciado não existir
declarado. Um token órfão não emite erro no navegador — ele aplica valor vazio e
o layout desaba em silêncio.

## Registro da transição

O sistema nasceu sob o nome **Cadrian** e foi herdado inteiro: motor, paleta,
grade e componentes não dependem de como a marca se chama. O que mudou:

- O prefixo `cdr` virou `cmc` (73 tokens, 40 classes, 2 data-attributes e 2
  identificadores camelCase), num commit mecânico isolado de diff visual zero,
  para que a comparação de screenshots servisse de oráculo.
- A rampa deixou de significar "ruído → sinal", um fato sobre dados, e passou a
  significar "complexidade → clareza", uma afirmação sobre capacidade.
- As seis etapas do processo, todas sobre o sistema, deram lugar às seis do
  método, que incluem **Incorporar** — a capacidade humana não tinha lugar.
- O símbolo sobreviveu sem redesenho porque é uma letra e o nome novo começa com
  a mesma. A abertura ganhou significado.
- Os nomes de arquivo em `dist/` continuam `cadrian-*`: são o endereço a que os
  artifacts publicados estão ligados, e a URL pública não os contém. `out` é
  endereço e nunca muda; `src` e conteúdo são assunto.

## Pendências

- **Telefone**: `BRAND.phone` é placeholder explícito. Trocar antes de peça impressa.
- **Domínio**: `camacho.ai` é sobrenome comum — verificar disponibilidade.
- **Assinatura**: as peças assinam "Camacho"; o nome completo aparece na
  assinatura de pessoa. Confirmar.
- **Favicon 16 px**: o squircle fecha demais nesse tamanho; definir uma versão própria.
