import type { Lang } from '../../shared/i18n/lang'

const en = {
  heading: 'My Roadmap to study and TODOs',
  // "3 of 7", then " done" for screen readers only
  of: 'of',
  doneSuffix: ' done',
  // a topic's status, read by screen readers before its title
  status: { done: 'Done', doing: 'Doing', next: 'Next' },
  target: 'target',
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  // the box: its name as a keyboard scroll stop, and its two buttons (words handed to roadmap.ts as data-*)
  boxLabel: 'Roadmap, scrollable',
  expandAll: 'Expand all',
  collapseAll: 'Collapse all',
  fullscreen: 'Show the roadmap full screen',
  exitFullscreen: 'Exit full screen',
}

const pt: typeof en = {
  heading: 'Roadmap de estudos e afazeres',
  of: 'de',
  doneSuffix: ' concluídos',
  status: { done: 'Feito', doing: 'Fazendo', next: 'Próximo' },
  target: 'meta',
  months: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  boxLabel: 'Roadmap, com rolagem',
  expandAll: 'Expandir tudo',
  collapseAll: 'Recolher tudo',
  fullscreen: 'Mostrar o roadmap em tela cheia',
  exitFullscreen: 'Sair da tela cheia',
}

export const text: Record<Lang, typeof en> = { en, pt }
export type RoadmapText = typeof en
