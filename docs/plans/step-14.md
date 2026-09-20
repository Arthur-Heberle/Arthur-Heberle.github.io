# Step 14 — Final QA and ship v1

## Context

Steps 01–13 built the whole site. Step 14 is the gate that ships it: mostly verification,
with a small amount of construction (deleting `/type-test`, finishing Contact, resolving the
`[FILL]` markers that can be resolved now). `implementation-plan.md`'s Do list:

> Delete `/type-test`. Measure the JS bundle. Re-run Lighthouse. Test Chrome, Firefox and
> Safari including iOS Safari. Test with a trackpad and with a mouse wheel. Verify reduced
> motion end to end. Verify every `[FILL]` has been resolved or is deliberately still open.

Three of those can't be closed by code alone, and the step's whole job is to say so
plainly rather than tick a line nothing tested:

1. **`[FILL]` markers.** 16 at the start of the step; only Arthur can supply them.
   `progress.md` says the gate is "the count reaching zero"; the plan's own acceptance is
   "resolved **or deliberately still open**". Settled with Arthur this session: 4 are
   resolved now (Agente H's date, from the new `docs/projects/agent-h.md` brief; the contact
   invitation; both changelog notes) and the other 12 wait for their own project brief —
   Arthur's stated order of work (`docs/projects/README.md`: "a brief is context, not a work
   order"). Count 16 → 12.
2. **Firefox, desktop Safari, iOS Safari** aren't installed on this machine. Decided: ship
   Chromium-verified and log the gap.
3. **`prefers-reduced-motion`** has never been exercised live — steps 08 and 11 both logged
   the gap and deferred it to "a manual DevTools Rendering-panel check before step 14
   ships". This step is that deadline.

## Decisions taken with Arthur

- **Agente H `date` = `2026-06`**, from the brief's build window (~36 commits over
  2026-05-31 → 2026-06-16). Read from a document Arthur supplied, not invented.
- **Contact = email + WhatsApp.** Number given as `49 99194-2504`; the `wa.me` link needs a
  country code, so it becomes `https://wa.me/5549991942504` displayed `+55 49 99194-2504`.
  This is mechanical normalisation of a number he supplied (same class as step 03's
  scheme-less repo URLs), not an invented fact. Closes `progress.md`'s contact question.
- **Voice lines (contact invitation, two changelog notes): drafted by Claude, approved by
  Arthur with the plan.** None is a fact claim. Exact strings below.
- **Agente H blurb rewritten** from Arthur's own account of what the vector search does. The
  old line said "vector database"; the brief records an explicit decision that there is no
  separate vector database (Postgres + `pgvector`).
- **Cross-browser: Chromium only, gap logged.** No downloads.

## Files

| File | Change |
|---|---|
| `src/pages/type-test.astro` | delete |
| `src/scripts/motion.ts` | `onRefresh` fix for above-the-fold reveals (divergence 1); plus a comment that named `/type-test` |
| `src/content/archive/agente-h.md` | `date: "2026-06"`, blurb corrected |
| `src/content/changelog.yaml` | two real entries replace the two markers |
| `src/components/Contact.astro` | invitation sentence, WhatsApp link, comment states the decision |
| `src/styles/type.css` | comments only — two named `/type-test` |
| `src/components/Changelog.astro` | comment only — it said both entries were unresolved markers |
| `docs/content.md` | Agente H entry, Changelog seeds, Contact — kept in step with `src/content/` |
| `docs/progress.md` | step 14 done, `[FILL]` count and table, gaps and lessons |
| `docs/projects/` | **left untracked, not committed** — see divergence 7 |

## Verification

| Acceptance line | How |
|---|---|
| total JS under 90KB gzip | per-file `gzip -c` summed over `dist/_astro/*.js` |
| Lighthouse 95+ mobile | clean runs on `/` and `/projects/edubra`; CLS is the trustworthy signal |
| no console errors or warnings | real scroll of each route, console read afterwards |
| scrubbed motion smooth | `computer` real wheel scroll, small and large increments |
| reduced motion end to end | CDP `Emulation.setEmulatedMedia` against the Playwright Chromium binary; fall back to a forced-branch build, then to a checklist for Arthur |
| iOS Safari / Firefox | **not met** — logged as open risk |
| `/type-test` deleted | absent from `src/pages/` and `dist/`, no built link to it |
| Agente H sorts by its real date | archive order on `/`: EduBra (pinned), RP3, **Agente H**, Programming Techniques… |

## Stop and ask if

A `[FILL]` would need a guess to resolve; Lighthouse falls below 95 on a clean run with CLS
above 0.05; reduced motion shows hidden content; or anything needs a library, section or
token change the plan doesn't name.

## Divergences found while building

Full evidence for each is in `docs/progress.md` (Divergences, Step 14). In short:

1. **Real bug from step 08, fixed:** `clamp(top 85%)` left above-the-fold reveals at
   `opacity: 0` until the first pixel of scroll. `onRefresh` fix in `motion.ts`. Not in the
   approved plan; QA found it and it is a verified correction inside the existing rules.
2. **CLS finding, no code change:** the fix un-hid a layout shift on EduBra's placeholder
   copy (Plex Mono swap). Bisected, cause named, verified to vanish with real prose. A
   speculative Archivo 500 preload was tried, measured, and reverted.
3. **EduBra set-piece incomplete at max scroll on tall viewports** with placeholder copy.
   Fixed in a follow-up commit at Arthur's suggestion: the pinned stage gets
   `min-height: 75svh` (only where it pins). Verified complete at 7 viewport heights.
4. **Agente H blurb** trimmed from the approved wording to fit two lines.
5. **`.rounded` leak not resolved by deleting `/type-test`** — the plan's expected side
   benefit didn't happen; the cause is Tailwind scanning `docs/*.md`.
6. **Reduced motion verified via CDP**, the plan's first-choice method, so approaches 2–3
   were not needed.
7. **`docs/projects/` not committed**, against the approved plan. The Agent H brief lists
   the deployed app's live security gaps beside its real URL, plus pricing and a cost model,
   and this is a GitHub Pages user site (public on a free account). Nothing secret-shaped
   was found in it, but publishing is hard to undo and the plan was written before its
   contents were read. Arthur decides.
