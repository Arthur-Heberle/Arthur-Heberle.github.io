// @ts-check
import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  site: 'https://arthur-heberle.github.io',
  // English at /, Portuguese at /pt/ (src/shared/i18n/lang.ts). Each language is a separate static page.
  i18n: {
    locales: ['en', 'pt'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
  // Only the links that ask for it (the language switch) are prefetched, on hover.
  prefetch: { prefetchAll: false },
  vite: {
    plugins: [tailwindcss()],
  },
})
