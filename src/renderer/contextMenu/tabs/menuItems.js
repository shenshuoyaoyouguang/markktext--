import * as contextMenu from './actions'

export const SEPARATOR = {
  type: 'separator'
}

export const buildTabMenuItems = (t) => [
  {
    label: t('messages.contextMenuTabs.close'),
    id: 'closeThisTab',
    click (menuItem, browserWindow) {
      contextMenu.closeThis(menuItem._tabId)
    }
  },
  {
    label: t('messages.contextMenuTabs.closeOthers'),
    id: 'closeOtherTabs',
    click (menuItem, browserWindow) {
      contextMenu.closeOthers(menuItem._tabId)
    }
  },
  {
    label: t('messages.contextMenuTabs.closeSavedTabs'),
    id: 'closeSavedTabs',
    click (menuItem, browserWindow) {
      contextMenu.closeSaved()
    }
  },
  {
    label: t('messages.contextMenuTabs.closeAllTabs'),
    id: 'closeAllTabs',
    click (menuItem, browserWindow) {
      contextMenu.closeAll()
    }
  },
  SEPARATOR,
  {
    label: t('messages.contextMenuTabs.rename'),
    id: 'renameFile',
    click (menuItem, browserWindow) {
      contextMenu.rename(menuItem._tabId)
    }
  },
  {
    label: t('messages.contextMenuTabs.copyPath'),
    id: 'copyPath',
    click (menuItem, browserWindow) {
      contextMenu.copyPath(menuItem._tabId)
    }
  },
  {
    label: t('messages.contextMenuTabs.showInFolder'),
    id: 'showInFolder',
    click (menuItem, browserWindow) {
      contextMenu.showInFolder(menuItem._tabId)
    }
  }
]
