// "2026-11" → "Nov 2026": the roadmap shows months only (Arthur, 2026-11-17).
export function monthLabel(month: string, months: string[]): string {
  const [y, m] = month.split('-').map(Number)
  return `${months[m - 1]} ${y}`
}
