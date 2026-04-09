import { getCurrentWindow, Menu as RemoteMenu, MenuItem as RemoteMenuItem } from '@electron/remote'
import { t } from '@/i18n/renderer'
import { buildSidebarMenuItems, SEPARATOR } from './menuItems'

export const showContextMenu = (event, hasPathCache) => {
  const menu = new RemoteMenu()
  const win = getCurrentWindow()
  const menuItems = buildSidebarMenuItems(t)
  const CONTEXT_ITEMS = menuItems

  CONTEXT_ITEMS.forEach(item => {
    if (item.id === 'pasteMenuItem') {
      item.enabled = hasPathCache
    }
    menu.append(new RemoteMenuItem(item))
  })
  menu.popup([{ window: win, x: event.clientX, y: event.clientY }])
}
