# Cadrian — Sistema Visual

Sistema de identidade da **Cadrian** (consultoria de sistemas de IA), extraído das
explorações de marca e transformado em código executável: tokens, um motor gráfico
generativo e uma camada de componentes.

**Guia vivo:** abra `index.html` (via servidor local) ou `dist/cadrian-brand.html`
(arquivo único, autocontido, pronto para mandar por e‑mail).

---

## A ideia central

A marca tem uma tese — *from noise to signal* — e o sistema gráfico **é** essa tese.
Todo grafismo é a mesma operação:

> uma **forma** amostrada por uma **grade de partículas quadradas**, cuja
> probabilidade de existir varia ao longo de uma **rampa de densidade**.

Ruído de um lado, sinal do outro. Nada é ilustrado à mão — tudo é gerado. Por isso
escala de um favicon a um outdoor sem perder o grão, e qualquer pessoa da equipe
produz peça nova sem abrir o Illustrator.

## Estrutura

```
tokens/tokens.css     Fonte única de verdade (cor, tipo, espaço, forma, movimento)
tokens/tokens.json    Os mesmos tokens em JSON, gerados do CSS
src/dither.js         Motor gráfico: campos de forma, rampa, render e animação
src/cadrian.css       Componentes: lockup, slide, pôster, card, botão, tag
assets/               Símbolo em SVG (positivo, negativo, glifo, favicon)
index.html            Guia vivo — a documentação é a própria peça
build.mjs             Gera dist/cadrian-brand.html (página única autocontida)
```

## Fundação

| | |
|---|---|
| **Cor** | Monocromática por convicção. Preto e branco puros + cinzas neutros. Não existe cor de destaque: o destaque é o contraste e a densidade das partículas. |
| **Tipo** | Inter Tight (Google Fonts). Títulos sempre em Light 300 com tracking negativo (−0.035em). Medium 500 só em rótulos micro, botões e no wordmark. |
| **Marca** | "C" geométrico de contraforma circular num squircle. Área de proteção = metade da altura do símbolo. Legível a partir de 16 px. |
| **Movimento** | Uma curva só (`--cdr-ease`). Tudo resolve de ruído para forma. |

## Motor gráfico

```html
<canvas data-cdr-dither="chevrons" data-ramp="0.12,1" data-angle="0"></canvas>
```

```js
import { render, resolve, fields } from './src/dither.js';
render(canvas, { shape: 'mark', ramp: [0.03, 1], angle: 180, cell: 4 });
```

**Formas:** `disc` `ring` `chevrons` `bars` `loop` `layers` `mark` `noiseToSignal`
— ou passe sua própria função `f(u, v, ar) → cobertura 0..1`.

**Parâmetros**

| | |
|---|---|
| `cell` | Aresta da célula em px. 4 padrão; 6–8 em peças grandes. |
| `ramp` | `[densidade mínima, máxima]` — o eixo ruído→sinal. |
| `angle` | 0° adensa à direita · 180° à esquerda · 90° embaixo. |
| `mirror` | Rampa espelhada: denso no centro, disperso nas duas pontas. |
| `curve` | `> 1` prolonga a dispersão antes de resolver. |
| `seed` | Hash determinístico por célula — o mesmo grafismo sempre, e nada "ferve" ao redimensionar ou animar. |

A revelação (`resolve`) é uma frente de onda que atravessa o eixo da rampa: resolve
primeiro o lado do sinal, depois o do ruído. Respeita `prefers-reduced-motion`.
Elementos com `[data-cdr-dither]` animam sozinhos ao entrar na tela.

## Regras

**Faça** — deixe o preto ocupar área grande e contínua · gere o dither, nunca
reproduza como imagem esticada · título em Light com tracking negativo · uma
direção de rampa por peça.

**Não faça** — cor de destaque, gradiente ou sombra colorida · Bold/Black nos
títulos · distorcer, rotacionar ou recolorir o símbolo · partícula redonda (a
célula é quadrada).

## Rodar

```bash
python3 -m http.server 8899     # o guia usa módulos ES: precisa de http, não file://
open http://localhost:8899/

node build.mjs                  # regenera dist/cadrian-brand.html
```

## Pendências para fechar a v1

- Confirmar o nome legal e o domínio antes de aplicar em peça impressa.
- Os textos do processo (Measure, Repeat) foram escritos aqui para completar as seis
  etapas — os prints só traziam os quatro primeiros. Revisar com o time.
- Definir a versão do símbolo para favicon 16 px (o squircle fecha demais nesse tamanho).
