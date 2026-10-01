// The timeline's month arithmetic, shared by the markup (server side only). Month 0 is
// 2025.01; every month is one slot on the axis, and the axis ends at the end of the current
// month (the build month: the deploy workflow rebuilds on the 1st of each month).
export const AXIS_START = '2025-01'

/** "2026-07" -> months since 2025.01 */
export const idx = (month: string) => {
  const [y, m] = month.split('-').map(Number)
  return (y - 2025) * 12 + (m - 1)
}

export const monthOf = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`

export interface Span {
  a: number // start, percent of the axis
  b: number // end, percent of the axis (the end of the last month)
  open: boolean // no end date: the bar ends in an open tip at the current month
}

/** The axis for a set of entries: its length in months, and each entry's span. */
export function layout(entries: { start: string; end: string | null }[], now: string) {
  const last = Math.max(idx(now), ...entries.map((e) => (e.end ? idx(e.end) : 0)))
  const n = last + 1
  const pct = (months: number) => +((months / n) * 100).toFixed(3)
  const spans: Span[] = entries.map((e) => ({
    a: pct(idx(e.start)),
    b: pct((e.end ? idx(e.end) : idx(now)) + 1),
    open: e.end === null,
  }))
  const ticks = Array.from({ length: n + 1 }, (_, i) => ({ x: pct(i), year: i % 12 === 0 && i < n ? 2025 + i / 12 : null }))
  return { n, spans, ticks, pct }
}
