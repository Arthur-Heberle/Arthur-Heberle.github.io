import type { CollectionEntry } from 'astro:content'

// The projects' own order: pinned first, then by date descending, then projects with no date
// (in their existing collection order: Array#sort is stable, and glob() yields entries in
// filename order). One function, read by the home bench and by a project page's title block, so
// the "sheet NN" a project page shows is always its place on the bench.
export function sortProjects(entries: CollectionEntry<'projects'>[]) {
  return entries.slice().sort((a, b) => {
    if (a.data.pinned !== b.data.pinned) return a.data.pinned ? -1 : 1
    if (!a.data.date !== !b.data.date) return a.data.date ? -1 : 1
    if (!a.data.date || !b.data.date) return 0
    return b.data.date.localeCompare(a.data.date)
  })
}
