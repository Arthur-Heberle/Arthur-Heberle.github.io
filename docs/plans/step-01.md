# Step 01 — Scaffold and deploy an empty site

## Context

`docs/progress.md` has every step marked `todo`, and the repo confirms it: there is no
`package.json`, no Astro project, no `src/pages`. The only source file present is
`src/styles/tokens.css` (step 02's asset, not step 01's), plus `.github/workflows/deploy.yml`,
`docs/`, `CLAUDE.md` and `README.md`. The single commit `c9aff13` is what `origin/main`
points at; everything else is untracked.

Step 01 exists so that deployment is never the unknown later. The outcome is a live URL at
`https://arthur-heberle.github.io` serving a page that reads just the site name, with a green
Actions run behind it. No design, no content, no fonts.

---

## Two things not in the implementation plan

Both are flagged rather than improvised past, per `CLAUDE.md`.

**1. `pnpm` is not installed.** `CLAUDE.md`'s command list assumes it. Node v24.19.0 and
`corepack` are present. Resolve before anything else:

```bash
npm install -g pnpm
```

(`corepack enable pnpm` also works; the global install is less fragile across Node upgrades.)

**2. `deploy.yml` is behind current docs.** The provided file pins:

| Action | Provided | Current docs |
|---|---|---|
| `withastro/action` | `@v3` | `@v6` |
| `actions/checkout` | `@v4` | `@v7` |
| `actions/deploy-pages` | `@v4` | `@v5` |

`CLAUDE.md` says to verify the Astro Pages deployment action against current docs rather than
memory, so the bump is in scope. It is still a change to a file the plan calls "already
provided", so it gets a line in the **Divergences** section of `progress.md`.

Verified against `docs.astro.build/en/guides/deploy/github/` and `github.com/withastro/action`.

---

## Approach

### 1. Scaffold Astro into a temp directory, then copy in

`pnpm create astro@latest .` refuses or prompts on a non-empty directory, and could clobber
`README.md` or `src/styles/tokens.css`. Scaffold elsewhere and copy the generated files in:

```bash
pnpm create astro@latest <scratchpad>/scaffold -- \
  --template minimal --typescript strict --no-install --no-git --skip-houston
```

Copy into the repo root: `package.json`, `astro.config.mjs`, `tsconfig.json`,
`src/pages/index.astro`, `public/`, `.gitignore`.

**Do not** copy anything over `src/styles/tokens.css` or `README.md`.

If `.gitignore` is absent from the template, write one covering `node_modules/`, `dist/`,
`.astro/`.

### 2. `astro.config.mjs`

Tailwind v4 uses the Vite plugin and CSS-first config. The old `@astrojs/tailwind`
integration is legacy Tailwind 3 only — do not install it.

```js
// @ts-check
import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  site: 'https://arthur-heberle.github.io',
  vite: {
    plugins: [tailwindcss()],
  },
})
```

No `base`. The repo is a user site at root — confirmed, `origin` is
`github.com/Arthur-Heberle/Arthur-Heberle.github.io`, so the acceptance item on repo naming
is already satisfied.

```bash
pnpm add -D tailwindcss @tailwindcss/vite
```

Manual install over `astro add tailwind` because it is deterministic and non-interactive;
the resulting config is identical.

### 3. Tailwind's CSS entry — `src/styles/global.css`

Tailwind needs a CSS entrypoint, but `tokens.css` belongs to step 02, which is where it gets
imported globally. So step 01 creates a separate minimal entry:

```css
@import "tailwindcss";
```

`src/styles/tokens.css` stays untouched and unimported this step. It already carries its own
`@import "tailwindcss"` line, so step 02 will fold these together rather than end up with two
entrypoints — that is step 02's call, not this one's.

### 4. `src/pages/index.astro`

A bare page reading the site name. No classes, no fonts, no tokens, no layout component.

```astro
---
import '../styles/global.css'
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Arthur Gabriel Pellegrini Heberle</title>
  </head>
  <body>
    <h1>Arthur Gabriel Pellegrini Heberle</h1>
  </body>
</html>
```

Tailwind's preflight reset will apply once Tailwind is installed. That is an unavoidable
consequence of the step's own mandate to add Tailwind, not added styling. Step 02 lays the
real palette over it.

### 5. `.github/workflows/deploy.yml`

Keep the existing structure — triggers, `permissions`, `concurrency`, two-job split are all
correct. Bump the three versions and pin the Node version to match the local v24.19.0:

```yaml
      - name: Checkout
        uses: actions/checkout@v7

      - name: Install, build and upload
        uses: withastro/action@v6
        with:
          path: .
          node-version: 24
          package-manager: pnpm@latest
```

and `actions/deploy-pages@v5` in the deploy job.

Commit `pnpm-lock.yaml` — the action detects the package manager from the lockfile.

---

## Arthur has to do one thing by hand

**Repo Settings → Pages → Source → "GitHub Actions"** (not "Deploy from a branch").

`actions/deploy-pages@v5` fails if this isn't set. Set it *before* the push, or the first run
goes red and needs a re-run. I cannot do this from here.

Per step 01's "stop and ask if": if Pages is already configured to deploy from a branch with
existing content, I stop rather than reconfigure it.

---

## Files

| File | Action |
|---|---|
| `package.json`, `pnpm-lock.yaml` | new, from scaffold + deps |
| `astro.config.mjs` | new — `site`, no `base`, Tailwind Vite plugin |
| `tsconfig.json` | new, strict |
| `.gitignore` | new — `node_modules/`, `dist/`, `.astro/` |
| `src/pages/index.astro` | new — site name only |
| `src/styles/global.css` | new — one line, `@import "tailwindcss"` |
| `.github/workflows/deploy.yml` | edit — three action versions, `node-version` |
| `src/styles/tokens.css` | **untouched** — step 02 owns it |
| `README.md` | **untouched** |

---

## Verification

Local, before pushing:

```bash
pnpm install
pnpm build      # must succeed — the step is not done otherwise
pnpm preview    # confirm the built output serves the name
```

Then check:

- `dist/index.html` exists and contains the name
- a CSS asset is emitted (proves the Tailwind Vite plugin is wired)
- no `base` anywhere in `astro.config.mjs`
- `astro check` is clean (step 03's gate, but free to run now)

After push, with Pages source set to GitHub Actions:

- the workflow run is green
- `https://arthur-heberle.github.io` serves the page
- asset paths are root-relative (`/…`), not `/Arthur-Heberle.github.io/…` — the proof that
  omitting `base` was right

### Step 01 acceptance checklist

- [ ] `pnpm build` succeeds
- [ ] the workflow run is green
- [ ] `https://arthur-heberle.github.io` serves the page
- [ ] repo is named exactly `Arthur-Heberle.github.io` — already true
- [ ] no `base` path in the config

---

## Close-out

Per `CLAUDE.md`'s workflow, with one ordering wrinkle: the acceptance items "workflow run is
green" and "the live URL serves the page" can only be checked *after* the push, but
`progress.md` is updated *before* the commit. So the local checklist is run first, then:

1. Confirm with Arthur that Pages source is set to **GitHub Actions**.
2. Mark step 01 `done` in `docs/progress.md`.
3. Add to **Divergences**: the three action-version bumps in `deploy.yml`, with the reason.
4. Add to **Notes for future sessions**: `pnpm` needed a global install; `create astro` was run
   in a temp dir to avoid clobbering `tokens.css` and `README.md`.
5. Commit as `step 01: scaffold and deploy an empty site`.
6. **Push to origin.** This is what triggers the workflow.
7. Watch the run. If it goes red, fix and push again — step 01 is not done until it is green
   and the live URL serves the page.
8. Stop and report. Do not start step 02.

---

## Not blocking this step

- **Site language.** `design-spec.md` §13 says decide before step 1. It does not change the
  scaffold — an `i18n` block can be added to `astro.config.mjs` later without a refactor. It
  does block **step 03**, where the content schema is defined. Leave it open in `progress.md`.
- All `[FILL]` markers, the opening line, the Braille word, the contact decision — none touch
  step 01.
