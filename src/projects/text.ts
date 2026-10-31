import type { Lang } from '../shared/i18n/lang'

const en = {
  builtSolo: 'How I built it',
  builtTeam: 'How we built it',
  next: "What's next",
  part: 'My part',
  differently: "What I'd do differently",
  links: 'Links',
  repo: 'Code on GitHub',
  live: 'live',
  // the title block at the foot of a project page
  sheetInfo: 'Sheet information',
  index: 'index',
  sheetOf: (name: string, nn: string, total: string) => `${name}, sheet ${nn} of ${total}`,
  sheetLink: (nn: string) => `sheet ${nn}`,
  nextLabel: (name: string, nn: string) => `Next: ${name}, sheet ${nn}`,
  backToHome: 'Arthur Heberle, back to home',
  // <title> of a project page: "<project> — Arthur Gabriel Pellegrini Heberle"
  pageTitle: (project: string) => `${project} — Arthur Gabriel Pellegrini Heberle`,
}

export const text: Record<Lang, typeof en> = { en, pt: en }
