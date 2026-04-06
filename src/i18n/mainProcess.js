import { DEFAULT_LOCALE, normalizeLocale, translate } from './index'

let currentLanguage = DEFAULT_LOCALE
const listeners = new Set()

const emitLanguageChanged = locale => {
  for (const listener of listeners) {
    listener(locale)
  }
}

export const initMainProcessI18n = async (language = DEFAULT_LOCALE) => {
  currentLanguage = normalizeLocale(language)
  return mainProcessI18n
}

export const t = (key, options = {}) => translate(currentLanguage, key, options)

export const setLanguage = async language => {
  const nextLanguage = normalizeLocale(language)
  if (nextLanguage !== currentLanguage) {
    currentLanguage = nextLanguage
    emitLanguageChanged(currentLanguage)
  }
  return currentLanguage
}

export const onLanguageChanged = handler => {
  listeners.add(handler)
  return () => listeners.delete(handler)
}

const mainProcessI18n = {
  get language () {
    return currentLanguage
  },
  t,
  setLanguage,
  onLanguageChanged
}

export default mainProcessI18n
