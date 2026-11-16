# Stage 4: Roadmap (goals and studies)

Arthur's decision: a new section **between Projects and Experience** with what he is studying and the
goals he is working toward, life and study, **shaped like the reference's roadmap**.

## What the reference does (checked live, 2026-11-16)

A framed panel with a title, a duration ("24 semanas") and one objective line, an "expand all" button,
then a vertical axis down the middle. Each **phase** is a dark node on the axis with a `done/total`
count and a thin progress bar. **Items** branch off left and right on curved lines; each item card has a
small label ("SEMANA 01"), a title, a checkbox, a count ("0/9") and a chevron that opens its sub-items.

## This site's version

Same structure, drawn in this site's language (design-spec §5), not copied:

- The axis is a drawn line (`--color-line` or graphite), phases are nodes on it, items hang off it on
  **leader lines** (orthogonal elbows, like the spine's leaders), not curves.
- Phase node: phase name, mono `done/total` (IBM Plex Mono: counts are its job).
- Item: small period label (only if items have periods), title, a drawn check mark when done, mono
  count of sub-items if it has any, open/close for sub-items.
- Ticks are **Arthur's progress, shown, not toggleable**: no form inputs. The state is said in text for
  screen readers ("done" / "not done").
- Expand/collapse: `<details>`/`<summary>` per item (works with JS off). With JS, one
  "Expand all" `.control` button (6px radius); no button without JS.
- Mobile (below 768px): one column, axis on the left, items to its right.
- Colour: no new tokens. `--signal` only for one active mark if needed (it is budgeted ~8 per page);
  `--measure` is not used (UI, not a set-piece).

## Files

- `src/home/roadmap/Roadmap.astro`, `roadmap.css` (`@import` in `global.css` after the bench),
  `text.ts` (`{ en, pt: en }`: section title, intro line, "Expand all", "done"/"not done").
- `roadmap.ts` only if the expand-all button or the draw-in needs it; loaded near the viewport like
  `bench.ts`.
- `src/home/HomePage.astro`: `<Roadmap />` after `<Bench />`.
- Section title "Roadmap" with `.section-title` and `.section-gap`, like the other sections.

## Data

A new content collection, one YAML file read with `file()` (like `src/content/changelog.yaml`),
declared in `src/content.config.ts`, read through `src/shared/i18n/content.ts`:

```yaml
# src/content/roadmap.yaml  (shape only; the items are Arthur's)
- id: phase-1
  title: "[FILL]"
  items:
    - title: "[FILL]"
      period: "[FILL]"     # optional
      done: false
      sub:                 # optional
        - { title: "[FILL]", done: false }
```

Counts (`done/total` per phase and per item) are computed at build time, never typed.

## Motion (optional, after the static version passes)

- Axis and leaders draw by `stroke-dashoffset` when the section enters the viewport; phase counts fade
  in. Reduced motion and no JS: drawn.
- Opening an item: no height animation (forbidden); the content fades in with opacity only.

## Open questions for Arthur

- The phases and the items, with what is done ([FILL] until then; the build fails on a marker).
- One axis mixing study and life goals, or two (e.g. a study track and a life track side by side).
- Do items carry a period (week, month, year), and is there an overall objective line and duration
  like the reference's.
- Title wording: "Roadmap", "What I'm working toward", or other.

## Acceptance

- [ ] Section between the bench and Experience, with the same gap as the others.
- [ ] Every count matches the YAML (checked by reading the built HTML).
- [ ] JS off: all phases and items readable, `<details>` open and close.
- [ ] Keyboard: each item opens with Enter/Space; visible focus; "Expand all" works and its label
      reflects the state.
- [ ] AX tree: section heading, phase headings, lists of items, done state in text; no drawing text.
- [ ] 390px: no horizontal scroll; clear of the fixed corner name.
- [ ] CLS 0; JS under 90 KB gzip; `pnpm build` passes.
