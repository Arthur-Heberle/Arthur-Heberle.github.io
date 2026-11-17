// Each timeline's wave, built at build time: random, but seeded from the timeline's id, so it is the same on
// every build and every visit. Two sines of random length, height and phase, summed, sampled into one path.
// The path runs a quarter of the width past each end, so roadmap.ts can shift it sideways under the pointer
// without an end ever showing (the SVG clips it).

// FNV-1a: the id to a 32-bit seed
function hash(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// mulberry32: a small seeded random generator, 0 to 1
function random(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** The wave's path `d`, in a viewBox `width` wide, centred on `mid`, never more than `reach` from it. */
export function wavePath(id: string, width: number, mid: number, reach: number): string {
  const rnd = random(hash(id))
  const between = (lo: number, hi: number) => lo + (hi - lo) * rnd()
  const a1 = between(0.45, 0.65) * reach
  const a2 = between(0.2, 0.35) * reach
  const l1 = between(150, 260)
  const l2 = between(60, 110)
  const p1 = between(0, Math.PI * 2)
  const p2 = between(0, Math.PI * 2)
  const step = 8
  const from = -width / 4
  const to = width * 1.25
  const points: string[] = []
  for (let x = from; x <= to + step; x += step) {
    const y = mid + a1 * Math.sin((x / l1) * Math.PI * 2 + p1) + a2 * Math.sin((x / l2) * Math.PI * 2 + p2)
    points.push(`${Math.round(x)} ${y.toFixed(1)}`)
  }
  return `M${points.join('L')}`
}
