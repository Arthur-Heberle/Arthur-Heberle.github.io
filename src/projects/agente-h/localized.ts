// The words and the map put together for a language. Used by the Astro files, never by a script: story.ts
// gets the same data as JSON from the page (AgenteStory.astro), so no text is in the JS bundle.
//
// The three questions a visitor can try under "How it works" are prepared in advance, by hand: where each
// lands on the map (map.ts), the closest products that follow from it, the reply and the classification.
// No API is called; the real search runs on the server. The words are text.ts; what does not change with the
// language (the question's key, its classification and whether it is a lead) is here.
import { HULL_AT, LABELS_EN, PRODUCT_AT } from './map'
import type { At, Hull, Prod, QKey } from './map'
import type { Lang } from '../../shared/i18n/lang'
import { text } from './text'

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

const FIXED: { key: QKey; cls: string; lead: boolean }[] = [
  { key: 'sofa', cls: 'QUALIFIED_LEAD', lead: true },
  { key: 'sleep', cls: 'GENERAL_QUESTION', lead: false },
  { key: 'cars', cls: 'OUT_OF_SCOPE', lead: false },
]

/** The three questions, in a language. */
export function questionsFor(lang: Lang): Question[] {
  return FIXED.map((f) => ({ ...f, ...text[lang].questions[f.key] }))
}

/** The catalogue on the map, with its names in a language. */
export function productsFor(lang: Lang): Prod[] {
  return PRODUCT_AT.map((p) => ({ ...p, name: text[lang].products[p.id] }))
}

/** The four groups of products, named in a language. */
export function hullsFor(lang: Lang): Hull[] {
  return HULL_AT.map((h) => ({ ...h, name: text[lang].hulls[h.id] }))
}

/** Where every label goes, per question. A label's place depends on the length of its text, so each language
 *  has its own table (Portuguese gets one in stage 3). */
export function labelsFor(_lang: Lang): Record<QKey, Record<string, At>> {
  return LABELS_EN
}
