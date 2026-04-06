import { ENCODING_NAME_MAP } from 'common/encoding'

/**
 * 编辑器设置选项配置
 * 使用 i18n 函数动态生成标签文本
 */

export function getTabSizeOptions () {
  return [{
    label: '1',
    value: 1
  }, {
    label: '2',
    value: 2
  }, {
    label: '3',
    value: 3
  }, {
    label: '4',
    value: 4
  }]
}

export function getEndOfLineOptions (t) {
  return [{
    label: t('settings.configOptions.endOfLine.default'),
    value: 'default'
  }, {
    label: t('settings.configOptions.endOfLine.crlf'),
    value: 'crlf'
  }, {
    label: t('settings.configOptions.endOfLine.lf'),
    value: 'lf'
  }]
}

export function getTrimTrailingNewlineOptions (t) {
  return [{
    label: t('settings.configOptions.trimTrailingNewline.trimAll'),
    value: 0
  }, {
    label: t('settings.configOptions.trimTrailingNewline.ensureOne'),
    value: 1
  }, {
    label: t('settings.configOptions.trimTrailingNewline.preserve'),
    value: 2
  }, {
    label: t('settings.configOptions.trimTrailingNewline.doNothing'),
    value: 3
  }]
}

export function getTextDirectionOptions (t) {
  return [{
    label: t('settings.configOptions.textDirection.ltr'),
    value: 'ltr'
  }, {
    label: t('settings.configOptions.textDirection.rtl'),
    value: 'rtl'
  }]
}

let defaultEncodingOptions = null
export const getDefaultEncodingOptions = () => {
  if (defaultEncodingOptions) {
    return defaultEncodingOptions
  }

  defaultEncodingOptions = []
  for (const [value, label] of Object.entries(ENCODING_NAME_MAP)) {
    defaultEncodingOptions.push({ label, value })
  }
  return defaultEncodingOptions
}
