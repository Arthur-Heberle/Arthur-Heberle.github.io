import type { Lang } from '../../shared/i18n/lang'

const en = {
  title: 'Arthur Heberle — datasheet',
  sheetInfo: 'Sheet information',
  sheet: 'datasheet, sheet 01 of 01',
  rev: 'rev.',
  parameter: 'Parameter',
  value: 'Value',
  featuresHeading: 'Features',
  features: [
    ['Learns fast, under load.', 'Electrical engineering from zero at ELETRON. OpenGL and a research codebase built over more than a decade at RP3.'],
    ['Explains things.', 'Monitor twice, in Calculus II and in Programming Techniques, about four students a week.'],
    ['Starts things nobody asked for.', 'Agente H: designed, built and tested alone, with 46 automated tests.'],
    ['Works from the wire to the web.', 'EduBra: most of the hardware and all of the software. Agente H: the backend, the search and the dashboard.'],
  ],
  characteristicsHeading: 'Typical characteristics',
  // `id` is the key the markup uses (the languages row carries a drawing); `k` and `v` are shown text.
  characteristics: [
    { id: 'languages', k: 'Languages', v: 'Portuguese (native), English (advanced), Italian (intermediate), French (basic)' },
    { id: 'students', k: 'Students helped', v: 'about 4 a week for 12 weeks, in each of two monitor posts' },
    { id: 'projects', k: 'Projects built', v: '3' },
    { id: 'tests', k: 'Automated tests, Agente H', v: '46' },
    { id: 'graduation', k: 'Graduation', v: 'Computer engineering, UTFPR, December 2028' },
  ],
  conditionsHeading: 'Operating conditions',
  conditions: [
    ['Location', 'Curitiba, Brasil'],
    ['Time zone', 'UTC−3'],
    ['Citizenship', 'EU'],
    ['Mode', 'Open to global remote'],
  ],
  effectsHeading: 'Known side effects',
  chess: 'Plays chess, mostly fast games.',
  guitar: 'Plays guitar and sings, badly, on purpose.',
  orderHeading: 'Ordering information',
}

export const text: Record<Lang, typeof en> = { en, pt: en }
