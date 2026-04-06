import { t } from '../../../i18n/mainProcess'

export const createCutMenuItem = () => ({
  label: t('messages.contextMenu.cut'),
  id: 'cutMenuItem',
  role: 'cut'
})

export const createCopyMenuItem = () => ({
  label: t('messages.contextMenu.copy'),
  id: 'copyMenuItem',
  role: 'copy'
})

export const createPasteMenuItem = () => ({
  label: t('messages.contextMenu.paste'),
  id: 'pasteMenuItem',
  role: 'paste'
})

export const createCopyAsMarkdownMenuItem = () => ({
  label: t('messages.contextMenu.copyAsMarkdown'),
  id: 'copyAsMarkdownMenuItem',
  click (menuItem, targetWindow) {
    targetWindow.webContents.send('mt::cm-copy-as-markdown')
  }
})

export const createCopyAsHtmlMenuItem = () => ({
  label: t('messages.contextMenu.copyAsHtml'),
  id: 'copyAsHtmlMenuItem',
  click (menuItem, targetWindow) {
    targetWindow.webContents.send('mt::cm-copy-as-html')
  }
})

export const createPasteAsPlainTextMenuItem = () => ({
  label: t('messages.contextMenu.pasteAsPlainText'),
  id: 'pasteAsPlainTextMenuItem',
  click (menuItem, targetWindow) {
    targetWindow.webContents.send('mt::cm-paste-as-plain-text')
  }
})

export const createInsertBeforeMenuItem = () => ({
  label: t('messages.contextMenu.insertParagraphBefore'),
  id: 'insertParagraphBeforeMenuItem',
  click (menuItem, targetWindow) {
    targetWindow.webContents.send('mt::cm-insert-paragraph', 'before')
  }
})

export const createInsertAfterMenuItem = () => ({
  label: t('messages.contextMenu.insertParagraphAfter'),
  id: 'insertParagraphAfterMenuItem',
  click (menuItem, targetWindow) {
    targetWindow.webContents.send('mt::cm-insert-paragraph', 'after')
  }
})

export const SEPARATOR = {
  type: 'separator'
}
