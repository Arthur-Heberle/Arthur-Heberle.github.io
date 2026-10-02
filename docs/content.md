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

**Chosen:** Rewritten in his own words, not B verbatim.

> I make technical things make sense to people who didn't build them.

### Hero block, final

Display line (the chosen opening line, above):

> I make technical things make sense to people who didn't build them.

Supporting line:

> Computer engineering at UTFPR, in Curitiba. Embedded systems, C++, and AI automation.

Mono line under the name (unchanged from the Identity block above):

> Curitiba, Brasil      EU citizen      open to global remote

---

## Spine

Two or three short paragraphs carrying the through-line: Arthur makes technical things
usable by people who aren't technical. Each paragraph carries one or two annotation
markers pointing into the margin.

Final, in his own words. Superscripts mark where an annotation link lands; the linked
margin note is named beside each one.

> I build things that sit between software and the physical world. A device that turns
> digital text into Braille. Research software that plans how a part gets printed. Energy
> data somebody has to make a decision from. The part I'm best at is the handover: getting
> the thing understood by the people who have to use it, sign it off, or pay for it.¹

> Most of what I've done has had an audience. I was a monitor twice at UTFPR, for Calculus
> II and later for Programming Techniques, which mostly meant explaining pointers to
> people who were close to giving up. I spent six months at an energy efficiency firm, in
> the field with meters and inverters and then in the report the client actually reads.
> Now I'm on RP3 at UTFPR's NUFER lab, in C++ and Qt, and I build my own projects when
> nobody asked me to.²

> *(Paragraph 2 is gone, 2026-10-02: its languages, chess and guitar moved into the home
> datasheet, "Typical characteristics" and "Known side effects".)*

Marker order — the order the notes appear in the margin:

| Marker | Note |
|---|---|
| ¹ | reading |
| ² | working on |

Constraints: 68ch measure, short sentences, no hedging words, no adjectives about
himself. The archive proves the claims; the spine only has to state them.

---

## Margin notes — five, at the ceiling

Placeholders written in Arthur's voice, to be replaced with his own wording. Five is the
maximum; a sixth dilutes the read.

**1. reading**
> Most of what I read has nothing to do with engineering. Psychology, behaviour, how
> people actually decide things. That turned out to be the useful part: it's why Agente H
> waits for customers to stop typing.

**2. languages**
> Portuguese, English, Italian, and French badly, for now. I keep starting new ones
> without a real reason.

**3. chess**
> Mostly fast games. I like that there is nobody else to blame.

**4. guitar**
> I play guitar and sing. I am bad at both and I keep doing it.

**5. working on**
> I push my own ideas hard, because I am usually convinced mine is the better one. Still
> learning when that is leadership and when it is just volume.

**Note 5 is the most important line on the page.** It's the only one that isn't
self-flattering, which is what makes the rest believable. Both sentences are required. If
the second sentence is cut, cut the whole note.

Note 4 is the only non-competitive item on the page and is load-bearing for the same
reason. Don't replace it with something more impressive.

---

## Projects (the bench) and Experience

Arthur's brief, 2026-10-01: the archive list (7 mixed entries, with tag filters) is replaced by two
collections, `src/content/projects/` and `src/content/experience/`. Copy is verbatim from that brief.
A `[FILL]` in an optional field (date, role, place, people) is omitted from the page; in prose that
always renders it is shown as written, and `scripts/check-fill.mjs` fails the build on it.

### Projects (shown on the bench, in this order)
1. **EduBra — Braille teaching device.** date `2025-06`, role "team of 3, wrote the software, built most of
   the hardware", tags hardware, teaching, link `/projects/edubra/`. Line: "Teaches Braille to blind and
   visually impaired people: a voice says the letter, then six pins rise under your finger."
2. **Agente H — WhatsApp sales agent.** date `2026-05`, role "built alone", tags code, ai, status "in
   progress", link `/projects/agente-h/`. Line: "A WhatsApp agent that answers customers from a shop's own
   catalogue and hands the owner the ones ready to buy."
3. **Brasilore — 2D platformer.** no date, role "team of 2, with Vinicius Romualdo da Silva", tags code, link
   `https://github.com/Arthur-Heberle/Brasilore` (no project page yet). Line: "A 2D platformer in C++ and SFML."

### Experience (newest first; Arthur's brief, 2026-10-02)
Fields: `title`, `place`, `start`, `end` (`null`: ongoing), `role`, `text` (one paragraph each), `hard` ("The
hard part"), and for RP3 an `image` (the RP3 screenshot, `public/experience/rp3-3d-view.png`, with caption and
alt; published with the professors' approval, which Arthur confirmed). Copy is verbatim from the brief, in
`src/content/experience/*.md`. The duration line is computed, both months counted ("N months", "N months so
far" for RP3).
1. **RP3 — undergraduate research.** NUFER, UTFPR, from 2026-07.
2. **Programming Techniques — academic monitor.** UTFPR, 2026-03 to 2026-08.
3. **ELETRON energia — energy efficiency.** Curitiba, 2026-01 to 2026-06.
4. **Calculus II — academic monitor.** UTFPR, 2025-03 to 2025-07.

---

## Project pages

`design-spec.md` §6's template, one per set-piece project: title and intro (with an optional
margin note), the set-piece, the project's own sections, "How we built it" (optional), "My
part", "What I'd do differently", Links. Lives at `/projects/<id>/`, `<id>` matching the project's own filename — decided at
step 13, since neither spec named a URL.

The prose is an optional `project` object on the project, not markdown body prose —
decided at step 13, closing the question `docs/plans/step-03.md` left open. Only an entry with
its own page needs one. Fields (changed 2026-09-30): `what` (the intro), `note` (optional margin
note), `built` (optional, a list of paragraphs), `part` (a list), `differently` (a list) and
`paper` (an optional document for Links, `{ href, label }`, kept off `links.pdf` so the home
archive row doesn't grow a link).

### EduBra
Final, in Arthur's words (2026-09-29). "what" is one sentence on purpose: it sits directly
above the set-piece, and the system diagram below the cells carries how it works.

- what (rewritten 2026-09-30, verbatim from Arthur's brief): A low-cost device that helps
  blind and visually impaired people learn Braille on their own. It reads a file letter by
  letter: a voice says the letter, then six pins rise under your finger.
- note (margin note beside `what`, the site's margin-note component with no label and no
  marker): Screen readers didn't make Braille obsolete. For many blind adults, reading it is
  still a big part of independence.
- "How it works" captions (step titles unchanged): 1 Send a file: Drop in a .txt, .docx or
  .pdf. Song lyrics, an article, anything. 2 Over Wi-Fi: The page splits it into words and
  sends them to the Raspberry Pi inside the box. 3 Audio first: Before reading, the Pi
  prepares a voice file for every word, so it doesn't stall mid-sentence. 4 Read: It says
  the word, then each letter, raising the pins as it goes.
- "By the numbers" (copy in the brief, 2026-09-30; "2.5 mm": how far each pin rises, measured with
  a caliper. "6": servos under the lid, one per dot. "~3 s": per letter at full speed. Each pin
  adds about 0.2 s; the voice takes the rest. "8": servos we burned on the way there).
- built ("How we built it"), 4 paragraphs: the pins took four designs in SolidWorks, printed in PLA
  at the university's prototyping lab; a separate 5 V supply feeds the motors and the Pi only
  sends the signal; the 3 mm MDF box, laser-cut with finger joints, the cell opening widened with
  a jigsaw and the lid thinned under the buttons; a hot-glue symbol on each button.
- part ("My part", replaces "What I did" and "Role and team"), 3 paragraphs: the team (Luiz
  Correia, Rafael Fernandes and Arthur, Oficina de Integração 1, UTFPR, 2025) and that Arthur
  wrote all of the software and built most of the hardware; the Flask page on the laptop and
  the program on the Pi; the buttons (interrupts, then a thread that only watches them).
- differently, 3 paragraphs: everything on the Pi; an offline voice that is actually clear (the
  one used now, Google's, needs internet and is the bottleneck); all six pins at once, to the
  same height, without the twitch some pins still have.
- Links: "Code on GitHub" (the repo) and "Final paper, in Portuguese (PDF)"
  (`/docs/edubra-paper.pdf`).
- The exact wording of every paragraph above is in `src/content/archive/edubra.md` (verbatim from
  the brief); this file lists only what each one says.

---

## Changelog

```yaml
date: 2026-09-13
note: string     # one line, Arthur's voice, no changelog jargon
```

Written by Arthur, never generated from commits. Newest first, three visible, then
"show all". It signals the site is maintained rather than abandoned, and it makes every
editing session produce something visible.

Entries as shipped at step 14 (drafted for Arthur, approved by him with the plan; replace
with his own wording whenever he likes):

- `2026-09-20` — First version is live. The EduBra page is the one I'd look at first.
- `2026-09-13` — Started building this, one section at a time.

---

## Contact

Not a form. One sentence of invitation in his own voice, his real email, and WhatsApp
(published, decided at step 14). The final leader line of the drawing terminates here, and this is the
only thing on the page the drawing points at.

Invitation line: Tell me what you're building and I'll tell you honestly whether I'm
useful to it.

WhatsApp: `+55 49 99194-2504`, linked as `https://wa.me/5549991942504`. Email first — it is
the one the drawing points at.

The site's purpose is to start a conversation, because Arthur's strongest asset is
one-to-one conversation with a decision maker. Everything above this section exists to
make twenty minutes of his time seem worth requesting.

---

## Words to avoid site-wide

"Passionate", "enthusiast", "journey", "cutting-edge", "leverage", "seamless",
"I'm a very communicative person", and any sentence that claims a trait instead of
showing one. The archive's `role` field and the margin notes do that work already.
