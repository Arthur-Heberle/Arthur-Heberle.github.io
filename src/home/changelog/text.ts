import type { Lang } from '../../shared/i18n/lang'

const en = {
  heading: 'Changelog',
  showAll: 'show all',
}

const pt: typeof en = {
  heading: 'Changelog',
  showAll: 'mostrar tudo',
}

export const text: Record<Lang, typeof en> = { en, pt }
