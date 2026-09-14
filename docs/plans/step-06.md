# Step 06 — Accessibility and performance gate

## Context

Step 05 is committed (`7e5a2ab`) and `docs/progress.md` marks it `done`. Step 06 is the first
step not done.

Objective from `docs/implementation-plan.md`: *"Lock in the floor before motion can erode it.
This gate is why motion comes later."* Steps 07–13 add GSAP, Lenis, scrubbed drawing and a
pinned set-piece. Every one of those can cost a Lighthouse point, shift layout or strand
focus. If the floor isn't provably at 95+ *now*, there is no way to tell later whether motion
broke it or it was never there.

**No GSAP, no Lenis.** Step 07 is the first step allowed to install them.

This step is mostly **audit**, not construction. The site already ships a skip link, correct
`aria-hidden` on both SVG types, real `<button>`s with `aria-pressed`, and a `:focus-visible`
rule. Three things actually change, all three decided with Arthur this session.

---

## What already exists (audit, don't rebuild)

- `src/layouts/Base.astro` — skip link (`.skip` → `#main`), `is:inline` `js`-class script,
  display-face preload, `lang="en"`, charset, viewport. No `<link rel="icon">`.
- `src/components/Rule.astro` — `#rule`, `viewBox="0 0 1 100"`, `aria-hidden="true"`.
- `src/components/MarginNote.astro` — `.leader` ×5, `viewBox="0 0 32 24"`,
  `aria-hidden="true"`, `aspect-ratio: 4 / 3` in CSS.
- `src/styles/tokens.css` — `:focus-visible { outline: var(--hairline) solid var(--color-signal);
  outline-offset: 3px }` and the `prefers-reduced-motion` transition kill.
- `src/styles/type.css` — `.skip` off-screen via `translateY(-100%)`, revealed on `:focus`
  (not `:focus-visible`, deliberately).

---

## Measured before planning, not assumed

### Contrast, computed from the token hexes

| pair | ratio | AA (4.5) | spec floor |
|---|---|---|---|
| `--graphite` on `--ground` | 12.80 | ✅ | §10 wants 7:1 ✅ |
| `--signal` on `--ground` | 5.51 | ✅ | §10 wants 4.5 ✅ |
| `--graphite-2` on `--sheet` | 4.66 | ✅ | |
| **`--graphite-2` on `--ground`** | **4.21** | ❌ | the whole problem |
| `--line` on `--ground` | 1.43 | n/a | decorative, `aria-hidden` |

`--graphite-2` sits on `--ground` in **eight** places, not just margin notes: hero email link,
hero identity line, five spine `.marker`s, margin-note bodies and back-links, `.filter-count`,
`[data-empty]`, changelog dates, and `.fill` spans in Contact and Changelog. Only
`ArchiveRow`'s metadata sits on `bg-sheet` and passes.

axe's `color-contrast` is a single audit at weight 7 — one failing element fails it and drops
the accessibility category well below 95.

### Page weight, from the current `dist/`

| asset | bytes |
|---|---|
| `index.html` (module script is inlined, no separate `.js`) | 15,111 |
| `_astro/Base.*.css` | 15,041 |
| 4 × woff2 | 58,824 |
| **total** | **88,976 ≈ 87KB** |

Comfortably under the 200KB box. Re-measure after the build rather than trusting this.

---

## Decisions taken with Arthur this session

1. **Darken `--graphite-2` to `#666a6f`.** 5% down the same hue ramp: **4.59:1** on `--ground`,
   5.07:1 on `--sheet`. The smallest move that clears AA, and it fixes all eight sites at once.
   `--graphite` stays 12.80, so the primary/secondary separation is untouched and §10's "margin
   notes visible at low contrast by default" still holds. *Rejected:* moving notes to `--sheet`
   (fixes 1 of 8, and scattering barely-visible panels across the page to fix the other 7 is a
   far bigger design change); accepting the finding (ships the gate already below its own floor).
2. **Focus ring to 2px.** `outline: 2px solid var(--color-signal)`, offset unchanged at 3px.
   **`--hairline` is not touched** — every other hairline on the page stays 0.5px. Focus reads
   as a deliberate mark rather than a construction line. Not an AA requirement (thickness is
   WCAG 2.2 AAA) and Lighthouse won't test it, but "focus styles audited" is in the step's Do
   list and a 0.5px sub-pixel ring is a weak answer to it.
3. **Lighthouse via ephemeral `npx` driving Edge.** No Chrome and no browser MCP on this
   machine; Edge is at `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`. `npx
   --yes lighthouse` resolves into the npx cache and never reaches `package.json`, so
   `CLAUDE.md`'s no-new-libraries rule stays intact. Reports go to the scratchpad, not the repo.

---

## Changes

### 1. `src/styles/tokens.css` — two edits

```css
--color-graphite-2: #666a6f;  /* secondary text, annotations, metadata */
```

```css
/* Focus must always be visible. Do not remove this without a replacement. */
:focus-visible {
  outline: 2px solid var(--color-signal);
  outline-offset: 3px;
}
```

This is the **first authorised token-value change** in the project. `CLAUDE.md` forbids one
unasked; it was asked and answered this session. Log it loudly in `progress.md`.

`--hairline: 0.5px` stays exactly as it is.

### 2. `docs/design-spec.md:131` — keep the spec in sync

```css
--graphite-2:#666A6F;  /* secondary text, annotations, metadata */
```

Uppercase to match that block's own convention. A spec that silently stops matching the code is
worse than no spec.

**No edit needed to `src/pages/type-test.astro`.** Its contrast table is computed at build time
by regex over `tokens.css?raw` (step 02), so it re-derives the new ratio on its own. Use it as
the in-browser confirmation that the number really moved.

### 3. `src/pages/index.astro` and `src/pages/type-test.astro` — one attribute

```html
<main id="main" tabindex="-1" class="page-main">
```

A fragment link to a non-focusable element moves the sequential-navigation point in Chromium and
Firefox but has historically not moved *focus* in Safari, so the next Tab can land back at the
top. `tabindex="-1"` makes the skip link actually skip in every browser. Invisible: the ring is
`:focus-visible`-gated, so programmatic focus paints nothing.

### 4. SVG accessibility — **audited, nothing to change**

Both SVG types on the page are construction lines with no informational content, and
`design-spec.md` §10 says purely decorative construction lines get `aria-hidden="true"`. Both
already carry it. The real marker↔note relationships exist as real `<a href="#…">` links in the
markup, which is why the drawing carries no semantics of its own.

**There is no meaningful SVG on the site yet.** The first `role="img"` + `<title>` + `<desc>`
arrives with the EduBra set-piece in step 13. Record this as *audited and correct*, not as a
box skipped — and note it in `progress.md` so step 13 knows the obligation starts with it.

### 5. CLS — conditional, measure before touching

Four faces ship with `font-display: swap` and only the display face is preloaded, so the other
three (Archivo 400, Archivo 500, IBM Plex Mono) can reflow text after first paint. That is the
one real threat to the "zero CLS" box.

**Measure first.** If Lighthouse reports CLS > 0, fix in this order, stopping as soon as it
reaches 0:

1. Preload `archivo-400-latin.woff2` — the body face, carrying most of the page's text.
   Same-origin, 14.7KB, keeps the total near 89KB.
2. Preload `ibm-plex-mono-400-latin.woff2` as well.

Both diverge from `design-spec.md` §5's "Preload the display face only" — a line written before
self-hosting was chosen in step 02. §10's "no layout shift" is the higher constraint and this is
the gate step for it, so the divergence is the right call, but it gets logged.

**Do not** switch to `font-display: optional` (first-time visitors may never see Archivo at all)
and **do not** edit `--font-sans`'s stack to insert a metrics-matched fallback family — that is
a token change and it wasn't asked for.

---

## Running Lighthouse

```bash
pnpm build
pnpm preview          # http://localhost:4321
```

In a second shell:

```bash
CHROME_PATH="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" \
npx --yes lighthouse http://localhost:4321/ \
  --form-factor=mobile --screenEmulation.mobile \
  --only-categories=performance,accessibility,best-practices \
  --chrome-flags="--headless=new" \
  --output=json --output=html --output-path=<scratchpad>/lh
```

- `/` only. `/type-test` is `noindex`, is deleted in step 14, and is not what the gate is about.
- Reports land in the session scratchpad. Nothing generated by the audit enters the repo.
- Re-run after every fix; contrast and CLS changes both move scores.
- Optional cross-check once pushed: `pagespeed.web.dev` against the live URL, which is already
  serving this exact build (confirmed: `Content-Length: 15111` matches `dist/index.html`).

---

## Manual audits Lighthouse cannot do

**Heading order, one `h1`.** Expected on `/`: one `<h1>` (the hero display line), three `<h2>`
(Archive, Changelog, Contact), one `<h3>` per archive row. The Spine has no heading by design —
it's `<section aria-label="About">`. Confirm against the built HTML:

```bash
grep -o "<h1" dist/index.html | wc -l   # 1
grep -o "<h2" dist/index.html | wc -l   # 3
grep -o "<h3" dist/index.html | wc -l   # 7
```

`grep -c` undercounts here — Astro emits `dist/*.html` as one line (step 04's note).

**Tab order matches visual order.** Walk it with Tab:

skip link → hero email → marker 1 → note-1 back-link → marker 2 → note-2 back-link →
markers 3, 4, 5 → note-3/4/5 back-links → 6 filter buttons → archive row `repo`/`live`/`pdf`
links → show-all → contact email.

The rail puts prose in the DOM before its margin column, and the margin column renders to the
*right* of the prose, so DOM order and left-to-right visual order agree at ≥768px. Below 768px
the rail stacks prose-then-margin in source order, so they agree there too. Check both widths
with the iframe technique from step 04's notes — `resize_window` does not work in this sandbox.

**Focus visible on everything interactive**, at the new 2px: skip link, both email links, all
ten markers/back-links, six filter buttons, show-all, every archive row link. Confirm no ring is
clipped — `html, body { overflow-x: hidden }` is live, and `.page-main` keeps ≥1.5rem of side
room at desktop and 1rem at mobile against a 5px ring.

**Page weight** after the build: sum `dist/index.html` + `dist/_astro/*.css` + the four woff2
files actually used by `/`. Must stay under 200KB.

---

## Files

| File | Action |
|---|---|
| `docs/plans/step-06.md` | new — this document |
| `src/styles/tokens.css` | edit — `--color-graphite-2` → `#666a6f`; `:focus-visible` outline → 2px |
| `docs/design-spec.md` | edit — line 131 hex, so the spec matches the token |
| `src/pages/index.astro` | edit — `tabindex="-1"` on `<main>` |
| `src/pages/type-test.astro` | edit — same, for consistency until step 14 deletes it |
| `src/layouts/Base.astro` | **conditional** — a second font preload, only if CLS > 0 |
| `src/components/Rule.astro`, `MarginNote.astro` | **untouched** — audited, `aria-hidden` already correct |
| `src/content/**` | **untouched** — no `[FILL]` resolved this step |
| `package.json` | **untouched** — Lighthouse runs through `npx`, never enters the manifest |

---

## Verification

```bash
pnpm build && pnpm check
```

```bash
grep -rn "6b7075\|6B7075" src/ docs/            # nothing left
grep -rn "gsap\|lenis" src/ package.json        # nothing — step 07 installs these
grep -o "aria-hidden" dist/index.html | wc -l   # 6 — the rule + 5 leader lines
```

- `/type-test` §3 colour table now reports `--graphite-2` on `--ground` at **4.59**, computed
  from the token rather than hard-coded.
- **JS disabled:** page unchanged from step 05 — filter bar absent, `<details>` still expands.
- Keyboard walk of the full tab order at 375px and 1280px.
- Lighthouse mobile on `/`.

### Step 06 acceptance checklist

- [ ] Lighthouse performance, accessibility, best practices all 95+
- [ ] zero CLS
- [ ] heading order valid, one `h1`
- [ ] tab order matches visual order
- [ ] page weight under 200KB total with fonts
- [ ] `pnpm build` succeeds

**Stop and ask if** any score is still below 95 after the contrast fix and the fix would require
changing the design. The step says so explicitly, and the one foreseeable trigger — the
`--graphite-2` finding — is already resolved above.

---

## Close-out

Per `CLAUDE.md`: run the checklist, `pnpm build`, mark 06 `done` in `docs/progress.md`, commit
`step 06: accessibility and performance gate`, push, stop.

**Divergences to log:**
- `--color-graphite-2` changed `#6b7075` → `#666a6f`, the first authorised token-value change in
  the project, to clear the 4.5:1 AA floor on `--ground` (4.21 → 4.59). `docs/design-spec.md`
  §5 updated to match.
- `:focus-visible` outline widened from `var(--hairline)` (0.5px) to a literal 2px.
  `--hairline` itself unchanged; every other hairline on the page is still 0.5px.
- `tabindex="-1"` added to both `<main>` elements so the skip link moves focus in Safari, not
  only the sequential-navigation point.
- *(conditional)* a second font preload against §5's "preload the display face only", if and
  only if CLS measured non-zero.

**`progress.md` open questions:** tick the `--graphite-2` contrast item with the decision and
the new ratio. The 11 `[FILL]`s, the Braille word and WhatsApp-or-email are untouched — step 06
changes no content.

**Notes for future sessions:**
- No browser MCP and no Chrome on this machine. Lighthouse runs via
  `CHROME_PATH=<Edge> npx --yes lighthouse`, ephemeral, never in `package.json`.
- `/type-test`'s colour table derives its ratios from `tokens.css` at build time, so it is the
  cheapest way to confirm a contrast change actually landed.
- Every SVG on the site is decorative and `aria-hidden` as of step 06. Step 13's EduBra
  set-piece ships the first meaningful one and owes it `role="img"` + `<title>` + `<desc>`.
- `Base.astro` still has no `<link rel="icon">`; the browser falls back to `/favicon.ico`, which
  exists and returns 200, so it is not a gate failure. Left alone — adding one is Arthur's call.

---

## Implementation order

1. Write `docs/plans/step-06.md`.
2. Token edits (`tokens.css`), spec sync (`design-spec.md`), `tabindex="-1"` on both `<main>`s.
3. `pnpm build && pnpm check`.
4. `pnpm preview`, run Lighthouse mobile, capture scores.
5. If CLS > 0, add the body-face preload and re-run. If any score < 95 for a reason not covered
   above, stop and report rather than improvising.
6. Manual audits: heading counts, tab order at two widths, focus visibility, page weight.
7. Update `progress.md` (status, divergences, open question, notes), commit, push, stop.
