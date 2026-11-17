# Stage 4: Roadmap (what I'm studying and building)

Arthur's decision (2026-11-16): a new section **between Projects and Experience**. The first draft of this
file copied the reference's vertical roadmap; Arthur replaced it with the design below.

## Design (Arthur's words, implemented)

- **One horizontal timeline per subject** he is studying or doing: French, RP3, Investment, Agente H (the
  Bible later). Easy to add more.
- Each timeline is a **random wave and a dotted line**. Hovering the timeline makes the wave **move a
  little** (it follows the pointer sideways and swells near the line).
- Each timeline carries its **nodes** (sub-subjects), each with a **date limit** and a **box marked when
  done**. Hovering a node reacts (it lifts, its box frame darkens); **clicking opens a mini description**
  in a small popup at the node.

## Arthur's answers

- The done box is **his progress, set in the YAML** (`done: true`); visitors cannot tick it.
- On a phone each timeline **swipes sideways inside itself**; the page never scrolls sideways.
- The description is a **small popup at the node**.
- Content from his `timeline.md`. French had no dates: he asked for dates **up to Dec 10** (Nov 18 to Dec 10).
- Must be **editable, with a structure** for adding timelines.

## How it is built

- Data: `src/content/roadmap/<id>.yaml`, one per timeline (`README.md` there: how to add a timeline, a
  node, mark done). Schema `roadmap` in `src/content.config.ts`, read by `getRoadmap` in
  `src/shared/i18n/content.ts`. Counts computed at build time.
- `src/home/roadmap/`: `Roadmap.astro` (markup), `roadmap.css`, `text.ts`, `dates.ts` (date labels),
  `wave.ts` (seeded wave path), `roadmap.ts` (wave on hover, popover placement, edge fades; loaded near the
  viewport).
- Popups use the Popover API: they open, close on Esc and outside click with JS off too (centred then).

## Acceptance

- [x] Section between the bench and Experience, with the same gap as the others.
- [x] Every count matches the YAML (built HTML: 0/18, 0/3, 0/7, 0/4).
- [x] JS off: all timelines and nodes readable; popovers open and close.
- [x] Keyboard: each node opens with Enter; visible focus; Esc closes.
- [x] AX tree: h2, an article and h3 per timeline, lists of groups and nodes, node buttons named
      "title, due date, done/not done"; no drawing text.
- [x] 390px: no page horizontal scroll; timelines scroll inside themselves.
- [x] JS under 90 KB gzip; `pnpm build` passes. CLS 0 at 390; 0.00002-0.00003 at 1024/1440 (the bench
      labels' font swap noted in stage 3, not the roadmap).
