export const buildPageSizeOptions = (t) => [
  {
    label: t('messages.exportOptions.pageSize.A3'),
    value: 'A3'
  }, {
    label: t('messages.exportOptions.pageSize.A4'),
    value: 'A4'
  }, {
    label: t('messages.exportOptions.pageSize.A5'),
    value: 'A5'
  }, {
    label: t('messages.exportOptions.pageSize.Legal'),
    value: 'Legal'
  }, {
    label: t('messages.exportOptions.pageSize.Letter'),
    value: 'Letter'
  }, {
    label: t('messages.exportOptions.pageSize.Tabloid'),
    value: 'Tabloid'
  }, {
    label: t('messages.exportOptions.pageSize.Custom'),
    value: 'custom'
  }
]

export const buildHeaderFooterTypeOptions = (t) => [
  {
    label: t('messages.exportOptions.headerFooterType.none'),
    value: 0
  }, {
    label: t('messages.exportOptions.headerFooterType.singleCell'),
    value: 1
  }, {
    label: t('messages.exportOptions.headerFooterType.threeCells'),
    value: 2
  }
]

export const buildHeaderFooterStyleOptions = (t) => [
  {
    label: t('messages.exportOptions.headerFooterStyle.default'),
    value: 0
  }, {
    label: t('messages.exportOptions.headerFooterStyle.simple'),
    value: 1
  }, {
    label: t('messages.exportOptions.headerFooterStyle.styled'),
    value: 2
  }
]

export const buildExportThemeOptions = (t) => [{
  label: t('messages.exportOptions.exportTheme.Academic'),
  value: 'academic'
}, {
  label: t('messages.exportOptions.exportTheme.GitHub'),
  value: 'default'
}, {
  label: t('messages.exportOptions.exportTheme.Liber'),
  value: 'liber'
}]
