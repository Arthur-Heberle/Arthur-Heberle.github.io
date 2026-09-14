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
| 05 | Archive filter, without GSAP | todo | |
| 06 | Accessibility and performance gate | todo | |
| 07 | Motion infrastructure only | todo | |
| 08 | Tier 2 triggered reveals | todo | |
| 09 | Tier 1 drawing layer | todo | |
| 10 | Leader lines to margin notes | todo | |
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
- [ ] `--graphite-2` on `--ground` measures 4.21:1, under the 4.5 AA floor for normal
      text (passes on `--sheet` at 4.66:1). It's the colour of margin notes and archive
      metadata. Not changed — it's a token and `CLAUDE.md` forbids changing one unasked,
      and design-spec §10 asks for margin notes "visible at low contrast by default" which
      this may be deliberate. Step 06 gates on Lighthouse accessibility 95+, which will
      flag it. Three ways out, Arthur's call: darken the token, move margin notes to
      `--sheet`, or accept the finding.

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
