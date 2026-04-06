/**
 * 主题设置选项配置
 * 使用 i18n 函数动态生成标签文本
 */

export const themes = [
  {
    name: 'light'
  },
  {
    name: 'dark'
  },
  {
    name: 'graphite'
  },
  {
    name: 'material-dark'
  },
  {
    name: 'ulysses'
  },
  {
    name: 'one-dark'
  }
]

export function getAutoSwitchThemeOptions (t) {
  return [{
    label: t('settings.configOptions.autoSwitchTheme.adjustAtStartup'),
    value: 0
  }, /* {
    label: t('settings.configOptions.autoSwitchTheme.onlyAtRuntime'),
    value: 1
  }, */ {
    label: t('settings.configOptions.autoSwitchTheme.never'),
    value: 2
  }]
}
