/* ==========================================================================
   IA Assessment & Opportunities · Banana Milk — as 23 cenas como dado

   Conteúdo editorial do assessment: o que aparece na tela e o que se fala em
   cada slide. Este arquivo decide COMO cada argumento aparece, nunca QUAL.

   Alimenta dois artefatos, e é fonte única dos dois:
   - `assessment.html`       — a apresentação, 16:9, navegada por beats
   - `assessment-documento.html` — o texto integral, para ler e imprimir

   Duas listas soltas para a mesma peça é a divergência que este repositório já
   cometeu e documentou no cabeçalho de src/kv.js.

   --- A regra que organiza tudo: dois registros ---------------------------

   `registro: 'cliente'`  → o assunto é a Banana Milk: o negócio, os dados, a
                            decisão deles. Cor permitida — os quatro acentos.
   `registro: 'camacho'`  → tagline, proposta de valor, método, consultoria,
                            preço. SEMPRE minimalista: preto e papel, mono,
                            muito acabamento e nenhum enfeite.

   Aplicada aos 23 slides ela produz um arco que não é o óbvio: o Ato 1 é quase
   todo cliente e o 2 e o 3 são quase todos Camacho. Ou seja, a apresentação
   começa em cor e termina em preto e branco. Está certo — ela termina numa
   decisão, e decisão não precisa de atmosfera.
   ========================================================================== */

export const ATOS = [
  { n: 1, nome: 'Reenquadrar o problema', de: 1, ate: 7 },
  { n: 2, nome: 'Mostrar a transformação', de: 8, ate: 17 },
  { n: 3, nome: 'Transformar em decisão', de: 18, ate: 23 },
];

/* Os quatro acentos da embalagem. Vivem AQUI, na peça — a fundação do Camacho
   segue monocromática em tokens/. Lidos de uma captura, não de arquivo da
   marca: trocar pelos oficiais antes de apresentar. */
export const ACENTOS = {
  coral: '#D9503F', amarelo: '#EFBE2E', cacau: '#7A4A2E', azul: '#1B7FC4',
  creme: '#F3EFE4', vermelho: '#E23D35',
};

/* O personagem aparece por ASSUNTO, não por ato: só onde a capacidade do
   cliente é o que está em jogo. Três momentos no deck inteiro. Fora daí ele
   não existe, e a ausência significa que ainda não há quem dirija. */
export const PERSONAGEM_EM = [10, 17, 23];

export const CENAS = [

/* ===== ATO 1 · Reenquadrar o problema ==================================== */

{ n: 1, ato: 1, registro: 'camacho', campo: 'escuro', dispositivo: 'weave',
  titulo: 'Capa',
  hed: 'Clareza para decidir.<br>Inteligência para crescer.',
  olho: 'IA Assessment &amp; Opportunities',
  pe: 'Banana Milk · Agosto de 2026',
  fala: 'Este trabalho começou com uma pergunta prática: como colocar os dados da Banana Milk ao alcance da liderança, inclusive pelo WhatsApp? Ao investigar essa pergunta, encontramos algo maior. A oportunidade não é apenas criar uma nova interface. É construir uma capacidade gerencial que permita à Banana Milk enxergar melhor, agir antes e crescer com menos dependência do esforço dos sócios.',
  beats: 2 },

{ n: 2, ato: 1, registro: 'cliente', campo: 'creme', dispositivo: 'recuo',
  titulo: 'O WhatsApp é a porta. O controle é o destino.',
  hed: 'O WhatsApp é a porta.<br>O controle é o destino.',
  citacao: 'Quero perguntar pelo WhatsApp e receber a informação gerencial de que preciso.',
  citacaoDe: 'O pedido',
  listaOlho: 'A necessidade real',
  lista: ['recuperar domínio sobre os números',
          'reduzir a dependência de relatórios e terceiros',
          'antecipar riscos',
          'transformar informação em ação'],
  fala: 'O pedido do Marcos é muito claro: conseguir conversar com os dados pelo WhatsApp. Mas o valor não está no WhatsApp. O valor está em recuperar o controle sobre o negócio. Se a informação continua ambígua, atrasada ou dependente de interpretação, colocar um agente na frente dela apenas acelera o acesso à dúvida. Portanto, o WhatsApp é a primeira experiência. O produto real é uma gestão mais confiável.',
  beats: 3 },

{ n: 3, ato: 1, registro: 'cliente', campo: 'creme', dispositivo: 'soltos',
  titulo: 'Os dados existem. O sistema gerencial ainda não.',
  hed: 'Os dados existem.<br>O sistema gerencial ainda não.',
  numeros: [['6', 'ambientes relevantes de informação'],
            ['4', 'modelos de canal com economias diferentes'],
            ['6', 'ambiguidades que alteram os números']],
  ambientes: ['Omie', 'BPO', 'Excel', 'Drive', 'Notion', 'WhatsApp'],
  fecho: 'Diversas rotinas dependentes de memória e consultas manuais.',
  fala: 'A Banana Milk não sofre por falta absoluta de dados ou por excesso de ferramentas. Os dados estão no Omie, no BPO, em planilhas, no Drive, no Notion e em conversas. O problema é que eles ainda não formam um sistema gerencial único. Cada nova pergunta exige localizar informações, combinar fontes e reconstruir a interpretação. Isso funciona enquanto o conhecimento está na cabeça de poucas pessoas. Não funciona bem quando o número de produtos, canais, redes, lotes e decisões aumenta.',
  beats: 3 },

{ n: 4, ato: 1, registro: 'cliente', campo: 'creme', dispositivo: 'desregistro',
  titulo: 'Se o conceito muda, o número também muda.',
  hed: 'Se o conceito muda,<br>o número também muda.',
  /* A palavra que entra fora de registro e converge. Uma só, grande — seis
     desregistros seriam seis piadas iguais. */
  palavra: 'receita',
  tabela: { cols: ['Conceito', 'Ambiguidade encontrada'], linhas: [
    ['Volume', 'Unidade, pack ou caixa?'],
    ['Receita', 'Venda ou bonificação?'],
    ['Resultado', 'Caixa ou competência?'],
    ['Cliente', 'Rede, distribuidor ou loja?'],
    ['Produto', 'Família, SKU ou lote?'],
    ['Estoque', 'Interno ou disponível no mercado?'] ] },
  fecho: 'Sem definição comum, não existe indicador confiável.',
  fala: 'Antes de integrar sistemas, precisamos integrar significados. Quando alguém pergunta quanto foi vendido, precisamos saber se está falando de unidades, packs ou caixas. Quando pergunta pelo desempenho de uma rede, precisamos separar venda, bonificação, distribuidor, rede e loja. Essas não são discussões acadêmicas. Cada definição altera faturamento, volume, margem, estoque e desempenho comercial. O primeiro trabalho, portanto, não é tecnológico. É fazer a Banana Milk falar uma língua gerencial comum.',
  beats: 3 },

{ n: 5, ato: 1, registro: 'cliente', campo: 'papel', dispositivo: 'exclusao',
  titulo: 'Um relatório pode estar certo e ainda ser insuficiente.',
  hed: 'Um relatório pode estar certo<br>e ainda ser insuficiente.',
  olho: 'Exemplo observado na análise financeira',
  /* ATENÇÃO, e é o único risco de CORREÇÃO do deck: o texto diz que estes dois
     valores NÃO podem ser somados nem subtraídos. Qualquer cascata, barra ou
     eixo compartilhado vai sugerir que somam, e aí o desenho contradiz a fala.
     O dispositivo é `exclusao`: um colchete que fecha em volta do que entrou no
     subtotal, e um valor visivelmente FORA dele. Sem eixo, sem escala, sem
     operação — a pergunta que a imagem faz é "dentro ou fora?". */
  valores: [
    { rot: 'Resultado apresentado', v: '−R$ 636,8 mil', dentro: true },
    { rot: 'CMC visível fora do cálculo', v: 'R$ 222,9 mil', dentro: false },
  ],
  razao: 'Razão indicada: ausência de classificação no plano de contas.',
  fecho: 'A DRE atual não oferece segurança para análise e decisão estratégica.',
  fala: 'Este exemplo resume o problema. O relatório apresenta um resultado negativo de 636,8 mil reais. Ao mesmo tempo, existem aproximadamente 222,9 mil reais de CMC visíveis que não entram nos subtotais, aparentemente por falta de classificação. Isso não significa que podemos simplesmente somar ou subtrair esses valores. Significa que o número não pode ser utilizado estrategicamente sem reconciliação. Uma visão pode cumprir sua finalidade contábil e continuar insuficiente para responder às perguntas dos gestores.',
  beats: 4 },

{ n: 6, ato: 1, registro: 'cliente', campo: 'creme', dispositivo: 'chave',
  titulo: 'Margem não é preço menos custo.',
  hed: 'Margem não é<br>preço menos custo.',
  olho: 'A unidade econômica real',
  /* As quatro dimensões travam num bloco: o objeto da análise não é o SKU, é o
     SKU dentro de uma condição. Cada uma leva um acento. */
  chave: ['SKU', 'canal', 'cliente', 'condições do pedido'],
  cadeia: ['Preço de venda', 'impostos', 'bonificação', 'contrato', 'frete',
           'comissão', 'promoção', 'custo completo do produto'],
  resultado: 'margem real da decisão',
  fala: 'A negociação com o Oba mostrou por que uma margem genérica por produto não é suficiente. O mesmo SKU pode ser um bom negócio em um canal e um mau negócio em outro. A resposta depende do preço, impostos, bonificação, frete, comissão, promoção, prazo e volume. O verdadeiro objeto da análise não é apenas o SKU. É o SKU dentro de uma condição comercial específica. Essa mesma regra precisa alimentar a precificação, a DRE, as simulações, o WhatsApp e futuras recomendações de IA.',
  beats: 3 },

{ n: 7, ato: 1, registro: 'cliente', campo: 'escuro', dispositivo: 'vao',
  titulo: 'O prejuízo mais perigoso é o que aparece tarde.',
  hed: 'O prejuízo mais perigoso<br>é o que aparece tarde.',
  listaOlho: 'O custo invisível do modelo atual',
  lista: ['produto perde a janela comercial',
          'cliente deixa de recomprar',
          'promoção começa tarde',
          'preço é definido com informação incompleta',
          'decisões aguardam extrações e consultas',
          'conhecimento permanece concentrado em pessoas'],
  fecho: 'O problema não é apenas produzir o relatório. É descobrir tarde o que deveria ter sido feito.',
  fala: 'Nem todo custo aparece na DRE como uma linha chamada "falta de visibilidade". Ele aparece como produto que perdeu sua janela comercial, cliente que não recomprou, promoção iniciada tarde, decisão adiada ou tempo dos sócios gasto procurando informações. Shelf life é o melhor exemplo. A data de validade física não é o único prazo. Existe também a janela comercial para entregar, vender e promover o produto. Quando o relatório mostra o problema, parte do valor já pode ter sido perdida.',
  beats: 3 },

/* ===== ATO 2 · Mostrar a transformação ================================== */

{ n: 8, ato: 2, registro: 'camacho', campo: 'papel', dispositivo: 'estados',
  titulo: 'A Banana Milk está pronta para usar IA. Ainda não para delegar a ela.',
  hed: 'Pronta para usar IA.<br>Ainda não para delegar a ela.',
  olho: 'Agent Readiness',
  /* Estados QUALITATIVOS. Um medidor aqui prometeria uma medição que o
     assessment não fez — e a regra de não parecer instrumento sem número
     continua valendo em todo o Ato 2. */
  tabela: { cols: ['Dimensão', 'Situação atual'], linhas: [
    ['Conhecimento', 'Conceitos dispersos'],
    ['Dados', 'Disponíveis, com lacunas'],
    ['Conectividade', 'Sistemas pouco integrados'],
    ['Ação', 'Rotinas majoritariamente manuais'],
    ['Governança', 'Limites ainda não formalizados'] ] },
  fecho: 'Bons casos de uso, fundação em construção.',
  fala: 'Existe uma diferença entre AI Readiness e Agent Readiness. AI Readiness significa que a empresa consegue usar inteligência artificial. A Banana Milk já começou a fazer isso. Agent Readiness significa que a empresa está preparada para permitir que agentes consultem dados, interpretem conceitos e executem ações com segurança. A Banana Milk tem liderança interessada, problemas concretos e dados relevantes. O que ainda precisa ser construído é a fundação que torna os agentes confiáveis.',
  beats: 3 },

{ n: 9, ato: 2, registro: 'camacho', campo: 'papel', dispositivo: 'termos',
  titulo: 'Antes de ensinar a IA, a empresa precisa ensinar a si mesma.',
  hed: 'Antes de ensinar a IA,<br>a empresa ensina a si mesma.',
  termos: [['Ontologia', 'Como os elementos do negócio se relacionam.'],
           ['Vocabulário oficial', 'O que cada conceito significa.'],
           ['Inventário de dados', 'Onde a informação nasce e quem responde por ela.'],
           ['OKF', 'Conhecimento portátil, legível por pessoas e agentes.']],
  fala: 'Ontologia pode parecer uma palavra sofisticada, mas a ideia é prática. Precisamos definir como produto, SKU, pack, lote, cliente, rede, loja, pedido, venda, bonificação, receita, custo e margem se relacionam. Depois, registramos onde cada dado nasce, qual é sua regra e quem responde por ele. Isso reduz dependência das pessoas, evita que cada fornecedor invente sua própria interpretação e cria uma memória organizacional que pode ser utilizada por humanos, sistemas e agentes.',
  beats: 5 },

{ n: 10, ato: 2, registro: 'camacho', campo: 'papel', dispositivo: 'escada',
  titulo: 'A transformação acontece em cinco movimentos.',
  hed: 'A transformação acontece<br>em cinco movimentos.',
  degraus: [['Legível', 'O negócio possui conceitos e regras claros.'],
            ['Conectável', 'Dados e capacidades são acessíveis.'],
            ['Consultável', 'Pessoas conseguem obter respostas confiáveis.'],
            ['Coordenável', 'Alertas geram ações e responsáveis.'],
            ['Progressivamente autônomo', 'Agentes atuam dentro de limites.']],
  faixa: 'Dependência → visibilidade → antecipação → coordenação → autonomia',
  fala: 'Esta não é uma sequência rígida de projetos. É uma sequência de capacidades. Primeiro, tornamos o negócio legível. Depois, conectável. Então ele pode ser consultado com confiança. O próximo estágio é transformar respostas em alertas, tarefas e acompanhamento. Somente depois faz sentido permitir que agentes recomendem ou executem determinadas ações. Não precisamos terminar uma fase inteira antes de começar a seguinte. Podemos atravessar as cinco camadas com um caso de uso pequeno e ampliar progressivamente.',
  beats: 6 },

{ n: 11, ato: 2, registro: 'camacho', campo: 'escuro', dispositivo: 'nucleo',
  titulo: 'Uma base. Muitas aplicações.',
  hed: 'Uma base.<br>Muitas aplicações.',
  tabela: { cols: ['Capacidade compartilhada', 'Onde será utilizada'], linhas: [
    ['Regra de margem', 'DRE, preço, WhatsApp e simulação'],
    ['Dados de lotes', 'Estoque, shelf life e promoções'],
    ['Histórico de clientes', 'Recompra, alertas e cadências'],
    ['Ontologia', 'Relatórios, agentes e treinamento'],
    ['Permissões', 'WhatsApp, automações e agentes'] ] },
  fecho: 'Construir uma vez. Reutilizar em cada nova aplicação.',
  fala: 'A proposta é trabalhar com uma arquitetura API-first e um Backend for Agents. Na prática, isso significa que a regra de margem não fica presa a uma planilha ou a um chatbot. Ela se torna uma capacidade reutilizável. A mesma lógica pode alimentar a DRE, uma simulação comercial, um dashboard, o WhatsApp e futuros agentes. Esse reaproveitamento é a principal vantagem econômica de um programa integrado. Em projetos separados, cada fornecedor tende a reconstruir parte da fundação.',
  beats: 3 },

{ n: 12, ato: 2, registro: 'camacho', campo: 'papel', dispositivo: 'passos',
  titulo: 'Primeira entrega: conversar com o negócio.',
  hed: 'Primeira entrega:<br>conversar com o negócio.',
  olho: 'WhatsApp executivo · primeiro ciclo',
  passos: ['selecionar 10 a 15 perguntas', 'definir os conceitos',
           'reconciliar as fontes', 'construir respostas controladas',
           'informar fonte, período e cálculo', 'validar', 'expandir'],
  fecho: 'Valor rápido com confiança controlada.',
  fala: 'Minha recomendação é começar pelo WhatsApp executivo porque existe uma urgência explícita do CEO e um valor percebido muito alto. Mas não começaremos tentando responder qualquer pergunta sobre qualquer dado. Começaremos com 10 a 15 perguntas prioritárias. Para cada uma, definiremos o conceito, a fonte, o cálculo e a forma de validação. Assim, entregamos uma experiência visível rapidamente e usamos cada pergunta para construir uma parte reutilizável da fundação.',
  beats: 3 },

{ n: 13, ato: 2, registro: 'camacho', campo: 'papel', dispositivo: 'perguntas',
  titulo: 'As primeiras perguntas definem a primeira fundação.',
  hed: 'As primeiras perguntas<br>definem a primeira fundação.',
  /* O slide é vitrine: só apresentar as perguntas. A última sobe de peso,
     porque é a que separa um chatbot de uma capacidade gerencial. */
  perguntas: ['Qual foi o faturamento líquido do mês?',
              'Como estamos em relação ao mês anterior?',
              'Quanto temos de cada SKU?',
              'Quais lotes exigem atenção?',
              'Quais clientes deixaram de recomprar?',
              'Qual é a margem estimada deste pedido?',
              'O que exige uma decisão nesta semana?'],
  fecho: 'Cada resposta deve mostrar: fonte, período e regra.',
  fala: 'O objetivo não é apenas responder quanto vendemos. É permitir que o gestor compreenda e confie na resposta. Quando o agente responder, ele deve indicar o período, a fonte e a regra utilizada. Também precisamos evoluir de perguntas descritivas, como "quanto temos em estoque?", para perguntas gerenciais, como "o que exige uma decisão nesta semana?". Essa mudança separa um chatbot de uma verdadeira capacidade gerencial.',
  beats: 3 },

{ n: 14, ato: 2, registro: 'camacho', campo: 'escuro', dispositivo: 'quadrante',
  titulo: 'Quatro formas de gerar valor.',
  hed: 'Quatro formas<br>de gerar valor.',
  eixos: { x: ['Observar', 'Agir'], y: ['Antecipar', 'Reagir'] },
  celulas: [['Inteligência', 'antecipar o que pode acontecer'],
            ['Autonomia', 'permitir ação dentro de limites'],
            ['Visibilidade', 'entender o que aconteceu'],
            ['Orquestração', 'garantir que algo seja feito']],
  fala: 'Organizamos as oportunidades em duas dimensões. A primeira é a evolução de observar para agir. A segunda é a evolução de reagir para antecipar. Isso produz quatro espaços de valor. Visibilidade, inteligência, orquestração e autonomia. O quadrante evita que toda ideia de IA pareça igualmente importante. Também mostra que não precisamos começar pela autonomia. Há muito valor a capturar em visibilidade e orquestração.',
  beats: 4 },

{ n: 15, ato: 2, registro: 'camacho', campo: 'escuro', dispositivo: 'quadrante-cheio',
  titulo: 'O portfólio de oportunidades.',
  hed: 'O portfólio<br>de oportunidades.',
  /* O mesmo quadrante da cena 14, povoado. O portfólio não é uma lista de
     dezesseis itens — é o quadrante preenchido, e é isso que mata o
     slide-lista mais perigoso do deck. */
  portfolio: {
    Visibilidade: ['WhatsApp executivo', 'DRE contínua', 'margem', 'estoque e lotes'],
    Inteligência: ['previsão de demanda', 'risco de validade', 'risco de não recompra', 'simulação comercial'],
    Orquestração: ['alertas de shelf life', 'cadências comerciais', 'programa de promotores', 'tarefas e responsáveis'],
    Autonomia: ['recomendação de ações', 'contato autorizado', 'execução de rotinas', 'decisões dentro de limites'],
  },
  fala: 'O assessment não encontrou um único projeto. Encontrou um portfólio. Algumas oportunidades melhoram decisões. Outras reduzem esforço operacional. Outras aumentam a capacidade de escala. O ponto importante é que elas compartilham dados, conceitos, regras e integrações. Por isso, não deveriam ser tratadas como quatro sistemas ou dez contratações independentes.',
  beats: 5 },

{ n: 16, ato: 2, registro: 'camacho', campo: 'papel', dispositivo: 'criterios',
  titulo: 'Nem tudo que gera valor deve começar agora.',
  hed: 'Nem tudo que gera valor<br>deve começar agora.',
  olho: 'Cinco critérios de priorização',
  criterios: ['Valor econômico', 'Urgência', 'Prontidão dos dados',
              'Reutilização da fundação', 'Esforço e risco'],
  recomendacao: 'Recomendação inicial: WhatsApp executivo.',
  fecho: 'Próximas prioridades: definidas com a liderança.',
  fala: 'Eu não quero impor um roadmap anual fechado antes de discutirmos as prioridades. O assessment define os critérios e as dependências. A liderança escolhe, conosco, a sequência do portfólio. Minha recomendação inicial é o WhatsApp executivo. Depois dessa primeira entrega, podemos escolher entre aprofundar DRE e margem, atacar shelf life, organizar recompra ou avançar em outra oportunidade. O backlog pode mudar. A arquitetura e a lógica de priorização permanecem.',
  beats: 3 },

{ n: 17, ato: 2, registro: 'camacho', campo: 'papel', dispositivo: 'travessia',
  titulo: 'A tecnologia muda. A forma de operar muda mais.',
  hed: 'A tecnologia muda.<br>A forma de operar muda mais.',
  tabela: { cols: ['Hoje', 'Capacidade futura'], linhas: [
    ['Procurar respostas', 'Consultar imediatamente'],
    ['Interpretar relatórios', 'Usar conceitos oficiais'],
    ['Descobrir problemas tarde', 'Receber alertas antecipados'],
    ['Cobrar ações manualmente', 'Orquestrar responsáveis'],
    ['Depender da memória', 'Registrar conhecimento'],
    ['Analisar do zero', 'Reutilizar regras'] ] },
  fecho: 'Melhor decisão. Menor esforço operacional. Maior capacidade de escala.',
  fala: 'O resultado não deve ser medido pela quantidade de ferramentas implantadas. A mudança real acontece quando a empresa deixa de procurar respostas e passa a consultá-las. Quando deixa de descobrir problemas tarde e passa a receber alertas. Quando deixa de depender da memória e passa a operar com conhecimento registrado. Essa é a transformação que conecta gestão, dados, automação e IA.',
  beats: 4 },

/* ===== ATO 3 · Transformar em decisão =================================== */

{ n: 18, ato: 3, registro: 'camacho', campo: 'papel', dispositivo: 'entregas',
  titulo: 'O assessment termina. O ativo permanece.',
  hed: 'O assessment termina.<br>O ativo permanece.',
  olho: 'A Banana Milk recebe',
  entregas: ['diagnóstico de Agent Readiness', 'tese de transformação',
             'arquitetura conceitual', 'portfólio de oportunidades',
             'critérios de priorização', 'desenho dos projetos',
             'dependências e riscos', 'lógica orçamentária',
             'condições para contratar o mercado'],
  fecho: 'A Banana Milk pode seguir internamente, conosco ou com outros parceiros.',
  fala: 'Este assessment não é um argumento para tornar a Banana Milk dependente de mim. A empresa recebe um diagnóstico, uma arquitetura, um portfólio, critérios de priorização e condições para solicitar propostas ao mercado. Vocês podem executar internamente, contratar projetos separados ou trabalhar comigo em um programa contínuo. Minha responsabilidade nesta entrega é dar condições para que vocês façam uma escolha informada.',
  beats: 3 },

{ n: 19, ato: 3, registro: 'camacho', campo: 'escuro', dispositivo: 'nucleo-invertido',
  titulo: 'No mercado, as partes são vendidas separadamente.',
  hed: 'No mercado, as partes<br>são vendidas separadamente.',
  olho: 'Normalmente contratadas como frentes diferentes',
  frentes: ['estratégia e governança', 'dados e integrações', 'BI e indicadores',
            'automações', 'agentes de IA', 'adoção e desenvolvimento do time'],
  valor: 'R$ 175 mil a R$ 350 mil',
  valorRot: 'Portfólio contratado por projetos',
  nota: 'Faixa de planejamento. Não representa cotação formal.',
  fala: 'Esse tipo de transformação normalmente é comprado em partes. Uma empresa define a estratégia. Outra integra os dados. Outra constrói o BI. Outra desenvolve automações. Outra implementa o agente. Depois, alguém precisa coordenar tudo. Nossa estimativa preliminar para contratar separadamente um portfólio equivalente fica entre 175 mil e 350 mil reais. O principal problema não é apenas o preço. É a fragmentação. Cada nova contratação consome diagnóstico, alinhamento, coordenação e reconstrução de contexto.',
  beats: 4 },

{ n: 20, ato: 3, registro: 'camacho', campo: 'papel', dispositivo: 'comparacao',
  titulo: 'Três maneiras de construir a mesma capacidade.',
  hed: 'Três maneiras de construir<br>a mesma capacidade.',
  caminhos: [
    { nome: 'Projetos separados', inv: 'R$ 175 mil a R$ 350 mil', lim: 'Fragmentação' },
    { nome: 'Equipe interna', inv: 'Acima de R$ 35 mil/mês', lim: 'Múltiplos perfis e contratação' },
    { nome: 'Programa integrado', inv: 'R$ 12 mil a R$ 32 mil/mês', lim: 'Capacidade conforme dedicação' },
  ],
  fecho: 'O programa anual não economiza apenas dinheiro. Economiza recomeços.',
  fala: 'A comparação correta não é entre o meu trabalho e um dashboard. A comparação é entre três formas de construir uma capacidade que envolve estratégia, dados, gestão, automação, IA e adoção. Uma equipe interna completa exigiria múltiplos perfis. Projetos separados geram fragmentação. O programa integrado preserva o contexto e reutiliza a mesma fundação, ajustando a dedicação e a velocidade conforme a opção escolhida.',
  beats: 3 },

{ n: 21, ato: 3, registro: 'camacho', campo: 'papel', dispositivo: 'niveis',
  titulo: 'Três níveis de parceria.',
  hed: 'Três níveis<br>de parceria.',
  /* NÃO pré-destacar a coluna do meio. Se a recomendação já estiver marcada
     aqui, a cena 22 não tem o que fazer — e o ato perde o único gesto de
     ênfase que se permite. */
  niveis: [
    { nome: 'Transformação', mes: 'R$ 12 mil', ano: 'R$ 144 mil', ded: 'Ciclos', papel: 'Construir' },
    { nome: 'AI Advisor', mes: 'R$ 20 mil', ano: 'R$ 240 mil', ded: 'Até 8h/semana', papel: 'Construir e orientar' },
    { nome: 'Fractional CAIO', mes: 'R$ 32 mil', ano: 'R$ 384 mil', ded: 'Até 20h/semana', papel: 'Liderar a função' },
  ],
  fala: 'Existem três níveis possíveis de parceria. O primeiro é um programa de transformação com ciclos de implementação. O segundo adiciona acompanhamento semanal da liderança, gestão mais próxima do portfólio, desenvolvimento da ontologia, inventário de dados e participação pontual em decisões executivas. O terceiro é uma função executiva fracionada. Nesse modelo, eu assumo a liderança contínua da agenda de IA, participando da gestão, do desenvolvimento dos times, de conselhos e, quando necessário, de reuniões com investidores.',
  beats: 4 },

{ n: 22, ato: 3, registro: 'camacho', campo: 'papel', dispositivo: 'assentamento',
  titulo: 'A opção recomendada: construir e orientar.',
  hed: 'Programa de Transformação<br>+ AI Advisor',
  valor: 'R$ 20 mil por mês',
  inclui: ['acompanhamento semanal', 'até 8 horas de dedicação por semana',
           'gestão do portfólio', 'implementação incremental', 'ontologia e OKF',
           'inventário e governança dos dados', 'desenvolvimento do time',
           'acompanhamento de fornecedores', 'participação executiva pontual'],
  fala: 'Minha recomendação para a Banana Milk é o modelo intermediário. Ele oferece proximidade suficiente para construir a fundação, acompanhar semanalmente as prioridades e desenvolver a capacidade interna, sem criar o custo de uma função executiva parcial de 20 horas por semana. Não é apenas aconselhamento. Também não é desenvolvimento ilimitado. É uma capacidade contínua de transformação, com prioridades acordadas e uma frente principal de implementação por vez.',
  beats: 3 },

{ n: 23, ato: 3, registro: 'camacho', campo: 'escuro', dispositivo: 'fecho',
  titulo: 'A decisão de hoje define o primeiro movimento.',
  hed: 'A decisão de hoje define<br>o primeiro movimento.',
  olho: 'Próximos passos',
  passos: ['escolher o modelo de parceria',
           'selecionar as 10 a 15 perguntas executivas',
           'nomear os responsáveis pelos dados',
           'iniciar o primeiro ciclo',
           'validar a primeira entrega',
           'priorizar o próximo caso de uso'],
  fecho: 'A escolha não é se a Banana Milk usará IA. A escolha é se a IA será apenas mais uma ferramenta ou uma capacidade real do negócio.',
  fala: 'O primeiro passo não exige decidir hoje a ordem de todos os projetos do ano. Precisamos decidir o modelo de parceria e escolher as primeiras perguntas que queremos responder com confiança. A partir delas, construiremos a primeira fundação, entregaremos valor e escolheremos o próximo movimento com base no que aprendermos. A escolha central não é simplesmente usar ou não usar inteligência artificial. É decidir se ela será apenas mais uma ferramenta ou se ajudará a construir uma capacidade real da Banana Milk.',
  beats: 4 },
];

/* --- Conferências -------------------------------------------------------- */

/** Total de passos da apresentação. Acima de ~60 a peça pede mais cliques do
    que 30–40 minutos comportam — é medida, não estimativa. */
export function totalBeats() {
  return CENAS.reduce((s, c) => s + c.beats, 0);
}

/** Cenas de um ato. */
export function cenasDoAto(n) {
  return CENAS.filter((c) => c.ato === n);
}

/** Cor nunca deve aparecer em cena de registro `camacho`. Esta função existe
    para a conferência final poder ser automática em vez de visual. */
export function cenasComCorIndevida() {
  return CENAS.filter((c) => c.registro === 'camacho' && c.acento).map((c) => c.n);
}
