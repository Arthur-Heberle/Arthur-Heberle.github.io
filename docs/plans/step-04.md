# Step 04 — Static home page

## Context

`docs/progress.md` has steps 01–03 `done`, step 04 `todo`. This is the step `CLAUDE.md` calls
"the real test": the five home sections from `design-spec.md` §6, readable with zero JavaScript.
Every later step is motion or interaction layered on top of this page, so a page that doesn't
read well here will not be rescued by animation.

Step 04 was blocked on copy — `docs/content.md` had `[FILL]` for the opening line and no spine
draft at all. Arthur has since supplied the hero block, the three spine paragraphs with five
annotation-marker positions, and final wording for all five margin notes, marked final, not
provisional. `docs/content.md` and `docs/progress.md` were updated with that copy ahead of this
plan; this document builds the page around it.

Four framing decisions carry through this whole step:

1. Hero and spine copy are Arthur's final text, used **verbatim** — no rewriting, shortening or
   "improving", and no dev marker suggesting it's a draft.
2. Unresolved `[FILL]` values (11 remain: 9 archive, 2 changelog) render **visibly, as drafting
   annotations** — mono, `--graphite-2`, marker text intact. Fits the annotated-technical-drawing
   concept instead of fighting it, stays greppable in the DOM, and gives step 14 a real gate.
3. The **static drawing layer lands here** — the rule and the leader lines ship as final-state
   SVG, per `motion-spec.md`'s initial-state pattern, so steps 09–10 add only JavaScript to
   markup that already exists.
4. Archive `role` values stay open; they render as drafting annotations like every other
   unresolved marker.

---

## Geometry — get this right first

Three columns, everything left-aligned to one origin (`design-spec.md` §5):

```
| measure 68ch | gutter 32px | margin 200px |
   spine prose    leader lines   margin notes
```

One new layout primitive in `src/styles/type.css` (not `tokens.css` — no token value changes):

```css
.rail {
  display: grid;
  grid-template-columns: minmax(0, var(--container-measure)) var(--spacing-gutter) var(--container-margin);
}
```

Column 1 resolves to `min(68ch, 100% - 232px)`. That is what lets the page rule be positioned
without JS or a resize observer:

```css
.rule-svg {                    /* absolutely positioned inside a position:relative main */
  position: absolute;
  inset-block: 0;
  left: min(var(--container-measure), calc(100% - var(--spacing-gutter) - var(--container-margin)));
}
```

Below 768px: `.rail` collapses to a single column (`grid-template-columns: 1fr`), so each note
falls inline directly after its paragraph purely from source order — acceptance box 2 needs no
JS to satisfy. Leader lines get `display: none` at this breakpoint (`motion-spec.md`'s
degradation table: "below 768px … no leader lines"). The rule moves into `main`'s own left
padding so it still descends the page on mobile.

Each spine paragraph and the notes that hang off it share one `.rail` block: the `<p>` in column
1, a wrapper of `<aside>` elements in column 3 with `align-self: start`. Paragraph 3 carries
three notes and will read shorter than its note stack — the block just grows and leaves
whitespace below the paragraph. That's `confident` (design-spec §2, principle 4), not a bug; do
not shrink the notes or stretch the paragraph to fill the gap.

---

## Section-by-section markup

### Hero

Structure, top to bottom:

1. `<p class="name">` — full name, `text-h3`/500. (`<title>` in `Base.astro` already carries this
   for `<head>`; this is the on-page rendering.)
2. Mono identity line — three items (`Curitiba, Brasil` / `EU citizen` / `open to global
   remote`) as flex children with `gap`, wrapping on mobile. **Never joined with middle dots**
   (`content.md`, and the rejected-aesthetic list in `CLAUDE.md`).
3. `<h1 class="display">` — the display line, verbatim: "I make technical things make sense to
   people who didn't build them." This is the actual `<h1>`: `direct` (design-spec §2, principle
   1) says the first line states what he does, not a slogan, and `<title>` already carries the
   name so the name doesn't need to repeat as the `<h1>`.
4. Supporting line at `text-body`: "Computer engineering at UTFPR, in Curitiba. Embedded systems,
   C++, and AI automation."

Contact link, top-right of the hero, quiet: the real email as `mailto:a.gp.heberle@gmail.com`,
mono, `text-small`. Not a "Contact" jump link to the section below — `direct` wins the tiebreak
against any impulse to make it a scroll target, so the address itself sits on the first screen
and satisfies acceptance box 3 (reachable without scrolling) on its own.

### Spine

Copy verbatim from `docs/content.md`. Each superscript becomes a real anchor link, and the
superscript character itself is stripped from the rendered text — the link element supplies the
visible number:

```html
…pay for it.<a class="marker" id="marker-reading" href="#note-reading">1</a>
```

Marker numbers render mono (a callout number is a count — mono's one licensed job per
design-spec §5 Type) and `--graphite-2`, **not `--signal`** — see the signal budget below. Each
corresponding note carries the matching `id` and a back-link to its marker, so the pairing works
with JS entirely disabled; step 10 later adds only the drawn leader line on top of an
already-correct DOM relationship.

Note bodies render from the `notes` collection via `render(entry)` — prose Arthur edits as
markdown body text, per step 03's plan. The three spine paragraphs are hardcoded directly in the
`Spine.astro` component: page copy, not a collection, exactly as step 03 scoped it.

**`src/content/notes/*.md` gets two edits:**

- Frontmatter body text for `languages.md`, `chess.md`, `guitar.md`, `working-on.md` updated to
  the final wording above (`reading.md` is already byte-identical and is untouched).
- `order` renumbered from the current `reading:1, languages:2, chess:3, guitar:4, working-on:5`
  to `reading:1, working-on:2, languages:3, chess:4, guitar:5` — the order Arthur specified for
  the spine's markers. One source of truth for note order instead of two documents disagreeing;
  logged under Divergences since it changes a value step 03 already set.

### Archive

`<ul>` with `list-style: none`, each row `<li class="archive-row">`. That exact class name is
what `motion-spec.md`'s Flip snippet (`Flip.getState('.archive-row')`) targets in step 11 — using
it now means step 11 adds no markup, only script. Each row shows date, title, role, tags, links,
blurb, on `--sheet`, 0 border radius, hairline row separators.

- Date renders mono: `entry.data.date.replace('-', '.')` gives `2026.07`; an unresolved `[FILL]`
  date renders as the raw marker text via the shared `Fill` component (below).
- Tags render **sans, never mono** — design-spec §5 reserves mono for dimensions, dates, counts
  and measured values, and a tag is none of those.
- `role` renders as plain text, or via `Fill` where the value contains `[FILL`.

**Sort:** `pinned` first, then by `date` descending, then entries whose `date` is itself a
`[FILL]` marker last, in `content.md`'s original listing order. That resolves the ordering
question step 03 handed forward and yields, in order: `edubra` (pinned), `rp3` (2026-07),
`programming-techniques` (2026-03), `eletron-energia` (2026-01), `calculus-ii` (2025-03),
`agente-h` ([FILL] date) — six visible — then `brasilore` ([FILL] date) seventh, hidden.

"Show all" uses native `<details>`/`<summary>` wrapping the seventh row: six rows visible by
default, the seventh in markup but not rendered until expanded (acceptance box 4), and the
control is fully operable with JS disabled — no `hidden` attribute trick or checkbox hack needed.
Style `<summary>` as a control: `--radius-control` (2px), hairline border, `text-small`. Note for
step 05: keep `<details>` as the underlying structure and progressively enhance it with the tag
filter, rather than replacing it with a JS-only mechanism — the no-JS fallback must survive.

### Changelog

Same row shape as archive, three visible then "show all" via `<details>` — but render the
`<details>` wrapper **only when there are more than three entries**. Today there are two, both
`[FILL]` markers, so the section renders as two drafting-annotation lines and no "show all"
control appears at all (there's nothing to hide yet).

### Contact

Heading, an invitation line (rendered via `Fill`, since `content.md`'s invitation line is still
`[FILL]`), and the real email as `mailto:a.gp.heberle@gmail.com`. WhatsApp is not rendered — the
publish-or-not decision is still an open question in `progress.md` and no number has been
supplied to seed regardless. The final leader line of the drawing extends off the rule and
terminates at the email — the one thing on the page the drawing points at (design-spec §9).

---

## The drawing layer, final state

- **Rule.** One `<svg id="rule" aria-hidden="true">`, `viewBox="0 0 1 100"`,
  `preserveAspectRatio="none"`, containing a single `<path d="M0.5 0 V100">` with
  `vector-effect="non-scaling-stroke"` so the 0.5px hairline survives the vertical stretch.
  `#rule path` is the exact selector `motion-spec.md`'s Tier 1 snippet (`gsap.from('#rule path',
  { drawSVG: '0%', … })`) tweens later — do not rename either the id or the element. Absolutely
  positioned as a decorative overlay per the `.rule-svg` rule above, so it reserves no box and
  causes no layout shift.
- **Leader lines.** One small SVG per margin note, `position: absolute; right: 100%` inside the
  note's own column-3 cell, width one gutter (`--spacing-gutter`), with `viewBox` and
  `aspect-ratio` set per the quality floor (§10). Path runs from the rule to the note's first
  line with a small terminating tick, matching the visual language of design-spec §9's "leader
  lines reaching their notes." One SVG per marker (five total), so step 10 can attach one
  ScrollTrigger per line rather than choreographing a single shared path.
- Decorative construction elements get `aria-hidden="true"`; anything conveying real information
  gets `role="img"` with a `<title>` and `<desc>` (§10). The rule and leader lines here are pure
  decoration (they visualize a relationship the markup already states via `href`/`id`), so all of
  them are `aria-hidden`.
- Nothing here is hidden by CSS for JS to reveal later — the static markup already shows the
  rule and every leader line in final position and stroke. This is what motion-spec.md's
  initial-state pattern requires: "Markup ships every element and every SVG in its final state."

**Signal budget** (design-spec §5: roughly eight appearances of `--signal` on the whole page):
5 leader terminations + 1 contact terminal + focus-visible outlines (already wired in
`tokens.css`) account for the structural uses this step adds. Marker numbers and note labels stay
`--graphite-2`, not `--signal`, which is what keeps the running count in range once step 05's
active-filter state and step 11's Flip-driven states are added later.

---

## Files

| File | Action |
|---|---|
| `src/pages/index.astro` | rewrite — fetches and sorts the three collections, composes the five sections |
| `src/components/Hero.astro` | new |
| `src/components/Spine.astro` | new — verbatim copy, five markers, renders notes via `render(entry)` |
| `src/components/MarginNote.astro` | new — one note + its leader-line SVG |
| `src/components/Archive.astro` | new — sort, `<details>` wrapper |
| `src/components/ArchiveRow.astro` | new — one `<li class="archive-row">` |
| `src/components/Changelog.astro` | new |
| `src/components/Contact.astro` | new |
| `src/components/Fill.astro` | new — renders one unresolved `[FILL` value as a drafting annotation; the one place the render policy lives |
| `src/components/Rule.astro` | new — the page rule SVG, final state |
| `src/layouts/Base.astro` | edit — add a skip link and the `#main` landing target it points to |
| `src/styles/type.css` | edit — add `.rail`, `.rule-svg`, `.marker`, `.note`, `.leader`, `.skip`, `.archive-row`, `.control`, and the `max-width: 767px` collapse rules |
| `src/content/notes/*.md` | edit — final note bodies (four of five files); `order` renumbered to spine-marker order |
| `src/styles/tokens.css` | **untouched** — no token value changes |

`Fill.astro` exists so the drafting-annotation render policy is one component read in one place,
not a decision repeated across eleven call sites.

---

## Verification

```bash
pnpm install
pnpm build && pnpm check
```

**Content and markers:**

```bash
grep -rn "\[FILL" src/content/ | wc -l   # 11 — 9 archive, 2 changelog; chess is resolved
grep -c "<script" dist/index.html        # 0 — step 04 ships no JS anywhere
```

- **No JS:** open `dist/index.html` directly (or serve it with JS disabled in the browser) and
  confirm every word is present, including the seventh archive row inside its closed `<details>`.
- **768px collapse:** at a width below 768px, each margin note appears inline directly after its
  paragraph, no leader-line SVGs are visible, and there is no horizontal scroll at any width.
- **Display line at 1280 / 768 / 375:** check in `pnpm preview` for an awkward break or a
  one-word orphan on the last line. This is the one acceptance box that can't be automated and
  needs an eyeball pass at all three widths.
- **Contact above the fold** at 375×667, measured in devtools, not assumed from the markup order.
- **Radius:** grep the built CSS for `border-radius` — 0 on structural selectors,
  `--radius-control` (2px) appearing only on `<summary>` and any button-like control.
- **Keyboard pass:** skip link → hero email → each spine marker → each note's back-link →
  archive `<summary>` → changelog (if a `<summary>` exists) → contact email, with focus visibly
  outlined throughout (already handled by `tokens.css`'s `:focus-visible` rule — confirm it
  isn't being overridden anywhere new).

### Step 04 acceptance checklist

- [ ] full content readable with JS disabled in the browser
- [ ] below 768px the margin column collapses and each note appears inline directly after its
      paragraph
- [ ] contact reachable from the first screen without scrolling
- [ ] 6 archive entries visible, remaining ones in markup but not shown
- [ ] no border radius on structural elements, 2px on controls only
- [ ] display line does not wrap awkwardly at 1280px, 768px or 375px
- [ ] `pnpm build` succeeds

---

## Close-out

Per `CLAUDE.md`:

1. Run the acceptance checklist above; every box passes.
2. `pnpm build` succeeds.
3. Mark step 04 `done` in `docs/progress.md`.
4. **Divergences to log:** notes collection `order` renumbered from its step-03 values to match
   the spine's marker order (an ordering decision Arthur specified, not a fact changed); the
   static drawing layer (rule + leader lines) built now instead of in steps 09–10, so those steps
   add only motion to existing markup; `<details>`/`<summary>` used as the no-JS "show all"
   mechanism for both archive and changelog, which step 05 should progressively enhance rather
   than replace.
5. **Notes for future sessions:** the render policy for an unresolved `[FILL]` value lives in one
   component, `Fill.astro` — check there first if a marker needs to look different later, rather
   than hunting across templates.
6. **Open questions:** the opening line and spine questions are already closed as of this
   session's `docs/content.md`/`docs/progress.md` update. Leave open: the remaining archive
   `role`/`date` `[FILL]`s, the Braille word, the contact WhatsApp-or-email decision, and the
   `--graphite-2` contrast finding.
7. Commit as `step 04: static home page`.
8. Push to origin.
9. Stop and report. Do not start step 05 in the same session.
