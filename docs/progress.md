# Progress

Claude Code reads this first, every session. Do the first step not marked done. One step
per session. Update this file before committing.

Status values: `todo`, `in progress`, `done`, `blocked`.

| # | Step | Status | Notes |
|---|---|---|---|
| 01 | Scaffold and deploy an empty site | done | pnpm required a global install first; Astro scaffolded to a scratch dir and copied in to avoid clobbering `tokens.css`/`README.md` |
| 02 | Tokens, type and layout primitives | done | fonts self-hosted, not `<link>`-loaded; `@theme` reset lines added to `tokens.css`; TypeScript pinned to 5.9.3, not `latest`, for `@astrojs/check` compatibility |
| 03 | Content collections | todo | |
| 04 | Static home page | todo | |
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

- [ ] Opening line: A, B or C, rewritten in his words.
- [ ] All `[FILL]` markers in `docs/content.md`, especially the archive `role` values.
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
