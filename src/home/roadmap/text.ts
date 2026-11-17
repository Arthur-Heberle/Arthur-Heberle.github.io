import type { Lang } from '../../shared/i18n/lang'

const en = {
  heading: 'Roadmap',
  // "3 of 7", then " done" for screen readers only
  of: 'of',
  doneSuffix: ' done',
  // the status, lower case in a pill's accessible name, capitalised in its popover
  status: { done: 'done', doing: 'doing', next: 'next' },
  statusLabel: { done: 'Done', doing: 'Doing', next: 'Next' },
  target: 'target',
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
}

export const text: Record<Lang, typeof en> = { en, pt: en }
export type RoadmapText = typeof en
