# Implementation plan

Fifteen steps. One step per session. Each step is independently verifiable, and each
gate exists because skipping it is how this kind of build goes wrong.

Steps 1–14 are v1. Step 15 is later months.

**Before starting any step:** read `docs/progress.md`, do the first step not marked done,
run its checklist, run `pnpm build`, update `progress.md`, commit, stop.

---

## Step 01 — Scaffold and deploy an empty site

**Objective.** A live URL before any design exists, so deployment is never the unknown
later.

**Do.** Create the Astro project with TypeScript strict. Add Tailwind v4. Configure
`site: 'https://arthur-heberle.github.io'` with no `base`. Add
`.github/workflows/deploy.yml` (already provided). Set the repo's Pages source to
**GitHub Actions**, not a branch. Push and confirm the live URL serves a page reading
just the site name.

**Verify against current docs.** Tailwind v4 with Astro uses the Vite plugin and
CSS-first configuration rather than the older Astro Tailwind integration. Confirm the
current setup before writing config.

**Don't.** Add any styling, fonts, content or dependencies beyond Astro and Tailwind.

**Acceptance.**
- [ ] `pnpm build` succeeds
- [ ] the workflow run is green
- [ ] `https://arthur-heberle.github.io` serves the page
- [ ] repo is named exactly `Arthur-Heberle.github.io`
- [ ] no `base` path in the config

**Stop and ask if.** The repo name doesn't match the username, or Pages is already
configured to deploy from a branch with existing content.

---

## Step 02 — Tokens, type and layout primitives

**Objective.** The visual system exists and is provably correct before any page uses it.

**Do.** Install `src/styles/tokens.css` (provided) and import it globally. Load Archivo,
Archivo Expanded and IBM Plex Mono from Google Fonts, latin subset, woff2,
`font-display: swap`, preloading the display face only. Build a temporary
`/type-test` route rendering every scale step, both text colors on both surfaces, a
hairline, and a 68ch measure ruler.

**Don't.** Change any token value. Don't add a serif. Don't use monospace for anything
except dimensions, dates and counts.

**Acceptance.**
- [ ] every scale step from `design-spec.md` section 5 renders at the specified size and leading
- [ ] body text on `--ground` measures 7:1 contrast or better
- [ ] `--signal` on `--ground` measures 4.5:1 or better
- [ ] body measure caps at 68ch
- [ ] no pure black, no pure white, no gray outside the token list anywhere in the CSS
- [ ] display line uses Archivo Expanded 500 at -0.02em tracking

**Note.** Delete `/type-test` in step 14, not before.

---

## Step 03 — Content collections

**Objective.** Content is data, so adding an archive entry later is one file.

**Do.** Define three collections with Zod schemas matching `docs/design-spec.md`
section 7: `archive`, `notes`, `changelog`. Seed them from `docs/content.md`, preserving
every `[FILL]` marker verbatim in the files.

**Don't.** Replace a `[FILL]` with a guess. Don't reword Arthur's margin notes. Don't
drop the `role` field to make an entry validate.

**Acceptance.**
- [ ] `astro check` passes with no errors
- [ ] 7 archive entries, 5 notes, 2 changelog entries exist
- [ ] `role` is required by the schema, not optional
- [ ] EduBra is the only entry with `pinned: true`
- [ ] every `[FILL]` still present and greppable

---

## Step 04 — Static home page

**Objective.** The whole site works with zero JavaScript. This is the real test. If it
doesn't read well here, no animation will save it.

**Do.** Build the five home sections from `design-spec.md` section 6: hero, spine with
margins, archive, changelog, contact. Left-aligned to one origin throughout. Margin notes
visible at low contrast, positioned in the 200px margin column with a 32px gutter.
Contact link present in the hero, real email in the contact section.

**Don't.** Add any JS. Don't center any text. Don't hide margin notes behind hover. Don't
add a nav bar; the page is short enough not to need one.

**Acceptance.**
- [ ] full content readable with JS disabled in the browser
- [ ] below 768px the margin column collapses and each note appears inline directly after its paragraph
- [ ] contact reachable from the first screen without scrolling
- [ ] 6 archive entries visible, remaining ones in markup but not shown
- [ ] no border radius on structural elements, 2px on controls only
- [ ] display line does not wrap awkwardly at 1280px, 768px or 375px

---

## Step 05 — Archive filter, without GSAP

**Objective.** Interaction works before animation exists.

**Do.** Tag filter and "show all", in plain JS. Real `<button>` elements with
`aria-pressed`. Filtering changes which rows are shown; nothing animates yet.

**Don't.** Reach for GSAP. Don't use `display: none` transitions. Don't let the page
height jump so much that scroll position becomes nonsense.

**Acceptance.**
- [ ] fully operable by keyboard, visible focus on every control
- [ ] `aria-pressed` reflects state
- [ ] with JS disabled all entries are visible and the filter controls are absent or inert
- [ ] filtering causes no horizontal scroll at any width

---

## Step 06 — Accessibility and performance gate

**Objective.** Lock in the floor before motion can erode it. This gate is why motion
comes later.

**Do.** Skip link. Focus styles audited. `role="img"` with `<title>`/`<desc>` on any
meaningful SVG, `aria-hidden` on decorative lines. Run Lighthouse mobile.

**Acceptance.**
- [ ] Lighthouse performance, accessibility, best practices all 95+
- [ ] zero CLS
- [ ] heading order valid, one `h1`
- [ ] tab order matches visual order
- [ ] page weight under 200KB total with fonts

**Stop and ask if.** Any score is below 95 and the fix would require changing the design.

---

## Step 07 — Motion infrastructure only

**Objective.** Wiring, with no visible animation, so problems here are isolated from
problems in the animations themselves.

**Do.** Install `gsap` and `lenis`. Register ScrollTrigger, DrawSVG, SplitText and Flip.
Implement the single scroll authority and the `matchMedia` scaffold exactly as written in
`docs/motion-spec.md`. Implement the JS-sets-initial-state pattern: SVGs and content ship
in their final state in markup; JS sets initial states on load.

**Don't.** Animate anything yet. Don't create a second rAF loop. Don't instantiate Lenis
more than once. Don't use CSS to hide anything that JS will reveal.

**Acceptance.**
- [ ] smooth scroll active and the page is otherwise visually identical to step 06
- [ ] with `prefers-reduced-motion: reduce`, output is byte-for-byte equivalent in appearance to step 06
- [ ] with JS disabled, still identical to step 06
- [ ] exactly one `Lenis` instance and one `gsap.ticker` hook in the codebase
- [ ] `gsap.ticker.lagSmoothing(0)` present

---

## Step 08 — Tier 2 triggered reveals

**Objective.** Content arrival, once, cheap.

**Do.** A data-attribute reveal system per `motion-spec.md`: `data-anim` on content
blocks. Fires when the element top crosses 85% of viewport height. 600ms,
`cubic-bezier(0.22, 1, 0.36, 1)`, 60ms sibling stagger. **Margin notes lag their
paragraph by 200ms.**

**Don't.** Add reveals to archive rows. Don't animate on exit. Don't replay on scroll
back up. Don't use SplitText anywhere except the display line, and there per word.

**Acceptance.**
- [ ] scrolling down then up then down again does not replay any reveal
- [ ] archive rows have no entrance animation at all
- [ ] margin notes visibly arrive after their paragraph
- [ ] only `transform` and `opacity` appear in the tween properties
- [ ] reduced motion renders everything in final state with no reveals

---

## Step 09 — Tier 1 drawing layer

**Objective.** The scrubbed rule descending the page. The first piece of the actual
concept.

**Do.** An SVG rule in the gutter, drawn with DrawSVG, scrubbed to scroll position with
`scrub: 0.8`, `ease: 'none'`, `invalidateOnRefresh: true`. Section ticks where each
section begins.

**Don't.** Use `scrub: true`. Don't ease a scrubbed tween. Don't scrub any text. Don't
pin anything in this step.

**Acceptance.**
- [ ] scrolling up runs the drawing backwards
- [ ] stopping mid-section leaves the rule mid-draw
- [ ] resizing the window recalculates correctly
- [ ] rule renders fully drawn under reduced motion and with JS disabled
- [ ] no text element is affected by scroll position

---

## Step 10 — Leader lines to margin notes

**Objective.** The annotation apparatus, which is the site's one structurally unusual
device.

**Do.** Each marker in the spine connects to its margin note with a leader line drawn in
the gutter, scrubbed as it enters. Hovering a marker highlights its note and its line.

**Don't.** Make note content hover-dependent; notes are always visible. Don't draw leader
lines below 768px, where the margin column doesn't exist.

**Acceptance.**
- [ ] each of the 5 notes has a line terminating at it
- [ ] hover state is additive only, no content revealed by hover
- [ ] below 768px lines are absent and notes are inline
- [ ] keyboard focus on a marker produces the same highlight as hover

---

## Step 11 — Archive filter with Flip

**Objective.** Make the one user-triggered animation on the home page feel physical.

**Do.** Retrofit step 05's filter with GSAP Flip so rows travel to their new positions.

**Don't.** Animate row entrances on first load. Don't exceed 400ms.

**Acceptance.**
- [ ] rows visibly travel rather than snap
- [ ] reduced motion falls back to a cross-fade
- [ ] repeated rapid clicking does not leave rows stranded mid-flight
- [ ] keyboard operation still works and focus is not lost during the animation

---

## Step 12 — Hero sequence

**Objective.** The one self-playing moment. Under 1.6s total.

**Do.** Origin marks and first construction lines assemble, display line arrives per
word, rule begins its descent. Guard with `sessionStorage` so it plays once per session.

**Don't.** Exceed 1.6s. Don't delay the contact link or the display text behind the
animation; both must be present and readable if the sequence fails. Don't replay on every
page load.

**Acceptance.**
- [ ] total duration measured at or under 1.6s
- [ ] second navigation within the session skips it
- [ ] with the sequence force-disabled, the first screen is still correct and complete
- [ ] no CLS introduced
- [ ] reduced motion skips it entirely

---

## Step 13 — Project page template and EduBra set-piece

**Objective.** The strongest thing on the site. The Braille cell fills dot by dot as the
reader scrolls, with the text version alongside.

**Do.** Build the project page template from `design-spec.md` section 6. Then the EduBra
page: pinned section, scrubbed Braille cell, the reader controls the translation.

**Don't.** Pin more than one section on the page. Don't add a second set-piece here. Don't
use fake Braille glyphs; the dots must correspond to the word actually being spelled.

**Acceptance.**
- [ ] exactly one pinned ScrollTrigger on the page
- [ ] below 768px the section is unpinned and renders as a static final-state diagram with one triggered reveal
- [ ] reduced motion renders the final state, no pin, no scrub
- [ ] with JS disabled the diagram is visible and the page reads completely
- [ ] pin does not cause a scroll jump on refresh mid-page
- [ ] the Braille pattern is correct for the word shown

**Stop and ask if.** The word to spell isn't specified in `docs/content.md`.

---

## Step 14 — Final QA and ship v1

**Do.** Delete `/type-test`. Measure the JS bundle. Re-run Lighthouse. Test Chrome,
Firefox and Safari including iOS Safari. Test with a trackpad and with a mouse wheel.
Verify reduced motion end to end. Verify every `[FILL]` has been resolved or is
deliberately still open.

**Acceptance.**
- [ ] total JS under 90KB gzip
- [ ] Lighthouse 95+ on mobile across performance, accessibility, best practices
- [ ] no console errors or warnings on any route
- [ ] scrubbed motion smooth on a trackpad, no jitter
- [ ] iOS Safari: no pinned-section breakage, no scroll fighting
- [ ] first changelog entry written by Arthur, in his voice

---

## Step 15 — Later months, one at a time

Not part of v1. Each is a separate step when its turn comes.

- **RP3 project page.** Scrubbed, not pinned. Cross-section deposits layer by layer,
  every few layers unlocking a line about the research.
- **Agente H project page.** Scrubbed. Architecture as a technical schematic with a
  signal pulse travelling the path. **Not** a chat thread that types itself.
- **Portuguese version**, if decided.

Before adding any fourth novel device, remove one. The unusual budget is fixed.
