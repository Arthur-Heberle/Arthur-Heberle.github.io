import type { Lang } from '../../shared/i18n/lang'

const en = {
  heading: 'Roadmap',
  done: 'done',
  notDone: 'not done',
  due: 'due',
  dueLabel: 'Due',
  // "3 of 18 done", read by screen readers in place of the drawn "3/18"
  count: (done: number, total: number) => `${done} of ${total} done`,
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
}

export const text: Record<Lang, typeof en> = { en, pt: en }
export type RoadmapText = typeof en
