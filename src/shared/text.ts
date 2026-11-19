import type { Lang } from './i18n/lang'

const en = {
  skip: 'Skip to main content',
  // the name in the top-left corner (HomeLink.astro)
  home: 'Arthur Heberle, home',
  // the EN/PT switch (LangSwitch.astro)
  language: 'Language',
  currentLanguage: 'current language',
}

const pt: typeof en = {
  skip: 'Pular para o conteúdo principal',
  home: 'Arthur Heberle, início',
  language: 'Idioma',
  currentLanguage: 'idioma atual',
}

export const text: Record<Lang, typeof en> = { en, pt }
