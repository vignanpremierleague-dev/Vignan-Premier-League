const DEVICE_FINGERPRINT_KEY = 'vpl-device-fingerprint-v1'

function readStoredFingerprint() {
  try {
    return localStorage.getItem(DEVICE_FINGERPRINT_KEY) || ''
  } catch {
    return ''
  }
}

function writeStoredFingerprint(value) {
  try {
    localStorage.setItem(DEVICE_FINGERPRINT_KEY, value)
  } catch {
    // Ignore storage failures and continue with in-memory use.
  }
}

function buildCanvasFingerprint() {
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return 'no-canvas'
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillStyle = '#f60'
    ctx.fillRect(10, 10, 120, 32)
    ctx.fillStyle = '#069'
    ctx.fillText('VPL device fingerprint', 14, 16)
    return canvas.toDataURL()
  } catch {
    return 'canvas-error'
  }
}

async function sha256(text) {
  if (!crypto?.subtle) return fallbackHash(text)
  const encoded = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', encoded)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function fallbackHash(text) {
  let hash = 0
  for (let i = 0; i < text.length; i += 1) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i)
    hash |= 0
  }
  return `fallback-${Math.abs(hash)}`
}

export async function getOrCreateDeviceFingerprint() {
  const stored = readStoredFingerprint()
  if (stored) return stored

  const source = [
    navigator.userAgent || '',
    navigator.language || '',
    navigator.platform || '',
    String(navigator.hardwareConcurrency || ''),
    String(navigator.deviceMemory || ''),
    `${window.screen?.width || 0}x${window.screen?.height || 0}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    buildCanvasFingerprint(),
  ].join('|')

  const fingerprint = await sha256(source)
  writeStoredFingerprint(fingerprint)
  return fingerprint
}
