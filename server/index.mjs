import http from 'node:http'
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { randomBytes, timingSafeEqual, createHmac } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

loadEnvFile(path.join(projectRoot, '.env'))

const PORT = Number(process.env.ADMIN_API_PORT || 8787)
const TOKEN_TTL_MS = Number(process.env.ADMIN_TOKEN_TTL_MS || 1000 * 60 * 60 * 24)
const ALLOWED_ORIGINS = new Set(
  (process.env.ADMIN_CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
)

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_KEY
const ADMIN_USER = process.env.ADMIN_USER || 'admin'
const ADMIN_PASS = process.env.ADMIN_PASS || 'vpl@admin@99'

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing required backend env vars (SUPABASE_URL, SUPABASE_SERVICE_KEY).')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const revokedTokens = new Set()

// Base64URL encoding/decoding helpers for HS256 JWT
function base64urlEncode(strOrBuffer) {
  const buf = Buffer.isBuffer(strOrBuffer) ? strOrBuffer : Buffer.from(strOrBuffer)
  return buf.toString('base64url')
}

function base64urlDecode(str) {
  return Buffer.from(str, 'base64url').toString('utf8')
}

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.SUPABASE_SERVICE_KEY || 'f4849c987ac8abfcdc0c38e6df633ee2b8b6c11cf962bd60a69abbdecd41cf32'

function signJwt(payload) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const encodedHeader = base64urlEncode(JSON.stringify(header))
  const encodedPayload = base64urlEncode(JSON.stringify(payload))
  
  const hmac = createHmac('sha256', JWT_SECRET)
  hmac.update(`${encodedHeader}.${encodedPayload}`)
  const signature = base64urlEncode(hmac.digest())
  
  return `${encodedHeader}.${encodedPayload}.${signature}`
}

function verifyJwt(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const [encodedHeader, encodedPayload, signature] = parts
    const hmac = createHmac('sha256', JWT_SECRET)
    hmac.update(`${encodedHeader}.${encodedPayload}`)
    const expectedSignature = base64urlEncode(hmac.digest())
    
    const sigBuf = Buffer.from(signature)
    const expectedBuf = Buffer.from(expectedSignature)
    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
      return null
    }
    
    const payload = JSON.parse(base64urlDecode(encodedPayload))
    if (payload.exp && Date.now() > payload.exp) {
      return null // Expired
    }
    
    return payload
  } catch (err) {
    return null
  }
}

const SITE_SETTINGS_SLUG = 'primary'
const defaultAuctionState = {
  auction_type: 'captains',
  stage: 'idle',
  active_player_id: null,
  current_bid: 0,
  sold_to: null,
  sold_price: 0,
  display_title: 'VPL Captains Auction',
  nomination_order: [],
  last_event_at: null,
}
const defaultSiteSettings = {
  registrationsOpen: true,
  marqueeMessage: '🔥 Welcome to VPL 2025! Registrations are now LIVE! Secure your spot before slots fill up.',
  contactEmail: 'support@vignanpremierleague.com',
  contactPhone: '+91 99999 99999',
  whatsappLink: 'https://chat.whatsapp.com/L7HXdLMblNRGTNwJbMZPVE?mode=gi_t',
  paymentQrUrl: '/gpay-qr.jpeg',
  auctionConfig: {
    captainBasePrice: 3,
    playerBasePrice: 1,
    playerBasePriceOverrides: {},
  },
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
      { name: 'Dominators', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' },
      { name: 'Warriors', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' },
      { name: 'Gladiators', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' },
      { name: 'Knights', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' },
      { name: 'Lions', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' },
    ],
    B: [
      { name: 'Royals', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' },
      { name: 'Titans', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' },
      { name: 'Marvels', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' },
      { name: 'Panthers', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' },
      { name: 'Thunderbolts', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' },
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
  for (const token of revokedTokens) {
    const payload = verifyJwt(token)
    if (!payload) {
      // Token is expired or invalid, we can safely prune it from the revoked list
      revokedTokens.delete(token)
    }
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

  if (req.method === 'GET' && url.pathname === '/api/public/auction/state') {
    if (!isAuthorized(req)) {
      sendJson(res, 401, { error: 'Unauthorized' })
      return
    }

    const { data, error } = await supabase
      .from('vpl_site_settings')
      .select('content')
      .eq('slug', 'auction_state')
      .maybeSingle()

    if (error) {
      sendJson(res, 500, { error: error.message || 'Failed to fetch auction state.' })
      return
    }

    const state = {
      ...defaultAuctionState,
      ...(data?.content || {}),
    }
    
    if (state.active_player_id) {
      const { data: player, error: pError } = await supabase
        .from('vpl_players')
        .select('*')
        .eq('id', state.active_player_id)
        .maybeSingle()
      
      if (!pError && player) {
        state.active_player = player
      }
    }

    sendJson(res, 200, { state })
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

    const expiresAt = Date.now() + TOKEN_TTL_MS
    const token = signJwt({ user: username, exp: expiresAt })
    sendJson(res, 200, { token, expiresAt })
    return
  }

  if (req.method === 'POST' && url.pathname === '/api/admin/logout') {
    const token = extractBearerToken(req)
    if (token) revokedTokens.add(token)
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

  if (req.method === 'POST' && url.pathname === '/api/admin/auction/state') {
    if (!isAuthorized(req)) {
      sendJson(res, 401, { error: 'Unauthorized' })
      return
    }

    const body = await readJson(req, res)
    if (!body) return

    const { state } = body
    if (!state) {
      sendJson(res, 400, { error: 'State object is required.' })
      return
    }

    const mergedState = {
      ...defaultAuctionState,
      ...state,
      updated_at: undefined,
    }

    const { error } = await supabase
      .from('vpl_site_settings')
      .upsert({
        slug: 'auction_state',
        content: mergedState,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'slug' })

    if (error) {
      sendJson(res, 500, { error: error.message || 'Failed to update auction state.' })
      return
    }

    sendJson(res, 200, { state: mergedState })
    return
  }

  if (req.method === 'POST' && url.pathname === '/api/admin/auction/reset') {
    if (!isAuthorized(req)) {
      sendJson(res, 401, { error: 'Unauthorized' })
      return
    }

    const { error: resetPlayersError } = await supabase
      .from('vpl_players')
      .update({
        sold_to: null,
        bid_amount: 0,
        auction_status: 'available',
      })
      .not('id', 'is', null)

    if (resetPlayersError) {
      sendJson(res, 500, { error: resetPlayersError.message || 'Failed to reset players.' })
      return
    }

    const { error: resetStateError } = await supabase
      .from('vpl_site_settings')
      .upsert({
        slug: 'auction_state',
        content: defaultAuctionState,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'slug' })

    if (resetStateError) {
      sendJson(res, 500, { error: resetStateError.message || 'Failed to reset auction state.' })
      return
    }

    sendJson(res, 200, { ok: true })
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

  if (req.method === 'PATCH' && /^\/api\/admin\/players\/[^/]+\/unverify$/.test(url.pathname)) {
    if (!isAuthorized(req)) {
      sendJson(res, 401, { error: 'Unauthorized' })
      return
    }

    const match = url.pathname.match(/^\/api\/admin\/players\/([^/]+)\/unverify$/)
    const id = decodeURIComponent(match?.[1] || '')
    if (!id) {
      sendJson(res, 400, { error: 'Invalid player id.' })
      return
    }

    const { data, error } = await supabase
      .from('vpl_players')
      .update({ is_verified: false })
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      sendJson(res, 500, { error: error.message || 'Failed to unverify player.' })
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

  if (req.method === 'PATCH' && /^\/api\/admin\/players\/[^/]+\/unblock-device$/.test(url.pathname)) {
    if (!isAuthorized(req)) {
      sendJson(res, 401, { error: 'Unauthorized' })
      return
    }

    const match = url.pathname.match(/^\/api\/admin\/players\/([^/]+)\/unblock-device$/)
    const id = decodeURIComponent(match?.[1] || '')
    if (!id) {
      sendJson(res, 400, { error: 'Invalid player id.' })
      return
    }

    const { data: player, error: playerError } = await supabase
      .from('vpl_players')
      .select('id, device_fingerprint')
      .eq('id', id)
      .single()

    if (playerError || !player) {
      sendJson(res, 404, { error: 'Player not found.' })
      return
    }

    const fingerprint = normalizeFingerprint(player.device_fingerprint)
    if (fingerprint) {
      const { error: unblockError } = await supabase
        .from('vpl_device_blocks')
        .delete()
        .eq('device_fingerprint', fingerprint)

      if (unblockError) {
        sendJson(res, 500, { error: unblockError.message || 'Failed to remove device block.' })
        return
      }
    }

    const { data, error } = await supabase
      .from('vpl_players')
      .update({ device_blocked_at: null })
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

  if (req.method === 'PATCH' && /^\/api\/admin\/players\/[^/]+$/.test(url.pathname)) {
    if (!isAuthorized(req)) {
      sendJson(res, 401, { error: 'Unauthorized' })
      return
    }

    const match = url.pathname.match(/^\/api\/admin\/players\/([^/]+)$/)
    const id = decodeURIComponent(match?.[1] || '')
    if (!id) {
      sendJson(res, 400, { error: 'Invalid player id.' })
      return
    }

    const body = await readJson(req, res)
    if (!body) return

    // Sanitization & Extraction of only allowed player fields
    const allowedFields = [
      'registration_id', 'name', 'phone', 'email', 'photo_url',
      'year', 'course', 'branch', 'section',
      'role', 'batting_side', 'bowling_arm', 'bowling_type',
      'utr_number', 'payment_screenshot_url', 'is_verified',
      'is_captain', 'sold_to', 'bid_amount', 'auction_status'
    ]

    const updatePayload = {}
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updatePayload[key] = body[key]
      }
    }

    if (Object.keys(updatePayload).length === 0) {
      sendJson(res, 400, { error: 'No fields to update.' })
      return
    }

    const { data, error } = await supabase
      .from('vpl_players')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      sendJson(res, 500, { error: error.message || 'Failed to update player.' })
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
  if (revokedTokens.has(token)) return false
  const payload = verifyJwt(token)
  if (!payload) return false
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
