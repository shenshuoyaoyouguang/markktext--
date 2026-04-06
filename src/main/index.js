import './globalSetting'
import path from 'path'
import { app, dialog } from 'electron'
import { initialize as remoteInitializeServer } from '@electron/remote/main'
import cli from './cli'
import setupExceptionHandler, { initExceptionLogger } from './exceptionHandler'
import log from 'electron-log'
import App from './app'
import Accessor from './app/accessor'
import setupEnvironment from './app/env'
import { getLogLevel } from './utils'
import { initMainProcessI18n } from '../i18n/mainProcess'

const initializeLogger = appEnvironment => {
  log.transports.console.level = process.env.NODE_ENV === 'development' ? 'info' : 'error'
  log.transports.rendererConsole = null
  log.transports.file.resolvePath = () => path.join(appEnvironment.paths.logPath, 'main.log')
  log.transports.file.level = getLogLevel()
  log.transports.file.sync = true
  initExceptionLogger()
}

// -----------------------------------------------

const start = async () => {
  // NOTE: We only support Linux, macOS and Windows but not BSD nor SunOS.
  if (!/^(darwin|win32|linux)$/i.test(process.platform)) {
    process.stdout.write('This operating system is not supported.\n')
    process.exit(1)
  }

  setupExceptionHandler()

  const args = cli()
  const appEnvironment = setupEnvironment(args)
  initializeLogger(appEnvironment)

  if (args['--disable-gpu']) {
    app.disableHardwareAcceleration()
  }

  // Make MarkText a single instance application.
  if (!process.mas && process.env.NODE_ENV !== 'development') {
    const gotSingleInstanceLock = app.requestSingleInstanceLock()
    if (!gotSingleInstanceLock) {
      process.stdout.write('Other MarkText instance detected: exiting...\n')
      app.exit()
    }
  }

  // MarkText environment is configured successfully. You can now access paths, use the logger etc.
  // Create other instances that need access to the modules from above.
  let accessor = null
  try {
    accessor = new Accessor(appEnvironment)

    // Initialize i18n with user preferred language
    const language = accessor.preferences.getItem('language') || 'en'
    const localeMap = {
      en: 'en-US',
      'zh-CN': 'zh-CN'
    }
    await initMainProcessI18n(localeMap[language] || 'en-US')
  } catch (err) {
    // Catch errors that may come from invalid configuration files like settings.
    const msgHint = err.message.includes('Config schema violation')
      ? 'This seems to be an issue with your configuration file(s). '
      : ''
    log.error(`Loading MarkText failed during initialization! ${msgHint}`, err)

    const EXIT_ON_ERROR = !!process.env.MARKTEXT_EXIT_ON_ERROR
    const SHOW_ERROR_DIALOG = !process.env.MARKTEXT_ERROR_INTERACTION
    if (!EXIT_ON_ERROR && SHOW_ERROR_DIALOG) {
      // Use raw message if i18n is not initialized
      dialog.showErrorBox(
        'Loading MarkText failed',
        `${msgHint}${err.message}\n\n${err.stack}`
      )
    }
    process.exit(1)
  }

  // Use synchronous only to report errors in early stage of startup.
  log.transports.file.sync = false

  // -----------------------------------------------
  // Be careful when changing code before this line!
  // NOTE: Do not create classes or other code before this line!

  // Enable remote module
  remoteInitializeServer()

  const marktext = new App(accessor, args)
  marktext.init()
}

start()
