import type { Lang } from '../../shared/i18n/lang'

// Home refactor stage 5 (Arthur, 2026-11-18): wording A, built from the facts the stage-1 datasheet held.
const en = {
  heading: 'About me',
  paragraphs: [
    'I speak Portuguese (native), English (advanced), Italian (intermediate) and a little French.',
    'I play chess, mostly fast games.',
    'I play guitar and sing, badly, on purpose.',
  ],
  photoAlt: 'Arthur Heberle',
}

export const text: Record<Lang, typeof en> = { en, pt: en }
