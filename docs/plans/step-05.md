# Step 05 — Archive filter, without GSAP

## Context

Step 04 is committed (`f5235db`) and `docs/progress.md` marks it `done`. Step 05 is now the first
step not done. This session's deliverable is one file — `docs/plans/step-05.md` — written against the
code step 04 actually shipped, not against what its plan promised.

Objective from `docs/implementation-plan.md`: *"Interaction works before animation exists."* Tag filter
and "show all" in plain JS, real `<button>` elements with `aria-pressed`, nothing animates. It is a
separate step so step 11 retrofits Flip onto a filter that is already correct, keyboard-operable and
degradable, instead of debugging interaction and animation together.

**No GSAP.** Step 07 is the first step allowed to install it. Step 05 is vanilla JS and must leave a
clean seam for step 11 to wrap.

---

## What step 04 already built (reuse, don't rewrite)

Read before writing anything:

- `src/components/Archive.astro` — sorts, slices `VISIBLE = 6`, renders a `<ul role="list">` of six
  rows, then a `<details><summary class="control">show all</summary><ul>…</ul></details>` holding the
  remaining **one** row (`brasilore`). Its own comment says step 05 should *progressively enhance*
  this, not replace it.
- `src/components/ArchiveRow.astro` — `<li class="archive-row">`, the exact selector step 11's Flip
  snippet targets. Has no `data-tags` yet.
- `src/styles/type.css` already carries everything the filter bar needs:
  - **`.control`** — hairline border, `--radius-control` (2px), `--sheet` background, sans,
    `text-small`, `width: fit-content`. Step 04's comment literally says *"whatever step 05's filter
    buttons need tomorrow."* Use it as-is; add no second control class.
  - **`.feedback`** — `transition: opacity var(--dur-feedback) var(--ease-out)`, `opacity: 0.7` on
    hover and `:focus-visible`. This is the 120ms interactive feedback, already correctly restricted
    to opacity. Put `.feedback` on the filter buttons and **write no new transition** — a
    `transition: color` or `border-color` would break `CLAUDE.md`'s hard property rule.
  - `html, body { overflow-x: hidden }` — already there.
- `src/layouts/Base.astro` — has the skip link, no scripts yet.

**Verified, not assumed:** the built CSS contains Tailwind v4 preflight's
`[hidden]:where(:not([hidden=until-found])){display:none!important}`. The `!important` beats
`.archive-row { display: grid }`, so toggling the `hidden` attribute really does hide a row. No extra
CSS rule is needed for this — do not add one.

---

## Decisions taken with Arthur this session

1. **Single-select filter with an `All` default.** Six buttons — `All`, `code`, `hardware`,
   `teaching`, `ai`, `energy`. Exactly one `aria-pressed="true"` at a time. (Rejected: multi-select
   OR/AND. With 7 entries and tag counts of code 4 / teaching 3 / hardware 1 / ai 1 / energy 1, AND
   yields an empty set for nearly every pair and OR is indistinguishable from single-select.)
2. **One live count line, not per-button counts.** A single mono `4 / 7` beside the bar in an
   `aria-live="polite"` region — simultaneously the visible feedback and the screen-reader
   announcement, so no separate visually-hidden live region is needed. Mono is licensed here:
   `design-spec.md` §5 gives it "dimensions, dates, counts". Buttons stay bare words — §5 says tag
   names are **not** mono.

---

## Three judgment calls, resolved and logged

**a) "with JS disabled all entries are visible" vs step 04's "6 visible, rest in markup."**
Read as a statement about the *filter*: with JS off nothing is filtered out and every entry stays
reachable through `<details>`, which needs no JS. Step 04's six-row default survives. If Arthur reads
it the other way the fix is one word (`<details open>`), so it is worth confirming at step 06 rather
than blocking on.

**b) The 6-row cap under an active filter.** A cap of six on a filtered set of at most four is
meaningless, and here it actively breaks: filtering to `code` matches four rows, one of which is
`brasilore` — the row sitting inside the collapsed `<details>`. The reader would see 3 of 4 matches
with no signal the fourth exists. **Rule: the cap applies only in the `All` state.** Any tag filter
shows every match and hides the show-all control; returning to `All` restores the previous
collapsed/expanded state, remembered across toggles.

**c) The filter bar without JS.** Controls ship in markup and are revealed by a `js` class on `<html>`.
This resembles the pattern `motion-spec.md` forbids ("CSS hiding what JS will reveal") — it is not.
That rule protects *content*; nothing hidden here is content, and the step's own acceptance says the
controls may be **"absent or inert"**. Absent beats inert: a visible button that does nothing is worse
than no button. Shipping the bar in markup rather than building it in JS is what keeps CLS at zero for
step 06's gate.

---

## Markup

### `src/components/Archive.astro` — edit

Between the `<h2>` and the `<ul>`:

```html
<div class="filter-bar" role="group" aria-label="Filter archive by tag">
  <button type="button" class="control feedback" data-filter="all" aria-pressed="true">All</button>
  {tags.map((t) => (
    <button type="button" class="control feedback" data-filter={t} aria-pressed="false">{t}</button>
  ))}
</div>
<p class="filter-count" aria-live="polite" data-filter-count>7 / 7</p>
```

The five tag buttons are **derived from the entries** (`[...new Set(entries.flatMap(e => e.data.tags))]`,
ordered to match the `tag` enum in `src/content.config.ts`), never hand-written — a sixth tag must not
be able to reach content without reaching the bar.

After the `<ul>`, an empty state: `<p data-empty hidden class="text-small text-graphite-2">No entries
with this tag.</p>`. Unreachable with today's data since every tag has at least one entry, but it is
three lines and stops a future tag shipping a silently blank section.

The `<details>` block stays in the markup exactly as step 04 wrote it.

### `src/components/ArchiveRow.astro` — edit

One attribute on the `<li>`: `data-tags={tags.join(' ')}`. Matching is a token test —
`row.dataset.tags.split(' ').includes(tag)` — never `includes()` on the raw string, so `ai` cannot
match inside another token.

### `src/layouts/Base.astro` — edit

One line in `<head>`, before the font preload:

```html
<script is:inline>document.documentElement.classList.add('js')</script>
```

`is:inline` stops Astro bundling and deferring it. It must run before first paint or the bar paints
and then vanishes — exactly the layout shift step 06 gates on. Steps 07–13 reuse this class.

---

## Script

One component-scoped `<script>` in `Archive.astro` — Astro bundles and defers it as a module; no
`is:inline`. Step 04 ships zero scripts to `dist/index.html`; step 05 ships exactly one.

All DOM mutation isolated into a **single `applyState()` function**, because step 11 wraps precisely
that call in `Flip.getState(…)` / mutate / `Flip.from(…)`:

```
state = { tag: 'all', expanded: false }

applyState():
  rows.forEach((row, i) => {
    const matches   = state.tag === 'all' || row tags include state.tag
    const withinCap = state.tag !== 'all' || state.expanded || i < 6
    row.hidden = !(matches && withinCap)
  })
  count line   -> `${shown} / ${rows.length}`
  empty-state  -> hidden unless shown === 0
  show-all     -> hidden whenever state.tag !== 'all'; label and aria-expanded from state.expanded
  every button -> aria-pressed = (button.dataset.filter === state.tag)
```

Visibility is the `hidden` **attribute**, not a class and not an inline style. `design-spec.md` forbids
`display: none` *transitions*, not `display: none` itself, and `hidden` is what step 11's Flip expects
to toggle.

**Enhancing the `<details>` on init**, before the first `applyState()`:

1. Read its `open` state into `state.expanded` so nothing collapses under a reader who already
   expanded it.
2. Move the overflow `<li class="archive-row">` out of the nested `<ul>` and append it to the main
   `<ul>`.
3. Remove the `<details>` and insert
   `<button type="button" class="control feedback" data-show-all aria-expanded="false">show all</button>`
   in its place.

Reason: step 11's `Flip.getState('.archive-row')` needs every row in one parent to travel between
positions, and a row trapped in a `<details>` subtree cannot flip into the main list. This is
enhancement, not replacement — `<details>` remains the shipped no-JS mechanism and is swapped out only
once JS has proven it can do better.

**Scroll-position guard** — the step's explicit "don't". Anchor the control the reader just activated:

```js
const before = el.getBoundingClientRect().top
applyState()
const after = el.getBoundingClientRect().top
if (after !== before) window.scrollBy(0, after - before)
```

Filter buttons sit above the list so they rarely move; the show-all button sits below it and always
does. Leave a comment: **step 07 must route this through Lenis** once Lenis owns scroll position.

**Keyboard.** Plain tabbable buttons inside `role="group"` — no roving tabindex, no toolbar widget.
Native `<button>` already handles Enter and Space, and six controls do not justify a composite widget.
Focus is never moved by script, so it cannot be lost.

---

## Styling — `src/styles/type.css`

Add only what does not already exist:

```css
.filter-bar { display: none; flex-wrap: wrap; gap: 0.5rem; }
.js .filter-bar { display: flex; }

.control[aria-pressed='true'] {
  color: var(--color-signal);
  border-color: var(--color-signal);
}

.filter-count {
  font-family: var(--font-mono);
  font-size: var(--text-dimension);
  letter-spacing: var(--text-dimension--letter-spacing);
  color: var(--color-graphite-2);
}
```

- `flex-wrap` is what satisfies "no horizontal scroll at any width" — six buttons wrap at 375px.
  `html { overflow-x: hidden }` already exists but *masks* overflow rather than fixing it, so check
  the wrap visually rather than trusting the absence of a scrollbar.
- `[aria-pressed="true"]` never fills a background — §5: `--signal` strokes, marks and text only. The
  `--sheet` background from `.control` stays. One active button = **one** `--signal` appearance,
  holding the page total near seven against the ~8 budget.
- **No new `transition` anywhere.** `.feedback` already supplies the 120ms opacity feedback; the
  colour change is instant. This is the one place someone will reflexively type
  `transition: color 120ms` — `CLAUDE.md` forbids it unconditionally.

**One step-04 rule must change.** `.archive-row:first-child { border-top: 0 }` uses DOM position, which
filtering breaks: filter to `energy` and the only match (`eletron-energia`, 4th in the DOM) draws a
top border with nothing above it. Replace the pair with a sibling-based rule so the separator depends
on what is *visible*:

```css
.archive-row { border-top: 0; }
.archive-row:not([hidden]) ~ .archive-row:not([hidden]) {
  border-top: var(--hairline) solid var(--color-line);
}
```

This also removes the need for a special case once the overflow row joins the main `<ul>`.

---

## Files

| File | Action |
|---|---|
| `src/components/Archive.astro` | edit — filter bar, live count, empty state, the `<script>` |
| `src/components/ArchiveRow.astro` | edit — add `data-tags` |
| `src/layouts/Base.astro` | edit — one `is:inline` head script setting the `js` class |
| `src/styles/type.css` | edit — `.filter-bar`, `.filter-count`, `[aria-pressed]`, the row-border fix |
| `src/styles/tokens.css` | **untouched** — no token value changes |
| `src/content/**` | **untouched** — no content changes, no `[FILL]` resolved |
| `src/components/Changelog.astro` | **untouched** — step 05 is the archive filter; the changelog renders no `<details>` today (2 entries, cap 3) |

---

## Verification

```bash
pnpm build && pnpm check
```

```bash
grep -c "aria-pressed" dist/index.html    # 6
grep -c "data-tags"    dist/index.html    # 7
grep -rn "gsap\|lenis" src/               # nothing — step 07 installs these, not step 05
```

- **JS disabled** (devtools → disable JavaScript, reload `pnpm preview`): filter bar and count line
  absent, all 7 entries reachable, `<details>`/`<summary>` still expands.
- **Keyboard:** Tab into the bar, Enter and Space both toggle, focus outline visible on all six
  buttons and on show-all, focus never jumps after a click.
- **`aria-pressed`:** inspect after each click — exactly one `true`, five `false`.
- **Cap behaviour:** press `code` → 4 rows (including `brasilore`, which was behind show-all), show-all
  gone. Press `All` → 6 rows, show-all back. Expand, press `teaching`, press `All` → still expanded.
- **Row borders:** filter to `energy` (one match, 4th in DOM) — no stray top border above it.
- **375 / 768 / 1280px:** filter bar wraps, no horizontal scroll.
- **Scroll guard:** put show-all mid-viewport, collapse it, confirm the button stays put rather than
  the page jumping.
- **Rapid clicking** across all six buttons leaves no row stranded. Free here (no timers, no
  animation) but confirm anyway — it is a step 11 acceptance box.

### Step 05 acceptance checklist

- [ ] fully operable by keyboard, visible focus on every control
- [ ] `aria-pressed` reflects state
- [ ] with JS disabled all entries are visible and the filter controls are absent or inert
- [ ] filtering causes no horizontal scroll at any width
- [ ] `pnpm build` succeeds

---

## Close-out

Per `CLAUDE.md`, when step 05 is implemented: run the checklist, `pnpm build`, mark 05 `done` in
`docs/progress.md`, commit `step 05: archive filter, without GSAP`, push, stop.

**Divergences to log:** JS unwraps the `<details>` into a flat `<ul>` plus a real `<button>` so step
11's Flip sees one parent; a `js` class on `<html>` gates control visibility; step 04's
`.archive-row:first-child` border rule replaced with a `:not([hidden]) ~ :not([hidden])` rule so
separators follow visible order rather than DOM order.

**Notes for future sessions:** all filter DOM mutation lives in one `applyState()` in `Archive.astro`
— step 11 wraps that one call, it does not rewrite the module. The scroll guard uses
`window.scrollBy` and must be rerouted through Lenis in step 07. Tailwind v4 preflight already ships
`[hidden]{display:none!important}`, so the `hidden` attribute beats a class-level `display` — no
per-component rule needed.

**Open questions unchanged:** the 9 archive + 2 changelog `[FILL]`s, the Braille word,
WhatsApp-or-email, and the `--graphite-2` contrast finding. Step 05 touches no content.

---

## What this session does

Write the above to `docs/plans/step-05.md`, then implement step 05 against it and run the close-out.
