import { h } from '../snabbdom'
import copyIcon from '../../../assets/pngicon/copy/2.png'

const renderCopyButton = (i18nTitle) => {
  const selector = 'a.ag-code-copy'
  const iconVnode = h('i.icon', h('i.icon-inner', {
    style: {
      background: `url(${copyIcon}) no-repeat`,
      'background-size': '100%'
    }
  }, ''))

  return h(selector, {
    attrs: {
      title: i18nTitle || 'Copy content',
      contenteditable: 'false'
    }
  }, iconVnode)
}

export default renderCopyButton
