/**
 * Markdown 设置选项配置
 * 使用 i18n 函数动态生成标签文本
 */

export function getBulletListMarkerOptions () {
  return [{
    label: '*',
    value: '*'
  }, {
    label: '-',
    value: '-'
  }, {
    label: '+',
    value: '+'
  }]
}

export function getOrderListDelimiterOptions () {
  return [{
    label: '.',
    value: '.'
  }, {
    label: ')',
    value: ')'
  }]
}

export function getPreferHeadingStyleOptions (t) {
  return [{
    label: t('settings.configOptions.headingStyle.atx'),
    value: 'atx'
  }, {
    label: t('settings.configOptions.headingStyle.setext'),
    value: 'setext'
  }]
}

export function getListIndentationOptions (t) {
  return [{
    label: t('settings.configOptions.listIndentation.docfx'),
    value: 'dfm'
  }, {
    label: t('settings.configOptions.listIndentation.trueTab'),
    value: 'tab'
  }, {
    label: t('settings.configOptions.listIndentation.singleSpace'),
    value: 1
  }, {
    label: t('settings.configOptions.listIndentation.twoSpaces'),
    value: 2
  }, {
    label: t('settings.configOptions.listIndentation.threeSpaces'),
    value: 3
  }, {
    label: t('settings.configOptions.listIndentation.fourSpaces'),
    value: 4
  }]
}

export function getFrontmatterTypeOptions (t) {
  return [{
    label: t('settings.configOptions.frontmatter.yaml'),
    value: '-'
  }, {
    label: t('settings.configOptions.frontmatter.toml'),
    value: '+'
  }, {
    label: t('settings.configOptions.frontmatter.jsonSemicolon'),
    value: ';'
  }, {
    label: t('settings.configOptions.frontmatter.jsonBrace'),
    value: '{'
  }]
}

export function getSequenceThemeOptions (t) {
  return [{
    label: t('settings.configOptions.sequenceTheme.hand'),
    value: 'hand'
  }, {
    label: t('settings.configOptions.sequenceTheme.simple'),
    value: 'simple'
  }]
}
