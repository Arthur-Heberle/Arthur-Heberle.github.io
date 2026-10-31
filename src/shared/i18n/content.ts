// The content collections in a language. Every page reads its entries through these, so a language is
// one place to change. Stage 2 adds the Portuguese collections (src/content/pt/) and switches these.
import { getCollection } from 'astro:content'
import type { Lang } from './lang'

export async function getProjects(_lang: Lang) {
  return getCollection('projects')
}

export async function getExperience(_lang: Lang) {
  return getCollection('experience')
}

export async function getNotes(_lang: Lang) {
  return getCollection('notes')
}

export async function getChangelog(_lang: Lang) {
  return getCollection('changelog')
}
