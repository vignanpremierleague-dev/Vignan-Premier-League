const BASE = (import.meta.env.VITE_ADMIN_API_BASE || '/api').replace(/\/$/, '')

async function request(path, { method = 'GET', token, body } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const payload = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(payload.error || 'Request failed.')
  return payload
}

export function loginAdmin(username, password) {
  return request('/admin/login', {
    method: 'POST',
    body: { username, password },
  })
}

export function fetchAdminPlayers(token) {
  return request('/admin/players', { token })
}

export function verifyAdminPlayer(token, id) {
  return request(`/admin/players/${id}/verify`, {
    method: 'PATCH',
    token,
  })
}

export function logoutAdmin(token) {
  return request('/admin/logout', {
    method: 'POST',
    token,
  })
}
