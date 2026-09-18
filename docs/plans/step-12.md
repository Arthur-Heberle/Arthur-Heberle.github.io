# Step 12 — Hero sequence

## Context

`docs/progress.md` has steps 01–11 done; step 12 is the first one not marked done, and
`CLAUDE.md`'s workflow says do that one step only.

Step 12 builds the one self-playing moment on the site: the hero set-piece
(`design-spec.md` §9, `implementation-plan.md:246`, `motion-spec.md:196`). Under 1.6s
total, once per session, non-blocking.

What exists today: a fully static hero (`Hero.astro` — name line, contact link, identity
line, display `<h1>`, supporting line; **no `data-anim`**, so the hero currently gets no
motion at all), and a scrubbed page rule that at scroll position 0 is **completely
undrawn** — `tier1Rule()`'s `fromTo` starts at `strokeDashoffset: 100`, so the first
screen has no drawing on it whatsoever.

What §9 asks for and does not exist: *"The origin marks and the first construction lines
of the drawing assemble, the display line arrives per word, the rule begins its
descent."*

Three decisions were put to Arthur this session and settled before this plan was written:

1. **Hero drawing form:** origin mark + datum line + vertical lead (all three, option A).
2. **Below 768px:** the drawing is hidden (forced — see below), but the display line
   still arrives per word.
3. **Flash guard:** yes, via the existing inline `<head>` script, with a failsafe.

---

## Why the drawing is permanently visible

`motion-spec.md`'s initial-state pattern and `design-spec.md` §8's no-JS contract require
markup to ship every SVG in its **final** state. A "final state" that is invisible is a
contradiction, so the origin mark, datum line and lead are permanent page furniture from
the moment they exist. The sequence animates them in once per session; on every later
visit and for every no-JS visitor they are simply there, already drawn. This is a real
change to the first screen and is the reason it was put to Arthur rather than decided
here.

Authorised by `design-spec.md` §9 (the hero set-piece names these elements), so it does
not breach `CLAUDE.md`'s "never add a section, page or feature" rule. All three strokes
are `--color-line` (construction lines), so the `--signal` budget of ~8 appearances is
untouched.

---

## Geometry

```
page-main top edge
+─────────────────────────────────────┬
^ origin mark          datum line     │ vertical lead
                                      │
  Arthur Gabriel Pellegrini Heberle   │   a.gp.heberle@…
  Curitiba Brasil   EU citizen        │
                                      │
  I make technical things make        │
  sense to people who didn't          │
  build them.                         │
                                      │
  Computer engineering at UTFPR…      │
─────────────────────────────────────-┼─  (Spine's first tick)
                                      │  ← the scrubbed rule continues from here
```

The lead sits at exactly the same x as `.rule-svg` and is the same 1px `--color-line`
stroke, so when the scrubbed rule later draws down through the hero the two coincide
pixel-for-pixel. **Nothing in `tier1Rule()`, `tipScrollFor()`, `tier1Ticks()` or
`tier1Leaders()` is touched** — step 09/10's verified tip-sync geometry stays exactly as
it is. The lead's bottom edge lands on the Spine's first tick (`top: -4px` of the first
`<section>`), so the drawing reads as continuous.

**Below 768px the drawing must be hidden**, not by preference: `.rule-svg` moves to
`left: 0` there and the content origin is also x=0, so the datum line would have zero
length. `.tick` and `.leader` are already `display: none` at that width for the same
family of reasons (`design-spec.md` §8: "the drawing layer keeps the scrubbed rule only").

---

## The three SVGs

Each box uses a shape this codebase has already verified, rather than a new one:

| Element | Box | Technique | Precedent |
|---|---|---|---|
| `.origin` | `viewBox="0 0 12 12"`, `width: 12px; aspect-ratio: 1` | **DrawSVGPlugin**, `drawSVG: '50% 50%'` so each stroke grows out of its own centre | `.tick` — a literal px width with `aspect-ratio: 1` forces `width === height` in rendered pixels, so `scaleX === scaleY` exactly and `DrawSVGPlugin.js:146` cannot warn |
| `.datum` | `viewBox="0 0 100 1"`, `preserveAspectRatio="none"`, `d="M0 0.5 H100"`, `vector-effect="non-scaling-stroke"` | **hand-tweened** `strokeDasharray`/`strokeDashoffset` against the known fixed length 100 | `#rule path` — non-proportional box, so DrawSVGPlugin must be bypassed (`progress.md`, step 09) |
| `.lead` | `viewBox="0 0 1 100"`, `preserveAspectRatio="none"`, `d="M0.5 0 V100"`, `vector-effect="non-scaling-stroke"` | same as `.datum` | identical to `Rule.astro` |

Both non-proportional paths have length exactly 100 user units by construction, so like
the rule they need no `getTotalLength()` call and no hardcoded transcription. All three
carry `aria-hidden="true"` and `pointer-events: none`; all three ship **fully drawn**.

`strokeDashoffset: 100 → 0` on `M0 0.5 H100` reveals start→end, i.e. left→right; on
`M0.5 0 V100` it reveals top→bottom. Same direction logic as the rule.

CSS positioning (`type.css`), inside a `<header class="relative">`:

- `.origin` — `left: -6px; top: -6px` (a 12px box centred on the header's own origin).
  Overflows `page-main` by 6px; at ≥768px `page-main` is `min(100% - 3rem, …)` so there
  is at least 24px of room each side. Verify at 768px exactly.
- `.datum` — `top: 0; left: 0; height: 1px;` and
  `width: min(var(--container-measure), calc(100% - var(--spacing-gutter) - var(--container-margin)))`
  — `.rule-svg`'s own `left` formula unchanged, so the line always terminates exactly
  where the rule stands, at every width.
- `.lead` — `inset-block: 0; width: 1px;` and the same `left` formula.
- All three `display: none` under `@media (max-width: 767px)`.

At ≥768px `.page-main` has no horizontal padding, so the header's content box and
`page-main`'s padding box (which `.rule-svg` positions against) are identical — that is
what makes the shared formula line up. Confirm in-browser rather than trusting the
arithmetic.

---

## The timeline

`motion-spec.md:36` allows two durations and one curve. This sequence uses **one duration
(0.6s, `--dur-reveal`) and one curve (`EASE_OUT`, already exported from `motion.ts`)** for
every part of it — overlap, not new durations, does the choreography. No third value is
introduced.

The display line is 12 words. At the spec's 60ms sibling stagger and 600ms reveal that is
1.26s of word arrival on its own, which sets the whole budget:

| t | element | duration |
|---|---|---|
| 0.00 | `.origin` — 2 strokes, `drawSVG: '50% 50%'`, stagger 0.06 | 0.6 |
| 0.18 | `.datum` — `strokeDashoffset` 100 → 0 | 0.6 |
| 0.36 | `.lead` — `strokeDashoffset` 100 → 0 | 0.6 |
| 0.30 | display words — `gsap.from(words, { y: 16, opacity: 0, stagger: 0.06 })` | 0.6 |

Last word starts at `0.30 + 11 × 0.06 = 0.96` and ends at **1.56s** — under the 1.6s
ceiling with 40ms of headroom. Below 768px only the word row runs, starting at t=0
(0.00–1.26s).

Only `transform`, `opacity` and `stroke-dashoffset` are tweened, per `CLAUDE.md`.

Give the timeline `gsap.timeline({ id: 'hero' })` so `gsap.getById('hero').totalDuration()`
is directly measurable in-browser — that is how the ≤1.6s acceptance box gets checked
rather than estimated.

The name line, contact link, identity line and supporting line are **not** animated:
`implementation-plan.md:253` forbids delaying the contact link, and nothing in §9 asks
for them.

### SplitText

`SplitText.create(display, { type: 'words', tag: 'span', aria: 'auto' })`.

- **Words, never characters** — `motion-spec.md:208`, and per-character is on
  `CLAUDE.md`'s rejected-aesthetic list.
- `aria: 'auto'` (the 3.15 default, confirmed at `SplitText.js:213`) puts the full text in
  an `aria-label` on the `<h1>` and `aria-hidden="true"` on each word wrapper, so the
  heading reads correctly to a screen reader throughout.
- `tag: 'span'` because SplitText's default wrapper is a `<div>` (`SplitText.js:45`) and
  a `<div>` inside an `<h1>` is invalid — `<h1>` takes phrasing content. **Verify the
  option name is read from the top-level vars in the installed `gsap@3.15.0`**, don't
  assume; check `SplitText.js` before relying on it.
- `split.revert()` in the timeline's `onComplete` restores the original markup, so the
  split spans do not survive into the rest of the session.
- Only `lines` splitting needs the font-load re-split (`SplitText.js:283`,
  `autoSplit`/`loadingdone`), so `autoSplit` is not needed here. Both display-critical
  faces are already preloaded (`Base.astro`, step 06).

---

## The flash guard

`motion.ts` is a deferred module script, so the browser can paint the hero before GSAP
sets the words to `opacity: 0` — text appears, vanishes, then animates in.

`Base.astro`'s existing `is:inline` head script (whose own comment already says "reused
by steps 07–13") gains:

```js
try {
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches &&
      sessionStorage.getItem('hero-played') !== '1') {
    var r = document.documentElement
    r.classList.add('hero-pending')
    setTimeout(function () { r.classList.remove('hero-pending') }, 1500)
  }
} catch (e) {}
```

No element check — the head script runs before `<body>` is parsed, so
`querySelector('[data-hero-display]')` would always return `null` there. The class on
`/type-test` is harmless because the CSS is
`.hero-pending [data-hero-display] { opacity: 0 }` and only the home page's `<h1>`
carries that attribute. No width check is needed: the word arrival runs at both widths.

The 1500ms failsafe is what keeps the acceptance box *"with the sequence force-disabled,
the first screen is still correct and complete"* true even if GSAP never loads.

`motion.ts` removes the class itself in **every** path — after `gsap.set()` has put the
words at their initial state (synchronously, so no paint happens in between), and
immediately in the skip paths (already played, reduced motion, element missing).

---

## Session guard and rebuild safety

```js
if (!sessionStorage.getItem('hero-played')) { /* … */ sessionStorage.setItem('hero-played', '1') }
```

wrapped in `try/catch` — `sessionStorage` throws in some privacy modes, and a throw must
not take the page's motion down with it. A module-level `heroPlayed` boolean mirrors the
flag so the guard still works if storage is unavailable, and is set **at timeline
creation**, not on completion.

This matters for the same reason `data-anim-played` does (`progress.md`, step 08):
`gsap.matchMedia()` reverts and rebuilds a branch whenever its query stops or starts
matching — crossing 768px, or toggling reduced motion mid-session — and without the flag
the hero would replay. `once`-style options are scoped to a branch's lifetime, not the
page session.

A module-level reference to the `SplitText` instance lets any branch call
`heroSplit?.revert()` before doing anything else, so a branch swap mid-flight cannot
leave the `<h1>` stranded as split spans. The timeline itself is created inside the
matchMedia callback and so is captured by that branch's Context and reverted with it.

---

## Files

| File | Action |
|---|---|
| `src/components/HeroDrawing.astro` | **new** — the three SVGs, `aria-hidden`, shipped fully drawn |
| `src/components/Hero.astro` | edit — `relative` on the `<header>`, render `<HeroDrawing />`, add `data-hero-display` to the `<h1>` |
| `src/styles/type.css` | edit — `.origin`/`.datum`/`.lead` positioning, the `<768px` rule, `.hero-pending [data-hero-display]` |
| `src/layouts/Base.astro` | edit — head script gains the `hero-pending` opt-in + failsafe |
| `src/scripts/motion.ts` | edit — `heroSequence(drawing)`, session guard, wired into all three `mm.add` branches |
| `docs/plans/step-12.md` | **new** — this plan, per the steps 04/06/09/10/11 convention |
| `docs/progress.md` | edit — mark step 12 done, log any divergence |
| `src/styles/tokens.css` | **untouched** — no token change |
| `src/content/**` | **untouched** — no `[FILL]` resolved |
| `tier1Rule`, `tipScrollFor`, `tier1Ticks`, `tier1Leaders`, `flipFilter`, `crossfadeFilter` | **untouched** |

---

## Verification

`pnpm build` must pass, then `pnpm preview` and a real browser (`claude-in-chrome`) — not
reasoning from the source. Against step 12's acceptance checklist:

1. **≤1.6s total.** `gsap.getById('hero').totalDuration()` in the console, expected
   `1.56`. Read it after a **real** `computer` interaction — `progress.md` logs that a
   `javascript_tool`-only sequence leaves the tab `document.hidden`, rAF frozen, and GSAP
   state misleading.
2. **Second navigation skips it.** Navigate to `/type-test` and back in the same tab,
   confirm `gsap.getById('hero')` is `undefined`, the `<h1>` is fully visible with no
   split spans, and the drawing is fully drawn.
3. **Force-disabled.** `grep` the built `dist/index.html` for the `<h1>` text and all
   three SVG `d` attributes, and confirm no `opacity: 0` / hiding style lands on any of
   them — the only rule that hides anything is class-gated behind `.hero-pending`.
   Confirm the 1500ms failsafe by blocking the `motion.*.js` request and watching the
   `<h1>` appear.
4. **No CLS.** A clean Lighthouse mobile run, `CHROME_PATH` set to the Playwright
   Chromium (`progress.md`'s note). Expect CLS ~0.0003 and performance ≥95, matching step
   11's baseline. Close the automation tab and check for leftover `serve`/`chrome-launcher`
   processes first — `progress.md` logs repeatedly that TBT/perf is noisy locally while
   **CLS is the trustworthy signal**. The absolute positioning and the
   `viewBox`+`aspect-ratio` on all three SVGs is what this box is testing.
5. **Reduced motion skips it entirely.** The `claude-in-chrome` extension cannot drive
   DevTools' Rendering panel (logged in `progress.md`), so this is **code review only**,
   as steps 08 and 11 were, and gets added to the same manual DevTools check already
   queued for step 14. Confirm by review: the `reduce` branch never builds the timeline,
   removes `hero-pending`, reverts any split, and adds `.origin path, .datum path, .lead path`
   to the existing `clearProps` selector so a mid-session toggle snaps them to drawn.

Plus `motion-spec.md:222`'s standing checklist and the project's own floors:

- Clean console — in particular **no DrawSVGPlugin "length cannot be measured" warning**.
  If `.origin` produces one, it goes to the hand-tweened dasharray technique like the
  other two; check `getScreenCTM()` live rather than re-deriving from the viewBox math
  (`progress.md`, step 10's correction).
- 375px via the same-origin `dist/_iframe-test.html` technique (step 11's note — a
  second-port iframe does not receive real input): drawing absent, words still arriving.
- 768px exactly: the datum's right end meets the lead, and `.origin` is not clipped.
- Keyboard: tab order and focus ring unchanged (nothing new is interactive).
- Total JS gzip still under 90KB — currently ~67KB, and `SplitText` is already in the
  bundle (registered since step 07), so growth should be a few hundred bytes at most.
  Sum `gzip -c` per `dist/_astro/*.js` file.

## Stop and ask if

- The origin mark or datum line reads as clutter on the real first screen rather than as
  a drawing datum — that is a design judgement, not a technical one, and it is Arthur's.
- The 1.6s ceiling cannot be met without dropping below the spec's 60ms stagger or 600ms
  reveal.
