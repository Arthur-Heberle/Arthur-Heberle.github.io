import type { Lang } from '../../shared/i18n/lang'

const en = {
  identity: ['Curitiba, Brasil', 'EU citizen', 'open to global remote'],
  headline: "I make technical things make sense to people who didn't build them.",
  intro: 'Computer engineering at UTFPR, in Curitiba. Embedded systems, C++, and AI automation.',
}

export const text: Record<Lang, typeof en> = { en, pt: en }
