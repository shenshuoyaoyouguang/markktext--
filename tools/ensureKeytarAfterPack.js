'use strict'

const fs = require('fs')
const path = require('path')

exports.default = async function ensureKeytarAfterPack (context) {
  if (!context || context.electronPlatformName !== 'win32') {
    return
  }

  const sourcePath = path.join(context.packager.projectDir, 'node_modules', 'keytar', 'build', 'Release', 'keytar.node')
  const targetPath = path.join(context.appOutDir, 'resources', 'app.asar.unpacked', 'node_modules', 'keytar', 'build', 'Release', 'keytar.node')

  if (fs.existsSync(targetPath) && fs.statSync(targetPath).size > 0) {
    console.log(`[ensure-keytar-after-pack] keytar already present: ${targetPath}`)
    return
  }

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`[ensure-keytar-after-pack] Missing rebuilt source keytar binary: ${sourcePath}`)
  }

  fs.mkdirSync(path.dirname(targetPath), { recursive: true })
  fs.copyFileSync(sourcePath, targetPath)

  const copiedStats = fs.statSync(targetPath)
  if (!copiedStats.isFile() || copiedStats.size <= 0) {
    throw new Error(`[ensure-keytar-after-pack] Failed to materialize packaged keytar binary: ${targetPath}`)
  }

  console.log(`[ensure-keytar-after-pack] Copied keytar binary to packaged app: ${targetPath}`)
}
