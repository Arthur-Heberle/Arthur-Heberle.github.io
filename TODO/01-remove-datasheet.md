# Stage 1: remove the datasheet and the margin notes

Arthur's decision: the datasheet goes, and so do the spine's two margin notes (reading, working on).
Nothing new is added in this stage.

## Remove

**Datasheet**
- `src/home/datasheet/` whole folder: `Datasheet.astro`, `datasheet.css`, `datasheet.ts`, `text.ts`.
- `src/home/HomePage.astro`: the `Datasheet` import and `<Datasheet />`.
- `src/shared/styles/global.css`: the comment and `@import "../../home/datasheet/datasheet.css";`.
- `src/home/home.css`: the comment and any rule that names the datasheet's columns.

**Margin notes on the home spine**
- `src/content/notes/reading.md`, `src/content/notes/working-on.md`.
- `src/home/spine/Spine.astro`: the two `<MarginNote entry=... />`, `getNotes`, the in-text balloons.
- `src/home/spine/spine.ts`: note placing, the leader overlay, the rail `min-height`, if nothing is left
  to place. `spine.css` rules for notes, balloons, leaders, `.rail-spine` likewise.
- `noteDrawings.ts` and `NoteDrawing.astro`: used by the spine notes and the datasheet only (today:
  `spine.ts` imports `makeArt`; `MarginNote.astro` renders `NoteDrawing`). Delete only once a grep
  shows no consumer.
- The `notes` collection in `src/content.config.ts` and `getNotes` in `src/shared/i18n/content.ts`, if
  nothing reads them any more.

**Keep:** `src/home/spine/MarginNote.astro`. `src/projects/ProjectPage.astro` uses it for a project
page's plain note (with `tier1Leaders` in `motion.ts`). If `NoteDrawing` goes, `MarginNote` must still
render without a drawing.

The spine paragraph itself stays for now (stage 3 decides).

## Facts that leave the page with the datasheet

None of these appear anywhere else on the home page today. Arthur decides where, if anywhere, each
goes (hero info in stage 3, About me in stage 5):

- Languages: Portuguese (native), English (advanced), Italian (intermediate), French (basic)
- Graduation: Computer engineering, UTFPR, December 2028
- Students helped: about 4 a week for 12 weeks, in each of two monitor posts
- Location Curitiba, time zone UTC−3, EU citizen, open to global remote (partly in the hero's
  identity list)
- Plays chess, mostly fast games; plays guitar and sings, badly, on purpose
- The four "features" (learns fast, explains things, starts things, wire to web)

Keep a copy of the strings in this file's progress note or in git history; do not write them into new
sections without Arthur's say.

## Docs

- design-spec §6 item 2: datasheet and notes removed (date, Arthur's brief).
- design-spec §5 Layout: drop "margin notes 4 (columns 9 to 12, leaders in column 8), datasheet 10 to
  12" for the home page.
- content.md: mark the datasheet and the two notes as removed.

## Acceptance

- [x] `grep -ri datasheet src` finds nothing; `grep -r "working-on\|reading" src/content` finds nothing.
- [x] Project pages unchanged: their margin note and leader still draw (EduBra, Agente H).
- [x] Home: hero, spine paragraph, bench, Experience, Changelog, Contact in that order; 160px above
      Projects (`.section-gap`).
- [x] No console errors, no horizontal scroll at 390/1024/1440, CLS 0. (Done 2026-11-16: CLS 0.0001-0.0003,
      identical to before the stage; see progress.md.)
- [x] AX tree: no orphan description ids (`aria-describedby` pointing at removed notes).
- [x] `pnpm build` passes; JS total smaller than before (record the figure). 82.0 → 78.5 KB gzip.
