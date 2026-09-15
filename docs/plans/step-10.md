# Step 10 — Leader lines to margin notes

> On approval this document is written to `docs/plans/step-10.md` first (matching
> `docs/plans/step-01.md`…`step-09.md`), then implemented.

## Context

Step 09 is committed (`ab6786c`) and `docs/progress.md:18` marks it `done`. **Step 10 is
the first step not done.** Its prompt named step 09 and `docs/plans/step-09.md`; confirmed
with Arthur this session that step 10 was meant.

Objective, `implementation-plan.md:211-213`: *"The annotation apparatus, which is the
site's one structurally unusual device."* Step 09 made the rule draw itself down the page.
This step makes the rule **branch**: each of the five spine markers gets a line that
reaches out of the rule, across the gutter, and terminates at its margin note — and
touching a marker lights up the pair.

Most of the groundwork already exists:

- `src/components/MarginNote.astro:24-32` already ships each `.leader` SVG fully drawn,
  built in step 04 ahead of schedule (`progress.md:124-129`) so this step adds only motion.
- `src/styles/type.css:129-141` already positions `.leader` absolutely into the rail's
  gutter column (`right: 100%`, `width: var(--spacing-gutter)`) and already hides it below
  768px. Its path starts at `x=0` — exactly where the rule stands — and ends at `x=32`, at
  the note. The geometry the step needs is already correct.
- `DrawSVGPlugin` is registered (`motion.ts:7,13`) and `tier1Ticks()` (`motion.ts:152-180`)
  already solved the tip-sync scroll math this step reuses. **No new dependency, no new
  bundle weight beyond this step's own ~50 lines.**

What does not exist: the scrub, and the marker↔note highlight.

Scope: the five margin-note leaders and their highlight. **Not** the Contact leader line
(`design-spec.md:380-386` — the drawing's final termination at the email; a separate
device, and `implementation-plan.md:222-226`'s acceptance counts exactly five). No Flip
(step 11), no hero sequence (step 12), no pinning.

---

## Two things verified before planning, not assumed

### 1. `.leader` is safe for DrawSVGPlugin, `vector-effect` and all

Step 09's hard-won lesson (`progress.md:499-511`) is that
`vector-effect="non-scaling-stroke"` breaks *both* DrawSVG's measurement and the browser's
own Layout Instability accounting — but **only inside a non-proportionally scaled SVG**.

`.leader` is not that case. `viewBox="0 0 32 24"` against `width: var(--spacing-gutter)`
(2rem) with `aspect-ratio: 4 / 3` gives `scaleX === scaleY` at every root font size and
every zoom level, because the CSS box's aspect ratio equals the viewBox's. That is the
proportional case `DrawSVGPlugin.js:146` measures correctly, and the same case `.tick`
already occupies without incident. `docs/plans/step-09.md:88-94` checked this in advance
precisely so this step would not rediscover it.

So: keep `vector-effect`, keep DrawSVGPlugin. No `strokeDasharray`-by-hand workaround like
the rule needed.

### 2. The leader's path already points the right way

`d="M0 4 H18 L32 12"` starts at the rule (`x=0`) and ends at the note (`x=32`). DrawSVG's
default `0% → 100%` draws from path start, so the line grows **out of the rule toward the
note** with no `drawSVG` direction argument. Nothing to reverse.

---

## The geometry: reuse, don't reinvent

`tier1Ticks()` already computes *the scroll position at which the rule's own drawn tip
reaches a given element*, and the comment at `motion.ts:139-151` derives it. A leader wants
exactly the same number, which is the whole point: the line branches off the rule at the
moment the rule arrives, rather than when its note happens to scroll into view. A leader
triggered on the note's own arrival would draw itself several hundred pixels below the line
supposedly drawing it, early in the page — the same failure step 09 found for ticks.

**Change:** lift `tipScroll` out of `tier1Ticks()` into a module-level helper both callers
use. This is a refactor of existing working code, not new math:

```ts
/** Scroll position at which the rule's drawn tip reaches `el`'s vertical centre. Derived in
 *  docs/plans/step-09.md: the rule is drawn `p` of its length at scroll progress `p`, and
 *  the trigger's range is mainTop -> mainTop + (mainH - vh), so the tip sits `p * vh` below
 *  the viewport top. Inverting for an element at document position T gives the two lines
 *  below. Returned as a closure so ScrollTrigger re-evaluates it on every refresh, which is
 *  what keeps it right across resize and the archive filter's height changes. */
function tipScrollFor(el: Element, main: HTMLElement, drawPx: number) {
  return () => {
    const mainTop = main.getBoundingClientRect().top + window.scrollY
    const box = el.getBoundingClientRect()
    const centre = box.top + box.height / 2 + window.scrollY
    const f = gsap.utils.clamp(0, 1, (centre - mainTop) / main.offsetHeight)
    const at = mainTop + f * (main.offsetHeight - window.innerHeight)
    return Math.min(at, ScrollTrigger.maxScroll(window) - drawPx)
  }
}
```

`tier1Ticks()` then reads `const at = tipScrollFor(tick, main, TICK_DRAW_PX)` and its
`start: at, end: () => at() + TICK_DRAW_PX` — behaviourally identical to today, verified by
the same in-browser check step 09 used.

**One accepted imprecision, measured rather than ignored.** `.leader` sits inside `.note`,
which tier 2 reveals with `y: 16` (`motion.ts:68`). A `ScrollTrigger.refresh()` firing while
a note is still pre-reveal measures its rect 16px low, which maps to roughly 12px of scroll
error against a 120px draw window (`16 × (mainH − vh) / mainH`). That is under 10% of the
window and self-corrects on the next refresh. Not worth a second measurement path; recorded
here so it isn't mistaken for a bug later.

---

## Changes

### 1. `src/components/MarginNote.astro` — a second, highlight path

The highlight is a 120ms opacity crossfade (decided with Arthur this session): a
`--signal`-coloured duplicate of the leader stacked on the base line at `opacity: 0`. Only
`opacity` transitions, so `CLAUDE.md`'s animate-only rule holds with no exception, and
`--signal` on a leader termination is exactly the use `type.css:78-80` already licenses.

```astro
<svg class="leader" viewBox="0 0 32 24" preserveAspectRatio="none" aria-hidden="true">
  <!-- Two identical paths: the construction line, and the highlight that crossfades over
       it when this note's marker is hovered or focused. A duplicate rather than a stroke
       swap because motion-spec.md forbids transitioning `color`/`stroke`; opacity is
       legal and gives the 120ms feedback value. Both are drawn by the same tier 1 tween
       (motion.ts's tier1Leaders), so the highlight can never be drawn ahead of the line
       underneath it. -->
  <path class="leader-base" d="M0 4 H18 L32 12" fill="none" stroke="var(--color-line)"
        stroke-width="1" vector-effect="non-scaling-stroke" />
  <path class="leader-hi" d="M0 4 H18 L32 12" fill="none" stroke="var(--color-signal)"
        stroke-width="1" vector-effect="non-scaling-stroke" />
</svg>
```

The component's step-04 header comment (`"step 10 animates it later; the markup doesn't
change"`) is updated to say what actually changed and why.

### 2. `src/styles/type.css` — the highlight state

```css
/* Leader highlight. Additive only: the note's content is never hover-dependent
 * (design-spec.md §10), this just links the pair. opacity, not a stroke swap —
 * motion-spec.md's property rule — at the one feedback duration and curve. The note's own
 * text lifts --graphite-2 -> --graphite instantly, with no transition, for the same reason
 * `color` can't be animated; the precedent is .control[aria-pressed='true'] below. */
.leader-hi {
  opacity: 0;
  transition: opacity var(--dur-feedback) var(--ease-out);
}
.note[data-linked] .leader-hi {
  opacity: 1;
}
.note[data-linked] .note-text {
  color: var(--color-graphite);
}
```

Specificity is deliberate: `.note[data-linked] .note-text` (0,2,1) beats the Tailwind
`text-graphite-2` utility (0,1,0) on the same element, and reaches neither the nested
`<strong class="text-graphite">` nor the back-link `.marker`, both of which keep their own
colours. No `@media (max-width: 767px)` rule needed — `.leader` is already `display: none`
there, so only the text lift survives, which is correct and harmless.

### 3. `src/components/Spine.astro` — a small interaction script

Interaction, not animation, so it lives with its component (the precedent is
`Archive.astro`'s filter script) rather than in `motion.ts`, and outside `matchMedia`.
Generic over the markup rather than five hard-coded pairs, so a sixth note needs no edit:

```astro
<script>
  // Marker -> note linking (implementation-plan.md step 10: "hovering a marker highlights
  // its note and its line"). Purely additive: with JS off, or if this never runs, both the
  // note and its leader are already fully visible and the marker is still a real anchor
  // link to it. Keyboard focus produces the identical state, gated on :focus-visible so a
  // mouse click doesn't leave a note lit after the pointer has moved away.
  document.querySelectorAll<HTMLAnchorElement>('.rail-prose .marker[href^="#note-"]')
    .forEach((marker) => {
      const note = document.querySelector<HTMLElement>(marker.getAttribute('href')!)
      if (!note) return
      const on = () => { note.dataset.linked = '' }
      const off = () => { delete note.dataset.linked }
      marker.addEventListener('mouseenter', on)
      marker.addEventListener('mouseleave', off)
      marker.addEventListener('focus', () => { if (marker.matches(':focus-visible')) on() })
      marker.addEventListener('blur', off)
    })
</script>
```

Scoped to `.rail-prose` so the note's own back-link `.marker` (which points at
`#marker-*`, not `#note-*`, and is excluded by the attribute selector anyway) is never
picked up twice.

### 4. `src/scripts/motion.ts` — `tier1Leaders()`, plus the `tipScrollFor` refactor

```ts
const LEADER_DRAW_PX = 120 // a leader is 4x a tick's length; it earns a longer draw window

/** Tier 1: the five leader lines, each drawn as the rule's own drawn tip passes it — the
 *  line branches out of the rule rather than arriving with its note. Same tip-sync
 *  geometry as tier1Ticks(), same reason (see tipScrollFor). Both paths of a leader are
 *  driven by one tween so the --signal highlight can never be drawn ahead of the
 *  construction line beneath it. DrawSVGPlugin is correct here where it was wrong for the
 *  rule: .leader's 4/3 CSS box matches its 32x24 viewBox, so scaleX === scaleY and the
 *  non-scaling-stroke measurement path DrawSVGPlugin.js:146 warns about never fires. */
function tier1Leaders(main: HTMLElement) {
  gsap.utils.toArray<SVGSVGElement>('.leader').forEach((leader) => {
    const paths = leader.querySelectorAll('path')
    if (!paths.length) return
    const at = tipScrollFor(leader, main, LEADER_DRAW_PX)
    gsap.from(paths, {
      drawSVG: '0%',
      ease: 'none',
      scrollTrigger: {
        trigger: leader,
        start: at,
        end: () => at() + LEADER_DRAW_PX,
        scrub: SCRUB,
        invalidateOnRefresh: true,
      },
    })
  })
}
```

Branch wiring:

| Branch | Change |
|---|---|
| `(min-width: 768px) and (…no-preference)` | `tier1Leaders(pageMain)` added beside `tier1Ticks` |
| `(max-width: 767px) and (…no-preference)` | **nothing** — `motion-spec.md:130`'s contract: *"below 768px: no leader lines"*, and `.leader` is `display: none` there, which DrawSVG warns on if measured |
| `(prefers-reduced-motion: reduce)` | `.leader path` added to the existing `drawn` `clearProps` selector, for the reader who enables reduced motion mid-scroll |

The `// steps 10-13:` placeholder comments at `motion.ts:190,199` become `// steps 11-13:`.

### 5. Untouched

`src/styles/tokens.css` (no token change), `src/content/**` (no `[FILL]` resolved),
`Rule.astro`, `Tick.astro`, `Archive.astro`, `Hero.astro`, `Contact.astro`, `Base.astro`.
No new dependency.

---

## Verification

```bash
pnpm build && pnpm check
```

**Greppable acceptance:**

```bash
grep -o 'class="leader"' dist/index.html | wc -l        # 5 — one per note
grep -o 'class="leader-hi"' dist/index.html | wc -l     # 5
grep -rn "data-anim" src/components/MarginNote.astro    # 1 — on .note, tier 2; never on a path
grep -rn "scrub: true" src/                             # 0
grep -c "ease: 'none'" src/scripts/motion.ts            # 3 — rule, ticks, leaders
grep -rn "new Lenis\|gsap.ticker.add" src/              # still exactly 1 each
grep -rn "requestAnimationFrame\|gsap-trial" src/       # 0
grep -n "transition" src/styles/type.css                # only opacity transitions
for f in dist/_astro/*.js; do printf "%s " "$f"; gzip -c "$f" | wc -c; done   # expect ~66KB
```

**In-browser, against `pnpm preview`.** `astro preview` daemonizes — confirm with
`curl -sI http://localhost:4321/`, stop with `pnpm exec astro preview stop`. Widths via the
`<iframe>` technique (`progress.md:389-404`), served over http; `resize_window` does not
work in this sandbox and the extension refuses `file://`. **Kill any stray `serve` /
chrome-launcher processes before profiling** — `progress.md:487-498`.

1. **Console clean.** No `"<path> length cannot be measured…"` — the direct check on
   verified-fact 1. No `"Some browsers won't measure invisible elements"` either, which
   would mean a leader tween was created below 768px.
2. **The dash math is real.** Read
   `getComputedStyle(document.querySelector('.leader path')).strokeDasharray` before the
   tip arrives — should be near the path's true length (~44 user units, `18 + √(14²+8²)`),
   **not** ~1300, and `strokeDashoffset` should hide it. Halfway through the draw window,
   roughly half.
3. **Each line branches out of the rule, toward its note.** Watch note 1: the rule's tip
   reaches it, then the line grows rightward across the gutter and stops at the note. A
   line drawn while the tip is still well above it means the geometry is wrong.
4. **Scrolling up runs it backwards**, and stopping mid-draw leaves it mid-draw.
5. **Hover a marker** (`acceptance: hover is additive only`). Its note's line goes
   `--signal` over 120ms and its text lifts to `--graphite`. Nothing appears that wasn't
   already there; leaving restores both. Hover a *different* marker: only that pair lights.
6. **Keyboard focus produces the identical state.** Tab to marker 1 — same highlight. Tab
   away — cleared. Then *click* a marker with the mouse and move the pointer off: no note
   left lit (the `:focus-visible` gate).
7. **Below 768px** (375px iframe): no leader lines anywhere, notes inline directly after
   their paragraph, and no leader tween created — check the console and confirm
   `document.querySelectorAll('.leader')[0].getBoundingClientRect().width === 0`.
8. **Resize recalculates.** Wide → narrow → wide mid-page; cross 768px both ways and
   confirm leaders disappear and reappear correctly drawn for the current scroll position.
9. **Archive filter still behaves** — its `refreshTriggers()` now re-maps five more
   triggers. Click a tag mid-page: no leader jumps to a visibly wrong drawn length.
10. **Reduced motion**: all five leaders fully drawn, no scrub. Then toggle it on
    *mid-scroll* and confirm a half-drawn leader snaps to complete. **`progress.md:470-475`
    flags this as impossible from this sandbox** (the extension cannot open DevTools' Rendering
    panel); if it still is, ask Arthur to run it by hand rather than reporting it passed.
11. **JS disabled**: identical to step 09 — five leaders fully drawn, notes readable, and
    every marker still a working anchor link to its note.
12. **No text element is affected by scroll position.** Tier 1 targets only `#rule path`,
    `.tick path` and `.leader path`.
13. **Trackpad scroll: no jitter** in the leaders.
14. **Lighthouse mobile on `/`.** Expect no regression from perf 99 / a11y 100 /
    best-practices 100 / **CLS ≈ 0**. CLS is the signal that matters here — step 09 proved a
    proportionally-scaled SVG is the safe case, and this is the check that proves it stayed
    safe with a second path added. Treat a single low *performance* score as environment
    noise and rerun (`progress.md:487-498`); do not treat a CLS change that way.

### Step 10 acceptance checklist (`implementation-plan.md:222-226`)

- [ ] each of the 5 notes has a line terminating at it
- [ ] hover state is additive only, no content revealed by hover
- [ ] below 768px lines are absent and notes are inline
- [ ] keyboard focus on a marker produces the same highlight as hover
- [ ] `pnpm build` succeeds

**Stop and ask if:** Lighthouse CLS moves off zero (the step-09 failure mode, in a case
verified not to apply — if it happens anyway, the attribute/measurement story is wrong and
that's Arthur's call); total JS exceeds 90KB gzip; the tip-sync reads as wrong on the page
despite being arithmetically right; or `--signal` on five leaders reads as too loud against
`design-spec.md:24-26`'s roughly-eight-appearances budget, since that's a palette judgement.

---

## Files

| File | Action |
|---|---|
| `docs/plans/step-10.md` | new — this document, written first |
| `src/components/MarginNote.astro` | edit — second `.leader-hi` path, class on the base path, comment |
| `src/styles/type.css` | edit — `.leader-hi` opacity transition, `.note[data-linked]` states |
| `src/components/Spine.astro` | edit — the marker↔note `<script>` |
| `src/scripts/motion.ts` | edit — `tipScrollFor()` extracted, `tier1Leaders()`, three branches |
| `src/styles/tokens.css` | **untouched** — no token change |
| `src/content/**` | **untouched** — no `[FILL]` resolved |
| `Rule.astro`, `Tick.astro`, `Archive.astro`, `Hero.astro`, `Contact.astro`, `Base.astro` | **untouched** |

---

## Close-out

Per `CLAUDE.md`: run the checklist, `pnpm build`, mark 10 `done` in `docs/progress.md`,
commit `step 10: leader lines to margin notes`, push, stop.

**Divergences to log:**
- The leader highlight is built as a stacked duplicate `--signal` path crossfaded on
  `opacity` over 120ms, rather than a stroke-colour swap.
  `implementation-plan.md:219` specifies the behaviour (*"hovering a marker highlights its
  note and its line"*) but not its form; `motion-spec.md:44-47` forbids transitioning
  `color`, so a swap would have to be instant. Put to Arthur this session and chosen over
  both the instant swap and a leader-only highlight. The note's own text still changes
  instantly, for the same property rule — an intentional asymmetry, not an oversight.
- `tipScroll` extracted from `tier1Ticks()` into a shared `tipScrollFor(el, main, drawPx)`.
  Behaviour identical; done so leaders and ticks cannot drift apart.
- `LEADER_DRAW_PX = 120` vs `TICK_DRAW_PX = 80`. Neither spec gives a scrub *distance* (only
  `scrub: 0.8`, which is catch-up, not range); a leader is roughly four times a tick's
  drawn length and a shared constant would make it draw four times as fast.
- Marker↔note linking lives in `Spine.astro`'s own `<script>`, outside `gsap.matchMedia()`.
  `motion-spec.md:100` requires *animations* to live inside it; this is an interaction state
  that must work at every width including below 768px, where leaders don't exist.

**Notes for future sessions:**
- The proportional-viewBox rule now has a worked example on both sides: `#rule path`
  (non-proportional → hand-rolled dashoffset) and `.tick`/`.leader` (1:1 → DrawSVGPlugin).
  Any new drawing SVG picks its side by whether its CSS box's aspect ratio equals its
  viewBox's.
- `tipScrollFor()` is the one place the "when does the rule's tip reach this element"
  question is answered. Anything else that must branch off the rule (the Contact leader
  line, `design-spec.md:380`) calls it rather than re-deriving the geometry.
- A highlight that must transition and can't use `color` is a stacked duplicate element
  crossfaded on `opacity`. `.leader-hi` is the pattern.

---

## Implementation order

1. Write `docs/plans/step-10.md` (this document).
2. `MarginNote.astro` + the `type.css` highlight block. Confirm statically at 1280px: five
   leaders unchanged in appearance (the highlight path is invisible), CLS still 0.
3. `Spine.astro`'s script. Verify checks 5 and 6 with no motion work done yet — the
   highlight must stand on its own.
4. `motion.ts`: extract `tipScrollFor()`, confirm ticks still behave exactly as step 09.
5. `tier1Leaders()` + the three branches. Verify checks 1-4, 7-9.
6. `pnpm build && pnpm check`; the grep block and the gzip measurement.
7. The full in-browser walk, including JS-off, reduced-motion, resize and 375px.
8. Lighthouse mobile on `/`.
9. Update `docs/progress.md` (status, divergences, future-session notes), commit, push, stop.
