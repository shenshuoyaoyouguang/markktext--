import { ipcRenderer } from 'electron'
import notice from '../services/notification'
import { t } from '../i18n'

const state = {}

const getters = {}

const mutations = {}

// mt::UPDATE_DOWNLOADED
const actions = {
  LISTEN_FOR_UPDATE ({ commit }) {
    ipcRenderer.on('mt::UPDATE_ERROR', (e, message) => {
      notice.notify({
        title: t('messages.notifications.update'),
        type: 'error',
        time: 10000,
        message
      })
    })
    ipcRenderer.on('mt::UPDATE_NOT_AVAILABLE', (e, message) => {
      notice.notify({
        title: t('messages.notifications.updateNotAvailable'),
        type: 'primary',
        message
      })
    })
    ipcRenderer.on('mt::UPDATE_DOWNLOADED', (e, message) => {
      notice.notify({
        title: t('messages.notifications.updateDownloaded'),
        type: 'info',
        message
      })
    })
    ipcRenderer.on('mt::UPDATE_AVAILABLE', (e, message) => {
      notice.notify({
        title: t('messages.notifications.updateAvailable'),
        type: 'primary',
        message,
        showConfirm: true
      })
        .then(() => {
          const needUpdate = true
          ipcRenderer.send('mt::NEED_UPDATE', { needUpdate })
        })
        .catch(() => {
          const needUpdate = false
          ipcRenderer.send('mt::NEED_UPDATE', { needUpdate })
        })
    })
  }
}

export default { state, getters, mutations, actions }
