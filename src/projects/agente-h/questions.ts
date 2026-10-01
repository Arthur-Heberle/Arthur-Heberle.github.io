// The three questions a visitor can try under Agente H's "How it works". Everything here is prepared
// in advance, by hand: where each question lands on the map (map.ts), the closest products that follow
// from it, the reply and the classification. No API is called; the real search runs on the server.
// Product names and prices are catalogo_moveis.csv in the AGENT-H repo, translated as on the map
// (R$ 2.190.00 is written R$ 2,190, the way the sofa's R$ 2,490 is).
import { LANDINGS, PRODUCTS } from './map'
import type { Prod, QKey } from './map'

export interface Question {
  key: QKey
  button: string // the choice's label
  msgs: string[] // what the customer sends, one chat bubble each
  typo?: string // a misspelling the search still matches, marked in the query and on the map
  reply: string
  cls: string // what the model classifies the conversation as
  lead: boolean // only a qualified lead is handed to the owner
  extra: string // added to the "Find" caption while this question is chosen ('' for none)
  label: string // the drawing's one description, for a screen reader
}

const TRY = 'Below the drawing, the visitor can try other questions.'

export const QUESTIONS: Question[] = [
  {
    key: 'sofa',
    button: 'a 3 seat sofa',
    msgs: ['hi', 'do you have sofas', '3 seat sofs?'],
    typo: 'sofs',
    reply: 'Yes! The Rubi 3-seat sofa, leather with solid wood legs, R$ 2,490. Want to see photos?',
    cls: 'QUALIFIED_LEAD',
    lead: true,
    extra: '',
    label: `A customer sends three short WhatsApp messages. The agent waits until they stop typing, turns the question into a point on a map of the store's products, finds the closest ones, writes a reply with a language model and sends it back. Because the customer is ready to buy, the owner gets a lead. ${TRY}`,
  },
  {
    key: 'sleep',
    button: 'something to sleep on',
    msgs: ['something to sleep on'],
    reply: 'We have the Serenno queen bed, R$ 2,190. Want the measurements?',
    cls: 'GENERAL_QUESTION',
    lead: false,
    extra: 'The question never mentions a bed, and it still lands right next to one.',
    label: `A customer asks for something to sleep on, without saying bed. The question becomes a point on the map of the store's products and lands among the beds: the closest are the Serenno queen bed, the Lugano wardrobe and the Provençal dressing table. A language model replies offering the Serenno queen bed at R$ 2,190. The conversation is classified as a general question, so there is no lead for the owner. ${TRY}`,
  },
  {
    key: 'cars',
    button: 'do you sell cars?',
    msgs: ['do you sell cars?'],
    reply: 'Sorry, we only sell furniture. Can I help you find something for your home?',
    cls: 'OUT_OF_SCOPE',
    lead: false,
    extra: 'Nothing in the catalogue is close, so the agent says so instead of making something up.',
    label: `A customer asks whether the store sells cars. The question becomes a point on the map of the store's products and lands far from every group of products. A language model replies that the store only sells furniture and offers to help find something for the home. The conversation is classified as out of scope, so there is no lead for the owner. ${TRY}`,
  },
]

const dist = (p: Prod, q: { x: number; y: number }) => Math.hypot(p.x - q.x, p.y - q.y)

/** The products ordered by how close they are to where the question lands. */
export function rankFor(key: QKey): Prod[] {
  const q = LANDINGS[key]
  return [...PRODUCTS].sort((a, b) => dist(a, q) - dist(b, q))
}
