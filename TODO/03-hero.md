# Stage 3: the hero with a photo

Arthur's decision: a **photo on top**, his **name bigger** under it, and **basic info beside the
photo**. The headline "I make technical things make sense to people who didn't build them." sits to the
**right of the photo**. Arthur adds the photo himself and gives the info lines when this stage starts.

## Layout

```
768px and up                                 below 768px
+-----------+                                +-----------+
|           |   headline                     |   photo   |
|   photo   |   info line                    +-----------+
|           |   info line                    Name Name
+-----------+   info line                    headline
Arthur Heberle  (larger than today's 56px)   info lines
```

- On the home 12-column grid (`src/home/home.css`): photo and name in about 4 columns, the info column
  in the rest, top-aligned with the photo.
- Photo: `--radius-panel` (10px), fixed aspect ratio (portrait, e.g. 4:5), `object-fit: cover`.
- Name: Archivo Expanded 500, larger than the current display size (56px / 40px mobile). Proposed size
  is a §5 scale change: show Arthur two sizes in a screenshot before settling.
- The headline keeps its role as the page's `<h1>`, or the name becomes the `<h1>`: decide with
  Arthur (one `<h1>` only).

## The photo

- Arthur puts the file in `public/images/` (folder does not exist yet). Suggested name
  `arthur-hero.jpg` (or `.webp`); an earlier brief expected `public/images/arthur.jpg`, use whichever he
  drops in.
- `<img src width height alt loading="eager" fetchpriority="high" decoding="async">`; width/height
  match the file's real ratio, so no layout shift.
- Alt text: from Arthur ([FILL] until then; never invented).
- Size budget: about 1000px on the long side, under ~150 KB.

## Motion

- `heroSequence()` in `src/shared/motion.ts` splits `[data-hero-display]` into words, and
  `Base.astro`'s inline script hides it first (`hero-pending`, 1.5 s failsafe). If the element with
  `data-hero-display` changes, both must follow, or the heading flashes.
- Photo: at most an opacity fade, once per session like the heading; none under reduced motion.

## Open questions for Arthur

- The info lines beside the photo ([FILL]); candidates from the removed datasheet are listed in 01.
- What stays of today's hero (`src/home/hero/Hero.astro`, `text.ts`): the intro line, the identity list
  (Curitiba, EU citizen, open to global remote), the email link at the top.
  Design-spec §2 "direct" wants contact reachable on the first screen; if the email leaves the hero,
  it needs another place on the first screen, or Arthur overrides the rule.
- The spine paragraph under the hero (`src/home/spine/`): keep or remove. If removed, the spine
  folder goes (keep `MarginNote.astro`, project pages use it).
- The reference centres the name under the photo; design-spec §5 says "no centered text anywhere".
  Left-aligned to the photo's edge by default; centred only if Arthur says so (and §5 is updated).
- The L-bracket and datum line of `HeroDrawing.astro` (asked in 02).

## Acceptance

- [x] Photo, name, headline and info visible on the first screen at 1440 and 1024; at 390 the photo
      and name at least.
- [x] No `[FILL]` in shown text (the build enforces it).
- [x] One `<h1>`; the photo's alt text is Arthur's.
- [x] CLS 0 with the photo, cold cache (Lighthouse mobile and the layout-shift observer).
- [x] Hero sequence: no flash on first visit, no animation on repeat visit or reduced motion.
- [ ] Clear of the fixed corner name at every width. (Pending: stage 2 not built yet; the hero starts 48px down.)
- [x] `pnpm build` passes.
