import { getCurrentWindow, Menu as RemoteMenu, MenuItem as RemoteMenuItem } from '@electron/remote'
import { t } from '@/i18n/renderer'
import { buildTabMenuItems, SEPARATOR } from './menuItems'

export const showContextMenu = (event, tab) => {
  const menu = new RemoteMenu()
  const win = getCurrentWindow()
  const { pathname } = tab
  const menuItems = buildTabMenuItems(t)
  const CONTEXT_ITEMS = menuItems
  const FILE_CONTEXT_ITEMS = menuItems.filter(item =>
    item.id === 'renameFile' || item.id === 'copyPath' || item.id === 'showInFolder'
  )

  FILE_CONTEXT_ITEMS.forEach(item => {
    item.enabled = !!pathname
  })

  CONTEXT_ITEMS.forEach(item => {
    const menuItem = new RemoteMenuItem(item)
    menuItem._tabId = tab.id
    menu.append(menuItem)
  })
  menu.popup([{ window: win, x: event.clientX, y: event.clientY }])
}
