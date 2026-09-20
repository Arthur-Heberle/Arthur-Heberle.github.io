# Project briefs

Self-contained context files, one per project or role. Each brief exists so that an AI
building **that project's own website** — with no access to the project's codebase, and
no memory of this portfolio — can be handed a single file and know what to say and what
is true.

These are not site content. Nothing here is rendered, imported by a content collection,
or published. `docs/content.md` holds the copy that ships; this folder holds the
research behind it.

**A brief is context, not a work order.** Reading one is not permission to start
building that project's site. Arthur asks for implementation explicitly, separately.

## The template

Every brief follows the same three parts:

1. **The product** — what it is, who it's for, the problem, the before/after story,
   economics, status. This is the part a marketing site draws from.
2. **How it is built** — stack, architecture, data model, pipelines, and a scannable
   list of the engineering concepts the project demonstrates. This is the part a
   technically-minded reader, or an AI writing about the work, draws from.
3. **Raw material** — screenshots, demo data, visual identity, quotable lines, a file
   map. Everything a site builder would otherwise have to go hunting for.

## The `[FILL]` convention

Same rule as everywhere else in this repo: **never invent a fact.** Team sizes, dates,
student counts, prices actually charged, whether something is live — only Arthur knows
those. A brief writes `[FILL: what is being asked]` and leaves it visible.

Figures that come from a document rather than from reality — a cost model, a projected
price — are labelled *modeled* so nobody later quotes them as revenue.

Where a project's own docs contradict its code, the brief states what the code does and
notes that the doc is aspirational.

## Assets

`assets/<project>/` holds the images a project's future site would need — screenshots,
diagrams, anything that lives outside the project repo or is git-ignored inside it.
Copied here deliberately so a later session, which will not have the other repo open,
can actually find them. Filenames describe the content; a brief's Part 3 says which
image is worth using and which has a flaw.

## Briefs

| File | Project |
|---|---|
| `agent-h.md` | Agent H — WhatsApp AI sales agent. Assets in `assets/agent-h/` (9 images) |
