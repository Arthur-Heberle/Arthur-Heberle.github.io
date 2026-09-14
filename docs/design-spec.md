# Build spec — arthur-heberle.github.io

Personal portfolio. Written to be handed to Claude Code as the source of truth.

---

## 0. How to use this document

This is a design and build brief, not a suggestion list. Sections 2, 5, 8 and 12 are
constraints: if an implementation choice conflicts with them, the spec wins or the spec
gets changed deliberately.

Anything marked `[FILL]` is a fact only Arthur can supply. Do not invent values for
these, and do not guess team sizes, student counts or dates. Ask.

---

## 1. Brief

**Who it's for**, in priority order:

1. Recruiters and internship programmes, often on a phone, skimming for 90 seconds.
2. Developers and peers, who will notice craft and will notice defaults.
3. Arthur himself. This is also personal expression and a thing he will keep editing.

**What the site is for.** Not to be impressive. To get someone into a conversation.
Arthur's strongest asset is one-to-one conversation with a decision maker, so the page's
job is to make twenty minutes of his time seem worth requesting. The contact moment is
therefore the most important element on the page, not an afterthought.

**Success condition.** A stranger reads the first screen, understands what he does,
believes it, and can reach him without scrolling to the bottom.

**The through-line.** Arthur makes technical things usable by people who aren't
technical: a Braille teaching device, energy reports someone must act on, a WhatsApp
assistant, and two semesters of teaching C++ to students about to give up.

---

## 2. Ranked principles

Six words, ranked. When two conflict inside a single decision, the higher one wins.
This ranking is the tiebreak mechanism and it is the most useful thing in this document.

**1. direct** — information order. First line says what he does, not a slogan. Contact
reachable from the first screen. No "scroll to explore". Literal section names. Every
archive row shows its date and his role without a click.

**2. sharp** — contrast and tightness. Large display size, tight leading and tracking.
Near-black on pale ground. 0.5px hairlines. Interactive feedback at 120ms so clicks feel
instant. Short sentences, no hedging.

**3. warm** — material. No pure grays and no pure black anywhere. Cool-neutral ground
rather than white. Generous line-height in body text.

**4. confident** — subtraction. Six visible archive entries, not fifteen. No technology
logo wall, no skill bars, no badges. Whitespace deliberately left empty. Statements not
softened.

**5. alive** — motion that responds to the visitor rather than performing at them, plus
a changelog proving the site is maintained.

**6. unusual** — a fixed budget, not a style. Three devices carry all of it: the margin
annotation apparatus, the set-pieces, and the changelog. Everything else stays
conventional. Adding a fourth novel element requires removing one.

---

## 3. Out of scope for v1

- Possamai Studio. Deliberately absent. Do not add it, do not link it.
- Dark mode. The palette is a drafting ground; inverting it destroys the concept. If
  dark is wanted later it needs its own designed palette.
- Video backgrounds. Explicitly rejected.
- Blog. The archive absorbs anything short; long writing can become a section later.
- Portuguese version. Structure the content so it can be added without a refactor.

---

## 4. Stack, repo, deploy

- **Astro** + **Tailwind v4** + **vanilla GSAP** + **Lenis**. No React. Nothing here
  needs a component runtime, and Astro ships no JS that wasn't asked for.
- Content in Astro content collections as markdown/MDX so adding an archive entry, a
  margin note or a changelog line is one file, never a refactor.
- Repo must be named exactly `Arthur-Heberle.github.io` to match the GitHub username,
  otherwise it becomes a project page on a subpath and every asset path changes.
- Astro config: `site: 'https://arthur-heberle.github.io'`, no `base` needed for a user
  site at root.
- GitHub Pages source set to **GitHub Actions**, using `withastro/action`. Not
  "deploy from a branch".
- **GSAP is 100% free since April 2025**, including ScrollTrigger, DrawSVG, SplitText
  and ScrollSmoother. Some GSAP doc pages still describe DrawSVG as a paid Club plugin.
  That is outdated. Install the normal `gsap` package, never `gsap-trial`.

### Lenis + GSAP wiring, one scroll authority

One Lenis instance, one rAF loop, nothing else creating a scroll loop:

```js
const lenis = new Lenis()
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)
```

Reference implementations worth reading, not cloning: `helm78/astro-gsap-lenis` for the
Astro wiring, `creativoma/lenis-gsap-lab` for a data-attribute reveal system wrapped in
`gsap.matchMedia`. Take architecture, never visual design.

---

## 5. Design tokens

### Concept

The surface language is an **annotated technical drawing**, and the motion language is
**layer deposition**. The page is a drawing that draws itself as you descend. Both come
from Arthur's own domain: additive-manufacturing process planning, embedded hardware,
energy measurement. This is the reason the site won't look generated, so every token
below is subordinate to it.

### Color

Six values. The two chromatic ones have specific jobs and never decorate.

```css
--ground:    #EAECEB;  /* page, cool pale gray, drafting stock — never cream */
--sheet:     #F6F7F6;  /* raised areas: archive rows, drawing panels */
--graphite:  #23262A;  /* all body text and drawing lines, cool near-black */
--graphite-2:#6B7075;  /* secondary text, annotations, metadata */
--line:      #C3C8C6;  /* hairlines and construction lines */
--signal:    #B3261E;  /* annotation terminations, active states, links */
--measure:   #2F6F8F;  /* data traces inside set-pieces only */
```

Rules: `--signal` never fills a background, only strokes, marks and text. It should
appear roughly eight times on the whole page. `--measure` appears only inside set-piece
drawings, never in UI. No pure `#000`, no pure `#FFF`, no neutral grays outside the list.

### Type

One family with two widths, plus a mono with a single justified job.

- **Archivo Expanded**, weight 500 — display line only.
- **Archivo**, weights 400/500 — everything else.
- **IBM Plex Mono**, weight 400 — dimensions, dates, counts, measured values. Nothing
  else. Not for labels, not for eyebrows, not for tags.

Google Fonts, woff2, latin subset, `font-display: swap`. Preload the display face only.

### Scale

| Role | Size / leading | Notes |
|---|---|---|
| display | 56px / 1.0, tracking -0.02em | 40px below 768px |
| h2 | 28px / 1.15 | |
| h3 | 20px / 1.3 | |
| body | 17px / 1.65 | measure capped at 68ch |
| small | 14px / 1.5 | secondary, annotations |
| dimension | 12px / 1.4, tracking 0.02em | mono only |

### Layout

- Everything left-aligned to a single origin. No centered text anywhere. Drawings align
  to an origin; so does this page.
- Spine column 68ch max. Margin column 200px. Gutter 32px, and the gutter is where
  leader lines are drawn.
- Border radius 0 on all structural elements. 2px on interactive controls only, so they
  read as controls.
- Hairlines 0.5px `--line`. No rounded corners on single-sided borders.

---

## 6. Structure

### Home page

1. **Hero.** Display line, one supporting line, a quiet contact link top-right, and the
   hero drawing sequence. Contact must be reachable here.
2. **Spine with margins.** Two or three short paragraphs carrying the through-line,
   with numbered annotation markers pulling to margin notes.
3. **Archive.** Six entries visible, then "show all". Tag filter. Each row: date, title,
   role, tags.
4. **Changelog.** Three most recent entries, then "show all".
5. **Contact.** The last leader line of the drawing extends off the spine and terminates
   at his email. The only thing the drawing points at.

Do not add sections. Adding one requires removing one.

### Project pages

One per set-piece project, each carrying its own set-piece. Built over time, one at a
time. Template: title, one-paragraph what and why, the set-piece, what he actually did,
role and team, links, what he'd do differently. That last field is unusual and worth
keeping.

---

## 7. Content

### Opening line, three candidates

Arthur to choose and rewrite in his own words. This is the highest-leverage content on
the site and matters more than any animation.

**A.** "I build things that sit between software and the physical world, and I like
explaining them. Computer engineering at UTFPR, in Curitiba."

**B.** "I make technical things usable by people who aren't technical. A Braille reader,
energy reports, an AI assistant, and two semesters teaching C++."

**C.** "Computer engineering student in Curitiba. I build embedded and AI projects, and
I've spent two years explaining them to people who found them hard."

Recommended: **B**. It states the through-line and proves it in the same breath.

Directly under the name, one mono line: `Curitiba, Brasil` / `EU citizen` /
`open to global remote`. EU citizenship plus four languages changes a recruiter's
decision and is currently buried at the bottom of the CV. Do not join these with middle
dots; use spacing or thin rules.

### Margin notes, five, at the ceiling

Arthur's own wording to be substituted; these are placeholders in his voice.

1. `reading` — Most of what I read has nothing to do with engineering. Psychology,
   behaviour, how people actually decide things. That turned out to be the useful part.
2. `languages` — I keep learning languages I don't strictly need. Portuguese, English,
   Italian, and French badly, for now.
3. `chess` — [FILL: his own line]
4. `guitar` — I play guitar and sing. I'm bad at both and I keep doing it.
5. `working on` — I push my own ideas hard, because I'm usually convinced mine is the
   better one. Still learning when that's leadership and when it's just volume.

Note 5 is the most important line on the page and the only one that isn't
self-flattering, which is why the rest becomes believable. Both sentences are required.
If the second is cut, cut the whole note.

### Archive schema

```yaml
date: 2026-07          # display as 2026.07, mono
title: string
role: string           # "built alone" | "taught ~N" | "team of N" | "field work"
tags: [code, hardware, teaching, ai, energy]
links: { repo?, live?, pdf? }
blurb: string          # two lines maximum
pinned: boolean        # pinned entries sort above chronology
```

`role` is not optional. Leadership and teaching become facts repeated down the page
instead of adjectives claimed once. Nobody believes "I love leadership"; everybody
believes `taught ~40`.

### Initial archive entries

All drawn from the CV. Every `[FILL]` must come from Arthur.

1. **EduBra — Braille teaching device** `pinned`. Python, Raspberry Pi 4, Wi-Fi,
   multithreading, hardware interrupts, servos, audio feedback.
   Repo `Arthur-Heberle/Oficinas_1`. Role `[FILL: solo or team size]`. Leads the archive.
2. **Agente H — WhatsApp AI assistant.** Python, n8n orchestration, vector database for
   contextual retrieval. Role `built alone`, personal project.
3. **RP3 — additive manufacturing process planning.** C++/Qt, UTFPR/NUFER undergraduate
   research, Jul 2026 to present. Role `[FILL]`.
4. **Programming Techniques, academic monitor.** Mar–Aug 2026. C/C++, OOP, debugging,
   supported the course's SFML game project. Role `taught ~[FILL]`.
5. **ELETRON energia — energy efficiency assistant.** Jan–Jun 2026. HVAC, variable
   frequency drives, photovoltaic plants, consumption analysis for cost-benefit and
   measurement-and-verification reporting, regulatory documentation, field work with
   energy meters and control panels. Role `[FILL]`.
6. **Brasilore — 2D platformer.** C++/SFML, OOP, design patterns, file handling.
   Repo `Arthur-Heberle/Brasilore`. Role `[FILL]`.
7. **Calculus II, academic monitor.** Mar–Jul 2025. Role `taught ~[FILL]`.

### Changelog

```yaml
date: 2026-09-13
note: string          # one line, his voice, no changelog jargon
```

Newest first, three visible. Written by Arthur, never auto-generated from commits. It
signals the site is maintained rather than abandoned, and it gives every editing session
a small reward.

---

## 8. Motion system

### Three tiers

**Tier 1 — scrubbed.** Tied to scroll position, reversible, stops where the reader
stops. The drawing layer only: the rule drawing down the page, leader lines reaching
their notes, build progress, parallax depth. **Never text.** Scrubbed text jitters on
trackpads and fights reading.

**Tier 2 — triggered reveals.** Fires once when the element arrives, plays itself, never
replays, never reverses. Content: text blocks, archive rows, section headers.

**Tier 3 — set-pieces.** Longer self-contained sequences, section 9.

### Values

- Triggered ease: `cubic-bezier(0.22, 1, 0.36, 1)`. Everywhere. One curve.
- Scrubbed ease: `none`. Linear, always. Eased scrub feels broken.
- Durations: 120ms interactive feedback, 600ms reveals. Two values.
- Scrub catch-up: `scrub: 0.8` for the drawing layer. Never `scrub: true` for the
  drawing, which feels cheap; a number adds weight.
- Stagger 60ms between siblings. **Margin notes lag their paragraph by 200ms** — that
  delay is the choreography, teaching the eye that margins are secondary without any
  visual hierarchy trick.
- Reveal trigger point: element top crossing 85% of viewport height.

### Hard rules

- Animate `transform`, `opacity` and `stroke-dashoffset` only. Never width, height,
  color, box-shadow, filter or blur. Breaking this loses 60fps and the whole thing feels
  worse than no animation at all.
- **Archive rows get no entrance animation.** Animating a list of twenty items in
  sequence is the most common mistake in this genre. They move only on filter, via GSAP
  Flip, physically travelling to new positions.
- SplitText on the display line only, and **per word, not per character**.
- Never animate on exit. Never replay on scroll back up.
- At most **one pinned section per page**. Pinning eats scroll length and is the worst
  offender on touch devices.
- `invalidateOnRefresh: true` on scrubbed triggers.

### Degradation, not an afterthought

Wrap every animation in `gsap.matchMedia()`:

- **Reduced motion:** all elements render in final state. No scrub, no pin, no reveals.
  Filter becomes a cross-fade.
- **Below 768px:** unpin everything. Set-pieces render as static final-state diagrams
  with a single triggered reveal. The drawing layer keeps the scrubbed rule only.
- **No JavaScript:** all content present and readable. Build SVGs in their *final* state
  in the markup and have JS set the initial state on load. Never the reverse, or a
  no-JS visitor sees a blank page.

---

## 9. Set-pieces

Four in v1. Each owns a section or a page and each must justify its cost.

### Hero — the drawing constructs itself

Self-playing on load, once per session, **under 1.6s total**. The origin marks and the
first construction lines of the drawing assemble, the display line arrives per word, the
rule begins its descent. Session-scoped via `sessionStorage`: a visitor on their third
visit should not pay this tax. The first screen must still read correctly with the
sequence disabled.

### EduBra — the Braille cell

**The strongest piece on the site.** Scrubbed, and the one pinned section on its page.
A Braille cell fills dot by dot as the reader scrolls, spelling a word, with the text
version rendering alongside. The device converts text to touch; the set-piece performs
exactly that conversion, and the reader controls the translation. It demonstrates the
project rather than describing it.

### RP3 — the layer build-up

Scrubbed, not pinned. A cross-section deposits layer by layer as the reader descends,
every few layers unlocking a line about the research. The purest expression of the
deposition concept, and literally Arthur's subject matter as motion.

### Agente H — signal through a schematic

Scrubbed. The architecture drawn as a technical schematic — message in, n8n
orchestration, vector retrieval, response out — with a signal pulse travelling the path
as the reader scrolls.

**Explicitly not** a chat thread that types itself. Fake chat bubbles are everywhere and
they make the project read as a product demo instead of engineering. The architecture is
the interesting part.

### Contact — the leader line

Small, roughly two hours, and it closes the entire visual argument. The final leader line
of the drawing extends off the spine and terminates at his email address, the only thing
on the page the drawing points at. Not a form. His real email and WhatsApp, one sentence
of invitation in his own voice.

---

## 10. Quality floor

Build to this without announcing it.

- Lighthouse 95+ on mobile. Total JS under 90KB gzip including GSAP, plugins and Lenis.
- No layout shift: reserve every SVG box with `viewBox` plus `aspect-ratio`.
- Visible keyboard focus on everything interactive. Skip link. Archive filters are real
  `<button>` elements with `aria-pressed`.
- Margin notes are visible at low contrast by default, never hover-only. Hovering a
  marker only *links* the two. On narrow screens the margin collapses and each note drops
  inline directly after its paragraph.
- Every drawing SVG carries `role="img"` with a `<title>` and `<desc>`. Purely
  decorative construction lines get `aria-hidden="true"`.
- Contrast: body text against `--ground` must clear 7:1. `--signal` on `--ground` must
  clear 4.5:1 and is never used for long text.

---

## 11. Build order

1. Static page: tokens, type, layout, all real content. No motion. **Ship this.** If it
   doesn't work here, motion won't save it.
2. Lenis + GSAP wiring, one scroll authority, `matchMedia` scaffold, reduced-motion
   branch working from the start.
3. Tier 2 triggered reveals. Archive filter with Flip.
4. Tier 1 drawing layer, scrubbed rule and leader lines.
5. Hero sequence.
6. EduBra set-piece on its project page.
7. Accessibility and performance pass against section 10.
8. Later months: RP3 and Agente H project pages, one at a time.

v1 is steps 1–7 and should be public in about a week. "A month" becomes three, and
nothing ships.

---

## 12. Anti-patterns

Two lists. The second is more important because it was nearly built.

### Generic
Bento grids. Glassmorphic navbars. Technology logo marquees. Skill bars. "Scroll to
explore" with a bouncing arrow. Cursor-following gradient blobs. A `→` appended to every
link. Chat-bubble demos. Intro animations that replay every visit.

### The AI-design cluster, rejected during this project's design
An earlier version of this brief specified all of the following, and it was cut for
being the current signature of machine-generated web design, recognizable in two seconds
to exactly the audience this site is for:

- Warm cream ground near `#F4F1EA` with a high-contrast serif display and a terracotta
  accent near `#D97757`.
- Broadsheet layout: hairline rules, dense newspaper columns, editorial footnotes.
- `01 — who` style eyebrow labels, mono for every small label, all-caps tracked labels,
  meta strings joined with middle dots.
- Numbered section markers on content that isn't a sequence.
- Uniform fade-and-slide-up on every section, twelve times, presented as choreography.

Do not reintroduce any of these, including by cloning an "Awwwards-inspired" template
from GitHub. Take wiring from reference repos, never visual design.

---

## 13. Open decisions

- Site language. English specced for v1. Bilingual from the start would change the
  content schema, so decide before step 1.
- Every `[FILL]` in section 7.
- Opening line: A, B or C, rewritten in his own words.
- Custom domain: none for now, living at `arthur-heberle.github.io`. Add a `CNAME` and
  update `site` if that changes.
