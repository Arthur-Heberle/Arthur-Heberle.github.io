import { defineCollection } from 'astro:content'
import { z } from 'astro/zod'
import { file, glob } from 'astro/loaders'

/* A [FILL] marker from docs/content.md, standing in for a value only Arthur can supply.
 * Matched anywhere in the string, not just at the start: "taught ~[FILL]" is a real value
 * in content.md and must validate. Never replace a marker with a guess — see CLAUDE.md's
 * "never invent facts" rule. */
const FILL = /\[FILL/

const tag = z.enum(['code', 'hardware', 'teaching', 'ai', 'energy'])

const archive = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/archive' }),
  schema: z.object({
    // "2026-07", displayed as 2026.07 — or an unresolved [FILL] marker.
    date: z.union([z.string().regex(/^\d{4}-\d{2}$/), z.string().regex(FILL)]),
    title: z.string().min(1),
    role: z.string().min(1), // required. Never .optional(), never defaulted.
    tags: z.array(tag).min(1),
    links: z
      .object({
        repo: z.url().optional(),
        live: z.url().optional(),
        pdf: z.string().optional(), // site-relative path, not a URL
      })
      .default({}),
    blurb: z.string().min(1),
    pinned: z.boolean().default(false),
  }),
})

const notes = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/notes' }),
  schema: z.object({
    order: z.number().int().min(1).max(5), // five is the ceiling, per design-spec §7
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
