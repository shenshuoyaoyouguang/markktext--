/**
 * Element UI 语言同步工具
 * 用于将 i18next 的语言设置同步到 Element UI
 */
import zhCN from 'element-ui/lib/locale/lang/zh-CN'
import enUS from 'element-ui/lib/locale/lang/en'
import locale from 'element-ui/lib/locale'

// Element UI 语言映射
const elementLocales = {
  'zh-CN': zhCN,
  'en-US': enUS
}

/**
 * 同步 Element UI 语言
 * @param {string} lng - 语言代码
 */
export function syncElementLocale (lng) {
  const elementLocale = elementLocales[lng]
  if (elementLocale) {
    locale.use(elementLocale)
  }
}

/**
 * 获取 Element UI 语言对象
 * @param {string} lng - 语言代码
 * @returns {Object} Element UI 语言对象
 */
export function getElementLocale (lng) {
  return elementLocales[lng] || enUS
}

export default {
  syncElementLocale,
  getElementLocale
}
