import log from 'electron-log'

const CED_ICONV_ENCODINGS = {
  'BIG5-CP950': 'big5',
  KSC: 'euckr',
  'ISO-2022-KR': 'euckr',
  GB: 'gb2312',
  ISO_2022_CN: 'gb2312',
  JIS: 'shiftjis',
  SJS: 'shiftjis',
  Unicode: 'utf8',

  // Map ASCII to UTF-8
  'ASCII-7-bit': 'utf8',
  ASCII: 'utf8',
  MACINTOSH: 'utf8'
}

// Byte Order Mark's to detect endianness and encoding.
const BOM_ENCODINGS = {
  utf8: [0xEF, 0xBB, 0xBF],
  utf16be: [0xFE, 0xFF],
  utf16le: [0xFF, 0xFE]
}

let cedDetector = null
let cedLoadAttempted = false
let cedUnavailableWarningShown = false

const loadCedDetector = () => {
  if (cedLoadAttempted) {
    return cedDetector
  }

  cedLoadAttempted = true

  try {
    // NOTE: `ced` is a native addon. Loading it lazily prevents the whole
    // Electron main process from crashing during startup when the addon is
    // missing or built for the wrong ABI. In that case we fall back to UTF-8
    // and log a clear diagnostic instead of timing out later in E2E startup.
    // eslint-disable-next-line global-require
    cedDetector = require('ced')
  } catch (error) {
    log.error('Unable to load native encoding detector "ced". Falling back to UTF-8.', error)
    cedDetector = null
  }

  return cedDetector
}

const warnCedFallbackOnce = () => {
  if (cedUnavailableWarningShown) {
    return
  }

  cedUnavailableWarningShown = true
  log.warn('Encoding auto-detection is unavailable because native module "ced" could not be loaded. Falling back to UTF-8.')
}

const checkSequence = (buffer, sequence) => {
  if (buffer.length < sequence.length) {
    return false
  }
  return sequence.every((v, i) => v === buffer[i])
}

/**
 * Guess the encoding from the buffer.
 *
 * @param {Buffer} buffer
 * @param {boolean} autoGuessEncoding
 * @returns {Encoding}
 */
export const guessEncoding = (buffer, autoGuessEncoding) => {
  let isBom = false
  let encoding = 'utf8'

  // Detect UTF8- and UTF16-BOM encodings.
  for (const [key, value] of Object.entries(BOM_ENCODINGS)) {
    if (checkSequence(buffer, value)) {
      return { encoding: key, isBom: true }
    }
  }

  // // Try to detect binary files. Text files should not containt four 0x00 characters.
  // let zeroSeenCounter = 0
  // for (let i = 0; i < Math.min(buffer.byteLength, 256); ++i) {
  //   if (buffer[i] === 0x00) {
  //     if (zeroSeenCounter >= 3) {
  //       return { encoding: 'binary', isBom: false }
  //     }
  //     zeroSeenCounter++
  //   } else {
  //     zeroSeenCounter = 0
  //   }
  // }

  // Auto guess encoding, otherwise use UTF8.
  if (autoGuessEncoding) {
    const detector = loadCedDetector()
    if (detector) {
      encoding = detector(buffer)
      if (CED_ICONV_ENCODINGS[encoding]) {
        encoding = CED_ICONV_ENCODINGS[encoding]
      } else {
        encoding = encoding.toLowerCase().replace(/-_/g, '')
      }
    } else {
      warnCedFallbackOnce()
    }
  }
  return { encoding, isBom }
}
