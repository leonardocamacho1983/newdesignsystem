/* ==========================================================================
   Plano de Gestão e IA da Banana Milk — os dados dos dois artefatos

   Duas saídas, uma fonte:

   - `PARADAS` (12) alimenta a apresentação. É o que um fundador absorve da
     tela enquanto alguém fala: uma afirmação, um objeto, uma imagem.
   - `SECOES` (23) alimenta o documento. É o texto integral do assessment,
     para ler e imprimir.

   Cada parada declara em `secoes` quais seções ela representa. Isso não é
   documentação: é o que permite CONFERIR que nenhuma seção ficou órfã, e
   torna rastreável, na sala, de onde veio cada afirmação projetada. Duas
   listas soltas para a mesma peça é a divergência que este repositório já
   cometeu, e o cabeçalho de src/kv.js foi escrito para impedir.

   O texto é do documento editorial do assessment. Este arquivo decide COMO
   cada argumento aparece, nunca QUAL.
   ========================================================================== */

/* --- A espinha -----------------------------------------------------------

   O diagnóstico inteiro é UM objeto: o intervalo entre um fato acontecer e
   alguém agir sobre ele. DRE é esse intervalo medido no resultado; shelf life,
   medido no mercado; recompra, medido no cliente. O Modelo de Gestão é a
   máquina que o encurta. Os 90 dias são ele encolhendo. O legado é ele curto
   o bastante para rodar sem consultoria.

   Por isso o grafismo é um campo só — `intervalo` — em doze estados, e não
   dezesseis campos usados uma vez cada. A versão anterior desta peça escolheu
   17 dos 23 grafismos por rima com o assunto, que é exatamente o que o README
   do sistema chama de ornamento. */

/* --- Nada pode parecer medido -------------------------------------------

   Não há números de latência neste assessment, e não vai haver antes desta
   apresentação. Então a regra é dura: nenhum grafismo com aparência de
   instrumento. Sem gauge, sem medidor, sem eixo com escala. O campo
   `intervalo` mostra RELAÇÃO — este vão é maior que aquele — e nunca
   magnitude. Um medidor sem medida é a coisa mais desonesta que um
   diagnóstico pode projetar numa parede. */

/* --- Os quatro registros ------------------------------------------------

   O documento editorial exige manter distintos diagnóstico, recomendação,
   implementação futura e ferramenta entregue, e proíbe descrever a Banana
   Milk como desorganizada ou sugerir que o BPO erra. Em doze paradas essa
   regra ainda colapsa se ficar só na copy, então cada registro tem campo
   próprio e a distinção é visível antes de qualquer palavra ser lida.

   Nome comprido de propósito: `REGISTROS` já existe em src/direcao.js com
   outro significado, e os dois módulos são embutidos no MESMO escopo pelo
   build — a colisão sairia como SyntaxError sem guard nenhum pegar. */
export const REGISTRO_EDITORIAL = {
  diagnostico:   { rotulo: 'Diagnóstico',   campo: 'escuro' },
  recomendacao:  { rotulo: 'Recomendação',  campo: 'papel' },
  implementacao: { rotulo: 'Implementação', campo: 'papel' },
  ferramenta:    { rotulo: 'O que fica',    campo: 'cliente' },
};

/* --- Os quatro sabores são os quatro programas ---------------------------

   A embalagem da Banana Milk é creme com tipo preto — o mesmo terreno do campo
   `papel` do sistema (#F2F0EE) — e um acento por sabor. Emparelhar os quatro
   acentos com os quatro programas prioritários faz a cor do cliente trabalhar
   estruturalmente: cada programa carrega o seu acento na parada, na grade de
   90 dias e no documento. É o sistema deles fazendo trabalho, em vez de um
   acento decorativo em duas cenas.

   ATENÇÃO: os valores foram lidos de uma captura da embalagem, não de um
   arquivo da marca. Trocar pelos oficiais antes de apresentar. */
export const PROGRAMAS = [
  { id: 'info',    nome: 'Informações Gerenciais ao Alcance',   o: 'acesso e compreensão',                 cor: '#D9503F' },
  { id: 'dre',     nome: 'DRE Gerencial, Margem e Precificação', o: 'controle econômico',                   cor: '#EFBE2E' },
  { id: 'shelf',   nome: 'Gestão de Shelf Life',                 o: 'antecipação e redução de perdas',      cor: '#7A4A2E' },
  { id: 'recompra', nome: 'Recompra e Acompanhamento Comercial', o: 'disciplina comercial e crescimento',   cor: '#8FB4C6' },
];

/* Programas seguintes: entram no documento, não na apresentação. */
export const PROGRAMAS_SEGUINTES = [
  { nome: 'Automação do Atendimento B2C', o: 'eficiência e aprendizado com o consumidor' },
  { nome: 'Planejamento de Demanda e Produção', o: 'previsibilidade' },
];

/* Ativo que ainda não chegou: a peça mostra qual arquivo falta, em vez de um
   retângulo vazio fingindo que está resolvido. */
export const ATIVOS = {
  logo:  { arquivo: 'cliente/logo.svg',   o: 'logotipo em vetor' },
  pack:  { arquivo: 'cliente/pack-*.png', o: 'os quatro packshots' },
  foto:  { arquivo: 'cliente/foto-1.jpg', o: 'foto do litoral' },
};

/* ==========================================================================
   PARADAS — a apresentação

   `arte` é o estado inicial do grafismo; `beats` são os passos. Um beat pode
   trocar o painel de conteúdo e/ou mover o grafismo, e mover o grafismo é
   sempre mover um número: os extremos de um vão, a largura de uma clareira,
   a abertura da marca.
   ========================================================================== */

/* O eixo é sempre o quadro inteiro: da esquerda (o fato acontece) à direita
   (o resultado é acompanhado). Um vão que termina cedo resolveu cedo.

   `ramp: [1, 1]` em toda parada de `intervalo`, e isso não é detalhe: com a
   rampa padrão a densidade sobe da esquerda para a direita POR CIMA do campo,
   e as duas gradações se multiplicam. O resultado é uma barra que parece um
   gradiente contínuo qualquer que seja o vão — o argumento inteiro desaparece
   e ninguém percebe, porque continua bonito. O campo é o conteúdo; a rampa
   tem que ficar de fora. */
const VAO_LARGO = [[0.08, 0.94]];
const SEIS_PASSOS = [0.08, 0.25, 0.42, 0.60, 0.78, 0.94];

export const PARADAS = [

  /* 01 --------------------------------------------------------------- */
  { n: 1, capa: true, campo: 'escuro', secoes: [1],
    hed: 'Plano de Gestão<br>e IA da Banana Milk',
    apoio: 'Diagnóstico, projetos prioritários e instrumentos para a próxima etapa do negócio.',
    rodape: 'AI Assessment & Opportunities',
    arte: { shape: 'weave', ramp: [0.04, 0.16], cell: 4, seed: 7,
            clareira: [{ x: -0.05, y: -0.05, w: 0.80, h: 0.82, soft: 0.075, piso: 0.015 }] },
    beats: [{}, { arte: { ramp: [0.04, 1] }, ms: 1800 }] },

  /* 02 --------------------------------------------------------------- */
  { n: 2, registro: 'recomendacao', olho: 'Resumo executivo', secoes: [2, 3],
    hed: 'O crescimento tornou as decisões mais interdependentes',
    apoio: 'Os sistemas, os dados e os responsáveis existem. O que ainda custa caro é transformar registro operacional em resposta gerencial e, depois, em ação.',
    arte: { shape: 'intervalo', ramp: [1, 1], cell: 4, seed: 11,
            opts: { vaos: [[0.08, 0.30]], alt: 0.42 } },
    beats: [{}, { arte: { opts: { vaos: VAO_LARGO, alt: 0.42 } }, ms: 1600 }] },

  /* 03 --------------------------------------------------------------- */
  { n: 3, registro: 'diagnostico', olho: 'Latência gerencial', secoes: [5],
    hed: 'O intervalo entre o fato e a ação é o que fica caro',
    passos: ['um fato acontecer', 'a informação ser registrada',
             'os fundadores compreenderem seu significado', 'uma decisão ser tomada',
             'alguém agir', 'o resultado ser acompanhado'],
    passosOlho: 'Seis passos, e o tempo mora entre eles',
    arte: { shape: 'intervalo', ramp: [1, 1], cell: 4, seed: 13,
            opts: { vaos: VAO_LARGO, marcas: [SEIS_PASSOS], alt: 0.42 } },
    beats: [{}, {}] },

  /* 04 --------------------------------------------------------------- */
  { n: 4, registro: 'diagnostico', secoes: [4],
    hed: 'Cada função vê um trecho.<br>A lacuna está entre elas',
    apoio: 'O BPO não está errado por olhar conformidade, nem a logística por priorizar entrega. A decisão dos fundadores nasce da combinação, e é a combinação que ainda exige esforço.',
    /* O comentário deste campo, escrito antes deste projeto: "o ruído não está
       em nenhum dos dois, está na relação". É a frase deste slide. */
    arte: { shape: 'interferencia', ramp: [0.12, 1], cell: 5, seed: 17,
            opts: { giro: 14, passo: 0.09 } },
    beats: [{}, { arte: { opts: { giro: 0.4, passo: 0.09 } }, ms: 2200 }] },

  /* 05 --------------------------------------------------------------- */
  { n: 5, registro: 'diagnostico', olho: 'Onde o vão é maior', secoes: [6],
    hed: 'Três pontos críticos',
    trio: [
      ['Resultado econômico', 'Uma proposta comercial exige combinar preço, volume, bonificação, CMV, impostos, frete, comissão, promotoria e prazo.'],
      ['Produtos no mercado', 'A visibilidade diminui depois que o produto entra em distribuidores, redes e lojas.'],
      ['Acompanhamento comercial', 'Recompra, promotores, pendências e contatos dependem de disciplina e memória individual.'],
    ],
    eixoRots: ['01', '02', '03'],
    arte: { shape: 'intervalo', ramp: [1, 1], cell: 3, seed: 19,
            opts: { vaos: [[0.08, 0.92], [0.08, 0.62], [0.30, 0.86]], alt: 0.82 } },
    beats: [{}, {}] },

  /* 06 --------------------------------------------------------------- */
  { n: 6, registro: 'diagnostico', olho: 'Ponto 1 · resultado econômico', secoes: [7],
    hed: 'A DRE registra o resultado. Explorar as causas ainda é trabalho',
    apoio: 'Na análise realizada, contas de CMC visíveis e sem código de plano de contas não apareciam incorporadas aos subtotais. Um relatório pode estar correto conforme sua parametrização e ainda assim não responder integralmente à pergunta gerencial.',
    nota: 'O valor do achado não está na conta específica: ele mostra que exibição, classificação e participação no resultado são coisas diferentes. Reconciliar com o BPO antes de qualquer afirmação numérica definitiva.',
    arte: { shape: 'intervalo', ramp: [1, 1], cell: 4, seed: 23,
            opts: { vaos: [[0.08, 0.92]], alt: 0.42 } },
    beats: [{}, {}] },

  /* 07 --------------------------------------------------------------- */
  { n: 7, registro: 'diagnostico', olho: 'Ponto 2 · produtos no mercado', secoes: [8],
    hed: 'O shelf life perde visibilidade fora da empresa',
    apoio: 'O Omie registra estoque, lotes e destino. Depois da venda, estoque na rede, ritmo, gôndola e ruptura não voltam sozinhos. O produto pode estar fisicamente válido e já ter perdido parte da janela comercial.',
    arte: { shape: 'intervalo', ramp: [1, 1], cell: 4, seed: 29,
            opts: { vaos: [[0.30, 0.96]], alt: 0.42 } },
    beats: [{}, {}] },

  /* 08 --------------------------------------------------------------- */
  { n: 8, registro: 'diagnostico', olho: 'Ponto 3 · acompanhamento comercial', secoes: [9],
    hed: 'O gatilho para agir ainda depende de alguém lembrar',
    apoio: 'Identificar quem não recomprou, cobrar, pedir evidência, registrar pendência e decidir a próxima ação — tudo isso é feito. O que falta é o sinal chegar sem depender de memória.',
    arte: { shape: 'intervalo', ramp: [1, 1], cell: 4, seed: 31,
            opts: { vaos: [[0.20, 0.94]], alt: 0.42 } },
    beats: [{}, {}] },

  /* 09 --------------------------------------------------------------- */
  { n: 9, registro: 'recomendacao', olho: 'A virada', secoes: [10],
    hed: 'Destacar exceções, não multiplicar relatórios',
    passos: ['critério', 'fonte', 'responsável', 'prazo', 'plano de ação', 'acompanhamento'],
    passosOlho: 'Cada exceção precisa ter',
    /* A clareira nasce fechada e abre: a atenção pousando numa região do campo.
       É a operação que o slide descreve, e é também o que impede o grafismo de
       cruzar a tipografia. */
    arte: { shape: 'fill', ramp: [0.5, 1], cell: 4, seed: 37,
            clareira: [{ x: -0.05, y: -0.05, w: 0.30, h: 1.1, soft: 0.075, piso: 0.015 }] },
    beats: [{}, { arte: { clareira: [{ x: -0.05, y: -0.05, w: 0.72, h: 1.1, soft: 0.075, piso: 0.015 }] }, ms: 1500 }] },

  /* 10 --------------------------------------------------------------- */
  { n: 10, registro: 'recomendacao', olho: 'O Modelo de Gestão', secoes: [11, 12, 13],
    hed: 'O que encurta o intervalo',
    grade: [
      ['Perguntas', 'o que os fundadores precisam saber'],
      ['Vocabulário', 'o que cada conceito significa'],
      ['Fontes', 'onde a informação nasce'],
      ['Métricas', 'como cada indicador é calculado'],
      ['Exceções', 'quando algo exige atenção'],
      ['Rotinas', 'quando se analisa'],
      ['Responsáveis', 'quem valida, decide e executa'],
      ['Interfaces', 'como a informação chega — a começar pelo WhatsApp'],
    ],
    arte: { shape: 'mesh', ramp: [0.08, 0.4], cell: 4, seed: 41, opts: { cols: 4, rows: 2 } },
    beats: [{}, { arte: { ramp: [0.08, 1] }, ms: 1500 }] },

  /* 11 --------------------------------------------------------------- */
  { n: 11, registro: 'implementacao', olho: 'Quatro programas · 90 dias',
    secoes: [14, 15, 16, 17, 18, 19, 20],
    hed: 'O vão encolhe em etapas, não de uma vez',
    programas: true,
    /* Uma barra só, encolhendo a cada beat — não três estáticas. O 30/60/90
       vira o PASSO em vez de virar três linhas: quem apresenta diz "em trinta
       dias", aperta a seta, e o vão encolhe na frente da sala. Três linhas
       empilhadas pediam faixa alta demais e roubavam o painel dos programas. */
    rotBeat: ['', '30 dias', '60 dias', '90 dias'],
    arte: { shape: 'intervalo', ramp: [1, 1], cell: 4, seed: 43,
            opts: { vaos: [[0.08, 0.94]], alt: 0.42 } },
    beats: [{},
      { arte: { opts: { vaos: [[0.08, 0.72]], alt: 0.42 } }, ms: 1100 },
      { arte: { opts: { vaos: [[0.08, 0.50]], alt: 0.42 } }, ms: 1100 },
      { arte: { opts: { vaos: [[0.08, 0.28]], alt: 0.42 } }, ms: 1100 }] },

  /* 12 --------------------------------------------------------------- */
  { n: 12, registro: 'ferramenta', acento: '#EFBE2E', olho: 'O que fica',
    secoes: [21, 22, 23],
    hed: 'O legado é a capacidade, não a ferramenta',
    apoio: 'Compreender o negócio, direcionar a atenção e coordenar ações com menos dependência de conhecimento tácito — e dez instrumentos editáveis para seguir sem refazer o assessment.',
    /* A costura do Camacho vira a figura do cliente, correndo como frente de
       onda. Cai na frase em que a capacidade passa a ser deles. */
    arte: { shape: 'weave', ramp: [0.06, 1], cell: 4, seed: 89 },
    beats: [{}, { arte: { morf: { de: 'weave', para: 'banana', eixo: 0 } }, ms: 2600 }] },
];

/* ==========================================================================
   SECOES — o documento

   As 23 seções do assessment, texto integral, para ler e imprimir.
   ========================================================================== */
export const SECOES = [
  { id: 1, rot: 'Objetivo', hed: 'Plano de Gestão e IA da Banana Milk',
    p: ['Diagnóstico, projetos prioritários e instrumentos para a próxima etapa do negócio.'],
    lista: ['compreender o momento atual da Banana Milk',
            'identificar problemas ainda não formulados dessa maneira',
            'transformar observações dispersas em um diagnóstico gerencial',
            'definir um Modelo de Gestão próprio para a empresa',
            'organizar os projetos prioritários',
            'deixar instrumentos que permitem continuar sem a consultoria'],
    listaOlho: 'O que este assessment se propõe a mostrar' },

  { id: 2, rot: 'Resumo executivo', hed: 'O crescimento tornou as decisões mais interdependentes',
    blocos: [
      ['Situação', 'A Banana Milk cresceu. Com isso, aumentaram o número de clientes, produtos, parceiros, negociações e decisões que exigem combinar informações de áreas diferentes.'],
      ['Diagnóstico', 'Os sistemas, os dados e os responsáveis existem. O principal custo oculto está no tempo e no esforço necessários para transformar registros operacionais em uma resposta gerencial e, depois, em ação.'],
      ['Resultado esperado', 'Melhor decisão + menor esforço operacional + maior capacidade de escala.'],
    ],
    lista: ['Informações Gerenciais ao Alcance', 'DRE Gerencial, Margem e Precificação',
            'Gestão de Shelf Life', 'Recompra e Acompanhamento Comercial'],
    listaOlho: 'Recomendação — construir o Modelo de Gestão Banana Milk e iniciar quatro projetos prioritários',
    nota: 'O diagnóstico não é que a Banana Milk cresceu sem gestão. O crescimento trouxe decisões que atravessam várias funções e precisam de uma camada gerencial própria.' },

  { id: 3, rot: 'O que mudou', hed: 'O crescimento adicionou novas perguntas ao negócio',
    tabela: { cols: ['Perguntas operacionais', 'Novas perguntas gerenciais'], linhas: [
      ['Quanto vendemos?', 'Onde estamos crescendo com rentabilidade?'],
      ['Temos estoque?', 'Quanto temos por SKU e lote, e onde há risco?'],
      ['Quem comprou?', 'Quem deveria ter recomprado e ainda não comprou?'],
      ['Qual é o preço?', 'Qual condição comercial conseguimos sustentar?'],
      ['O produto foi entregue?', 'Quanto ainda está parado no mercado?'],
      ['Qual foi o resultado?', 'O que explica o resultado e como podemos alterá-lo?'] ] },
    p: ['As perguntas antigas continuam importantes. O crescimento acrescentou perguntas que exigem combinar finanças, estoque, comercial, logística e informações do mercado.'],
    nota: 'O ponto central não é produzir mais relatórios. É responder perguntas mais complexas sem reconstruir manualmente toda a lógica do negócio.' },

  { id: 4, rot: 'As perspectivas', hed: 'A operação produz informação. A síntese gerencial ainda exige esforço',
    tabela: { cols: ['Participante', 'Perspectiva principal'], linhas: [
      ['BPO e contabilidade', 'Conformidade, classificação e fechamento'],
      ['Estoque e logística', 'Disponibilidade, movimentação e entrega'],
      ['Comercial', 'Clientes, pedidos, redes e negociação'],
      ['Promotores', 'Execução nas lojas e situação da gôndola'],
      ['Atendimento', 'Dúvidas, problemas e percepção do consumidor'],
      ['Sistemas', 'Registro e processamento das transações'],
      ['Fundadores', 'Compreensão do negócio como um todo'] ] },
    p: ['As decisões dos fundadores surgem da combinação dessas perspectivas, não de uma delas isoladamente.'],
    nota: 'O BPO não está errado por olhar conformidade. A logística não está errada por priorizar entrega. A lacuna está no espaço entre as funções, onde as informações precisam ser combinadas para responder a uma decisão.' },

  { id: 5, rot: 'Latência gerencial', hed: 'O principal custo oculto é o intervalo entre fato e ação',
    passos: ['um fato acontecer', 'a informação ser registrada',
             'os fundadores compreenderem seu significado', 'uma decisão ser tomada',
             'alguém agir', 'o resultado ser acompanhado'],
    passosOlho: 'É o tempo e o esforço entre',
    lista: ['a mesma pergunta precisa ser reconstruída mais de uma vez',
            'a resposta depende de quem sabe localizar e interpretar o relatório',
            'riscos são percebidos quando a janela de ação já diminuiu',
            'prioridades dependem de alguém lembrar, procurar ou perguntar'],
    listaOlho: 'Sinais dessa latência',
    nota: '"Latência gerencial" é uma formulação do assessment. Ela une problemas que antes apareciam como dificuldades separadas de relatório, shelf life, recompra e coordenação.' },

  { id: 6, rot: 'Três pontos críticos', hed: 'A latência gerencial aparece em três pontos',
    blocos: [
      ['1 · Resultado econômico', 'Os relatórios existem, mas decisões como uma nova proposta comercial exigem combinar preço, volume, bonificação, CMV, impostos, frete, comissão, promotoria e prazo.'],
      ['2 · Produtos no mercado', 'Os dados internos existem, mas a visibilidade diminui depois que os produtos entram em distribuidores, redes e lojas.'],
      ['3 · Acompanhamento comercial', 'Recompra, promotores, fotos, pendências e contatos ainda dependem de disciplina e memória individual.'],
    ],
    p: ['Quanto maior a operação, maior tende a ser o esforço para decidir e coordenar, caso o modelo de gestão não evolua.'] },

  { id: 7, rot: 'Resultado econômico', hed: 'A DRE registra o resultado, mas ainda não permite explorar todas as causas',
    blocos: [
      ['O que já existe', 'DRE e relatórios produzidos pelo BPO; CMV, CMC e demais categorias; informações de receitas, custos e despesas; acompanhamento por caixa e competência, conforme a necessidade do relatório.'],
      ['Achado do assessment', 'Na análise realizada, contas de CMC visíveis e sem código de plano de contas não apareciam incorporadas aos subtotais e ao resultado apresentado.'],
      ['Implicação', 'Um relatório pode estar correto conforme sua parametrização e, ainda assim, não responder integralmente à pergunta gerencial feita pelos fundadores.'],
      ['Direção proposta', 'Criar um modelo econômico reconciliado, explicável e consultável, preservando a visão contábil e acrescentando a visão necessária para decisão.'],
    ],
    nota: 'O valor do achado não está apenas na conta específica. Ele mostra que exibição, classificação e participação no resultado são coisas diferentes. A versão final deve ser reconciliada com o BPO antes de qualquer afirmação numérica definitiva.' },

  { id: 8, rot: 'Produtos no mercado', hed: 'O controle de shelf life perde visibilidade fora da empresa',
    blocos: [['Dentro da Banana Milk', 'O Omie registra estoque interno, lotes, validade, vendas e destino das mercadorias.']],
    lista: ['estoque disponível em cada rede ou loja', 'ritmo de venda', 'condição da gôndola',
            'ruptura', 'produtos que ainda precisam de ação comercial'],
    listaOlho: 'Depois da venda, a empresa não recebe automaticamente',
    p: ['O produto pode ainda estar fisicamente válido, mas já ter perdido parte de sua janela comercial.',
        'Shelf life não é apenas controle de estoque. É um sistema de detecção, relacionamento, priorização e ação no mercado.'] },

  { id: 9, rot: 'Acompanhamento comercial', hed: 'O acompanhamento depende de sinais que ainda não estão sistematizados',
    lista: ['identificar clientes sem novos pedidos', 'lembrar contatos', 'cobrar recompra',
            'solicitar informações às redes', 'acompanhar promotores', 'pedir fotos e evidências',
            'registrar pendências', 'decidir a próxima ação'],
    listaOlho: 'Atividades relevantes',
    p: ['Essas atividades são realizadas. O problema é que o gatilho para agir ainda depende muito de alguém lembrar, consultar ou perceber.'],
    lista2: ['regras', 'listas de ação', 'cadências', 'alertas', 'responsáveis', 'registro de resultado'],
    lista2Olho: 'Oportunidade — transformar acompanhamento individual em' },

  { id: 10, rot: 'Gestão por exceção', hed: 'A gestão precisa destacar exceções, não multiplicar relatórios',
    p: ['O modelo futuro não deve apenas mostrar tudo o que aconteceu. Ele deve destacar o que exige atenção agora.'],
    lista: ['lote que entrou em uma faixa de risco',
            'cliente que ultrapassou seu ciclo esperado de recompra',
            'proposta comercial abaixo da margem definida',
            'variação relevante na DRE sem explicação registrada',
            'rede sem atualização recente de estoque',
            'ação atribuída que não foi concluída no prazo'],
    listaOlho: 'Exemplos de exceção',
    passos: ['critério', 'fonte', 'responsável', 'prazo', 'plano de ação', 'acompanhamento do resultado'],
    passosOlho: 'Cada exceção precisa ter',
    nota: 'Essa é a passagem da gestão por consulta para a gestão por exceção. O objetivo não é substituir a leitura dos fundadores, mas direcionar sua atenção para o que pode mudar o resultado.' },

  { id: 11, rot: 'O Modelo de Gestão', hed: 'O Modelo de Gestão Banana Milk conecta informação, decisão e ação',
    passos: ['Perguntas gerenciais: o que os fundadores precisam saber',
             'Vocabulário oficial: o que cada conceito significa',
             'Fontes: onde a informação nasce e é registrada',
             'Métricas: como cada indicador é calculado',
             'Limites e exceções: quando algo exige atenção',
             'Rotinas: quando as informações são analisadas',
             'Responsabilidades: quem valida, decide e executa',
             'Interfaces: como a informação chega às pessoas'],
    passosOlho: 'Oito elementos',
    p: ['O conjunto de regras, informações e rotinas que permite compreender o negócio e transformar sinais em ações coordenadas.'] },

  { id: 12, rot: 'Como se constrói', hed: 'O modelo será construído sobre o que já existe',
    passos: ['Investigar as fontes e os fluxos atuais', 'registrar o vocabulário oficial',
             'reconciliar critérios e regras de cálculo', 'organizar o modelo gerencial de dados',
             'definir perguntas, indicadores e exceções', 'criar consultas e alertas',
             'ligar cada sinal a uma rotina e a um responsável',
             'aprender com as decisões e ampliar o modelo'],
    passosOlho: 'Sequência de construção',
    p: ['A Banana Milk não precisa esperar toda a base ficar pronta para receber valor. As primeiras entregas podem operar sobre perguntas e dados previamente validados, enquanto o modelo continua evoluindo.'] },

  { id: 13, rot: 'A porta de entrada', hed: 'O WhatsApp será a porta de entrada mais simples para o Modelo de Gestão',
    p: ['O WhatsApp não será apenas um chatbot.'],
    lista: ['fazer perguntas em linguagem natural', 'receber respostas fáceis de entender',
            'verificar fonte, período e atualização', 'comparar produtos, clientes e períodos',
            'receber alertas sobre exceções',
            'acessar o modelo sem precisar navegar por relatórios e filtros'],
    listaOlho: 'Ele permitirá aos fundadores',
    blocos: [
      ['Primeira versão', 'Um conjunto limitado de perguntas validadas sobre faturamento, estoque, lotes, clientes, SKUs e comparação entre períodos.'],
      ['Evolução', 'Ampliar gradualmente para explicações, cenários, recomendações e alertas proativos.'],
    ] },

  { id: 14, rot: 'A carteira', hed: 'Uma fundação e seis programas organizam a transformação',
    blocos: [['Fundação · Modelo de Gestão Banana Milk', 'Vocabulário, métricas, fontes, regras, responsabilidades, rotinas e exceções.']],
    programas: true,
    nota: 'Os programas não são etapas rígidas. Eles compartilham a mesma fundação e podem avançar em paralelo, com entregas diferentes ao longo do tempo.' },

  { id: 15, rot: 'Programa 01', programa: 'info', hed: 'Informações Gerenciais ao Alcance',
    p: ['Disponibilizar informações confiáveis, compreensíveis e acessíveis no ritmo dos fundadores.'],
    lista: ['biblioteca de perguntas gerenciais', 'modelo gerencial para as informações prioritárias',
            'respostas com fonte, período e atualização', 'consultas pelo WhatsApp',
            'comparações entre períodos, clientes e produtos',
            'registro das perguntas ainda não suportadas'],
    listaOlho: 'Primeiras entregas',
    lista2: ['tempo para obter uma resposta', 'percentual de perguntas respondidas com segurança',
             'uso pelos fundadores', 'redução de consultas manuais', 'facilidade de compreensão'],
    lista2Olho: 'Indicadores de sucesso',
    legado: 'A Banana Milk passa a possuir uma biblioteca explícita das perguntas usadas para gerir o negócio e das informações necessárias para respondê-las.' },

  { id: 16, rot: 'Programa 02', programa: 'dre', hed: 'DRE Gerencial, Margem e Precificação',
    p: ['Transformar os dados econômicos em um modelo que permita explicar resultados e avaliar decisões comerciais.'],
    lista: ['modelo de dados econômico-gerencial', 'reconciliação das contas e critérios',
            'estrutura de margem por SKU, cliente, canal e período',
            'tratamento de venda, bonificação e demais condições',
            'decomposição entre preço e margem de contribuição',
            'biblioteca de perguntas econômicas', 'especificação do simulador de propostas'],
    listaOlho: 'Primeiras entregas',
    lista2: ['preço de R$ 10,90 por unidade', 'volume', 'bonificação', 'CMV completo', 'impostos',
             'frete', 'comissão', 'promotoria e degustação', 'prazo de pagamento', 'margem resultante'],
    lista2Olho: 'Exemplo — uma proposta como a entrada no Oba deve permitir avaliar, conjuntamente',
    legado: 'Um modelo econômico que pode ser consultado, explicado e utilizado em futuras negociações, sem reconstruir a lógica a cada proposta.' },

  { id: 17, rot: 'Programa 03', programa: 'shelf', hed: 'Gestão de Shelf Life',
    p: ['Identificar produtos em risco e coordenar ações antes da perda de valor comercial.'],
    passos: ['base de lotes e validade', 'rastreabilidade de destino', 'coleta de estoque externo',
             'regras comerciais por rede', 'classificação de risco', 'responsáveis e prazos',
             'planos de ação', 'monitoramento de resultados'],
    passosOlho: 'Componentes',
    blocos: [['Primeira entrega', 'Um piloto com SKUs e redes selecionados, informações atualizadas, faixas de risco e uma rotina semanal de decisão.']],
    lista: ['percentual do estoque externo atualizado', 'unidades por faixa de risco',
            'tempo entre identificação e ação', 'percentual de ações concluídas',
            'perdas e promoções emergenciais evitadas'],
    listaOlho: 'Indicadores sugeridos',
    legado: 'Um guia operacional que define como a Banana Milk identifica risco, prioriza situações e coordena ações de shelf life.' },

  { id: 18, rot: 'Programa 03 · apoio', programa: 'shelf', hed: 'Os promotores podem formar uma rede de inteligência no mercado',
    p: ['O Programa de Relacionamento com Promotores não deve ser tratado apenas como coleta de formulários.'],
    lista: ['por que a informação é importante', 'o que precisam observar',
            'como responder com pouco esforço', 'como sua participação será reconhecida',
            'como a informação recebida produzirá ação'],
    listaOlho: 'Ele precisa estabelecer uma relação em que os promotores entendam',
    lista2: ['estoque aproximado', 'validade', 'ruptura', 'posição na gôndola', 'fotos',
             'concorrência', 'materiais de ponto de venda', 'execução de campanhas'],
    lista2Olho: 'Informações possíveis',
    p2: ['A mesma rede que apoia shelf life pode gerar inteligência para comercial, marca e execução no varejo.'],
    legado: 'O blueprint do programa, com proposta de valor, participantes, cadência, informações coletadas, critérios de qualidade e responsáveis.' },

  { id: 19, rot: 'Programa 04', programa: 'recompra', hed: 'Recompra e Acompanhamento Comercial',
    p: ['Garantir que clientes relevantes recebam acompanhamento no momento correto.'],
    lista: ['cliente', 'última compra', 'ciclo esperado de recompra', 'dias sem novo pedido',
            'SKUs comprados', 'responsável', 'próxima ação'],
    listaOlho: 'Primeira entrega — uma lista semanal contendo',
    lista2: ['regras de prioridade', 'cadências de contato', 'tarefas automáticas',
             'registro dos motivos de não recompra', 'acompanhamento da receita recuperada',
             'recomendações de próxima ação'],
    lista2Olho: 'Evolução',
    legado: 'Uma rotina comercial explícita, que não depende apenas de memória ou agenda individual.' },

  { id: 20, rot: 'Os 90 dias', hed: 'A implementação começa com frentes paralelas',
    tabela: { cols: ['Frente', 'Dias 1 a 30', 'Dias 31 a 60', 'Dias 61 a 90'], linhas: [
      ['Modelo de Gestão', 'Mapear conceitos, fontes, perguntas e responsáveis', 'Formalizar métricas, regras e exceções', 'Validar e incorporar aprendizados dos pilotos'],
      ['Informações ao Alcance', 'Definir perguntas e dados prioritários', 'Testar consultas pelo WhatsApp', 'Ampliar perguntas e iniciar alertas'],
      ['DRE e Margem', 'Reconciliar contas, critérios e dimensões', 'Construir o modelo econômico inicial', 'Validar com propostas e decisões reais'],
      ['Shelf Life', 'Selecionar SKUs, redes e critérios de risco', 'Operar coleta e reunião semanal', 'Medir, ajustar e preparar automações'],
      ['Promotores', 'Definir proposta de valor e participantes', 'Operar o primeiro grupo', 'Avaliar participação e expansão'],
      ['Recompra', 'Definir ciclos e prioridades', 'Operar a lista semanal', 'Automatizar tarefas selecionadas'] ] },
    lista: ['primeira versão do Modelo de Gestão Banana Milk',
            'consultas gerenciais controladas pelo WhatsApp', 'modelo econômico inicial',
            'piloto de shelf life em operação', 'grupo piloto de promotores',
            'rotina semanal de recompra'],
    listaOlho: 'Resultado esperado ao final dos 90 dias' },

  { id: 21, rot: 'O que fica', hed: 'A Banana Milk recebe instrumentos para continuar sozinha',
    passos: ['Vocabulário Oficial Banana Milk', 'Dicionário de Indicadores',
             'Matriz de Decisões Gerenciais', 'Mapa de Fontes e Fluxos de Informação',
             'Biblioteca de Perguntas do WhatsApp', 'Portfólio e Fichas dos Projetos',
             'Guia Operacional de Shelf Life', 'Blueprint do Programa de Promotores',
             'Plano de Ação de 90 dias', 'Matriz de Responsabilidades'],
    passosOlho: 'Ferramentas de gestão',
    p: ['Cada ferramenta será entregue em formato editável. A empresa poderá utilizar os materiais internamente ou contratar futuras implementações sem refazer o assessment.'] },

  { id: 22, rot: 'O legado', hed: 'O principal legado é uma nova capacidade de gestão',
    lista: ['responder perguntas gerenciais com fonte e critérios conhecidos',
            'identificar exceções antes que virem urgências',
            'avaliar propostas com uma visão econômica mais completa',
            'coordenar shelf life com informações internas e externas',
            'transformar promotores em uma fonte confiável de inteligência',
            'sistematizar recompra e acompanhamento comercial',
            'contratar ou desenvolver soluções futuras a partir de especificações próprias'],
    listaOlho: 'Ao final, a Banana Milk deverá ser capaz de',
    p: ['O legado não é uma ferramenta específica. É a capacidade de compreender o negócio, direcionar a atenção e coordenar ações com menos dependência de conhecimento tácito.'] },

  { id: 23, rot: 'Para começar', hed: 'Decisões necessárias para iniciar',
    passos: ['quais programas começarão nos primeiros 90 dias',
             'quem será responsável por cada programa',
             'quais perguntas entrarão na primeira versão do WhatsApp',
             'quais decisões a primeira versão do modelo econômico deverá apoiar',
             'quais SKUs e redes participarão do piloto de shelf life',
             'quais promotores participarão da primeira etapa',
             'quais pessoas, dados e parceiros estarão disponíveis',
             'qual capacidade de investimento e execução será destinada à implementação'],
    passosOlho: 'Os fundadores precisam decidir',
    p: ['O Modelo de Gestão Banana Milk começa quando cada pergunta relevante passa a ter uma fonte, uma regra, um responsável e uma ação possível.'] },
];

/* Pendências do assessment. Não viram slide nem seção do documento do cliente:
   são de quem apresenta. Só a visão de apresentador (?notas=1). */
export const PENDENCIAS = [
  'reconciliação do achado da DRE com o BPO',
  'nomenclatura oficial de CMV e CMC utilizada pela Banana Milk',
  'lista final dos indicadores existentes',
  'número exato de perguntas da primeira versão do WhatsApp',
  'SKUs, redes e promotores do piloto de shelf life',
  'responsáveis internos por cada programa',
  'capacidade de investimento e execução',
  'escopo exato dos materiais que serão entregues como legado',
];

/* --- Conferências -------------------------------------------------------- */

export function campoDaParada(p) {
  return p.campo || (p.registro && REGISTRO_EDITORIAL[p.registro].campo) || 'escuro';
}

/* A config do grafismo no beat k: parte do estado inicial e aplica, em ordem,
   o `arte` de cada beat até k — para que voltar um passo assente no estado
   final do anterior em vez de reproduzir a animação de trás para frente. */
export function arteNoBeat(p, k) {
  if (!p.arte) return null;
  let cfg = { ...p.arte };
  for (let i = 1; i <= k && i < p.beats.length; i++) {
    const b = p.beats[i];
    if (b && b.arte) cfg = { ...cfg, ...b.arte, opts: { ...cfg.opts, ...(b.arte.opts || {}) } };
  }
  return cfg;
}

/* Seções que nenhuma parada representa. Se voltar não-vazio, ou o roteiro
   perdeu um argumento, ou aquela seção é conteúdo que ninguém precisa ver
   projetado — e vale saber qual das duas antes de apresentar. */
export function secoesOrfas() {
  const cobertas = new Set(PARADAS.flatMap((p) => p.secoes || []));
  return SECOES.filter((s) => !cobertas.has(s.id)).map((s) => s.id);
}
