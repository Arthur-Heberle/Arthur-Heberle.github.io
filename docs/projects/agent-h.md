# Agent H — WhatsApp AI sales agent

A multi-tenant SaaS that lets a small business run an AI sales agent on its own WhatsApp
number. Built alone by Arthur Gabriel Pellegrini Heberle.

Source repository: `AGENT-H` (private). Product name history: *Heberle AI Agent* → **Agente H**.

---

## How to use this file

This is context for building **Agent H's own product website**. It is written to be
handed to an AI that has never seen the codebase.

- **Part 1** is what the site can *say*: positioning, audience, story, status.
- **Part 2** is what is *true*: stack, architecture, concepts. Use it for accuracy, for
  a technical page, or to answer "how does it actually work".
- **Part 3** is raw material: screenshots, demo data, visual identity, quotable lines.

Three rules apply:

1. **This file is context, not a work order.** It exists so a later session has the
   facts. Reading it is not permission to start building the Agent H site — wait until
   Arthur asks for that explicitly.
2. **Never invent a fact.** Anything marked `[FILL]` is something only Arthur knows.
   Ask him. Do not write a plausible-sounding number.
3. **Modeled ≠ real.** Figures labelled *modeled* come from a planning document, not
   from revenue or from a signed client. Never present them as achieved results.

---

# Part 1 — The product

## 1.1 What it is

A customer messages a furniture store on WhatsApp: *"oi, tem sofá de couro?"*
Agent H reads the question, searches that store's own catalog semantically, and answers
with real products, real prices and real stock — *"Temos o Sofá Milano de couro por
R$2.890..."* — inside the business hours the owner set.

The owner never touches a terminal. Everything — catalog, conversations, the agent's
personality, opening hours, captured leads — is managed from a web dashboard.

It is multi-tenant by design: each business is identified by its own WhatsApp number,
has its own catalog, its own agent configuration and its own data.

## 1.2 Who it's for

Brazilian small and medium businesses that already sell over WhatsApp and answer the
same catalog questions all day. Furniture stores first — that is the domain the whole
system was built and tested against — then clothing shops, food businesses, clinics and
professional offices.

The repo is unusually explicit about the psychology of that buyer:

> "Trust for Brazilian SME owners. Your users (furniture stores, law firms, doctors'
> offices) want to feel the tool is serious and safe, not a flashy startup toy."

That sentence should govern the tone of the website as much as it governed the
dashboard. No hype, no "supercharge your sales". Calm, concrete, trustworthy.

## 1.3 The problem

For a store that sells on WhatsApp:

- Catalog questions arrive continuously and each one is answered by hand.
- Nights and weekends either go unanswered or pull the owner back to work.
- A customer who *was* ready to buy gets buried in a thread and is never followed up.
- The catalog lives in the seller's head or in a spreadsheet, so answers about price and
  stock drift out of date.

None of that is a software problem the owner can solve alone. It is also why a generic
chatbot fails here: a bot that cannot see the real catalog gives wrong answers, which is
worse than a slow human.

## 1.4 What the owner gets

- **Answers grounded in the real catalog.** The agent only speaks about products that
  were actually retrieved from that store's own data.
- **Business hours it respects.** Seven-day grid, per-day open/close. Outside them the
  agent says the store is closed and no AI call is made at all.
- **A catalog they can load from a spreadsheet.** Upload a CSV, an AI proposes the
  column mapping, review it, import.
- **Leads captured automatically.** When the agent decides a conversation is a qualified
  lead it writes a one-line summary into a small CRM, with status tracking
  (Novo / Contatado / Ganho / Perdido), a WhatsApp deep link, and CSV export.
- **A kill switch per conversation.** One toggle in the dashboard hands that specific
  chat back to a human; the agent stops replying to that customer and keeps serving
  everyone else.
- **Automatic handoff, without touching the dashboard.** This is the best feature in the
  product and the least obvious. If an employee picks up the phone and answers that
  customer manually in WhatsApp, the system notices the message came from the business
  but not from the AI, saves it, and **switches the agent off for that conversation by
  itself**. A human taking over is the signal; nobody has to remember to press anything.
- **The agent hands qualified leads to a person.** When a conversation is classified as
  a qualified lead, the workflow sends a redirect message to an employee over WhatsApp,
  so a real salesperson picks up a warm conversation instead of discovering it in a list
  later.
- **Bilingual interface.** Portuguese by default, English available, toggled live.

## 1.5 The before → after story

This is the strongest narrative the site has, and **both halves of it are documented in
screenshots** — see `assets/agent-h/`, which holds the before and after canvas of
each workflow.

**Before** — two n8n workflows and nothing else:

- Workflow 1 received the WhatsApp webhook, validated the sender, extracted the customer
  data and inserted the message into Postgres.
- Workflow 2 ran every 30 seconds, collected unanswered messages, read the **product
  catalog out of a Google Sheet** (44 rows), formatted the whole sheet into a text blob,
  called the **Anthropic API directly from an HTTP node**, parsed the reply, sent it via
  Evolution API, appended leads back into Sheets, and pinged the owner when the lead
  looked qualified.

No semantic search — the entire catalog went into the prompt. No dashboard. No database
of record for products. One business.

**After** — the current system:

- The catalog lives in Postgres with a **pgvector** embedding per product; only the
  handful of products actually relevant to the question reach the model.
- The reasoning moved out of n8n into a **FastAPI service** with a layered architecture,
  its own tests, and a documented contract.
- It is **multi-tenant**: many businesses, each scoped to its own WhatsApp number.
- There is a real **dashboard** — catalog CRUD with images, conversation inbox, leads
  CRM, agent configuration, business hours, themes, mobile layout.
- Leads are a first-class table, not a spreadsheet append.

Same product idea, rebuilt as software. *A spreadsheet and a twelve-node automation blob
became a multi-tenant SaaS with semantic search and a CRM.*

## 1.6 Where n8n still sits today

n8n was not thrown away — it is still the messaging layer, and the site should say so
rather than implying a pure-Python system.

```
WhatsApp
   |  Evolution API (self-hosted gateway)
   v
n8n "receiver"   -> validates, saves the conversation, and routes by who sent it:
   |                  customer  -> save message
   |                  employee  -> save message AND disable the AI for this chat
   |                  the AI    -> already saved, ignore
   v
Postgres (Railway)
   |
   |  30-second debounce, so the agent never replies mid-sentence
   v
n8n "processor"  -> locks the pending messages, POSTs them to the Python API
   |
   v
FastAPI /process -> retrieval + reasoning
                    returns { reply, classification, lead_summary }
   |
   v
n8n              -> marks the messages done, checks the AI is still active,
                    saves the reply, records the lead classification,
                    sends the reply via Evolution API, and if the lead is
                    qualified, sends a redirect to an employee
```

The two n8n workflows, as they exist today:

**Workflow 1 — receiver (webhook).** Receive → validate → extract customer data → save
the conversation → branch on sender. A message from the customer is simply stored. A
message sent *from the business's own number* is checked against the database: if the AI
wrote it, it is already saved and gets dropped; if a human wrote it, it is saved as an
employee message and the next node **disables the AI for that conversation**.

**Workflow 2 — processor (every 30 seconds).** Get pending conversations → flip them to
`in_progress` → fetch the new customer messages → compact them into one JSON payload →
call the Python API → mark the messages done → check the AI is still active → save the
AI's reply → record the lead classification → send the reply through Evolution API →
if it was a qualified lead, send a redirect to an employee.

The division of labour is a deliberate, documented rule:

> "Data ownership rule (never break this): Only n8n writes to `messages` and
> `conversations`. Only Python writes to `products` and vector embeddings."

So the Python service is a **stateless brain**. It reads conversation history, thinks,
and answers. The one chat-side table it writes is `leads`.

## 1.7 Economics

From the project's own cost model (**modeled figures — not revenue, not a price anyone
has paid**):

- Total infrastructure ≈ **US$57/month** for the whole stack: n8n, the Python service,
  Postgres and the WhatsApp gateway on a single Railway project.
- The reasoning model is cheap enough that per-client API cost is cents: ~40
  conversations/day budgeted at roughly **US$0.51/month**.
- Therefore: *"99% of cost is fixed infrastructure, not usage. Going from 1 client to 5
  clients: +~$2-3/month in API calls, same infrastructure."*
- The document reasons about **R$400/month per store**, which at five stores is
  R$2,000/month revenue against ~R$320/month cost.

The honest and more interesting version of this for a website is the *shape*, not the
numbers: the marginal cost of one more client is a rounding error, which is what makes a
small-business price point in Brazil viable at all.

**The intended price is R$400/month per business.** That is the number Arthur plans to
charge. Nothing has been billed yet, so the site may state the price but must never
imply existing revenue, a customer count, or results achieved for a client.

## 1.8 Status and roadmap

**Live, and not yet in use.** The application is deployed and running at
**https://ai-agent-whatsapp.up.railway.app/** — a real working instance, not a mockup —
but no business is using it yet. It has zero customers, and the dashboard screenshots
show a real tenant with real imported products and empty conversation data.

That distinction matters for every sentence the website writes. *Built and running* is
true. *Trusted by businesses*, *helping stores sell more*, or any customer count is not.

46 unit tests. Roughly 36 commits over 2026-05-31 → 2026-06-16.

The phases, as they actually happened:

| Phase | What shipped |
|---|---|
| MVP | FastAPI backend + dashboard, registration with WhatsApp OTP, login |
| 0–1 | Mobile responsive layout and drawer nav; agent and business-hours config; private-conversations-only filter; strict per-tenant auth |
| 2 | Product images — upload, preview, thumbnail, 5MB cap |
| 3 | Leads / CRM — capture, list, status, CSV export |
| 4 | CSV catalog import with AI column mapping, plus the test suite around it |
| 5 | Accessibility polish — aria-labels on icon-only controls |
| after | Branding and localized auth UI; conversation and role fixes; AI pause toggle respected in `/process` |

Known not-yet-production items, stated by the author in the repo itself: the OTP store is
in-memory ("acceptable for MVP but needs Redis or DB for production scale") and uploaded
product images are ephemeral on Railway without an attached volume.

Two unmerged feature branches exist: `feat/csv-import-ui-polish` and
`feat/mobile-responsive`.

## 1.9 Constraints on the future website

Answered by Arthur, and binding on whoever builds the site:

| | |
|---|---|
| **Live URL** | https://ai-agent-whatsapp.up.railway.app/ — deployed and working |
| **In use?** | No. Zero businesses. Never imply otherwise |
| **Price** | R$400/month, intended. Not yet charged to anyone |
| **Audience** | Businesses only. This is a B2B product, not a consumer app |
| **Public demo** | None, and none is wanted. The dashboard is not to be opened to the public |
| **Video** | Doesn't exist yet. Arthur will record one later and supply it |
| **Languages** | **Both.** Every piece of the site must exist in Portuguese *and* English, the same way the product itself does |
| **Repository** | Private. See the note below |

**On the call to action:** there is no self-serve signup and no public demo, so the
only route a visitor can take is to contact Arthur directly. The site should be built
around an inquiry, not a "start free trial" button.
`[FILL: confirm the exact contact route — email, WhatsApp, a form?]`

**On making the repo public.** Arthur asked whether it should be. Recommendation:
**leave it private**, at least for now. Two reasons, and neither is about hiding sloppy
code. First, it is a product he intends to sell at R$400/month — publishing the whole
implementation, prompts included, gives away the thing being sold. Second, §2.15 lists
real security gaps (wide-open CORS, publicly-guessable image URLs, an in-memory OTP
store); publishing the map before fixing them is an unnecessary risk on a live
deployment. A portfolio does not need the source — screenshots, the architecture story
and this brief carry it. If he later wants the code to be readable for hiring reasons,
the better move is a small extracted repo — the retrieval pipeline, or the phone-key
and processing-status logic with its tests — rather than opening the product.

**Remaining unknowns:**

- `[FILL: exact contact route for the call to action]`
- `[FILL: the product video, once recorded]`
- `[FILL: does the site need a pricing page, or is R$400/month quoted only in conversation?]`

---

# Part 2 — How it is built

Everything in this part is taken from the code, not from the planning docs. Where the two
disagree, this file follows the code and says so.

## 2.1 System map

Four moving parts, all on one Railway project and one internal network:

| Component | Role |
|---|---|
| **Evolution API** (self-hosted, v2.3+) | WhatsApp gateway. Delivers inbound webhooks, sends outbound messages. |
| **n8n** | Messaging layer. Receives, persists, debounces, calls the API, sends replies. Owns `messages` and `conversations`. |
| **FastAPI service** | The brain and the dashboard's backend. Retrieval, prompting, classification, catalog, auth, stats. |
| **Postgres + pgvector** | Single database. Products with embeddings, conversations, messages, clients, settings, leads. |

There is no separate vector database, no Vercel, no load balancer — an explicit decision
recorded in the architecture doc: *"No Vercel. No separate vector DB. No load balancer.
One Railway project."*

## 2.2 Stack

**Backend** — FastAPI on Python 3.11, fully async end to end:

- `asyncpg` with **raw parameterized SQL and no ORM**; a lazily-created connection pool
  (min 2, max 10) held as a module singleton and managed by a lifespan context manager.
- `pgvector` registered as an asyncpg type codec per connection, plus json/jsonb codecs.
- `pydantic` v2 for every request and response model, `pydantic-settings` for typed
  configuration loaded from the environment.
- `openai` SDK, pointed at **two different endpoints** (see 2.5).
- `bcrypt` for password hashing, `python-jose` for HS256 JWTs, `httpx` for the Evolution
  API call.

**Frontend** — a vanilla ES6 single-page app with **no build system at all**, served by
FastAPI's static mount. The repo states it plainly: *"No webpack, Vite, npm, or
TypeScript."* There is no `package.json` anywhere in the project.

**Infrastructure** — a seven-line Dockerfile on `python:3.11-slim`, uvicorn, Railway,
`GET /health` as the healthcheck.

## 2.3 The message pipeline, step by step

Entry point is `POST /process` (`backend/api/routes/process.py`), which n8n calls. It is
guarded by a shared secret rather than a user token, because the caller is a machine.

**Guard chain, cheapest check first — each one can end the request before any AI spend:**

1. `require_process_secret` — compares the `X-Process-Secret` header against the
   configured value, else 401.
2. `is_private_phone(customer_phone)` — regex `^\d{8,14}$`. Keeps the agent out of group
   chats and broadcasts, whose WhatsApp JIDs are 18-digit or otherwise malformed. The
   code calls this a *"safety net: never let the AI reply into group chats."* Returns an
   empty reply classified `OUT_OF_SCOPE`; n8n is expected to send nothing.
3. `normalize_phone(business_phone)` — digits only, then drops the Brazilian mobile ninth
   digit. This is the tenant key, so it must be canonical (see 2.6).
4. `is_ai_enabled(customer_phone, business_phone)` — the per-conversation human-handoff
   kill switch, defaulting to true when no row exists.

Any exception becomes `503 "Processing temporarily unavailable — n8n should retry"`,
which pairs with n8n's retry policy and its reset of locked messages back to pending.

**Then `rag.process_message()` (`backend/services/rag.py`) runs, in this order:**

1. One query for the tenant's settings: system prompt, reply language, business hours.
2. `_is_open(hours)` — resolves "now" in `America/Sao_Paulo`, maps the weekday, compares
   `HH:MM` strings. Closed → return the canned closed-store reply immediately.
   **No embedding call, no LLM call.**
3. `_split_messages()` — the processing-status state machine (see 2.4).
4. Build the retrieval query from the messages that still need an answer.
5. `embed(query)` → a 1536-dimension vector.
6. `similarity_search()` → the tenant's nearest products by cosine distance.
7. Drop everything below the similarity floor, and log what was retrieved, kept and
   dropped with each score — a deliberate debugging affordance.
8. Assemble the system prompt and call the LLM **once**.
9. Parse the classification and lead summary out of the reply text.
10. If the conversation was classified a qualified lead, upsert it into `leads`, wrapped
    so that a CRM failure can never break the customer's reply.

**The processing-status state machine** is the piece worth explaining on a technical page,
because it solves a real distributed-systems problem with one column. Every message row
carries `processing_status`: `pending → in_progress → done`.

- n8n's poller flips a batch to `in_progress` before calling the API. That is the lock:
  if the LLM call runs longer than the 30-second tick, the next tick will not pick the
  same messages up again.
- Inside the service, `_split_messages` partitions by that status: **answer** only
  `in_progress`, **ignore entirely** anything still `pending`, and treat everything else
  as conversation context.
- Dropping `pending` is the subtle part. Those messages arrived *after* the lock — the
  customer is still typing. The model neither answers them nor sees them, so it never
  answers half a thought; the next cycle picks them up.
- Legacy payloads that carry no statuses at all fall back to the old behaviour rather
  than breaking.

Combined with n8n's 30-second debounce, a burst of five quick messages becomes **one**
LLM call answering all five.

**Two things happen outside the Python service that belong in any description of the
pipeline**, because they are product behaviour rather than plumbing:

- **The automatic handoff.** Evolution API delivers messages the business itself sent,
  not only the customer's. The receiver workflow queries the database to decide whether
  such a message came from the AI (already saved — drop it) or from a human (save it as
  an employee message, then run an update that sets `ai_enabled = false` for that
  conversation). The Python service later reads that flag and declines to answer. So the
  handoff is implemented as a *loop*: the agent watches its own output channel and steps
  aside when a person uses it.
- **The lead redirect.** After the reply is sent, the processor branches on the
  classification the model returned; a qualified lead triggers a second Evolution API
  call that messages an employee. The same workflow also writes the classification back
  onto the message row, which is what the dashboard's lead KPI counts.

## 2.4 Retrieval (RAG)

| Aspect | Implementation |
|---|---|
| Embedding model | `text-embedding-3-small`, 1536 dimensions |
| Unit of retrieval | One vector per **product row** — no chunking, no overlap |
| Embedded text | name + category + description + specs, concatenated. Price and stock deliberately excluded |
| Storage | `products.embedding VECTOR(1536)` in the same Postgres as everything else |
| Index | IVFFlat, `vector_cosine_ops`, 100 lists |
| Metric | Cosine — scored as `1 - (embedding <=> query)` |
| top-k | 8 |
| Quality floor | `MIN_SIMILARITY = 0.30` — anything below it never reaches the model |
| Scoping | `WHERE business_phone = $2 AND active = true` — tenant isolation and soft-delete in the same filter |
| Hybrid / rerank | None. Pure dense retrieval, no keyword fallback, no reranker |

Two details that matter more than they look:

**The floor is what makes honesty possible.** `LIMIT 8` returns the eight nearest
products regardless of how bad they are; the 0.30 floor then prunes them. A question with
no good match legitimately produces an empty product list, and the prompt's critical rule
takes over: say you don't have it and ask a clarifying question, rather than recommending
the wrong sofa.

**Re-embedding is conditional.** Editing a product only triggers a new embedding when
`name`, `category`, `description` or `specs` changed. Changing a price or a stock count
skips the embedding call entirely and takes a different SQL path. That is the main
per-write cost control.

Bulk writes batch through `embed_many()` in chunks of 100, with original index order
restored afterwards.

## 2.5 Models and prompting

**No model id is hardcoded anywhere.** Both are configuration:

- **Embeddings** go to OpenAI directly (`text-embedding-3-small`).
- **Chat** goes to any OpenAI-compatible endpoint via a configured base URL; the docs
  describe DeepSeek as the intended provider. The whole LLM service is 17 lines.

The reply prompt is a single system message assembled from five parts, followed by the
conversation turns:

1. **Base prompt** — the tenant's own text, or a Portuguese default: a furniture-store
   assistant, cordial and objective. It ends in a **REGRA CRÍTICA** — if no retrieved
   product matches, say so and ask a clarifying question; *do not* recommend a wrong
   product. An explicit negative constraint against the most expensive failure mode.
2. **Language instruction** — always Portuguese, always English, or auto-detect.
3. **Answer note** — on the status-aware path: previous messages were already answered,
   reply only to the latest ones.
4. **Product block** — the retrieved products, one compact line each with price and
   stock, description and specs indented. When retrieval came back empty, the literal
   string `(nenhum produto encontrado)` is rendered rather than an empty section, so the
   model has something concrete to reason about.
5. **Classification suffix** — instructs the model to append, on its own lines,
   `CLASSIFICATION: [QUALIFIED_LEAD|GENERAL_QUESTION|GREETING|OUT_OF_SCOPE]` and, when
   qualified, a one-line `LEAD_SUMMARY:`.

That last part is the notable cost decision: **reply and classification come from one
call**, not two. The service then splits the raw text on those markers, keeps everything
before `CLASSIFICATION:` as the customer-facing reply, and discards the lead summary
whenever the label is not `QUALIFIED_LEAD`.

A second, separate prompt — in English, unlike the reply prompt — handles CSV column
mapping. It asks for JSON only, and the parser strips markdown fences before decoding.

**Techniques present:** negative constraints, an explicit no-results sentinel, combined
reply+classification in one call, fence-stripped JSON parsing with a whitelist, retrieval
logging with scores, and several layers of early return purely to avoid spending money.

**Techniques deliberately absent** (worth knowing before claiming otherwise): no JSON
mode or structured outputs, no function/tool calling, no streaming, no temperature or
token limits set, no prompt caching, no token accounting, no in-process retry — retries
are n8n's job. And **no LangChain**, despite the architecture doc mentioning it; the
shipping code uses the raw SDK.

## 2.6 Data model

Six tables, no ORM, and — by design — **no foreign keys**. Rows are related by the
`business_phone` / `customer_phone` pair, which doubles as the tenant key.

| Table | Key | Notes |
|---|---|---|
| `clients` | `id`, unique email and business phone | One login per business; no roles, no seats |
| `client_settings` | `business_phone` | System prompt, reply language, business hours as JSONB |
| `products` | `id` | Price, stock, description, specs, `active` flag, image URL, `VECTOR(1536)` |
| `conversations` | `(customer_phone, business_phone)` | Customer name and the `ai_enabled` toggle |
| `messages` | `id` | Role, text, `processing_status`, classification. **Written by n8n only** |
| `leads` | `(business_phone, customer_phone)` | AI summary and a manual status |

Three patterns stand out:

**Schema as idempotent migration.** There is no Alembic. The service reads `schema.sql`
and executes it in full on every startup; every statement is written to be safely
re-runnable (`ADD COLUMN IF NOT EXISTS`, guarded `DO $$` blocks, backfill updates).

**The phone number is the primary key of the whole system**, which makes normalization
load-bearing. It exists in three places that must agree: a Python function, an equivalent
plpgsql function used by the backfill, and a raw SQL regex mirroring the private-chat
check. The SQL function carries a comment demanding it mirror the Python exactly.

**The lead upsert protects human work:**

```sql
ON CONFLICT (business_phone, customer_phone) DO UPDATE
SET summary = COALESCE(NULLIF(EXCLUDED.summary, ''), leads.summary),
    customer_name = COALESCE(EXCLUDED.customer_name, leads.customer_name)
```

A later, weaker AI summary can never blank out a good one, and `status` — the column a
human edits — is never touched by the agent.

## 2.7 API surface

Roughly 25 endpoints. Three different auth postures:

- **Public**: `/health`, `/login`, `/dashboard`, the static mount, and the four auth
  routes (login, register, verify-otp, logout).
- **Tenant JWT**: everything under `/api` — products and their images, the CSV import
  preview/commit pair, categories, leads and their CSV export, conversations and the AI
  toggle, stats, profile, account deletion, settings.
- **Shared secret**: `POST /process`, the machine-to-machine entry point.

## 2.8 Auth and multi-tenancy

**The JWT `sub` claim *is* the tenant key.** There is no user id in the token — the
payload is the business phone number and an expiry. Every authenticated request
re-normalizes that claim, so a token minted before a phone-format change still resolves
to the right tenant.

**Registration happens over WhatsApp.** The user enters DDD + number, business name,
email and password; a six-digit code generated with `secrets.randbelow` is sent through
Evolution API to that WhatsApp number; on verification the client row and its default
settings row are created in a single transaction and a JWT comes back. Password hashing
is bcrypt applied directly, with the 72-byte input truncation done consistently on both
hash and verify.

**Tenancy is application-enforced at the row level.** Every repository query carries
`WHERE business_phone = $1`, and mutations add the tenant to the id predicate, so another
tenant's product id surfaces as a 404 rather than leaking. Uploaded images are namespaced
per tenant on disk. There is no Postgres row-level security and no schema-per-tenant — a
missing `WHERE` clause would be a silent cross-tenant leak, which is exactly why the
repository layer is the only place SQL is allowed to exist.

## 2.9 The dashboard

~5,100 lines of hand-written frontend: 2,140 lines of JS, 1,765 of CSS, a 359-line mobile
stylesheet, and a self-contained 637-line login page.

**Nine hash routes, eight real views** — `#/config` only redirects to the general
settings page:

1. **Overview** — four KPI cards (conversations today with a percentage delta, average
   response time, human handoffs, leads captured) and a seven-day conversation-volume
   chart drawn as **inline SVG by hand, with no charting library**, plus a recent
   conversations table.
2. **Conversations** — a WhatsApp-shaped master/detail inbox. Bubbles are labelled by
   sender (*Agente IA*, *Atendente*, customer). The AI on/off switch lives in the thread
   header and updates optimistically — label, header pill and list row all change before
   the request resolves.
3. **Catalog** — product table with thumbnails, a live client-side filter bar (name,
   category, min/max price), a slide-in drawer for add/edit including a custom-category
   escape hatch, image upload with preview, and the CSV import modal.
4. **Leads** — summaries with an inline status dropdown, a `wa.me` deep link per lead,
   CSV export, and a hand-drawn SVG empty state.
5–8. **Settings** — account and danger zone; a three-way theme picker persisted to
   `localStorage` and applied by an inline head script so there is no flash of the wrong
   theme; the agent's system prompt with a live character counter and a 2,000-character
   cap; and the seven-day business-hours grid.

**Approach:**

- Template-literal rendering into `innerHTML`, with every user-supplied value passed
  through an escaping helper.
- A single fetch wrapper that injects the bearer token and force-logs-out on 401.
- CSS custom properties as design tokens — *"Never hardcode colors — reference these
  variables"* — with three themes selected by a `data-theme` attribute.
- Two Google fonts: **Fraunces** for titles and KPI numbers, **Hanken Grotesk** for the
  interface, with tabular figures on every numeric column.
- Mobile is a separate stylesheet loaded after the main one *"so it can override without
  `!important`"*: off-canvas drawer with backdrop and scroll lock, master/detail
  navigation with a back arrow, and tables that degrade into card lists — the renderer
  emits both markups and CSS chooses.
- Full **PT/EN localisation**, ~170 keys per locale, Portuguese as default, instant
  re-render on toggle. Product categories store a canonical Portuguese value in the
  database and translate only for display.
- Every view has the full cycle: skeleton → data → empty state → error banner with retry.
- Accessibility: visible focus rings globally, `aria-label` on every icon-only control,
  a `prefers-reduced-motion` block, an `.sr-only` utility, numeric input modes on the OTP
  boxes.

## 2.10 CSV import with AI column mapping

The most-tested feature in the project, and the best single demo of AI used for
*ergonomics* rather than for chat.

**Two steps, and the server keeps no file between them.** Preview parses the upload and
returns the rows to the browser; commit takes them back. No temp files, no session state.

**Preview:** decode, parse with a dict reader, take the column names, send **only the
first row** to the model as a sample (token control), and ask it to map each column onto
a canonical field. The response is fence-stripped, JSON-decoded, then filtered against a
hard whitelist of canonical field names so the model cannot inject arbitrary keys. If the
model fails entirely, the mapping falls back to empty and the user maps by hand — the
import never becomes unavailable because an AI call failed.

**Commit:** apply the mapping, parse, embed in batches, insert.

**Safeguards, all of them deliberate:**

| Guard | Why |
|---|---|
| 10MB upload cap, content-type and extension check | Obvious abuse |
| 500-row cap, mirrored in *both* the preview and the commit model | So preview never offers more rows than commit will accept, avoiding an opaque validation error |
| `total_rows` and `truncated` flags | The UI warns instead of silently dropping data |
| Dedupe against existing active products **and** within the file | Re-running an import is idempotent |
| Rows without a name skipped and counted | Partial garbage does not abort the batch |
| Per-row insert failures collected with row numbers | The user learns which rows failed |
| Embedding count-mismatch abort | *"Guard against a malformed embedding response silently dropping products via zip()"* |
| Brazilian price parsing | `R$ 1.234,56` handled explicitly; US-style `1,234.56` is documented as intentionally not disambiguated, because the market is Brazil |

## 2.11 Leads

Qualification is not a separate classifier call — it is the same reply call, self-labelled
by the model and parsed out of the tail. Status is the human's column, changed only
through the API against a server-side whitelist of the four allowed values.

The CSV export defends against **formula injection**, prefixing any cell that begins with
`=`, `+`, `-`, `@`, tab or carriage return. This matters specifically because the lead
summary is *LLM-generated from customer-controlled text* — it is the untrusted field
flowing into someone's spreadsheet.

## 2.12 Stats

Four SQL queries, all scoped to the tenant and all filtered to private 1:1 chats by the
same regex used in the reply path:

- Distinct customers who messaged today vs yesterday, with a percentage delta.
- Average first-response time, computed with a lateral join from each customer message to
  the next assistant message in that conversation.
- Distinct conversations a human took over today.
- Qualified leads today vs yesterday, and a seven-day message-volume series.

## 2.13 Testing, configuration, deployment

**46 unit tests** across three files, using pytest with async support and mocked AI calls:

- Phone normalization — the Brazilian ninth digit, formatting characters, international
  numbers left alone, group JIDs both modern and legacy, broadcast addresses.
- The processing-status state machine — six cases covering the partition rules and the
  legacy fallback.
- The CSV import — price formats, quantity fallbacks, fenced JSON, unknown-key stripping,
  the LLM-failure fallback, both dedupe modes, the count-mismatch abort and the row cap.

Not covered: the HTTP routes, auth, the repositories, the stats queries, and the
end-to-end reply path. There is no integration test and no CI configuration.

**Configuration** is a typed settings object with no defaults for the required values, so
the process fails at import time rather than serving traffic half-configured. Optional
values degrade gracefully — with no WhatsApp gateway configured, the OTP is logged
instead of sent, which is convenient locally.

**Deployment** is a minimal Dockerfile on Railway with a health endpoint, a single
uvicorn worker, and the schema re-applied at every boot.

## 2.14 Engineering concepts demonstrated

A scannable list for a technical page or an "what this project is" section:

**Architecture** — strict three-layer separation (routes → services → repositories) with
the rule stated as inviolable: *"Never put SQL in routes or services. Never put HTTP logic
in services."* · repository pattern, function-based rather than class-based · dependency
injection through the framework, with auth and tenancy arriving as one injected value ·
separate input and output DTOs for every resource · typed configuration with fail-fast
validation.

**Data** — vector search with pgvector · retrieval-augmented generation · cosine
similarity with an approximate index · application-enforced row-level multi-tenancy ·
idempotent schema-as-migration · soft deletes · upserts that preserve human edits ·
natural composite keys · parameterized SQL throughout.

**Distributed systems** — a status column used as a distributed lock · debouncing to
collapse a burst of events into one expensive call · retry and idempotency designed as a
pair, with the service returning a retryable status and the caller owning the retry ·
clear data-ownership boundaries between two systems writing to one database · graceful
degradation at every external dependency.

**AI engineering** — embedding on write with conditional re-embedding · batched
embeddings · a relevance floor as a correctness control, not just a performance one ·
prompt construction from composable parts · negative constraints against hallucination ·
combining two jobs into one model call for cost · structured data extracted from
free-text output · AI used for a one-off ergonomic task (column mapping) with a manual
fallback when it fails · cost control as a first-class design constraint, with four
different early returns before any paid call.

**Security** — bcrypt with consistent input truncation · JWT with the tenant key as
subject · a separate shared-secret scheme for machine traffic · output encoding against
XSS in the dashboard and against formula injection in exports · tenant scoping in every
query · upload validation by type, extension and size.

**Frontend** — a single-page app with no build step · hash routing · optimistic UI ·
design tokens in CSS custom properties with themes · full internationalisation with a
canonical-value/display-value split · responsive degradation from tables to cards ·
skeleton, empty and error states as a discipline rather than an afterthought ·
accessibility as a named phase of work.

## 2.15 Known limitations, and what would be done differently

Stated plainly, because the portfolio asks this of every project:

- **The OTP store is a Python dictionary in memory.** It is lost on restart, not shared
  between workers, and has no attempt rate limiting. Redis or a table is the fix. The
  author already flags this in the repo.
- **Uploaded images are ephemeral.** Railway's container filesystem is not persistent, so
  product images disappear on redeploy without an attached volume.
- **Those images are also public.** They are served from the static mount with guessable
  paths and no auth check.
- **CORS is wide open while credentials are allowed** — a combination that browsers
  reject and that would be unsafe if cookies were ever introduced.
- **No dependency is version-pinned.** Eleven bare package names, and the test
  dependencies are not declared at all.
- **No route, auth or repository tests.** The tested parts are the pure functions; the
  SQL and the HTTP surface are untested.
- **The classification protocol is text-delimited**, so customer text and product
  descriptions flow unescaped into the system prompt and a determined customer could in
  principle emit the classification marker themselves. Structured outputs would close
  this.
- **Two timezones disagree.** Business hours are evaluated in São Paulo time; the
  statistics queries use the database's date. They can report different days.
- **Deleting an account leaves orphans.** With no foreign keys there is no cascade, so
  products, messages and leads survive their client row.
- **Two sources of truth for "lead".** The statistics count classified *messages*, while
  the CRM reads the `leads` table; they can drift.

---

# Part 3 — Raw material for the website

## 3.1 Screenshots available

**All nine images are copied into this repo, next to this file, in
`docs/projects/assets/agent-h/`.** Use those. The originals live in the `AGENT-H` repo
under `pictures/`, but that folder is git-ignored there, so the copies here are the only
version of them under version control.

### The architecture story — four images

| File | What it shows |
|---|---|
| `n8n-workflow-1-receiver-before.png` | The original receiver: webhook → validate → extract → insert → wait. Simple and linear |
| `n8n-workflow-1-receiver-after.png` | Today's receiver. Visibly larger, with the sender-routing branch and the **"Disable AI to this conversation"** node — the automatic handoff, on screen |
| `n8n-workflow-2-processor-before.png` | The original processor, and the money shot for the "before": **Google Sheets** nodes reading the catalog, a raw **HTTP call to the Anthropic API**, leads appended back to Sheets |
| `n8n-workflow-2-processor-after.png` | Today's processor: lock → call the Python API → mark done → check the AI is active → save → classify → reply via Evolution → redirect qualified leads to an employee |

Placing `n8n-workflow-2-processor-before.png` next to its `-after` counterpart is the single most effective
image pair the site can use: the same problem, solved twice, with the reasoning moved out
of a spreadsheet-and-HTTP-node tangle into a service. Both "after" canvases carry the
author's own annotation boxes, which are legible and worth keeping rather than cropping.

### The live dashboard — five screenshots

| File | Screen | Notes |
|---|---|---|
| `dashboard-1-overview-dark-pt.png` | **Visão Geral** (Overview), dark theme | The four KPI cards, the 7-day chart, the recent-conversations table. All values are zero and the chart reads *"Nenhuma conversa ainda"* — honest, but it means this shot shows the empty state, not the product working |
| `dashboard-2-catalog-dark-pt.png` | **Catálogo**, dark theme | The strongest screenshot. 24 real furniture products imported from the demo CSV, the filter bar, *Importar CSV* and *Adicionar produto* |
| `dashboard-3-leads-empty-dark-pt.png` | **Leads**, dark theme | The empty state with its hand-drawn SVG illustration and *Exportar CSV* |
| `dashboard-4-agent-settings-light-pt.png` | **Agente IA** (settings), light theme | The system-prompt editor with its 0/2000 counter and the reply-language select. Shows the gold *Salvar* button with dark text on gold — the accessibility rule, applied |
| `dashboard-5-agent-settings-light-en.png` | **AI Agent**, light theme, **in English** | The exact same screen as #4 with the language toggled. Sidebar, labels, hints and button are all translated |

**Use the two agent-settings shots side by side.** They are the cleanest possible proof that the product is
genuinely bilingual, which matters because the site must be bilingual too.

**Two cautions before publishing any of these:**

- The catalog shot has several products priced **R$ 0,00**. Those rows came from the
  deliberately-malformed prices in the demo CSV that the Brazilian price parser does not
  disambiguate. It is a real rough edge; either crop past those rows, fix the demo data
  and retake the shot, or pick different rows. Do not ship a marketing image of a
  furniture catalog where the sofas are free.
- The overview and leads shots are empty states. They are good for showing craft — the product
  has designed empty states, which most don't — but they cannot carry a hero section.
  For a hero, use the catalog shot, or retake the overview with seeded conversation data.

`[FILL: retake the Overview screenshot with realistic data, or should the site work with
the empty state as-is?]`

## 3.2 Demo data that is safe to show

`catalogo_moveis.csv` — 20 furniture products with Portuguese headers, prices from
R$290 to R$3,890, stock counts, real-sounding descriptions and pipe-delimited
specifications. Product names follow the actual Brazilian furniture-retail convention of
European city names: Milano, Veneza, Toscana, Oslo, Copenhague, Florença, Lugano.

Note the deliberately messy price column — it is the exact kind of real-world input the
AI-mapped import was built to absorb.

Use this file for any mockup rather than inventing products, and never use
placeholder names. The repo's own design brief insists on *"real, realistic content
(real Brazilian business names, real number formats R$1.234,56) rather than generic
placeholders."*

## 3.3 Existing visual identity to stay consistent with

The dashboard already has a defined design system, and the product site should not
contradict it. **It ships in both a dark and a light form** — the screenshots show both,
and the product lets the user pick between three themes (Padrão/Ouro, Preto Suave,
Marrom Claro). The site can use either, but it should pick one and commit:

- The **dark** form: near-black surfaces, a gold serif wordmark, cream text, gold only on
  the active nav item and the KPI deltas. This is what the overview, catalog and leads
  screenshots show.
- The **light** form: a warm off-white content area against the same dark sidebar, with
  near-black text. This is what the two settings screenshots show, and it is the one the
  design brief argued for.

- **Muted gold as the only accent**, never as body text.
- **Gold is never text and never a large fill.** It is for thin borders, active states,
  icons, dividers and chart highlights. The accessibility rule is stated explicitly: gold
  on white fails AA for text, so gold buttons get dark text on the gold fill, never
  white-on-gold or gold-on-white.
- **Fraunces** (variable serif) for titles and numbers, **Hanken Grotesk** for interface
  text.
- Three themes exist in the product: Padrão (Ouro), Preto Suave, Marrom Claro.
- Motion budget: ~150ms hover, ~300ms state change, ~500ms page transition, standard
  easing, no bounce, and `prefers-reduced-motion` respected.

## 3.4 The anti-"AI slop" list the site must also obey

The project already wrote this list for itself, and it applies to the website just as
much:

> No purple-blue gradients. No gradient text on metric numbers. No thick colored border
> on one side of a rounded card — *"the single most recognizable AI tell"*. No nested
> cards. No glassmorphism. No Inter or Roboto everywhere. No 24px+ blob radii. No
> hairline border and wide soft shadow on the same element. No Lorem ipsum, no "John
> Doe". No SaaS clichés — "streamline", "supercharge", "empower".

And the principle behind it, which is the most useful line in the whole repo for anyone
briefing an AI to design something:

> "The single most important anti-AI-slop decision is what you forbid."
> "The biggest lever: feed the AI *references and explicit negative constraints*, not
> 'clean and modern'."

The brief is also self-aware about its own choices aging: *"the cream/beige background
that signals 'tasteful' today is itself becoming an AI default, so the differentiation
must come from execution."*

## 3.5 Quotable lines

Verbatim from the repo, safe to use:

- *"A SaaS dashboard that lets small business owners run a WhatsApp AI sales agent."*
- *"Built to be sold as a SaaS to Brazilian SMEs (furniture stores, clothing shops, food
  businesses, etc)."*
- *"99% of cost is fixed infrastructure, not usage."* (modeled)
- *"Prove the plumbing works with a hardcoded reply before touching RAG."* — the build
  rule the project was actually developed under, and a good line about how it was made.
- *"If none of the retrieved products match what the customer asked, say so and ask a
  clarifying question. Do NOT recommend a wrong product."* — the agent's own governing
  rule, translated.
- *"No Vercel. No separate vector DB. No load balancer."*

## 3.6 Competitive framing

The named competitors are **Kommo, WATI and respond.io**, and the repo's read on them is
that the chat inbox is where everyone competes. Agent H's stated differentiators are the
catalog-grounded answers, the Brazilian-SME fit, and execution quality — *"the premium
calm aesthetic and crafted microstates"* — rather than feature count.

`[FILL: does Arthur still see it this way, or has the positioning changed?]`

## 3.7 File map, for an AI that does have repo access

| Path | What is there |
|---|---|
| `backend/services/rag.py` | The whole orchestrator: prompts, business hours, the status state machine, classification parsing, lead upsert |
| `backend/services/llm.py` | The chat call — 17 lines |
| `backend/services/embedding.py` | Single and batch embedding |
| `backend/services/import_service.py` | CSV preview, AI column mapping, commit |
| `backend/api/routes/process.py` | The n8n entry point and its guard chain |
| `backend/repositories/products.py` | The pgvector similarity query |
| `backend/repositories/leads.py` | The preserving upsert |
| `backend/core/phone.py` | Tenant-key normalization and the private-chat check |
| `backend/core/config.py` | Every environment variable, including the similarity floor |
| `backend/schema.sql` | The full schema, the vector index, the idempotent migrations |
| `backend/static/` | The shipping dashboard |
| `static/` (repo root) | An **older prototype** of the same dashboard — no leads, no import, no images, and the previous product name. Useful only as history |
| `ARCHITECTURE.md`, `WHATSAPP_AGENT_ARCHITECTURE.md` | System design and the n8n workflow spec. Partly aspirational — trust the code |
| `DASHBOARD_SPECS.md` | The full design research brief, including the anti-AI-slop list |
| `pictures/n8n/`, `pictures/app/` | The workflow and dashboard screenshots. **Git-ignored in that repo** — the copies in `assets/agent-h/` here are the tracked ones |
| `catalogo_moveis.csv` | The demo catalog |
