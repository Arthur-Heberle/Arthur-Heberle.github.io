import type { Lang } from '../../shared/i18n/lang'

// Home refactor stage 3 (Arthur, 2026-11-16): photo, "Hi! I'm", the name (the page's <h1>), the role
// under it; identity and intro beside the photo. The old headline was removed at his request.
const en = {
  greeting: "Hi! I'm",
  name: 'Arthur Heberle',
  role: 'Computer Engineering Student',
  photoAlt: 'Arthur Heberle',
  identity: ['Curitiba, Brasil', 'EU citizen', 'open to global remote'],
  // the region each identity line lights on the hero map, in the same order (Arthur, 2026-11-18)
  identityRegion: ['cwb', 'eu', 'world'],
  mapLabel: 'Map of the Americas and Europe drawn in dots',
  // two lines, broken after "Curitiba." (Arthur, 2026-11-16)
  intro: ['Computer engineering at UTFPR, in Curitiba.', 'Embedded systems, C++, and AI automation.'],
}

const pt: typeof en = {
  greeting: 'Olá! Eu sou',
  name: 'Arthur Heberle',
  role: 'Estudante de Engenharia de Computação',
  photoAlt: 'Arthur Heberle',
  identity: ['Curitiba, Brasil', 'Cidadania europeia', 'aberto a trabalho remoto global'],
  identityRegion: en.identityRegion,
  mapLabel: 'Mapa das Américas e da Europa desenhado com pontos',
  intro: ['Engenharia de Computação na UTFPR, em Curitiba.', 'Sistemas embarcados, C++ e automação com IA.'],
}

export const text: Record<Lang, typeof en> = { en, pt }
