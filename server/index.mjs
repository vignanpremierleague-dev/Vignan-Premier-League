import http from 'node:http'
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { randomBytes, timingSafeEqual } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

loadEnvFile(path.join(projectRoot, '.env'))

const PORT = Number(process.env.ADMIN_API_PORT || 8787)
const TOKEN_TTL_MS = Number(process.env.ADMIN_TOKEN_TTL_MS || 1000 * 60 * 60 * 8)
const ALLOWED_ORIGINS = new Set(
  (process.env.ADMIN_CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
)

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_KEY
const ADMIN_USER = process.env.ADMIN_USER || 'admin'
const ADMIN_PASS = process.env.ADMIN_PASS || 'vpl@admin2025'

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing required backend env vars (SUPABASE_URL, SUPABASE_SERVICE_KEY).')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const sessions = new Map()

const SITE_SETTINGS_SLUG = 'primary'
const defaultSiteSettings = {
  registrationsOpen: true,
  marqueeMessage: '🔥 Welcome to VPL 2025! Registrations are now LIVE! Secure your spot before slots fill up.',
  contactEmail: 'support@vignanpremierleague.com',
  contactPhone: '+91 99999 99999',
  whatsappLink: 'https://chat.whatsapp.com/L7HXdLMblNRGTNwJbMZPVE?mode=gi_t',
  timelineSectionTitle: 'Tournament Timeline',
  timelineWindow: 'July - August',
  timelineEvents: [
    { title: 'Registrations Open', date: 'Coming Soon', desc: 'Register online and pay the Rs.300 entry fee to join the player pool.' },
    { title: 'Player Auction', date: 'Coming Soon', desc: 'Faculty team owners bid for players in a high-energy live auction.' },
    { title: 'Team Reveal', date: 'Coming Soon', desc: 'Final squads announced and jersey numbers assigned.' },
    { title: 'League Matches', date: 'Coming Soon', desc: 'Round-robin T10 league stage where every match and every ball counts.' },
    { title: 'Knockouts & Finals', date: 'Coming Soon', desc: 'Semi-finals and the Grand Finale for the VPL championship.' },
    { title: 'Awards Ceremony', date: 'Coming Soon', desc: 'Best Batsman, Bowler, and Player of the Tournament will be recognized.' },
  ],
  winners: [],
  studentCoordinators: [
    { name: 'John Doe', phone: '+91 90000 00001', role: 'Head Coordinator' },
    { name: 'Jane Doe', phone: '+91 90000 00002', role: 'Event Manager' },
  ],
  teams: {
    A: [
      { name: 'Team 1', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' },
      { name: 'Team 2', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' },
      { name: 'Team 3', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' },
      { name: 'Team 4', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' },
      { name: 'Team 5', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' },
    ],
    B: [
      { name: 'Team 6', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' },
      { name: 'Team 7', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' },
      { name: 'Team 8', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' },
      { name: 'Team 9', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' },
      { name: 'Team 10', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' },
    ],
  },
  leagueMatches: [
    { id: 1, grp: 'A', t1: 'Team 1', t2: 'Team 2', date: 'TBD', time: 'TBD' },
    { id: 2, grp: 'A', t1: 'Team 3', t2: 'Team 4', date: 'TBD', time: 'TBD' },
    { id: 3, grp: 'A', t1: 'Team 5', t2: 'Team 1', date: 'TBD', time: 'TBD' },
    { id: 4, grp: 'A', t1: 'Team 2', t2: 'Team 3', date: 'TBD', time: 'TBD' },
    { id: 5, grp: 'A', t1: 'Team 4', t2: 'Team 5', date: 'TBD', time: 'TBD' },
    { id: 6, grp: 'A', t1: 'Team 1', t2: 'Team 3', date: 'TBD', time: 'TBD' },
    { id: 7, grp: 'A', t1: 'Team 2', t2: 'Team 4', date: 'TBD', time: 'TBD' },
    { id: 8, grp: 'A', t1: 'Team 3', t2: 'Team 5', date: 'TBD', time: 'TBD' },
    { id: 9, grp: 'A', t1: 'Team 1', t2: 'Team 4', date: 'TBD', time: 'TBD' },
    { id: 10, grp: 'A', t1: 'Team 2', t2: 'Team 5', date: 'TBD', time: 'TBD' },
    { id: 11, grp: 'B', t1: 'Team 6', t2: 'Team 7', date: 'TBD', time: 'TBD' },
    { id: 12, grp: 'B', t1: 'Team 8', t2: 'Team 9', date: 'TBD', time: 'TBD' },
    { id: 13, grp: 'B', t1: 'Team 10', t2: 'Team 6', date: 'TBD', time: 'TBD' },
    { id: 14, grp: 'B', t1: 'Team 7', t2: 'Team 8', date: 'TBD', time: 'TBD' },
    { id: 15, grp: 'B', t1: 'Team 9', t2: 'Team 10', date: 'TBD', time: 'TBD' },
    { id: 16, grp: 'B', t1: 'Team 6', t2: 'Team 8', date: 'TBD', time: 'TBD' },
    { id: 17, grp: 'B', t1: 'Team 7', t2: 'Team 9', date: 'TBD', time: 'TBD' },
    { id: 18, grp: 'B', t1: 'Team 8', t2: 'Team 10', date: 'TBD', time: 'TBD' },
    { id: 19, grp: 'B', t1: 'Team 6', t2: 'Team 9', date: 'TBD', time: 'TBD' },
    { id: 20, grp: 'B', t1: 'Team 7', t2: 'Team 10', date: 'TBD', time: 'TBD' },
  ],
}

async function readSiteSettings() {
  const { data, error } = await supabase
    .from('vpl_site_settings')
    .select('content')
    .eq('slug', SITE_SETTINGS_SLUG)
    .maybeSingle()

  if (error || !data?.content) {
    if (!data?.content && !error) {
      await supabase
        .from('vpl_site_settings')
        .upsert({ slug: SITE_SETTINGS_SLUG, content: defaultSiteSettings }, { onConflict: 'slug' })
    }
    return defaultSiteSettings
  }
  return data.content
}

setInterval(() => {
  const now = Date.now()
  for (const [token, session] of sessions.entries()) {
    if (session.expiresAt <= now) sessions.delete(token)
  }
}, 60_000).unref()

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin
  setCorsHeaders(res, origin)

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)

  if (req.method === 'GET' && url.pathname === '/api/health') {
    sendJson(res, 200, { ok: true })
    return
  }

  if (req.method === 'GET' && url.pathname === '/api/public/site-settings') {
    const content = await readSiteSettings()
    sendJson(res, 200, { content })
    return
  }

  if (req.method === 'POST' && url.pathname === '/api/public/access-status') {
    const body = await readJson(req, res)
    if (!body) return

    const fingerprint = normalizeFingerprint(body.fingerprint)
    if (!fingerprint) {
      sendJson(res, 400, { error: 'Device fingerprint is required.' })
      return
    }

    const block = await findDeviceBlock(fingerprint)
    sendJson(res, 200, {
      allowed: !block,
      blocked: Boolean(block),
      reason: block?.blocked_reason || 'This device has been blocked from accessing this website.',
    })
    return
  }

  if (req.method === 'POST' && url.pathname === '/api/public/register') {
    const body = await readJson(req, res)
    if (!body) return

    const settings = await readSiteSettings()
    if (settings && settings.registrationsOpen === false) {
      sendJson(res, 403, { error: 'Registrations are currently closed.' })
      return
    }

    const fingerprint = normalizeFingerprint(body.device_fingerprint)
    if (!fingerprint) {
      sendJson(res, 400, { error: 'Device fingerprint is required.' })
      return
    }

    const block = await findDeviceBlock(fingerprint)
    if (block) {
      sendJson(res, 403, { error: block.blocked_reason || 'This device has been blocked from registering.' })
      return
    }

    const { ip, userAgent } = getRequestContext(req)
    const payload = {
      registration_id: typeof body.registration_id === 'string' ? body.registration_id.trim().toUpperCase() : '',
      name: typeof body.name === 'string' ? body.name.trim() : '',
      phone: typeof body.phone === 'string' ? body.phone.trim() : '',
      email: typeof body.email === 'string' ? body.email.trim().toLowerCase() : '',
      photo_url: typeof body.photo_url === 'string' ? body.photo_url.trim() : '',
      year: body.year || '',
      course: body.course || '',
      branch: body.branch || '',
      section: body.section || '',
      role: body.role || '',
      batting_side: body.batting_side || null,
      bowling_arm: body.bowling_arm || null,
      bowling_type: body.bowling_type || null,
      utr_number: typeof body.utr_number === 'string' ? body.utr_number.trim() : '',
      payment_screenshot_url: typeof body.payment_screenshot_url === 'string' ? body.payment_screenshot_url.trim() : '',
      is_verified: false,
      device_fingerprint: fingerprint,
      registration_ip: ip,
      registration_user_agent: userAgent,
    }

    const missingRequired = [
      'registration_id',
      'name',
      'phone',
      'email',
      'photo_url',
      'year',
      'course',
      'branch',
      'section',
      'role',
      'utr_number',
      'payment_screenshot_url',
    ].find((key) => !payload[key])

    if (missingRequired) {
      sendJson(res, 400, { error: `Missing required field: ${missingRequired}` })
      return
    }

    const { data, error } = await supabase
      .from('vpl_players')
      .insert(payload)
      .select('id')
      .single()

    if (error) {
      sendJson(res, 400, { error: mapPlayerWriteError(error) })
      return
    }

    sendJson(res, 200, { id: data?.id })
    return
  }

  if (req.method === 'POST' && url.pathname === '/api/admin/login') {
    const body = await readJson(req, res)
    if (!body) return

    const { username, password } = body
    if (typeof username !== 'string' || typeof password !== 'string') {
      sendJson(res, 400, { error: 'Username and password are required.' })
      return
    }

    const valid = safeEqual(username, ADMIN_USER) && safeEqual(password, ADMIN_PASS)
    if (!valid) {
      sendJson(res, 401, { error: 'Invalid username or password.' })
      return
    }

    const token = randomBytes(32).toString('hex')
    sessions.set(token, { expiresAt: Date.now() + TOKEN_TTL_MS })
    sendJson(res, 200, { token, expiresAt: Date.now() + TOKEN_TTL_MS })
    return
  }

  if (req.method === 'POST' && url.pathname === '/api/admin/logout') {
    const token = extractBearerToken(req)
    if (token) sessions.delete(token)
    sendJson(res, 200, { ok: true })
    return
  }

  if (req.method === 'GET' && url.pathname === '/api/admin/players') {
    if (!isAuthorized(req)) {
      sendJson(res, 401, { error: 'Unauthorized' })
      return
    }

    const { data, error } = await supabase
      .from('vpl_players')
      .select('*')
      .order('registered_at', { ascending: false })

    if (error) {
      sendJson(res, 500, { error: error.message || 'Failed to fetch players.' })
      return
    }

    sendJson(res, 200, { players: data || [] })
    return
  }

  if (req.method === 'PUT' && url.pathname === '/api/admin/site-settings') {
    if (!isAuthorized(req)) {
      sendJson(res, 401, { error: 'Unauthorized' })
      return
    }

    const body = await readJson(req, res)
    if (!body) return

    const content = body.content || defaultSiteSettings
    const { error } = await supabase
      .from('vpl_site_settings')
      .upsert({
        slug: SITE_SETTINGS_SLUG,
        content,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'slug' })

    if (error) {
      sendJson(res, 500, { error: error.message || 'Failed to save settings.' })
      return
    }

    sendJson(res, 200, { content })
    return
  }

  if (req.method === 'PATCH' && /^\/api\/admin\/players\/[^/]+\/verify$/.test(url.pathname)) {
    if (!isAuthorized(req)) {
      sendJson(res, 401, { error: 'Unauthorized' })
      return
    }

    const match = url.pathname.match(/^\/api\/admin\/players\/([^/]+)\/verify$/)
    const id = decodeURIComponent(match?.[1] || '')
    if (!id) {
      sendJson(res, 400, { error: 'Invalid player id.' })
      return
    }

    const { data, error } = await supabase
      .from('vpl_players')
      .update({ is_verified: true })
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      sendJson(res, 500, { error: error.message || 'Failed to verify player.' })
      return
    }

    sendJson(res, 200, { player: data })
    return
  }

  if (req.method === 'PATCH' && /^\/api\/admin\/players\/[^/]+\/block-device$/.test(url.pathname)) {
    if (!isAuthorized(req)) {
      sendJson(res, 401, { error: 'Unauthorized' })
      return
    }

    const match = url.pathname.match(/^\/api\/admin\/players\/([^/]+)\/block-device$/)
    const id = decodeURIComponent(match?.[1] || '')
    if (!id) {
      sendJson(res, 400, { error: 'Invalid player id.' })
      return
    }

    const { data: player, error: playerError } = await supabase
      .from('vpl_players')
      .select('id, registration_id, device_fingerprint, registration_ip, registration_user_agent')
      .eq('id', id)
      .single()

    if (playerError || !player) {
      sendJson(res, 404, { error: 'Player not found.' })
      return
    }

    const fingerprint = normalizeFingerprint(player.device_fingerprint)
    if (!fingerprint) {
      sendJson(res, 400, { error: 'No device fingerprint is available for this player.' })
      return
    }

    const blockedAt = new Date().toISOString()
    const reason = 'Blocked by admin'

    const { error: blockError } = await supabase
      .from('vpl_device_blocks')
      .upsert({
        device_fingerprint: fingerprint,
        blocked_player_id: String(player.id),
        blocked_registration_id: player.registration_id || null,
        blocked_ip: player.registration_ip || null,
        blocked_user_agent: player.registration_user_agent || null,
        blocked_reason: reason,
      }, { onConflict: 'device_fingerprint' })

    if (blockError) {
      sendJson(res, 500, { error: blockError.message || 'Failed to block device.' })
      return
    }

    const { data, error } = await supabase
      .from('vpl_players')
      .update({ device_blocked_at: blockedAt })
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      sendJson(res, 500, { error: error.message || 'Failed to update player block state.' })
      return
    }

    sendJson(res, 200, { player: data })
    return
  }

  sendJson(res, 404, { error: 'Not found' })
})

server.listen(PORT, () => {
  console.log(`Admin API listening on http://localhost:${PORT}`)
})

function safeEqual(a, b) {
  const aBuf = Buffer.from(a)
  const bBuf = Buffer.from(b)
  if (aBuf.length !== bBuf.length) return false
  return timingSafeEqual(aBuf, bBuf)
}

function extractBearerToken(req) {
  const value = req.headers.authorization
  if (!value || !value.startsWith('Bearer ')) return ''
  return value.slice(7).trim()
}

function isAuthorized(req) {
  const token = extractBearerToken(req)
  if (!token) return false
  const session = sessions.get(token)
  if (!session) return false
  if (session.expiresAt <= Date.now()) {
    sessions.delete(token)
    return false
  }
  return true
}

function setCorsHeaders(res, origin) {
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload)
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(body)
}

async function readJson(req, res) {
  const chunks = []
  let total = 0

  for await (const chunk of req) {
    total += chunk.length
    if (total > 1_000_000) {
      sendJson(res, 413, { error: 'Payload too large.' })
      return null
    }
    chunks.push(chunk)
  }

  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw) return {}

  try {
    return JSON.parse(raw)
  } catch {
    sendJson(res, 400, { error: 'Invalid JSON payload.' })
    return null
  }
}

function loadEnvFile(envPath) {
  if (!existsSync(envPath)) return
  const buffer = readFileSync(envPath)
  let text = buffer.toString('utf8')

  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
    text = buffer.toString('utf16le')
  }

  const lines = text.split(/\r?\n/)

  for (const line of lines) {
    if (!line || line.trim().startsWith('#')) continue
    const sep = line.indexOf('=')
    if (sep <= 0) continue
    const key = line.slice(0, sep).trim()
    if (!key || key in process.env) continue
    const value = line.slice(sep + 1).trim()
    process.env[key] = stripQuotes(value)
  }
}

function stripQuotes(value) {
  if (value.startsWith('"') && value.endsWith('"')) return value.slice(1, -1)
  if (value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1)
  return value
}

function normalizeFingerprint(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function getRequestContext(req) {
  const forwarded = req.headers['x-forwarded-for']
  const ip = typeof forwarded === 'string'
    ? forwarded.split(',')[0].trim()
    : req.socket.remoteAddress || ''
  const userAgent = typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : ''
  return { ip, userAgent }
}

async function findDeviceBlock(fingerprint) {
  const { data, error } = await supabase
    .from('vpl_device_blocks')
    .select('device_fingerprint, blocked_reason, created_at')
    .eq('device_fingerprint', fingerprint)
    .maybeSingle()

  if (error || !data) return null
  return data
}

function mapPlayerWriteError(error) {
  if (error?.code === '23505') {
    if (error.message?.includes('registration_id')) return 'This Registration ID is already registered.'
    if (error.message?.includes('utr_number')) return 'This UTR number was already used.'
    return 'A duplicate entry was detected.'
  }
  return error?.message || 'Registration failed.'
}
