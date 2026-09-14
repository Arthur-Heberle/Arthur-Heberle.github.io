# Step 03 — Content collections

## Context

`docs/progress.md` has step 01 `done`, step 02 `todo`. **Step 02 is planned but not built**
(`docs/plans/step-02.md` exists; `src/` is still three files). `CLAUDE.md`'s workflow is one
step per session in order, so step 02 must land before this executes. Nothing in step 03
depends on step 02's output — it touches no styling, no layout, no fonts — but the order stands.

Right now every word of the site lives in `docs/content.md`, a prose document. Step 03's
objective is that content becomes **data**: three Astro collections with Zod schemas, so
adding an archive entry later is one file rather than a refactor (`design-spec.md` §4).

The hard constraint running through the whole step is `CLAUDE.md`'s **never invent facts**
rule. `docs/content.md` carries `[FILL]` markers for things only Arthur knows — two archive
dates, five roles, the chess note, both changelog lines. Every one of them must survive into
`src/content/` verbatim and greppable. A schema that validates by quietly dropping `role`, or a
date that gets a plausible guess, fails the step even if `pnpm build` is green.

---

## Settled before writing this

Four decisions were put to Arthur; all four went to the recommended option.

1. **`astro check`** — install `@astrojs/check` and `typescript` as devDependencies. Step 01
   deliberately left them out; step 03's acceptance requires the command, and they are
   type-checking tooling that ships zero bytes to the browser.
2. **Language** — English only for v1. No `lang` field, collections stay flat. This closes the
   open question in `progress.md` that was marked as blocking this step.
3. **`[FILL]` in typed fields** — the schema accepts a marker string where a real value is
   missing. `role` and `date` stay required; markers stay verbatim.
4. **Changelog shape** — one `src/content/changelog.yaml` read by the `file()` loader, not one
   markdown file per one-line entry.

---

## What was verified, not remembered

`CLAUDE.md` requires checking framework specifics against current sources. Checked against
both `node_modules/astro@7.3.2` and `docs.astro.build`:

| Fact | Consequence |
|---|---|
| Config file is **`src/content.config.ts`** (`searchConfig` in `astro/dist/content/utils.js`). `src/content/config.ts` is the legacy path. | Use the modern path. |
| Astro 7.3.2 ships **Zod 4** — `astro/zod` re-exports `zod/v4` (zod 4.6.4 resolved). | Docs recommend `import { z } from 'astro/zod'`. `astro:content` still re-exports `z`, but its source carries `// TODO: remove in Astro 8`. Import from `astro/zod`. |
| `file()` parses `.yaml`/`.yml` via `js-yaml` (`loaders/file.js:20`). Array items need a unique `id` or `slug`. | The changelog YAML is an array and every entry carries an `id`. |
| A `file()` array item **missing an `id` is logged and skipped, not thrown**. | A typo silently loses an entry. Verification must count entries, not just check the build is green. |
| Legacy auto-collections only fire under `legacy.collectionsBackwardsCompat`, which is off. | `src/content/<name>/` with collections defined produces no deprecation warning. |
| `glob()` derives each `id` from the filename slug. | Filenames are the stable ids that step 13's project routes and step 10's leader lines will key off. |
| `z.object()` strips unknown keys by default. | The `id` key in `changelog.yaml` does not need to be in the schema. |
| `z.url()` rejects a scheme-less string (`github.com/a/b` fails). | See *Repo URLs* below. |

**The YAML date trap.** Unquoted `date: 2026-09-13` is parsed by YAML as a JS `Date`, which
fails `z.string()`. Unquoted `date: 2026-07` is not a valid YAML timestamp and stays a string —
so the archive would pass and the changelog would fail, which is the confusing version of this
bug. **Every date value is quoted**, in frontmatter and in YAML, without exception.

---

## Approach

### 1. `src/content.config.ts` — new

```ts
import { defineCollection } from 'astro:content'
import { z } from 'astro/zod'
import { file, glob } from 'astro/loaders'

/* A [FILL] marker from docs/content.md, standing in for a value only Arthur can supply.
 * Matched anywhere in the string, not just at the start: "taught ~[FILL]" is a real value
 * in content.md and must validate. Never replace a marker with a guess. */
const FILL = /\[FILL/

const tag = z.enum(['code', 'hardware', 'teaching', 'ai', 'energy'])

const archive = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/archive' }),
  schema: z.object({
    // "2026-07", displayed as 2026.07 — or an unresolved marker
    date: z.union([z.string().regex(/^\d{4}-\d{2}$/), z.string().regex(FILL)]),
    title: z.string().min(1),
    role: z.string().min(1),          // required. Never .optional(), never defaulted.
    tags: z.array(tag).min(1),
    links: z
      .object({
        repo: z.url().optional(),
        live: z.url().optional(),
        pdf: z.string().optional(),   // site-relative path, not a URL
      })
      .default({}),
    blurb: z.string().min(1),
    pinned: z.boolean().default(false),
  }),
})

const notes = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/notes' }),
  schema: z.object({
    order: z.number().int().min(1).max(5),  // five is the ceiling, per design-spec §7
    label: z.string().min(1),
  }),
})

const changelog = defineCollection({
  loader: file('src/content/changelog.yaml'),
  schema: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    note: z.string().min(1),
  }),
})

export const collections = { archive, notes, changelog }
```

Notes on the shape:

- **No generic `fillable()` helper.** The union is load-bearing in exactly one place — `date`,
  where the base shape is a regex. `role` and `note` are free strings, so wrapping them in a
  union with a marker branch would be a no-op that reads as though it does something. Marker
  *reporting* is handled by the grep census in Verification instead.
- **`role` is plain `z.string().min(1)`, required.** It is the field the whole archive concept
  rests on (`design-spec.md` §7: "nobody believes 'I love leadership'; everybody believes
  `taught ~40`"). Values like `taught ~[FILL]` satisfy it while keeping the marker visible.
- **Dates are strings, not `z.coerce.date()`.** `YYYY-MM` sorts correctly lexicographically,
  renders as `2026.07` with one `.replace()`, and has no timezone edge cases. A `Date` would
  give all three problems for no gain.
- **`tags` is an enum array with `.min(1)`**, so a typo like `hardwear` fails the build rather
  than creating a filter category nobody can click in step 05.

### 2. Content files — new

```
src/content/
  archive/          7 × .md    frontmatter carries the entry; body empty, reserved for step 13
  notes/            5 × .md    frontmatter carries order + label; body is the note prose
  changelog.yaml    2 entries
```

**Why archive bodies are empty.** Both `design-spec.md` §7 and `content.md` put `blurb` in the
schema, so it goes in frontmatter. The markdown body is left empty on purpose — it is where
step 13's project-page prose lands, and creating the file as `.md` now means that step adds
prose rather than migrating a format.

**Why note prose is the body.** A margin note is two or three sentences in Arthur's voice, not
a field. Body text means step 04 renders it with `render(entry)` and Arthur edits it as prose.

#### Marker rule, applied consistently

Two kinds of `[FILL]` appear in `content.md` and they are not encoded the same way:

- A marker that **replaces** a value becomes the field's string value:
  `date: "[FILL]"`, `role: "[FILL: solo, or team of N and what Arthur owned]"`.
- A marker that **qualifies** a value that already exists becomes a trailing YAML comment, so
  the real value renders and the request survives:
  `date: "2025-12" # [FILL: confirm]` (EduBra is the only case).

#### Archive seed, transcribed from `docs/content.md`

| File (= `id`) | date | role | tags | links | pinned |
|---|---|---|---|---|---|
| `edubra.md` | `"2025-12"` + `# [FILL: confirm]` | `"[FILL: solo, or team of N and what Arthur owned]"` | hardware, teaching | repo `Oficinas_1` | **true** |
| `agente-h.md` | `"[FILL]"` | `"built alone"` | code, ai | — | — |
| `rp3.md` | `"2026-07"` | `"[FILL: undergraduate researcher, team size]"` | code | — | — |
| `programming-techniques.md` | `"2026-03"` | `"taught ~[FILL]"` | teaching, code | — | — |
| `eletron-energia.md` | `"2026-01"` | `"[FILL]"` | energy | — | — |
| `brasilore.md` | `"[FILL]"` | `"[FILL]"` | code | repo `Brasilore` | — |
| `calculus-ii.md` | `"2025-03"` | `"taught ~[FILL]"` | teaching | — | — |

Titles and blurbs are copied **word for word** from `content.md` §Archive. No rewording, no
tightening, no added adjectives.

`pinned` is written only on EduBra; the other six omit it and take the schema default. That
makes the acceptance box a one-line grep.

**Repo URLs.** `content.md` writes repos scheme-less (`github.com/Arthur-Heberle/Oficinas_1`).
`z.url()` rejects that, so the files store `https://github.com/Arthur-Heberle/Oficinas_1`.
Adding the scheme is mechanical normalisation of a path Arthur supplied, not an invented fact —
but it is a change from the source document, so it is logged under Divergences.

#### Notes seed

`reading.md` (1), `languages.md` (2), `chess.md` (3), `guitar.md` (4), `working-on.md` (5).
Semantic filenames rather than `1-reading.md`, because step 10 draws a leader line per note
and a stable, meaningful `id` is what it will key on.

Bodies are the exact placeholder text from `content.md` §Margin notes. `chess.md`'s body is
the literal line `[FILL: his own line]`. Note 5 keeps **both** sentences — `content.md` is
explicit that if the second is cut, the whole note is cut.

#### `src/content/changelog.yaml`

```yaml
# Written by Arthur, never generated from commits. Newest first.
- id: "2026-09-13-first"
  date: "2026-09-13"
  note: "[FILL: first entry, in his words]"
- id: "2026-09-13-second"
  date: "2026-09-13"
  note: "[FILL: second entry]"
```

### 3. `package.json` — devDependencies

```bash
pnpm add -D @astrojs/check typescript
```

Plus a `"check": "astro check"` script, so the gate is `pnpm check` rather than a command
someone has to remember. Neither package has a postinstall, so pnpm 12's build-script blocking
(`pnpm-workspace.yaml` → `onlyBuiltDependencies`) is not involved.

### 4. What this step does **not** do

- No `getCollection` calls, no rendering, no page changes. Pages are step 04.
- No sort helper. "Pinned above chronology" is a query concern and belongs with the code that
  queries.
- **The opening line, the spine paragraphs, the identity block and the contact invitation are
  not collections.** The implementation plan names three collections; those four are page copy
  and stay in `content.md` until step 04. Their `[FILL]`s are not step 03's to resolve.
- **The EduBra Braille word is not a schema field.** Adding a `brailleWord` field would put a
  field in the archive schema that neither spec lists. It stays an open question for step 13.

---

## Files

| File | Action |
|---|---|
| `src/content.config.ts` | new — three collections, Zod schemas |
| `src/content/archive/*.md` | new — 7 files |
| `src/content/notes/*.md` | new — 5 files |
| `src/content/changelog.yaml` | new — 2 entries |
| `package.json` | edit — `@astrojs/check` + `typescript` devDeps, `check` script |
| `pnpm-lock.yaml` | regenerated |
| `docs/progress.md` | edit — mark done, close the language question, log divergences |

Nothing in `src/styles/`, `src/pages/` or `src/layouts/` is touched.

---

## Verification

```bash
pnpm install
pnpm build      # syncs and validates every entry; must succeed or the step is not done
pnpm check      # astro check, zero errors
```

**Entry counts — the build being green is not sufficient**, because a `file()` item missing an
`id` is skipped with a log line rather than an error:

```bash
grep -c "" <<< "$(ls src/content/archive/*.md)"   # 7
ls src/content/notes/*.md | wc -l                  # 5
node -e "const s=require('./.astro/data-store.json')" # or inspect .astro/data-store.json
```

Confirm 7 / 5 / 2 in `.astro/data-store.json` after the build. Any shortfall means an entry
was dropped silently.

**`role` is required, provably.** `astro sync` writes a JSON schema per collection to
`.astro/collections/archive.schema.json`. Check that `"role"` appears in its `required` array
and that `date`, `title`, `tags` and `blurb` do too. This is the acceptance box turned into an
artifact rather than an assertion about the source.

**The `[FILL]` census.** Expected inventory after seeding, 12 markers in `src/content/`:

```bash
grep -rn "\[FILL" src/content/ | wc -l    # 12
```

| Location | Count |
|---|---|
| archive — `edubra` date comment, `edubra` role, `agente-h` date, `rp3` role, `programming-techniques` role, `eletron-energia` role, `brasilore` date + role, `calculus-ii` role | 9 |
| notes — `chess.md` body | 1 |
| changelog — both notes | 2 |

A count below 12 means a marker was resolved by guessing. A count above 12 means one was
duplicated.

**Negative checks**, each should fail the build when tried and then be reverted:

- change one `tags` value to `hardwear` → enum error naming the file
- change a `date` to `2026-7` → regex error
- delete a `role` line → required-field error, which is the acceptance rule doing its job

### Step 03 acceptance checklist

- [ ] `astro check` passes with no errors
- [ ] 7 archive entries, 5 notes, 2 changelog entries exist — counted in `.astro/data-store.json`
- [ ] `role` is required by the schema, not optional — `required` array in the generated JSON schema
- [ ] EduBra is the only entry with `pinned: true` — `grep -rn "pinned" src/content/archive/`
- [ ] every `[FILL]` still present and greppable — census reads 12
- [ ] `pnpm build` succeeds

---

## Close-out

Per `CLAUDE.md`:

1. Run the acceptance checklist; every box passes.
2. `pnpm build` succeeds.
3. Mark step 03 `done` in `docs/progress.md`.
4. **Divergences:** `@astrojs/check` + `typescript` added as devDependencies, authorised by
   Arthur, required by this step's own acceptance and shipping no browser bytes; repo links
   stored with an `https://` scheme that `content.md` omits, because `z.url()` rejects
   scheme-less strings; changelog stored as one YAML file via `file()` rather than markdown,
   authorised by Arthur.
5. **Notes for future sessions:** quote every date in YAML and frontmatter or `2026-09-13`
   becomes a JS `Date` and fails `z.string()`; Astro 7 ships Zod **4** and the docs import `z`
   from `astro/zod`, with `astro:content`'s re-export marked for removal in Astro 8; a `file()`
   array item missing an `id` is skipped with only a log line, so entries must be counted.
6. **Open questions:** strike the site-language question — English for v1, decided. Leave the
   opening line, the remaining `[FILL]`s, the Braille word and the contact decision open, and
   add that nine archive/notes markers and both changelog lines now sit in `src/content/`
   waiting on him.
7. Commit as `step 03: content collections`.
8. Push to origin.
9. Stop and report. Do not start step 04.

---

## Blocked on Arthur, but not blocking this step

Every `[FILL]` seeded here is a question he still has to answer, and step 04 renders them. The
two that will be visible fastest:

- **Two archive entries have no date** (Agente H, Brasilore). Step 04 has to display something
  in the date column for them. That is step 04's decision, not this one's.
- **Both changelog entries are markers**, so the changelog section renders as two placeholder
  lines. Step 14's acceptance requires the first entry to be in his voice.
