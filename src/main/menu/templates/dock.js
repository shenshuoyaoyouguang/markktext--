import { app, Menu } from 'electron'
import * as actions from '../actions/file'
import { t } from '../../../i18n/mainProcess'

/**
 * 构建Dock菜单（macOS）
 * @returns {Electron.Menu} Dock菜单实例
 */
export function buildDockMenu () {
  return Menu.buildFromTemplate([{
    label: t('menu.file.openFile'),
    click (menuItem, browserWindow) {
      if (browserWindow) {
        actions.openFile(browserWindow)
      } else {
        actions.newEditorWindow()
      }
    }
  }, {
    label: t('menu.file.clearRecentlyUsed'),
    click () {
      app.clearRecentDocuments()
    }
  }])
}

// 默认导出菜单实例（用于初始化）
export default buildDockMenu()
