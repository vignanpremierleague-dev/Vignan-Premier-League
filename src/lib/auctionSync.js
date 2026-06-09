const SNAPSHOT_KEY = 'vpl_auction_snapshot_v2'
const CHANNEL_NAME = 'vpl-auction-sync'

let channel = null

function getChannel() {
  if (typeof window === 'undefined' || typeof window.BroadcastChannel === 'undefined') return null
  if (!channel) channel = new BroadcastChannel(CHANNEL_NAME)
  return channel
}

export function readAuctionSnapshot() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(SNAPSHOT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function writeAuctionSnapshot(state) {
  if (typeof window === 'undefined') return
  const payload = JSON.stringify(state)
  window.localStorage.setItem(SNAPSHOT_KEY, payload)
  const activeChannel = getChannel()
  activeChannel?.postMessage(state)
}

export function subscribeAuctionSnapshot(listener) {
  if (typeof window === 'undefined') return () => {}

  const handleStorage = (event) => {
    if (event.key !== SNAPSHOT_KEY || !event.newValue) return
    try {
      listener(JSON.parse(event.newValue))
    } catch {
      // Ignore malformed snapshots.
    }
  }

  const activeChannel = getChannel()
  const handleMessage = (event) => {
    if (event?.data) listener(event.data)
  }

  window.addEventListener('storage', handleStorage)
  activeChannel?.addEventListener('message', handleMessage)

  return () => {
    window.removeEventListener('storage', handleStorage)
    activeChannel?.removeEventListener('message', handleMessage)
  }
}
const DISPLAY_PLAYER_KEY = 'vpl_display_active_player_v1'

/** Cache the active player object on the display side for refresh persistence. */
export function cacheDisplayPlayer(player) {
  if (typeof window === 'undefined') return
  try {
    if (player) window.localStorage.setItem(DISPLAY_PLAYER_KEY, JSON.stringify(player))
    else window.localStorage.removeItem(DISPLAY_PLAYER_KEY)
  } catch { /* ignore */ }
}

/**
 * Return the cached player only if its ID matches the given activePlayerId.
 * This prevents showing stale data after the host moves to a new player.
 */
export function readCachedDisplayPlayer(activePlayerId) {
  if (typeof window === 'undefined' || !activePlayerId) return null
  try {
    const raw = window.localStorage.getItem(DISPLAY_PLAYER_KEY)
    if (!raw) return null
    const player = JSON.parse(raw)
    return player?.id === activePlayerId ? player : null
  } catch {
    return null
  }
}
