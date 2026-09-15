# Step 09 — Tier 1 drawing layer

> On approval, this document is written to `docs/plans/step-09.md` first (matching
> `docs/plans/step-01.md`…`step-08.md`), then implemented.

## Context

Step 08 is committed (`ed98e5e`) and `docs/progress.md:17` marks it `done`. **Step 09 is the
first step not done.**

Everything up to here has been either static or tier 2: content arriving once on scroll.
This is the step where the page's actual concept — *an annotated technical drawing that
draws itself as you descend* (`design-spec.md:117`) — becomes visible for the first time.
Objective from `implementation-plan.md:192`: *"The scrubbed rule descending the page. The
first piece of the actual concept."*

Almost all the groundwork exists:

- `src/components/Rule.astro` already ships `#rule path` fully drawn, built in step 04
  deliberately ahead of schedule so this step adds *only* a scrub (`progress.md:124-129`).
- `src/styles/type.css:143-172` already positions `.rule-svg` over the full height of
  `.page-main`, with a `left` that mirrors the rail's column formula at every width.
- `DrawSVGPlugin` is already imported and registered in `src/scripts/motion.ts:7,13`
  (step 07), so this step adds **no new bytes** to the bundle beyond its own ~40 lines.

What does not exist: the section ticks, and the scrub itself.

Scope: the scrubbed rule, four section ticks, nothing else. No leader-line animation
(step 10 — the five `.leader` SVGs stay statically drawn), no Flip (step 11), no hero
sequence (step 12), no pinning at all (`implementation-plan.md:199`).

---

## Three things verified before planning, not assumed

`CLAUDE.md` requires checking framework specifics against current sources rather than
memory. All three were checked against the installed `gsap@3.15.0` in `node_modules/`.

### 1. `vector-effect="non-scaling-stroke"` breaks DrawSVG on the rule — it must be removed

`Rule.astro:15` carries `vector-effect="non-scaling-stroke"`, and `.rule-svg` is a
`preserveAspectRatio="none"` box: `viewBox="0 0 1 100"`, `width: 1px`, `inset-block: 0`.
So the x scale is exactly **1** (1px ÷ 1 user unit) while the y scale is the page height
÷ 100 — roughly **60**. Wildly non-proportional, on purpose.

`DrawSVGPlugin.js:97-102,142-148` is explicit about this case:

```js
if (_hasNonScalingStroke(target)) {            // :97  — reads the attribute
  scaleY = target.getScreenCTM();              //        measures real screen scale
  scaleX = _sqrt(scaleY.a * scaleY.a + …);
}
…
length = target.getTotalLength() || 0;         // :145 — 100 user units
_round(scaleX) !== _round(scaleY) && _warn(    // :146 — fires: 1 !== 60
  "Warning: <path> length cannot be measured when vector-effect is non-scaling-stroke " +
  "and the element isn't proportionally scaled.");
length *= (scaleX + scaleY) / 2;               // :147 — 100 × ~30.5 = a meaningless number
```

Left as-is this ships a console warning (step 06's gate expects a clean console) and a
stroke-dasharray roughly 30× the path's real length, so the "draw" would be invisible or
nonsensical.

**Fix: delete the `vector-effect` attribute from `#rule path` only.** The rendered result
is pixel-identical, because for a *vertical* line the stroke's visible thickness is
governed by the **x** scale, which is 1 — `stroke-width="1"` renders 1px either way. With
the attribute gone, DrawSVG takes the `scaleX = scaleY = 1` path, measures 100 user units,
and the browser stretches the dash pattern with the path, which is exactly right. It also
makes resize free: the user-unit length is 100 at every window size, so there is nothing
for `invalidateOnRefresh` to get wrong (the re-measurement `DrawSVGPlugin.js:271` warns
about applies only to non-scaling-stroke).

This is a markup change to a step-04 component, so it gets logged as a divergence. It is
*not* a token change and not a visual change.

### 2. A numeric `start` is an absolute scroll position — tip-synced ticks are buildable

Confirmed in `ScrollTrigger.js:738-777`: `_parsePosition` calls a function-valued
`start`/`end` (`:739`), and when the result is a number it skips all element-bounds
parsing and uses the value directly as a scroll position (the `else` branch at `:775`).
Function-based values are re-evaluated on every refresh, which is what keeps them correct
across resize.

That is what makes **tick draw synced to the rule's drawn tip** (decided with Arthur this
session) implementable in about ten lines — see the geometry below.

### 3. Step 10's leader lines do *not* have problem 1

`.leader` is `width: var(--spacing-gutter)` (32px) with `aspect-ratio: 4 / 3`
(`type.css:128-134`) against `viewBox="0 0 32 24"` — a true 1:1 scale, so
`scaleX === scaleY` and DrawSVG measures it correctly with `vector-effect` kept. Checked
now so step 10 does not rediscover it. Section ticks are built to the same rule: a 1:1
viewBox.

---

## The geometry: where the rule's tip is

The rule spans `.page-main` exactly (`inset-block: 0`), and its scrub runs
`start: 'top top'` → `end: 'bottom bottom'` per `motion-spec.md:160-170`. So at progress
`p`:

```
scroll        = mainTop + p × (mainH − vh)     ← definition of the trigger's range
tip (doc y)   = mainTop + p × mainH            ← the rule is drawn p of its own length
⇒ tip − viewport top = p × vh
```

The drawn end therefore sits near the top of the screen early in the page and near the
bottom at the end — a real property of this mapping, not a bug. A tick triggered on its own
section's arrival (`top 90%`, near the bottom of the screen) would therefore draw itself
several hundred pixels *below* the line that is supposed to be drawing it, early in the
page. Hence tip-synced.

Inverting for a tick at document position `T`:

```
f            = (T − mainTop) / mainH           ← the tick's fraction along the rule
scrollAtTip  = mainTop + f × (mainH − vh)      ← scroll position when the tip reaches it
```

---

## Changes

### 1. `src/components/Rule.astro` — one attribute removed

```diff
   <path
     d="M0.5 0 V100"
     fill="none"
     stroke="var(--color-line)"
     stroke-width="1"
-    vector-effect="non-scaling-stroke"
   />
```

With a comment recording why: DrawSVG cannot measure a non-scaling-stroke path in a
non-proportionally scaled SVG (`DrawSVGPlugin.js:146`), and for a vertical line in a
1px-wide box the rendered 1px thickness is unchanged.

### 2. `src/components/Tick.astro` — new, ~10 lines

A section tick: hairline `--line`, 8px, extending from the rule **into the gutter**,
in its final drawn state per the initial-state pattern. No label, no number, no date beside
it — `CLAUDE.md`'s rejected-aesthetic list rules out numbered section markers on content
that isn't a sequence.

```astro
---
// One section tick on the page rule — the drawing's scale marks. Ships fully drawn
// (motion-spec.md's initial-state pattern); motion.ts draws it scrubbed, synced to the
// moment the rule's own drawn tip passes it. 1:1 viewBox on purpose: DrawSVG cannot
// measure a non-scaling-stroke path in a non-proportionally scaled SVG (see Rule.astro).
// Decorative — the section already has a real heading and aria-label.
---

<svg class="tick" viewBox="0 0 8 8" aria-hidden="true">
  <path d="M0 4 H8" fill="none" stroke="var(--color-line)" stroke-width="1"
        vector-effect="non-scaling-stroke" />
</svg>
```

### 3. Four components — one `<Tick />` each, as the section's first child

`Spine.astro`, `Archive.astro`, `Changelog.astro`, `Contact.astro`. Absolutely positioned,
so it takes no layout space and does not participate in the sections' `flex` gaps.

**The hero gets no tick:** `main`'s top edge is where the rule itself begins — the drawing's
origin, not a division in it.

No `data-anim` on a tick, ever. Tier 1 and tier 2 never touch the same element.

### 4. `src/styles/type.css` — the tick's positioning

```css
/* Section ticks on the page rule. `left` is .rule-svg's formula unchanged, so the tick
 * starts exactly where the rule stands at every width; `top: -4px` centres the 8×8 box's
 * mid-line on the section's top edge. Absolute, so it costs no layout space — design-spec
 * §10's no-layout-shift rule. Scoped to .page-main's own sections, never a bare `section`
 * selector: /type-test has its own unrelated markup (progress.md:~316). */
.page-main > section {
  position: relative;
}
.tick {
  position: absolute;
  top: -4px;
  left: min(var(--container-measure), calc(100% - var(--spacing-gutter) - var(--container-margin)));
  width: 8px;
  aspect-ratio: 1;
  overflow: visible;
  pointer-events: none;
}
/* Below 768px the rule sits at the screen edge and the margin column is gone; design-spec
 * §8's degradation contract keeps "the scrubbed rule only" there. Ticks join the leader
 * lines in being absent rather than drawing into the reading column. */
@media (max-width: 767px) {
  .tick {
    display: none;
  }
}
```

`display: none` also keeps the `<768px` branch from ever creating a tick tween — DrawSVG
warns on an unmeasurable hidden element (`DrawSVGPlugin.js:109`), and the branch does not
create them anyway.

### 5. `src/scripts/motion.ts` — the tier 1 functions and the three branches

```ts
const SCRUB = 0.8       // motion-spec.md's value. Never `true`.
const TICK_DRAW_PX = 80 // scroll distance over which one tick draws

/** Tier 1: the page rule, scrubbed to scroll position (docs/motion-spec.md:157-177).
 *  Reversible by design — scrolling up runs the drawing backwards — so it needs no
 *  data-anim-played guard; a matchMedia rebuild re-derives the correct state from the
 *  current scroll position. `ease: 'none'`: an eased scrub feels broken (design-spec §8).
 *  gsap.from() carries the initial-state pattern: the hidden state is created in the same
 *  call as the tween that undoes it, so a failed GSAP load leaves the markup's drawn rule. */
function tier1Rule(rule: SVGPathElement, main: HTMLElement) {
  gsap.from(rule, {
    drawSVG: '0%',
    ease: 'none',
    scrollTrigger: {
      trigger: main,
      start: 'top top',
      end: 'bottom bottom',
      scrub: SCRUB,
      invalidateOnRefresh: true, // required, or resizing breaks the mapping
    },
  })
}

/** Tier 1: the section ticks, each drawn at the scroll position where the rule's own drawn
 *  tip passes it, not on its section's arrival. The tip sits p × viewport-height below the
 *  viewport top (see docs/plans/step-09.md), so a section-arrival trigger would draw a tick
 *  several hundred px below the line meant to be drawing it. Numeric start/end are absolute
 *  scroll positions (ScrollTrigger.js:775) and, being functions, are re-evaluated on every
 *  refresh — which is what keeps them right across resize and archive-filter height changes. */
function tier1Ticks(main: HTMLElement) {
  gsap.utils.toArray<SVGSVGElement>('.tick').forEach((tick) => {
    const path = tick.querySelector('path')
    if (!path) return
    const tipScroll = () => {
      const mainBox = main.getBoundingClientRect()
      const tickBox = tick.getBoundingClientRect()
      // Lenis drives real window scroll, so window.scrollY is the true position here.
      const mainTop = mainBox.top + window.scrollY
      const centre = tickBox.top + tickBox.height / 2 + window.scrollY
      const f = gsap.utils.clamp(0, 1, (centre - mainTop) / main.offsetHeight)
      const at = mainTop + f * (main.offsetHeight - window.innerHeight)
      // Same lesson as step 08's clamp(): a start position past the scroller's real max is
      // simply never reached, and the tick would sit undrawn forever.
      return Math.min(at, ScrollTrigger.maxScroll(window) - TICK_DRAW_PX)
    }
    gsap.from(path, {
      drawSVG: '0%',
      ease: 'none',
      scrollTrigger: {
        trigger: tick,
        start: tipScroll,
        end: () => tipScroll() + TICK_DRAW_PX,
        scrub: SCRUB,
        invalidateOnRefresh: true,
      },
    })
  })
}
```

Branch wiring, replacing the two `// steps 09-13:` placeholder comments:

| Branch | Tier 1 |
|---|---|
| `(min-width: 768px) and (…no-preference)` | `tier1Rule(...)` + `tier1Ticks(main)` |
| `(max-width: 767px) and (…no-preference)` | `tier1Rule(...)` only — design-spec §8: *"the drawing layer keeps the scrubbed rule only"* |
| `(prefers-reduced-motion: reduce)` | clear any DrawSVG residue, below |

Both no-preference branches resolve their targets once, guarded — `motion.ts` is loaded on
every page via `Base.astro`, and `/type-test` has no rule:

```ts
const rulePath = document.querySelector<SVGPathElement>('#rule path')
const pageMain = rulePath?.closest<HTMLElement>('.page-main') ?? null
```

`.page-main`, not a bare `main`: `progress.md` already logged that a bare element selector
reaches `/type-test`'s unrelated `<main>`.

The reduce branch gains one line beside its existing `[data-anim]` `clearProps`, for the
reader who turns reduced motion on mid-session after the scrub branch has written inline
dash styles. `strokeDasharray,strokeDashoffset,strokeMiterlimit` are exactly the three
properties DrawSVG's own style-saver tracks (`DrawSVGPlugin.js:222`):

```ts
const drawn = gsap.utils.toArray<SVGPathElement>('#rule path, .tick path')
if (drawn.length) gsap.set(drawn, { clearProps: 'strokeDasharray,strokeDashoffset,strokeMiterlimit' })
```

### 6. Untouched

No token change. No content change. No new dependency — `DrawSVGPlugin` has been imported
and registered since step 07, so the bundle grows only by this file's own lines.
`Archive.astro`'s existing `refreshTriggers()` call already re-maps every trigger when the
filter changes document height, which now includes the rule and the ticks; nothing there
needs editing.

---

## Verification

```bash
pnpm build && pnpm check
```

**Greppable acceptance:**

```bash
grep -rn "vector-effect" src/components/Rule.astro   # 0 — removed
grep -o 'class="tick"' dist/index.html | wc -l       # 4 — Spine, Archive, Changelog, Contact
grep -rn "data-anim" src/components/Tick.astro       # 0 — tier 1 never carries tier 2
grep -rn "scrub: true" src/                          # 0
grep -n "ease: 'none'" src/scripts/motion.ts         # 2 — rule and ticks; never eased
grep -rn "new Lenis\|gsap.ticker.add" src/           # still exactly 1 each
grep -rn "requestAnimationFrame\|gsap-trial" src/    # 0
for f in dist/_astro/*.js; do printf "%s " "$f"; gzip -c "$f" | wc -c; done   # expect ~65KB
```

**In-browser, against `pnpm preview`** (`astro preview` daemonizes — confirm with
`curl -sI http://localhost:4321/`, stop with `pnpm exec astro preview stop`). The
`claude-in-chrome` MCP drives page content; `resize_window` does not work in this sandbox,
so use the `<iframe>` technique from `progress.md:297-312` for widths, served over http
(the extension refuses `file://`).

1. **Console is clean.** No `"<path> length cannot be measured…"`, no `"Some browsers won't
   measure invisible elements"`. This is the direct check on finding 1.
2. **The dash math is real, not apparent.** At scroll top, read
   `getComputedStyle(document.querySelector('#rule path')).strokeDasharray` — it should be
   in the region of `100 100` (user units), *not* ~3000, and `strokeDashoffset` should hide
   the whole line. Scroll halfway, read again: roughly half drawn.
3. **Scrolling up runs the drawing backwards** — acceptance box 1. Down, up, down.
4. **Stopping mid-section leaves the rule mid-draw** — box 2. Stop anywhere; the line ends
   where you stopped, with `scrub: 0.8`'s catch-up settling into place rather than snapping.
5. **Ticks draw as the line reaches them,** not before. Watch the Archive tick specifically:
   the tip should arrive at it, then the 8px mark grows into the gutter. A tick drawn while
   the line is still well above it means the geometry is wrong.
6. **Resize recalculates** — box 3. Drag the window wide→narrow→wide mid-page: the rule's
   drawn fraction stays consistent with scroll position and the ticks stay on the line.
   Then cross 768px and confirm the ticks disappear and reappear cleanly.
7. **Reduced motion** — box 4. Emulate `prefers-reduced-motion: reduce` in DevTools'
   Rendering panel and reload: rule and all four ticks fully drawn, no scrub. Then toggle
   it on *mid-scroll* without reloading and confirm the rule snaps to fully drawn rather
   than being stranded half-drawn — what the `clearProps` line is for. **This is the check
   `progress.md:241-253` flags as impossible from this sandbox** (the extension cannot open
   DevTools); if it still is, ask Arthur to run it by hand rather than reporting it passed.
8. **JS disabled** — box 4's other half. Rule and ticks fully drawn, identical to step 08.
9. **No text element is affected by scroll position** — box 5. Confirm no tween in
   `motion.ts` targets anything but `#rule path` and `.tick path` in tier 1, and that
   nothing but `drawSVG` appears in a scrubbed tween's properties.
10. **Trackpad scroll: no jitter** in the rule (`motion-spec.md:222`'s checklist). This is
    the first scrubbed element on the site, so it is the first time this check has teeth.
11. **Archive filter still behaves.** Click a tag: rows change, document height changes, and
    the rule's end point re-maps — the existing `refreshTriggers()` call. The rule must not
    jump to a visibly wrong drawn length.
12. **375 / 768 / 1280px.** At 375px: rule present and scrubbing, no ticks anywhere.
13. **Lighthouse mobile on `/`**, same invocation as steps 06-08. Expect no regression from
    perf 99 / a11y 100 / best-practices 100 / **CLS 0** — the ticks are absolutely
    positioned precisely so this stays 0.

### Step 09 acceptance checklist (`implementation-plan.md:202-207`)

- [ ] scrolling up runs the drawing backwards
- [ ] stopping mid-section leaves the rule mid-draw
- [ ] resizing the window recalculates correctly
- [ ] rule renders fully drawn under reduced motion and with JS disabled
- [ ] no text element is affected by scroll position
- [ ] `pnpm build` succeeds

**Stop and ask if:** removing `vector-effect` changes the rule's rendered thickness at any
width or zoom level (it should not — but if it does, the fix touches how the drawing looks,
which is Arthur's call); the tip-sync geometry reads as wrong on the page despite being
arithmetically right; total JS exceeds 90KB gzip; or Lighthouse drops below 95 anywhere.

---

## Files

| File | Action |
|---|---|
| `docs/plans/step-09.md` | new — this document, written first |
| `src/components/Rule.astro` | edit — remove `vector-effect`, comment why |
| `src/components/Tick.astro` | **new** — the section tick, ~10 lines |
| `src/components/Spine.astro`, `Archive.astro`, `Changelog.astro`, `Contact.astro` | edit — one `<Tick />` as the section's first child |
| `src/styles/type.css` | edit — `.page-main > section` relative, `.tick` positioning, `<768px` rule |
| `src/scripts/motion.ts` | edit — `tier1Rule()`, `tier1Ticks()`, three branches filled |
| `src/components/Hero.astro`, `MarginNote.astro`, `ArchiveRow.astro`, `Fill.astro` | **untouched** |
| `src/styles/tokens.css` | **untouched** — no token change |
| `src/content/**` | **untouched** — no `[FILL]` resolved |

---

## Close-out

Per `CLAUDE.md`: run the checklist, `pnpm build`, mark 09 `done` in `docs/progress.md`,
commit `step 09: tier 1 drawing layer`, push, stop.

**Divergences to log:**
- `vector-effect="non-scaling-stroke"` removed from `#rule path` (a step-04 markup
  decision). Verified against `DrawSVGPlugin.js:97-147`, not assumed: DrawSVG measures a
  non-scaling-stroke path via `getScreenCTM()` and warns, then mis-scales the length, when
  the SVG is not proportionally scaled — which `.rule-svg` deliberately is not. Rendering is
  unchanged because the x scale is exactly 1.
- Section ticks synced to the rule's drawn tip via function-based numeric ScrollTrigger
  start/end, rather than triggered on their own section's arrival. Decided with Arthur;
  reason is the `tip − viewport top = p × vh` relationship above.
- Tick geometry and placement chosen this session (8px into the gutter, hairline `--line`,
  no label, four of them, hidden below 768px) — `implementation-plan.md:196` names section
  ticks but specifies no shape. Hiding them below 768px follows `design-spec.md` §8's
  *"the drawing layer keeps the scrubbed rule only"*.
- `.page-main > section { position: relative }` — a containing block for the ticks; the
  first structural CSS on `section` in the project.

**Notes for future sessions:**
- DrawSVG + `vector-effect="non-scaling-stroke"` only works when the SVG is *proportionally*
  scaled. Any new drawing SVG either keeps a 1:1 viewBox (like `.tick` and `.leader`) or
  drops the attribute. Step 10's leader lines are already 1:1 — checked.
- A numeric or function-returning-number `start`/`end` on a ScrollTrigger is an absolute
  scroll position (`ScrollTrigger.js:775`), and function values are re-evaluated on refresh.
  That is the tool for anything that must sync to a computed document position.
- Tier 1 needs no `data-anim-played` guard: scrubbed tweens are reversible and a matchMedia
  rebuild re-derives the right state from the current scroll position.

---

## Implementation order

1. Write `docs/plans/step-09.md` (this document).
2. `src/components/Rule.astro`: remove the attribute. Verify in-browser that the line still
   renders at 1px before building anything on top of it.
3. `src/components/Tick.astro` + the four `<Tick />` placements + the `type.css` block.
   Confirm statically: four ticks sitting on the rule at 1280px, none at 375px, CLS still 0.
4. `src/scripts/motion.ts`: `tier1Rule()`, then the three branches. Verify the rule scrub
   alone (checks 1-4) before adding ticks.
5. `tier1Ticks()`. Verify check 5.
6. `pnpm build && pnpm check`; the grep block and the gzip measurement.
7. The full in-browser walk, including JS-off, reduced-motion, resize and 375px.
8. Lighthouse mobile on `/`.
9. Update `docs/progress.md` (status, divergences, future-session notes), commit, push, stop.
