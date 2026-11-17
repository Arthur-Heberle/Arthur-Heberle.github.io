import type { Lang } from '../../shared/i18n/lang'

const en = {
  heading: 'My Roadmap to study and TODOs',
  // "3 of 7", then " done" for screen readers only
  of: 'of',
  doneSuffix: ' done',
  // a topic's status, read by screen readers before its title
  status: { done: 'Done', doing: 'Doing', next: 'Next' },
  target: 'target',
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  // the box: its name as a keyboard scroll stop, and its two buttons (words handed to roadmap.ts as data-*)
  boxLabel: 'Roadmap, scrollable',
  expandAll: 'Expand all',
  collapseAll: 'Collapse all',
  fullscreen: 'Show the roadmap full screen',
  exitFullscreen: 'Exit full screen',
}

export const text: Record<Lang, typeof en> = { en, pt: en }
export type RoadmapText = typeof en
