# Step 02 — Tokens, type and layout primitives

## Context

`docs/progress.md` has step 01 `done` and step 02 `todo`. The repo is a working Astro 7.3.2
+ Tailwind v4.3.3 site deployed to Pages, but visually it is nothing: `src/pages/index.astro`
is an unstyled `<h1>`, and `src/styles/global.css` is a single `@import "tailwindcss"` line.

`src/styles/tokens.css` has existed since the initial commit and **has never been imported**.
Step 01 deliberately left it alone and routed Tailwind through `global.css` instead, so every
value in it — the `@theme` block, the palette, the scale, the base rules — is currently
unverified. Nothing has compiled it.

Step 02's objective is that the visual system exists and is *provably* correct before any page
uses it. The deliverable is the token pipeline wired up, three fonts loading, and a temporary
`/type-test` route that demonstrates each acceptance item rather than asserting it. `/type-test`
is deleted in step 14, not before.

Three decisions were put to Arthur before writing this and are settled: self-host four static
woff2 files; reset Tailwind's default `--color-*` / `--font-*` / `--text-*` namespaces inside
`@theme`; keep "layout primitives" scoped to what the step's Do list and acceptance name, leaving
the spine + margin grid to step 04.

---

## What research changed

Four things were checked against live sources rather than memory, and two of them change the
approach materially.

**1. `"Archivo Expanded"` is not a Google Fonts family.** `css2?family=Archivo+Expanded` returns
HTTP 400. Archivo is one variable family with a `wdth` axis (`font-stretch: 62% 125%`). But
`--font-display` in `tokens.css` names `"Archivo Expanded"` first, and that token must not change.
Resolved by declaring a local `@font-face` under exactly that family name — the token stays
untouched and resolves to a real face.

**2. Google serves pinned static instances, which is the cheap way to get Expanded.** Measured,
latin subset:

| Request | Bytes |
|---|---|
| `Archivo:wght@400` | 14,700 |
| `Archivo:wght@500` | 14,600 |
| `Archivo:wdth,wght@125,500` | 14,816 |
| `IBM+Plex+Mono:wght@400` | 14,708 |
| **four static files, total** | **58,824** |
| `Archivo:wdth,wght@62..125,100..900` (two-axis variable, for comparison) | 90,104 |

The two-axis variable file alone is 90KB against step 06's 200KB total page budget. Four static
instances cost 59KB, need no `font-stretch` axis-clamping behaviour, and give a stable preload URL.

**3. Tailwind v4 keeps its whole default theme reachable** unless a namespace is set to `initial`.
Only *used* variables are emitted to `:root`, so `dist` stays clean by default — but `text-gray-500`
and `font-serif` still compile, which makes step 02's "no gray outside the token list" rule a matter
of review rather than of build. The reset makes it structural.

**4. Contrast, computed from the actual token hex values:**

| | on `--ground` | on `--sheet` |
|---|---|---|
| `--graphite` | **12.80** | 14.15 |
| `--graphite-2` | **4.21** | 4.66 |
| `--signal` | **5.51** | 6.09 |
| `--measure` | 4.67 | 5.16 |
| `--line` | 1.43 | 1.58 |

Both acceptance thresholds pass comfortably: body 12.80 ≥ 7, signal 5.51 ≥ 4.5.

**`--graphite-2` on `--ground` is 4.21:1, under the 4.5 AA floor for normal text.** It is not in
step 02's acceptance and it is a token, so it is not being changed here. It is the colour of margin
notes and metadata, which step 06 puts through Lighthouse. Surfaced now, flagged in `progress.md`,
decision deferred to Arthur — see *Surfaced, not fixed* below.

---

## Approach

### 1. CSS entry, without importing Tailwind twice

`tokens.css` line 11 already carries its own `@import "tailwindcss"`. `global.css` carries a second
one. Importing both would inline Tailwind twice. Fix by making `global.css` a pure manifest that
imports Tailwind only *through* `tokens.css`:

```css
/* src/styles/global.css — the single entry. Tailwind arrives via tokens.css. */
@import "./tokens.css";
@import "./fonts.css";
@import "./type.css";
```

Zero edits to `tokens.css` for this, and Tailwind is inlined exactly once. `@font-face` and the type
layer land after Preflight, which is what we want.

**Risk to verify, not assume:** `@theme` living inside an `@import`ed file rather than the entry.
Tailwind flattens the import graph first, so it should work, but this has never compiled in this
repo. First build check is that `dist/_astro/*.css` contains `--color-ground` and a working
`text-body` utility. If it does not, `@import "tailwindcss"` moves up into `global.css` and comes
out of `tokens.css` — logged as a divergence.

### 2. `tokens.css` — three authorised lines, no value changes

At the top of the existing `@theme` block, above `--color-ground`:

```css
@theme {
  --color-*: initial;
  --font-*: initial;
  --text-*: initial;

  /* ...every existing token, byte-identical... */
```

After this, `text-gray-500`, `font-serif` and `text-2xl` do not exist as utilities. Nothing else in
the file is touched. `--spacing-*` is deliberately **not** reset, so Tailwind's numeric spacing scale
(`p-4`, `gap-8`) survives alongside `--spacing-gutter`.

Consequence to watch: `--color-transparent` and `--color-current` go away with the reset, so
`bg-transparent` and `text-current` stop compiling. Nothing needs them yet; if step 04 or 05 does,
they get re-added explicitly inside the reset rather than by undoing it.

### 3. Fonts — four files, self-hosted

Fetch from Google Fonts into `public/fonts/`. Record the *query*, not just the URL, because gstatic
paths rotate:

| File | Source query (`fonts.googleapis.com/css2?family=…`), latin subset |
|---|---|
| `archivo-400-latin.woff2` | `Archivo:wght@400` |
| `archivo-500-latin.woff2` | `Archivo:wght@500` |
| `archivo-expanded-500-latin.woff2` | `Archivo:wdth,wght@125,500` |
| `ibm-plex-mono-400-latin.woff2` | `IBM+Plex+Mono:wght@400` |

Requires a modern browser UA on the css2 request, or Google returns legacy TTF. Both families are
OFL 1.1, so self-hosting ships the licence: `public/fonts/OFL.txt`, from `Omnibus-Type/Archivo`
and `IBM/plex`.

`src/styles/fonts.css` — four plain `@font-face` blocks, `font-display: swap` on each:

```css
@font-face {
  font-family: "Archivo";
  src: url("/fonts/archivo-400-latin.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
/* Archivo 500 — same shape.
 * "Archivo Expanded" is not a Google family; it is Archivo at wdth 125. Declared under
 * this exact name so --font-display in tokens.css resolves without being edited. */
@font-face {
  font-family: "Archivo Expanded";
  src: url("/fonts/archivo-expanded-500-latin.woff2") format("woff2");
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}
/* IBM Plex Mono 400 — same shape. */
```

No `font-stretch` descriptor on the Expanded face: the file is already a pinned instance, and a
narrow descriptor range would only risk a match failure for elements requesting normal stretch.

No `unicode-range`: one subset per family, so it would only gate the download. Latin
(U+0000–00FF) covers Portuguese in full — ã, ç, é, ô — so a future PT version needs no second subset.

Preload the display face only, in `<head>`, `crossorigin` mandatory even same-origin:

```html
<link rel="preload" as="font" type="font/woff2" crossorigin
      href="/fonts/archivo-expanded-500-latin.woff2" />
```

### 4. `src/layouts/Base.astro` — new

Both routes need the same head. Minimal: charset, viewport, `<title>` from props, the preload link,
`import '../styles/global.css'`, a `<slot />`. No nav, no footer, no classes on `<body>` — page
structure is step 04.

`index.astro` adopts it and otherwise keeps step 01's content: the name in an `<h1>`, nothing added.
It will now render in Archivo on `--ground`, which is the visible proof the pipeline works.

### 5. `src/styles/type.css` — the primitives

Three classes. `--text-display-mobile` is defined by `tokens.css` **only** inside
`@media (max-width: 767px)`, so a `var()` fallback handles the step-down with no second breakpoint
and no token change — above 768px the variable is undefined and the fallback applies:

```css
.display {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: var(--text-display-mobile, var(--text-display));
  line-height: var(--text-display--line-height);
  letter-spacing: var(--text-display--letter-spacing);
}
.measure  { max-width: var(--container-measure); }   /* 68ch */
.hairline { border: 0; border-top: var(--hairline) solid var(--color-line); }
```

**Contingency:** Tailwind emits only *used* theme variables. If a `var()` reference from our own CSS
does not count as use, `--text-display--line-height` and `--text-display--letter-spacing` will be
missing from `:root` and the display line will silently lose its leading and tracking. Check
`dist/_astro/*.css` for both. If absent, change `@theme` to `@theme static` in `tokens.css` — a
one-word addition, logged as a divergence.

Everything else uses Tailwind utilities generated from the tokens (`text-body`, `text-h2`,
`font-mono`, `text-graphite-2`, `bg-sheet`, `max-w-measure`, `w-margin`, `gap-gutter`). No new class
for anything a token already generates.

### 6. `/type-test` — the proof surface

A temporary route, `<meta name="robots" content="noindex">`, deleted in step 14. It demonstrates
each acceptance item rather than claiming it.

**Contrast table computed at build time.** Astro frontmatter runs at build and ships no JS. Read
`src/styles/tokens.css` with `fs`, regex the `--color-*` declarations, compute WCAG ratios, render
the table. Derived from the tokens, so it cannot drift and no hex value is duplicated into a
component — which also keeps the "no hex outside the token list" rule intact.

Sections:

1. **Scale** — all six steps (display, h2, h3, body, small, dimension), each labelled in mono with
   its spec'd size / leading / tracking.
2. **Expanded proof** — `HAMBURGEFONSTIV` in Archivo 500 and Archivo Expanded 500, same size,
   stacked. The width difference is the visible proof that the `wdth 125` instance loaded rather
   than falling back to normal-width Archivo.
3. **Colour** — `--graphite` and `--graphite-2` on `--ground` and on `--sheet`, each with its
   computed ratio and a pass/fail against 7:1 and 4.5:1.
4. **Hairline** — a 0.5px `--line` rule, and a control block showing 0 radius on a structural
   element beside 2px on a control.
5. **Measure ruler** — a 68ch block of text with a `.measure` cap, and a ruler strip marking 68ch.
6. **Layout tokens** — proof that `max-w-measure`, `w-margin` and `gap-gutter` emit from the
   tokens.

**One inline script, on this route only.** It reads `getComputedStyle` for each sample and stamps
the *actual* px size, line-height and letter-spacing beside the expected value, plus the two
`HAMBURGEFONSTIV` widths. This turns "every scale step renders at the specified size and leading"
from an eyeball check into a measured one. It ships on `/type-test` and nowhere else, and leaves
with the route in step 14. No other page gains JS before step 07.

---

## Files

| File | Action |
|---|---|
| `src/styles/tokens.css` | edit — three `*: initial` reset lines only. **No token value changes.** |
| `src/styles/global.css` | rewrite — three `@import`s, no Tailwind import of its own |
| `src/styles/fonts.css` | new — four `@font-face` |
| `src/styles/type.css` | new — `.display`, `.measure`, `.hairline` |
| `src/layouts/Base.astro` | new — head, preload, global.css, slot |
| `src/pages/index.astro` | edit — adopt `Base.astro`; content unchanged |
| `src/pages/type-test.astro` | new — temporary, `noindex`, deleted step 14 |
| `public/fonts/*.woff2` | new — four files, 58,824 bytes |
| `public/fonts/OFL.txt` | new — OFL 1.1, both families |
| `docs/progress.md` | edit — mark done, divergences, notes |

---

## Verification

```bash
pnpm build      # must succeed, or the step is not done
pnpm preview    # then open /type-test
```

Against `dist/_astro/*.css`, before anything visual:

- `--color-ground` and the other tokens are present → `@theme` inside an imported file works
- `--text-display--line-height` **and** `--text-display--letter-spacing` are present → the
  contingency in §5 is not needed
- Tailwind's preamble appears **once**, not twice → the double-import is genuinely resolved
- no `#000`, `#fff`, `#ffffff`, no `--color-gray-*` / `--color-slate-*` / `--color-zinc-*`, no
  colour literal outside the seven tokens

In the browser, at 1280px, 768px and 375px:

- display renders 56px above 768px and 40px below, leading 1.0, tracking -0.02em
- the Expanded sample is measurably wider than the Archivo 500 sample at the same size
- `/type-test` throws no console errors; `/` still renders and now uses the palette
- DevTools Network: four woff2, the Expanded one fetched at high priority from the preload

### Step 02 acceptance checklist

- [ ] every scale step from `design-spec.md` §5 renders at the specified size and leading —
      stamped computed-vs-expected on `/type-test`
- [ ] body text on `--ground` measures 7:1 or better — computed 12.80, shown on `/type-test`
- [ ] `--signal` on `--ground` measures 4.5:1 or better — computed 5.51, shown on `/type-test`
- [ ] body measure caps at 68ch — ruler section
- [ ] no pure black, no pure white, no gray outside the token list anywhere in the CSS —
      `dist` grep above, plus the namespace reset making it structural
- [ ] display line uses Archivo Expanded 500 at -0.02em tracking — width comparison section
- [ ] `pnpm build` succeeds

---

## Surfaced, not fixed

**`--graphite-2` on `--ground` is 4.21:1.** Below the 4.5 AA floor for normal text. It is the colour
of margin notes, metadata and annotations — five margin notes and every archive row date. On
`--sheet` it is 4.66:1 and passes, so archive rows are fine and the spine margin is not.

Not touched here: it is a token, `CLAUDE.md` forbids changing one unasked, and design-spec §10 asks
for margin notes "visible at low contrast by default", so the value may well be deliberate. But
step 06 gates on Lighthouse accessibility 95+ and axe flags sub-4.5 text.

Recorded in the **Open questions** list in `progress.md` for Arthur. Three ways out when it comes
up, all his call: darken `--graphite-2`, put margin notes on `--sheet` where it already passes, or
accept the finding as a deliberate design choice. Nothing in step 02 depends on which.

---

## Close-out

Per `CLAUDE.md`'s workflow:

1. Run the acceptance checklist; every box passes.
2. `pnpm build` succeeds.
3. Mark step 02 `done` in `docs/progress.md`.
4. Add to **Divergences**: fonts self-hosted from Google Fonts rather than `<link>`-loaded, with
   the HTTP 400 on `Archivo Expanded` and the preload requirement as the reason; the three
   `*: initial` reset lines added to `tokens.css`, authorised by Arthur, no values changed; plus
   `@theme static` if the §5 contingency fired.
5. Add to **Notes for future sessions**: `"Archivo Expanded"` is `Archivo:wdth,wght@125,500`, not a
   family; `global.css` must not import Tailwind because `tokens.css` already does; preloading the
   display face covers nothing else, since all four faces are separate files.
6. Add to **Open questions**: the `--graphite-2` contrast finding.
7. Commit as `step 02: tokens, type and layout primitives`.
8. Push to origin.
9. Stop and report. Do not start step 03.

---

## Not blocking this step

- **Site language.** Still open, still blocks step 03's content schema, not step 02. `lang="en"`
  on `Base.astro` for now.
- **Every `[FILL]`, the opening line, the Braille word, the contact decision.** None touch step 02;
  `/type-test` uses lorem-grade filler and `HAMBURGEFONSTIV`, never invented biography.
- **The spine + margin grid.** Step 04, per Arthur's answer. `--container-margin` and
  `--spacing-gutter` are still proven to emit as utilities here.
