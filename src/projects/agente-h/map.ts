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
/** Where every label goes, per question, for the English names. Portuguese: LABELS_PT. */
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

/** Where every label goes for the Portuguese names, per question. Found like the English table (a search that keeps
 *  every label clear of the lines to the eight nearest, the rings, the dots, the other labels, the map's caption, the
 *  arrow in from the left and the frame), with each label's width measured in the page; the rule is checked again in
 *  the page for every question (labels in the built page, getBBox). */
export const LABELS_PT: Record<QKey, Record<string, At>> = {
  sofa: {
    rubi: { x: 557, y: 209 },
    dublin: { x: 555.2, y: 232 },
    veneza: { x: 407.9, y: 266 },
    amelie: { x: 450, y: 134 },
    toscana: { x: 496, y: 117 },
    oslo: { x: 638.1, y: 121 },
    round: { x: 539, y: 143 },
    milano: { x: 622.5, y: 293 },
    berlim: { x: 597.5, y: 267 },
    serenno: { x: 457.1, y: 362 },
    lugano: { x: 520.8, y: 340 },
    provencal: { x: 549.4, y: 323 },
    'hull-sofas': { x: 464, y: 112 },
    'hull-tables': { x: 638, y: 93 },
    'hull-chairs': { x: 634, y: 249 },
    'hull-beds': { x: 479, y: 295 },
    tag: { x: 409, y: 229 },
  },
  sleep: {
    rubi: { x: 555, y: 196 },
    dublin: { x: 551.2, y: 239 },
    veneza: { x: 525.9, y: 276 },
    amelie: { x: 450, y: 139 },
    toscana: { x: 496, y: 120 },
    oslo: { x: 562.1, y: 137 },
    round: { x: 521, y: 156 },
    milano: { x: 622.5, y: 293 },
    berlim: { x: 559.5, y: 256 },
    serenno: { x: 396.1, y: 366 },
    lugano: { x: 523.8, y: 361 },
    provencal: { x: 553.4, y: 327 },
    'hull-sofas': { x: 464, y: 112 },
    'hull-tables': { x: 638, y: 93 },
    'hull-chairs': { x: 634, y: 222 },
    'hull-beds': { x: 507, y: 302 },
    tag: { x: 525, y: 344 },
  },
  cars: {
    rubi: { x: 555, y: 198 },
    dublin: { x: 422.2, y: 239 },
    veneza: { x: 411.9, y: 266 },
    amelie: { x: 450, y: 139 },
    toscana: { x: 496, y: 120 },
    oslo: { x: 562.1, y: 137 },
    round: { x: 521, y: 156 },
    milano: { x: 483.5, y: 310 },
    berlim: { x: 543.5, y: 226 },
    serenno: { x: 396.1, y: 362 },
    lugano: { x: 520.8, y: 358 },
    provencal: { x: 412.4, y: 327 },
    'hull-sofas': { x: 464, y: 112 },
    'hull-tables': { x: 638, y: 93 },
    'hull-chairs': { x: 634, y: 265 },
    'hull-beds': { x: 482, y: 293 },
    tag: { x: 580, y: 248 },
  },
}

const dist = (p: Prod, q: { x: number; y: number }) => Math.hypot(p.x - q.x, p.y - q.y)

/** The products ordered by how close they are to where the question lands. */
export function rankFor(key: QKey, products: Prod[]): Prod[] {
  const q = LANDINGS[key]
  return [...products].sort((a, b) => dist(a, q) - dist(b, q))
}
