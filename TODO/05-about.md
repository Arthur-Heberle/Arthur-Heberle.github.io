# Stage 5: About me

Arthur's decision: a **mini section "About me"** between Roadmap and Experience.

## Shape

Like the reference: a short block of two or three one-line paragraphs on the left and a photo on the
right; stacked below 768px (text, then photo). Short on purpose: "mini".

- `src/home/about/About.astro`, `about.css` (`@import` in `global.css`), `text.ts`
  (`{ en, pt: en }`: title and paragraphs).
- `src/home/HomePage.astro`: `<About />` after `<Roadmap />`.
- Section title with `.section-title` and `.section-gap`.
- Text: body size, `measure` (68ch cap), left-aligned. A highlighted word, if any, uses `--signal` text
  (counts toward its ~8 per page budget) and never a background.
- Photo: Arthur drops a second file in `public/images/` (suggested `arthur-about.jpg`), `<img>` with
  width/height, `loading="lazy"`, `--radius-panel`, alt text from Arthur.
- No motion beyond the existing section reveal (opacity/translate, reduced motion final).

## Open questions for Arthur

- The paragraphs ([FILL]; never written for him).
- The photo and its alt text.
- Whether the datasheet's leftovers go here (languages, chess, guitar: listed in 01).

## Acceptance

- [ ] Between Roadmap and Experience; same gap as the other sections.
- [ ] No `[FILL]` in shown text (the build enforces it).
- [ ] CLS 0 with the photo; 390px no horizontal scroll.
- [ ] AX tree: heading, paragraphs, one image with Arthur's alt text.
- [ ] `pnpm build` passes.
