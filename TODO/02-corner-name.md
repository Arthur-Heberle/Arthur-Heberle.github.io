# Stage 2: the name in the corner

Today the way home is `src/projects/OriginLink.astro`: a circle with a crosshair (the "target") plus
"Arthur Heberle", at the top of project pages only. Arthur's decision (2026-11-16):

- **Top left, every page (home included): his name as an SVG he drew**, `arthur-heberle.svg` (repo
  root today; paths only, `viewBox="0 0 449 167"`), linking home. The target mark goes.
- **Top right: the EN/PT language switch** (built by the i18n brief, see below).
- **Both always visible**: they stay on screen while the page scrolls, on a floating layer above the
  content. **No bar, no white or ground-coloured strip behind them.** Only the two elements float.

## Build

- Move the SVG into the source: `src/shared/components/HomeLink.astro` inlines it (so it can take
  `currentColor` and a focus ring), or `public/images/arthur-heberle.svg` as an `<img>`. Prefer inline.
  Strip the `<metadata>` C2PA block (most of its 9 KB); keep the paths. Fix `width="443"` against the
  449 viewBox (size it in CSS instead).
- Rendered once in `src/shared/layouts/Base.astro`, right after the skip link, so every page has it
  and it is the first stop after "skip".
- `<a href={localePath(lang, '/')} aria-label="Arthur Heberle, home">` (label in `src/shared/text.ts`,
  both languages); the SVG inside is `aria-hidden` so the name is read once.
- New `src/shared/styles/chrome.css` (one `@import` in `global.css`) for both floating elements:
  `position: fixed`, top inset equal to the page side margin (`clamp(24px, 5vw, 80px)` from 768px,
  16px below), a `z-index` above every section (check the bench's 3D scene, Experience's sticky stage,
  the project pages' pinned stories), `pointer-events` only on the link itself.
- Size: small, like the reference's corner logo (about 90-120px wide on desktop, smaller on mobile);
  `aspect-ratio: 449 / 167` so it never shifts.
- Legibility with no background: the name is dark on the light page; check it over every section it
  passes (Experience's objects, the bench, project images). If a spot makes it unreadable, tell Arthur
  and offer options (a soft shadow, a tiny blur-free halo); **no bar** without his say.
- Hover: a quiet change (opacity). Focus: the global `:focus-visible` ring.

## Remove

- `src/projects/OriginLink.astro`, its use in `src/projects/ProjectPage.astro`, and the `.origin-link`,
  `.origin-leader`, `.origin-mark` rules in `src/projects/project.css`.
- `backToHome` in `src/projects/text.ts` if unused.

## The language switch

The i18n brief (progress.md, "Portuguese version + EN/PT switch", stage 2 not built) planned "a thin
bar at the top that scrolls with the page". **Superseded by this decision:** the switch is a single
floating element in the top-right corner, always visible, no bar. Whichever stage lands first builds
`chrome.css`; the other reuses it. If the switch is not built yet, leave the right corner empty.

## Ask Arthur at the start of the stage

- Whether the SVG file is final.
- Desktop and mobile size (show two screenshots).
- What happens to the home hero's L-bracket origin mark and datum line
  (`src/home/hero/HeroDrawing.astro`, animated by `heroSequence()` in `src/shared/motion.ts`).

## Acceptance

- [ ] One link home on every page (home, EduBra, Agente H), named once ("Arthur Heberle, home");
      no target mark anywhere.
- [ ] Stays in the top-left corner while scrolling, no bar or strip behind it, at 390, 1024, 1440.
- [ ] Readable over every section it passes; never hidden behind a 3D scene or a pinned story.
- [ ] Tab order: skip link, name, page content.
- [ ] CLS 0 on all pages; the SVG has its aspect ratio from first paint.
- [ ] JS off: the link works.
- [ ] `pnpm build` passes.
