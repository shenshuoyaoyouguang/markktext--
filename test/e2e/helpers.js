const fs = require('fs')
const os = require('os')
const path = require('path')
const { _electron } = require('playwright')

const mainEntrypoint = 'dist/electron/main.js'
const mainEntrypointPath = path.resolve(mainEntrypoint)
const launchTimeout = process.platform === 'win32' ? 180000 : 90000
const launchTimeoutBuffer = process.platform === 'win32' ? 5000 : 1000
const diagnosticsRoot = path.resolve(process.cwd(), 'test-artifacts', 'e2e-launch')
let launchCounter = 0

const getDateAsFilename = () => {
  const date = new Date()
  return '' + date.getFullYear() + (date.getMonth() + 1) + date.getDay()
}

const getTempPath = () => {
  const name = 'marktext-e2etest-' + getDateAsFilename()
  return path.join(os.tmpdir(), name)
}

const getDiagnosticsTimestamp = () => new Date().toISOString().replace(/[:.]/g, '-')

const sanitizeLabel = value => (value || 'launch')
  .toLowerCase()
  .replace(/[^a-z0-9-_]+/g, '-')
  .replace(/^-+|-+$/g, '')

const ensureDirSync = targetPath => {
  fs.mkdirSync(targetPath, { recursive: true })
}

const withTimeout = (promise, timeoutMs, message) => new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error(message)), timeoutMs)
  promise
    .then(value => {
      clearTimeout(timer)
      resolve(value)
    })
    .catch(error => {
      clearTimeout(timer)
      reject(error)
    })
})

const getRemainingTimeout = startedAt => {
  return Math.max(1000, launchTimeout - launchTimeoutBuffer - (Date.now() - startedAt))
}

const getMarkTextLogDir = userDataPath => {
  const now = new Date()
  return path.join(userDataPath, 'logs', `${now.getFullYear()}${now.getMonth() + 1}`)
}

const formatFileTree = (targetPath, level = 0) => {
  if (!fs.existsSync(targetPath)) {
    return `${'  '.repeat(level)}<missing> ${targetPath}`
  }

  const stats = fs.statSync(targetPath)
  const prefix = `${'  '.repeat(level)}- ${path.basename(targetPath) || targetPath}`
  if (!stats.isDirectory()) {
    return `${prefix} (${stats.size} bytes)`
  }

  const entries = fs.readdirSync(targetPath)
    .sort((left, right) => left.localeCompare(right))

  const lines = [`${prefix}/`]
  for (const entry of entries) {
    lines.push(formatFileTree(path.join(targetPath, entry), level + 1))
  }

  return lines.join('\n')
}

const createLaunchDiagnostics = ({ label, executablePath, userDataPath, args }) => {
  const enabled = process.env.CI === 'true' || process.env.MARKTEXT_E2E_DIAGNOSTICS === '1'
  const launchId = `${getDiagnosticsTimestamp()}-${process.pid}-${++launchCounter}-${sanitizeLabel(label)}`
  const sessionDir = path.join(diagnosticsRoot, launchId)
  const logFile = path.join(sessionDir, 'launch.log')
  const metadataFile = path.join(sessionDir, 'metadata.json')
  const treeFile = path.join(sessionDir, 'user-data-tree.txt')
  const mainLogSource = path.join(getMarkTextLogDir(userDataPath), 'main.log')
  const mainLogTarget = path.join(sessionDir, 'main.log')
  const preferencesSource = path.join(userDataPath, 'preference.json')
  const preferencesTarget = path.join(sessionDir, 'preference.json')
  const chromeLogPath = enabled
    ? path.join(sessionDir, 'chrome-debug.log')
    : process.env.CHROME_LOG_FILE
  const metadataState = {}

  if (enabled) {
    ensureDirSync(sessionDir)
  }

  const writeLog = message => {
    const line = `[e2e-launch][${launchId}] ${new Date().toISOString()} ${message}`
    console.log(line)
    if (enabled) {
      fs.appendFileSync(logFile, `${line}\n`)
    }
  }

  const writeMetadata = extra => {
    if (!enabled) {
      return
    }

    Object.assign(metadataState, extra)

    const metadata = {
      launchId,
      label,
      platform: process.platform,
      nodeVersion: process.version,
      ci: process.env.CI,
      timeoutMs: launchTimeout,
      timeoutBufferMs: launchTimeoutBuffer,
      executablePath,
      executableExists: fs.existsSync(executablePath),
      mainEntrypoint,
      mainEntrypointPath,
      mainEntrypointExists: fs.existsSync(mainEntrypointPath),
      userDataPath,
      env: {
        LOCALAPPDATA: process.env.LOCALAPPDATA,
        TEMP: process.env.TEMP,
        TMP: process.env.TMP,
        CHROME_LOG_FILE: chromeLogPath
      },
      args,
      ...metadataState
    }

    fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2))
  }

  const collectArtifacts = async ({ error, page, stage, elapsedMs }) => {
    const serializedError = error
      ? { message: error.message, stack: error.stack }
      : null

    writeMetadata({
      elapsedMs,
      failedStage: stage,
      error: serializedError
    })

    if (!enabled) {
      return
    }

    fs.writeFileSync(treeFile, formatFileTree(userDataPath))

    if (fs.existsSync(mainLogSource)) {
      fs.copyFileSync(mainLogSource, mainLogTarget)
    }

    if (fs.existsSync(preferencesSource)) {
      fs.copyFileSync(preferencesSource, preferencesTarget)
    }

    if (page) {
      try {
        await page.screenshot({
          path: path.join(sessionDir, 'window.png'),
          fullPage: true
        })
      } catch (screenshotError) {
        writeLog(`artifact:screenshot failed: ${screenshotError.message}`)
      }
    }
  }

  return {
    enabled,
    launchId,
    sessionDir,
    chromeLogPath,
    writeLog,
    writeMetadata,
    collectArtifacts
  }
}

const getElectronPath = () => {
  if (process.platform === 'win32') {
    return path.resolve(path.join('node_modules', 'electron', 'dist', 'electron.exe'))
  }
  return path.resolve(path.join('node_modules', '.bin', 'electron'))
}

const launchElectron = async (userArgs = [], options = {}) => {
  const label = options.label || 'launch'
  const executablePath = getElectronPath()
  const userDataPath = getTempPath()
  const baseArgs = process.platform === 'linux'
    ? ['--no-sandbox']
    : process.platform === 'win32'
      ? ['--disable-gpu', '--no-sandbox']
      : []
  const args = baseArgs.concat([mainEntrypoint, '--user-data-dir', userDataPath], userArgs)
  const diagnostics = createLaunchDiagnostics({ label, executablePath, userDataPath, args })
  const launchEnv = {
    ...process.env,
    ELECTRON_ENABLE_LOGGING: process.env.ELECTRON_ENABLE_LOGGING || '1',
    ELECTRON_ENABLE_STACK_DUMPING: process.env.ELECTRON_ENABLE_STACK_DUMPING || '1'
  }

  if (diagnostics.chromeLogPath) {
    launchEnv.CHROME_LOG_FILE = diagnostics.chromeLogPath
  }

  const startedAt = Date.now()
  let stage = 'prepare'
  let app = null
  let page = null

  diagnostics.writeMetadata({ status: 'starting' })
  diagnostics.writeLog(`requested with userDataPath=${userDataPath}`)

  try {
    if (!fs.existsSync(executablePath)) {
      throw new Error(`Electron executable not found: ${executablePath}`)
    }

    if (!fs.existsSync(mainEntrypointPath)) {
      throw new Error(`E2E main entrypoint not found: ${mainEntrypointPath}. Run "yarn run pack" before Playwright E2E tests.`)
    }

    stage = 'playwright._electron.launch'
    diagnostics.writeLog(`step:start ${stage} remaining=${getRemainingTimeout(startedAt)}ms`)
    app = await _electron.launch({
      env: launchEnv,
      executablePath,
      args,
      timeout: getRemainingTimeout(startedAt)
    })
    diagnostics.writeLog(`step:done ${stage} elapsed=${Date.now() - startedAt}ms`)

    const electronProcess = app.process()
    diagnostics.writeLog(`process:pid=${electronProcess.pid}`)
    electronProcess.once('exit', (code, signal) => {
      diagnostics.writeLog(`process:exit code=${code} signal=${signal}`)
    })
    electronProcess.once('error', error => {
      diagnostics.writeLog(`process:error ${error.message}`)
    })

    const mainProcessInfo = await withTimeout(
      app.evaluate(({ app }) => {
        return {
          pid: process.pid,
          argv: process.argv,
          appPath: app.getAppPath(),
          userDataPath: app.getPath('userData'),
          versions: process.versions
        }
      }),
      getRemainingTimeout(startedAt),
      'Timed out while reading Electron main process info'
    )
    diagnostics.writeMetadata({ status: 'launched', mainProcessInfo })
    diagnostics.writeLog(`process:main pid=${mainProcessInfo.pid} userData=${mainProcessInfo.userDataPath}`)

    app.on('window', newPage => {
      diagnostics.writeLog(`event:window created url=${newPage.url() || '<empty>'}`)
      newPage.on('domcontentloaded', () => {
        diagnostics.writeLog(`event:window domcontentloaded url=${newPage.url() || '<empty>'}`)
      })
      newPage.on('pageerror', error => {
        diagnostics.writeLog(`event:pageerror ${error.message}`)
      })
      newPage.on('console', message => {
        if (['error', 'warning'].includes(message.type())) {
          diagnostics.writeLog(`event:console:${message.type()} ${message.text()}`)
        }
      })
    })

    stage = 'electronApp.firstWindow'
    diagnostics.writeLog(`step:start ${stage} remaining=${getRemainingTimeout(startedAt)}ms`)
    page = await withTimeout(
      app.firstWindow(),
      getRemainingTimeout(startedAt),
      'Timed out waiting for electronApp.firstWindow()'
    )
    diagnostics.writeLog(`step:done ${stage} elapsed=${Date.now() - startedAt}ms`)

    stage = 'page.waitForLoadState(domcontentloaded)'
    diagnostics.writeLog(`step:start ${stage} remaining=${getRemainingTimeout(startedAt)}ms`)
    await page.waitForLoadState('domcontentloaded', { timeout: getRemainingTimeout(startedAt) })
    diagnostics.writeLog(`step:done ${stage} elapsed=${Date.now() - startedAt}ms`)

    stage = 'post-load-settle'
    await new Promise((resolve) => setTimeout(resolve, 500))
    diagnostics.writeLog(`step:done ${stage} elapsed=${Date.now() - startedAt}ms`)
    diagnostics.writeMetadata({
      status: 'success',
      elapsedMs: Date.now() - startedAt
    })

    return { app, page, diagnostics }
  } catch (error) {
    diagnostics.writeLog(`step:failed ${stage} elapsed=${Date.now() - startedAt}ms error=${error.message}`)
    await diagnostics.collectArtifacts({
      error,
      page,
      stage,
      elapsedMs: Date.now() - startedAt
    })

    if (app) {
      try {
        await app.close()
      } catch (closeError) {
        diagnostics.writeLog(`cleanup:app.close failed: ${closeError.message}`)
      }
    }

    throw error
  }
}

module.exports = { getElectronPath, launchElectron }
