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
| 11 | Archive filter with Flip | todo | |
| 12 | Hero sequence | todo | |
| 13 | Project page template and EduBra set-piece | todo | |
| 14 | Final QA and ship v1 | todo | |
| 15 | Later months, one at a time | todo | not part of v1 |

---

## Open questions for Arthur

Blocking or near-blocking. Add to this list rather than guessing.

- [x] Opening line: rewritten in his words as "I make technical things make sense to
      people who didn't build them." Supporting line, mono identity line, the three spine
      paragraphs and all five margin notes are also final now — see `docs/content.md`.
- [ ] All `[FILL]` markers, now seeded verbatim into `src/content/` (11 total — 9 in
      archive entries, 2 in the changelog) and still greppable with
      `grep -rn "\[FILL" src/content/`. The chess note is resolved and no longer one of
      them. Two archive entries (Agente H, Brasilore) have no date at all; step 04 has to
      decide what to render for them meanwhile. **Render policy, decided:** an unresolved
      marker renders visibly on the page as a drafting annotation — mono, `--graphite-2`,
      marker text intact — rather than a silent placeholder or an omitted field. Step 14
      gates on the count reaching zero.
- [ ] The word the EduBra Braille set-piece spells.
- [ ] Contact section: publish WhatsApp number or email only?
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

---

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
