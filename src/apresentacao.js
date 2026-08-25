/* ==========================================================================
   Apresentação · Plano de Gestão e IA da Banana Milk

   As 23 cenas como dado. O texto é do documento editorial do assessment e não
   é reescrito aqui — este arquivo decide COMO cada argumento aparece, nunca
   QUAL argumento aparece.

   Uma lista só. Duas listas paralelas para a mesma peça é a divergência que
   este repositório já cometeu, e o cabeçalho de src/kv.js foi escrito para
   impedir que se repita.
   ========================================================================== */

/* --- Os quatro registros -------------------------------------------------

   O documento editorial exige manter distintos diagnóstico, recomendação,
   implementação futura e ferramenta entregue — e proíbe descrever a Banana
   Milk como desorganizada ou sugerir que o BPO erra.

   Uma regra dessas não sobrevive só na copy: em 23 slides ela colapsa na
   terceira leitura, e aí o diagnóstico começa a soar como acusação. Então
   cada registro ganha campo e voz próprios, e a distinção passa a ser visível
   a um metro de distância, antes de qualquer palavra ser lida. */
/* Nome comprido de propósito: `REGISTROS` já existe em src/direcao.js, com
   outro significado (os registros de direção de arte). Os dois módulos são
   embutidos no MESMO escopo pelo build, então uma página que importasse os
   dois declararia a mesma const duas vezes e morreria com SyntaxError — sem
   que guard nenhum pegasse, porque o arquivo sai inteiro. */
export const REGISTRO_EDITORIAL = {
  diagnostico:   { rotulo: 'Diagnóstico',   campo: 'escuro' },
  recomendacao:  { rotulo: 'Recomendação',  campo: 'papel' },
  implementacao: { rotulo: 'Implementação', campo: 'papel' },
  ferramenta:    { rotulo: 'O que fica',    campo: 'cliente' },
};

/* --- Os acentos da Banana Milk -------------------------------------------

   O campo de papel do Camacho é #F2F0EE. A base da embalagem da Banana Milk é
   o mesmo creme com tipo preto — as duas marcas já dividem o terreno, e a
   conexão não precisa ser construída, precisa ser notada. O que visita é o
   acento de cada sabor, e ele vive AQUI, na peça: nenhum token novo de cor
   entra na fundação do sistema. É a diferença entre citar a cor do cliente e
   adotá-la.

   ATENÇÃO: estes valores foram lidos de uma captura da embalagem, não de um
   arquivo da marca. Trocar pelos oficiais antes de apresentar. */
export const ACENTOS = {
  coral:   '#D9503F',
  amarelo: '#EFBE2E',
  cacau:   '#7A4A2E',
  azul:    '#8FB4C6',
};

/* Marcadores de ativo que ainda não chegou. A peça mostra uma placa com o
   nome do arquivo que falta, em vez de um retângulo vazio fingindo que está
   resolvido — que é como um slot esquecido chega na frente do cliente. */
export const ATIVOS = {
  logo:  { arquivo: 'cliente/logo.svg',        o: 'logotipo em vetor' },
  pack:  { arquivo: 'cliente/pack-*.png',      o: 'os quatro packshots' },
  foto:  { arquivo: 'cliente/foto-1.jpg',      o: 'foto do litoral' },
  filme: { arquivo: 'cliente/filme.mp4',       o: 'o filme' },
};

const G = (...itens) => itens.map(([h, p]) => ({ h, p }));

/* --- As cenas ------------------------------------------------------------

   `arte` é a config do motor no estado inicial. `beats` são os passos: cada
   seta avança um beat, e um beat pode revelar conteúdo (`mostra`) e/ou mover
   o grafismo (`arte`, interpolado a partir do estado anterior).

   O primeiro beat é sempre o estado de entrada. */
export const CENAS = [

  /* 01 ------------------------------------------------------------------ */
  { n: 1, campo: 'escuro', capa: true,
    sangria: true,
    hed: 'Plano de Gestão<br>e IA da Banana Milk',
    corpo: 'Diagnóstico, projetos prioritários e instrumentos para a próxima etapa do negócio.',
    rodape: 'AI Assessment & Opportunities',
    arte: { shape: 'weave', ramp: [0.04, 0.16], cell: 4, seed: 7,
            clareira: [{ x: -0.05, y: -0.05, w: 0.80, h: 0.82, soft: 0.075, piso: 0.015 }] },
    beats: [{}, { arte: { ramp: [0.04, 1] }, ms: 1800 }] },

  /* 02 ------------------------------------------------------------------ */
  { n: 2, registro: 'recomendacao', olho: 'Resumo executivo',
    hed: 'O crescimento tornou as decisões mais interdependentes',
    blocos: [
      ['Situação', 'A Banana Milk cresceu. Com isso, aumentaram o número de clientes, produtos, parceiros, negociações e decisões que exigem combinar informações de áreas diferentes.'],
      ['Diagnóstico', 'Os sistemas, os dados e os responsáveis existem. O principal custo oculto está no tempo e no esforço necessários para transformar registros operacionais em uma resposta gerencial e, depois, em ação.'],
    ],
    lista: ['Informações Gerenciais ao Alcance',
            'DRE Gerencial, Margem e Precificação',
            'Gestão de Shelf Life',
            'Recompra e Acompanhamento Comercial'],
    listaOlho: 'Recomendação — construir o Modelo de Gestão Banana Milk e iniciar quatro projetos prioritários',
    fecho: 'Melhor decisão + menor esforço operacional + maior capacidade de escala.',
    nota: 'O diagnóstico não é que a Banana Milk cresceu sem gestão. O crescimento trouxe decisões que atravessam várias funções e precisam de uma camada gerencial própria.',
    arte: { shape: 'noiseToSignal', ramp: [0.03, 0.3], cell: 8, seed: 11 },
    beats: [{}, { mostra: 1 }, { mostra: 2, arte: { ramp: [0.03, 1], cell: 4 }, ms: 1400 }, { mostra: 3 }] },

  /* 03 ------------------------------------------------------------------ */
  { n: 3, registro: 'diagnostico',
    hed: 'O crescimento adicionou novas perguntas ao negócio',
    tabela: {
      cols: ['Perguntas operacionais', 'Novas perguntas gerenciais'],
      linhas: [
        ['Quanto vendemos?', 'Onde estamos crescendo com rentabilidade?'],
        ['Temos estoque?', 'Quanto temos por SKU e lote, e onde há risco?'],
        ['Quem comprou?', 'Quem deveria ter recomprado e ainda não comprou?'],
        ['Qual é o preço?', 'Qual condição comercial conseguimos sustentar?'],
        ['O produto foi entregue?', 'Quanto ainda está parado no mercado?'],
        ['Qual foi o resultado?', 'O que explica o resultado e como podemos alterá-lo?'],
      ] },
    fecho: 'As perguntas antigas continuam importantes. O crescimento acrescentou perguntas que exigem combinar finanças, estoque, comercial, logística e informações do mercado.',
    nota: 'O ponto central não é produzir mais relatórios. É responder perguntas mais complexas sem reconstruir manualmente toda a lógica do negócio.',
    arte: { shape: 'interferencia', ramp: [0.1, 0.9], cell: 5, seed: 5, opts: { giro: 11, passo: 0.09 } },
    beats: [{}, { mostra: 1 }, { mostra: 2 }] },

  /* 04 ------------------------------------------------------------------ */
  { n: 4, registro: 'diagnostico',
    hed: 'A operação produz informação.<br>A síntese gerencial ainda exige esforço',
    tabela: {
      cols: ['Participante', 'Perspectiva principal'],
      linhas: [
        ['BPO e contabilidade', 'Conformidade, classificação e fechamento'],
        ['Estoque e logística', 'Disponibilidade, movimentação e entrega'],
        ['Comercial', 'Clientes, pedidos, redes e negociação'],
        ['Promotores', 'Execução nas lojas e situação da gôndola'],
        ['Atendimento', 'Dúvidas, problemas e percepção do consumidor'],
        ['Sistemas', 'Registro e processamento das transações'],
        ['Fundadores', 'Compreensão do negócio como um todo'],
      ] },
    fecho: 'As decisões dos fundadores surgem da combinação dessas perspectivas, não de uma delas isoladamente.',
    nota: 'O BPO não está errado por olhar conformidade. A logística não está errada por priorizar entrega. A lacuna está no espaço entre as funções, onde as informações precisam ser combinadas para responder a uma decisão.',
    /* Duas grades desalinhadas: o ruído não está em nenhuma das duas, está na
       relação. É o comentário do próprio campo, e é a frase deste slide. */
    arte: { shape: 'interferencia', ramp: [0.12, 1], cell: 5, seed: 13, opts: { giro: 14, passo: 0.09 } },
    beats: [{}, { mostra: 1 }, { mostra: 2, arte: { opts: { giro: 0.4, passo: 0.09 } }, ms: 2000 }] },

  /* 05 ------------------------------------------------------------------ */
  { n: 5, registro: 'diagnostico', olho: 'Latência gerencial',
    sangria: true,
    hed: 'O principal custo oculto é o intervalo entre fato e ação',
    passos: ['um fato acontecer', 'a informação ser registrada',
             'os fundadores compreenderem seu significado', 'uma decisão ser tomada',
             'alguém agir', 'o resultado ser acompanhado'],
    lista: ['a mesma pergunta precisa ser reconstruída mais de uma vez',
            'a resposta depende de quem sabe localizar e interpretar o relatório',
            'riscos são percebidos quando a janela de ação já diminuiu',
            'prioridades dependem de alguém lembrar, procurar ou perguntar'],
    listaOlho: 'Sinais dessa latência',
    nota: '"Latência gerencial" é uma formulação do assessment. Ela une problemas que antes apareciam como dificuldades separadas de relatório, shelf life, recompra e coordenação.',
    arte: { shape: 'fill', ramp: [0.04, 1], cell: 4, seed: 3, curve: 1.9,
            clareira: [{ x: -0.05, y: -0.05, w: 0.66, h: 1.1, soft: 0.075, piso: 0.015 }] },
    beats: [{}, { mostra: 1 }, { mostra: 2 }] },

  /* 06 ------------------------------------------------------------------ */
  { n: 6, registro: 'diagnostico',
    hed: 'A latência gerencial aparece em três pontos críticos',
    grade: G(
      ['1 · Resultado econômico', 'Os relatórios existem, mas decisões como uma nova proposta comercial exigem combinar preço, volume, bonificação, CMV, impostos, frete, comissão, promotoria e prazo.'],
      ['2 · Produtos no mercado', 'Os dados internos existem, mas a visibilidade diminui depois que os produtos entram em distribuidores, redes e lojas.'],
      ['3 · Acompanhamento comercial', 'Recompra, promotores, fotos, pendências e contatos ainda dependem de disciplina e memória individual.']),
    cols: 3,
    fecho: 'Quanto maior a operação, maior tende a ser o esforço para decidir e coordenar, caso o modelo de gestão não evolua.',
    arte: { shape: 'bars', ramp: [0.14, 0.9], cell: 4, seed: 17, opts: { cols: 3, rows: 1, duty: 0.72 } },
    beats: [{}, { mostra: 1 }, { mostra: 2 }] },

  /* 07 ------------------------------------------------------------------ */
  { n: 7, registro: 'diagnostico',
    hed: 'A DRE registra o resultado, mas ainda não permite explorar todas as causas',
    blocos: [
      ['O que já existe', 'DRE e relatórios produzidos pelo BPO; CMV, CMC e demais categorias; informações de receitas, custos e despesas; acompanhamento por caixa e competência, conforme a necessidade do relatório.'],
      ['Achado do assessment', 'Na análise realizada, contas de CMC visíveis e sem código de plano de contas não apareciam incorporadas aos subtotais e ao resultado apresentado.'],
      ['Implicação', 'Um relatório pode estar correto conforme sua parametrização e, ainda assim, não responder integralmente à pergunta gerencial feita pelos fundadores.'],
      ['Direção proposta', 'Criar um modelo econômico reconciliado, explicável e consultável, preservando a visão contábil e acrescentando a visão necessária para decisão.'],
    ],
    nota: 'O valor do achado não está apenas na conta específica. Ele mostra que exibição, classificação e participação no resultado são coisas diferentes. A versão final deve ser reconciliada com o BPO antes de qualquer afirmação numérica definitiva.',
    arte: { shape: 'layers', ramp: [0.1, 0.92], cell: 4, seed: 23, opts: { n: 5 } },
    beats: [{}, { mostra: 1 }, { mostra: 2 }, { mostra: 3 }, { mostra: 4 }] },

  /* 08 ------------------------------------------------------------------ */
  { n: 8, registro: 'diagnostico',
    hed: 'O controle de shelf life perde visibilidade fora da empresa',
    blocos: [
      ['Dentro da Banana Milk', 'O Omie registra estoque interno, lotes, validade, vendas e destino das mercadorias.'],
    ],
    lista: ['estoque disponível em cada rede ou loja', 'ritmo de venda',
            'condição da gôndola', 'ruptura', 'produtos que ainda precisam de ação comercial'],
    listaOlho: 'Depois da venda, a empresa não recebe automaticamente',
    fecho: 'O produto pode ainda estar fisicamente válido, mas já ter perdido parte de sua janela comercial. Shelf life não é apenas controle de estoque: é um sistema de detecção, relacionamento, priorização e ação no mercado.',
    /* A rampa cai da esquerda para a direita: denso dentro, disperso fora.
       O grafismo é a própria perda de visibilidade, não uma ilustração dela. */
    arte: { shape: 'fill', ramp: [1, 0.05], cell: 4, seed: 29, curve: 0.8 },
    beats: [{}, { mostra: 1 }, { mostra: 2 }] },

  /* 09 ------------------------------------------------------------------ */
  { n: 9, registro: 'diagnostico',
    hed: 'O acompanhamento comercial depende de sinais que ainda não estão sistematizados',
    lista: ['identificar clientes sem novos pedidos', 'lembrar contatos', 'cobrar recompra',
            'solicitar informações às redes', 'acompanhar promotores',
            'pedir fotos e evidências', 'registrar pendências', 'decidir a próxima ação'],
    listaOlho: 'Atividades relevantes',
    fecho: 'Essas atividades são realizadas. O problema é que o gatilho para agir ainda depende muito de alguém lembrar, consultar ou perceber.',
    arte: { shape: 'cohort', ramp: [0.08, 0.7], cell: 4, seed: 31 },
    beats: [{}, { mostra: 1 }, { mostra: 2 }] },

  /* 10 ------------------------------------------------------------------ */
  { n: 10, registro: 'recomendacao',
    sangria: true,
    hed: 'A gestão precisa destacar exceções, não multiplicar relatórios',
    corpo: 'O modelo futuro não deve apenas mostrar tudo o que aconteceu. Ele deve destacar o que exige atenção agora.',
    lista: ['lote que entrou em uma faixa de risco',
            'cliente que ultrapassou seu ciclo esperado de recompra',
            'proposta comercial abaixo da margem definida',
            'variação relevante na DRE sem explicação registrada',
            'rede sem atualização recente de estoque',
            'ação atribuída que não foi concluída no prazo'],
    listaOlho: 'Exemplos de exceção',
    passos: ['critério', 'fonte', 'responsável', 'prazo', 'plano de ação', 'acompanhamento do resultado'],
    passosOlho: 'Cada exceção precisa ter',
    nota: 'Essa é a passagem da gestão por consulta para a gestão por exceção. O objetivo não é substituir a leitura dos fundadores, mas direcionar sua atenção para o que pode mudar o resultado.',
    /* A clareira abrindo é a atenção pousando: a densidade desaba numa região
       e o resto continua lá. É a operação que o slide descreve. */
    /* A clareira nasce fechada e abre: a atenção pousando numa região do
       campo. O tipo mora dentro dela, então ela também é o que impede o
       grafismo de cruzar a tipografia. */
    arte: { shape: 'fill', ramp: [0.5, 1], cell: 4, seed: 37,
            clareira: [{ x: -0.05, y: -0.05, w: 0.36, h: 1.1, soft: 0.075, piso: 0.015 }] },
    beats: [{}, { arte: { clareira: [{ x: -0.05, y: -0.05, w: 0.72, h: 1.1, soft: 0.075, piso: 0.015 }] }, ms: 1400 },
            { mostra: 1 }, { mostra: 2 }] },

  /* 11 ------------------------------------------------------------------ */
  { n: 11, registro: 'recomendacao',
    hed: 'O Modelo de Gestão Banana Milk conecta informação, decisão e ação',
    grade: G(
      ['01 Perguntas gerenciais', 'o que os fundadores precisam saber'],
      ['02 Vocabulário oficial', 'o que cada conceito significa'],
      ['03 Fontes', 'onde a informação nasce e é registrada'],
      ['04 Métricas', 'como cada indicador é calculado'],
      ['05 Limites e exceções', 'quando algo exige atenção'],
      ['06 Rotinas', 'quando as informações são analisadas'],
      ['07 Responsabilidades', 'quem valida, decide e executa'],
      ['08 Interfaces', 'como a informação chega às pessoas']),
    cols: 4,
    fecho: 'O conjunto de regras, informações e rotinas que permite compreender o negócio e transformar sinais em ações coordenadas.',
    arte: { shape: 'mesh', ramp: [0.1, 0.5], cell: 4, seed: 41, opts: { cols: 4, rows: 2 } },
    beats: [{}, { mostra: 1, arte: { ramp: [0.1, 1] }, ms: 1400 }, { mostra: 2 }] },

  /* 12 ------------------------------------------------------------------ */
  { n: 12, registro: 'implementacao',
    hed: 'O modelo será construído sobre o que já existe',
    passos: ['Investigar as fontes e os fluxos atuais', 'registrar o vocabulário oficial',
             'reconciliar critérios e regras de cálculo', 'organizar o modelo gerencial de dados',
             'definir perguntas, indicadores e exceções', 'criar consultas e alertas',
             'ligar cada sinal a uma rotina e a um responsável',
             'aprender com as decisões e ampliar o modelo'],
    passosOlho: 'Sequência de construção',
    fecho: 'A Banana Milk não precisa esperar toda a base ficar pronta para receber valor. As primeiras entregas podem operar sobre perguntas e dados previamente validados, enquanto o modelo continua evoluindo.',
    arte: { shape: 'staircase', ramp: [0.08, 0.95], cell: 4, seed: 43, opts: { steps: 8 } },
    beats: [{}, { mostra: 1 }, { mostra: 2 }] },

  /* 13 ------------------------------------------------------------------ */
  { n: 13, registro: 'recomendacao',
    hed: 'O WhatsApp será a porta de entrada mais simples para o Modelo de Gestão',
    corpo: 'O WhatsApp não será apenas um chatbot.',
    lista: ['fazer perguntas em linguagem natural', 'receber respostas fáceis de entender',
            'verificar fonte, período e atualização', 'comparar produtos, clientes e períodos',
            'receber alertas sobre exceções',
            'acessar o modelo sem precisar navegar por relatórios e filtros'],
    listaOlho: 'Ele permitirá aos fundadores',
    blocos: [
      ['Primeira versão', 'Um conjunto limitado de perguntas validadas sobre faturamento, estoque, lotes, clientes, SKUs e comparação entre períodos.'],
      ['Evolução', 'Ampliar gradualmente para explicações, cenários, recomendações e alertas proativos.'],
    ],
    arte: { shape: 'handoff', ramp: [0.12, 1], cell: 4, seed: 47 },
    beats: [{}, { mostra: 1 }, { mostra: 2 }, { mostra: 3 }] },

  /* 14 ------------------------------------------------------------------ */
  { n: 14, registro: 'recomendacao',
    hed: 'Uma fundação e seis programas organizam a transformação',
    blocos: [['Fundação · Modelo de Gestão Banana Milk',
              'Vocabulário, métricas, fontes, regras, responsabilidades, rotinas e exceções.']],
    grade: G(
      ['01 Informações Gerenciais ao Alcance', 'acesso e compreensão'],
      ['02 DRE Gerencial, Margem e Precificação', 'controle econômico'],
      ['03 Gestão de Shelf Life', 'antecipação e redução de perdas'],
      ['04 Recompra e Acompanhamento Comercial', 'disciplina comercial e crescimento'],
      ['05 Automação do Atendimento B2C', 'eficiência e aprendizado — programa seguinte'],
      ['06 Planejamento de Demanda e Produção', 'previsibilidade — programa seguinte']),
    cols: 3,
    nota: 'Os programas não são etapas rígidas. Eles compartilham a mesma fundação e podem avançar em paralelo, com entregas diferentes ao longo do tempo.',
    arte: { shape: 'orbit', ramp: [0.1, 0.95], cell: 4, seed: 53, opts: { nodes: 6 } },
    beats: [{}, { mostra: 1 }, { mostra: 2 }] },

  /* 15–19 · os programas ------------------------------------------------ */
  { n: 15, registro: 'implementacao', olho: 'Programa 01',
    hed: 'Informações Gerenciais ao Alcance',
    corpo: 'Disponibilizar informações confiáveis, compreensíveis e acessíveis no ritmo dos fundadores.',
    duasListas: {
      a: ['biblioteca de perguntas gerenciais', 'modelo gerencial para as informações prioritárias',
          'respostas com fonte, período e atualização', 'consultas pelo WhatsApp',
          'comparações entre períodos, clientes e produtos',
          'registro das perguntas ainda não suportadas'],
      aOlho: 'Primeiras entregas',
      b: ['tempo para obter uma resposta', 'percentual de perguntas respondidas com segurança',
          'uso pelos fundadores', 'redução de consultas manuais', 'facilidade de compreensão'],
      bOlho: 'Indicadores de sucesso' },
    legado: 'A Banana Milk passa a possuir uma biblioteca explícita das perguntas usadas para gerir o negócio e das informações necessárias para respondê-las.',
    arte: { shape: 'gauge', ramp: [0.14, 1], cell: 4, seed: 59 },
    beats: [{}, { mostra: 1 }, { mostra: 2 }] },

  { n: 16, registro: 'implementacao', olho: 'Programa 02',
    hed: 'DRE Gerencial, Margem e Precificação',
    corpo: 'Transformar os dados econômicos em um modelo que permita explicar resultados e avaliar decisões comerciais.',
    duasListas: {
      a: ['modelo de dados econômico-gerencial', 'reconciliação das contas e critérios',
          'estrutura de margem por SKU, cliente, canal e período',
          'tratamento de venda, bonificação e demais condições',
          'decomposição entre preço e margem de contribuição',
          'biblioteca de perguntas econômicas', 'especificação do simulador de propostas'],
      aOlho: 'Primeiras entregas',
      b: ['preço de R$ 10,90 por unidade', 'volume', 'bonificação', 'CMV completo', 'impostos',
          'frete', 'comissão', 'promotoria e degustação', 'prazo de pagamento', 'margem resultante'],
      bOlho: 'Exemplo — uma proposta como a entrada no Oba deve permitir avaliar, conjuntamente' },
    legado: 'Um modelo econômico que pode ser consultado, explicado e utilizado em futuras negociações, sem reconstruir a lógica a cada proposta.',
    arte: { shape: 'layers', ramp: [0.06, 0.4], cell: 4, seed: 61, opts: { n: 6 } },
    beats: [{}, { mostra: 1, arte: { ramp: [0.06, 1] }, ms: 1400 }, { mostra: 2 }] },

  { n: 17, registro: 'implementacao', olho: 'Programa 03',
    hed: 'Gestão de Shelf Life',
    corpo: 'Identificar produtos em risco e coordenar ações antes da perda de valor comercial.',
    passos: ['base de lotes e validade', 'rastreabilidade de destino', 'coleta de estoque externo',
             'regras comerciais por rede', 'classificação de risco', 'responsáveis e prazos',
             'planos de ação', 'monitoramento de resultados'],
    passosOlho: 'Componentes',
    blocos: [['Primeira entrega', 'Um piloto com SKUs e redes selecionados, informações atualizadas, faixas de risco e uma rotina semanal de decisão.']],
    lista: ['percentual do estoque externo atualizado', 'unidades por faixa de risco',
            'tempo entre identificação e ação', 'percentual de ações concluídas',
            'perdas e promoções emergenciais evitadas'],
    listaOlho: 'Indicadores sugeridos',
    legado: 'Um guia operacional que define como a Banana Milk identifica risco, prioriza situações e coordena ações de shelf life.',
    arte: { shape: 'funnel', ramp: [0.1, 1], cell: 4, seed: 67 },
    beats: [{}, { mostra: 1 }, { mostra: 2 }, { mostra: 3 }] },

  { n: 18, registro: 'implementacao', olho: 'Programa 03 · apoio',
    hed: 'Os promotores podem formar uma rede de inteligência no mercado',
    corpo: 'O Programa de Relacionamento com Promotores não deve ser tratado apenas como coleta de formulários.',
    duasListas: {
      a: ['por que a informação é importante', 'o que precisam observar',
          'como responder com pouco esforço', 'como sua participação será reconhecida',
          'como a informação recebida produzirá ação'],
      aOlho: 'Ele precisa estabelecer uma relação em que os promotores entendam',
      b: ['estoque aproximado', 'validade', 'ruptura', 'posição na gôndola', 'fotos',
          'concorrência', 'materiais de ponto de venda', 'execução de campanhas'],
      bOlho: 'Informações possíveis' },
    fecho: 'A mesma rede que apoia shelf life pode gerar inteligência para comercial, marca e execução no varejo.',
    legado: 'O blueprint do programa, com proposta de valor, participantes, cadência, informações coletadas, critérios de qualidade e responsáveis.',
    arte: { shape: 'mesh', ramp: [0.06, 0.45], cell: 4, seed: 71, opts: { cols: 6, rows: 4 } },
    beats: [{}, { mostra: 1, arte: { ramp: [0.06, 1] }, ms: 1600 }, { mostra: 2 }] },

  { n: 19, registro: 'implementacao', olho: 'Programa 04',
    hed: 'Recompra e Acompanhamento Comercial',
    corpo: 'Garantir que clientes relevantes recebam acompanhamento no momento correto.',
    duasListas: {
      a: ['cliente', 'última compra', 'ciclo esperado de recompra', 'dias sem novo pedido',
          'SKUs comprados', 'responsável', 'próxima ação'],
      aOlho: 'Primeira entrega — uma lista semanal contendo',
      b: ['regras de prioridade', 'cadências de contato', 'tarefas automáticas',
          'registro dos motivos de não recompra', 'acompanhamento da receita recuperada',
          'recomendações de próxima ação'],
      bOlho: 'Evolução' },
    legado: 'Uma rotina comercial explícita, que não depende apenas de memória ou agenda individual.',
    arte: { shape: 'spiral', ramp: [0.1, 1], cell: 4, seed: 73 },
    beats: [{}, { mostra: 1 }, { mostra: 2 }] },

  /* 20 ------------------------------------------------------------------ */
  { n: 20, registro: 'implementacao',
    hed: 'A implementação começa com frentes paralelas',
    tabela: {
      quebra: 3,
      cols: ['Frente', 'Dias 1 a 30', 'Dias 31 a 60', 'Dias 61 a 90'],
      linhas: [
        ['Modelo de Gestão', 'Mapear conceitos, fontes, perguntas e responsáveis', 'Formalizar métricas, regras e exceções', 'Validar e incorporar aprendizados dos pilotos'],
        ['Informações ao Alcance', 'Definir perguntas e dados prioritários', 'Testar consultas pelo WhatsApp', 'Ampliar perguntas e iniciar alertas'],
        ['DRE e Margem', 'Reconciliar contas, critérios e dimensões', 'Construir o modelo econômico inicial', 'Validar com propostas e decisões reais'],
        ['Shelf Life', 'Selecionar SKUs, redes e critérios de risco', 'Operar coleta e reunião semanal', 'Medir, ajustar e preparar automações'],
        ['Promotores', 'Definir proposta de valor e participantes', 'Operar o primeiro grupo', 'Avaliar participação e expansão'],
        ['Recompra', 'Definir ciclos e prioridades', 'Operar a lista semanal', 'Automatizar tarefas selecionadas'],
      ] },
    lista: ['primeira versão do Modelo de Gestão Banana Milk',
            'consultas gerenciais controladas pelo WhatsApp', 'modelo econômico inicial',
            'piloto de shelf life em operação', 'grupo piloto de promotores',
            'rotina semanal de recompra'],
    listaOlho: 'Resultado esperado ao final dos 90 dias',
    arte: { shape: 'bars', ramp: [0.12, 0.95], cell: 4, seed: 79, opts: { cols: 3, rows: 6, duty: 0.8 } },
    /* Revela coluna a coluna: 30, 60, 90. */
    beats: [{}, { colunas: 1 }, { colunas: 2 }, { colunas: 3 }, { mostra: 1 }] },

  /* 21 ------------------------------------------------------------------ */
  { n: 21, registro: 'ferramenta', acento: ACENTOS.coral, modo: 'faixa',
    olho: 'Dez instrumentos',
    hed: 'A Banana Milk recebe instrumentos para continuar sozinha',
    /* Dez nomes curtos não são uma grade de fichas: viram lista numerada. Em
       grade de cinco colunas eles quebravam em três linhas cada e a cena
       estourava mesmo no piso de compressão. */
    passos: ['Vocabulário Oficial Banana Milk', 'Dicionário de Indicadores',
             'Matriz de Decisões Gerenciais', 'Mapa de Fontes e Fluxos de Informação',
             'Biblioteca de Perguntas do WhatsApp', 'Portfólio e Fichas dos Projetos',
             'Guia Operacional de Shelf Life', 'Blueprint do Programa de Promotores',
             'Plano de Ação de 90 dias', 'Matriz de Responsabilidades'],
    passosOlho: 'Ferramentas de gestão',
    fecho: 'Cada ferramenta será entregue em formato editável. A empresa poderá utilizar os materiais internamente ou contratar futuras implementações sem refazer o assessment.',
    ativo: 'logo',
    arte: { shape: 'trama', ramp: [0.14, 0.62], cell: 3, seed: 83,
            opts: { palavras: ['banana milk'], corpo: 0.075, entrelinha: 1.5, weight: 500, sep: '   ' } },
    beats: [{}, { mostra: 1 }, { mostra: 2 }] },

  /* 22 ------------------------------------------------------------------ */
  { n: 22, registro: 'ferramenta', acento: ACENTOS.amarelo,
    olho: 'A capacidade instalada',
    hed: 'O principal legado é uma nova capacidade de gestão',
    lista: ['responder perguntas gerenciais com fonte e critérios conhecidos',
            'identificar exceções antes que virem urgências',
            'avaliar propostas com uma visão econômica mais completa',
            'coordenar shelf life com informações internas e externas',
            'transformar promotores em uma fonte confiável de inteligência',
            'sistematizar recompra e acompanhamento comercial',
            'contratar ou desenvolver soluções futuras a partir de especificações próprias'],
    listaOlho: 'Ao final, a Banana Milk deverá ser capaz de',
    fecho: 'O legado não é uma ferramenta específica. É a capacidade de compreender o negócio, direcionar a atenção e coordenar ações com menos dependência de conhecimento tácito.',
    /* A costura do Camacho vira a figura do cliente, correndo como frente de
       onda ao longo da rampa. Cai exatamente na frase em que a capacidade
       passa a ser deles — é por isso que o morf está aqui e não na capa. */
    arte: { shape: 'weave', ramp: [0.06, 1], cell: 4, seed: 89 },
    beats: [{}, { mostra: 1 },
            { mostra: 2, arte: { morf: { de: 'weave', para: 'banana', eixo: 0 } }, ms: 2600 }] },

  /* 23 ------------------------------------------------------------------ */
  { n: 23, registro: 'recomendacao', campo: 'escuro', olho: 'Para começar',
    hed: 'Decisões necessárias para iniciar',
    passos: ['quais programas começarão nos primeiros 90 dias',
             'quem será responsável por cada programa',
             'quais perguntas entrarão na primeira versão do WhatsApp',
             'quais decisões a primeira versão do modelo econômico deverá apoiar',
             'quais SKUs e redes participarão do piloto de shelf life',
             'quais promotores participarão da primeira etapa',
             'quais pessoas, dados e parceiros estarão disponíveis',
             'qual capacidade de investimento e execução será destinada à implementação'],
    passosOlho: 'Os fundadores precisam decidir',
    fecho: 'O Modelo de Gestão Banana Milk começa quando cada pergunta relevante passa a ter uma fonte, uma regra, um responsável e uma ação possível.',
    /* A marca-medida fechando: a lacuna entre a complexidade enfrentada e a
       capacidade instalada é a coisa que o plano inteiro existe para reduzir. */
    arte: { shape: 'mark', ramp: [0.1, 1], cell: 4, seed: 97, opts: { aperture: 0.9 } },
    beats: [{}, { mostra: 1 }, { mostra: 2, arte: { opts: { aperture: 0.16 } }, ms: 1800 }] },
];

/* --- Pendências ----------------------------------------------------------
   Do documento editorial. Não viram slide: são suas, não dos fundadores.
   Aparecem só na visão de apresentador (?notas=1). */
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

/* O campo de cada cena: explícito quando declarado, senão o do registro. */
export function campoDaCena(cena) {
  return cena.campo || (cena.registro && REGISTRO_EDITORIAL[cena.registro].campo) || 'escuro';
}

/* Quantos beats a cena tem — usado pela navegação e pela impressão, que
   precisa achatar tudo para o último. */
export function beatsDa(cena) {
  return (cena.beats && cena.beats.length) || 1;
}

/* A config do grafismo no beat k: parte do estado inicial e aplica, em ordem,
   o `arte` de cada beat até k. Assim a navegação para trás assenta no estado
   final do beat anterior em vez de reproduzir a animação de trás para frente. */
export function arteNoBeat(cena, k) {
  if (!cena.arte) return null;
  let cfg = { ...cena.arte };
  for (let i = 1; i <= k && i < beatsDa(cena); i++) {
    const b = cena.beats[i];
    if (b && b.arte) cfg = { ...cfg, ...b.arte };
  }
  return cfg;
}
