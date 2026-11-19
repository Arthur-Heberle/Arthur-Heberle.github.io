import type { Lang } from '../../shared/i18n/lang'

const en = {
  heading: 'Contact',
  invitation: "Tell me what you're building and I'll tell you honestly whether I'm useful to it.",
}

const pt: typeof en = {
  heading: 'Contato',
  invitation: 'Me conte o que você está construindo e eu te digo com sinceridade se posso ser útil nisso.',
}

export const text: Record<Lang, typeof en> = { en, pt }
