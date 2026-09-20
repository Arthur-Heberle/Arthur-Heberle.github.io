// Which archive entries have their own project page, and at what path. One list, read by
// both the route (src/pages/projects/[slug].astro's getStaticPaths) and ArchiveRow (which
// entries get a linked title) so the two can never disagree about which ids exist.
export const PROJECT_PAGES = ['edubra'] as const

export function hasProjectPage(id: string): boolean {
  return (PROJECT_PAGES as readonly string[]).includes(id)
}

export function projectPageHref(id: string): string {
  return `/projects/${id}/`
}
