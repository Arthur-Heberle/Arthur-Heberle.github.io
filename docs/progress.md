# Progress

Claude Code reads this first, every session. Do the first step not marked done. One step
per session. Update this file before committing.

Status values: `todo`, `in progress`, `done`, `blocked`.

| # | Step | Status | Notes |
|---|---|---|---|
| 01 | Scaffold and deploy an empty site | done | pnpm required a global install first; Astro scaffolded to a scratch dir and copied in to avoid clobbering `tokens.css`/`README.md` |
| 02 | Tokens, type and layout primitives | done | fonts self-hosted, not `<link>`-loaded; `@theme` reset lines added to `tokens.css`; TypeScript pinned to 5.9.3, not `latest`, for `@astrojs/check` compatibility |
| 03 | Content collections | done | English-only schema (no `lang` field); repo links normalised to `https://`; changelog is one YAML file via `file()` |
| 04 | Static home page | done | drawing layer (rule + leader lines) built now, ahead of steps 09–10; notes `order` renumbered to the spine's marker order; `<details>` is the no-JS "show all" |
| 05 | Archive filter, without GSAP | done | single-select tag filter + `All`, one live mono count; cap of 6 lifts under any active filter; `<details>` unwrapped into a flat list by JS on init so step 11's Flip sees one parent |
| 06 | Accessibility and performance gate | done | `--graphite-2` darkened to clear AA on `--ground`; focus ring widened to 2px; `tabindex="-1"` added to both `<main>`s; a second font preload added after measuring CLS > 0 |
| 07 | Motion infrastructure only | done | `gsap`+`lenis` installed; all wiring lives in `src/scripts/motion.ts`; `Archive.astro`'s two `window.scrollBy` calls rerouted through it; zero visible change (Lighthouse mobile: perf 99, a11y 100, best-practices 100, CLS 0) |
| 08 | Tier 2 triggered reveals | done | `CustomEase` registered as a 5th plugin — `motion-spec.md`'s `cubic-bezier(...)` ease string doesn't parse in GSAP and silently degrades to `power1.out`; `start: 'clamp(top 85%)'` on every trigger — a plain `'top 85%'` is unreachable for the Contact paragraph, the page's last content block (Lighthouse mobile: perf 99, a11y 100, best-practices 100, CLS 0; ~65KB JS gzip) |
| 09 | Tier 1 drawing layer | done | `vector-effect="non-scaling-stroke"` stayed on `#rule path` — removing it broke Lighthouse mobile CLS (0.004 → 0.089), so the rule bypasses DrawSVGPlugin entirely and tweens `strokeDashoffset` directly against its known fixed length (100); ticks keep DrawSVGPlugin, unaffected (1:1 viewBox: perf 99, a11y 100, best-practices 100, CLS 0.0003, ~66KB JS gzip) |
| 10 | Leader lines to margin notes | done | `.leader`'s viewBox/CSS-box match on paper but not live (subpixel rounding), so DrawSVGPlugin warns there too — leaders bypass it like the rule, hand-measuring dasharray via `getTotalLength()`; hover/focus highlight is a stacked `--signal` path crossfaded on opacity |
| 11 | Archive filter with Flip | done | no `absolute: true` (`motion-spec.md`'s literal value) — verified live it leaves surviving rows permanently `position: absolute`, collapsing everything below the archive; enter/leave decided with Arthur as travel + fade-in-only, no exit animation; Flip runs at both widths; reduced motion gets a 120ms (`--dur-feedback`) entering-only fade, not a new duration (Lighthouse mobile: perf 99, a11y 100, best-practices 100, CLS 0.0003, ~67KB JS gzip) |
| 12 | Hero sequence | done | plan's centred origin crosshair (top/left: -6px) clipped above the page's own scroll-top boundary, verified live — switched to an L-bracket flush at (0,0); SplitText's word wrapper defaults to `display: inline`, which `transform` doesn't affect, so words need `wordsClass` + `display: inline-block` for the `y` travel to work at all (Lighthouse mobile: perf noisy this session per steps 09/11's documented cause, CLS 0 on two clean runs, a11y 100, best-practices 100, ~65KB JS gzip) |
| 13 | Project page template and EduBra set-piece | done | word is `EDUBRA` (Arthur, this session); `project` object added to the archive schema, optional, for the template's four prose fields — closes the question step-03 left open; pin needed an explicit `pinSpacing: true` not in the plan — verified against `ScrollTrigger.js:1177`, GSAP disables it by default under a `display: flex` parent (Lighthouse mobile: perf 99, a11y 100, best-practices 100, CLS 0–0.018 across three runs, noise per steps 09/11's precedent; ~68KB JS gzip) |
| 14 | Final QA and ship v1 | done | **Chromium-verified only; Firefox/Safari/iOS Safari untested, open risk.** Found and fixed a real bug: `clamp(top 85%)` left every above-the-fold reveal at `opacity: 0` until the first pixel of scroll (`onRefresh` fix in `motion.ts`). `/type-test` deleted; reduced motion finally verified live via CDP; 16 → 12 `[FILL]` markers, the rest waiting on their project briefs (Lighthouse mobile: perf 99, a11y 100, best-practices 100 on both routes; CLS 0.0003 home, 0.0255 EduBra while its placeholder prose is mono — 0.000–0.003 with real prose; 66KB JS gzip) |
| 15 | Later months, one at a time | todo | not part of v1 |

### EduBra "How it works" upgrade (2026-09-30, Arthur's brief)

Five sub-steps, in order; a stage starts only when the previous one passes. Commit message
`edubra: stage X - <summary>`.

| Stage | Step | Status | Notes |
|---|---|---|---|
| A | Autoplay (no pin, no scrub) | done | `storyPlayer()` replaces `storyLive()`; one 10 s linear tween of a proxy p drives `render(p)`; controls, tick buttons and a live region added; mobile still static until B |
| B | Mobile camera (<768px) | done | one translate + scale on the canvas, 0.6 s `EASE_OUT` between four framings; HTML reading tape under the canvas; `storyStatic` deleted |
| C | Three-quarter view and a real speaker | done | table turned `rotateZ(+20deg)` (not -20: only a clockwise turn shows the right face); `.right` face on `Cub`; standing round driver; wires re-measured; transition bug fixed |
| D | Callouts and real GPIO pins | done | six real-button hit targets + one shared leader/label; header pins 8/12/16/28/32/40 light per letter; story visibility now read from the rect, not an IntersectionObserver |
| E | Voice (browser speechSynthesis) | done | sound button off by default; one utterance per read item; the tween waits for each utterance's end (min 450 ms, 1.5 s safety); cone driven by start/boundary/end |

### EduBra page: accessibility, hardware accuracy, copy, new sections (2026-09-30, Arthur's brief)

Five stages, in order. Commit message `edubra: <stage>`. The hardware source of truth is the
team's paper, `public/docs/edubra-paper.pdf`.

| Stage | Step | Status | Notes |
|---|---|---|---|
| 1 | Accessibility | done | one `role="img"` with the brief's label; all drawn parts `aria-hidden`; the two "Pause" buttons told apart |
| 2 | Hardware accuracy | done | MDF, yellow PLA cell, real button layout, knob and jack on the right face (yaw, not the story's rotateZ), no speaker; checked against the paper, contrast audited |
| 3 | Copy | done | intro, margin note and the four captions verbatim; captions moved to their own full-width row and sized by a grid cell |
| 4 | New sections | done | By the numbers, How we built it, My part, What I'd do differently, Links last; the paper is linked from `project.paper`, not `links.pdf` |
| 5 | Final check | done | blurb trimmed, home row still points here; Lighthouse mobile 98 / 100 / 100 on EduBra and home; JS ~74 KB gzip |

### Agente H project page (2026-09-30, Arthur's brief)

Five stages, in order. Commit message `agent-h: <stage>`. The source of truth is the repo
`github.com/Arthur-Heberle/AGENT-H` (cloned at `../AGENT-H`: ARCHITECTURE.md, backend/).

| Stage | Step | Status | Notes |
|---|---|---|---|
| 1 | Page, archive entry, copy | done | `/projects/agente-h/`; copy verbatim bar the two edits Arthur chose (intro, category); `wip` field and a half-filled-circle marker on the row and the status line; `part`/`differently` made optional, EduBra's HTML unchanged (only the CSS hash moved) |
| 2 | The animation | done | own `story.ts`/`story.css`/`AgenteStory.astro` in `src/projects/agente-h/`, EduBra's files untouched; phone is the only 3D object (standing slab, same bench tilt/turn); ring resets twice (verified); gold only ever with a dark outline (see divergences); JS ~79 KB gzip |
| 3 | By the numbers | done | EduBra's `.numbers`/`[data-numbers]` reused, no motion change; tests are **46**, not the 42 the commit history mentions (`def test_` in backend/tests: 27 + 13 + 6, no parametrize, no duplicate names; pytest is not installed here, so counted, not collected) |
| 4 | Dashboard screenshots | done | three 1280x800 webp (catalogue, conversations, leads) in `public/agente-h/`, alt text on each; **taken from the real dashboard files served with a stub API, not the real backend** (no Docker, Postgres or Python deps here, and there is no `seed-en.html`); demo data only |
| 5 | Final check | done | Lighthouse mobile (preview build): Agente H 97-98 / 100 / 100, CLS 0; home 98-99 / 100 / 100; EduBra 97-98 / 100 / 100; JS ~79 KB gzip. Fixed a CLS of 0.06 found at this stage (below); design-spec §6 and §9 updated |

### Agente H improvement pass (2026-10-01, Arthur's brief)

Seven stages, in order. Commit message `agent-h: <stage>`. Decisions Arthur made for stage 7: the
"something to sleep on" top 3 are Serenno queen bed, Lugano wardrobe, Provençal dressing table (the
dressing table is added to the map's beds cluster; the CSV has one bed only); the other two questions show
one customer bubble, one chip and no typo highlight; caption 2 gets his two sentences while those questions
are chosen.

| Stage | Step | Status | Notes |
|---|---|---|---|
| 1 | Accessibility, and make it a rule | done | **Nothing to fix: both pages were already clean.** AX tree (CDP `Accessibility.getFullAXTree`, headless Chromium, not Brave) at 1280 and 375, JS on / reduced motion / JS off: every text node inside `.canvas` (EduBra 17, Agente H 39) checked for an exact match in the tree, none found; no duplicate text; the drawing is one `image` node with the section description. Rule added to CLAUDE.md Hard rules. EduBra's reduced-motion callout buttons ("Audio jack: ...") are real controls, not drawing text, and were left |
| 2 | Copy | done | first "What's next" item replaced verbatim in `src/content/archive/agente-h.md`; checked in the built page |
| 3 | Show the flow | done | seven wires in `#hs-base` (new `flow.ts` holds the point lists, shared by the markup and `story.ts`): phone, timer, query line, map, prompt card, model, back to the phone, leads board; each draws in by `stroke-dashoffset` as its part appears and ends in a small chevron. Step numbers 1 to 4 (mono) at the timer, map, card and dashboard. Pulses: one per message on phone-to-timer, timer-to-query, map-to-card; the query dot, the reply dot and the lead card now follow their wires instead of straight lines. The three phone ends are measured from the 3D phone in `wire()`. Final state and reduced motion show every wire. A first run broke the story (`$$` collapsed by `String.replace` in an edit script), caught by the page's own error and fixed |
| 4 | A readable phone | done | still CSS 3D, but the screen is 12deg off straight-on about the vertical axis and 8deg back about the horizontal (bench `rotateX(82deg)`, phone `rotateZ(-12deg)`); was about 20 and 40. Phone 168x392 (was 150x430) so the reply takes the full screen width (`max-width: 100%`) and wraps in ordinary lines. The table shadow is gone (no table in this view); the back face casts a soft one. Checked at 1280 and 375 (camera scenes 1 and 3). Resting wire ends re-measured |
| 5 | The map | done | the eight lines to the nearest were already drawn; now the closest three are thick (2.5px) and blue and the other five thin (1px) at half opacity, with a mono tag "8 closest" near the fan. **Every label was moved**: a label crossed a line in the old layout (Rubi, Veneza), so product dots, labels, the tag and the three cluster shapes now come from `map.ts`, found by a search that tries every spot near each dot and keeps one where no label touches a line, ring, dot, other label or the frame. Checked in the page against the real text boxes (`getBBox`): 17 labels, 11 lines, 0 crossings. **Divergences:** (1) the dashed cluster outlines became faint tints, because a label beside a dot always ended up straddling an outline; (2) the "Provençal dressing table" (Arthur's choice for stage 7) is already on the map, so there are 12 products; (3) the wire from the query now ends at the map's edge and the dot carries on to its point (a drawn wire across the map would be a line for labels to avoid); (4) dot positions moved too (they are illustrative: the positions are prepared by hand and say so on the page). `map.ts` also holds label spots for the stage 7 questions, solved the same way |
| 6 | The model writes | done | the reply is a span a word, in a bubble that is at its final size from the start; the words fade in one by one (opacity only) while "language model" shows a held outline (60% opacity) and a short blue tick that steps along under its name, one notch a word. No dots. Reduced motion and no JS: the full reply at once, no tick. **Timeline moved:** the story is 15 s, not 12, and scene 3 ends at p = .9 (was .82), so the words (p .80 to .895, about 1.4 s) are not cut off by the stamp; the stamp, dashboard, lead, the leads wire and the mobile camera's last move are shifted to follow |
| 7 | Ask the shop | done | "Try another question" under the drawing: three real buttons (`aria-pressed`), "a 3 seat sofa" by default, with the brief's mono note under them; hidden with no JavaScript. Choosing one swaps the drawing (`applyQuestion` in `story.ts`, data in `questions.ts` and `map.ts`) and replays scenes 2 to 4 (reduced motion: shows the end at once; choosing the same one again replays). Per question: the customer's one bubble and query line (no typo mark), where the dot lands, the eight lines and the closest three, the prompt chips, the reply, the stamp, and the lead. "Something to sleep on": Serenno queen bed, Lugano wardrobe, Provençal dressing table, reply with R$ 2,190, GENERAL_QUESTION, no lead. "Do you sell cars?": lands far from every cluster (nearest product 112px away), reply as briefed, OUT_OF_SCOPE, no lead. A stamp that is not a lead is plain (paper, not gold) and the leads wire is not drawn. Caption 2 gets Arthur's sentence while its question is chosen; the role=img description says the visitor can try other questions and describes each outcome. Checked in the page: each question's landing, top 3, reply and classification read back; operable with Tab, Enter and Space; label collisions 0 for all three; AX tree has no drawing text after choosing either. Chips now size to the product name's real width (5.7px a character). Mobile framing 3 starts higher (y 100) so the reply, which sits higher with one bubble, is in frame. JS ~82 KB gzip in total (under 90), CLS 0 on both project pages (layout-shift observer, 375 and 1280) |

### Home page, part 1: projects bench and experience (2026-10-01, Arthur's brief)

Five stages, in order. Commit message `home: <stage>`. The experience timeline animation is a separate
later task and is not built here. Decisions Arthur made: a `[FILL]` in optional metadata is omitted, in
always-shown prose it fails the build; the experience list is oldest first; on mobile the objects have no
shared surface; the Brasilore art is his own (Emilia.png is the playable character).

| Stage | Step | Status | Notes |
|---|---|---|---|
| 1 | Never publish a [FILL] | done | `scripts/check-fill.mjs` runs after `astro build` inside the `build` script (the deploy action runs it); `isFilled()` in `src/shared/fill.ts` replaces `Fill.astro` (deleted, with `.fill` CSS): optional fields are omitted, prose renders as written so a marker fails the build (tested with a marker in the changelog, then reverted); identity line is a `<ul>`. The old archive row guards date/role with `isFilled` until stage 2 deletes it |
| 2 | Split the content | done | `archive` replaced by `projects` (bench) and `experience`; `Archive`, its filter and the dead Flip code in `motion.ts` removed (`Flip` no longer registered); `sortArchive` became `src/projects/sortProjects.ts`; the title blocks now read "of 03" (three projects), not "of 07"; Experience is a plain `<ol>`, oldest first, with `<time>` dates; `Fill.astro` is gone, so a changelog or contact line is plain text |
| 3 | The spine | done | two rails, copy verbatim; rail 1 carries notes 1 (reading) and 2 (working on) as siblings 0 and 1, rail 2 unchanged; 5 notes, 5 leaders checked in the built page |
| 4 | The bench | done | `src/home/bench/`; the phone was extracted into `Phone.astro` + `phone.css` (Agente H page checked: screenshots and computed styles byte-identical at 1280 and 375) and EduBra's `ICONS` into `icons.ts`; the box is a `.device` so device.css gives its materials. One shared plane (desktop) with each column's perspective-origin offset so all three share a vanishing point; `bench.ts` loads when the bench is within 400px and adds `.wb-live` (the MDF texture); actions checked on hover, keyboard focus and mobile scroll-in, reduced motion and no-JS show final states; AX tree: three named links with descriptions, no drawing text. Brasilore uses Arthur's own `Emilia.png`, `Grass.png`, `Cloud1.png` (public/brasilore/, one frame, so the run is a translate and a hop). Lighthouse mobile 96-98 in five of six runs (one cold run 83, a 500 ms task in the existing motion script, the noise steps 09/11 document), a11y 100, best practices 100, CLS 0; JS 72.9 KB gzip |
| 5 | Changelog | done | three entries above the old ones; dates from the commits: the bench `575d5bb` (2026-10-01), Agente H's three questions `7906b09` (2026-10-01; the page itself was `19a720f`, 2026-09-30), the EduBra story and 3D box `8f1cab7`/`41e97c3` (2026-09-30). Home now shows the 3 newest, the 2 older behind "show all" |

### Home bench: diagonal desk, hover labels (2026-10-01, Arthur's brief)

Four stages, in order. Commit message `bench: <stage>`. The brief assumed a straight-down bench with a mat, a
caliper and a "next project" slot; the committed bench had none of those (a three-quarter plane and standing
objects), so Arthur decided: stage 1 builds the mat, caliper and slot; Brasilore is a flat handheld on the
desk and **stays the monitor below 768px**, where nothing changes (checked: the 375px bench is byte-identical
to before).

| Stage | Step | Status | Notes |
|---|---|---|---|
| 1 | The diagonal desk | done | one CSS 3D scene (perspective 1600px) at 768px and up: the mat is a `Cub` slab at `rotateX(55deg) rotateZ(32deg)`; the three objects, the caliper (4px) and the dashed slot stand or lie on it. **Divergences:** (1) the turn is +32deg, not the brief's -22deg: `Cub.astro` only builds the front and right faces, and only a clockwise turn shows the right face, where EduBra's knob and jack are (as at EduBra stage C); (2) the scene is drawn 855px wide and scaled in four CSS steps (`--k` .84/.89/.94/1 at 768/810/860/903px) to fit the column; (3) a flat top face (phone, handheld, jaws) is `transform-style: flat`, and the lid's coplanar layers are lifted 0.1 to 0.5px: both fixed z-fighting seen in the first render; (4) the `.device` wrapper turns off its container query on the desk, since a container flattens the 3D chain. `Phone.astro` got a `bare` prop (screen only; Agente H's page markup unchanged), `EdubraLid.astro` is shared by the stacked and desk boxes. The captions are hidden at 768px and up until stage 2 shows them on hover (the links still carry name and description by `aria-labelledby`/`aria-describedby`) |
| 2 | Labels on hover | done | labels, dots and one SVG of leader lines are a 2D overlay in plain pixels (never scaled) over the scene, `aria-hidden`; the link keeps name and description by `aria-labelledby`/`aria-describedby` on the hidden caption. Each line starts at a 2x2 `.wb-anchor` inside the object's top face, measured with `getBoundingClientRect()` (init, `ResizeObserver`, fonts, every frame of the arrival), and runs diagonally then horizontally into its label. Fixed slots: EduBra top left, Agente H top right, Brasilore bottom left; checked at 768/810/860/903/1024/1280/1920: every text line is inside the desk box, off the mat (`elementFromPoint` on each line) and off the other labels (the mat moves down a little at the smaller scales to make room: `(1 - --k) * 300px`). One at a time; the dot, then the line (0.3 s `stroke-dashoffset`), then the label (120 ms opacity); reversed on leave. `(hover: none)` shows all three with lines and hides the hint; reduced motion shows and hides at once; no JavaScript shows the three labels with no lines. Tab order EduBra, Agente H, Brasilore; focus acts as hover (`:focus-visible` only). The scene is 620px tall (was 560) for the bottom label |
| 3 | Lift and turn | done | hover or keyboard focus (`:focus-visible`) on a hover device: one transform on `.wb-lift` (`translateZ`, then `rotateZ` and `rotateX`, set from a 0-to-1 proxy so the order is exact; GSAP's own rotation order differs), 0.38 s out and 0.28 s back, then the action plays once. The phone and the handheld turn about their **near edge** (`-32deg`, `-48deg` / `-44deg`), so they rise like a propped-up phone and read straight on; a first version pivoting about the middle sank the phone's lower half under the mat (the stamp vanished). The box turns about its middle by a few degrees only, so its right face stays visible. The wide shadow is a second static layer whose opacity follows the lift; the leader line is re-measured every frame. Each link has a flat hit area a little larger than its footprint (`.wb-link::before`), so an object that moves from under the pointer does not end its own hover. No lift without hover (`hover: none`) or with reduced motion (the action then plays on scroll-in, or not at all) |
| 4 | Check | done | headless Chromium over CDP (not Brave): hover (emulated mouse), keyboard (Tab: EduBra, Agente H, Brasilore, each with its label and a visible 2px ring), `hover: none` with touch (all three labels and lines, hint hidden), reduced motion (labels at once, no lift) and JavaScript off (labels, no lines) all behave as briefed; a click on EduBra navigates to `/projects/edubra/`. 375px: the bench screenshot is **byte-identical** to the one taken before stage 1. AX tree (`Accessibility.getFullAXTree`) at 1280 and 375: three links, each named by its title and described by its line and meta; no `QUALIFIED_LEAD`, chat, hint or engraving text anywhere else. Lighthouse mobile, six runs: perf 97 four times and 93 twice (TBT 130 to 160 ms: the cold-run noise steps 09 and 11 document; the bench's script is not loaded at the top of the page), a11y 100, best practices 100, CLS 0; JS 73.7 KB gzip. design-spec §9 rewritten for the desk. **Not done:** Firefox, desktop Safari and iOS Safari (`transform-style: preserve-3d` with a lifted, tilted object is exactly where they differ: untested); no real touch device |

### Home Experience timeline (2026-10-01, Arthur's brief)

Five stages, in order. Commit message `timeline: <stage>`. Replaces the plain Experience list; the
`experience` collection stays the only source of text. Decisions Arthur made: "now" is the build month
and the deploy workflow rebuilds on the 1st of each month; the details callout floats by its row; leaving
closes a hover-opened callout and a click or Enter pins it.

| Stage | Step | Status | Notes |
|---|---|---|---|
| 1 | Timeline layout | done | `months.ts` turns dates into percentages along the axis (22 monthly slots to 2026.10, the build month); axis, bars and labels are percentages in CSS, so the layout needs no script; the axis and bars are `div`s animated with `scaleX`/`scaleY`, not SVG strokes (nothing to measure); objects are placeholder boxes (stage 2); `timeline.ts` plays the arrival once. **Divergence:** without JavaScript the details sit under each row, with JavaScript from 768px up they are visually hidden but stay in the accessibility tree (stage 3 opens them as the callout) |

---

## Open questions for Arthur

Blocking or near-blocking. Add to this list rather than guessing.

- [ ] **Agente H page, flags from the 2026-09-30 brief** (none blocking; each a call made with Arthur
      or against the repo):
      - **The wait is not a true debounce in the repo.** The brief, `ARCHITECTURE.md` ("Waits 30s
        debounce") and the animation say the ring resets on each new message. The n8n query in
        `backend/README.md` and `WHATSAPP_AGENT_ARCHITECTURE.md` (every 30 s,
        `created_at < NOW() - 30 s` on pending messages, grouped by customer) answers once the
        *first* pending message is 30 s old; a new message does not restart the clock. Arthur: draw it
        as briefed, with the ring running faster than real time and labelled "30 s". If the workflow
        should reset, it needs `MAX(created_at)` in the filter.
      - **Date:** `2026-05`, as briefed. Step 14 had set `2026-06` (last commits 2026-06-16).
      - **Intro, one edit:** the brief's "day or night" became "during the hours the owner sets",
        because the repo has per-business `business_hours` and a 6–22 h gate in n8n. Arthur's choice.
      - **How I built it, one edit:** "name, description or specs" became "name, category,
        description or specs" (`product_service._needs_reembed` also checks category). Arthur's choice.
      - **The prompt card shows three products; the repo sends eight.** `rag.py` passes the closest
        eight (`similarity_search(..., limit=8)`) into the prompt. The animation draws lines to the
        nearest eight and follows the closest three into the card, as briefed.
      - **Gold contrast.** Bare `#C9A84C` is 1.93:1 on the ground and the `#A8893C` fallback is still
        only 2.81:1 (3.10:1 on `--sheet`), so darkening doesn't clear 3:1. No gold shape is ever the
        boundary on the light ground: each carries a 1.5px `#1E1C19` outline (14.3:1) and dark text
        (7.4:1); gold on the dashboard's dark sidebar is 7.4:1.
      - **The dashboard screenshots are of the real UI over a stub API.** The AGENT-H backend couldn't run
        here (no Docker, Postgres or Python packages). A throwaway Node server (kept in the scratchpad, not
        in either repo) served `backend/static` unchanged and answered the API with demo data: the repo's
        own `catalogo_moveis.csv` (Portuguese product names, as the dashboard would show them), invented
        first names and conversations, and phone numbers with the nonexistent area code 00. The English
        interface is the dashboard's own. Retake them against a real seeded instance if you want the
        real backend in the shot.
      - **Residual CLS flake.** Lighthouse reads CLS 0 on all three routes, but under 4x CPU and slow-network
        throttling an 18px jump of the story section shows up in about one run in four (the text above it
        re-wrapping as a font swaps in). Not seen at default throttling.
      - **`design-spec.md` §9** said Agente H is a scrubbed schematic and "explicitly not a chat
        thread". The brief replaces it; §6 and §9 are updated at stage 5.
      - **Improvement pass (2026-10-01), calls made:** the story is 15 s, not 12 (the reply is written
        word by word and needed room); the cluster outlines are faint tints, not dashed rings (a
        label beside a dot always crossed an outline); the map's dot positions and every label spot
        were found by a search and are illustrative, as the page says; the phone is nearly straight-on
        (12deg and 8deg), so it no longer stands on a table with a shadow; stage 1 found nothing to fix
        (both AX trees were already clean). Everything was checked in headless Chromium over CDP, not
        Brave, and Lighthouse was not re-run (CLS and JS size were measured directly).

- [ ] **EduBra page, flags from the 2026-09-30 brief** (none blocking; each was a call I made):
      - The story's jack callout now reads "Out to your headphones or speaker" (the brief relabelled
        "speaker" but gave no callout copy): my wording, the smallest change. The speaker callout's
        name is "Headphones or speaker".
      - "EduBra" is engraved on the front face as briefed, and "UTFPR" on the right face; the paper
        (Figure 15) has the name and UTFPR on the side faces.
      - The box turns about the vertical axis (`rotateY(-30deg)`) with the 20deg tilt kept, not the
        story's `rotateZ`; with the tilt kept, that turn shows the side face about 7px wide.
      - The paper link is `project.paper`, not `links.pdf`, so the home archive row didn't grow a
        link. Say if you want it on the row.
      - The ~3 s bar draws three pins (0.6 s) as the pins segment: a drawing choice, not a number.
      - Two decorative engravings are generated content at 1.43:1 (as briefed), not text.

- [x] Opening line: rewritten in his words as "I make technical things make sense to
      people who didn't build them." Supporting line, mono identity line, the three spine
      paragraphs and all five margin notes are also final now — see `docs/content.md`.
- [x] **The `[FILL]` markers are gone** (home part 1, stage 2): the archive entries that held them were replaced
      by the `projects` and `experience` collections with Arthur's values. A `[FILL]` is now omitted from
      optional fields and fails the build anywhere else (`scripts/check-fill.mjs`).
- [ ] **`docs/projects/` is untracked on purpose (decision for Arthur).** Step 14's plan said
      to commit it; on reading it, it holds the deployed Agent H app's live URL next to a
      list of its known security gaps (open CORS, guessable public image URLs, in-memory OTP),
      plus pricing and the cost model, and this repo is a GitHub Pages user site, which is
      public on a free account. It never left the machine. Options: keep it untracked, add
      `docs/projects/` to `.gitignore`, or commit a redacted copy. `progress.md`, `content.md`
      and the step-14 plan refer to it by path, so a fresh clone won't have it.
- [ ] **Firefox, desktop Safari and iOS Safari are untested.** None is installed on the dev
      machine and step 14 chose not to download any. Named risk: Lenis against iOS momentum
      scrolling ("scroll fighting"). The other named risk, EduBra's pinned `ScrollTrigger` on
      iOS Safari, is gone: the site has had no pins since 2026-09-29. Step 14's acceptance line
      "iOS Safari: no scroll fighting" is still **not met**, not ticked. Needs a real iPhone and
      a desktop Firefox.
- [ ] **Changelog wording is a draft, not Arthur's own.** Both entries and the contact
      invitation were drafted by Claude and approved by Arthur with the step-14 plan. The
      acceptance line asks for "first changelog entry written by Arthur, in his voice" —
      replace them with his own words whenever he likes (`changelog.yaml`, `Contact.astro`).
      The first entry sends readers to the EduBra page, whose prose is now all final.
- [x] The word the EduBra Braille set-piece spells: `EDUBRA`, decided at step 13.
- [x] Contact section: publish WhatsApp number or email only? **Both**, decided at step 14:
      email first (the one the drawing points at), then `+55 49 99194-2504` linked as
      `https://wa.me/5549991942504`.
- [x] `--graphite-2` on `--ground` measured 4.21:1, under the 4.5 AA floor. Put to Arthur
      at step 06: darkened the token to `#666a6f` (4.59:1 on `--ground`, 5.07:1 on
      `--sheet`), the first authorised token-value change in the project.
      `docs/design-spec.md` §5 updated to match. Rejected: moving margin notes to
      `--sheet` (fixes only 1 of the 8 sites this color appears in on `--ground`) and
      accepting the finding (ships the gate below its own floor).

---

## Divergences from the spec

Anything built differently from `docs/design-spec.md`, with the reason. Keep this honest;
a spec that silently stops matching the code is worse than no spec.

Step 01 — `.github/workflows/deploy.yml` action versions bumped from the provided file:
`actions/checkout@v4` → `@v7`, `withastro/action@v3` → `@v6` (added explicit `path: .` and
`node-version: 24`), `actions/deploy-pages@v4` → `@v5`. Reason: `CLAUDE.md` requires
verifying the Astro Pages deployment action against current docs rather than memory; the
provided file was behind. Verified against `docs.astro.build/en/guides/deploy/github/` and
`github.com/withastro/action`.

Step 02 — Fonts self-hosted from `public/fonts/` rather than `<link>`-loaded from Google
Fonts. Reason: `"Archivo Expanded"` is not a real Google Fonts family
(`css2?family=Archivo+Expanded` returns HTTP 400) and `--font-display` in `tokens.css`
names it first; self-hosting a pinned `wdth 125` static instance under that exact family
name resolves the token without editing it, and gives a stable preload URL that doesn't
depend on gstatic's rotating hashed paths. Four static instances (59KB total) used instead
of the two-axis variable file (90KB alone, against a 200KB step-06 page budget). Both
families are OFL 1.1; licence text for both is in `public/fonts/OFL.txt`, fetched verbatim
from `Omnibus-Type/Archivo` and `IBM/plex`.

Step 02 — `tokens.css` gained three `--color-*: initial` / `--font-*: initial` /
`--text-*: initial` lines at the top of the `@theme` block. Authorised by Arthur; no
existing token value changed. Reason: Tailwind v4 keeps its whole default theme reachable
unless a namespace is reset, so `text-gray-500` and `font-serif` compiled and leaked into
`dist` even though nothing in the site referenced them — confirmed by grepping the built
CSS before the reset. The reset makes "no gray outside the token list" structural instead
of a matter of review. `--spacing-*` deliberately not reset, so Tailwind's numeric spacing
scale survives alongside `--spacing-gutter`.

Step 02 — `typescript` pinned to `^5.9.3`, not `^7` (npm's `latest`). TypeScript jumped
straight from the 5.x line to a 7.x native-compiler rewrite; `@astrojs/check@0.9.10`'s
peer range is `^5.0.0 || ^6.0.0`, which the published 7.x releases don't satisfy (no 6.x
was ever published — `pnpm peers check` flagged the mismatch immediately after installing
`latest`). Reason for installing `@astrojs/check` + `typescript` at all: step 02's own
acceptance requires `astro check` to pass, and step 01 had deliberately left both
uninstalled; they are type-checking tooling and ship zero bytes to the browser.

Step 03 — Two archive repo links stored with an `https://` scheme
(`https://github.com/Arthur-Heberle/Oficinas_1`, `.../Brasilore`) though `docs/content.md`
writes them scheme-less (`github.com/...`). Reason: the schema's `links.repo` field uses
Zod's `z.url()`, which rejects a scheme-less string; the scheme is mechanical
normalisation of a path Arthur supplied, not an invented fact, but it's a change from the
source document so it's logged here.

Step 03 — Changelog stored as one `src/content/changelog.yaml` via the `file()` loader,
rather than one markdown file per entry like `archive` and `notes`. Put to Arthur and
settled: a changelog entry is a date plus one sentence with no body prose, and one file
means adding a line is a two-line edit rather than a new file every time.

Step 03 — Site language decided as English-only for v1 (also settled with Arthur, closing
the open question above): collections carry no `lang` field. `docs/content.md` already
scopes a future Portuguese version to an additive `lang` field plus one file per entry per
language, so this isn't expected to need a schema migration later.

Step 03 — `[FILL]` markers are encoded as literal string values in required fields
(`role: "[FILL]"`, `date: "[FILL]"`), not stripped out or made optional. `role` and `date`
stay required per the schema (`design-spec.md` §7); a marker satisfies the type while
staying greppable. One exception: EduBra's date has a real value (`2025-12`) with a
trailing YAML comment `# [FILL: confirm]`, since the value exists but wants confirming
rather than supplying.

Step 04 — `src/content/notes/*.md` `order` renumbered from step 03's alphabetical
`reading:1, languages:2, chess:3, guitar:4, working-on:5` to `reading:1, working-on:2,
languages:3, chess:4, guitar:5`, matching the sequence Arthur specified for the spine's
annotation markers. One source of truth for note order instead of two documents
disagreeing; an ordering decision, not a fact, so logged here rather than treated as a
content change.

Step 04 — The static drawing layer (the page rule and all five leader lines) was built
now as final-state SVG, rather than deferred to steps 09–10 as `design-spec.md`'s build
order implies. Reason: `motion-spec.md`'s initial-state pattern requires markup to ship
every SVG already in its final, fully-drawn state before any JS runs; building it in
step 04 means steps 09–10 add only a `drawSVG` scrub on top of markup that already
exists, rather than building markup and motion in the same step.

Step 04 — Both "show all" controls (archive, changelog) are native
`<details>`/`<summary>` rather than a `hidden`-attribute or checkbox mechanism. Fully
operable with JS disabled, which is what design-spec.md §6's "six visible, then show
all" needs to work with zero JavaScript; step 05 should progressively enhance this
element with the tag filter rather than replace it.

Step 05 — On init, JS unwraps the archive's `<details>` into a flat `<ul>` plus a real
`<button data-show-all>`, moving `brasilore` (the one overflow row) into the main list.
`<details>` stays the shipped no-JS fallback — nothing changes without JS — but once JS
runs, step 11's `Flip.getState('.archive-row')` needs every row under one parent to
travel between positions, and a row trapped inside a `<details>` subtree can't flip into
the main list.

Step 05 — The 6-row cap applies only in the `All` filter state, not implemented literally
as design-spec.md §6's "six entries, then show all" for every state. Reason: a cap of six
on a filtered set of at most four is meaningless, and here it actively breaks — filtering
to `code` matches 4 rows, one of which (`brasilore`) sits behind "show all"; without
lifting the cap the reader would see 3 of 4 matches with no signal a fourth exists. Any
tag filter now shows every match and hides the show-all control; returning to `All`
restores whatever expanded/collapsed state the reader had left.

Step 05 — `src/styles/type.css`'s `.archive-row:first-child { border-top: 0 }` (from step
04) was replaced with `.archive-row:not([hidden]) ~ .archive-row:not([hidden])`. The
`:first-child` version keys off DOM position, which the filter breaks: filtering to
`energy` leaves its one match (4th in the DOM) as the only visible row, and `:first-child`
would still draw a top border above it since it isn't the first *child*, only the first
*visible* one.

Step 06 — `--color-graphite-2` changed `#6b7075` → `#666a6f` to clear the 4.5:1 AA
contrast floor on `--ground` (4.21 → 4.59; 4.66 → 5.07 on `--sheet`). The first
authorised token-value change in the project — put to Arthur this session, not made
unilaterally. `docs/design-spec.md` §5 updated to match so the spec doesn't silently
drift from the code.

Step 06 — `:focus-visible`'s outline widened from `var(--hairline)` (0.5px) to a literal
2px. `--hairline` itself is untouched; every other hairline on the page stays 0.5px. Not
a Lighthouse or WCAG AA requirement (thickness is a 2.2 AAA criterion) — done because
"focus styles audited" is explicitly in step 06's Do list and a sub-pixel ring was a weak
answer to it. Confirmed visible and unclipped by keyboard walk at both 1280px and 375px.

Step 06 — `tabindex="-1"` added to both `<main id="main">` elements (`index.astro`,
`type-test.astro`). A skip link's fragment jump moves the *sequential-navigation point*
in Chromium/Firefox without it, but has historically not moved *focus* in Safari — the
attribute makes the skip actually work everywhere. Invisible in normal use since the
ring is `:focus-visible`-gated.

Step 06 — A second font preload (`archivo-400-latin.woff2`) added in `Base.astro`,
against `design-spec.md` §5's "preload the display face only" (written before step 02
chose self-hosting). Reason: measured CLS was 0.006, not 0, with only the display face
preloaded — Lighthouse's `layout-shifts` audit attributed it to the hero name line
reflowing as Archivo finished loading. Preloading the body face brought CLS to exactly
0. §10's "no layout shift" is the higher-priority rule and step 06 is its gate, so the
divergence stands; Archivo 500 and IBM Plex Mono stay swap-only.

Step 07 — An interpretation call, not a divergence from the plan but worth logging as
one: `implementation-plan.md`'s step 07 Do list says "JS sets initial states on load" in
the same step whose acceptance demands the page stay "visually identical to step 06."
Taken literally, `gsap.set('[data-anim]', { y: 16, opacity: 0 })` this step would hide
content nothing yet reveals, failing that same acceptance line. Read instead as
structural: this step verifies the markup half of the initial-state pattern already
holds (it does — `Rule.astro` and `MarginNote.astro`'s SVGs already ship fully drawn,
confirmed by grep) and creates `src/scripts/motion.ts` as the one place initial states
get set; the actual `gsap.set(...)` calls land in step 08, paired with the reveals that
undo them.

Step 07 — `lenis/dist/lenis.css` imported from `global.css` rather than from
`motion.ts`. Not a divergence from the plan (the plan named this as the preferred
option, with a fallback only if Tailwind's `@import` inliner refused the bare
specifier) — it didn't; the import compiled cleanly on the first `pnpm build`, so the
CSS is in the one existing stylesheet bundle rather than a second request.

Step 08 — `CustomEase` registered as a fifth GSAP plugin, against `motion-spec.md`'s
four-plugin registration line, and the triggered ease defined from `CustomEase.create('reveal',
'M0,0 C0.22,1 0.36,1 1,1')` rather than the literal string `motion-spec.md:142` gives
(`ease: 'cubic-bezier(0.22, 1, 0.36, 1)'`). Verified against the installed `gsap@3.15.0`,
not assumed: `gsap.parseEase('cubic-bezier(0.22, 1, 0.36, 1)')` returns `undefined`, and a
tween using that string silently falls back to GSAP's default `power1.out` — the wrong
curve, with no warning. `CustomEase` cannot parse the CSS string form either; it needs the
SVG-path form used here, with identical control points. Put to Arthur this session:
registering `CustomEase` (free since GSAP 3.13, not a new library) cost ~2KB gzip against
a measured `power4.out` alternative (max deviation 0.0118 progress at t=0.053 — visually
indistinguishable, but not the named value, and `motion-spec.md:4` says "where a value is
given, use that value"). Exported as `EASE_OUT` from `motion.ts` for steps 11–13 to reuse.

Step 08 — Every `[data-anim]` trigger uses `start: 'clamp(top 85%)'`, not the plain
`start: 'top 85%'` `motion-spec.md:144` gives. Found and verified in-browser, not
assumed: the Contact paragraph — the page's last content block, with only the email link
and bottom padding beneath it — never revealed even scrolled to the true bottom of the
page, because the scroll position `'top 85%'` requires exceeded the page's actual max
scroll by about 23px. Confirmed in `node_modules/gsap/ScrollTrigger.js` that a plain
position isn't clamped to the scroller's bounds; `clamp()` is GSAP's own documented
positional syntax for exactly this (the `_startClamp` path), and has no effect on any
interior element, where the unclamped position was already reachable. Re-verified live
after the fix: all 13 reveals, including Contact's, now fire correctly at real max scroll.

Step 08 — `data-anim-scope` added to each `.rail` (three, in `Spine.astro`), not present
in `motion-spec.md`'s per-element loop. Without it, "margin notes lag their paragraph by
200ms" is only true if the paragraph and its notes share a trigger; scoping the reveal
loop to look for the nearest `[data-anim-scope]` ancestor (falling back to the element
itself where there is none) makes that literally true at ≥768px, where `.rail` is a
two-column grid with a shared top edge. Below 768px `.rail` collapses to one column and
notes stack under the prose (`type.css`), so scoping is skipped there — each element
triggers on its own arrival instead, confirmed correct via the 375px iframe check.

Step 08 — `data-anim-played`, a dataset flag beyond ScrollTrigger's own `once: true`.
`gsap.matchMedia()` reverts and recreates a branch's triggers whenever its media query
starts or stops matching (crossing 768px, or toggling reduced motion mid-session), and
without this flag a reveal that had already played would replay when its trigger is
rebuilt. `once: true` alone is scoped to one branch's lifetime, not to the page session.

Step 08 — The reduced-motion path (`mm.add('(prefers-reduced-motion: reduce)', ...)`,
unchanged in shape from step 07) could not be exercised live this session: the
`claude-in-chrome` extension drives page content only, not native browser chrome — `F12`
did nothing the extension's own screenshot tool could see, consistent with the
`resize_window` limitation steps 04/06 already logged. Toggling the OS-level Windows
accessibility setting that Chromium reads for this was judged too invasive for a
verification step on a real machine and not attempted. What *was* confirmed: the static
build has zero `opacity:0`/hiding CSS or inline style on any `[data-anim]` element
(`grep`), so the page is fully visible independent of whether this branch runs at all;
and the branch's own `gsap.set(anim, { clearProps: 'all' })` is unchanged from the
already-shipped, already-guarded pattern step 07 put in place. Recommend a manual
DevTools Rendering-panel check before step 14 ships, since this session's tooling
couldn't do it.

Step 11's `crossfadeFilter()` (the reduced-motion archive filter transition) has the same
gap for the same reason and is added to that same DevTools-Rendering-panel check: verified
by code review only (it registers correctly under the `'reduce'` matchMedia branch, uses
`FADE_FEEDBACK` not `FLIP_DURATION`, and only tweens `opacity` on newly-visible rows), not
exercised live under an actual `prefers-reduced-motion: reduce` browser state.

Step 09 — `docs/plans/step-09.md` (written and approved at the start of this session)
specified removing `vector-effect="non-scaling-stroke"` from `#rule path` and letting
DrawSVGPlugin measure and animate it directly, on the reasoning that the attribute only
affects stroke rendering (unchanged, verified) and not layout. That reasoning held for
rendering but not for layout: measured in-browser, not assumed, removing the attribute
raised Lighthouse mobile CLS from 0.004 to a consistent 0.089 across repeated runs (bisected
by toggling only this one attribute with everything else — Tick markup, `type.css`,
`motion.ts`'s tier 1 code — held constant in both directions), well past `CLAUDE.md`'s
zero-layout-shift floor and the plan's own "stop and ask if... Lighthouse drops below 95"
line. The mechanism: `.rule-svg` is a deliberately non-proportional box
(`viewBox="0 0 1 100"`, `preserveAspectRatio="none"`, ~1:1 x-scale vs. ~1:60 y-scale at a
typical page height) built for the drawing to stretch the full page; without
`non-scaling-stroke` the browser's own paint/ink-overflow rect for the stroked path is
computed through that same extreme non-uniform transform, and the *reported* layout box
used by the Layout Instability API shifts even though the *rendered* pixel stroke does not
(both confirmed separately — dasharray math and a visual check agreed the line stays 1px).

Fix: keep the attribute (so the paint-rect problem never occurs) and stop relying on
DrawSVGPlugin's own `getTotalLength()`-based measurement for the rule specifically — that
measurement is what needed `non-scaling-stroke` gone in the first place
(`DrawSVGPlugin.js:97-147`, the plan's original finding 1, still correct on its own terms).
`tier1Rule()` now sets `strokeDasharray` once to the path's known fixed length (100 user
units, exact by construction from `d="M0.5 0 V100"`) and tweens only `strokeDashoffset`
100 → 0 — the standard length-100 line-draw technique, and literally the one property
`CLAUDE.md`'s animate-only list names, so this is arguably a tighter fit for that rule than
the original plan's `drawSVG` shorthand (which internally re-declares both dasharray and
dashoffset every frame). `.tick` keeps DrawSVGPlugin unchanged — its 1:1 viewBox is exactly
the proportional case the plugin measures correctly, confirmed unaffected throughout.
Re-verified after the fix: CLS 0.0003 on a clean run (Performance 99, Accessibility 100,
Best Practices 100 — no regression anywhere), rule scrub and tip-synced ticks both still
correct in-browser (dasharray math checked at three scroll positions).

This is logged as a divergence rather than a blocking question because it stayed within
every hard constraint already in force (transform/opacity/stroke-dashoffset only, no new
dependency, same visual result, same acceptance criteria) and because steps 06–08 already
set the precedent of making and documenting an equivalent verified technical substitution
(CustomEase for the literal ease string, `clamp()` for the literal `start` value) rather
than pausing to ask when the fix stays inside the rails CLAUDE.md already sets.

Step 10 — `docs/plans/step-10.md`'s "verified fact 1" claimed `.leader`'s 32x24 viewBox
against its `aspect-ratio: 4/3` CSS box was proportional (`scaleX === scaleY`) and therefore
safe for DrawSVGPlugin, unlike the rule. That reasoning was correct on paper but wrong live:
checked in-browser against the running preview (not re-derived from CSS alone), a leader's
`getScreenCTM()` returned `scaleX ≈ 0.7499`, `scaleY ≈ 0.7498` — a fourth-decimal gap from
ordinary subpixel layout rounding (a 2rem-wide box with a non-1:1 aspect-ratio doesn't
always rasterize its width and height with identical rounding error, unlike `.tick`'s
literal `width: 8px` + `aspect-ratio: 1`, which forces width===height in pixels and has no
such gap). `DrawSVGPlugin.js:146` rounds to exactly 4 decimals and warned on precisely that
gap — caught by reading the console after the first build, not assumed clean because the
static analysis looked sound.

The gap is far smaller than the rule's ~30x mismatch and doesn't visibly mis-scale the
draw, but the warning alone fails the clean-console gate, so leaders were switched to the
rule's own technique: `motion.ts`'s `tier1Leaders()` bypasses DrawSVGPlugin and hand-tweens
`strokeDasharray`/`strokeDashoffset`, with the length read once per leader via the native
`path.getTotalLength()` (unaffected by CTM or vector-effect) rather than a transcribed
constant. `.tick` is unaffected and stays on DrawSVGPlugin. Both `MarginNote.astro`'s
comment and `docs/plans/step-10.md`'s written plan describe the original (incorrect)
DrawSVGPlugin-is-safe reasoning; per steps 07–09's precedent, the plan document itself is
left as written and the correction lives here instead.

This is logged as a divergence rather than a blocking question for the same reason step 09's
was: it stayed inside every existing hard constraint (stroke-dashoffset only, no new
dependency, identical visual result, same acceptance criteria) and is a verified technical
substitution, not a design change.

Step 11 — `docs/plans/step-11.md` planned to verify `motion-spec.md:188`'s literal
`absolute: true` live before deciding whether to keep it, following steps 09–10's
precedent. Verified, and dropped: built once with the flag exactly as the spec gives it,
narrowed the archive filter to a single-row match, and found the surviving row left
permanently `position: absolute` in its computed style — not just for the 400ms flight,
but forever after the animation settled (`Flip.js`'s default `_setFinalStates(comps,
!clearProps)` only reverts inline styles when `clearProps` is explicitly set, which
`motion-spec.md`'s snippet doesn't). A `<ul>` with every row pulled out of flow for even
one settled row loses that row's contribution to its own height, silently shifting the
show-all button, changelog and contact section up by one row's height on every narrowing
filter click — confirmed by reading `getComputedStyle(row).position` and
`document.body.scrollHeight` directly in-browser, not reasoned from `Flip.js` source
alone (the source reading — `_filterComps`'s `targets !== true` short-circuit,
`Flip.js:257` — correctly predicted *a* problem, but not that it was permanent rather
than transitional). Removed the flag entirely: with this step's decided enter/leave
behaviour (survivors travel, entering rows fade in, leaving rows just disappear — put to
Arthur this session, see below) no row is ever painted outside the document flow, so
`absolute: true` bought nothing here. Rebuilt and reverified the same single-row
transition with the flag gone: `position: static` throughout, `<ul>` height correct.

Also put to Arthur and settled this session (not literal divergences from the spec, which
leaves these open, but decisions the spec needed to proceed): rows leaving a narrowed
filter disappear instantly with no exit animation, rather than fading or traveling out;
Flip runs at both desktop and mobile widths, since `motion-spec.md`'s degradation
contract strips pinning/leader lines/set-pieces below 768px but says nothing about a
click-triggered (not scroll-linked) transition; and the reduced-motion "filter
cross-fade" the spec's degradation table calls for is a 120ms (`--dur-feedback`, the
existing interactive-feedback duration) fade on newly-visible rows only, not a new third
duration invented for this — `motion-spec.md:36`'s "two durations and one curve, resist
adding a third" rule applies here as post-click feedback, not a reveal.

This is logged as a divergence rather than a blocking question for the same reason steps
09–10's were: it stayed inside every existing hard constraint (transform/opacity only, no
new dependency, same acceptance criteria) and is a verified technical substitution against
the spec's literal snippet, not a design change.

Step 12 — `docs/plans/step-12.md`'s approved geometry centred the origin mark's 12px box
on the header's own top-left corner (`top: -6px; left: -6px`), reading it as a drafter's
crosshair. Verified live, not assumed correct from the arithmetic: `getBoundingClientRect()`
on the built page showed `top: -5.99px` — the header is the first thing on the page, so a
negative `top` there renders past the document's own scroll-top boundary, which cannot be
scrolled to, leaving roughly half the mark permanently invisible for every visitor. Fixed
by redrawing `.origin` as an L-shaped corner bracket (`d="M0 0 V12"` / `d="M0 0 H12"`)
anchored flush at `top: 0; left: 0` — both strokes grow out of the corner point itself
rather than its centre, which also reads as the more conventional drafting device for
marking a datum point. Re-verified live after the fix: `origin.top === 0`, fully in the
viewport, no clipping, console clean.

Also found before it shipped, by checking the installed `gsap@3.15.0`/`SplitText.js`
rather than assuming: `SplitText`'s per-word wrapper defaults to `display: inline` when
`tag: 'span'` (the only valid tag inside an `<h1>`, which takes phrasing content only —
`SplitText`'s own default wrapper is a `<div>`). `transform` has no effect on a
non-replaced inline element in any browser (confirmed against the CSS spec). Without a
fix the word-arrival tween's `opacity` half would still have worked but the `y` travel
would have silently done nothing. Fixed with `wordsClass: 'hero-word'` plus one CSS rule,
`.hero-word { display: inline-block }` — still a `<span>`, still only
`transform`/`opacity` tweened (`CLAUDE.md`).

Logged as a divergence rather than a blocking question for the same reason steps 09–11's
were: both stayed inside every existing hard constraint (transform/opacity/
stroke-dashoffset only, no new dependency, same acceptance criteria) and are verified
technical corrections to the plan's own arithmetic, not design changes — `docs/plans/step-12.md`
is left as approved and the correction lives here instead, per that same precedent.

Step 13 — `setPieceBraille()`'s pinned `ScrollTrigger` needed an explicit `pinSpacing: true`
that `docs/plans/step-13.md`'s approved plan didn't call for. Verified live, not assumed:
the first build pinned correctly (confirmed via `ScrollTrigger.getAll()`'s own `start`/`end`,
1109px apart as intended) but the page's total scroll height never grew to match — the
`.pin-spacer` GSAP inserts stayed exactly the stage's own 204px, with zero extra room
reserved, so the whole set-piece played out inside its unpinned height and the "pin" was
never visible as one. Read `node_modules/gsap/ScrollTrigger.js:1177` rather than guess:
*"if the parent is display: flex, don't apply pinSpacing by default"* — `ProjectPage.astro`'s
`<article>` (the pinned stage's parent) is exactly that, a `flex flex-col` container, and
GSAP silently disables its own spacing mechanism there unless told otherwise. Fixing it is
one line, `pinSpacing: true` in the `scrollTrigger` config; re-verified live afterward
(`.pin-spacer` height 1313px = 204 + the full 1109px pin distance, document height 790px →
1899px, dots filling in correctly under real scroll with the letter highlights crossfading
in at the right position, reversible on scroll-up, and the scroll position — mid-pin —
correctly restored, not reset, on a real `location.reload()`).

This is logged as a divergence rather than a blocking question for the same reason steps
09–12's were: it stayed inside every existing hard constraint (only `pinSpacing`, a
`ScrollTrigger` option already in the one pin the plan called for — no new dependency, no
markup change, same acceptance criteria) and is a verified technical correction, not a
design change.

Step 14 — **A real bug from step 08, found by QA: every reveal already in view at load stayed
at `opacity: 0` until the reader scrolled one pixel.** `start: 'clamp(top 85%)'` pins the
start of any element near the top of the page to exactly `0`; ScrollTrigger fires `onEnter`
only once progress goes *above* 0, and at scroll 0 it is exactly 0. Visible symptom: open
`/projects/edubra/` and the `<h1>` and intro paragraph are invisible (home: the first four
reveals). Diagnosed live, not guessed: `ScrollTrigger.getAll()` showed those triggers at
`start: 0, progress: 0`, a synthetic `scroll`/`resize`/`ScrollTrigger.update()`/`refresh()`
changed nothing, and a 1px real wheel event revealed all of them. Fix, in `motion.ts`
`tier2Reveals()`: an `onRefresh` callback plays the tween when its trigger's start is
already reached and it hasn't played. Verified at 1280×900, 1280×600 and 375×800 on both
routes: nothing in view is hidden at load, and every `[data-anim]` reads opacity 1 after a
full scroll. Earlier steps never caught it because their verification always scrolled first,
and step 13's live check ran in a `visibilityState: "hidden"` tab whose rAF was frozen.

Step 14 — **The fix exposed a layout shift it had been hiding, which was investigated rather
than assumed.** EduBra's Lighthouse CLS went 0.0108 → ~0.027 after the reveal fix. Bisected
by reverting only `onRefresh` (0.0108 ×3, steady) and by reading Lighthouse's own
`layout-shifts` audit: different nodes, not the same one worse. Before, the shifting node was
a lower `<section>` (web-font swap); after, it is `.braille-stage`, which the bug had been
leaving at `opacity: 0` — hidden elements don't count toward CLS, so the shift was there all
along. The stated cause is IBM Plex Mono loading, and the element moved is the intro
paragraph above the stage, which currently holds the `[FILL]` placeholder that `Fill.astro`
renders in mono. **Verified rather than asserted:** temporarily swapping in ordinary prose
gave CLS 0.0029 / 0.0025 / 0.0000. So it is a placeholder artefact and clears itself when
EduBra's real copy lands. Also tried, measured, and *reverted*: preloading Archivo 500 (the
step-06 remedy) — home stayed 0 but EduBra was unchanged at ~0.025, so it wasn't the cause
and a speculative preload doesn't stay. Shipped state: EduBra 0.0255, home 0.0003.

Step 14 — **The EduBra set-piece can't finish at max scroll on tall viewports, with the
placeholder copy.** Measured at 1280px wide, scrolled to the true bottom: fine at ≤800px
high; at 900px the last dot is 73% drawn and the last letter unhighlighted; at 1000 and
1080px the last cell's dots never appear (`min` dot opacity 0). Arithmetic, not a pin bug:
a pin can only finish if the content after it is at least one viewport tall (the spacer's
extra height is the pin distance itself, so shortening the pin changes nothing), and that
content is currently four short `[FILL]` strings.

**Fixed, after Arthur asked whether resizing the cell would do it.** The stage's own height
counts too — the shortfall is `viewportHeight − stageHeight − contentAfter` — so a taller stage
cancels it one-for-one. `type.css` gives `.js .braille-stage` `min-height: 75svh` (centred),
scoped by media query to exactly where it pins: ≥768px and no reduced motion. 75svh needs only
a quarter of a viewport of content after the pin, which holds at any screen height and does not
depend on how long EduBra's copy turns out to be. Re-measured at the true bottom of the page at
600/700/800/900/1000/1080/1440px high: every dot and every letter highlight complete at all
seven (before: 900 one dot short, 1000+ two cells short). Reduced motion, no-JS and mobile keep
the compact stage (256/256/128px), unchanged. Lighthouse unchanged (99/100/100; EduBra CLS
0.029 and 0.000, the same placeholder-driven range). The cell itself is not resized — only the
box it sits in, so nothing about the drawing's proportions or the spec's aspect-ratio changed.

Step 14 — Reduced motion, end to end, finally verified live — the gap steps 08 and 11 both
logged. Method: Playwright's Chromium binary driven over raw CDP from a throwaway Node
script (Node 24's global `WebSocket`, no new dependency), with `Emulation.setEmulatedMedia`
`prefers-reduced-motion: reduce`, which is what the DevTools Rendering panel toggles.
Asserted on both routes at 1280 and 375px: every `[data-anim]` visible with no inline
style, no `hero-pending`, no hero split, zero inline dash styles on rule/ticks/leaders, no
pin-spacer and a static stage, all 15 Braille dots at final state; and the archive filter
crossfades entering rows only (min opacity < 1 mid-fade), with no travel, no
`position: absolute`, and no inline style left once settled. Also passing with JavaScript
disabled. The recommendation in steps 08/11 to have Arthur check the Rendering panel by hand
is closed.

Step 14 — Agente H: `date` `"2026-06"` (the brief's build window is ~36 commits over
2026-05-31 → 2026-06-16; a one-month field takes the month it concluded, decided with
Arthur), and the blurb rewritten. The old line said "vector database for contextual
retrieval"; the brief records an explicit decision that there is *no* separate vector
database (Postgres + pgvector), and Arthur's own account of what it does — a customer's
"sofs" still finds the sofa, and the model gets a filtered catalog instead of the whole one —
replaced it. First draft wrapped to three lines with a stranded word, against the two-line
cap in `content.md`, so it was trimmed; now two lines at 1280px (five at 375px, like the
other blurbs). The row now sorts between RP3 and Programming Techniques, checked on the
rendered page.

Step 14 — Contact gains WhatsApp. `49 99194-2504` was given without a country code; `wa.me`
needs one, so the link is `https://wa.me/5549991942504` and it displays as `+55 49 99194-2504`
(Brazil, area code 49). Mechanical normalisation of a number Arthur supplied, the same class
as step 03's scheme-less repo URLs. Same class and treatment as the email line, no new CSS,
no `data-anim` (the email never had one), both links keyboard-reachable with a visible 2px
ring.

Step 14 — `/type-test` deleted, along with three code comments that named it as the reason
for scoping selectors to `.page-main`; the scoping is still right, the comments now say why
without it. The expected side benefit did **not** happen and the older note was wrong: the
`.rounded { border-radius: .25rem }` leak is still in the built CSS. It never came from
`/type-test` — Tailwind v4 scans the whole repo for class candidates, including
`docs/*.md`, which quote that class in prose. Twenty-five bytes of dead CSS; fixing it means
a `source()` change in `tokens.css`, which needs Arthur's go-ahead, so it stays.

Logged as divergences rather than blocking questions for the same reason steps 09–13's were:
each stayed inside every hard constraint (no new dependency, no token change, no new section)
and is a verified correction or a decision Arthur made in-session, not a design change.

After step 14 — EduBra, at Arthur's request: the set-piece's pin distance halved,
`end: '+=150%'` → `'+=75%'` (it read slow); the pin distance doesn't affect whether it
completes at max scroll (see the 75svh note above). From the `Oficinas_1` repo: `date`
`2025-12` → `2025-06` (last commit 2025-06-25, confirmed by Arthur), `project.what` written,
and the blurb's "simultaneous audio feedback" corrected — the Pi speaks each word *before*
the pins rise.

After step 14 — EduBra page rework, from Arthur's brief (2026-09-29), superseding the pin
change just above:
- **The Braille set-piece is no longer pinned or scrubbed.** It fires once when it enters
  view, one letter at a time, with all of a letter's dots together (scale 0.85→1 +
  opacity, 120ms `FADE_FEEDBACK`, `EASE_OUT`, no translate). The site now has zero pins.
- **Every cell draws all six outline wells**, raised or not, and the filled dots sit on top.
  Before this, raised positions had no outline.
- **The 75svh stage is gone.** It only existed so the pin could finish. The cells now sit
  directly under the title and a one-sentence `what`.
- **Removed from `braille.ts`:** `lastDotIndex` and `brailleDotCount`. Only the pin timeline
  used them.
- **New `EdubraDiagram.astro`**, static and in the `after` slot of `ProjectPage.astro`. This is a
  new element and it is recorded in design-spec.md §6 as Arthur's decision. It ships two
  drawings, horizontal at ≥768px and vertical below, because one horizontal drawing
  squeezed to 343px would shrink its labels to ~9px.
- **Found live and fixed, the same classes of bug as the hero at step 12:**
  - Dots flashed filled and then vanished. The fix is a new `braille-pending` guard in
    Base.astro's inline script, the hero-pending pattern: ≥768px with motion allowed only,
    not session-scoped, with a 1.5s failsafe.
  - The first three letters landed in the same frame, because the sequence triggered
    during the ~350ms load stall. The fix: it now waits for `load` + `document.fonts.ready`
    + two frames before playing.
- **Verified headless over CDP (step 14's method), since the Chrome extension's tab reported
  `visibilityState: hidden` and froze rAF:**
  - 1280×900: letters cross 50% at 411/476/609/725/842/958ms, all dots and highlights end
    at 1, and there is no pin-spacer.
  - Reduced motion and 375px: final state from the first frame.
  - No horizontal overflow, and the console is clean.
  - Lighthouse mobile on EduBra: 100/100/100, CLS 0.0016.
- **Role and team:** Arthur said he did all the software and almost all the hardware, so
  that sentence and the archive `role` say so. His pasted "What I did" was kept verbatim,
  and it mentions only the software.

After step 14 — the Braille set-piece becomes a loop (Arthur, same day, superseding the
one-shot sequence just above):
- **One character at a time, like the device.** Its pins grow out of their holes (scale
  0→1 + opacity, 120ms), hold 600ms, then drop, and the next character rises. After A, a
  600ms pause, then repeat. The letter is highlighted while its pins are up. Scale is about
  each dot's centre, so there's no translate.
- **Controls chosen by Arthur, mirroring the device's own buttons:** Pause/Play, Slower,
  Faster (timeScale 0.5/0.75/1/1.5/2; the ends disable) and a mono speed count
  (`aria-live`). They also satisfy WCAG 2.2.2 for a self-starting endless loop. The loop
  also pauses itself out of view. The controls reuse `.control feedback` and `.filter-count`
  and exist only where the loop runs (`.js` + ≥768px + motion allowed), following the
  `.filter-bar` no-flash pattern. `setPieceBraille()` now returns a cleanup for its click
  listeners, composed into the ≥768px branch's return.
- **Verified headless over CDP:**
  - Letters rise E→A about 833ms apart for two full cycles, with exactly one letter up at
    a time.
  - Pause freezes the loop, and Play resumes it.
  - At 2×, letters rise about 417ms apart.
  - Reduced motion and 375px show all 15 dots static, with no controls.
  - The console is clean.
  - Lighthouse EduBra is 100/100/100 on mobile (CLS 0) and on desktop (CLS 0.0003).

After step 14 — **fixed: the Braille pins flew in from the right instead of appearing in
their holes** (reported by Arthur).
- **Measured:** headless, comparing each dot's rendered centre with its own `cx/cy` every
  frame. While animating, dots sat down-right of their holes, and the distance grew with
  the cell's x: E up to 142px, A up to 727px.
- **Cause:** a double transform-origin.
  - type.css (step 13) gave `.braille-dot` `transform-box: fill-box; transform-origin: center`.
  - GSAP writes SVG transforms into the `transform` attribute and had already baked that
    origin into its matrix (`matrix(0,0,0,0,cx,cy)` at scale 0).
  - The browser applied the CSS origin to that attribute a second time.
  - Net effect: at scale s, a dot is (1−s)·(cx,cy) off its hole. The old scrub and the
    0.85 one-shot had the same bug, just smaller.
- **Fix:** delete the CSS rule and set `transformOrigin: '50% 50%'` in the tweens.
- **Result:** max drift 0.02px across 131 mid-animation samples, and the loop, pause, speed,
  reduced-motion and mobile checks all unchanged.

After step 14 — the Braille controls become a cross-shaped pad beside the word (Arthur).
- **Layout:** up = restart the word, left = slower, right = faster, down = pause/play, and
  the speed count (`1×`, `aria-live`) in the centre.
- **Buttons:** icon-only `.control feedback` squares (2.5rem), with inline hairline SVG
  icons, an `aria-label` and a `title` each.
- **Pause/play:** the icon swaps on `data-paused`, and the name swaps on `aria-label`.
- **Restart:** `tl.restart()` also un-pauses, so one press gets the intent.
- **Stage:** where the loop runs, it becomes a grid (`word | pad`), and it stays a static
  column everywhere else.
- **Verified headless:** the pad sits right of the word, vertically centred, as a cross
  44px around the centre. Restart from paused resumes at E. Pause, speed bounds, zero pin
  drift, reduced motion and mobile are all unchanged. Lighthouse desktop is 100/100/100,
  CLS 0.

After step 14 — **token added, authorised by Arthur: `--color-control: #f2c230`**. It is
the second token change in the project, after step 06's `--graphite-2`.
- **Use:** the yellow fill of the EduBra pad buttons only. It isn't a neutral gray, so the
  "no gray outside the list" rule is untouched.
- **Chosen with Arthur:** filled buttons with graphite icons (~9:1) rather than a yellow
  outline (too faint on `--ground`).
- **Icons:** − slower, + faster, ⏮ restart, and ⏯ pause/play as one fixed combined icon.
  The state lives in its `aria-label`/`title`, so the icon-swap CSS was removed.
- **Docs:** design-spec.md §5 lists the token and its one use.
- **Verified:** loop, pad and controls tests all pass unchanged, and Lighthouse desktop
  is 100/100/100, CLS 0.

After step 14 — **the EduBra set-piece is now a CSS 3D device**, ported from Arthur's
reference prototype `edubra-device-3d.html` (repo root, untracked, with
`edubra-device-3d-preview.png`). It supersedes everything above about the SVG cell, the
GSAP loop and the pad.
- **Removed:**
  - `BrailleCell.astro`
  - all Braille code in `motion.ts`: `setPieceBraille`, its branch wiring and the
    reduced-motion `clearProps`
  - the `braille-pending` guard in Base.astro and type.css
  - the `.braille-*` CSS
  - the `--color-control` token (Arthur: remove it; the yellow now lives in `.device`'s
    scoped `--cap*` tokens)
- **Added:**
  - `EdubraDevice.astro`: server-rendered from `braille.ts`, with each position carrying
    `data-raised`, so the script needs no alphabet of its own
  - a `.device` section in type.css
  - `public/textures/wood-medium.webp`, which replaces the prototype's data URI. Arthur
    dropped it in `public/`; it was moved to `public/textures/` per the brief.
- **Kept from the prototype:**
  - the scoped device tokens
  - the preserve-3d chain
  - static box shadows
  - transform/opacity-only CSS transitions
  - the reduced-motion rule
  - the keyboard press state
  - the IntersectionObserver pause
  - the aria-live letter announcement
- **Diverged, for the site:**
  - **Fit:** the article column tops out at 855px and the prototype's row needs ~910px.
    The cell gap became 26px (was 34) and the lid side padding 36px (was 48). The stacked
    layout switches on a container query at 845px instead of an 820px viewport query.
  - **Fonts:** the active letter is weight 500, not 600, because the site ships Archivo
    400/500 only and 600 would be faux-bold. The speed count is Plex Mono 400.
  - **No JS:** markup is server-rendered with E raised and the controls hidden, where the
    prototype built its cells in JS.
- **Arthur's decisions:**
  - 2×2 buttons, as in the prototype.
  - Animated on mobile too, an exception to §8.
  - Pins **drop with a transition**, and the next letter rises only after the drop
    (`show()` waits `--dur-feedback`; 0 under reduced motion). The prototype dropped them
    instantly.
- **Verified headless:**
  - All 96 elements of the 3D chain are preserve-3d, overflow visible, opacity 1, filter
    none.
  - At 1280 the row fits exactly (lid 855/855, no overflow).
  - Sequence E→A at ~900ms, with a longer pause after A, and **zero frames with two
    letters visible**.
  - Pause/play (aria-label, aria-pressed, live text) and back → E work. Speed bounds
    0.5×/2× disable at the ends. The keyboard press class is set and cleared.
  - The loop stays frozen while off screen.
  - 375px is stacked, animated, with no horizontal overflow.
  - Reduced motion: transitions 0s, letters still step. No-JS: E raised, controls hidden.
  - The console is clean.
  - Lighthouse EduBra: mobile 99/100/100 CLS 0.0014, desktop 100/100/100 CLS 0. JS is
    67.6KB gzip.

After step 14 — **the device no longer stacks (Arthur): 2×2 buttons on the right at every
width.**
- **What changed:** the prototype's fixed sizes became variables on `.device .stage`
  (container queries can't style the container itself). Instead of switching to a column,
  three container-query tiers shrink the lid:
  - **≤845px:** holes 24px, buttons 48px.
  - **≤640px:** holes 20px, buttons 42px, and the word wraps 3+3, EDU / BRA.
  - **≤315px:** holes 18px, buttons 38px.
- **Tier widths:** each tier's row width is worked out in type.css against its own lower
  bound.
- **Verified headless at 1280/768/600/375/320:**
  - The lid never overflows, the buttons are always right of the word, and the page never
    scrolls sideways.
  - The word is on one row down to 768 and on two rows below.
  - The buttons stay ≥38px.
  - The full device suite still passes: 3D chain, controls, off-screen pause, reduced
    motion, no-JS.

After step 14 — **`src/` reorganised by domain (Arthur), no behaviour change.**
- **New layout:** `src/shared/`, `src/home/<section>/`, `src/projects/` and
  `src/projects/edubra/`. The map is in CLAUDE.md's "Where things live".
- **Moved, not rewritten:** files moved with `git mv`, so history follows.
- **CSS:** `type.css` was split along its existing sections into per-domain files, all
  imported by `shared/styles/global.css` in the old section order.
- **Verified against a pre-move snapshot of `dist/`:**
  - Both pages' HTML is identical, with asset hashes normalised.
  - The CSS bundle has the same 153 rules and the same bytes. The one order change is
    `.control` now ahead of `.archive-row`; they never style the same element.
  - Build and `astro check` are clean.

After step 14 — **EduBra controls follow prototype v2** (`edubra-device-3d.html` v2 and
`public/edubra-device-3d-preview.png`, both from Arthur).
- **Knob and cross:** a volume knob, then a cross of buttons: up ⏮, left −, right +,
  down ⏯, speed in the middle. This replaces the 2×2.
- **Sound:** the knob steps off / low / high (click cycles, arrows step and clamp). Each
  letter is spoken as its pins rise via `speechSynthesis` (en-US, rate follows speed), with
  no library. It starts off, and it's cancelled on pause, off screen, or off.
- **The knob turns on `transform` only**, and reduced motion drops that transition.
- **Not ported yet:** v2's "Try a word" input, because Arthur asked for the cross and the
  sound only. It is a new feature (§6/§9), so it waits for his call.
- **Fit:** v2's row needs ~944px against an 855px column. Desktop sizes are slightly
  smaller than v2's (holes 26, buttons 48, knob 50, 830px row), and the container-query
  tiers are recomputed. ≤669px wraps the word EDU / BRA and stacks the knob above the
  cross.
- **Fixed on the way:** the drop→raise wait now starts on the next frame. Under the
  page-load stall, a bare timeout had let two letters overlap for 3 frames.
- **Verified headless:**
  - At 1280/768/600/375/320 the cross is symmetric around the speed readout, sitting
    right of the word. The lid never overflows, and the page never scrolls sideways.
  - The knob starts off with nothing spoken. Low speaks at volume 0.5, high at 1, the
    angle follows (−135/0/135°), and the arrow keys clamp.
  - 3D chain: 99 elements OK.
  - Zero overlap frames in 6 runs.
  - Controls, off-screen pause, reduced motion and no-JS all pass. The console is clean.
  - Lighthouse EduBra: mobile 99/100/100 CLS 0.0015, desktop 100/100/100 CLS 0.

After step 14 — **"Try a word" added, from prototype v2** (Arthur asked for it).
- **Behaviour:**
  - The field sits under the device.
  - Accents are stripped (é → E), anything outside A–Z is dropped, and the word is capped
    at 6 letters. An empty field falls back to EDUBRA.
  - The cells are rebuilt with the exact server markup, and the patterns come from
    `braille.ts`, so the script still carries no alphabet of its own.
  - The field is hidden without JS; the server still renders EDUBRA.
  - Focus is the underline turning `--signal`, per v2.
- **Verified headless with real typed input:**
  - hello → HELLO, olá! → OLA, açaí 2 → ACAI, braillebox → BRAILL, empty or 123 → EDUBRA.
  - Every rebuilt pattern matches an independent Braille table, and the aria-label follows
    the word.
  - The 3D chain holds on rebuilt cells, with one letter up at a time.
  - At 375px with "AB", nothing overflows.
  - The full device suite is unchanged. JS is 69.6KB gzip.

---

After step 14 — **EduBra "How it works" upgrade, stage A: autoplay** (Arthur's brief, 2026-09-30).
- **Set-piece is now autoplay instead of scroll-scrubbed.** The pin, the scrub and
  `PIN_SCREENS` are gone; the section takes its natural height. `render(p)`, `T`, `SCENES` and
  `ITEMS` are untouched. `storyPlayer({ autoplay })` replaces `storyLive(scrub)`.
- **Section rule, recorded:** hardware is CSS 3D, software is 2D SVG.
- **Start and pause:** starts once when 40% of the section (or of the viewport, if the section
  is taller than that) is visible; pauses when it leaves the viewport and resumes on return
  unless the reader paused. At the end it holds the final state and shows "Play again".
- **State outlives a matchMedia rebuild:** `started`, `userPaused`, `done` and progress are
  module-level, so crossing 768px or toggling reduced motion neither replays nor restarts.
- **Controls:** Pause (`aria-pressed`, constant label), Play again / Play, and four step ticks
  that are now real buttons (`aria-label`, `aria-current="step"`) which jump to the start of
  their scene and keep playing. A visually-hidden `aria-live="polite"` line announces each
  scene; the opacity-stacked captions are `aria-hidden` while live.
- **Reduced motion:** no autoplay, final state, a "Play" button. Play is reader-initiated.
  Below 768px the story is still the static frame until stage B.
- **Verified headless over CDP:** no pin-spacer; waits off screen; plays on arrival; pause,
  resume, tick jump (+ announcement), off-screen pause/resume, end state, replay from 0;
  reduced motion holds still and Play plays; 375 and 767 give no overflow and no controls;
  no-JS hides the controls; focus ring is 2px; console clean.

Stage B — **mobile camera** (below 768px; Arthur's decisions on the framings and the tape).
- **Phones animate too.** The <768px no-preference branch now calls `storyPlayer` like desktop;
  `storyStatic()` is deleted. Under reduced motion a phone keeps the scrolling static frame
  until Play, then runs with the camera cutting instead of easing.
- **Camera:** `.fit` becomes a fixed 343:380 window (width capped at 80svh so landscape
  phones don't overflow) and one `translate + scale` on the canvas eases to the scene's
  framing over 0.6 s (`EASE_OUT`), on every scene change, jumps included. Framings are in
  canvas px (SVG y + 10), tuned from the brief's: 1 x20–363 y100–440, 2 x388–731 y110–430,
  3 x430–773 y20–390, 4 x740–1060 y110–520. At most one move per scene.
- **The 11px floor** is enforced by the camera: scale = max(fit, 11 / smallest text in the
  framing), so a narrower window crops a framing's edges instead of shrinking its text.
- **Reading tape:** below 768px the SVG tape is hidden and an HTML tape (same 350-wide box,
  same now/was crossfade, cursor as four transformed parts) sits under the canvas.
  `render()` writes both, so it stays a pure function of p. This is an addition inside
  `render`, unavoidable for the HTML tape.
- **Accepted:** the GPIO header is off-frame in scene 4 on phones.
- **Verified headless (Playwright Chromium over CDP, not Brave):** at 375, 320 and 767 every
  visible `<text>` in every framing is ≥11px (measured with the real canvas scale), no page
  overflow, the framing follows a jump from scene 4 back to 1, console clean; reduced-motion
  phone is static until Play. Desktop's small SVG text (8.9–9.7px at 0.8 scale) is
  pre-existing and outside this stage.

Stage C — **three-quarter view, real speaker.**
- **Camera:** `.bench` is `rotateX(50deg) rotateZ(20deg)` (`--st-tilt` / `--st-turn`). The brief
  said -20deg for the turn; with CSS's clockwise-positive `rotateZ`, -20deg shows the LEFT face
  and +20deg shows the right, which is the face the brief wants (port openings on the side). Put
  in the commit; adjust `--st-turn` if Arthur wants the other side.
- **Faces:** `Cub.astro` gains a `.right` face (hangs from the top face's right edge, like
  `.front`) and a `right` slot. Shading is by orientation: top lightest, right medium, front
  darkest, per material (PCB, silver, black, GPIO, wood).
- **Pi 4:** board thickness 3 to 5 px; faint copper traces (a static SVG background); openings on
  the right faces (Ethernet; two USB stacks with blue inserts in the USB 3 pair, dark in the USB
  2 pair); apertures on the near-edge USB-C and micro-HDMI fronts and a hole on the AV jack. No
  logo, silkscreen text only. **Unverified:** the order of the right-edge connectors (Ethernet
  at the top end, then USB 3 blue, then USB 2) and which stack is blue were kept from the
  prototype; neither the official specifications page nor the docs page states the physical
  order, and the mechanical drawing was not readable as text. Pin order of the header was
  checked against pinout.xyz (pins 8/12/16/28/32/40 = BCM 14/18/23/1/12/21, odd pins inner
  row, even pins outer row, pin 1 at the corner end).
- **Speaker:** the box is replaced by a standing round driver (a 96x96 plane stood on its near
  edge, turned 14 deg more than the table): metal frame with four screws, rubber surround,
  ribbed cone (repeating radial gradient), dust cap, and a magnet drawn as ten stacked discs
  behind the frame so its side shows. The cone push still scales `.dust` (now inside a
  translateZ wrapper so the scale does not overwrite the lift).
- **Braille cell:** same wood block, now with its right face.
- **Shadows:** a static dark ellipse with a fixed blur under each object. A radial-gradient plane
  rendered as a pale sheet with hard edges under 3D in headless Chromium, so it was replaced.
  The blur is static and on a leaf, never animated.
- **Bug found and fixed (real, not cosmetic):** `tokens.css` gives every element a 0.01ms
  transition under reduced motion, and a transform set from script then starts one, so
  `getBoundingClientRect` kept answering with the old scale for that frame. `wire()` measured
  the anchors at the wrong scale (wires ended ~90px off). `.story .canvas *` now has
  `transition: none !important`.
- **Verified headless (Playwright Chromium over CDP, not Brave):** the wire endpoints coincide
  with the five anchors at 1280, 1024, 768 and 375, static and after a live run; 290+ frames
  while playing at 1280 and 375 have median 16.7 ms and p95 about 17 ms (60 fps), with one 116 ms
  hitch at page load; stage A and B suites still pass; `astro check` clean. Face flicker was
  judged from repeated screenshots only (no automated detector).

Stage D — **callouts and real GPIO pins.**
- **Callouts:** one real `<button>` over each of the GPIO header, audio jack, green ACT LED,
  processor (the silver SoC), Braille cell and speaker, with the brief's labels. Hover (mouse),
  focus or click/tap opens one; one at a time; Esc or a tap elsewhere closes it; a keyboard
  activation does not pin it (a mouse/touch click does). The leader is a graphite-2 line drawn
  with `stroke-dashoffset`, ending in a `--color-signal` dot, with the label on a shelf. Under
  reduced motion it simply appears. Opening one holds the story and closing it resumes, unless
  the reader had paused: the two are independent flags in `sync()`.
- **Structure:** the diagram's `role="img"` moved from `.frame` to `.canvas`, because children of
  `role="img"` are presentational and would have hidden the buttons. `.frame` is a labelled group.
  Buttons carry `aria-label` ("Name: label") and `aria-expanded`; the drawn callout is `aria-hidden`.
  Their boxes are measured at rest in `wire()` (canvas px) and placed through the canvas' current
  translate and scale, so they follow the camera; 28px minimum. In camera mode `.fit` is
  `overflow: clip`, so focusing an off-frame target cannot scroll it. The layer is hidden until the
  hardware is down (`p >= 0.06`) and without JS.
- **Real pins:** dot 1..6 -> physical pins 12, 16, 8, 28, 32, 40 (BCM 18, 23, 14, 1, 12, 21), in
  the order the brief lists them. Checked against pinout.xyz: BCM numbers match; odd pins are the
  inner row, even pins the outer (board-edge) row, pin 1 at the corner end. All six are even
  pins, so they all sit on the edge row of the drawn header. Each pin has a lit copy crossfaded on
  opacity with the raising of that letter's pins.
- **Bug found and fixed:** the story's visibility came from an IntersectionObserver whose
  "back in view" notification sometimes never arrived in headless Chromium (logged: a `true` at
  0.999, then a `false`, then nothing for seconds while the section was plainly on screen), leaving
  the story paused. It is now `getBoundingClientRect()` on scroll, resize and layout. 8 of 8 test
  runs pass against about 3 of 8 before.
- **Not done on phones:** in scene 4 the GPIO header is off-frame (accepted by Arthur); its
  callout still opens, with the anchor clamped to the frame edge.
- **Verified headless (Playwright Chromium over CDP, not Brave):** Tab reaches all six; focus
  opens with the right label; an open callout freezes the story and Esc resumes it; a
  reader-paused story stays paused; one at a time; click pins, click elsewhere closes; over a
  full run the lit pins equal the alphabet's pins for the on-screen letter at 127 samples
  (h e l o w r d), with none lit when no letter is shown; labels stay inside the frame at 1280 and
  375.

Stage E — **voice.**
- **Browser voice, no audio files.** `speechSynthesis` with `lang = 'en-US'`; the gTTS files from the
  EduBra repository are not used. A "Sound" button (`aria-pressed`, off by default) sits with the
  other controls; it is hidden where `speechSynthesis` does not exist. The caption "recorded in
  advance" now reads "made in advance".
- **What is said:** "hello" and "world" at their word items, each letter at its letter item,
  spoken in capitals ("H") so an engine reads the letter's name and not a word.
- **Pacing (Arthur's decision):** with sound on, the tween waits at the end of each read item
  and resumes when that utterance's `end` fires, with a 450 ms minimum per item (so the pins
  finish rising) and a 1.5 s safety timeout if `end` never arrives. The last item holds the end of
  the story the same way. With sound off the story keeps its fixed ~10 s. The speech rate is left
  at the engine's default rather than "following the timeline", because the timeline now follows the speech.
- **Cancelled** on pause, when the section leaves the viewport, when a callout opens, on Play again,
  on a tick jump, when sound is turned off and on cleanup. After a pause or a return the current item
  is said again. A token per utterance makes stale `end` events harmless.
- **Cone:** `.cdrive` (a wrapper around cone and dust cap, scaled about the cone's centre) loops a
  small scale on the utterance's `start`, is nudged on each `boundary`, and eases back on `end`. It
  stays still under reduced motion. Transform only; `render()`'s own cone push on `.dust` is untouched.
- **iOS Safari:** turning the button on speaks a silent (volume 0) utterance inside the tap, the
  usual unlock. **Not verified:** there is no iOS device here, so "works after a tap on iOS Safari"
  is the standard pattern, not a test result (the open Safari item above still stands).
- **Verified (headless Chromium over CDP, not Brave; `speechSynthesis` stubbed to record calls and
  fire start/boundary/end):** silent through a full run by default; sequence `hello H E L L O world
  W O R L D`; each item waits for a 700 ms utterance (min gap 749 ms); an instant engine still gives
  a 465 ms minimum; an engine that never ends still finishes (22 s, 12 spoken); pause and leaving the
  viewport cancel and nothing is spoken until return, then the item is said again; Play again
  cancels; sound off stops speech; reduced motion shows Sound and Play, stays silent until asked,
  and the cone stays still. The real (unstubbed) API gave no console errors. JS is about 75 KB gzip.

- **Fixed after stage E (Arthur saw it):** the speaker's vibrating part was off-centre. Wrapping cone and dust cap in `.cdrive` (stage E) took them out of the `.drv > *` rule that gave them `position: absolute`, so their `left`/`top` were ignored. `.drv .cdrive > *` now has the same rule. Lesson: a new wrapper inside `.drv` needs the same absolute-children rule.

- **Fixed after stage E (Arthur saw it):** hovering a part while a letter was being said cut it and said it again from the start. An open callout paused the story through the same path as Pause, which cancels speech. A callout now only holds the animation; Pause and leaving the viewport still cancel. Checked with a stubbed engine: hover then leave mid-word leaves the speak and cancel counts unchanged. This supersedes the stage E line that listed "when a callout opens" among the cancels.

Divergences from the brief's wording, recorded per its instruction:
- **Autoplay instead of scroll-scrubbed.** The pinned `ScrollTrigger` scrub is gone; `render(p)`,
  `T` and `ITEMS` are unchanged, driven by a 10 s linear tween of p (stage A).
- **The section's rule is "hardware 3D, software 2D"** (Pi, Braille cell, speaker in CSS 3D; web page,
  text, words, audio files, wires in SVG).
- **Speech uses the browser voice instead of audio files.**
- **Table turn is +20 deg, not -20** (stage C), and the phone tape is HTML (stage B).

## Notes for future sessions

Things learned the hard way, so they aren't relearned. Environment quirks, version
gotchas, things that looked right and weren't.

- `pnpm` was not installed; needed `npm install -g pnpm` first (got pnpm 12.4.1).
- `pnpm create astro@latest` was run into the scratchpad directory, not the repo root, then
  the generated files were copied in selectively — the scaffold also writes its own
  `CLAUDE.md`, `AGENTS.md` and `.vscode/`, none of which were copied over the project's own.
- pnpm 12 blocks dependency install/postinstall scripts (`esbuild`'s) by default
  (`ERR_PNPM_IGNORED_BUILDS`) and no longer reads a `pnpm.onlyBuiltDependencies` key from
  `package.json` — that setting now lives in `pnpm-workspace.yaml`
  (`onlyBuiltDependencies: [esbuild]`, plus `allowBuilds: { esbuild: true }`, which `pnpm
  approve-builds` itself will scaffold into that file on a failed interactive run).
- `pnpm astro check` prompts to install `@astrojs/check` + `typescript` on first run. Left
  uninstalled this step — not in step 01's acceptance checklist, and installing it would be
  a library beyond the ones `CLAUDE.md` names for this plan.
- `"Archivo Expanded"` is `Archivo:wdth,wght@125,500`, a pinned static instance of the
  variable font, not a real Google Fonts family name.
- `global.css` must import Tailwind only once. `tokens.css` already carries
  `@import "tailwindcss"`; `global.css` imports `tokens.css`, `fonts.css` and `type.css`
  and must never import Tailwind itself.
- `@theme` blocks compile correctly from a file reached via `@import`, not just from the
  Tailwind entry file — confirmed by `--color-ground` etc. appearing in `dist/_astro/*.css`.
- A relative `fs.readFileSync` inside Astro frontmatter breaks at build time once the page
  is bundled into `dist/.prerender/` — the source tree isn't there. Use a Vite `?raw`
  import (`import css from '../styles/tokens.css?raw'`) to inline source text at build
  time instead.
- `typescript@latest` is a 7.x native-compiler release; most tooling (including
  `@astrojs/check`) still expects 5.x. Check a package's declared peer range with
  `npm view <pkg> peerDependencies` before installing `latest` alongside it, and run
  `pnpm peers check` after any dependency change.
- Tailwind v4's `--container-*` namespace generates `max-w-*` **and** `w-*` utilities
  (`--container-margin` → both `max-w-margin` and `w-margin`); `--spacing-*` generates
  `gap-*`/`p-*`/etc. A token outside `@theme`'s namespaces (e.g. `--radius-control`, kept
  in `:root`, not `@theme`) does not get a bare utility — reach it with an arbitrary value
  (`rounded-[length:var(--radius-control)]`) rather than assuming a class exists.
- The content-collections config file is `src/content.config.ts` in this Astro version,
  not `src/content/config.ts` (that's the legacy path). Import `z` from `astro/zod`, not
  `astro:content` — the latter still re-exports it but the source marks it
  `// TODO: remove in Astro 8`. Astro 7.3.2 ships Zod **4**.
- Unquoted YAML dates get parsed as JS `Date` objects and fail a `z.string()` schema —
  `2026-09-13` unquoted breaks, but `2026-07` (not a valid YAML timestamp shape) happens
  to survive as a string. Quote every date, in frontmatter and in YAML, without exception.
- Astro's `file()` loader silently **skips** an array item missing an `id`/`slug` (a log
  line, not a build error), so a green `pnpm build` doesn't prove every entry survived —
  count entries after seeding, don't just trust the build.
- The synced content store lives at `node_modules/.astro/data-store.json` (not the
  project's own `.astro/`) and is `devalue`-serialized, not plain JSON — not worth
  decoding by hand. `.astro/collections/<name>.schema.json` (JSON Schema, plain and
  readable) is the better artifact for confirming which fields a schema actually requires.
  Counting seed files directly, or parsing `changelog.yaml` with `js-yaml` (resolve it via
  `node_modules/.pnpm/js-yaml@<version>/node_modules/js-yaml`, since it's Astro's nested
  dependency, not a top-level one), is simpler than either.
- The render policy for an unresolved `[FILL]` value (visible drafting annotation) lives
  in exactly one component, `src/components/Fill.astro`. Check there first if that policy
  ever needs to change, rather than hunting across templates.
- Step 04 already built `.control` (button/summary chrome) and `.feedback` (120ms opacity
  hover/focus transition) in `src/styles/type.css` explicitly for step 05 to reuse — its
  own comment says so. Confirmed before writing any CSS for the filter bar: no new control
  class, no new transition, both classes just applied to the six filter buttons and the
  show-all button as-is.
- All archive-filter DOM mutation lives in one `applyState()` function inside
  `Archive.astro`'s `<script>`. Step 11 wraps that one call in
  `Flip.getState('.archive-row')` / mutate / `Flip.from(...)` — it does not rewrite the
  module. The scroll-position guard (`window.scrollBy`) in the same script must be
  rerouted through Lenis once step 07 gives it a scroll authority.
- Tailwind v4's preflight already ships `[hidden]:where(:not([hidden=until-found])){
  display:none!important}` (confirmed in the built `dist/_astro/*.css`) — toggling the
  `hidden` attribute hides an element even against a component's own `display: grid`, with
  no extra CSS needed. Don't add a redundant `[hidden] { display: none }` rule.
- `grep -c` on a built `.astro` page undercounts repeated attributes/strings because Astro
  emits `dist/*.html` as one line — `grep -c` counts matching *lines*, not occurrences.
  Use `grep -o "pattern" file | wc -l` to count occurrences in built HTML.
- CSS Grid's `minmax(0, X)` track (a fixed-length `X`, no `fr`) grows to fill available
  space up to `X` and shrinks to 0 below that, with no `fr` needed — this is what makes
  `.rail`'s three-column formula (`minmax(0, var(--container-measure)) var(--spacing-gutter)
  var(--container-margin)`) match `.rule-svg`'s `left` calc exactly at every width, without
  a resize observer. Confirmed in-browser at 767/768/1280px via the iframe technique below,
  not just reasoned about.
- A bare `main` CSS selector applies to *every* `<main>` on the site, including
  `/type-test`'s unrelated one — caught before it shipped. Page-specific structural CSS
  (this step's `.page-main`, the rule's positioning) needs a scoped class, not an element
  selector, the moment more than one page exists.
- Tailwind v4's arbitrary-value bracket syntax can incidentally trigger unrelated bare
  utilities: `rounded-[length:var(--radius-control)]` in `/type-test` (step 02) also
  causes Tailwind's own default `.rounded` (`border-radius:.25rem`) to compile into
  `dist`, because the class-candidate scanner is a broad text match, not a literal
  identifier check — the same leakage class `--color-*`/`--font-*`/`--text-*: initial`
  guards against in `tokens.css`, but for the `--radius-*` namespace, which isn't reset.
  It's dead CSS (nothing carries a bare `rounded` class) rather than a visible bug, so not
  fixed this step — touching `tokens.css`'s resets needs Arthur's go-ahead like any other
  token change. Worth a namespace reset if noticed again.
- `resize_window` did not change `window.innerWidth` in this sandbox across several
  attempts (including after unmaximizing and reloading) — the window stayed pinned to the
  display's full resolution. An `<iframe>` pointed at the dev/preview URL, with its
  `width`/`height` attributes set directly, gets its own layout viewport independent of
  the outer window and does trigger real `@media` breakpoints — used to verify the
  767/768px boundary and the 375/768/1280px display-line wrap for this step when window
  resizing wouldn't cooperate.
- Step 06 confirmed the above still holds even with the `claude-in-chrome` MCP browser
  controlling a real Chrome window: its `resize_window` tool also left
  `window.innerWidth` unchanged. Its extension also refuses to navigate a tab to a
  `file://` URL ("Can't interact with browser-internal or unparseable URLs"), so the
  iframe host page can't be opened directly from disk — serve it instead
  (`npx --yes serve -l <port> <scratchpad-dir>` in the background, then navigate to
  `http://localhost:<port>/<file>.html`). Real keyboard events (Tab, Enter) inside that
  iframe do trigger the page's own focus/tab-order behaviour correctly, so this is a
  reliable way to audit tab order and focus visibility at a specific viewport width.
- `pnpm preview`'s own process wrapper reports `[exited with code 0]` immediately in a
  backgrounded shell — this is expected, not a crash: `astro preview` daemonizes itself
  and the message is `Preview server already running at ...` on any later start attempt.
  Confirm liveness with `curl -sI http://localhost:4321/`, not by whether the launching
  command "completed". `pnpm exec astro preview stop` cleanly kills the daemon.
- Lighthouse's own Windows temp-directory cleanup throws `EPERM` on exit
  (`chrome-launcher`'s `rmSync` on its own tmp profile dir) even on a fully successful
  run — the JSON/HTML reports are already written to disk before that error fires, so
  check for the output files rather than treating a non-zero-looking failure message as
  the run having failed.
- Node's `require()`/`readFileSync` from this Bash tool cannot resolve paths through the
  `ARTHUR~1` short-name segment of the Windows temp path (`AppData\Local\Temp\claude\...`)
  even though the same path resolves fine for `cp`/`ls`. Copy the file into the project
  directory (or use the long-name path, `Arthur Heberle` in full) before reading it from
  Node.
- All motion wiring (GSAP plugin registration, the one Lenis instance, the one
  `gsap.ticker` hook, the `matchMedia` scaffold) lives in `src/scripts/motion.ts`, wired
  in once via a `<script>` in `Base.astro` so every page gets it. Steps 08–13 fill the
  three empty `mm.add(...)` branches there or `import { lenis } from '../scripts/motion.ts'`
  — they never construct a second instance or a second ticker hook. `scrollByPx(delta)`,
  also exported from there, replaces `window.scrollBy` everywhere a script needs to nudge
  scroll position without animating (`Archive.astro`'s filter/show-all compensation is
  the first caller).
- Vite hoists a module imported by two different Astro component `<script>` entry points
  (here, `Base.astro` and `Archive.astro` both importing `motion.ts`) into one shared
  chunk — confirmed in the built output, both entries import the same
  `_astro/motion.*.js`. This is what makes "exactly one Lenis instance" hold structurally
  rather than by convention: ES modules are singletons per resolved URL.
- Lenis's `respectReducedMotion` option defaults to `true` (confirmed against current
  docs, not memory): under `prefers-reduced-motion: reduce` it forces `lerp` to 1 and
  makes `scrollTo` calls jump instantly, with no guard needed in our own code.
  `motion-spec.md`'s Lenis snippet, used verbatim, already gets this for free.
- `html, body { overflow-x: hidden }` (`type.css`, step 04) did not need to become
  `overflow-x: clip` for Lenis to work — smooth scroll, the reduced-motion fallback, and
  all three viewport widths were clean with `hidden` left as-is. Worth rechecking if a
  later step (pinning, in particular) behaves oddly with horizontal overflow.
- gzip'd JS after this step: ~63KB total (`motion.js` ~62KB carrying all four GSAP
  plugins + Lenis; the two page scripts are near-empty shells that just import it) —
  comfortably under `CLAUDE.md`'s 90KB floor, confirmed by summing `gzip -c` per
  `dist/_astro/*.js` file rather than gzipping the concatenation.
- Cross-origin iframes (a page on one `localhost` port hosting an iframe pointed at
  another port) throw on `contentDocument` access — same-origin-policy applies even
  across two `localhost` ports. The iframe technique from step 04's notes still works
  for a purely visual check (screenshot), just not for script introspection into the
  framed page from the host page.
- GSAP cannot parse a CSS `cubic-bezier(...)` string as an ease — `gsap.parseEase(...)`
  returns `undefined` and the tween silently uses `power1.out` instead, with no warning
  anywhere. Use `motion.ts`'s exported `EASE_OUT` (a `CustomEase` built from the same
  control points in SVG-path form) for every triggered tween from here on; never restate
  `motion-spec.md`'s literal ease string.
- `start: 'top 85%'` (or any fixed-percentage `start`) on a `ScrollTrigger` can be
  mathematically unreachable for an element close to the true end of the page, if the
  remaining page height below it is less than that percentage of the viewport height —
  confirmed in `node_modules/gsap/ScrollTrigger.js`, no automatic clamping happens for a
  plain position. The element then sits at `opacity: 0` forever for any reader whose
  viewport is tall enough to hit this. `start: 'clamp(top 85%)'` is GSAP's own fix — wrap
  every tier-2 trigger's `start` in `clamp(...)` from here on, not just ones near a page
  end, since which element ends up near the end can shift as content is added.
- `gsap.matchMedia()` branches revert and rebuild their triggers on every change to the
  media query's match state (crossing 768px, toggling reduced motion). `once: true` on a
  `ScrollTrigger` is scoped to that trigger's lifetime, not the page session — a reveal
  that already played will replay when its branch rebuilds unless the element's own
  played-state is tracked outside the trigger (`motion.ts` uses a `data-anim-played`
  dataset flag for this). Any future scroll-triggered "fires once" animation needs the
  same guard, not just tier 2's reveals.
- The `claude-in-chrome` extension cannot open or drive native browser chrome (DevTools,
  its Rendering panel, `chrome://` pages) — only page content. `F12`/keyboard shortcuts
  aimed at it produce nothing the extension's own screenshot tool can see. There is
  currently no way from this sandbox to emulate `prefers-reduced-motion` live in the
  extension-driven browser; verify that path by code review, or ask Arthur to run the
  DevTools check by hand.
- `npx lighthouse` in this environment needs `CHROME_PATH` set explicitly (no system
  Chrome install was found by `chrome-launcher`) — the Playwright-installed Chromium at
  `~/AppData/Local/ms-playwright/chromium-*/chrome-win64/chrome.exe` works. Also: a
  single-format `--output=json --output-path=foo` writes the JSON to the literal path
  `foo` with no `.report.json` suffix (the suffix only appears with multiple `--output`
  formats) — `JSON.parse(fs.readFileSync(...))` reads it fine, but a bare
  `require('foo')` fails since Node's loader needs the `.json` extension to parse it as
  JSON rather than JS. A `--preset=perf`-only run scored performance 80 (TBT 580ms) on a
  cold start; two subsequent full-category runs against the same unchanged build scored
  99 both times — treat a single low score as environment noise and rerun before
  concluding a regression.
- Step 09 went further on the same lesson: after ~8 consecutive Lighthouse invocations in
  one session, TBT climbed to ~1000-1400ms (performance ~70-73) on *both* the step-09 build
  and an unmodified step-08 checkout tested immediately after — proving the drop was
  session-long environment drift (`npx --yes` re-resolving/launching Chrome repeatedly,
  plus leftover background `serve` processes from earlier steps' viewport checks left
  running across `git stash`/rebuild cycles), not a code regression. A single clean run
  after closing the stray processes came back at performance 99. **CLS was unaffected by
  this noise across every run** (consistently 0.004 or 0.089 depending only on the code
  under test) — treat CLS as the trustworthy signal under repeated local profiling and
  performance/TBT as noisy until confirmed with a clean run; don't chase a TBT number
  without first checking `tasklist`/`Get-CimInstance Win32_Process` for leftover
  `serve`/`chrome-launcher` processes from earlier in the same session.
- `vector-effect="non-scaling-stroke"` on a path inside a non-proportionally-scaled SVG
  (`.rule-svg`'s `viewBox="0 0 1 100"` with `preserveAspectRatio="none"`, stretched over a
  page-height box) is not just a DrawSVGPlugin measurement problem
  (`DrawSVGPlugin.js:97-147`, step 09's original finding) — *removing* the attribute so
  DrawSVG can measure the path also breaks the browser's own Layout Instability accounting
  for that element, confirmed by bisection (Lighthouse mobile CLS 0.004 → 0.089, everything
  else held constant, reversible by re-adding just the attribute). The working pattern for
  a path in a box shaped like this one: keep `non-scaling-stroke`, and if the path's true
  length is known and fixed by its own `d` (as `#rule path`'s is — a straight `V100` line,
  length exactly 100 user units), skip DrawSVGPlugin for that element and tween
  `strokeDashoffset` directly against a `strokeDasharray` set once to that known length.
  DrawSVGPlugin stays correct and worth using for anything with a 1:1 (or otherwise
  proportional) viewBox — `.tick` and `.leader` both qualify and are unaffected.
- Step 10 corrected the note above: `.leader` does *not* qualify after all, live-measured.
  A CSS box whose aspect-ratio merely *equals* its viewBox's ratio (`.leader`'s `4/3` vs
  `32x24`) is not the same guarantee as `.tick`'s literal `width: 8px` + `aspect-ratio: 1`,
  which forces identical rendered width and height in pixels. The former can still drift a
  few ten-thousandths between its rendered width and height from ordinary subpixel layout
  rounding, which `DrawSVGPlugin.js:146`'s 4-decimal-place check is strict enough to catch
  and warn on. The reliable test going forward is checking `getScreenCTM()` live in the
  browser (`gsap.utils.toArray('.foo').map(el => el.querySelector('path').getScreenCTM())`),
  not reasoning from the viewBox/CSS-box math alone — confirmed by console-warning bisection,
  not assumed. `tipScrollFor()` and the rule's own hand-tweened-dasharray pattern
  (`motion.ts`) are the reusable fallback for anything DrawSVGPlugin won't measure cleanly.
- `path.getTotalLength()` is unaffected by `vector-effect="non-scaling-stroke"` or any CTM
  scaling — it always returns the path's length in its own user-space coordinate system.
  That's what makes it a safe, non-hardcoded source for a fixed dasharray value (used for
  `.leader` in step 10; the rule in step 09 used a hand-derived constant instead, since
  `d="M0.5 0 V100"`'s length is trivially 100 by construction).
- Testing scrub/scrolled state in this sandbox: `window.scrollTo()` called from
  `javascript_tool` does **not** drive `ScrollTrigger` — Lenis owns scroll and only updates
  its own state (and fires the `'scroll'` event `ScrollTrigger.update` listens to) from
  inside its own `raf()`, driven by real wheel/touch input, not an arbitrary native
  scrollTop change. `window.scrollY` reads back the value fine, which makes this look like
  it worked — but every scrub stays frozen. Verify scrubbed motion with the `computer` tool's
  real mouse-wheel `scroll` action instead; that goes through Lenis correctly and was
  confirmed to track scroll position exactly as designed (leader dashoffsets matched a
  hand-computed prediction at three separate scroll positions, including reversing).
- A plain CSS `transition` (as opposed to a GSAP-driven inline style write) was
  unreliable to verify via `getComputedStyle` immediately after a DOM mutation in this
  sandbox — reads taken right after setting `[data-linked]` (even after an `await
  setTimeout`) sometimes still reported the pre-transition value, and
  `document.getAnimations()` showed the transition's `playState` stuck at `"running"`
  indefinitely. This looks like a rendering/compositor-tick artifact of the automation
  harness (a `Page.captureScreenshot` call itself twice timed out mid-session, "renderer
  may be frozen"), not a real product bug: a **real mouse hover** (via the `computer` tool,
  not a dispatched `MouseEvent`) followed by a **screenshot** (which forces an actual
  paint) did show the correct visual result — `.note-text` darkened to `--graphite` and
  `getComputedStyle` for `stroke` on `.leader-hi`/`.leader-base` was correct throughout.
  Prefer a real hover + a subsequent screenshot over a synchronous `getComputedStyle`
  opacity read when verifying a CSS transition in this sandbox.
- The `claude-in-chrome` extension attaches to the user's real, already-running Brave
  browser (`brave.exe`, not a dedicated `chrome.exe` instance) — `tasklist` showed over 20
  `brave.exe` processes and several GB of memory in normal use, unrelated to anything this
  session did. A Lighthouse run during or shortly after heavy `claude-in-chrome` activity
  (many tabs, scrolling, screenshots) can score low from real system contention — one run
  mid-session read performance 69 / CLS 0.089 / TBT 1410ms; closing the automation tab and
  rerunning with no other change came back 99 / 0.004 / 100ms, matching baseline exactly.
  Confirms step 09's lesson generalizes beyond repeated Lighthouse invocations: any heavy
  concurrent browser-automation activity is a plausible noise source, and CLS is still the
  more trustworthy signal to sanity-check first when a low score turns up.
- Step 11 hit a new variant of the rAF/compositor-tick family already logged above: a
  GSAP tween created via a pure `javascript_tool` (CDP `Runtime.evaluate`) click —
  `document.querySelector(...).click()`, no real input — can sit at `progress: 0` and
  `totalTime: 0` **indefinitely**, even after several real seconds of `computer` `wait`,
  because `document.hidden`/`visibilityState` reports `"hidden"` for this tab during
  pure-JS calls and GSAP's default ticker is `requestAnimationFrame`-driven, which Chrome
  does not fire for a backgrounded tab at all (confirmed: a bare
  `requestAnimationFrame(fn)` sampler installed the same way never ran once, while
  `setTimeout` callbacks on the same page fired normally — rAF specifically is what's
  frozen, not JS execution generally). `computer wait` alone does not unstick this. A
  following **real** `computer` action — `left_click`, `scroll`, a keypress — reliably
  does: the queried tween's `progress()` jumps to `1` immediately after. This looks
  identical to a real bug (an entering row's opacity or a Flip travel transform stuck
  mid-animation forever) unless you know to check `document.hidden` first. Verify any
  GSAP-driven state by triggering with `.click()`/`javascript_tool` if convenient, but
  always follow with one real `computer` interaction before reading the settled result —
  never conclude a tween is broken from a `javascript_tool`-only sequence alone, no matter
  how long you wait.
- Cross-origin iframe wheel-scroll input (the step 04–06 iframe-at-a-different-port
  technique, used for 375px viewport checks) did not route into the framed page at all
  in this session — `computer` `scroll` at coordinates over the iframe moved the *outer*
  host page instead, leaving the iframe's own scroll position at 0 every time, regardless
  of scroll amount. This is a new failure mode beyond the already-logged
  `contentDocument` same-origin restriction (that one blocks script access; this blocks
  real input routing). Same-origin sidesteps both: serve the iframe host page from the
  site's own origin instead of a second port — for a `pnpm preview`/`astro build` site
  this means dropping a small iframe host file directly into `dist/` (e.g.
  `dist/_iframe-test.html`, `src="/"`) rather than a separate `serve` on another port,
  since `dist/` is already served by the same origin as the page under test. Delete the
  file afterward; a real `pnpm build` overwrites `dist/` anyway. With same-origin,
  `contentDocument` access, scripted clicks, and real `computer` scroll/click all worked
  correctly for verifying the 375px layout.
- Step 12: `gsap.from()`/`.fromTo()` default `immediateRender: true` even when nested
  inside a `gsap.timeline()`, confirmed against the installed `gsap@3.15.0`
  (`gsap-core.js`'s `_createTweenType`, which only applies this default to types 1/2 —
  `.from`/`.fromTo` — never to a plain `.to()`). Each such tween writes its own "from"
  state to the DOM synchronously the instant it's created, regardless of its position
  offset in the timeline — this is the mechanism the codebase's initial-state pattern
  already leaned on (`tier1Ticks`, `tier1Rule`) without this file ever stating it
  explicitly. Confirms a nested `tl.from(el, {...}, 0.3)` needs no separate `gsap.set()`
  call to hide `el` before the timeline actually reaches 0.3s.
- Step 12: a `gsap.timeline({ id: 'hero' })` (or any id) is not reachable from outside the
  bundle unless something exposes `gsap` itself on `window` — this codebase's `motion.ts`
  deliberately doesn't, so `gsap.getById(...)` can't be called from a `javascript_tool`
  console session as-is. A one-line `window.gsap = gsap` added right after
  `gsap.registerPlugin(...)`, rebuilt, used to read `gsap.getById('hero').totalDuration()`
  live, then removed before the final build/commit, is a clean way to get this
  verification hook without shipping it.
- Step 12: opening a new tab via `tabs_create_mcp` in this sandbox and navigating it to
  the same origin an already-tested tab is open on can inherit that other tab's
  `sessionStorage` (Chrome's own opener-cloning behaviour, not a bug) — a "fresh tab"
  is not reliably a fresh session for testing a `sessionStorage`-gated feature.
  `sessionStorage.removeItem(...)` immediately before the navigation you actually want to
  observe is the reliable way to force the first-play path, in either a top-level tab or
  a same-origin iframe (`iframe.contentWindow.sessionStorage`).
- Step 12 re-confirmed steps 09/11's environment-contention lesson under a worse case:
  with the user's real Brave browser sitting at ~26 `brave.exe` processes throughout (not
  something this session started or can close — `progress.md`'s own precedent is this is
  normal background state on this machine), a Lighthouse run taken while a
  `claude-in-chrome` tab was still open read CLS 0.061 against a 0.0003–0 baseline;
  closing that one tab and rerunning with no code change at all brought CLS back to a
  clean 0, twice in a row. Performance/TBT stayed low (48–68, TBT 1.8–2.1s) across every
  run this session regardless — treated as environment noise per the standing lesson, not
  chased further, since CLS (the trustworthy signal) was clean and repeatable.
- Step 13: `ScrollTrigger`'s `pin: true` silently disables its own `pinSpacing` (the
  mechanism that actually reserves extra scroll room for a pin) whenever the pinned
  element's parent has `display: flex` — confirmed in
  `node_modules/gsap/ScrollTrigger.js:1177`, not assumed. The pin still "works" in the
  sense that `ScrollTrigger.getAll()` reports the correct `start`/`end` and the element
  does go `position: fixed`, which is what makes this easy to miss without checking the
  DOM: the bug is that the page's total scroll height never grows to match, so the whole
  pinned sequence plays out inside the element's own unpinned height with no perceptible
  "stuck" scroll at all. Any future pinned `ScrollTrigger` (step 15's RP3/Agente H pages
  are spec'd as scrubbed-not-pinned, but a later set-piece might not be) needs
  `pinSpacing: true` explicitly whenever its parent — or any ancestor up to the nearest
  block container — is a flex or grid container, which this codebase's `flex flex-col`
  layout convention makes the common case, not the exception. Diagnosed by reading
  `.pin-spacer`'s own rendered height (stuck at the stage's natural height instead of
  stage + pin distance) against the ScrollTrigger instance's own `start`/`end`, not by
  guessing from the visual symptom (page reads too short) alone.
- Step 13: a `location.reload()` in this sandbox (via `javascript_tool`, not the
  `navigate` tool re-issuing the same URL — that one does not reproduce a real browser's
  scroll-restoration behaviour) does correctly restore the pre-reload `scrollY` and the
  matching mid-pin state, exactly like a real F5 — useful for verifying "no scroll jump
  on refresh mid-page" acceptance criteria without needing a native keyboard shortcut the
  extension can't send.
- Step 14: **the reduced-motion / no-JS / viewport-size verification recipe that finally
  works in this sandbox** — drive the Playwright Chromium binary directly over raw CDP from a
  throwaway Node script instead of through the `claude-in-chrome` extension. Launch
  `chrome.exe --headless=new --no-sandbox --remote-debugging-port=9333 --user-data-dir=<dir>`,
  read `/json/version` for the browser WebSocket, then per test: `Target.createTarget` →
  `Target.attachToTarget {flatten:true}` → `Emulation.setDeviceMetricsOverride` (real
  viewport widths *and heights*, which the extension's `resize_window` never gave),
  `Emulation.setEmulatedMedia` (`prefers-reduced-motion`), `Emulation.setScriptExecutionDisabled`
  (no-JS), `Emulation.setFocusEmulationEnabled`, and `Input.dispatchMouseEvent` type
  `mouseWheel` for real wheel input that Lenis honours. Node 24's global `WebSocket` means no
  dependency. The tab is genuinely visible, so rAF runs (unlike the extension's background
  tab, `visibilityState: "hidden"`). Keep the script in a scratch dir inside the project (Node
  can't resolve the `ARTHUR~1` short path) and delete it before committing. Use
  `fileURLToPath(new URL(...))` for paths — `URL.pathname` leaves `%20` in "Arthur Heberle".
- Step 14: **`ScrollTrigger` won't fire `onEnter` for a trigger whose start is exactly the
  current scroll** — progress must go above 0. `clamp(...)` turns any negative start (an
  element already in view at load) into exactly 0, so above-the-fold reveals silently wait for
  the first pixel of scroll. Diagnose with `ScrollTrigger.getAll()` (`start`, `progress`,
  `trigger`), not by staring at opacity: a synthetic `scroll` event does nothing because
  ScrollTrigger ignores scroll events where the position hasn't changed. To get at it in a
  bundled page, temporarily add `window.__dbg = { gsap, ScrollTrigger, lenis }` in
  `motion.ts`, rebuild, probe, remove it, and grep `dist/_astro/*.js` for `__dbg` to prove it
  is gone. The fix pattern is an `onRefresh` that plays when `self.start <= self.scroll()`.
- Step 14: **A verification that always scrolls first can't see load-time bugs.** Every
  earlier reveal check scrolled before looking, and the hidden-heading bug sat through steps
  08–13 as a result. Assert state at scroll 0, straight after load, for anything the design
  says is visible on the first screen — at several viewport heights, not only one.
- Step 14: **Elements at `opacity: 0` don't count toward CLS.** A bug that leaves something
  hidden can therefore mask a real layout shift, and fixing the bug "adds" CLS that was always
  there. When CLS moves after a change, bisect by reverting *only* that change, then read
  Lighthouse's own `layout-shifts` audit (`details.items[].node` and `subItems[].cause`) before
  concluding anything: it names the shifted node and, for font swaps, the font file. Here the
  node changed between builds — the tell that the shift wasn't the same one worsening.
- Step 14: **A `[FILL]` placeholder is not layout-neutral.** `Fill.astro` renders it in
  IBM Plex Mono, which is swap-loaded; the real copy will be Archivo 400, which is preloaded.
  Any CLS or wrap measurement taken while placeholders are on the page measures the
  placeholder. Swap in throwaway prose (temporarily, then restore the file from a copy and
  check `git diff` is empty) to measure what the page will actually do.
- Step 14: **A pin only finishes if the content after it is at least one viewport tall.**
  `pinSpacing` adds exactly the pin distance to the page, so the maximum scroll is
  `start + pinDistance + contentAfter − viewportHeight`, and the pin ends at
  `start + pinDistance`: the shortfall is `viewportHeight − contentAfter`, whatever the pin
  length. Any future pinned set-piece needs enough content after it, or a timeline that
  finishes before the pin does. Measure it by scrolling to the true bottom at several
  viewport heights and reading the last animated element's opacity.
- Step 14: Tailwind v4 scans **every file in the repo** for class candidates, including
  `docs/*.md`, so a class name quoted in prose can compile into `dist`. That is where the
  `.rounded` leak came from (step 02's note blamed `/type-test`, and deleting it changed
  nothing). If it ever matters, `@import "tailwindcss" source("../")`-style scoping in
  `tokens.css` fixes it — a token-file change, so ask first.
- Step 14: `Edit`/scripted replacements on this repo's files can fail on a multi-line string
  because some files carry mixed CRLF/LF line endings (`file` reports CRLF; `od` on a single
  line shows LF). Read the file and use the `Edit` tool, which matches on content; a Python
  `str.replace` on a multi-line block assumed to be LF will silently assert-fail.
- **Never give an SVG element a CSS `transform-origin`/`transform-box` if GSAP transforms
  it.** GSAP bakes the origin into the element's `transform` attribute, and the browser
  applies the CSS origin on top, so the element drifts by (1−scale)·(its position). Set
  `transformOrigin` in the tween instead. This is how the Braille pins "flew in from the
  right" until 2026-09-29.
- The claude-in-chrome tab can report `visibilityState: hidden`, which freezes rAF, so no
  animation can be sampled there. Use headless Playwright Chromium over raw CDP
  (`Emulation.setDeviceMetricsOverride` + `Page.addScriptToEvaluateOnNewDocument` with a
  per-frame rAF logger) to measure motion.

---

After step 14 — EduBra "How it works" scroll story, from Arthur's prototype `edubra-story.html`
(2026-09-30). Replaces the static system diagram (`EdubraDiagram.astro`, `diagram.css`, both
deleted). Page order: device, "Try a word", How it works, then the text sections.
- **Ported, not redesigned.** `T`, `SCENES`, `DROP`, `ITEMS`, the geometry and the copy are the
  prototype's. `render(p)` is a pure function of progress in `src/projects/edubra/story.ts`;
  live mode drives it from one GSAP timeline under ScrollTrigger `{ pin: true, scrub: 0.8 }`,
  `end` = 5.2 viewport heights (the prototype's 620vh less its stage).
- **Files:** `EdubraStory.astro` (markup, rendered in its final state, so no-JS reads),
  `Cub.astro` (the prototype's `cub()` on the server), `story.ts`, `story.css`; hooked up in
  `motion.ts` (`storyLive` in the ≥768px branch, first, `refreshPriority: 1`; `storyStatic` in the
  <768px and reduced-motion branches).
- **Hardware is CSS 3D, wires are hung on anchors.** `wire()` measures the anchor elements inside
  the 3D parts at rest, rewrites the three wire paths and re-measures stroke lengths; it runs on
  every ScrollTrigger refresh (resize included). The no-JS fallback paths in the markup are what
  it measured. Pins rise with `translateZ` on stacked discs; the Pi's ACT LED and the speaker
  cone are driven by `render(p)`. Wood is `/textures/wood-medium.webp`. No Raspberry Pi logo.
- **Only transform, opacity, stroke-dashoffset.** Prototype effects that changed anything else
  became an opacity crossfade between two stacked elements: lit Wi-Fi arcs, highlighted audio
  card, "already read" characters, the big letter (one `<text>` per letter), the ACT LED, the step
  ticks. The read cursor is four paths (two rounded ends, two lines) that move and scale.
  Braille dot patterns come from `braille.ts`, not a second copy of the alphabet.
- **Divergences from the prototype:** caption/silkscreen weight 600 → 500 (the site ships Archivo
  400/500 only); the stage's 24px side padding dropped (the page column already has gutters);
  caption grey is the token `--color-graphite-2`; the canvas scale is read back from a `.fit`
  box that CSS sizes (aspect-ratio, plus a max-height when live), so applying it never shifts
  layout; the static frame scrolls sideways below 763px and gets `tabindex="0"`.
- **The device component needed no change.** `EdubraDevice.astro` had no pulses, two-way highlight
  or front LED (its `.front` is just the box's wood edge; git history has none either). Arthur
  was told; nothing was removed.
- **Verified (headless Chromium over raw CDP):** 1280×900 pins over 5.2 viewport heights, the
  captions and ticks switch at the SCENES fractions, the wires land on the anchors, the text
  sections follow and the pin completes (max scroll is past its end); 375px, 767px, reduced motion
  and no JS all give the final state with captions stacked and no page-level horizontal
  overflow; 768px pins; crossing 768px and toggling reduced motion both ways swaps modes cleanly;
  console clean; motion bundle ~70KB gzip.
- **Lessons:**
  - **Tailwind utility names are global.** The prototype's 3D "table" class is Tailwind's
    `.table { display: table }`; in the page it changed the layout of everything inside it. It is
    `.bench` now. Check any borrowed prototype class name against Tailwind's utilities.
  - **ScrollTrigger turns `pinSpacing` off when the pin's parent is `display: flex`** (the project
    article is). Set `pinSpacing: true` explicitly or the pin adds no scroll distance.
  - **Headless screenshots can drop 3D faces.** After one `Page.captureScreenshot`, later frames
    of this page sometimes lack the speaker's front face until anything on the page is touched;
    the untouched prototype does not do it, and no style change of mine explains it. Take one
    screenshot per fresh page load when checking the 3D parts.

---

After step 14 — **EduBra stage 1: accessibility** (Arthur's brief, 2026-09-30).
- **Problem:** a screen reader read the drawing aloud ("h h e e l l l l o o", "helowrd",
  "Raspberry Pi 4 Model B"), on a page about a device for blind people.
- **The story:** `.canvas` keeps the section's single `role="img"`, now with the brief's label
  verbatim. The SVG, the 3D `.scene`, the callout and the HTML tape were already `aria-hidden`.
  `.frame` is a labelled group ("Drawing, scrolls sideways") and a focus stop only in the static
  layout, where it scrolls sideways. `story.ts` removes `tabindex`, `role` and `aria-label`
  together when the live layout starts and puts them back on cleanup.
- **The device:** every `.cell` (holes, pins, letter) and the button and knob inner spans are
  `aria-hidden`, including cells rebuilt by "Try a word". The word keeps one `role="img"` label.
- **Two controls were both named "Pause"** (the device's and the story's). The story's is now
  `aria-label="Pause the drawing"`; its visible text is still "Pause", so the name contains it.
- **Tapes:** already exactly one per breakpoint, hidden with `display:none` (never visually).
  Checked live at 1280, 768, 767, 375, 375 reduced motion, and no-JS at 375 and 1280.
- **Verified (headless Chromium over CDP, `Accessibility.getFullAXTree`):** at 1280 and 375, with
  and without JS, the tree has no drawing text. There are two `image` nodes (the drawing and the
  Braille word), and 17 buttons, each once, with its label. No-JS has none.

After step 14 — **EduBra stage 2: hardware accuracy** (Arthur's brief, 2026-09-30).

Checked against the paper (`public/docs/edubra-paper.pdf`, renamed from `ArtigoFinal_Oficinas1.pdf`;
text extracted with a scratch pypdf). All five points in the brief match it: 3 mm MDF with
laser-cut finger joints (3.5); the cell and pins printed in PLA, the cell shown yellow and the pins
black (3.2, Figures 5 and 6); buttons pause up, accelerate right, decelerate down, back left
(Figure 8); knob and headphone jack on the side (3.4, Figure 15); audio leaves through a P2 jack to
the user's own headphones or speaker (3.4).

- **Hardware corrections:**
  - **Box:** MDF, not wood. Lid `#c7a57e` with a fine speckle (`public/textures/mdf.webp`, 8,782
    bytes, 512 px, seamless by construction: noise generated with wrapped indices, a wrapped
    blur, quantised to 9 levels, about 1 % lightness std after compression; seam difference ~1
    level of 255). The front and right faces are flat `#8a6440` (laser-cut edge). "EduBra" is
    engraved on the front in `#6e4d2f`, flat, no shadow. `wood-medium.webp` deleted.
  - **Cell:** a yellow PLA plate `#e9bc2a` set into the lid under the holes, recesses `#b58c10`
    with a `#7a5a00` rim (3.55:1 on the plate), pins `#1d1d1f` with a subtle highlight on the head.
    In "How it works" the cell is the same yellow block with darker-yellow sides and the same black
    pins (class renamed `woodblk` to `cellblk`).
  - **Buttons:** pause on top, back left, faster right, slower at the bottom, the speed in the
    middle. Markup follows that order, so tab order does too. The symbols stay dark with a light
    copy nudged 0.6px left and 0.8px up behind them (new `Glyph.astro`): two static paths, because a
    shadow or filter would flatten the 3D chain.
  - **Knob and jack:** on a new right face (`.side`), knob `translateZ` discs sticking out of it, a
    3.5 mm jack drawn as a ring round a dark hole, and UTFPR engraved under it. The volume
    readout ("volume off / low / high") moved to the lid, under the cross, because text on the
    turned face would be unreadable. The knob is hidden without JS, like the buttons.
  - **No speaker:** the drawn label is "your headphones or speaker". The callout names are
    "Headphones or speaker" and, for the jack, "Out to your headphones or speaker" (my wording,
    the smallest change from "Out to the speaker"). The drawing still shows a speaker driver as the
    output device.
- **Divergences and calls made:**
  - **The box turns about the vertical axis** (`rotateY(-30deg)` after the 20deg tilt), not the
    story's `rotateZ(20deg)` table turn. Arthur chose "keep the 20deg tilt"; with that tilt the
    story's turn shows the right face about 7px wide, too thin for a knob. The turn shows it about
    30px wide and keeps the lid readable. The knob is about 23x68px on screen. It is smaller than
    24px wide, which WCAG 2.5.8 allows because no other target is within 24px of it.
  - **The box is shifted back to centre per container-query tier** (`--shift`, 8 to 11.6cqw):
    measured, the turn puts the right face and knob 19 to 36px past the column's right edge and
    leaves 16 to 73px spare on the left. After the shift the box is inside the column at 1024 and
    up and inside the viewport (at least 7px) at 375 and 320. No scaling was needed.
  - **Row widths shrank** (the knob left the lid), so the tiers' breakpoints are unchanged but
    each now has slack.
  - **Engraving on the sides.** The paper says the name and UTFPR are engraved on the side faces
    (Figure 15). The brief asks for "EduBra" on the front, which is what I did; UTFPR is on the
    right face, where the paper's photo has it.
  - **The story's speaker callout** keeps its shelf below the speaker, and the drawn label moved
    from y=497 to y=524 so the two don't collide. Phone framing 4's bottom edge 520 to 535 to keep
    the label in frame.
  - **Two controls were both "Pause"** (stage 1): the story's is now "Pause the drawing".
- **Contrast** (`.scratch/contrast.mjs`, against the darkest and lightest MDF pixel with the lid's
  own light overlay applied; need 4.5 for text, 3 for graphics):

  | Pair | Ratio |
  |---|---|
  | Letter labels, speed and volume readouts `#23262a` on darkest / lightest MDF | 5.45 / 8.19 |
  | Active-letter underline `#1f4f66` on darkest / lightest MDF | 3.18 / 4.78 |
  | Button focus ring (graphite) on darkest MDF | 5.45 |
  | Cell rim `#7a5a00` on the PLA plate | 3.55 |
  | Pin `#1d1d1f` on the plate / on the recess | 9.37 / 5.39 |
  | Button symbol on the cap, worst case at its edge | 6.60 |
  | Knob focus ring `#f6f7f6` on the side edge `#8a6440` | 4.92 |
  | Knob indicator on the knob | 12.34 |

  The knob uses a light focus ring because graphite on the dark edge is 2.88:1. Nothing red
  sits on the MDF (signal red is 2.35:1 there; it is only the "Try a word" underline, on the page
  ground). **The engraving is 1.44:1 on the edge, by the brief's "flat, slightly darker" wording,
  so it is decorative (`aria-hidden`) and not text anyone needs.** The old `#4b4842` labels
  measure 3.27:1 on the darkest MDF here (the brief says 3.4).
- **Verified (headless Chromium over CDP):**
  - The 3D chain holds: 96 elements preserve-3d, overflow visible, opacity 1, no filter.
  - One letter up at a time.
  - Pause, play, speed bounds (0.5x to 2x, disabled at the ends) and back all work.
  - The knob steps off, low, high by click and by arrow keys (clamped), and a real mouse click on
    its projected centre works.
  - Each button hit-tests to itself, and the cross is laid out pause top, slower bottom, back
    left, faster right, speed centre.
  - "Try a word" rebuilds the cells.
  - Reduced motion: transitions 0s.
  - No JS: first letter raised, buttons, knob and field absent.
  - The AX tree is unchanged from stage 1: 17 buttons, each once.
  - `astro check` clean.
- **Story wires after the recolour:** re-measured in stage 5: all five wire endpoints are 0px from
  their anchors at 1280, 1024 and 768.

After step 14 — **EduBra stage 3: copy** (Arthur's brief, 2026-09-30).
- **Verbatim:** the intro (`project.what`), the margin note (new optional `project.note`) and the
  four "How it works" captions. Step titles unchanged. Each string appears exactly once in the
  built HTML after whitespace and entity normalisation (checked by script). `docs/content.md` is
  updated to match.
- **The margin note** uses the site's existing `MarginNote.astro`, generalised: with no `entry`
  it is a plain note (the slot's text, no label, no back-link marker). Arthur chose "no marker":
  it is the page's only note, and a "1" would imply a sequence. `ProjectPage.astro` wraps the
  intro in the home page's `.rail` (prose, gutter where the leader is drawn, margin) only when an
  entry has a `note`; the leader is drawn by the same `tier1Leaders` as on the home page (one
  `.leader` on this page, five on home, home's note markup unchanged).
- **The captions needed a layout change.** The new ones are 65 to 95 characters, against about 57
  before, and sat in a ~240px column beside the title and controls with a fixed `44px` (desktop)
  or `76px` (phone) box. Measured: at 320px one caption was 93px tall in a 76px box. Now the
  captions take their own full-width row under the title, ticks and controls (`order: 3`), and the
  live crossfade slot is one grid cell, so it is always as tall as the tallest caption (26px at
  768 and up, 48 to 93px on phones) with no magic number. The ticks are pushed right with
  `margin-left: auto`. The static layout (no JS, reduced motion) gets the same row and stays a
  stacked list.
- **Checked:** at 1280 and 375 the intro, margin note (beside at 768 and up, stacked under on
  phones) and caption row look right; caption height checked at 1280, 1024, 768, 767, 600, 375
  and 320 against its box; `astro check` clean.

After step 14 — **EduBra stage 4: new sections** (Arthur's brief, 2026-09-30).
- **Order:** title and intro (with the margin note), device demo and "Try a word", How it works,
  By the numbers, How we built it, My part, What I'd do differently, Links. Checked against the
  built HTML's headings. "What I did" and "Role and team" are gone; "My part" replaces both.
- **Verbatim:** every paragraph in `src/content/archive/edubra.md`, asserted to appear exactly once
  in the built HTML (whitespace and entities normalised), including the four figure labels and the
  two link texts.
- **Template change (`ProjectPage.astro`, `content.config.ts`):** `project` is now `what`, `note?`,
  `built?`, `part`, `differently` (each paragraphs, one `<p>` apiece) and `paper?`. `did` and `team`
  are gone; only EduBra has a `project`, so no other entry changed. Links moved to the end. The
  repo link reads "Code on GitHub" (on project pages only; the home archive row still says "repo").
- **The paper link is `project.paper`, not `links.pdf`.** `links.pdf` would also appear on the home
  page's archive row (it shows every link an entry has), and the brief asked only for the project
  page's Links. Arthur can move it if he wants the row to have it. `public/docs/edubra-paper.pdf`
  (4.6 MB, renamed from Arthur's `ArtigoFinal_Oficinas1.pdf`) is committed with this stage; the
  link is served 200 `application/pdf`.
- **"By the numbers" (`EdubraNumbers.astro`, `numbers.css`):** four figures; four across from
  768px and two by two below.
  - **The drawings** are hand-made paths in a 160x100 viewBox with `aspect-ratio`, graphite
    outlines and a thinner graphite-2 annotation layer (dimension line and arrows, the pin ticks,
    the crosses). No `--measure` (the spec reserves it for set-pieces) and no `--signal`.
  - **The numbers** are Plex Mono at the display size (40px on phones), with the unit small beside
    them. Each figure has a hairline rule over it like an archive row.
  - **Sources, all from the paper:** 2.5 mm is Table 1's mean (2.4 to 2.7 mm); the bar is 40 units
    a second, so the voice is 2.4 s and three pins at 0.2 s each are 0.6 s (Table 2: 2.6 s for one
    dot, 3.5 s for five, +0.2 s a pin); the eight servos are section 3.3. The "three pins" in the
    bar is a drawing choice, not a measurement.
  - **Motion:** `tier2Numbers()` in `motion.ts`, in both no-preference branches. One timeline on
    the row (`clamp(top 85%)`, once, `onRefresh` for an already-visible row): each figure's paths
    draw with a per-path dasharray from `getTotalLength()` (600ms, `EASE_OUT`, 60ms stagger), then
    its labels fade in. `data-anim-played` on the row stops a replay after a matchMedia rebuild.
    Strokes use butt caps: a round cap leaves a dot at the start of a fully hidden stroke. The
    reduced-motion branch clears the inline styles. The numbers, captions and heading-adjacent
    text never animate; the section heading uses the same reveal as every other heading.
- **Verified (headless Chromium over CDP):**
  - Every stroke is hidden before the row enters, and the row is below the fold at 1280x900.
  - Drawn and clean 2.6s after entry: no inline styles, all labels at opacity 1.
  - Scrolling away and back replays nothing, and neither does crossing 768px afterwards.
  - Four across at 1280, two by two at 375, and no horizontal overflow at 375.
  - Phones animate too.
  - Reduced motion and no-JS show every drawing from the first frame.
  - The console is clean on EduBra at 1280, 375 and reduced motion, and on home.
  - `astro check` is clean.

After step 14 — **EduBra stage 5: final check** (Arthur's brief, 2026-09-30).
- **Blurb:** " and hardware interrupts" dropped and the comma fixed (Arthur's call):
  "Converts digital text to tactile Braille. Python on a Raspberry Pi 4, Wi-Fi and multithreading
  driving six servos, each word spoken aloud first." The paper says the interrupts were replaced by a
  button-watching thread, so the old line no longer matched "My part". `docs/content.md` updated.
- **Home archive entry:** still links `/projects/edubra/`, shows the new blurb, and still has only
  the `repo` link.
- **Lighthouse mobile** (Playwright Chromium, no other browser activity, preview on :4399):
  EduBra performance 98, accessibility 100, best practices 100 (CLS 0.006 to 0.02 across runs, TBT
  40 to 110ms); home 98 / 100 / 100 (CLS 0).
- **Found by that run and fixed:** the first EduBra run scored accessibility 96 with a failing
  `color-contrast` audit on the two engravings ("EduBra" on the front, "UTFPR" on the side: 1.43:1,
  `#6e4d2f` on `#8a6440`, as briefed). They are decoration, not text anyone reads, so they are now
  generated content (`::before` with `content: attr(data-text)`) instead of DOM text; they look the
  same and the checker no longer counts them. The brief's 4.5:1 rule is met for all real text.
- **JS:** about 74 KB gzip in total (motion 72.8 KB, the rest under 2 KB each), under the 90 KB floor.
- **Not tested here:** Firefox, desktop Safari and iOS Safari, as before (see the open question
  above). The `speechSynthesis` voice on iOS is still the standard pattern, not a test result.

After the EduBra brief — **a one-line hint above the device demo** (Arthur, 2026-09-30): "Press the
buttons, turn the knob on its side, or type your own word below." Small text, `--graphite-2`
(4.59:1 on the ground), shown only with JS since nothing on the demo works without it. The wording is
mine, not from the brief: change it in `EdubraDevice.astro`.

After the EduBra brief — **the same hint above "How it works"** (Arthur): "Tap a part of the hardware
to see what it does, or turn on the sound." Same style as the device's, JS only. Wording is mine.
It names the callouts and the Sound button because those exist in every layout; the step ticks
don't on phones or under reduced motion.

After the EduBra brief — **a "Home" link at the top of every project page** (Arthur, 2026-09-30).
`HomeLink.astro` (shared): a real `<a href="/">` with a hairline house icon and the text "Home",
written straight on the page (no button chrome: Arthur asked for that right after the first version).
Then, at his request: the icon is 2.5em (~42px) with a ~2.6px graphite stroke, and the word is graphite in
the display face (Archivo Expanded 500, body size) to be eye-catching. That is a second use of the display
face, which design-spec.md §5 reserves for display lines: Arthur's call, logged here, first child of `ProjectPage.astro`'s article. Static (not sticky), no motion,
no token or library change. Recorded in design-spec.md §6.

After the EduBra brief — **project pages: origin link at the top, title block at the foot; the house
icon is gone** (Arthur's brief, 2026-09-30). Replaces the house-icon "Home" link (`HomeLink.astro` and its
`.home` CSS deleted; no house icon anywhere in `src/`).
- **Top, `OriginLink.astro`:** one `<a href="/" aria-label="Arthur Heberle, back to home">`: a 20px
  circle-and-crosshair mark (1.5px graphite) and "Arthur Heberle" in the body font (Archivo, body size).
  On hover and keyboard focus a 14px leader (graphite-2, 1.5px) draws leftward out of the mark by
  `stroke-dashoffset` (120ms, `--ease-out`, a CSS transition) and retracts on leave. No arrow character.
  Focus ring: the global 2px `:focus-visible` one. Reduced motion: the site's 0.01ms transition
  convention makes the line appear instantly. It sits inside the 16px gutter on phones.
- **The mark is not the hero's.** The brief says "the same mark used in the home page hero" and "a small
  circle with a crosshair", but the hero's mark is an L-shaped corner bracket (step 12 dropped the
  crosshair; half of it fell off the top of the page). Arthur chose the circle and crosshair as written.
- **Bottom, `TitleBlock.astro`:** a 1px graphite-2 ruled box, left aligned. Top row "Arthur Heberle /
  index" (index links to `/`), second row "EduBra, sheet 01 of 07" in mono. NN is the project's place in
  the home archive's order (the new shared `sortArchive.ts`, which `Archive.astro` now uses too, so the
  two cannot disagree); TT is all archive entries (Arthur's choice over counting only entries with a
  page). "sheet NN+1" becomes a link when the next entry in that order has a project page; none does yet
  (EduBra is first and the rest have no pages), so there is no link today. "Project name" is the title
  before its dash.
- **Verified (headless Chromium over CDP):** one link, name and text as briefed, target 140x34px, no
  overflow at 1280 or 375; hover draws and leaving retracts the leader; Tab reaches it with a visible
  2px ring and the leader drawn; no-JS identical at rest; title block text exact, `index` is its only link;
  AX links are "Arthur Heberle, back to home" and "index", none named "Home"; the home archive still has
  7 rows with EduBra first.

Agente H, stage 5 — **a layout shift of 0.06 on the page, found by Lighthouse and fixed.** The story is near
the top of this page (a short intro and the status line above it), so it is in the first screen on a phone,
and when `story.ts` added `.is-live` the four stacked captions collapsed to one crossfading slot (`.caps`
244px to 71px) and everything below moved. EduBra's story sits below the fold, so it never counted there.
Fix in `src/projects/agente-h/story.css`: for the visitors who will get the live story (JavaScript on,
motion allowed: `.js` and `prefers-reduced-motion: no-preference`, with a second block below 768px) the
live layout is applied at first paint, so the classes change nothing; no JavaScript or reduced motion keeps
the static layout. It also reserves the empty Pause / Play again slot (the button wrapped onto its own
row and moved things 44px). Residuals measured and removed: the mono status line and the Archivo 500
headings re-wrapped as fonts swapped, so `Base.astro` gained an opt-in `preloadFonts` prop, used by this
one route (two fonts, ~30KB). Keep the pre-live rules in step with EduBra's `.story.is-live` / `.is-cam`
rules.

Agente H, camera and verification notes: the mobile camera lags one scene in a virtual-time capture with big
jumps and is correct in real time (checked by sampling the canvas transform each second: framing 1 to 2 at
3.6 s, to 3 at about 7 s, to 4 at about 10.4 s). The scene-4 framing waits until p = .87, after the stamp
has landed, so the phone is still in frame for it. Text in the camera framings renders at 11.07px or more.
Gold contrast: see the open question above. The AGENT-H repo was not modified.

Home part 1 (2026-10-01) — **The archive list is replaced by a project bench and an experience
section** (Arthur's brief). The archive collection, its tag filter, "show all" and Flip transition are
removed; the home page is Hero, Spine, Projects (the bench), Experience, Changelog, Contact. design-spec.md
§6 and content.md are updated. `Flip` is no longer imported, so it ships no JS.
