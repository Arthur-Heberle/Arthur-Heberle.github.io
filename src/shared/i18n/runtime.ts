// The words a script writes at runtime (button labels, live-region messages, the Agente H questions) travel in
// the page itself as JSON, one <script type="application/json"> per piece (src/shared/i18n/Data.astro), so the
// JS bundle carries no text and does not grow with a language.

/** Fill a template: "Step {n}, {title}" with { n: 2, title: 'Find' }. */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key]))
}

/** The JSON a page embedded under `id` (Data.astro). */
export function readData<T>(id: string): T {
  const el = document.getElementById(id)
  if (!el) throw new Error(`i18n: no data "${id}" in the page`)
  return JSON.parse(el.textContent!) as T
}
