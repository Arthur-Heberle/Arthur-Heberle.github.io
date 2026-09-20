# Step 13 — Project page template and EduBra set-piece

## Context

Steps 01–12 shipped the whole home page and every motion tier except one: nothing on the
site is pinned yet. `motion.ts` carried two literal placeholder comments reserving the
spot (`// step 13: the one pinned set-piece.` and `// step 13: never pinned here either.`).

This step is the last build step before final QA (step 14) and the one the whole design
argues toward — `design-spec.md:358` calls it *"the strongest piece on the site"*: EduBra
converts text to touch, and the set-piece performs exactly that conversion under the
reader's own scroll, demonstrating the project instead of describing it.

Two things needed Arthur's decision before this could be built, both settled this session:

1. **The word is `EDUBRA`.** `docs/content.md:175` carried `Word the set-piece spells:
   [FILL]`, and `implementation-plan.md:285` makes this an explicit stop-and-ask. 6 cells,
   15 raised dots. Not added as a schema field — `docs/plans/step-03.md:221` explicitly
   left it open rather than adding a `brailleWord` field neither spec lists — so it's
   passed directly at the one call site that needs it,
   `src/pages/projects/[slug].astro`.
2. **Three structural decisions** a prior plan deferred rather than took:
   - Project pages live at `/projects/<id>/` (neither spec named a URL).
   - The four template prose fields (`design-spec.md:194`: what and why, what he actually
     did, role and team, what he'd do differently) are an **optional `project` object on
     the archive schema**, not markdown body prose — closing the question
     `docs/plans/step-03.md:221-222` left open.
   - The archive row's **existing `<h3>` title becomes a link** for an entry with a page.
     No new row field, no new visual weight.
3. **The prose ships as `[FILL]` markers**, rendered through the existing `Fill.astro`
   drafting-annotation policy — exactly what the archive already does for `role`/`date`.
   Step 14 already gates on the `[FILL]` count reaching zero.

**Outcome.** `/projects/edubra/` exists, reads completely with JS off, and on desktop pins
once while 15 Braille dots fill under the reader's scroll, spelling EDUBRA, each letter
lighting up in the text row alongside as its own cell completes.

---

## Geometry — the Braille cell

Standard 6-dot cell, dots numbered `1 4 / 2 5 / 3 6` (left column top-to-bottom, then
right). `src/lib/braille.ts` holds the full Grade 1 alphabet table and derives every dot
position from a word string — the pattern can't drift from the word actually being spelled
(`implementation-plan.md:275`), because it's generated, not hand-drawn.

```
 E      D      U      B      R      A
●·     ●●     ●·     ●·     ●·     ●·
·●     ·●     ··     ●·     ●●     ··
··     ··     ●●     ··     ●·     ··

e=1,5  d=1,4,5  u=1,3,6  b=1,2  r=1,2,3,5  a=1     15 dots
```

`viewBox="0 0 36 9"` — six 6-unit columns, cell centres at `(i+0.5)/6` of the width, so a
plain `grid-template-columns: repeat(6, 1fr)` letter row underneath lines up with the SVG
at every viewport width, no resize observer. All 36 positions render as faint
`--color-line` construction circles (`.braille-well`) — a cell has six positions whether
or not they're raised, and drawing the empty ones is the annotated-technical-drawing
concept doing its job. The 15 raised ones are `--color-measure` circles (`.braille-dot`)
stacked on top — the first use of that token anywhere on the site (`tokens.css`: *"appears
only inside set-piece drawings, never in UI"*).

Verified against the built output, not just reasoned about: every circle's `cx`/`cy`/class
was read back out of `dist/projects/edubra/index.html` and checked cell by cell against
the alphabet table above — all 15 raised, all 21 empty, in the right positions.

### The text version alongside

`design-spec.md:359` wants the text version rendering alongside, but `motion-spec.md:10-12`
says tier-1 scrubbed motion is never text. Both hold: each letter ships twice, stacked on
one CSS grid cell (`grid-area: 1 / 1`, the same technique as step 10's `.leader-hi`) — a
`--graphite-2` base that never moves, and a `--signal` duplicate at `opacity: 0` that
crossfades on as its own cell's last dot lands. No text moves, nothing is hidden from a
no-JS reader, and a colour swap that can't transition (`motion-spec.md`'s property rule)
is a second element instead, exactly like the leader highlight.

---

## The timeline and the pin

One `gsap.timeline()` on one pinned `ScrollTrigger` in `setPieceBraille()` — the only pin
in the codebase.

| Setting | Value | Why |
|---|---|---|
| `trigger` | the `[data-braille]` stage | |
| `start` | `'top top'` | |
| `end` | `'+=150%'` | 15 dots over 1.5 viewport heights |
| `pin` | `true` | `design-spec.md §8`/`motion-spec.md`: at most one per page |
| `pinSpacing` | `true` | see below — not in the original plan |
| `anticipatePin` | `1` | avoids a flash of the unpinned layout on a fast scroll in |
| `scrub` | `SCRUB` (`0.8`) | `motion.ts`'s one existing scrub value, reused |
| `invalidateOnRefresh` | `true` | required, or resizing breaks the mapping |

Dot `n` (reading order: cell by cell, dot 1..6 within each cell — the same order
`brailleCells()` emits and `BrailleCell.astro` renders) gets
`tl.from(dot, { scale: 0, opacity: 0, duration: 1, ease: 'none' }, n)`. A letter's
highlight fades in at its cell's last dot + 1 (the position that dot's own tween
completes at), over half a "dot" of scroll. `gsap.from()`'s default `immediateRender`
writes each dot's hidden start state synchronously at creation — the markup ships fully
filled, so a failed GSAP load leaves an already-complete diagram, satisfying the
JS-disabled acceptance criterion for free, the same pattern `Rule.astro`/`Tick.astro`/
`MarginNote.astro` already use.

### `pinSpacing: true` — found and fixed live, not in the approved plan

The first build pinned correctly by every internal measure — `ScrollTrigger.getAll()`
reported `start`/`end` 1109px apart, exactly `150%` of the viewport — but the page's total
scroll height never grew to match: `.pin-spacer`'s rendered height stayed exactly the
stage's own 204px. The whole set-piece played out inside its unpinned box; scrolling past
it took one ordinary scroll tick, with no perceptible "stuck" scroll at all. This is an
easy state to miss, because everything that's simple to check (the trigger exists, `pin`
is truthy, the element does go `position: fixed`) looked correct.

Read `node_modules/gsap/ScrollTrigger.js:1177` rather than guess:

> *"if the parent is display: flex, don't apply pinSpacing by default"*

`ProjectPage.astro`'s `<article class="flex flex-col gap-16 py-16">` — the pinned stage's
parent — is exactly that. GSAP silently disables its own spacing mechanism under a flex
parent unless told otherwise. Fix: `pinSpacing: true` in the `scrollTrigger` config,
nothing else — no markup change, no new dependency, still the one pin the plan called for.

Re-verified live after the fix, via a real browser (`claude-in-chrome`), not by reasoning
from the diff:
- `.pin-spacer` height 1313px (`204 + 1109`), document height `790px → 1899px`.
- Dots filled progressively under real mouse-wheel scroll, each letter's highlight
  crossfading in exactly as its own cell completed (`E` and `D` confirmed visually).
- Reversible: scrolling back up un-filled dots and un-highlighted letters correctly.
- A real `location.reload()` mid-pin (scrollY ≈ 400, inside the pin range) restored the
  same scroll position and the same partial-fill state — no jump to the top, no jump to
  the pin's start.
- Console clean throughout (no GSAP warnings, no errors), on `/`, on `/projects/edubra/`
  at load, mid-scroll, and after reload.

---

## Files

| File | Action |
|---|---|
| `src/lib/braille.ts` | **new** — the Grade 1 alphabet table, `brailleCells()`, `brailleDotCount()` |
| `src/lib/projects.ts` | **new** — `PROJECT_PAGES`, `hasProjectPage()`, `projectPageHref()` — the one list the route and `ArchiveRow` both read |
| `src/components/BrailleCell.astro` | **new** — the set-piece: `role="img"` SVG with `<title>`/`<desc>`, 36 circles, the 6-letter text row |
| `src/components/ProjectPage.astro` | **new** — the template, `design-spec.md §6`'s seven fields in order, every prose slot through `<Fill>`; the set-piece arrives via `<slot />` |
| `src/pages/projects/[slug].astro` | **new** — `getStaticPaths()` over `PROJECT_PAGES`; `<Base>` → `<main class="page-main">` → `<Rule />` → `<ProjectPage>` |
| `src/content.config.ts` | edit — `project` object added to `archive`, optional |
| `src/content/archive/edubra.md` | edit — `project` block added, four new `[FILL]` markers |
| `src/components/ArchiveRow.astro` | edit — title becomes an `<a>` when `hasProjectPage(entry.id)` |
| `src/scripts/motion.ts` | edit — `setPieceBraille()`, called before `tier2Reveals(true)` in the desktop branch; one `clearProps` line added to the reduced-motion branch for `.braille-dot`/`.braille-letter-hi` |
| `src/styles/type.css` | edit — `.braille-stage`/`.braille-cells`/`.braille-dot`/`.braille-letters`/`.braille-letter`/`.braille-letter-hi`; `.page-main > article` added to the existing Tick-positioning selector |
| `docs/content.md` | edit — `EDUBRA` recorded, new "Project pages" section with EduBra's four `[FILL]`s |
| `docs/progress.md` | edit — step 13 marked done, Braille-word question ticked, `[FILL]` count updated 11 → 15, `pinSpacing` divergence and two new environment notes logged |
| `docs/plans/step-13.md` | **new** — this file |

**Untouched, deliberately:** `tokens.css` (no value changed — `--color-measure` already
existed), `Rule.astro`, `Tick.astro`, `MarginNote.astro`, `Spine.astro`, `Hero.astro`,
`HeroDrawing.astro`, `Fill.astro`, `Base.astro`, `index.astro`, `astro.config.mjs`,
`package.json` (no new dependency), and every other `motion.ts` function
(`tier1Rule`/`tier1Ticks`/`tier1Leaders`/`tipScrollFor`/`heroSequence`/`flipFilter`/
`crossfadeFilter`).

---

## Verification

`pnpm check` and `pnpm build` both pass. Walked live against step 13's acceptance
checklist (`implementation-plan.md:277-283`) with a real browser (`claude-in-chrome`),
via real mouse-wheel scroll, not `window.scrollTo()` (Lenis owns scroll and only updates
from its own `raf()`, per step 09's standing lesson):

1. **Exactly one pinned ScrollTrigger** — confirmed via `ScrollTrigger.getAll().filter(t
   => t.pin).length === 1` in a temporary debug session (`window.gsap`/`window.ScrollTrigger`
   exposed, used to diagnose the `pinSpacing` issue, then removed before the final build —
   same technique step 12's notes describe).
2. **Below 768px unpinned, static, one triggered reveal** — `setPieceBraille()` is only
   called from the `>=768px` branch; the `<768px` branch's existing `tier2Reveals(false)`
   reveals the stage over already-complete markup, by design (no new mobile code needed).
   Not re-verified in a real narrow viewport this session — this sandbox's known iframe/
   `resize_window` limitations (`progress.md`'s standing notes) apply here too; recommend
   before step 14 ships.
3. **Reduced motion: final state, no pin, no scrub** — this sandbox cannot emulate
   `prefers-reduced-motion` live (`progress.md`, steps 08/11). Verified by code review: the
   branch never calls `setPieceBraille()`, and its own `clearProps` line handles a
   mid-session toggle. Added to the standing list for a manual DevTools check before step 14.
4. **JS disabled: diagram visible, page reads completely** — grepped the built HTML: no
   inline `opacity`/hiding style on the stage or any dot; all 15 `.braille-dot` and 6
   `.braille-letter-base` present and correct in `dist/projects/edubra/index.html`.
5. **Pin causes no scroll jump on refresh mid-page** — confirmed live: scrolled to
   scrollY≈400 (mid-pin), `location.reload()`, scroll position and dot/letter state both
   held, matching pre-reload exactly.
6. **Braille pattern correct for the word shown** — all 15 raised dots checked cell by
   cell against the alphabet table (see Geometry, above) directly from the built HTML.

**Standing floors:** clean console on `/` and `/projects/edubra/`, at load, mid-scroll,
and after reload. Lighthouse mobile, three runs (closing the automation tab first, per
steps 09/11/12's documented noise pattern): performance 80–99, accessibility 100,
best-practices 100, CLS 0–0.018 across all three (comfortably under the "good" 0.1
threshold; the 0/0.0003 baseline other pages hit is noise-sensitive the same way
performance/TBT are, per the standing lesson — CLS itself never suggested a real
regression). Total JS: ~68KB gzip (`motion.js` ~67.2KB + two near-empty page-script
shells), against the 90KB floor. `/` unchanged — the pin lives on the new route only.

---

## Stop and ask if

- The pin distance (`+=150%`) reads as too long or too short at real scroll speed on a
  real device — a feel judgement, Arthur's to make.
- `--color-measure` on the raised dots reads wrong against `--ground` at real size — its
  first use anywhere on the site.
- The archive title becoming a link changes the row's visual weight more than expected.
- The page reads as mostly drafting annotations — four `[FILL]` slots on the strongest
  page on the site is a lot of visible marker text, even under the agreed render policy.
