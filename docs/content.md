# Content

Source of truth for every word on the site. Claude Code seeds the content collections
from here in step 03.

**`[FILL]` means Arthur must supply it.** Never guess a number, never write a
plausible-sounding substitute. Leave the marker in the file and ask.

---

## Language

English for v1. Portuguese version deferred, but structure content so it can be added
without a refactor. If bilingual is decided before step 01, say so: it changes the
collection schemas.

---

## Identity block

```
Arthur Gabriel Pellegrini Heberle
```

One line directly under the name, monospace, using spacing or thin rules as separators.
Do **not** join these with middle dots.

```
Curitiba, Brasil      EU citizen      open to global remote
```

EU citizenship and four languages change a recruiter's decision, and both are currently
buried at the bottom of the CV. They belong here.

Links: GitHub `github.com/Arthur-Heberle`, LinkedIn
`linkedin.com/in/arthur-heberle`, email `a.gp.heberle@gmail.com`.

---

## Opening line — Arthur to choose and rewrite

The highest-leverage content on the site. It matters more than any animation. Three
candidates; the chosen one should be rewritten in his own words.

**A.** I build things that sit between software and the physical world, and I like
explaining them. Computer engineering at UTFPR, in Curitiba.

**B.** I make technical things usable by people who aren't technical. A Braille reader,
energy reports, an AI assistant, and two semesters teaching C++.

**C.** Computer engineering student in Curitiba. I build embedded and AI projects, and
I've spent two years explaining them to people who found them hard.

**Recommended: B.** It states the through-line and proves it in the same breath.

**Chosen:** `[FILL]`

---

## Spine

Two or three short paragraphs carrying the through-line: Arthur makes technical things
usable by people who aren't technical. Each paragraph carries one or two annotation
markers pointing into the margin.

Draft, to be rewritten in his voice: `[FILL]`

Constraints: 68ch measure, short sentences, no hedging words, no adjectives about
himself. The archive proves the claims; the spine only has to state them.

---

## Margin notes — five, at the ceiling

Placeholders written in Arthur's voice, to be replaced with his own wording. Five is the
maximum; a sixth dilutes the read.

**1. reading**
> Most of what I read has nothing to do with engineering. Psychology, behaviour, how
> people actually decide things. That turned out to be the useful part.

**2. languages**
> I keep learning languages I don't strictly need. Portuguese, English, Italian, and
> French badly, for now.

**3. chess**
> `[FILL: his own line]`

**4. guitar**
> I play guitar and sing. I'm bad at both and I keep doing it.

**5. working on**
> I push my own ideas hard, because I'm usually convinced mine is the better one. Still
> learning when that's leadership and when it's just volume.

**Note 5 is the most important line on the page.** It's the only one that isn't
self-flattering, which is what makes the rest believable. Both sentences are required. If
the second sentence is cut, cut the whole note.

Note 4 is the only non-competitive item on the page and is load-bearing for the same
reason. Don't replace it with something more impressive.

---

## Archive — 7 entries

Schema:

```yaml
date: 2026-07          # displayed as 2026.07, monospace
title: string
role: string           # required, never omitted
tags: [code, hardware, teaching, ai, energy]
links: { repo?, live?, pdf? }
blurb: string          # two lines maximum
pinned: boolean
```

`role` is required because it turns leadership and teaching into facts repeated down the
page instead of an adjective claimed once. Nobody believes "I love leadership"; everybody
believes `taught ~40`.

### 1. EduBra — Braille teaching device `pinned: true`
- date: `2025-12` `[FILL: confirm]`
- role: `[FILL: solo, or team of N and what Arthur owned]`
- tags: `[hardware, teaching]`
- repo: `github.com/Arthur-Heberle/Oficinas_1`
- blurb: Converts digital text to tactile Braille. Python on a Raspberry Pi 4, Wi-Fi,
  multithreading and hardware interrupts driving servos with simultaneous audio feedback.
- Leads the archive. This is the entry that makes a stranger care in four seconds.
- Word the set-piece spells: `[FILL]`

### 2. Agente H — WhatsApp AI assistant
- date: `[FILL]`
- role: `built alone`
- tags: `[code, ai]`
- blurb: Personal project. Python logic and integrations, workflow orchestration in n8n,
  vector database for contextual retrieval.

### 3. RP3 — additive manufacturing process planning
- date: `2026-07`
- role: `[FILL: undergraduate researcher, team size]`
- tags: `[code]`
- blurb: UTFPR/NUFER research software for process planning in additive manufacturing.
  C++ and Qt on an applied-research codebase.

### 4. Programming Techniques — academic monitor
- date: `2026-03`
- role: `taught ~[FILL]`
- tags: `[teaching, code]`
- blurb: C/C++, object-oriented programming and debugging. Supported the course's SFML
  game project.

### 5. ELETRON energia — energy efficiency assistant
- date: `2026-01`
- role: `[FILL]`
- tags: `[energy]`
- blurb: HVAC, variable frequency drives and photovoltaic plants. Consumption analysis
  for cost-benefit and measurement-and-verification reporting, regulatory documentation,
  field work with energy meters and control panels.

### 6. Brasilore — 2D platformer
- date: `[FILL]`
- role: `[FILL]`
- tags: `[code]`
- repo: `github.com/Arthur-Heberle/Brasilore`
- blurb: C++ and SFML. Object-oriented design, design patterns, file handling.

### 7. Calculus II — academic monitor
- date: `2025-03`
- role: `taught ~[FILL]`
- tags: `[teaching]`
- blurb: Academic support for engineering students. Ran review sessions.

---

## Changelog

```yaml
date: 2026-09-13
note: string     # one line, Arthur's voice, no changelog jargon
```

Written by Arthur, never generated from commits. Newest first, three visible, then
"show all". It signals the site is maintained rather than abandoned, and it makes every
editing session produce something visible.

Seed entries, to be replaced with his own:

- `[FILL: first entry, in his words]`
- `[FILL: second entry]`

---

## Contact

Not a form. One sentence of invitation in his own voice, his real email, and WhatsApp if
he wants it public. The final leader line of the drawing terminates here, and this is the
only thing on the page the drawing points at.

Invitation line: `[FILL]`

The site's purpose is to start a conversation, because Arthur's strongest asset is
one-to-one conversation with a decision maker. Everything above this section exists to
make twenty minutes of his time seem worth requesting.

---

## Words to avoid site-wide

"Passionate", "enthusiast", "journey", "cutting-edge", "leverage", "seamless",
"I'm a very communicative person", and any sentence that claims a trait instead of
showing one. The archive's `role` field and the margin notes do that work already.
