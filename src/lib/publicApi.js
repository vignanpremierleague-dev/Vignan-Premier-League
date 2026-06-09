const BASE = (import.meta.env.VITE_ADMIN_API_BASE || '/api').replace(/\/$/, '')

async function request(path, { method = 'GET', body } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const payload = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(payload.error || 'Request failed.')
  return payload
}

export function fetchPublicAccessStatus(fingerprint) {
  return request('/public/access-status', {
    method: 'POST',
    body: { fingerprint },
  })
}

export function submitPlayerRegistration(payload) {
  return request('/public/register', {
    method: 'POST',
    body: payload,
  })
}

export async function fetchPublicAuctionState() {
  const res = await request('/public/auction/state')
  return res.state || null  // unwrap: server returns { state: {...} }
}

export async function fetchPublicPlayers() {
  const res = await request('/public/players')
  return res.players || []
}
