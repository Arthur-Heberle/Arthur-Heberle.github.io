# CLAUDE.md

Personal portfolio for Arthur Gabriel Pellegrini Heberle. Static site, Astro, deployed
to GitHub Pages at `https://arthur-heberle.github.io`. English at `/`, Portuguese at `/pt/`
(in progress).

This file is loaded every session. Read it fully, then read only what the current task
needs.

---

## What wins: Arthur's request

**What Arthur asks for wins over every `.md` file in this repo, this one included.** The rules
below, the design spec, the motion spec and the plans are defaults that keep the site consistent
when nobody has said otherwise. When a request conflicts with one of them:

1. Do what Arthur asked.
2. Tell him in one line which rule it breaks and why the rule was there. Do not block, do not
   ask permission twice, do not quietly "fix" his choice back.
3. Update the doc that was overridden (design-spec, motion-spec, this file) so the next session
   does not undo his decision.

The one thing no request changes: **never invent facts about Arthur** (see below). That is about
not lying on his behalf, not about style.

When something Arthur says is unclear, say you did not understand and ask. Offer options with a
recommendation; he decides.

---

## Read order

| File | When |
|---|---|
| `CLAUDE.md` | always |
| `docs/progress.md` | always, first action of every session: find the brief and stage in progress |
| `TODO/` | when it exists: the current brief (today the home page refactor), one file per stage |
| `docs/design-spec.md` | before any visual or structural work |
| `docs/motion-spec.md` | before any animation work |
| `docs/content.md` | before any copy or content-collection work |
| `docs/implementation-plan.md` | history only: v1 steps 01-14 are done |

`progress.md` is long. Grep its `###` headings and read only the table you need.

---

## Workflow

Work arrives as **briefs** from Arthur, split into **stages**. Each brief gets a table in
`docs/progress.md` (and, for big ones, a folder like `TODO/`).

1. Read `docs/progress.md` and the brief. Find the first stage not marked done.
2. **Ask Arthur for what the stage needs from him before building it**: texts, photos, roadmap
   items, info lines, a font. He gives these at implementation time, not in advance.
3. Do **that one stage only**, unless Arthur asks for more.
4. Run the stage's acceptance checklist. Every box must pass.
5. Run `pnpm build`. It must succeed before the stage counts as done.
6. Update `docs/progress.md`: mark the stage done, one note on anything that diverged.
7. Commit with the brief and stage in the message, e.g. `home-refactor: remove datasheet`.
8. Push to origin.
9. Stop and report, in Portuguese if Arthur wrote in Portuguese.

If a stage needs something its plan does not cover, stop and ask rather than improvising.

---

## Where things live

Code is split by domain, so a change to one section touches one folder.

| Folder | Holds |
|---|---|
| `src/shared/` | `layouts/Base.astro` (every page), `components/` (Glass, Rule, Tick), `motion.ts` (the one GSAP/Lenis authority), `styles/` (tokens, fonts, `global.css`, base, light, drawing, control), `fill.ts`, `text.ts` |
| `src/shared/i18n/` | `lang.ts` (`getLang`, `localePath`), `content.ts` (collections by language), `Data.astro` + `runtime.ts` (words handed to scripts as JSON) |
| `src/home/` | `HomePage.astro` (section order), `home.css` (12-column grid), one folder per section: `hero`, `spine`, `datasheet` (being removed), `bench` (Projects), `experience`, `changelog`, `contact`; coming: `roadmap`, `about` |
| `src/projects/` | `ProjectPage.astro` (shared template), `ProjectRoute.astro`, `projects.ts` (which ids get a page), `project.css` |
| `src/projects/<id>/` | one folder per project page (`edubra/`, `agente-h/`): set-piece, story script, CSS, `text.ts` |
| `src/content/`, `src/pages/`, `src/content.config.ts` | where Astro requires them: collections, routes (`pages/*` are thin wrappers) |
| `scripts/` | `check-fill.mjs` (runs inside `pnpm build`), `shots.mjs` (screenshots) |
| `public/` | fonts, textures, project images; photos go in `public/images/` |
| `TODO/` | the current brief, one file per stage |

Every CSS file is pulled into one bundle by `src/shared/styles/global.css`, **in cascade
order**. A new CSS file gets one `@import` line there, after the files it may override.
Don't import CSS from components.

**Text:** every shown string lives in a `text.ts` next to its component, `{ en, pt }`, read with
`text[getLang(Astro)]`. `pt: en` marks what is not translated yet. Scripts do not import text;
the page hands them their words through `Data.astro`.

---

## Site chrome (Arthur, 2026-11-16)

- **Top left:** Arthur's name, an SVG he drew (`arthur-heberle.svg`), linking to the home page.
  It replaces the old target mark (`OriginLink.astro`).
- **Top right:** the EN/PT language switch.
- Both are **always visible**: they stay on screen while the page scrolls, floating on a layer
  above the content. **No bar and no background strip** behind them.

---

## Defaults (Arthur can override any of these; see "What wins")

**Never invent facts.** Things only Arthur knows (texts, numbers, roles, goals, photo alt text,
the info beside his photo) come from him. Never guess a number or write a plausible placeholder.
Use a `[FILL]` marker and ask; `scripts/check-fill.mjs` fails the build on a marker in shown prose.
*This one is not a style rule and is not overridden by a request for content: ask for the content.*

**Design tokens** in `src/shared/styles/tokens.css` stay as they are unless Arthur asks. If a
colour or size feels wrong, say so.

**Sections and pages** follow `docs/design-spec.md` §6 and §9. Arthur adds or removes them; when he
does, update §6.

**Libraries:** Astro, Tailwind v4, GSAP, Lenis, and Playwright (dev only, for screenshots). Ask
before adding another.

**References are for structure, not visuals.** A site Arthur points at (today yudiganeko.com) informs
layout and density; colours, type and the drawing language stay this site's own unless he says
otherwise.

**Use `gsap`, never `gsap-trial`.** GSAP is free with all plugins (ScrollTrigger, DrawSVG,
SplitText, Flip, CustomEase). Doc pages calling some of them paid Club plugins are outdated.

**Verify framework specifics against current docs** (Astro, Tailwind v4, the Pages action) rather
than memory.

**Drawings are `aria-hidden`, with one `role="img"` description per drawing or section.** Check the
accessibility tree: no drawing text, no duplicates.

**Animate only `transform`, `opacity` and `stroke-dashoffset`.** Never width, height, colour,
box-shadow, filter or blur. A performance constraint.

---

## The tiebreak rule

Six ranked principles: **direct > sharp > warm > confident > alive > unusual.**

When two conflict inside one decision and Arthur has not chosen, the higher one wins. Full
definitions in `docs/design-spec.md` §2.

---

## The aesthetic that was rejected

An earlier version was cut for looking machine-generated. Do not reach for it unless Arthur asks:

- cream ground near `#F4F1EA`, high-contrast serif display, terracotta accent near `#D97757`
- broadsheet layout, dense newspaper columns, editorial footnotes
- `01 — who` eyebrow labels, monospace on every small label, all-caps tracked labels,
  meta strings joined with middle dots
- numbered section markers on content that isn't a sequence
- uniform fade-and-slide-up on every section

The direction is an **annotated technical drawing** that **draws itself as you scroll**, grounded
in Arthur's own work: additive-manufacturing process planning, embedded hardware, energy
measurement. Since 2026-11 the home page is also deliberately **simpler**: less on screen, a photo,
his name, short sections.

---

## Commands

```bash
pnpm install
pnpm dev            # local dev
pnpm build          # astro build + check-fill; must pass before any stage is done
pnpm preview        # check the built output
pnpm shots          # build, preview on :4399, screenshots to shots/ (gitignored)
node scripts/shots.mjs [home|edubra|agente-h] [1440|1024|390] [--out name]
```

Screenshots and accessibility checks run in headless Edge/Chromium (Playwright, CDP). Arthur's own
browser is Brave; say when something was not checked there, nor in Firefox or Safari.

---

## Quality floor, applies to every stage

- Keyboard focus visible on everything interactive.
- All content readable with JavaScript disabled.
- `prefers-reduced-motion` respected: final states, no tweens.
- No layout shift: every SVG gets `viewBox` plus `aspect-ratio`, every `<img>` its `width`/`height`.
- No horizontal scroll at 390px.
- Total JS under 90 KB gzip.
