import Vue from 'vue'
import bus from '../bus'
import notice from '@/services/notification'
import { t } from '@/i18n'
import { delay } from '@/util'
import { SpellChecker } from '@/spellchecker'
import { getLanguageName } from '@/spellchecker/languageMap'

const localeState = Vue.observable({ tick: 0 })

// Command to switch the spellchecker language
class SpellcheckerLanguageCommand {
  constructor (spellchecker) {
    this.id = 'spellchecker.switch-language'
    this.shortcut = null

    this.spellchecker = spellchecker

    this.subcommands = []
    this.subcommandSelectedIndex = -1
  }

  get description () {
    return t('commands.spellchecker.switchLanguage')
  }

  get placeholder () {
    return t('commands.spellchecker.switchLanguagePlaceholder')
  }

  touchLocale () {
    localeState.tick++
  }

  run = async () => {
    const langs = await SpellChecker.getAvailableDictionaries()
    this.subcommands = langs.map(lang => {
      return {
        id: `spellchecker.switch-language-id-${lang}`,
        description: getLanguageName(lang),
        value: lang
      }
    })
    const currentLanguage = this.spellchecker.lang
    this.subcommandSelectedIndex = this.subcommands.findIndex(cmd => cmd.value === currentLanguage)
  }

  execute = async () => {
    // Timeout to hide the command palette and then show again to prevent issues.
    await delay(100)
    bus.$emit('show-command-palette', this)
  }

  executeSubcommand = async id => {
    const command = this.subcommands.find(cmd => cmd.id === id)
    if (this.spellchecker.isEnabled) {
      bus.$emit('switch-spellchecker-language', command.value)
    } else {
      notice.notify({
        title: t('messages.notifications.spelling'),
        type: 'warning',
        message: t('messages.notifications.spellcheckerDisabled')
      })
    }
  }

  unload = () => {
    this.subcommands = []
  }
}

export default SpellcheckerLanguageCommand
