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
    { name: 'Jane Doe', phone: '+91 90000 00002', role: 'Event Manager' }
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
    ]
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
  ]
}

async function readSiteSettings() {
  const { data, error } = await supabase
    .from('vpl_site_settings')
    .select('content')
    .eq('slug', SITE_SETTINGS_SLUG)
    .maybeSingle()

  if (error || !data?.content) {
    if (!data?.content && !error) {
       await supabase.from('vpl_site_settings').upsert({ slug: SITE_SETTINGS_SLUG, content: defaultSiteSettings }, { onConflict: 'slug' })
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

  // Handle UTF-16LE .env files created by Windows tooling.
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
