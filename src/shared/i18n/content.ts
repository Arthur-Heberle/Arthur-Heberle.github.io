// The content collections in a language. Every page reads its entries through these, so a language is one
// place to change: English is src/content/, Portuguese is src/content/pt/ (collections `*Pt`, same schema, same ids).
import { getCollection } from 'astro:content'
import type { CollectionEntry } from 'astro:content'
import type { Lang } from './lang'

// The Portuguese collections have the English ones' schema, so the entries have the same type.
export async function getProjects(lang: Lang) {
  return (await getCollection(lang === 'pt' ? 'projectsPt' : 'projects')) as CollectionEntry<'projects'>[]
}

export async function getExperience(lang: Lang) {
  return (await getCollection(lang === 'pt' ? 'experiencePt' : 'experience')) as CollectionEntry<'experience'>[]
}

export async function getChangelog(lang: Lang) {
  return (await getCollection(lang === 'pt' ? 'changelogPt' : 'changelog')) as CollectionEntry<'changelog'>[]
}

export async function getRoadmap(lang: Lang) {
  const timelines = (await getCollection(lang === 'pt' ? 'roadmapPt' : 'roadmap')) as CollectionEntry<'roadmap'>[]
  return timelines.sort((a, b) => a.data.order - b.data.order || a.id.localeCompare(b.id))
}
