# Step 08 — Tier 2 triggered reveals

> On approval, this document is written to `docs/plans/step-08.md` first (matching
> `docs/plans/step-01.md`…`step-07.md`), then implemented.

## Context

Step 07 is committed (`68f850d`) and `docs/progress.md:16` marks it `done`. **Step 08 is the
first step not done.**

Step 07 deliberately shipped zero visible change: it created `src/scripts/motion.ts` — the
one Lenis instance, the one `gsap.ticker` hook, the registered plugins and three empty
`matchMedia` branches — and explicitly deferred the `gsap.set` initial states to this step.
`progress.md:185-194` logs that interpretation: *"the actual `gsap.set(...)` calls land in
step 08, paired with the reveals that undo them."* `motion.ts:44` still carries the comment
*"No `[data-anim]` exists until step 08; this is a no-op today."*

So this is the step where the site first moves. Objective from
`docs/implementation-plan.md:171`: *"Content arrival, once, cheap."*

Scope: the `[data-anim]` reveal system, the 13 elements that carry it, and nothing else.
No drawing layer (step 09), no leader-line animation (step 10), no Flip (step 11), no hero
sequence (step 12).

---

## Two things verified before planning, not assumed

`CLAUDE.md` requires checking framework specifics against current docs rather than memory.

### 1. `motion-spec.md`'s ease string does not work — confirmed empirically

`docs/motion-spec.md:142` passes `ease: 'cubic-bezier(0.22, 1, 0.36, 1)'` to GSAP. Tested
against the installed `gsap@3.15.0`:

```
gsap.parseEase('cubic-bezier(0.22, 1, 0.36, 1)')            -> undefined
CustomEase.create('x', 'cubic-bezier(0.22, 1, 0.36, 1)')    -> "ERROR: malformed path"
CustomEase.create('x', 'M0,0 C0.22,1 0.36,1 1,1')           -> works
```

GSAP has no parser for the CSS `cubic-bezier()` string form, with or without CustomEase
registered. A tween using it **silently falls back to GSAP's default `power1.out`** — the
wrong curve, with no warning. Used verbatim, the spec's own snippet would ship a curve the
spec forbids.

**Decided with Arthur this session:** register `CustomEase` as a fifth GSAP plugin (a GSAP
plugin, free since 3.13 — not a new library, so `CLAUDE.md`'s library rule is untouched) and
define the curve once from the identical control points in CustomEase's SVG-path form. Cost
~2KB gzip against a 63KB/90KB budget. The rejected alternative was `power4.out`, measured at
a max deviation of 0.0118 progress (at t=0.053) — visually indistinguishable, but not the
value the spec names, and `motion-spec.md:4` says *"Where a value is given, use that value."*

This is a divergence from `motion-spec.md:64`'s four-plugin registration line, to be logged.

### 2. `.feedback`'s own opacity transition collides with a reveal on the same element

`src/styles/type.css` gives `.feedback` a `transition: opacity var(--dur-feedback)
var(--ease-out)`. If `data-anim` sits **directly on** a `.feedback` element, GSAP's inline
opacity tween and that CSS transition both write `opacity` and the 600ms reveal smears by
120ms. It is harmless when `data-anim` sits on an *ancestor* (parent opacity is a group
effect; the child's own `opacity` never changes), which is the case for the spine's `.marker`
links and every note's back-link.

Exactly one element on the page would hit this: the Contact email link. It is excluded from
the reveal system for a better reason anyway — see the target map below.

---

## Changes

### 1. `src/scripts/motion.ts` — the reveal system

Add the plugin and the curve:

```ts
import { CustomEase } from 'gsap/CustomEase'

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, SplitText, Flip, CustomEase)

/** The one triggered curve (docs/motion-spec.md's table). motion-spec writes it as the CSS
 *  string `cubic-bezier(0.22, 1, 0.36, 1)`, which GSAP cannot parse — gsap.parseEase()
 *  returns undefined and a tween using it silently falls back to power1.out. These are the
 *  identical control points in the SVG-path form CustomEase does parse. Exported so steps
 *  11-13 reuse this one definition rather than restating the curve. */
export const EASE_OUT = CustomEase.create('reveal', 'M0,0 C0.22,1 0.36,1 1,1')
```

Add the reveal function, and fill the two `no-preference` branches:

```ts
/** Tier 2: triggered reveals. Fires once on arrival, plays itself, never reverses, never
 *  replays (docs/motion-spec.md). Values are the spec's: y 16, 600ms, EASE_OUT, trigger at
 *  top 85%.
 *
 *  `scoped` reflects the layout, not a preference. At >=768px a .rail puts its paragraph
 *  and its margin notes side by side with a shared top edge, so every [data-anim] inside
 *  one triggers off the rail ([data-anim-scope]) and the 200ms margin-note lag is literally
 *  a lag behind its own paragraph. Below 768px .rail collapses to one column and the notes
 *  stack under the prose (type.css), where a shared trigger would fire them while still
 *  below the fold — so each element triggers on its own arrival instead.
 *
 *  data-anim-played survives a matchMedia revert: crossing 768px, or toggling reduced
 *  motion, reverts this branch and recreates it, and without the flag every reveal already
 *  scrolled past would animate a second time. "Never replays" stays structural. */
function tier2Reveals(scoped: boolean) {
  gsap.utils.toArray<HTMLElement>('[data-anim]').forEach((el) => {
    if (el.dataset.animPlayed) return
    const scope = scoped ? el.closest<HTMLElement>('[data-anim-scope]') : null
    gsap.from(el, {
      y: 16,
      opacity: 0,
      duration: 0.6,
      ease: EASE_OUT,
      delay: el.dataset.delay ? parseFloat(el.dataset.delay) : 0,
      onComplete: () => { el.dataset.animPlayed = '1' },
      scrollTrigger: { trigger: scope ?? el, start: 'top 85%', once: true },
    })
  })
}
```

`gsap.from` is what implements the initial-state pattern: `immediateRender` is on by default,
so JS sets `y: 16, opacity: 0` at creation and the tween that undoes it is created in the
same call. There is no separate `gsap.set` that could hide content a failed trigger never
reveals — the hazard `progress.md:188` and `docs/plans/step-07.md:27` both flag.

`/** Nudge scroll … */ scrollByPx` and the Lenis wiring are untouched.

Also export a refresh helper, needed by change 5:

```ts
/** Recompute every ScrollTrigger's start/end. Required after script-driven DOM mutation
 *  that changes document height — ScrollTrigger's own autoRefreshEvents cover load and
 *  resize, not a filter click. */
export function refreshTriggers() {
  ScrollTrigger.refresh()
}
```

The reduce branch keeps its `toArray`-guarded `clearProps` exactly as written; only its now
stale *"No `[data-anim]` exists until step 08"* comment changes, to record that the guard is
live and why `clearProps` is still the right call (it clears residue when a reader turns
reduced motion on mid-session and the no-preference branch reverts).

### 2. `src/components/Spine.astro` — scopes and paragraphs

- Each of the three `<div class="rail">` gains `data-anim-scope`.
- Each of the three `<p class="rail-prose text-body">` gains `data-anim`.
- The three `MarginNote`s in the third rail gain `sibling={0|1|2}`; rails 1 and 2 omit it.

### 3. `src/components/MarginNote.astro` — the 200ms lag and the 60ms stagger

One new optional prop, and `data-anim` + `data-delay` on the existing `<aside class="note">`
(never on the `.feedback` back-link inside it):

```ts
interface Props {
  entry: CollectionEntry<'notes'>
  marker: number
  /** Position among the notes sharing one rail margin. */
  sibling?: number
}
const { entry, marker, sibling = 0 } = Astro.props
// 200ms lag behind its paragraph, plus the 60ms sibling stagger when several notes share
// one rail margin (docs/motion-spec.md's values table). toFixed keeps the attribute clean:
// 0.2 + 0.06 * 2 is 0.32000000000000006 in binary floating point.
const delay = (0.2 + 0.06 * sibling).toFixed(2)
```

Yields `data-delay="0.20"` for notes 1, 2 and 3, `"0.26"` for 4, `"0.32"` for 5.

### 4. `Archive.astro`, `Changelog.astro`, `Contact.astro` — headings and blocks

Attribute-only edits, per the target map below.

### 5. `src/components/Archive.astro` — one `refreshTriggers()` call

The archive's filter changes document height at runtime, which moves the start position of
every trigger below it — the changelog and contact reveals. ScrollTrigger's default
`autoRefreshEvents` (`visibilitychange,DOMContentLoaded,load,resize`) covers the init-time
unwrap but not a click. So:

```ts
import { refreshTriggers, scrollByPx } from '../scripts/motion.ts'
```

and one line at the end of `applyState()`, after the existing DOM mutation:

```ts
refreshTriggers() // rows shown/hidden changed document height; every trigger below moves
```

`applyState()` stays one function, so step 11's `Flip.getState(...)` / mutate /
`Flip.from(...)` wrap is unaffected — it will move this call into Flip's `onComplete`.

### 6. No CSS change, no token change, no content change

`--ease-out`, `--dur-feedback` and `--dur-reveal` already exist in `tokens.css:67-70` for the
CSS side; the GSAP side gets its own definition in change 1. Nothing in `type.css` hides
anything JS reveals, and nothing needs to.

---

## The target map — 13 elements

| Component | Element | `data-anim` | `data-delay` |
|---|---|---|---|
| `Hero.astro` | everything | **no** | — |
| `Spine.astro` | `div.rail` ×3 | `data-anim-scope` only | — |
| `Spine.astro` | `p.rail-prose` ×3 | yes | — |
| `MarginNote.astro` | `aside.note` ×5 | yes | `0.20` ×3, `0.26`, `0.32` |
| `Archive.astro` | `h2#archive-heading` | yes | — |
| `Archive.astro` | filter bar, count, `ul`, `.archive-row` ×7, show-all | **no** | — |
| `Changelog.astro` | `h2#changelog-heading` | yes | — |
| `Changelog.astro` | the visible `ul` (one block, not per `li`) | yes | `0.06` |
| `Changelog.astro` | the `<details>` overflow list | **no** | — |
| `Contact.astro` | `h2#contact-heading` | yes | — |
| `Contact.astro` | `p.measure` | yes | `0.06` |
| `Contact.astro` | the email `a.feedback` | **no** | — |

Four exclusions, each with a reason:

**The hero.** Settled with Arthur this session. It is above the fold, so a `top 85%` trigger
fires on load; step 12 owns the first screen as a tier-3 set-piece (SplitText per word, once
per session, ≤1.6s). Building an on-load fade here means unbuilding it next step.

**Archive rows.** `motion-spec.md:152` and `design-spec.md:321` both forbid it outright, and
step 08's Don't list repeats it. The bar, count and show-all are excluded too: they are
controls, and step 11 owns the archive's motion.

**The Contact email link.** `direct` is the highest-ranked principle in `CLAUDE.md`'s
tiebreak rule, and this address is what `design-spec.md:383` calls *"the only thing on the
page the drawing points at"* — it should never be invisible waiting for a trigger. It is also
the one element that would hit the `.feedback` opacity collision described above. Both
reasons point the same way. Its emphasis arrives in step 10/13, as the leader line that
terminates on it.

**The changelog `<details>`.** Not rendered today (two entries, `VISIBLE = 3`) and a reveal
inside a closed `<details>` cannot trigger correctly anyway; it is revealed by user action,
not by arrival.

Per-`li` reveals are deliberately avoided in the changelog for the same reason archive rows
are: `motion-spec.md:154` calls animating a list in sequence *"the most common mistake in
this genre."* The `ul` reveals as one block.

---

## What is deliberately *not* done

- No `drawSVG`, no scrub, no `invalidateOnRefresh` — step 09.
- No leader-line animation; the five `.leader` SVGs stay fully drawn — step 10.
- No `Flip` call — step 11. No `SplitText` call — step 12. No pinning — step 13.
- No second Lenis instance, no second ticker hook, no `requestAnimationFrame`.
- No token change, no CSS change, no `[FILL]` resolved.

---

## Verification

```bash
pnpm build && pnpm check
```

**Greppable acceptance:**

```bash
grep -rno "data-anim-scope" src/ | wc -l       # 3 — the three rails
grep -rno "data-anim\b" src/ | wc -l           # 6 in markup (3 prose, 1 aside, 2 headings-ish)
                                               #   + the motion.ts selector; see note below
grep -n "data-anim" src/components/ArchiveRow.astro   # 0 — rows carry none
grep -o "data-anim" dist/index.html | wc -l    # 16 = 13 reveals + 3 scopes (rendered count)
grep -rn "new Lenis\|gsap.ticker.add" src/     # still exactly 1 each
grep -rn "requestAnimationFrame" src/          # 0
grep -rn "gsap-trial" src/ package.json        # 0
grep -rn "width:\|height:\|color:\|boxShadow\|filter:" src/scripts/motion.ts   # 0 — only
                                               #   y/opacity appear in tween properties
```

The source count is lower than the rendered count because `MarginNote.astro` is one file
rendered five times; `dist/index.html` is the number that matters. `grep -o` not `grep -c`,
per `progress.md:275`: Astro emits `dist/*.html` as one line.

**Bundle size:**

```bash
for f in dist/_astro/*.js; do printf "%s " "$f"; gzip -c "$f" | wc -c; done
```

Expect ~65KB gzip total (63KB after step 07, plus CustomEase). **Stop and ask if it exceeds
90KB.**

**In-browser, against `pnpm preview`** (`astro preview` daemonizes — confirm with
`curl -sI http://localhost:4321/`, stop with `pnpm exec astro preview stop`). The five
acceptance boxes from `implementation-plan.md:181-186` plus the relevant lines of
`motion-spec.md:222`'s checklist:

1. **No replay.** Scroll to the bottom, back to the top, down again. Nothing fades a second
   time. Then reload mid-page and confirm the reveals above the scroll point are simply
   present, not animating.
2. **Archive rows have no entrance animation at all.** Watch the archive arrive: the heading
   reveals, the seven rows and the filter bar are already solid.
3. **Margin notes visibly arrive after their paragraph.** At ≥768px, watch rail 3: paragraph,
   then notes 3, 4, 5 cascading 60ms apart, 200ms behind it. This is the acceptance box most
   likely to look wrong, and the reason for `data-anim-scope`.
4. **Only `transform` and `opacity` in tween properties.** Confirm in DevTools that the
   inline style GSAP writes during a reveal is `translate`/`opacity` and nothing else.
5. **Reduced motion.** Emulate `prefers-reduced-motion: reduce` in DevTools' Rendering panel,
   reload: every element in final state, no reveals, identical to the step 06 build. Then
   toggle it on *mid-session* without reloading and confirm nothing is left stranded at
   `opacity: 0` — this is what the reduce branch's `clearProps` is for.
6. **JS disabled.** Identical to step 06. Nothing invisible at any scroll position — the
   whole point of the initial-state pattern.
7. **375 / 768 / 1280px.** Use the `<iframe>` technique from `progress.md:297-312`
   (`resize_window` does not work in this sandbox — confirmed twice, steps 04 and 06). At
   375px the margin collapses under the prose and each note must reveal on its *own*
   arrival, not off-screen. Then drag across the 768px boundary in the real window and
   confirm no reveal replays (the `data-anim-played` guard).
8. **Trackpad scroll.** No jitter — nothing here is scrubbed, so this should be clean.
9. **The filter still behaves.** Click each tag and toggle show all: the control under the
   cursor stays put (step 05/07 behaviour, unchanged), and the changelog/contact reveals
   below still fire at the right point rather than early or late — what `refreshTriggers()`
   is for.
10. **Keyboard.** Tab the full order. Focus must not land on an element still at `opacity: 0`
    without revealing it; the 2px ring stays visible.
11. **Lighthouse mobile on `/`**, same invocation as steps 06 and 07. Expect no regression
    from perf 99 / a11y 100 / best-practices 100 / CLS 0.

### Step 08 acceptance checklist

- [ ] scrolling down then up then down again does not replay any reveal
- [ ] archive rows have no entrance animation at all
- [ ] margin notes visibly arrive after their paragraph
- [ ] only `transform` and `opacity` appear in the tween properties
- [ ] reduced motion renders everything in final state with no reveals
- [ ] JS disabled: identical to the step 06 static site
- [ ] `pnpm build` succeeds

**Stop and ask if:** total JS exceeds 90KB gzip; Lighthouse drops below 95 in any category;
or the flash-then-hide of an above-the-fold reveal target is visible enough to be a defect —
the fix would be CSS that hides what JS reveals, which `motion-spec.md:88` forbids outright,
so it is Arthur's call and not a thing to fix unilaterally.

---

## Files

| File | Action |
|---|---|
| `docs/plans/step-08.md` | new — this document, written first |
| `src/scripts/motion.ts` | edit — CustomEase + `EASE_OUT`, `tier2Reveals()`, `refreshTriggers()`, two branches filled, stale comment fixed |
| `src/components/Spine.astro` | edit — 3 × `data-anim-scope`, 3 × `data-anim`, `sibling` props |
| `src/components/MarginNote.astro` | edit — `sibling` prop, `data-anim` + `data-delay` on `aside.note` |
| `src/components/Archive.astro` | edit — `data-anim` on the `h2`, `refreshTriggers()` in `applyState()` |
| `src/components/Changelog.astro` | edit — `data-anim` on the `h2` and the visible `ul` |
| `src/components/Contact.astro` | edit — `data-anim` on the `h2` and the `p` |
| `src/components/ArchiveRow.astro`, `Hero.astro`, `Rule.astro`, `Fill.astro` | **untouched** |
| `src/styles/*.css` | **untouched** — no token change, no CSS change |
| `src/content/**` | **untouched** |

---

## Close-out

Per `CLAUDE.md`: run the checklist, `pnpm build`, mark 08 `done` in `docs/progress.md`,
commit `step 08: tier 2 triggered reveals`, push, stop.

**Divergences to log:**
- `CustomEase` registered as a fifth GSAP plugin and `EASE_OUT` defined from the SVG-path
  form, against `motion-spec.md:64`'s four-plugin line and `:142`'s ease string — because
  GSAP silently ignores the CSS `cubic-bezier()` string and substitutes `power1.out`.
  Verified, not assumed; decided with Arthur.
- `data-anim-scope` on `.rail`: an addition to `motion-spec.md:137`'s per-element loop, so
  *"margin notes lag their paragraph by 200ms"* is literally true at ≥768px rather than
  approximately true. Dropped below 768px, where the margin collapses under the prose.
- `data-anim-played`: a guard beyond `once: true`, so a `matchMedia` revert (resize across
  768px, or a reduced-motion toggle) cannot replay a reveal that already played.
- The Contact email link excluded from the reveal system — `direct` over `alive` in the
  tiebreak rule, and the one `.feedback`/opacity collision on the page.
- The changelog reveals as one `ul` block rather than per `li`.

**Notes for future sessions:**
- The whole reveal system is `tier2Reveals()` in `src/scripts/motion.ts`. Adding a reveal is
  an attribute in markup, never new script.
- GSAP cannot parse `cubic-bezier(...)` strings. Use the exported `EASE_OUT`; `ease:
  'cubic-bezier(...)'` compiles, runs, and silently gives you `power1.out`.
- `refreshTriggers()` must be called after any script-driven mutation that changes document
  height. Step 11 moves the `applyState()` call into Flip's `onComplete`.

---

## Implementation order

1. Write `docs/plans/step-08.md` (this document).
2. `src/scripts/motion.ts`: CustomEase, `EASE_OUT`, `tier2Reveals()`, `refreshTriggers()`,
   the two branches, the stale comment.
3. Markup attributes: `Spine`, `MarginNote`, `Archive`, `Changelog`, `Contact`.
4. `Archive.astro`'s `refreshTriggers()` call.
5. `pnpm build && pnpm check`; the grep block and the gzip measurement.
6. `pnpm preview`; walk all eleven in-browser checks, including JS-off, reduced-motion, and
   375px.
7. Lighthouse mobile on `/`.
8. Update `docs/progress.md` (status, divergences, future-session notes), commit, push, stop.
