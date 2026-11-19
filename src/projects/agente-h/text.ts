import type { Lang } from '../../shared/i18n/lang'

// Every English string on the Agente H page that is not in the project's content file: "How it works" (its
// captions, controls and the words drawn in it), the three questions a visitor can try, the catalogue's
// product names, "By the numbers" and "The dashboard".
//
// Product names and prices are catalogo_moveis.csv in the AGENT-H repo, translated as on the map
// (R$ 2.190.00 is written R$ 2,190, the way the sofa's R$ 2,490 is).
const TRY = 'Below the drawing, the visitor can try other questions.'

// A string with {name} in it is a template, filled by fmt() (src/shared/i18n/runtime.ts).
const en = {
  story: {
    heading: 'How it works',
    captions: [
      { title: 'Wait', text: 'Customers send three short messages instead of one. The agent waits until they stop typing, so it answers once.' },
      { title: 'Find', text: 'The question becomes a point on a map of the catalogue. The closest products win, even with a typo.' },
      { title: 'Answer', text: 'A language model writes the reply with those products in front of it, and it goes back on WhatsApp.' },
      { title: 'Hand off', text: 'If the customer is ready to buy, the owner gets a lead with a one-line summary.' },
    ],
    steps: 'Steps',
    goStep: 'Go to step {n}: {title}',
    stepLive: 'Step {n}, {title}. {text}',
    pause: 'Pause',
    pauseLabel: 'Pause the drawing',
    again: 'Play again',
    againLabel: 'Play the story again',
    play: 'Play',
    playLabel: 'Play the story',
    frame: 'Drawing, scrolls sideways',
    // the question picker under the drawing
    tryLabel: 'Try another question',
    tryNote: 'Positions and replies are prepared in advance for this demo. The real search runs on the server.',
    // read out when a question is chosen: "<button>. Reply: <reply> Classified as <class>, so ..."
    askedLead: '{button}. Reply: {reply} Classified as {cls}, so the owner gets a lead.',
    askedNoLead: '{button}. Reply: {reply} Classified as {cls}, so there is no lead.',
    // the classification's name in words, for the line above (the stamp itself shows the product's enum)
    classes: { QUALIFIED_LEAD: 'qualified lead', GENERAL_QUESTION: 'general question', OUT_OF_SCOPE: 'out of scope' } as Record<string, string>,
    // The drawing.
    nums: '0.12  -0.48  0.07  ...  1,536 numbers',
    silenceTimer: 'silence timer',
    catalogue: 'the catalogue, as a map',
    closest: '8 closest',
    prompt: 'prompt',
    products: 'products',
    messages: 'messages',
    model: 'language model',
    leads: 'Leads',
    columns: ['New', 'Contacted', 'Won'],
    leadLines: ['Wants a 3-seat', 'leather sofa.'],
    // the word of a product label that the first question's typo ("sofs") is matched to
    typoWord: { rubi: 'sofa' } as Record<string, string>,
  },
  // the catalogue on the map, by id
  products: {
    rubi: 'Rubi 3-seat sofa',
    dublin: 'Dublin 2-seat sofa',
    veneza: 'Veneza corner sofa',
    amelie: 'Amélie armchair',
    toscana: 'Toscana table',
    oslo: 'Oslo coffee table',
    round: 'Round side table',
    milano: 'Milano chair',
    berlim: 'Berlim office chair',
    serenno: 'Serenno queen bed',
    lugano: 'Lugano wardrobe',
    provencal: 'Provençal dressing table',
  } as Record<string, string>,
  hulls: { sofas: 'sofas', tables: 'tables', chairs: 'chairs', beds: 'beds' } as Record<string, string>,
  // The three questions: what the customer sends and what the agent answers.
  questions: {
    sofa: {
      button: 'a 3 seat sofa',
      msgs: ['hi', 'do you have sofas', '3 seat sofs?'],
      typo: 'sofs' as string | undefined, // a misspelling the search still matches; it must be in the messages joined
      reply: 'Yes! The Rubi 3-seat sofa, leather with solid wood legs, R$ 2,490. Want to see photos?',
      extra: '', // added to the "Find" caption while this question is chosen
      label: `A customer sends three short WhatsApp messages. The agent waits until they stop typing, turns the question into a point on a map of the store's products, finds the closest ones, writes a reply with a language model and sends it back. Because the customer is ready to buy, the owner gets a lead. ${TRY}`,
    },
    sleep: {
      button: 'something to sleep on',
      msgs: ['something to sleep on'],
      typo: undefined as string | undefined,
      reply: 'We have the Serenno queen bed, R$ 2,190. Want the measurements?',
      extra: 'The question never mentions a bed, and it still lands right next to one.',
      label: `A customer asks for something to sleep on, without saying bed. The question becomes a point on the map of the store's products and lands among the beds: the closest are the Serenno queen bed, the Lugano wardrobe and the Provençal dressing table. A language model replies offering the Serenno queen bed at R$ 2,190. The conversation is classified as a general question, so there is no lead for the owner. ${TRY}`,
    },
    cars: {
      button: 'do you sell cars?',
      msgs: ['do you sell cars?'],
      typo: undefined as string | undefined,
      reply: 'Sorry, we only sell furniture. Can I help you find something for your home?',
      extra: 'Nothing in the catalogue is close, so the agent says so instead of making something up.',
      label: `A customer asks whether the store sells cars. The question becomes a point on the map of the store's products and lands far from every group of products. A language model replies that the store only sells furniture and offers to help find something for the home. The conversation is classified as out of scope, so there is no lead for the owner. ${TRY}`,
    },
  },
  numbers: {
    heading: 'By the numbers',
    figures: [
      { n: '30', unit: ' s', label: 'of silence before it answers' },
      { n: '1,536', unit: '', label: 'numbers that describe each product to the search' },
      { n: '8', unit: '', label: 'closest products it reads before every reply' },
      { n: '46', unit: '', label: 'automated tests' },
    ],
  },
  dashboard: {
    heading: 'The dashboard',
    text: "Owners run it from a dashboard: the catalogue, with a CSV import that maps the columns using AI; the conversations; the leads; the agent's instructions; the business hours. In any conversation they can switch the agent off and answer themselves.",
    shots: [
      "The dashboard's catalogue page: a table of twenty demo products with name, category, price, stock and status, above it a search box, filters and the Import CSV and Add product buttons.",
      "The dashboard's conversations page: a list of five demo customers on the left and, on the right, one conversation in which a customer asks for a 3-seat sofa and the agent answers, with the switch that turns the agent off for this conversation at the top.",
      "The dashboard's leads page: a table of four demo leads, each with a one-line summary, a status menu (New, Contacted, Won) and a WhatsApp link, and an Export CSV button.",
    ],
  },
}

// Portuguese. The drawing's words, the questions and the product names are stage 3 and stay English here.
const pt: typeof en = {
  ...en,
  story: {
    ...en.story,
    heading: 'Como funciona',
    captions: [
      { title: 'Espere', text: 'Os clientes mandam três mensagens curtas em vez de uma. O agente espera até que parem de digitar, para responder uma só vez.' },
      { title: 'Busque', text: 'A pergunta vira um ponto em um mapa do catálogo. Os produtos mais próximos vencem, mesmo com erro de digitação.' },
      { title: 'Responda', text: 'Um modelo de linguagem escreve a resposta com esses produtos à sua frente, e ela volta pelo WhatsApp.' },
      { title: 'Passe adiante', text: 'Se o cliente está pronto para comprar, o dono recebe um lead com um resumo de uma linha.' },
    ],
    steps: 'Passos',
    goStep: 'Ir ao passo {n}: {title}',
    stepLive: 'Passo {n}, {title}. {text}',
    pause: 'Pausar',
    pauseLabel: 'Pausar o desenho',
    again: 'Repetir',
    againLabel: 'Repetir a história',
    play: 'Reproduzir',
    playLabel: 'Reproduzir a história',
    frame: 'Desenho, rola para os lados',
    tryLabel: 'Experimente outra pergunta',
    tryNote: 'As posições e as respostas são preparadas com antecedência para esta demonstração. A busca de verdade roda no servidor.',
    askedLead: '{button}. Resposta: {reply} Classificada como {cls}, então o dono recebe um lead.',
    askedNoLead: '{button}. Resposta: {reply} Classificada como {cls}, então não há lead.',
    classes: { QUALIFIED_LEAD: 'lead qualificado', GENERAL_QUESTION: 'pergunta geral', OUT_OF_SCOPE: 'fora do escopo' },
  },
  numbers: {
    heading: 'Em números',
    figures: [
      { n: '30', unit: ' s', label: 'de silêncio antes de responder' },
      { n: '1.536', unit: '', label: 'números que descrevem cada produto para a busca' },
      { n: '8', unit: '', label: 'produtos mais próximos que ele lê antes de cada resposta' },
      { n: '46', unit: '', label: 'testes automatizados' },
    ],
  },
  dashboard: {
    heading: 'O painel',
    text: 'Os donos operam tudo por um painel: o catálogo, com importação de CSV que mapeia as colunas usando IA; as conversas; os leads; as instruções do agente; o horário de funcionamento. Em qualquer conversa, eles podem desligar o agente e responder por conta própria.',
    // the screenshots are the dashboard's own interface, which is in English on these pages
    shots: [
      'A página de catálogo do painel (interface em inglês): uma tabela de vinte produtos de demonstração com nome, categoria, preço, estoque e status e, acima dela, uma caixa de busca, filtros e os botões de importar CSV e adicionar produto.',
      'A página de conversas do painel (interface em inglês): uma lista de cinco clientes de demonstração à esquerda e, à direita, uma conversa em que um cliente pede um sofá de 3 lugares e o agente responde, com o interruptor que desliga o agente nessa conversa no topo.',
      'A página de leads do painel (interface em inglês): uma tabela de quatro leads de demonstração, cada um com um resumo de uma linha, um menu de status (New, Contacted, Won) e um link para o WhatsApp, e um botão de exportar CSV.',
    ],
  },
}

export const text: Record<Lang, typeof en> = { en, pt }
