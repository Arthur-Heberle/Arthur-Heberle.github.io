import type { Lang } from '../../shared/i18n/lang'

// Home refactor stage 5 (Arthur, 2026-11-18): wording A, built from the facts the stage-1 datasheet held.
const en = {
  heading: 'About me',
  paragraphs: [
    'I speak Portuguese (native), English (advanced), Italian (intermediate) and learing French.',
    'There is many hobbies that i enjoy doing: playing chess, play the guitar, and mostly do motocross.',
    'Born in the interior of Santa Catarina, Brazil, with a dream of traveling the entire world to discover the beauty that it has.',
  ],
  photoAlt: 'Arthur Heberle',
}

export const text: Record<Lang, typeof en> = { en, pt: en }
