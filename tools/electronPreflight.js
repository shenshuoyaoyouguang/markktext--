'use strict'

const fs = require('fs')
const os = require('os')
const path = require('path')
const arg = require('arg')
const { execFile, spawn } = require('child_process')
const { promisify } = require('util')

const execFileAsync = promisify(execFile)
const args = arg({
  '--label': String,
  '--timeout': Number,
  '--artifact-dir': String,
  '--runner': String,
  '--image-os': String,
  '--image-version': String,
  '--main': String,
  '--user-data-dir': String
}, {
  argv: process.argv.slice(2),
  permissive: true
})

const mainEntrypointPath = path.resolve(args['--main'] || path.join('dist', 'electron', 'main.js'))
const electronPath = process.platform === 'win32'
  ? path.resolve(path.join('node_modules', 'electron', 'dist', 'electron.exe'))
  : path.resolve(path.join('node_modules', 'electron', 'dist', 'electron'))
const timeoutMs = args['--timeout'] || 30000
const label = args['--label'] || 'electron-preflight'
const runnerLabel = args['--runner'] || process.platform
const artifactRoot = path.resolve(args['--artifact-dir'] || path.join('test-artifacts', 'electron-preflight'))
const userDataPath = path.resolve(args['--user-data-dir'] || path.join(os.tmpdir(), `marktext-preflight-${Date.now()}`))
const yearMonth = (() => {
  const now = new Date()
  return `${now.getFullYear()}${now.getMonth() + 1}`
})()
const mainLogPath = path.join(userDataPath, 'logs', yearMonth, 'main.log')
const preferencePath = path.join(userDataPath, 'preference.json')
const extraArgs = args._
const baseArgs = process.platform === 'linux'
  ? ['--no-sandbox']
  : process.platform === 'win32'
    ? ['--disable-gpu', '--no-sandbox']
    : []

const sanitizeLabel = value => (value || 'preflight')
  .toLowerCase()
  .replace(/[^a-z0-9-_]+/g, '-')
  .replace(/^-+|-+$/g, '')

const getTimestamp = () => new Date().toISOString().replace(/[:.]/g, '-')
const sessionDir = path.join(artifactRoot, `${getTimestamp()}-${sanitizeLabel(runnerLabel)}-${sanitizeLabel(label)}`)
const eventLogPath = path.join(sessionDir, 'preflight.log')
const stdoutPath = path.join(sessionDir, 'stdout.log')
const stderrPath = path.join(sessionDir, 'stderr.log')
const summaryPath = path.join(sessionDir, 'summary.json')
const summaryMarkdownPath = path.join(sessionDir, 'summary.md')
const userDataTreePath = path.join(sessionDir, 'user-data-tree.txt')
const chromeLogPath = path.join(sessionDir, 'chrome-debug.log')

const ensureDirSync = targetPath => {
  fs.mkdirSync(targetPath, { recursive: true })
}

const writeText = (targetPath, content) => {
  ensureDirSync(path.dirname(targetPath))
  fs.writeFileSync(targetPath, content)
}

const appendText = (targetPath, content) => {
  ensureDirSync(path.dirname(targetPath))
  fs.appendFileSync(targetPath, content)
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const findNamedFiles = (rootPath, filename, acc = []) => {
  if (!fs.existsSync(rootPath)) {
    return acc
  }

  const stats = fs.statSync(rootPath)
  if (!stats.isDirectory()) {
    if (path.basename(rootPath) === filename) {
      acc.push(rootPath)
    }
    return acc
  }

  for (const entry of fs.readdirSync(rootPath)) {
    findNamedFiles(path.join(rootPath, entry), filename, acc)
  }
  return acc
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

const copyIfExists = (sourcePath, targetPath) => {
  if (fs.existsSync(sourcePath)) {
    ensureDirSync(path.dirname(targetPath))
    fs.copyFileSync(sourcePath, targetPath)
    return true
  }
  return false
}

const writeCommandSnapshot = async (command, commandArgs, fileBase) => {
  try {
    const { stdout, stderr } = await execFileAsync(command, commandArgs, {
      windowsHide: true,
      maxBuffer: 10 * 1024 * 1024
    })
    writeText(`${fileBase}.stdout.txt`, stdout)
    writeText(`${fileBase}.stderr.txt`, stderr)
  } catch (error) {
    writeText(`${fileBase}.stdout.txt`, error.stdout || '')
    writeText(`${fileBase}.stderr.txt`, error.stderr || error.message)
  }
}

const snapshotWindowsProcesses = async prefix => {
  if (process.platform !== 'win32') {
    return
  }

  await writeCommandSnapshot('tasklist', ['/v', '/fo', 'csv'], path.join(sessionDir, `${prefix}-tasklist`))
  await writeCommandSnapshot('powershell', [
    '-NoProfile',
    '-Command',
    "Get-CimInstance Win32_Process | Where-Object { $_.Name -in @('electron.exe', 'node.exe', 'pwsh.exe') } | Select-Object ProcessId, ParentProcessId, Name, CommandLine | ConvertTo-Json -Depth 4"
  ], path.join(sessionDir, `${prefix}-processes`))
}

const appendEvent = message => {
  const line = `[electron-preflight] ${new Date().toISOString()} ${message}`
  console.log(line)
  appendText(eventLogPath, `${line}\n`)
}

const writeSummary = summary => {
  writeText(summaryPath, JSON.stringify(summary, null, 2))

  const lines = [
    '# Electron preflight summary',
    '',
    `- status: ${summary.status}`,
    `- runner: ${summary.runner}`,
    `- image: ${summary.imageOs || 'unknown'} (${summary.imageVersion || 'unknown'})`,
    `- elapsedMs: ${summary.elapsedMs}`,
    `- pid: ${summary.childPid || 'n/a'}`,
    `- userDataExists: ${summary.userDataExists}`,
    `- mainLogExists: ${summary.mainLogExists}`,
    `- preferenceExists: ${summary.preferenceExists}`,
    `- chromeLogExists: ${summary.chromeLogExists}`,
    `- cedBindingsFound: ${summary.nativeBindingsPresent.length}`,
    `- stdoutBytes: ${summary.stdoutBytes}`,
    `- stderrBytes: ${summary.stderrBytes}`,
    `- exitCode: ${summary.exitCode == null ? 'n/a' : summary.exitCode}`,
    `- signal: ${summary.signal || 'n/a'}`,
    `- spawnError: ${summary.spawnError || 'n/a'}`
  ]

  writeText(summaryMarkdownPath, `${lines.join('\n')}\n`)
}

const readPreview = (targetPath, lineCount = 20) => {
  if (!fs.existsSync(targetPath)) {
    return []
  }

  return fs.readFileSync(targetPath, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .slice(-lineCount)
}

const main = async () => {
  ensureDirSync(sessionDir)

  const summary = {
    label,
    runner: runnerLabel,
    imageOs: args['--image-os'] || process.env.ImageOS,
    imageVersion: args['--image-version'] || process.env.ImageVersion,
    timeoutMs,
    electronPath,
    electronExists: fs.existsSync(electronPath),
    mainEntrypointPath,
    mainEntrypointExists: fs.existsSync(mainEntrypointPath),
    userDataPath,
    args: baseArgs.concat([mainEntrypointPath, '--user-data-dir', userDataPath], extraArgs),
    nativeBindingsPresent: findNamedFiles(path.resolve('node_modules', 'ced'), 'ced.node'),
    status: 'starting',
    stdoutBytes: 0,
    stderrBytes: 0
  }

  writeSummary(summary)

  if (!summary.electronExists) {
    throw new Error(`Electron executable not found: ${electronPath}`)
  }
  if (!summary.mainEntrypointExists) {
    throw new Error(`Electron main entrypoint not found: ${mainEntrypointPath}`)
  }

  await snapshotWindowsProcesses('before-spawn')

  const startedAt = Date.now()
  const child = spawn(electronPath, summary.args, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      ELECTRON_ENABLE_LOGGING: process.env.ELECTRON_ENABLE_LOGGING || '1',
      ELECTRON_ENABLE_STACK_DUMPING: process.env.ELECTRON_ENABLE_STACK_DUMPING || '1',
      CHROME_LOG_FILE: chromeLogPath
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true
  })

  summary.childPid = child.pid
  appendEvent(`spawned pid=${child.pid}`)

  child.stdout.on('data', chunk => {
    summary.stdoutBytes += chunk.length
    appendText(stdoutPath, chunk.toString())
  })

  child.stderr.on('data', chunk => {
    summary.stderrBytes += chunk.length
    appendText(stderrPath, chunk.toString())
  })

  let processResult = null
  const processResultPromise = new Promise(resolve => {
    child.once('error', error => resolve({ type: 'error', error }))
    child.once('exit', (code, signal) => resolve({ type: 'exit', code, signal }))
  })

  let userDataObserved = false
  let mainLogObserved = false
  let preferenceObserved = false

  const poller = setInterval(() => {
    if (!userDataObserved && fs.existsSync(userDataPath)) {
      userDataObserved = true
      appendEvent(`user-data-created elapsed=${Date.now() - startedAt}ms`)
    }
    if (!mainLogObserved && fs.existsSync(mainLogPath)) {
      mainLogObserved = true
      appendEvent(`main-log-created elapsed=${Date.now() - startedAt}ms`)
    }
    if (!preferenceObserved && fs.existsSync(preferencePath)) {
      preferenceObserved = true
      appendEvent(`preference-created elapsed=${Date.now() - startedAt}ms`)
    }
  }, 1000)

  await sleep(2000)
  await snapshotWindowsProcesses('after-spawn')

  processResult = await Promise.race([
    processResultPromise,
    sleep(timeoutMs).then(() => ({ type: 'timeout' }))
  ])

  clearInterval(poller)

  if (processResult.type === 'timeout') {
    const startupEvidenceExists = fs.existsSync(userDataPath) || fs.existsSync(mainLogPath) || fs.existsSync(preferencePath)
    summary.status = startupEvidenceExists
      ? 'started_and_terminated'
      : 'timed_out'
    appendEvent(`timeout elapsed=${Date.now() - startedAt}ms`)
    await snapshotWindowsProcesses('before-kill')

    if (process.platform === 'win32' && child.pid) {
      await writeCommandSnapshot('taskkill', ['/pid', String(child.pid), '/t', '/f'], path.join(sessionDir, 'taskkill'))
    } else {
      child.kill('SIGKILL')
    }

    const exitAfterKill = await Promise.race([
      processResultPromise,
      sleep(5000).then(() => ({ type: 'kill-timeout' }))
    ])

    if (exitAfterKill.type === 'exit') {
      summary.exitCode = exitAfterKill.code
      summary.signal = exitAfterKill.signal
    } else if (exitAfterKill.type === 'error') {
      summary.spawnError = exitAfterKill.error.message
    }

    await snapshotWindowsProcesses('after-kill')
  } else if (processResult.type === 'exit') {
    summary.status = 'exited'
    summary.exitCode = processResult.code
    summary.signal = processResult.signal
    appendEvent(`exited code=${processResult.code} signal=${processResult.signal}`)
    await snapshotWindowsProcesses('after-exit')
  } else {
    summary.status = 'spawn_error'
    summary.spawnError = processResult.error.message
    appendEvent(`spawn-error ${processResult.error.message}`)
    await snapshotWindowsProcesses('after-error')
  }

  summary.elapsedMs = Date.now() - startedAt
  summary.userDataExists = fs.existsSync(userDataPath)
  summary.mainLogExists = fs.existsSync(mainLogPath)
  summary.preferenceExists = fs.existsSync(preferencePath)
  summary.chromeLogExists = fs.existsSync(chromeLogPath)
  summary.stdoutPreview = readPreview(stdoutPath)
  summary.stderrPreview = readPreview(stderrPath)

  writeText(userDataTreePath, formatFileTree(userDataPath))
  copyIfExists(mainLogPath, path.join(sessionDir, 'main.log'))
  copyIfExists(preferencePath, path.join(sessionDir, 'preference.json'))
  writeSummary(summary)

  appendEvent(`summary status=${summary.status} userDataExists=${summary.userDataExists} mainLogExists=${summary.mainLogExists}`)
}

main().catch(error => {
  ensureDirSync(sessionDir)
  writeText(path.join(sessionDir, 'fatal-error.txt'), `${error.stack || error.message}\n`)
  console.error(error.stack || error.message)
  process.exit(1)
})
