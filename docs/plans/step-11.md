# Step 11 — Archive filter with Flip

## Context

Step 05 built the archive tag filter as plain JS: `applyState()` toggles the `hidden`
attribute on `.archive-row` elements and the layout snaps to its new shape in one frame.
Step 11's objective (`docs/implementation-plan.md:230`) is to make that one user-triggered
animation on the home page feel physical — rows should travel to their new positions rather
than teleport.

Three earlier steps deliberately prepared for this and must not be re-litigated:

- `ArchiveRow.astro:19` defines `.archive-row`, the exact selector `motion-spec.md:186`
  names, on both the visible rows and the "show all" overflow rows.
- Step 05's script unwraps `<details>` into the one `<ul data-archive-list>` on init, so
  every row shares a single parent and can travel between positions.
- All DOM mutation lives in one `applyState()` function (`Archive.astro:118`), so this step
  wraps one call site rather than rewriting the module.

Nothing about the markup, CSS or content changes. This step is script only.

---

## Decisions taken with Arthur this session

| Question | Decision |
|---|---|
| rows entering / leaving the filtered set | **Travel + fade in only.** Survivors travel (400ms). Entering rows fade `0 → 1`. Leaving rows disappear instantly — no exit animation. |
| below 768px | **Flip runs at both widths.** `motion-spec.md`'s degradation contract strips pinning, leader lines and set-pieces below 768px and says nothing about Flip; the filter is a user-triggered interaction, not a scroll-linked one. |
| reduced motion "filter cross-fade" | Entering rows fade `0 → 1` over **120ms** (`--dur-feedback`) — *not* 200ms, and not a third duration invented for this. Persisting rows do not animate; leaving rows disappear instantly. The whole path lives inside the `prefers-reduced-motion: reduce` branch, not a shared function with a conditional duration. |
| `aria-live` on the filter count | Arthur asked for this to be added and noted. **It is already there** — `Archive.astro:51` has `aria-live="polite"` on `[data-filter-count]`, shipped in step 04 and load-bearing since step 05 (`type.css:287` documents it as the reason no separate visually-hidden live region exists). Nothing to add; it gets logged in `progress.md` as confirmed, not as new work. |

---

## What was verified in `node_modules/gsap/Flip.js`, not assumed

Read before planning, following the step 08–10 precedent of checking the installed source
rather than the docs or memory. Each of these changes what the code needs to be.

1. **The rapid-click guard is built into `Flip.getState()`.** `FlipState.update()` calls
   `this.interrupt()` (`Flip.js:937`), which runs `_killFlip(tl, 1)` on every target's
   in-progress flip — forcing it to `progress(1)` and then killing it (`Flip.js:881-894`) —
   *before* recording inline styles. A second click therefore lands rows in the first
   flip's final state and captures clean values. No manual in-flight bookkeeping, no
   `pointer-events` lockout, no debounce.

2. **Flip's positions are in document space, so `scrollByPx()` cannot corrupt a flip.**
   `ElementState.update()` uses `getGlobalMatrix(el, false, false, true)`
   (`Flip.js:1152`), and `getGlobalMatrix` adds `_getDocScrollTop()` to its translation
   (`utils/matrix.js:413`). Step 05's scroll compensation — which fires *after* the
   mutation, and does move the page in the "show fewer" case and whenever a shrinking
   document clamps `scrollY` — can stay exactly as written.

3. **`absolute: true`, `motion-spec.md:188`'s literal value, would collapse the list.**
   With `absolute: true`, `_filterComps` short-circuits (`Flip.js:257`: the body is guarded
   by `if (targets !== true)`) and *every* comp is made `position: absolute`. Every
   `.archive-row` leaving the flow drops the `<ul>`'s height to zero for the 400ms flight,
   so the count, the show-all button, the changelog and the contact section jump up and
   back. See "The one divergence" below.

4. **Entering and leaving rows are spliced out of the tweened set** (`Flip.js:687-697`) and
   surface only through the `onEnter` / `onLeave` callbacks; unchanged rows are spliced out
   too (`Flip.js:640-646`). So with no `absolute` option, a leaving row does nothing at all
   — which is exactly the decided behaviour, at zero cost.

5. **A tween returned from `onEnter` is added into the flip's own timeline at time 0**
   (`_handleCallback`, `Flip.js:322`). The enter fade is therefore covered by finding 1's
   interrupt as well — it cannot be stranded mid-fade by a second click.

6. **`_removeProps` includes `opacity`** (`Flip.js:37`) and `_setFinalStates` →
   `_applyInlineStyles` reverts recorded inline styles on completion, so the fade leaves no
   stranded inline `opacity` on a row.

7. **`gsap.Context.add(name, fn)` returns a wrapper that runs `fn` inside the context
   whenever it is later called** (`gsap-core.js:3908-3940`). This is what lets a
   click-triggered animation still live inside `gsap.matchMedia()` as `motion-spec.md:100`
   requires — the tween is tracked by the branch's context and reverted with it.

8. **Preflight's `[hidden]{display:none!important}` beats Flip's inline `style.display`**
   (`_makeAbsolute`, `Flip.js:216` writes a plain inline value). This is why a fade-*out*
   for leaving rows would have needed an `!important` override of the `hidden` attribute —
   and a second reason the decided behaviour is the cheap one.

---

## Implementation

### `src/scripts/motion.ts`

Add one constant, two transition functions, and a small registry the three existing
`mm.add` branches write into. No existing function changes.

```ts
const FLIP_DURATION = 0.4 // motion-spec.md: Flip duration <= 400ms
const FADE_FEEDBACK = 0.12 // tokens.css --dur-feedback; the reduced-motion cross-fade
```

**The registry.** A plain `Map` keyed by branch name, not a single mutable
`let currentTransition = ...` variable. The reason is an ordering hazard, avoided by
construction: each `mm.add` branch owns its own `MediaQueryList` listener, and crossing
768px fires two of them (one branch stops matching, one starts). With a single variable,
one of the two crossing directions ends with the *departing* branch's cleanup running last
and resetting the transition to "instant" even though a branch is active. Distinct keys
make the result order-independent.

```ts
type FilterTransition = (mutate: () => void) => void

const filterTransitions = new Map<string, FilterTransition>()

/** Registered from inside a matchMedia branch; the returned function is the branch's
 *  cleanup, so a branch that stops matching takes its transition with it. */
function registerFilterTransition(key: string, fn: FilterTransition) {
  filterTransitions.set(key, fn)
  return () => filterTransitions.delete(key)
}

/** The one entry point Archive.astro calls. `mutate` is applyState() plus its state
 *  change — run exactly once, whichever path is active, so the filter still works if no
 *  branch matches (or if GSAP failed to load). */
export function filterTransition(mutate: () => void) {
  const run = filterTransitions.get('reduce') ?? filterTransitions.get('motion')
  run ? run(mutate) : mutate()
}
```

Key `'reduce'` is checked first so it always wins; both no-preference branches register
under `'motion'`, which is safe because they are mutually exclusive *and* register the
identical function — the hazard above only bites when two branches disagree, and a
departing branch deleting a key a surviving branch has just re-set leaves the correct
function in place either way. (If this reads as too subtle at implementation time, use
three distinct keys — `'desktop'`, `'mobile'`, `'reduce'` — and have the getter prefer
`'reduce'` then either motion key. Same behaviour, more obvious.)

**The full-motion path.**

```ts
function flipFilter(mutate: () => void) {
  const state = Flip.getState('.archive-row')
  mutate()
  Flip.from(state, {
    duration: FLIP_DURATION,
    ease: EASE_OUT,
    onEnter: (els) =>
      gsap.fromTo(
        els,
        { opacity: 0 },
        { opacity: 1, duration: FLIP_DURATION, ease: EASE_OUT },
      ),
  })
}
```

Returns nothing on purpose: `Context.add`'s wrapper treats a returned *function* as a
cleanup (`gsap-core.js:3929`), so `flipFilter` must not return one.

**The reduced-motion path.** Self-contained, with its own entering-row detection, so it
shares no code path (and therefore no conditional duration) with `flipFilter`:

```ts
function crossfadeFilter(mutate: () => void) {
  const rows = gsap.utils.toArray<HTMLElement>('.archive-row')
  const wasHidden = rows.map((row) => row.hidden)
  mutate()
  const entering = rows.filter((row, i) => wasHidden[i] && !row.hidden)
  if (entering.length) {
    gsap.fromTo(
      entering,
      { opacity: 0 },
      {
        opacity: 1,
        duration: FADE_FEEDBACK,
        ease: EASE_OUT,
        overwrite: true, // rapid clicks: no Flip.getState() here to interrupt for us
        clearProps: 'opacity',
      },
    )
  }
}
```

**Wiring into the three existing branches.** Each returns the unregister function, which
`mm.add` already uses as its cleanup:

```ts
mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', (ctx) => {
  tier2Reveals(true)
  if (rulePath && pageMain) { /* unchanged */ }
  return registerFilterTransition('motion', ctx.add('archiveFilter', flipFilter))
})

mm.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', (ctx) => {
  tier2Reveals(false)
  if (rulePath && pageMain) tier1Rule(rulePath, pageMain)
  return registerFilterTransition('motion', ctx.add('archiveFilter', flipFilter))
})

mm.add('(prefers-reduced-motion: reduce)', (ctx) => {
  /* unchanged clearProps work */
  return registerFilterTransition('reduce', ctx.add('archiveFilter', crossfadeFilter))
})
```

`ctx.add('archiveFilter', fn)` is finding 7: it hands back a wrapper that runs `fn` inside
that branch's context at click time, so every tween this step creates is owned by a
`matchMedia` branch — `motion-spec.md:100`'s "every animation lives inside
`gsap.matchMedia()`, nothing outside it" stays literally true for a click-triggered
animation, and a branch reverting mid-flight lands the rows in their final state (Flip
overrides `anim.revert` to jump to the end and clear styles, `Flip.js:870`). The return
type is loose; a cast to `FilterTransition` is expected and fine.

### `src/components/Archive.astro`

Script only — no frontmatter or markup change.

- Add `filterTransition` to the existing import from `../scripts/motion.ts`.
- Filter-button handler (`Archive.astro:142-151`): wrap the state change plus `applyState()`
  in `filterTransition(() => { ... })`. The `before` / `after` measurements and
  `scrollByPx` stay outside it, unchanged (finding 2).
- Show-all handler (`Archive.astro:105-113`): same wrap, same shape.
- **The init `applyState()` at line 153 stays bare.** This is step 11's explicit "Don't":
  no row entrance animation on first load.
- `refreshTriggers()` stays where it is, at the end of `applyState()`. It runs between
  `Flip.getState()` and `Flip.from()`, which is safe: by then the final layout is already in
  place (hidden rows are out of flow), Flip re-measures at `Flip.from()` time, and Flip's
  math is scroll-independent anyway.

### `docs/progress.md`

Mark step 11 done, add the divergence below, and record the `aria-live` confirmation and
the reduced-motion verification gap in "Notes for future sessions".

---

## The one divergence to expect — verify it before writing it up

`motion-spec.md:188` gives `absolute: true`. Finding 3 says that flag makes every row
`position: absolute` and collapses the `<ul>` for the flight. **Do not skip straight to
omitting it.** Following the step 09/10 precedent — measure, then diverge — build once with
`absolute: true` exactly as the spec writes it and observe the collapse in the browser
(watch the show-all button and the contact section jump during the 400ms flight;
`document.body.scrollHeight` sampled mid-flight is the numeric version). Then remove the
flag and confirm the jump is gone.

If, and only if, the measurement confirms it, log the divergence in `progress.md` with the
mechanism: with the decided enter/leave behaviour no row ever needs to be painted outside
the document flow, so the option buys nothing and costs a full-page reflow.
`absoluteOnLeave: true` (`Flip.js:850`) is the narrower alternative and was considered, but
it is also unnecessary here — a leaving row carries `hidden`, and finding 8 means Flip
cannot make it paint anyway.

If the measurement does *not* show a collapse, keep `absolute: true` as the spec writes it
and note why the reasoning above did not hold.

---

## Verification

Run in this order. Stop and report rather than improvising if something here fails.

**Build gates**
1. `pnpm astro check` — clean.
2. `pnpm build` — must succeed. Required before the step counts as done.
3. gzip the built JS (`gzip -c` per `dist/_astro/*.js`, summed — not the concatenation).
   Flip has been registered and bundled since step 07, so expect ~66KB, unchanged within a
   few hundred bytes. Floor is 90KB.

**In the browser** (`pnpm preview`, then the `claude-in-chrome` extension). Per
`progress.md`, use the `computer` tool's real clicks and real mouse wheel — dispatched
`MouseEvent`s and `window.scrollTo()` do not exercise this page correctly.
4. Click each tag in turn, then `All`. Rows visibly travel; the transition reads as ≤400ms.
5. Narrowing a filter: leaving rows disappear on the click frame, survivors travel. Widening
   (`All` from a tag): entering rows fade in over the same 400ms.
6. Clicking "show all" / "show fewer": overflow rows animate in, and the button stays put
   under the pointer — confirming `scrollByPx` and Flip coexist (finding 2).
7. Rapid clicking: hammer 5–6 different tags as fast as the tool allows, wait 1s, then assert
   nothing is stranded — for every `.archive-row:not([hidden])`,
   `getComputedStyle(row).transform === 'none'` and `opacity === '1'`.
8. Focus: click a filter button and confirm `document.activeElement` is still that button
   after the flight; then walk the filter bar with real Tab/Enter keypresses and confirm the
   filter operates and the focus ring stays visible.
9. Clean console — no GSAP warnings, matching the step 06 gate.
10. 375px via the iframe technique (`progress.md`, since `resize_window` does not work in
    this sandbox) — the flip runs there too, per Arthur's decision.
11. Scroll down / up / down: no tier 2 reveal replays, and the rule, ticks and leader lines
    still track the scroll position after a filter change has altered the document height.

**Cannot be verified in this sandbox**
12. `prefers-reduced-motion: reduce`. The extension cannot drive DevTools or emulate it
    (`progress.md`, step 08). Verify `crossfadeFilter` by code review, confirm the branch
    registers under the `'reduce'` key, and add it to the list of things for Arthur to check
    by hand in DevTools before step 14 ships — alongside step 08's outstanding item.

**Lighthouse**
13. One mobile run. Expect CLS ≈ 0 and no regression. Close the automation tab and any stray
    `serve` processes first; a single low performance/TBT score is environment noise in this
    sandbox — CLS is the trustworthy signal (`progress.md`, steps 09/10).

**Acceptance checklist from `implementation-plan.md:238`**
- [ ] rows visibly travel rather than snap → 4, 5
- [ ] reduced motion falls back to a cross-fade → 12 (code review + hand-off)
- [ ] repeated rapid clicking does not leave rows stranded mid-flight → 7
- [ ] keyboard operation still works and focus is not lost during the animation → 8

**Then**
14. Update `docs/progress.md`: step 11 `done`, one-line note, plus the `absolute: true`
    divergence if measured.
15. Commit `step 11: archive filter with Flip` and push to origin.
16. Stop and report. Do not start step 12.
