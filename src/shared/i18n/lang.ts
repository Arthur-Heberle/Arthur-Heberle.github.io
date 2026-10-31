// Language helpers. English lives at /, Portuguese at /pt/ (astro.config.mjs's i18n block); each language
// is its own static page, so nothing here runs in the browser: a script gets its words as JSON from the page
// (runtime.ts).
export type Lang = 'en' | 'pt'

export const LANGS: readonly Lang[] = ['en', 'pt']

// The value of <html lang>.
export const HTML_LANG: Record<Lang, string> = { en: 'en', pt: 'pt-BR' }

// Speech synthesis voice for each language.
export const SPEECH_LANG: Record<Lang, string> = { en: 'en-US', pt: 'pt-BR' }

/** The language of the page being rendered (Astro.currentLocale; English when it is not set). */
export function getLang(astro: { currentLocale?: string | undefined }): Lang {
  return astro.currentLocale === 'pt' ? 'pt' : 'en'
}

/** A page path ("/", "/projects/edubra/") in a language ("/pt/", "/pt/projects/edubra/"). Anything that is
 *  not an internal page path (an external URL, a file) is returned as it is. */
export function localePath(lang: Lang, path: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path
  const bare = stripLang(path)
  return lang === 'pt' ? `/pt${bare}` : bare
}

/** The same page path in the other language. */
export function altPath(path: string): string {
  return localePath(path === '/pt' || path.startsWith('/pt/') ? 'en' : 'pt', path)
}

function stripLang(path: string): string {
  if (path === '/pt') return '/'
  return path.startsWith('/pt/') ? path.slice(3) : path
}
