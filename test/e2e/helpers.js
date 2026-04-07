const os = require('os')
const path = require('path')
const { _electron } = require('playwright')

const mainEntrypoint = 'dist/electron/main.js'

const getDateAsFilename = () => {
  const date = new Date()
  return '' + date.getFullYear() + (date.getMonth() + 1) + date.getDay()
}

const getTempPath = () => {
  const name = 'marktext-e2etest-' + getDateAsFilename()
  return path.join(os.tmpdir(), name)
}

const getElectronPath = () => {
  if (process.platform === 'win32') {
    return path.resolve(path.join('node_modules', 'electron', 'dist', 'electron.exe'))
  }
  return path.resolve(path.join('node_modules', '.bin', 'electron'))
}

const launchElectron = async userArgs => {
  userArgs = userArgs || []
  const executablePath = getElectronPath()
  const baseArgs = process.platform === 'linux'
    ? ['--no-sandbox']
    : process.platform === 'win32'
      ? ['--disable-gpu', '--no-sandbox']
      : []
  const args = baseArgs.concat([mainEntrypoint, '--user-data-dir', getTempPath()], userArgs)
  const app = await _electron.launch({
    executablePath,
    args,
    timeout: 90000
  })
  const page = await app.firstWindow()
  await page.waitForLoadState('domcontentloaded')
  await new Promise((resolve) => setTimeout(resolve, 500))
  return { app, page }
}

module.exports = { getElectronPath, launchElectron}
