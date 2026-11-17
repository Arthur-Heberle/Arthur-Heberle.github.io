import { defineCollection } from 'astro:content'
import { z } from 'astro/zod'
import { file, glob } from 'astro/loaders'

const tag = z.enum(['code', 'hardware', 'teaching', 'ai', 'energy'])

// "2026-07", shown as 2026.07.
const month = z.string().regex(/^\d{4}-\d{2}$/)

// A project shown on the home bench. A field that is missing, or still a [FILL] marker, is
// omitted from the page (src/shared/fill.ts); prose that always renders is shown as written, and
// scripts/check-fill.mjs fails the build if a marker is in the output.
const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string().min(1),
    date: month.optional(), // omitted when the project has no date yet
    role: z.string().min(1),
    tags: z.array(tag).min(1),
    status: z.string().min(1).optional(), // "in progress"
    // Where the bench object goes: the project's own page, or an external URL when it has none.
    link: z.union([z.string().startsWith('/'), z.url()]),
    line: z.string().min(1), // the one-line description under the object
    // Links for the project page's Links section.
    links: z
      .object({
        repo: z.url().optional(),
        live: z.url().optional(),
      })
      .default({}),
    pinned: z.boolean().default(false),
    // The project-page prose (design-spec.md §6), optional because only entries with their own
    // page (src/projects/projects.ts's PROJECT_PAGES) need it. Paragraph lists render one <p> each.
    project: z
      .object({
        what: z.string().min(1), // the intro: what and why
        note: z.string().min(1).optional(), // a margin note beside `what` (no label, no marker)
        built: z.array(z.string().min(1)).optional(), // "How we built it" ("How I built it" when `solo`)
        solo: z.boolean().default(false), // built alone: the built heading says "I", not "we"
        status: z.string().min(1).optional(), // a one-line status under the intro (work in progress)
        next: z.array(z.string().min(1)).optional(), // "What's next"
        // "My part" and "What I'd do differently" are EduBra's; a project may carry neither.
        part: z.array(z.string().min(1)).min(1).optional(), // "My part": team, role and what he did
        differently: z.array(z.string().min(1)).min(1).optional(), // "What I'd do differently"
        // A document for the Links section.
        paper: z.object({ href: z.string().startsWith('/'), label: z.string().min(1) }).optional(),
      })
      .optional(),
  }),
})

// A job, course or research group, shown in the Experience section.
const experience = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/experience' }),
  schema: z.object({
    title: z.string().min(1),
    place: z.string().min(1).optional(),
    start: month,
    end: month.nullable(), // null: ongoing
    role: z.string().min(1).optional(),
    text: z.array(z.string().min(1)).min(1), // one <p> each
    hard: z.string().min(1).optional(), // "The hard part"
    // A screenshot shown in the details block (a path under public/), with its caption and alt text.
    image: z
      .object({
        src: z.string().startsWith('/'),
        width: z.number().int().positive(),
        height: z.number().int().positive(),
        alt: z.string().min(1),
        caption: z.string().min(1),
      })
      .optional(),
  }),
})

const changelog = defineCollection({
  loader: file('src/content/changelog.yaml'),
  schema: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    note: z.string().min(1),
  }),
})

// The home page's Roadmap (src/home/roadmap/): one YAML file per timeline in src/content/roadmap/, so a new
// timeline is a new file (that folder's README.md says how). A date is "YYYY-MM-DD" or "YYYY-MM"; YAML reads
// an unquoted full date as a Date, so one is turned back into its string here.
const roadmapDate = z.preprocess(
  (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value),
  z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/),
)
const roadmap = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/roadmap' }),
  schema: z.object({
    title: z.string().min(1),
    order: z.number().default(99),
    groups: z
      .array(
        z.object({
          title: z.string().min(1),
          nodes: z
            .array(
              z.object({
                title: z.string().min(1),
                start: roadmapDate.optional(), // makes the date a range
                due: roadmapDate, // the date limit
                done: z.boolean().default(false),
                about: z.string().min(1), // the popup's explanation
              }),
            )
            .min(1),
        }),
      )
      .min(1),
  }),
})

export const collections = { projects, experience, changelog, roadmap }
