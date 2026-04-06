import { ipcRenderer } from 'electron'
import { delay } from '@/util'
import { t } from '@/i18n'
import bus from '../bus'

class LineEndingCommand {
  constructor (editorState) {
    this.id = 'file.line-ending'

    this.subcommands = [{
      id: 'file.line-ending-crlf',
      value: 'crlf'
    }, {
      id: 'file.line-ending-lf',
      value: 'lf'
    }]
    this.subcommandSelectedIndex = -1

    // Reference to editor state.
    this._editorState = editorState
  }

  get description () {
    return t('commands.misc.changeLineEnding')
  }

  get placeholder () {
    return t('commands.misc.selectOption')
  }

  run = async () => {
    const crlfDescription = t('commands.misc.crlf')
    const lfDescription = t('commands.misc.lf')
    const currentSuffix = t('commands.misc.currentSuffix')
    const { lineEnding } = this._editorState.currentFile
    if (lineEnding === 'crlf') {
      this.subcommandSelectedIndex = 0
      this.subcommands[0].description = `${crlfDescription}${currentSuffix}`
      this.subcommands[1].description = lfDescription
    } else {
      this.subcommandSelectedIndex = 1
      this.subcommands[0].description = crlfDescription
      this.subcommands[1].description = `${lfDescription}${currentSuffix}`
    }
  }

  execute = async () => {
    // Timeout to hide the command palette and then show again to prevent issues.
    await delay(100)
    bus.$emit('show-command-palette', this)
  }

  executeSubcommand = async (_, value) => {
    ipcRenderer.emit('mt::set-line-ending', null, value)
  }

  unload = () => {}
}

export default LineEndingCommand
