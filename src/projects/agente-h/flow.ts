// The wires of Agente H's "How it works": straight and right-angled lines between the parts, kept as
// point lists so the markup (AgenteStory.astro) and the player (story.ts) share one geometry. A
// pulse that travels a wire walks the same points the wire is drawn through.
export interface Pt {
  x: number
  y: number
}

const r1 = (n: number) => +n.toFixed(1)

export const P = (x: number, y: number): Pt => ({ x, y })

/** An SVG path through the points. */
export const poly = (pts: Pt[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${r1(p.x)} ${r1(p.y)}`).join('')

/** A small open chevron whose tip is the last point, pointing the way the last segment runs. */
export function arrow(pts: Pt[], size = 6): string {
  const a = pts[pts.length - 2]
  const b = pts[pts.length - 1]
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1
  const ux = (b.x - a.x) / len
  const uy = (b.y - a.y) / len
  const bx = b.x - ux * size
  const by = b.y - uy * size
  const nx = -uy * size * 0.6
  const ny = ux * size * 0.6
  return `M${r1(bx + nx)} ${r1(by + ny)}L${r1(b.x)} ${r1(b.y)}L${r1(bx - nx)} ${r1(by - ny)}`
}

export const fmtPts = (pts: Pt[]) => pts.map((p) => `${r1(p.x)},${r1(p.y)}`).join(' ')
export const parsePts = (s: string): Pt[] =>
  s.split(' ').map((q) => {
    const [x, y] = q.split(',')
    return { x: +x, y: +y }
  })

/** The query line: the customer's messages joined, in mono 14px (8.4px a character), at the map's top left. */
export const QUERY_LINE = { x: 392, y: 26, ch: 8.4 }
/** Where each message's chip sits on the query line: the centre of its words. */
export function slotsFor(msgs: string[]): Pt[] {
  let at = 0
  return msgs.map((m) => {
    const p = { x: +(QUERY_LINE.x + QUERY_LINE.ch * (at + m.length / 2)).toFixed(1), y: QUERY_LINE.y - 5 }
    at += m.length + 1
    return p
  })
}
/** A chip's width for its text: a character is `em` px wide (7.2 mono, 5.7 for the product names), plus padding. */
export const chipW = (t: string, em = 7.2) => +(t.length * em + 12).toFixed(1)
