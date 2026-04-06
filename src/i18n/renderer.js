import Vue from 'vue'
import { DEFAULT_LOCALE, normalizeLocale, translate } from './index'
import { syncElementLocale } from './plugins/elementUI'

const localeState = Vue.observable({ language: DEFAULT_LOCALE })

const getCurrentLanguage = () => localeState.language

const rendererI18n = {
  get language () {
    return getCurrentLanguage()
  },
  t (key, params = {}) {
    return translate(getCurrentLanguage(), key, params)
  }
}

export const initRendererI18n = async (VueConstructor, language = DEFAULT_LOCALE) => {
  const locale = normalizeLocale(language)
  syncElementLocale(locale)
  localeState.language = locale

  VueConstructor.prototype.$t = (key, params = {}) => translate(getCurrentLanguage(), key, params)
  VueConstructor.prototype.$i18n = {
    setLocale: locale => setLanguage(locale),
    getLocale: () => getCurrentLanguage(),
    t: (key, params = {}) => translate(getCurrentLanguage(), key, params)
  }

  return rendererI18n
}

export const getI18n = () => rendererI18n

export const setLanguage = async language => {
  const locale = normalizeLocale(language)
  syncElementLocale(locale)
  localeState.language = locale
  return locale
}

export const t = (key, params = {}) => translate(getCurrentLanguage(), key, params)

export default rendererI18n
