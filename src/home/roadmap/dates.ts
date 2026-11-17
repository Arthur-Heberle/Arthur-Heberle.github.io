// Date labels for the roadmap's nodes, from the YAML's "YYYY-MM-DD" / "YYYY-MM" (content.config.ts).
//   short: on the timeline, compact ("Nov 21", "Nov 23–29", "Nov 30 – Dec 6", "Jan 2027"), with the year
//          only when asked (the first node, and wherever the year changes)
//   long:  in the popup, always with the year ("Nov 21, 2026", "Nov 23–29, 2026")
type Parts = { y: number; m: number; d?: number }

const parse = (value: string): Parts => {
  const [y, m, d] = value.split('-').map(Number)
  return { y, m, d }
}

export const yearOf = (value: string) => parse(value).y

export function dateLabel(due: string, start: string | undefined, months: string[], withYear: boolean): string {
  const e = parse(due)
  const mon = (p: Parts) => months[p.m - 1]
  // a month with no day ("2027-01") always names its year: "Jan" alone says too little
  if (e.d === undefined) return `${mon(e)} ${e.y}`
  const year = withYear ? `, ${e.y}` : ''
  if (!start) return `${mon(e)} ${e.d}${year}`
  const s = parse(start)
  if (s.d === undefined) return `${mon(s)} – ${mon(e)} ${e.d}${year}`
  if (s.y !== e.y) return `${mon(s)} ${s.d}, ${s.y} – ${mon(e)} ${e.d}, ${e.y}`
  if (s.m === e.m) return `${mon(e)} ${s.d}–${e.d}${year}`
  return `${mon(s)} ${s.d} – ${mon(e)} ${e.d}${year}`
}
