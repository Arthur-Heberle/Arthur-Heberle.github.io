import type { Lang } from './i18n/lang'

const en = {
  skip: 'Skip to main content',
  // the name in the top-left corner (HomeLink.astro)
  home: 'Arthur Heberle, home',
}

const pt: typeof en = { ...en, home: 'Arthur Heberle, início' }

export const text: Record<Lang, typeof en> = { en, pt }
