# Home page refactor (2026-11-16, Arthur's brief)

Goal: a **simpler home page**, with less on screen. Inspired by https://www.yudiganeko.com/, checked
live on 2026-11-16. That page has:

- a small name logo fixed in the top-left corner while you scroll, linking home;
- a hero with a portrait photo, the name in large type under it, and short facts to the right;
- a study roadmap: phases on a central axis, items branching left and right, each item with a
  checkbox and a `done/total` count, and an "expand all" control;
- a short "About me" (three one-line paragraphs, a photo on the right), then the experience section.

**What the reference is for:** structure and density only. The visuals are not copied (CLAUDE.md:
"Never clone a template"). Palette, type, radius and the drawing language stay this site's own
(design-spec §5). Where this brief and a spec rule disagree, the stage file names the conflict and
Arthur decides.

## Decisions Arthur made (2026-11-16)

1. Remove the datasheet.
2. Replace the target mark (`src/projects/OriginLink.astro`, a circle with a crosshair) with his
   **name as an SVG he drew** (`arthur-heberle.svg`), **top left on every page, home included**,
   linking home. The **EN/PT switch goes top right**. Both stay **always visible while scrolling**, on
   a floating layer above the content, with **no bar or background strip** behind them.
3. Hero: **photo on top**, name **bigger** under it, basic info beside the photo. Arthur adds the
   photo files himself and gives the info when this stage is built. The headline "I make technical
   things make sense to people who didn't build them." moves to the **right of the photo**. The
   spine's two margin notes (reading, working on) go. Everything else in today's hero and spine is
   undecided ("depois eu vejo o que deixar").
4. New **Roadmap** section (study goals and life goals) between Projects and Experience, shaped like
   the reference.
5. New **About me** mini section between Roadmap and Experience.

## New home order

| # | Section | Status |
|---|---|---|
| — | Name SVG top left + EN/PT switch top right, floating, every page | new (replaces the target mark) |
| 1 | Hero: photo, name, info, headline | reworked |
| 2 | Projects (the bench) | unchanged |
| 3 | Roadmap | new |
| 4 | About me | new |
| 5 | Experience | unchanged |
| 6 | Changelog | unchanged |
| 7 | Contact | unchanged |

Gone: the datasheet, the spine's margin notes. The spine paragraph is an open question (03).

## Stages

One stage per session, in order. Each must pass its checklist and `pnpm build` before it counts.
Commit message `home-refactor: <stage>`, then push. When stage 1 starts, add a table
"Home refactor (2026-11-16, Arthur's brief)" to `docs/progress.md` and track the stages there.

Arthur gives the content (texts, photos, info lines, roadmap goals and studies) **when each stage is
implemented**, not in advance. The agent asks for it at the start of the stage.

| Stage | File | Ask Arthur at the start |
|---|---|---|
| 1 | [01-remove-datasheet.md](01-remove-datasheet.md) | nothing |
| 2 | [02-corner-name.md](02-corner-name.md) | is the SVG final, its size |
| 3 | [03-hero.md](03-hero.md) | the photo, the info lines, what stays of the hero/spine |
| 4 | [04-roadmap.md](04-roadmap.md) | the goals and study items |
| 5 | [05-about.md](05-about.md) | the copy, the second photo |
| 6 | Check (below) | — |

## Rules for every stage

Arthur's request wins over any rule below or in the docs (CLAUDE.md, "What wins"): build what he
asked, tell him in one line which rule it breaks, update the doc.

- **design-spec §6 is rewritten** to the new order. Its rule "adding one requires removing one" is
  Arthur's call, and he made it: datasheet and notes out, roadmap and about in. Update §5 (type, layout
  lines that name the datasheet) where a stage touches it.
- **Text lives in a `text.ts`** per section, `{ en, pt: en }`, read with `text[getLang(Astro)]` (the
  i18n stage 1 pattern, `src/shared/i18n/`). Collections are read through `src/shared/i18n/content.ts`.
- **Never invent facts.** Anything only Arthur knows is a `[FILL]`. `scripts/check-fill.mjs` runs inside
  `pnpm build` and fails it on a marker in shown prose, so a stage with missing copy stops and asks.
- **Tokens unchanged** (`src/shared/styles/tokens.css`) unless Arthur asks.
- **No new library.**
- **Motion:** only `transform`, `opacity`, `stroke-dashoffset`; `prefers-reduced-motion` gives final
  states; all content readable with JavaScript off.
- **No layout shift:** every `<img>` and SVG has its size (`width`/`height` or `viewBox` + `aspect-ratio`).
- **Drawings are `aria-hidden`**, one `role="img"` description per drawing at most.
- New CSS gets one `@import` line in `src/shared/styles/global.css`, in cascade order.
- JS stays under 90 KB gzip.

## The unfinished i18n work

The Portuguese version is at stage 1 of 5 (`docs/progress.md`, "Portuguese version + EN/PT switch").
Its plan had the switch in "a thin bar at the top that scrolls with the page"; **that is superseded**:
the switch is a floating element in the top-right corner, always visible, no bar, sharing
`chrome.css` with the name (see 02). No conflict: name left, switch right.
New sections ship `pt: en` until the i18n stages translate them.

## Stage 6: check

- Screenshots with `pnpm shots` at 1440, 1024, 390 (home and both project pages); nothing overlaps
  the fixed name, no horizontal scroll.
- AX tree (`Accessibility.getFullAXTree`) at 1440 and 390: headings in order, no drawing text, the
  corner link named once.
- Keyboard: skip link, then the corner name, then the page; visible focus everywhere.
- JS off and reduced motion: everything readable, final states.
- Lighthouse mobile on home: a11y 100, CLS 0; record perf.
- Not testable here: Firefox, Safari, a real touch device (say so in progress.md).

## Open questions (collected from the stage files)

Content (texts, photos, info, goals) is not listed here: Arthur gives it at each stage.

- **02:** the SVG's size; whether the hero's L-bracket origin mark and datum line stay; legibility of the
  bare name over busy sections.
- **03:** the info lines beside the photo; whether the intro line, the identity list
  (Curitiba, EU citizen, open to global remote), the email link and the spine paragraph stay; the
  photo's alt text; the name centred under the photo (as in the reference) against design-spec §5
  "no centered text anywhere".
- **04:** one axis for studies and life goals, or two tracks; whether an item has a period (week,
  month, year).
- **05:** whether it takes the datasheet's leftovers (languages, chess, guitar).
- **All:** the datasheet facts that would otherwise vanish (see 01).
