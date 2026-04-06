// Import resources for all namespaces
import enMenu from './locales/en-US/menu.json'
import enSettings from './locales/en-US/settings.json'
import enDialogs from './locales/en-US/dialogs.json'
import enCommands from './locales/en-US/commands.json'
import enMessages from './locales/en-US/messages.json'
import enMuya from './locales/en-US/muya.json'

import zhMenu from './locales/zh-CN/menu.json'
import zhSettings from './locales/zh-CN/settings.json'
import zhDialogs from './locales/zh-CN/dialogs.json'
import zhCommands from './locales/zh-CN/commands.json'
import zhMessages from './locales/zh-CN/messages.json'
import zhMuya from './locales/zh-CN/muya.json'

export const DEFAULT_LOCALE = 'en-US'
export const LOCALE_MAP = {
  en: 'en-US',
  'en-US': 'en-US',
  'zh-CN': 'zh-CN'
}
export const NAMESPACES = new Set(['menu', 'settings', 'dialogs', 'commands', 'messages', 'muya'])

export const resources = {
  'en-US': {
    menu: enMenu,
    settings: enSettings,
    dialogs: enDialogs,
    commands: enCommands,
    messages: enMessages,
    muya: enMuya
  },
  'zh-CN': {
    menu: zhMenu,
    settings: zhSettings,
    dialogs: zhDialogs,
    commands: zhCommands,
    messages: zhMessages,
    muya: zhMuya
  }
}

export const normalizeLocale = language => LOCALE_MAP[language] || DEFAULT_LOCALE

const normalizeKey = key => {
  if (!key) {
    return { namespace: null, segments: [] }
  }

  if (key.includes(':')) {
    const [namespace, path = ''] = key.split(':')
    return {
      namespace,
      segments: path ? path.split('.') : []
    }
  }

  const [namespace, ...segments] = key.split('.')
  if (NAMESPACES.has(namespace) && segments.length > 0) {
    return { namespace, segments }
  }

  return {
    namespace: null,
    segments: key.split('.')
  }
}

const getNestedValue = (source, segments) => {
  let value = source

  for (const segment of segments) {
    if (!value || typeof value !== 'object' || !(segment in value)) {
      return undefined
    }
    value = value[segment]
  }

  return value
}

export const interpolate = (value, params = {}) => {
  if (typeof value !== 'string') {
    return value
  }

  return Object.keys(params).reduce((result, key) => {
    const stringValue = String(params[key])
    return result
      .replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), stringValue)
      .replace(new RegExp(`\\{\\s*${key}\\s*\\}`, 'g'), stringValue)
  }, value)
}

export const translate = (language, key, params = {}) => {
  const { namespace, segments } = normalizeKey(key)
  const locales = [normalizeLocale(language), DEFAULT_LOCALE]

  for (const locale of locales) {
    const catalogs = resources[locale]
    if (!catalogs) {
      continue
    }

    const source = namespace ? catalogs[namespace] : catalogs
    const value = getNestedValue(source, segments)
    if (typeof value === 'string') {
      return interpolate(value, params)
    }
  }

  return key
}

export default {
  resources,
  translate,
  normalizeLocale
}
