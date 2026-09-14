# Progress

Claude Code reads this first, every session. Do the first step not marked done. One step
per session. Update this file before committing.

Status values: `todo`, `in progress`, `done`, `blocked`.

| # | Step | Status | Notes |
|---|---|---|---|
| 01 | Scaffold and deploy an empty site | done | pnpm required a global install first; Astro scaffolded to a scratch dir and copied in to avoid clobbering `tokens.css`/`README.md` |
| 02 | Tokens, type and layout primitives | todo | |
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

- [ ] Site language: English confirmed, or bilingual from the start? Affects step 03.
- [ ] Opening line: A, B or C, rewritten in his words.
- [ ] All `[FILL]` markers in `docs/content.md`, especially the archive `role` values.
- [ ] The word the EduBra Braille set-piece spells.
- [ ] Contact section: publish WhatsApp number or email only?

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
