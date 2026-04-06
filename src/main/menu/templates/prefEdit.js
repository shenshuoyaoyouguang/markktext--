import { t } from '../../../i18n/mainProcess'

export default function (keybindings) {
  return {
    label: t('menu.edit.title'),
    submenu: [{
      label: t('menu.edit.cut'),
      accelerator: keybindings.getAccelerator('edit.cut'),
      role: 'cut'
    }, {
      label: t('menu.edit.copy'),
      accelerator: keybindings.getAccelerator('edit.copy'),
      role: 'copy'
    }, {
      label: t('menu.edit.paste'),
      accelerator: keybindings.getAccelerator('edit.paste'),
      role: 'paste'
    }, {
      type: 'separator'
    }, {
      label: t('menu.edit.selectAll'),
      accelerator: keybindings.getAccelerator('edit.select-all'),
      role: 'selectAll'
    }]
  }
}
