import enMuya from '../../i18n/locales/en-US/muya.json'
import zhMuya from '../../i18n/locales/zh-CN/muya.json'

const RESOURCES = {
  'en-US': enMuya,
  'zh-CN': zhMuya
}

class MuyaI18n {
  constructor () {
    this.locale = 'en-US'
    this.fallbackLocale = 'en-US'
    this.messages = enMuya
    this.fallbackMessages = enMuya
    this.initialized = true
  }

  init (locale) {
    this.locale = locale || this.fallbackLocale
    this.messages = RESOURCES[this.locale] || this.fallbackMessages
    this.fallbackMessages = RESOURCES[this.fallbackLocale] || enMuya
    this.initialized = true
    return this
  }

  t (key, params = {}) {
    let text = this._getNestedValue(this.messages, key)

    if (text === undefined || text === null) {
      text = this._getNestedValue(this.fallbackMessages, key)
    }

    if (text === undefined || text === null) {
      console.warn(`[Muya i18n] Missing translation for key: ${key}`)
      return key
    }

    return this._interpolate(text, params)
  }

  setLocale (locale) {
    if (locale !== this.locale) {
      this.init(locale)
    }
    return this
  }

  getLocale () {
    return this.locale
  }

  isInitialized () {
    return this.initialized
  }

  _getNestedValue (obj, path) {
    if (!obj || !path) return undefined

    const keys = path.split('.')
    let result = obj

    for (const key of keys) {
      if (result === undefined || result === null) {
        return undefined
      }
      result = result[key]
    }

    return result
  }

  _interpolate (text, params) {
    if (!params || Object.keys(params).length === 0) {
      return text
    }

    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match
    })
  }
}

export default new MuyaI18n()
