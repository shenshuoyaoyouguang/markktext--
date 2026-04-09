import * as contextMenu from './actions'

export const SEPARATOR = {
  type: 'separator'
}

export const buildSidebarMenuItems = (t) => [
  {
    label: t('messages.contextMenuSidebar.newFile'),
    id: 'newFileMenuItem',
    click (menuItem, browserWindow) {
      contextMenu.newFile()
    }
  },
  {
    label: t('messages.contextMenuSidebar.newDirectory'),
    id: 'newDirectoryMenuItem',
    click (menuItem, browserWindow) {
      contextMenu.newDirectory()
    }
  },
  SEPARATOR,
  {
    label: t('messages.contextMenuSidebar.copy'),
    id: 'copyMenuItem',
    click (menuItem, browserWindow) {
      contextMenu.copy()
    }
  },
  {
    label: t('messages.contextMenuSidebar.cut'),
    id: 'cutMenuItem',
    click (menuItem, browserWindow) {
      contextMenu.cut()
    }
  },
  {
    label: t('messages.contextMenuSidebar.paste'),
    id: 'pasteMenuItem',
    click (menuItem, browserWindow) {
      contextMenu.paste()
    }
  },
  SEPARATOR,
  {
    label: t('messages.contextMenuSidebar.rename'),
    id: 'renameMenuItem',
    click (menuItem, browserWindow) {
      contextMenu.rename()
    }
  },
  {
    label: t('messages.contextMenuSidebar.moveToTrash'),
    id: 'deleteMenuItem',
    click (menuItem, browserWindow) {
      contextMenu.remove()
    }
  },
  SEPARATOR,
  {
    label: t('messages.contextMenuSidebar.showInFolder'),
    id: 'showInFolderMenuItem',
    click (menuItem, browserWindow) {
      contextMenu.showInFolder()
    }
  }
]
