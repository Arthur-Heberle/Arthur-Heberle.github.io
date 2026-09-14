# CLAUDE.md

Personal portfolio for Arthur Gabriel Pellegrini Heberle. Static site, Astro, deployed
to GitHub Pages at `https://arthur-heberle.github.io`.

This file is loaded every session. Read it fully, then read only what the current step
needs.

---

## Read order

| File | When |
|---|---|
| `CLAUDE.md` | always |
| `docs/progress.md` | always, first action of every session |
| `docs/implementation-plan.md` | always, read only the current step |
| `docs/design-spec.md` | before any visual or structural work |
| `docs/motion-spec.md` | before any animation work (steps 7–13) |
| `docs/content.md` | before any copy or content-collection work |

Do not read all docs every session. `progress.md` plus the current step is usually enough.

---

## Workflow, non-negotiable

1. Read `docs/progress.md`. Find the first step not marked done.
2. Do **that one step only**. Never batch steps, never work ahead.
3. Run the step's acceptance checklist. Every box must pass.
4. Run `pnpm build`. It must succeed before the step counts as done.
5. Update `docs/progress.md`: mark the step done, add a one-line note on anything that
   diverged from the plan.
6. Commit with the step number in the message, e.g. `step 04: static home page`.
7. Push to origin after every step implemented. 
8. Stop and report. Do not start the next step in the same session unless asked.

If a step turns out to need something not in the plan, stop and say so rather than
improvising. A wrong decision made silently costs more than a question.

---

## Hard rules

**Never invent facts.** `docs/content.md` contains `[FILL]` markers for things only
Arthur knows: team sizes, student counts, exact roles. Never guess a number, never write
a plausible-sounding placeholder into real content. Leave the marker visible and ask.

**Never change the design tokens** in `src/styles/tokens.css` without being asked. If a
color or size feels wrong, say so; don't fix it unilaterally. The palette and type were
chosen against a specific brief and one drifted value breaks the concept.

**Never add a section, page or feature** that isn't in `docs/design-spec.md` section 6 or
9. The spec's rule is that adding one requires removing one, and that decision is
Arthur's.

**Never install a library** beyond the ones named in the plan (Astro, Tailwind v4, GSAP,
Lenis). No UI kits, no component libraries, no animation helpers. Ask first.

**Never clone a template.** Reference repos are named in the design spec for their wiring
only. Copying visual design from an "Awwwards-inspired" portfolio template would
reintroduce exactly what this design rejects.

**Use `gsap`, never `gsap-trial`.** GSAP has been 100% free since April 2025, all plugins
included: ScrollTrigger, DrawSVG, SplitText, Flip. Some GSAP doc pages still describe
DrawSVG and SplitText as paid Club plugins. That is outdated.

**Verify framework specifics against current docs** before scaffolding. Astro and
Tailwind v4 integration details change between versions and this document may be behind.
Check the official docs rather than relying on memory, particularly for the Tailwind v4
Vite plugin setup and the Astro Pages deployment action.

**Animate only `transform`, `opacity` and `stroke-dashoffset`.** Never width, height,
color, box-shadow, filter or blur. This is a performance constraint, not a preference.

---

## The tiebreak rule

Six ranked principles: **direct > sharp > warm > confident > alive > unusual.**

When two conflict inside one decision, the higher one wins. Example: if a hero animation
wants the first screen and `direct` wants the contact link visible there, `direct` wins
and the animation gives up the space. Full definitions in `docs/design-spec.md` section 2.

---

## The aesthetic that was rejected

An earlier version of this design was cut for being the current signature of
machine-generated web design. If you find yourself reaching for any of it, stop:

- cream ground near `#F4F1EA`, high-contrast serif display, terracotta accent near `#D97757`
- broadsheet layout, dense newspaper columns, editorial footnotes
- `01 — who` eyebrow labels, monospace on every small label, all-caps tracked labels,
  meta strings joined with middle dots
- numbered section markers on content that isn't a sequence
- uniform fade-and-slide-up on every section

The actual direction is an **annotated technical drawing** that **draws itself as you
scroll**, grounded in Arthur's own work: additive-manufacturing process planning,
embedded hardware, energy measurement. Every visual decision should be traceable to that.

---

## Commands

```bash
pnpm install
pnpm dev            # local dev
pnpm build          # must pass before any step is done
pnpm preview        # check the built output
```

---

## Quality floor, applies to every step

- Keyboard focus visible on everything interactive.
- All content readable with JavaScript disabled.
- `prefers-reduced-motion` respected from step 7 onward, not retrofitted.
- No layout shift: every SVG gets `viewBox` plus `aspect-ratio`.
- Total JS under 90KB gzip at the end.
