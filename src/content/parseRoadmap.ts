// Reads src/content/roadmap.md (Arthur's roadmap, written by hand) into the `roadmap` collection
// (content.config.ts). The file's own comment explains the format; in short:
//   # Timeline              one timeline (a # with no items under it, like the top "# Roadmap", is skipped)
//   ## Group                a sub-group of the timeline (a subtheme on the site)
//   > text                  the group's one-line explanation (optional, right under its "##")
//   - **Title** — about. *Done* | *Done, Oct 2026* | *Doing, target Nov 2026* | *Next, Dec 2026*
// HTML comments are ignored. Any other line starting with "-", or an item outside a timeline and group, stops
// the build with its line number, so a typo never reaches the site.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const ITEM =
  /^- \*\*(.+?)\*\*\s*[—–-]\s*(.*?)\s*\*(Done|Doing|Next)(?:,\s*(?:target\s+)?([A-Z][a-z]{2})\s+(\d{4}))?\*\s*$/

export type RoadmapItem = { title: string; about: string; status: 'done' | 'doing' | 'next'; month?: string }
export type RoadmapGroup = { title: string; about?: string; items: RoadmapItem[] }
export type RoadmapTimeline = { id: string; order: number; title: string; groups: RoadmapGroup[] }

const slug = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export function parseRoadmap(source: string, file = 'src/content/roadmap.md'): RoadmapTimeline[] {
  // comments become blank lines, so the line numbers in errors stay right
  const text = source.replace(/<!--[\s\S]*?-->/g, (c) => c.replace(/[^\n]/g, ''))
  const timelines: RoadmapTimeline[] = []
  let timeline: RoadmapTimeline | undefined
  let group: RoadmapGroup | undefined
  const fail = (n: number, why: string, line: string): never => {
    throw new Error(`${file} line ${n}: ${why}\n  ${line}`)
  }

  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim()
    const n = i + 1
    if (!line) return
    if (line.startsWith('## ')) {
      if (!timeline) fail(n, 'a "##" group before any "#" timeline', line)
      group = { title: line.slice(3).trim(), items: [] }
      timeline!.groups.push(group)
    } else if (line.startsWith('# ')) {
      const title = line.slice(2).trim()
      timeline = { id: slug(title), order: timelines.length, title, groups: [] }
      timelines.push(timeline)
      group = undefined
    } else if (line.startsWith('>')) {
      if (!group) fail(n, 'a ">" explanation outside a "##" group', line)
      if (group!.about) fail(n, 'a second ">" explanation for the same group', line)
      group!.about = line.slice(1).trim()
    } else if (line.startsWith('-')) {
      const m = ITEM.exec(line)
      if (!m) fail(n, 'expected "- **Title** — text. *Done*", "*Doing, target Nov 2026*" or "*Next, Dec 2026*"', line)
      if (!group) fail(n, 'an item before any "##" group', line)
      const [, title, about, status, mon, year] = m!
      let month: string | undefined
      if (mon) {
        const index = MONTHS.indexOf(mon)
        if (index < 0) fail(n, `unknown month "${mon}" (use ${MONTHS.join(', ')})`, line)
        month = `${year}-${String(index + 1).padStart(2, '0')}`
      }
      group!.items.push({ title, about, status: status.toLowerCase() as RoadmapItem['status'], month })
    }
    // any other line (a paragraph, a "Goal:" note) is not shown
  })

  return timelines
    .map((t) => ({ ...t, groups: t.groups.filter((g) => g.items.length > 0) }))
    .filter((t) => t.groups.length > 0)
    .map((t, order) => ({ ...t, order }))
}
