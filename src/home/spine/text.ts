import type { Lang } from '../../shared/i18n/lang'

// The paragraph is cut around its two balloon links: `before1` ends where balloon 1 sits, `between` runs to
// balloon 2, and balloon 2 ends the paragraph.
const en = {
  about: 'About',
  before1:
    "I build things that sit between software and the physical world. A device that turns digital text into Braille. A WhatsApp agent that sells from a shop's own catalogue. A 2D platformer in C++. The part I'm best at is the handover: getting the thing understood by the people who have to use it, sign it off, or pay for it.",
  between: ' And I build my own projects when nobody asked me to.',
  note1: 'note 1, reading',
  note2: 'note 2, working on',
  backTo: (n: number) => `back to reference ${n}`,
}

export const text: Record<Lang, typeof en> = { en, pt: en }
