import { ipcRenderer } from 'electron'
import { delay } from '@/util'
import { t } from '@/i18n'
import bus from '../bus'

class TrailingNewlineCommand {
  constructor (editorState) {
    this.id = 'file.trailing-newline'

    this.subcommands = []
    this.subcommandSelectedIndex = -1

    // Reference to editor state.
    this._editorState = editorState
  }

  get description () {
    return t('commands.misc.trailingNewline')
  }

  get placeholder () {
    return t('commands.misc.selectOption')
  }

  run = async () => {
    const descriptions = [
      t('commands.misc.trimAllTrailingNewlines'),
      t('commands.misc.ensureSingleNewline'),
      t('commands.misc.disabled')
    ]
    const currentSuffix = t('commands.misc.currentSuffix')
    const { trimTrailingNewline } = this._editorState.currentFile
    let index = trimTrailingNewline
    if (index !== 0 && index !== 1) {
      index = 2
    }

    this.subcommands = [{
      id: 'file.trailing-newline-trim',
      description: descriptions[0],
      value: 0
    }, {
      id: 'file.trailing-newline-single',
      description: descriptions[1],
      value: 1
    }, {
      id: 'file.trailing-newline-disabled',
      description: descriptions[2],
      value: 3
    }]
    this.subcommands[index].description = `${descriptions[index]}${currentSuffix}`
    this.subcommandSelectedIndex = index
  }

  execute = async () => {
    // Timeout to hide the command palette and then show again to prevent issues.
    await delay(100)
    bus.$emit('show-command-palette', this)
  }

  executeSubcommand = async (_, value) => {
    ipcRenderer.emit('mt::set-final-newline', null, value)
  }

  unload = () => {}
}

export default TrailingNewlineCommand
