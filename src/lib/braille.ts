// Standard Grade 1 English Braille dot patterns, one authoritative table. The set-piece
// (BrailleCell.astro) derives every dot position from this table plus the word itself — implementation-plan.md step 13's "the dots must correspond
// to the word actually being spelled" holds by construction, not by hand-tracing glyphs.
//
// Dot numbering is the real Braille convention, left column top-to-bottom then right:
//   1 4
//   2 5
//   3 6

export const BRAILLE_ALPHABET: Record<string, number[]> = {
  a: [1],
  b: [1, 2],
  c: [1, 4],
  d: [1, 4, 5],
  e: [1, 5],
  f: [1, 2, 4],
  g: [1, 2, 4, 5],
  h: [1, 2, 5],
  i: [2, 4],
  j: [2, 4, 5],
  k: [1, 3],
  l: [1, 2, 3],
  m: [1, 3, 4],
  n: [1, 3, 4, 5],
  o: [1, 3, 5],
  p: [1, 2, 3, 4],
  q: [1, 2, 3, 4, 5],
  r: [1, 2, 3, 5],
  s: [2, 3, 4],
  t: [2, 3, 4, 5],
  u: [1, 3, 6],
  v: [1, 2, 3, 6],
  w: [2, 4, 5, 6],
  x: [1, 3, 4, 6],
  y: [1, 3, 4, 5, 6],
  z: [1, 3, 5, 6],
}

// One cell is 6 user-space units wide, 9 tall. Dots 1/2/3 sit in the left column at
// x + 1.75, dots 4/5/6 in the right column at x + 4.25; rows 1/2/3 sit at y 2 / 4.5 / 7.
// Chosen so a cell's centre lands at (i + 0.5) / cellCount of the SVG's width — the HTML
// letter row below it is a plain `grid-template-columns: repeat(n, 1fr)` and lines up with
// the cells at every viewport width, no resize observer needed.
const CELL_WIDTH = 6
const DOT_X: Record<number, number> = { 1: 1.75, 2: 1.75, 3: 1.75, 4: 4.25, 5: 4.25, 6: 4.25 }
const DOT_Y: Record<number, number> = { 1: 2, 2: 4.5, 3: 7, 4: 2, 5: 4.5, 6: 7 }

export interface DotPosition {
  /** 1-6, the Braille position within its cell. */
  dot: number
  x: number
  y: number
  raised: boolean
}

export interface BrailleCellData {
  letter: string
  cellIndex: number
  /** All 6 positions for this cell, in dot-number order (1..6): left column top-to-bottom,
   *  then right column top-to-bottom. */
  dots: DotPosition[]
}

/** Every cell for `word`, each carrying its own 6 dot positions (raised ones flagged).
 *  Throws on any character outside BRAILLE_ALPHABET rather than silently skipping it — a
 *  silent gap would render a wrong Braille pattern with no signal anything was wrong. */
export function brailleCells(word: string): BrailleCellData[] {
  return word
    .toLowerCase()
    .split('')
    .map((letter, cellIndex) => {
      const raisedDots = BRAILLE_ALPHABET[letter]
      if (!raisedDots) {
        throw new Error(`braille.ts: no Braille pattern for "${letter}" in "${word}"`)
      }
      const dots: DotPosition[] = [1, 2, 3, 4, 5, 6].map((dot) => ({
        dot,
        x: cellIndex * CELL_WIDTH + DOT_X[dot],
        y: DOT_Y[dot],
        raised: raisedDots.includes(dot),
      }))
      return { letter, cellIndex, dots }
    })
}
