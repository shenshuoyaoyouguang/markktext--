'use strict'

const fs = require('fs')
const path = require('path')

const HELP_TEXT = `
Usage:
  node tools/verifyPackagedWindowsBundle.js [win-unpacked-dir]

Examples:
  node tools/verifyPackagedWindowsBundle.js
  node tools/verifyPackagedWindowsBundle.js build/win-unpacked

Checks that the packaged Windows bundle contains the unpacked native keytar
binding required by the Electron main process.
`.trim()

const args = process.argv.slice(2)

if (args.includes('--help') || args.includes('-h')) {
  console.log(HELP_TEXT)
  process.exit(0)
}

const appDir = path.resolve(args[0] || path.join('build', 'win-unpacked'))
const requiredPaths = [
  {
    label: 'Windows app directory',
    filePath: appDir,
    type: 'dir'
  },
  {
    label: 'Electron resources archive',
    filePath: path.join(appDir, 'resources', 'app.asar'),
    type: 'file'
  },
  {
    label: 'Unpacked keytar native binding',
    filePath: path.join(appDir, 'resources', 'app.asar.unpacked', 'node_modules', 'keytar', 'build', 'Release', 'keytar.node'),
    type: 'file'
  }
]

let hasFailure = false

for (const { label, filePath, type } of requiredPaths) {
  if (!fs.existsSync(filePath)) {
    console.error(`[verify-packaged-windows-bundle] Missing ${label}: ${filePath}`)
    hasFailure = true
    continue
  }

  const stats = fs.statSync(filePath)
  if (type === 'dir' && !stats.isDirectory()) {
    console.error(`[verify-packaged-windows-bundle] Expected directory for ${label}: ${filePath}`)
    hasFailure = true
    continue
  }
  if (type === 'file' && !stats.isFile()) {
    console.error(`[verify-packaged-windows-bundle] Expected file for ${label}: ${filePath}`)
    hasFailure = true
    continue
  }
  if (type === 'file' && stats.size <= 0) {
    console.error(`[verify-packaged-windows-bundle] Empty file for ${label}: ${filePath}`)
    hasFailure = true
    continue
  }

  console.log(`[verify-packaged-windows-bundle] OK ${label}: ${filePath}`)
}

if (hasFailure) {
  const unpackedNodeModulesPath = path.join(appDir, 'resources', 'app.asar.unpacked', 'node_modules')
  if (fs.existsSync(unpackedNodeModulesPath)) {
    const unpackedEntries = fs.readdirSync(unpackedNodeModulesPath).sort()
    console.error(`[verify-packaged-windows-bundle] Present unpacked node_modules entries: ${unpackedEntries.join(', ') || '<none>'}`)
  } else {
    console.error(`[verify-packaged-windows-bundle] Missing unpacked node_modules directory: ${unpackedNodeModulesPath}`)
  }

  process.exit(1)
}

console.log(`[verify-packaged-windows-bundle] Verification passed for ${appDir}`)
