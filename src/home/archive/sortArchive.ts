import type { CollectionEntry } from 'astro:content'

// The archive's own order: pinned first, then by date descending, then entries with an
// unresolved [FILL] date last (in their existing collection order: Array#sort is stable, and
// glob() yields entries in filename order, so this needs no explicit tiebreak of its own).
// One function, read by the home archive and by a project page's title block, so the "sheet
// NN" a project page shows is always its place in the list the reader saw on the home page.
export function sortArchive(entries: CollectionEntry<'archive'>[]) {
  return entries.slice().sort((a, b) => {
    if (a.data.pinned !== b.data.pinned) return a.data.pinned ? -1 : 1
    const aFill = a.data.date.includes('[FILL')
    const bFill = b.data.date.includes('[FILL')
    if (aFill !== bFill) return aFill ? 1 : -1
    if (aFill && bFill) return 0
    return b.data.date.localeCompare(a.data.date)
  })
}
