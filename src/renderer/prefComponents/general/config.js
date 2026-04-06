/**
 * 设置选项配置
 * 使用 i18n 函数动态生成标签文本
 * 调用方式: getOptions(t) 其中 t 是翻译函数
 */

export function getTitleBarStyleOptions (t) {
  return [{
    label: t('settings.configOptions.titleBarStyle.custom'),
    value: 'custom'
  }, {
    label: t('settings.configOptions.titleBarStyle.native'),
    value: 'native'
  }]
}

export function getZoomOptions () {
  return [{
    label: '50.0%',
    value: 0.5
  }, {
    label: '62.5%',
    value: 0.625
  }, {
    label: '75.0%',
    value: 0.75
  }, {
    label: '87.5%',
    value: 0.875
  }, {
    label: '100.0%',
    value: 1.0
  }, {
    label: '112.5%',
    value: 1.125
  }, {
    label: '125.0%',
    value: 1.25
  }, {
    label: '137.5%',
    value: 1.375
  }, {
    label: '150.0%',
    value: 1.5
  }, {
    label: '162.5%',
    value: 1.625
  }, {
    label: '175.0%',
    value: 1.75
  }, {
    label: '187.5%',
    value: 1.875
  }, {
    label: '200.0%',
    value: 2.0
  }]
}

export function getFileSortByOptions (t) {
  return [{
    label: t('settings.configOptions.fileSortBy.created'),
    value: 'created'
  }, {
    label: t('settings.configOptions.fileSortBy.modified'),
    value: 'modified'
  }, {
    label: t('settings.configOptions.fileSortBy.title'),
    value: 'title'
  }]
}

export function getLanguageOptions (t) {
  return [{
    label: t('settings.configOptions.language.english'),
    value: 'en'
  }, {
    label: t('settings.configOptions.language.chinese'),
    value: 'zh-CN'
  }]
}
