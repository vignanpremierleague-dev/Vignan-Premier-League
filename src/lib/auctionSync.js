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
