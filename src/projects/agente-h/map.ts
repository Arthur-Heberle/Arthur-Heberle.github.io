// The map of the catalogue in Agente H's "How it works": where each product sits, the clusters, where each
// question lands, and where every label goes. All of it is drawn by hand, in advance, for the demo: the
// real search runs on the server. This file is geometry only, the same in every language; the names are in
// text.ts and localized.ts puts them together, so the story's script (story.ts) carries no text.
//
// Labels are placed per question, by a search (kept out of the repo) that tries every spot near a dot and
// keeps one where no label crosses a line to the eight nearest products, a highlight ring, a dot, another
// label or the frame. A label's x is its left edge; y is its text baseline. "hull-<name>" is a cluster's
// name, "tag" is the "8 closest" note.
export const MAP = { x: 392, y: 78, w: 366, h: 296 }

export type QKey = 'sofa' | 'sleep' | 'cars'
export interface Prod {
  id: string
  name: string
  x: number
  y: number
}
export interface Hull {
  id: string
  name: string
  cx: number
  cy: number
  rx: number
  ry: number
}
export interface At {
  x: number
  y: number
}

export const PRODUCT_AT = [
  { id: 'rubi', x: 549, y: 192 },
  { id: 'dublin', x: 545, y: 235 },
  { id: 'veneza', x: 520, y: 262 },
  { id: 'amelie', x: 444, y: 135 },
  { id: 'toscana', x: 632, y: 120 },
  { id: 'oslo', x: 680, y: 130 },
  { id: 'round', x: 647, y: 152 },
  { id: 'milano', x: 616, y: 289 },
  { id: 'berlim', x: 698, y: 250 },
  { id: 'serenno', x: 457, y: 342 },
  { id: 'lugano', x: 515, y: 345 },
  { id: 'provencal', x: 543, y: 323 },
]
export const HULL_AT = [
  { id: 'sofas', cx: 496.5, cy: 198.5, rx: 96.5, ry: 85.5 },
  { id: 'tables', cx: 656, cy: 136, rx: 68, ry: 38 },
  { id: 'chairs', cx: 657, cy: 269.5, rx: 85, ry: 41.5 },
  { id: 'beds', cx: 500, cy: 334, rx: 87, ry: 33 },
]

/** Where each question's point lands on the map. */
export const LANDINGS: Record<QKey, At> = {
  sofa: { x: 521, y: 211 },
  sleep: { x: 478, y: 324 },
  cars: { x: 748, y: 345 },
}
/** Where every label goes, per question, for the English names. Portuguese gets its own table in stage 3. */
export const LABELS_EN: Record<QKey, Record<string, At>> = {
  sofa: {
    rubi: { x: 494.6, y: 174 },
    dublin: { x: 559.4, y: 235 },
    veneza: { x: 402.2, y: 271 },
    amelie: { x: 452, y: 135 },
    toscana: { x: 547.5, y: 123 },
    oslo: { x: 650.5, y: 118 },
    round: { x: 656.3, y: 161 },
    milano: { x: 542.1, y: 298 },
    berlim: { x: 593.8, y: 259 },
    serenno: { x: 403.9, y: 330 },
    lugano: { x: 524.1, y: 354 },
    provencal: { x: 553.2, y: 326 },
    'hull-sofas': { x: 500, y: 114 },
    'hull-tables': { x: 614, y: 102 },
    'hull-chairs': { x: 692, y: 312 },
    'hull-beds': { x: 452, y: 306 },
    tag: { x: 441, y: 225 },
  },
  sleep: {
    rubi: { x: 557.6, y: 192 },
    dublin: { x: 553.4, y: 241 },
    veneza: { x: 531.2, y: 271 },
    amelie: { x: 452, y: 138 },
    toscana: { x: 547.5, y: 120 },
    oslo: { x: 650.5, y: 118 },
    round: { x: 548.3, y: 152 },
    milano: { x: 626.1, y: 289 },
    berlim: { x: 650.8, y: 271 },
    serenno: { x: 397.9, y: 366 },
    lugano: { x: 530.1, y: 354 },
    provencal: { x: 556.2, y: 329 },
    'hull-sofas': { x: 404, y: 264 },
    'hull-tables': { x: 710, y: 150 },
    'hull-chairs': { x: 710, y: 300 },
    'hull-beds': { x: 398, y: 348 },
    tag: { x: 398, y: 318 },
  },
  cars: {
    rubi: { x: 557.6, y: 195 },
    dublin: { x: 439.4, y: 244 },
    veneza: { x: 408.2, y: 271 },
    amelie: { x: 452, y: 138 },
    toscana: { x: 547.5, y: 123 },
    oslo: { x: 656.5, y: 118 },
    round: { x: 548.3, y: 152 },
    milano: { x: 569.1, y: 319 },
    berlim: { x: 587.8, y: 250 },
    serenno: { x: 403.9, y: 330 },
    lugano: { x: 482.1, y: 366 },
    provencal: { x: 451.2, y: 302 },
    'hull-sofas': { x: 398, y: 150 },
    'hull-tables': { x: 710, y: 144 },
    'hull-chairs': { x: 638, y: 228 },
    'hull-beds': { x: 398, y: 348 },
    tag: { x: 664, y: 359 },
  },
}

const dist = (p: Prod, q: { x: number; y: number }) => Math.hypot(p.x - q.x, p.y - q.y)

/** The products ordered by how close they are to where the question lands. */
export function rankFor(key: QKey, products: Prod[]): Prod[] {
  const q = LANDINGS[key]
  return [...products].sort((a, b) => dist(a, q) - dist(b, q))
}
