import type { Lang } from '../../shared/i18n/lang'

// Home refactor stage 5 (Arthur, 2026-11-18): wording A, built from the facts the stage-1 datasheet held.
const en = {
  heading: 'About me',
  paragraphs: [
    'I speak Portuguese (native), English (advanced), Italian (intermediate), and I am learning French.',
    'I have many hobbies that I enjoy: playing chess, playing the guitar, and mostly doing motocross.',
    'Born in the interior of Santa Catarina, Brazil, with a dream of traveling the entire world to discover the beauty that it has.',
  ],
  photoAlt: 'Arthur Heberle',
}

const pt: typeof en = {
  heading: 'Sobre mim',
  paragraphs: [
    'Falo português (nativo), inglês (avançado), italiano (intermediário) e estou aprendendo francês.',
    'Tenho vários hobbies de que gosto: jogar xadrez, tocar violão e, principalmente, praticar motocross.',
    'Nasci no interior de Santa Catarina, no Brasil, com o sonho de viajar o mundo inteiro para descobrir a beleza que ele tem.',
  ],
  photoAlt: 'Arthur Heberle',
}

export const text: Record<Lang, typeof en> = { en, pt }
