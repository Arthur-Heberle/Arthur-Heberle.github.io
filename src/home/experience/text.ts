import type { Lang } from '../../shared/i18n/lang'

const en = {
  heading: 'Experience',
  now: 'now',
  hard: 'The hard part:',
  months: (n: number) => `${n} month${n === 1 ? '' : 's'}`,
  soFar: ' so far',
  // The one description that names each experience's object for assistive technology (the drawing itself is
  // aria-hidden). The RP3, laptop and analyzer descriptions say what is illustrative.
  desc: {
    rp3: "An illustration, not RP3's real interface: a monitor showing a part sliced into layers on a gridded build platform with X, Y and Z axes, the layer contours rising one layer at a time, and beside it a small generic 3D printer building the same part layer by layer.",
    'programming-techniques':
      "A laptop showing a class diagram: Entity, with Player and Enemy inheriting from it, and a Level holding a pointer to an Entity, above a few lines of C++. The class names and code are illustrative of the course's SFML game, not its real code.",
    'eletron-energia':
      'An illustration of a power analyzer in the style of the IMS PowerNET T-500, with green terminal blocks standing out of its front, and three current transformers clamped around cables L1 to L3, current pulsing through them, wired to its inputs, its display cycling through illustrative readings; beside it a clipboard with a spreadsheet, a printed measurement-and-verification report, and a chart of consumption before and after with the savings between the two. The readings and figures are illustrative, not measured values.',
    'calculus-ii':
      'A chalkboard in a wooden frame, with a tray along its foot holding chalk and an eraser. It is written on in chalk and shows worked problems: Calculus II on one half (the curve y equals 3x squared from 0 to 2 with the area under it hatched, and its integral worked out, with one wrong attempt struck through, to 8) and Calculus III on the other (the surface z equals x squared plus y squared, and a double integral of x plus y worked out to 3). Faint marks show where it was wiped.',
  } as Record<string, string>,
}

export const text: Record<Lang, typeof en> = { en, pt: en }
