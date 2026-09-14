# Step 07 — Motion infrastructure only

## Context

Step 06 is committed (`588ad51`) and `docs/progress.md` marks it `done`. **Step 07 is the first
step not done**, and it is the first step allowed to install `gsap` and `lenis`.

Objective from `docs/implementation-plan.md:147`: *"Wiring, with no visible animation, so problems
here are isolated from problems in the animations themselves."*

So this step ships **zero visible change**. It installs two libraries, creates the one module that
owns scroll for the rest of the project's life, and hands steps 08–13 three empty `matchMedia`
branches to fill. If anything looks different afterwards, the step failed.

One existing piece of code has been waiting for this step: `src/components/Archive.astro:107`
carries the comment *"step 07 must route this through Lenis, once Lenis owns scroll position — not
window.scrollBy."* That reroute is part of this step.

---

## The one interpretation call, flagged before anything is built

Step 07's **Do** list says *"Implement the JS-sets-initial-state pattern: SVGs and content ship in
their final state in markup; JS sets initial states on load."* Its **Don't** list says *"Animate
anything yet."* Its acceptance says *"the page is otherwise visually identical to step 06."*

Taken literally, `gsap.set('[data-anim]', { y: 16, opacity: 0 })` in step 07 would hide content
that nothing reveals until step 08 — failing its own acceptance criterion.

**Reading taken:** step 07 establishes the pattern **structurally** — it verifies the markup half
of the contract already holds, and creates the exact place where initial states get set — while
the initial-state calls themselves land in step 08, paired with the reveals that undo them.

The markup half already holds and needs no work, confirmed this session:

- `src/components/Rule.astro` ships `#rule` fully drawn (`d="M0.5 0 V100"`, real `stroke`, real
  `stroke-width` — DrawSVG needs both), already noted in `progress.md` as built ahead of step 09
  for exactly this reason.
- The five `.leader` SVGs in `MarginNote.astro` likewise.
- No CSS anywhere hides anything that JS reveals. `grep -rn "data-anim" src/` → nothing yet;
  `.filter-bar`'s `display: none` is the inverse pattern (CSS *hides* a control that only exists
  with JS, revealed by the `js` class set before first paint) and is correct as-is.

Nothing in the tree contradicts the pattern, so there is nothing to fix — only to record as
audited.

---

## Verified before planning, not assumed

`CLAUDE.md` requires checking framework specifics against current docs rather than memory.

| Thing | Verified | Result |
|---|---|---|
| `gsap` latest | `npm view gsap version` | **3.15.0**. All plugins free since 3.13 — `DrawSVGPlugin` and `SplitText` included. Use `gsap`, never `gsap-trial`. |
| plugin subpaths | `npm view gsap exports` | `"./*"` maps to `./*.js` (ESM) — `gsap/ScrollTrigger`, `gsap/DrawSVGPlugin`, `gsap/SplitText`, `gsap/Flip` all resolve, with types at `types/*.d.ts`. |
| `lenis` latest | `npm view lenis version` | **1.3.26** |
| `lenis/dist/lenis.css` resolves | `npm view lenis exports` | yes — `"./dist/*": "./dist/*"` is exported. |
| **`respectReducedMotion`** | lenis docs | **defaults to `true`**. Under `prefers-reduced-motion: reduce` Lenis forces `lerp` to 1 and makes programmatic scrolls jump instantly. |
| `scrollTo` / `actualScroll` | lenis docs | `scrollTo(target, { immediate: true })` bypasses duration, easing and lerp; `actualScroll` is the browser-registered scroll value. |
| lenis.css content | fetched verbatim | 5 rules, **every one gated on the `.lenis` class** Lenis adds to `<html>` at runtime. Inert with JS disabled. |

**The `respectReducedMotion` finding settles a question I was going to put to Arthur.** The motion
spec's Lenis snippet has no reduced-motion guard, and smooth scrolling *is* motion — but the
library already honours the preference by default, so `new Lenis()` unconditionally is both the
spec's literal code and correct behaviour. No guard, no divergence.

---

## Changes

### 1. `package.json` — two dependencies

```bash
pnpm add gsap lenis
```

Both are named in `CLAUDE.md`'s allowed list. Nothing else. Expect no build scripts (neither
package has a postinstall), so `pnpm-workspace.yaml`'s `onlyBuiltDependencies` should not need a
new entry — confirm with `pnpm peers check` after installing, per step 02's note.

### 2. `src/scripts/motion.ts` — new, the single scroll authority

The whole of the motion layer's wiring lives in this one file, for the life of the project.

```ts
// The single scroll authority and the matchMedia scaffold — docs/motion-spec.md.
// Exactly one Lenis instance and exactly one gsap.ticker hook exist in this codebase and
// both are here. Step 07 is wiring only: nothing in this file animates, and the three
// matchMedia branches are deliberately empty until steps 08-13 fill them.
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { SplitText } from 'gsap/SplitText'
import { Flip } from 'gsap/Flip'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, SplitText, Flip)

// respectReducedMotion defaults to true: under prefers-reduced-motion: reduce Lenis forces
// lerp to 1 and makes programmatic scrolls jump instantly. So the instance is created
// unconditionally — as motion-spec.md writes it — and still honours the degradation
// contract without a guard of our own.
export const lenis = new Lenis()

lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0) // required, or scroll-linked tweens lag the scroll position

/** Nudge scroll by `delta` px with no animation. Lenis owns scroll position from here on,
 *  so window.scrollBy would fight it. Used by Archive.astro's filter/show-all compensation. */
export function scrollByPx(delta: number) {
  lenis.scrollTo(lenis.actualScroll + delta, { immediate: true })
}

const mm = gsap.matchMedia()

mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
  // steps 08-13: tier 2 reveals, tier 1 scrubbed drawing, leader lines, Flip, hero,
  // and the one pinned set-piece. Cleanup is automatic on revert.
})

mm.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
  // steps 08-13: scrubbed rule + tier 2 reveals only. Never pinned, no leader lines.
})

mm.add('(prefers-reduced-motion: reduce)', () => {
  // Final states, nothing animates. toArray guards the empty selector — gsap.set on a
  // selector matching nothing logs a "target not found" warning, and step 06's gate
  // expects a clean console. No [data-anim] exists until step 08; this is a no-op today.
  const anim = gsap.utils.toArray<HTMLElement>('[data-anim]')
  if (anim.length) gsap.set(anim, { clearProps: 'all' })
})
```

### 3. `src/layouts/Base.astro` — one script tag

Just before `</body>`, after the `<slot />`:

```astro
<script>
  import '../scripts/motion.ts'
</script>
```

In `Base`, not `index.astro`, so "one scroll authority" is structural rather than a thing each page
has to remember. `/type-test` gets it too; it is `noindex` and step 14 deletes it, so the cost is
irrelevant and the alternative is a second place that could drift.

Astro gives component scripts `type="module"`, so it defers on its own — no `is:inline`, no
`defer` attribute. (The existing `is:inline` `js`-class script in `<head>` stays exactly as it is;
it must run before first paint and must not be bundled.)

### 4. `src/styles/global.css` — Lenis's own stylesheet

Appended after the three existing imports:

```css
/* Lenis's required stylesheet, shipped by the package. Every rule in it is gated on the
 * `lenis` class Lenis puts on <html> at runtime, so it is inert with JS disabled. Last,
 * so Tailwind's preflight (pulled in by tokens.css) can't override it. */
@import "lenis/dist/lenis.css";
```

In the stylesheet rather than as `import 'lenis/dist/lenis.css'` inside `motion.ts`: it lands in
the one existing CSS bundle instead of adding a second stylesheet request, and it arrives before
first paint rather than with the deferred module.

*If Tailwind v4's own `@import` inliner refuses the bare specifier*, fall back to importing it from
`motion.ts` and log the reason. Do not hand-copy the five rules into `type.css` — a vendored copy
silently rots against the package.

### 5. `src/components/Archive.astro` — the reroute the code already asked for

Add to the top of the existing `<script>`:

```ts
import { scrollByPx } from '../scripts/motion.ts'
```

Then replace both occurrences of the scroll compensation (lines ~108 and ~144):

```ts
if (after !== before) window.scrollBy(0, after - before)   // before
if (after !== before) scrollByPx(after - before)           // after
```

and update the `// step 07 must route this through Lenis` comment to say it now does.

This import is also what makes the single-instance guarantee airtight: ES modules are singletons
per resolved URL, and Vite hoists `motion.ts` into a chunk shared by both entry scripts, so
`Base` and `Archive` reach the same Lenis object rather than constructing two.

**No other change to `Archive.astro`.** `applyState()` stays one function, untouched, ready for
step 11's Flip wrap.

---

## What is deliberately *not* done

- No animation of any kind, no `data-anim` attributes, no `ScrollTrigger` created.
- No `gsap.set` that hides anything (see the interpretation call above).
- No second `requestAnimationFrame` loop, anywhere. `gsap.ticker` is the only one.
- No `ScrollTrigger.normalizeScroll`, no `lenis` options tuning, no anchor-link interception —
  none of it is in `motion-spec.md` and none of it is needed yet.
- No token changes.

---

## Risks, with the remedy decided in advance

**`html, body { overflow-x: hidden }` (`src/styles/type.css:30`).** The best-known Lenis friction
point: `overflow-x: hidden` forces the computed `overflow-y` to `auto`, which can turn the element
into a scroll container Lenis isn't driving. If smooth scroll doesn't engage, or engages and the
page also scrolls natively, the fix is `overflow-x: clip` — `clip` clips without creating a scroll
container. A plain CSS-property change, not a token change; log it in `progress.md` if used.

**JS bundle size.** `CLAUDE.md`'s floor is *total JS under 90KB gzip at the end of the project*.
gsap core + four plugins + Lenis should land near 50–60KB gzip, leaving headroom for steps 08–13
(which add API calls, not libraries). Measure gzip explicitly this step (command below) and report
the number. **Stop and ask if it exceeds 90KB gzip** — the answer would be dropping a plugin from
the registration, which changes what steps 09–13 can do and is Arthur's call.

Note this also changes the shape of `dist`: step 06 measured *raw* bytes and recorded that the
module script was inlined into `index.html` with no separate `.js`. From this step there will be
real `_astro/*.js` files, and raw bytes will exceed step 06's 200KB figure while gzip stays well
under the stated 90KB JS floor. Report both; the gzip number is the one `CLAUDE.md` states.

**Lighthouse.** Step 07's acceptance doesn't require a Lighthouse run, but step 06 just gated on
95+ and this is the first step that can erode it. Re-run it as an early warning rather than
discovering the damage at step 14.

---

## Files

| File | Action |
|---|---|
| `docs/plans/step-07.md` | new — this document, written first |
| `package.json` / `pnpm-lock.yaml` | `pnpm add gsap lenis` |
| `src/scripts/motion.ts` | **new** — the single scroll authority + matchMedia scaffold |
| `src/layouts/Base.astro` | edit — one `<script>` importing `motion.ts` |
| `src/styles/global.css` | edit — `@import "lenis/dist/lenis.css"` |
| `src/components/Archive.astro` | edit — two `window.scrollBy` → `scrollByPx`, plus its comment |
| `src/styles/type.css` | **conditional** — `overflow-x: hidden` → `clip`, only if Lenis needs it |
| `src/components/Rule.astro`, `MarginNote.astro` | **untouched** — audited, already ship final state |
| `src/styles/tokens.css` | **untouched** — no token change |
| `src/content/**` | **untouched** — no `[FILL]` resolved this step |

---

## Verification

```bash
pnpm build && pnpm check && pnpm peers check
```

**Structural checks — the acceptance boxes that are greppable:**

```bash
grep -rn "new Lenis" src/                 # exactly 1, in src/scripts/motion.ts
grep -rn "gsap.ticker.add" src/           # exactly 1, same file
grep -rn "lagSmoothing" src/              # exactly 1, and it is (0)
grep -rn "requestAnimationFrame" src/     # 0 — gsap.ticker is the only loop
grep -rn "window.scrollBy" src/           # 0 — both rerouted through Lenis
grep -rn "gsap-trial" src/ package.json   # 0
```

**Bundle size:**

```bash
for f in dist/_astro/*.js; do printf "%s " "$f"; gzip -c "$f" | wc -c; done
```

**In-browser, against `pnpm preview` (`astro preview` daemonizes — confirm with
`curl -sI http://localhost:4321/`, and stop it with `pnpm exec astro preview stop`):**

1. **Smooth scroll is active.** Wheel and trackpad both glide rather than jump; `<html>` carries
   the `lenis lenis-smooth` classes; console is clean.
2. **Otherwise visually identical to step 06.** Compare against the deployed
   `arthur-heberle.github.io`, which serves the step 06 build. Nothing moves, nothing fades,
   nothing is hidden at any scroll position.
3. **Reduced motion.** Emulate `prefers-reduced-motion: reduce` in DevTools' Rendering panel,
   reload, and confirm scrolling is instant/native and the page is identical to step 06.
   `lenis.prefersReducedMotion` should read `true`.
4. **JS disabled.** Identical to step 06: filter bar absent, `<details>` "show all" still expands,
   the rule and all five leader lines fully drawn, no `.lenis` classes on `<html>`.
5. **The reroute works.** With JS on, click a tag filter and toggle "show all" — the control under
   the cursor must stay put, exactly as in step 05, with no jump and no fight with Lenis. Repeat
   under reduced motion.
6. **Keyboard.** Tab through the full order from step 06; focus must still scroll into view and the
   2px ring must still be visible. Lenis does not intercept focus scrolling by default — confirm
   rather than assume.
7. **Resize.** No new horizontal scrollbar at 375 / 768 / 1280px. Use step 04's `<iframe>`
   technique (`resize_window` does not work in this sandbox, confirmed twice).
8. **Lighthouse mobile on `/`**, same invocation as step 06, reports into the scratchpad.

### Step 07 acceptance checklist

- [ ] smooth scroll active and the page is otherwise visually identical to step 06
- [ ] with `prefers-reduced-motion: reduce`, output is equivalent in appearance to step 06
- [ ] with JS disabled, still identical to step 06
- [ ] exactly one `Lenis` instance and one `gsap.ticker` hook in the codebase
- [ ] `gsap.ticker.lagSmoothing(0)` present
- [ ] `pnpm build` succeeds

**Stop and ask if:** total JS exceeds 90KB gzip; Lighthouse drops below 95 in any category; or
Lenis cannot be made to coexist with `overflow-x` without a change beyond `hidden` → `clip`.

---

## Close-out

Per `CLAUDE.md`: run the checklist, `pnpm build`, mark 07 `done` in `docs/progress.md`, commit
`step 07: motion infrastructure only`, push, stop.

**Divergences to log (only if they actually occur):**
- `overflow-x: hidden` → `clip` in `type.css`, if Lenis required it.
- lenis.css imported from `motion.ts` instead of `global.css`, if Tailwind's import inliner
  refused the bare specifier.

**Interpretation to log regardless:** step 07's "JS sets initial states on load" is implemented as
scaffold only — the markup half was audited and already correct, and the actual `gsap.set` initial
states ship in step 08 with the reveals that undo them, because setting them now would leave
content invisible and break step 07's own "visually identical to step 06" acceptance.

**Notes for future sessions:**
- All motion wiring is in `src/scripts/motion.ts`. Steps 08–13 fill the three `matchMedia`
  branches there or import `lenis` from it; they never construct a second instance or a second
  ticker hook.
- Lenis's `respectReducedMotion` is `true` by default — no hand-rolled reduced-motion guard is
  needed around scroll smoothing.
- `scrollByPx()` in `motion.ts` replaces `window.scrollBy` everywhere; anything that nudges scroll
  position from now on goes through it.

---

## Implementation order

1. Write `docs/plans/step-07.md` (this document, copied into the repo).
2. `pnpm add gsap lenis`; `pnpm peers check`.
3. Create `src/scripts/motion.ts`.
4. Wire it: `Base.astro` script tag, `global.css` import, `Archive.astro` reroute.
5. `pnpm build && pnpm check`; run the grep block and the gzip measurement.
6. `pnpm preview`; walk all eight in-browser checks, including JS-off and reduced-motion.
7. Apply the `overflow-x: clip` remedy only if a check demands it; re-verify.
8. Lighthouse mobile on `/`.
9. Update `docs/progress.md` (status, any divergence, the interpretation note, future-session
   notes), commit, push, stop.
