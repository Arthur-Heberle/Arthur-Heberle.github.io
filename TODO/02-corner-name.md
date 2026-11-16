# Stage 2: the name in the corner

Today the way home is `src/projects/OriginLink.astro`: a circle with a crosshair (the "target") plus
"Arthur Heberle", at the top of project pages only. Arthur's decision: **his name, in a different font,
fixed in the top-left corner of every page, home included**, linking home. The target mark goes.

## Build

- New `src/shared/components/HomeLink.astro`, rendered once in `src/shared/layouts/Base.astro`, right
  after the skip link, so every page has it and it is the first stop after "skip".
- `<a href={localePath(lang, '/')}>` with the name as real text (not an image), so the link is named by
  its text. On the home page it still links to `/` (back to the top).
- CSS in a new `src/shared/styles/homelink.css` (one `@import` in `global.css`):
  `position: fixed`, top-left inside the page's side margin (`clamp(24px, 5vw, 80px)` at 768px+,
  16px below), above the content (`z-index`), small enough that it covers nothing it shouldn't.
- Content must not hide under it: either a `--color-ground` backing behind the name, or enough top
  padding on the first section. Check scrolled states, not only the top.
- Focus: the global `:focus-visible` ring, visible over any section it floats above.
- Hover: a quiet change only (opacity or the existing `--signal` text colour, design-spec §5).

## Remove

- `src/projects/OriginLink.astro`, its use in `src/projects/ProjectPage.astro`, and the `.origin-link`,
  `.origin-leader`, `.origin-mark` rules in `src/projects/project.css`.
- `backToHome` in `src/projects/text.ts` if unused (or move it to `src/shared/text.ts` as the link's
  accessible description).

## The font

"A different font" is a type change (design-spec §5 lists one family in two widths plus a mono).
**Ask Arthur which face before building.** If it is a new one:

- self-host a latin woff2 in `public/fonts/` (licence file next to it, like `OFL.txt`);
- `@font-face` in `src/shared/styles/fonts.css`, `font-display: swap`;
- preload it in `Base.astro` (it is on the first screen of every page; without the preload the swap
  re-wraps the name and shifts it);
- add it to design-spec §5 Type with its one job: the corner name.

## Open questions for Arthur

- Which font.
- The exact text: "Arthur Heberle", or two lines (small first name over a larger surname, as in the
  reference), or initials on mobile.
- The home hero's L-bracket origin mark and datum line (`src/home/hero/HeroDrawing.astro`, animated by
  `heroSequence()` in `src/shared/motion.ts`): keep, or drop with the target.
- The i18n stage 2 EN/PT bar uses the same top edge (see README): where the switch sits beside the name.

## Acceptance

- [ ] One link to home on every page (home, EduBra, Agente H, Brasilore if it has a page), named by
      the visible text; no target mark anywhere.
- [ ] Tab order: skip link, corner name, page content.
- [ ] Never overlaps readable text in scrolled screenshots at 390, 1024, 1440 (hero, bench, Experience's
      sticky stage, changelog).
- [ ] Font preloaded; CLS 0 on all pages.
- [ ] JS off: the link works (it is plain HTML).
- [ ] `pnpm build` passes.
