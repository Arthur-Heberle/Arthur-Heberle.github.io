import type { Lang } from '../../shared/i18n/lang'

const en = {
  heading: 'Projects',
  hint: 'Point at something on the desk.',
}

const pt: typeof en = {
  heading: 'Projetos',
  hint: 'Aponte para algo na mesa.',
}

export const text: Record<Lang, typeof en> = { en, pt }
