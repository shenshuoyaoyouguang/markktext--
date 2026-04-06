/**
 * 图片设置选项配置
 * 使用 i18n 函数动态生成标签文本
 */

export function getImageActions (t) {
  return [{
    label: t('settings.configOptions.imageActions.upload'),
    value: 'upload'
  }, {
    label: t('settings.configOptions.imageActions.folder'),
    value: 'folder'
  }, {
    label: t('settings.configOptions.imageActions.path'),
    value: 'path'
  }]
}
