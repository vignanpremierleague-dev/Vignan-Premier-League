export const AUCTION_TYPES = {
  CAPTAINS:      'captains',
  ALL_ROUNDERS:  'all_rounders',
  BATSMEN:       'batsmen',
  BOWLERS:       'bowlers',
  WICKET_KEEPERS:'wicket_keepers',
  // Legacy alias kept for backward-compat
  PLAYERS:       'players',
}

/** Maps non-captain auction types to the player role they filter on */
export const AUCTION_TYPE_ROLE = {
  all_rounders:   'all_rounder',
  batsmen:        'batsman',
  bowlers:        'bowler',
  wicket_keepers: 'wicket_keeper_batsman',
}

/** Human-readable label for each auction type */
export const AUCTION_TYPE_LABEL = {
  captains:       'Captains',
  all_rounders:   'All Rounders',
  batsmen:        'Batsmen',
  bowlers:        'Bowlers',
  wicket_keepers: 'Wicket Keepers',
  players:        'Players',
}

/** Color per auction type — matches ROLE_COLOR in tokens.jsx */
export const AUCTION_TYPE_COLOR = {
  captains:       '#f5a100',
  all_rounders:   '#10b981',
  batsmen:        '#3b82f6',
  bowlers:        '#ef4444',
  wicket_keepers: '#8b5cf6',
  players:        '#ff6b22',
}

export const AUCTION_STAGES = {
  IDLE: 'idle',
  LIVE: 'live',
  SOLD: 'sold',
  UNSOLD: 'unsold',
  COMPLETED: 'completed',
}

export const TEAM_PURSE_LIMIT = 100
export const TEAM_SQUAD_LIMIT = 12
export const TEAM_CAPTAIN_LIMIT = 1

export const DEFAULT_AUCTION_STATE = {
  auction_type: AUCTION_TYPES.CAPTAINS,
  stage: AUCTION_STAGES.IDLE,
  active_player_id: null,
  current_bid: 0,
  sold_to: null,
  sold_price: 0,
  display_title: 'VPL Captains Auction',
  nomination_order: [],
  last_event_at: null,
  is_public_visible: true,
}

export function getAuctionConfig(settings) {
  const config = settings?.auctionConfig || {}
  return {
    captainBasePrice: safeNumber(config.captainBasePrice) || 3,
    playerBasePrice: safeNumber(config.playerBasePrice) || 1,
    playerBasePriceOverrides: typeof config.playerBasePriceOverrides === 'object' && config.playerBasePriceOverrides
      ? config.playerBasePriceOverrides
      : {},
  }
}

export function getAuctionTitle(auctionType) {
  const labels = {
    captains:       'VPL Captains Auction',
    all_rounders:   'VPL All-Rounders Auction',
    batsmen:        'VPL Batsmen Auction',
    bowlers:        'VPL Bowlers Auction',
    wicket_keepers: 'VPL Wicket-Keepers Auction',
    players:        'VPL Players Auction',
  }
  return labels[auctionType] || 'VPL Auction'
}

export function getTeamsFromSettings(settings) {
  const groups = [settings?.teams?.A, settings?.teams?.B]
  return groups
    .flatMap((group) => (Array.isArray(group) ? group : []))
    .map((team) => team?.name?.trim())
    .filter(Boolean)
}

export function buildRosterMap(players, teamNames) {
  return teamNames.reduce((acc, teamName) => {
    const roster = players.filter((player) => player.sold_to === teamName)
    const captain = roster.find((player) => player.is_captain) || null
    const spend = roster.reduce((sum, player) => sum + safeNumber(player.bid_amount), 0)
    acc[teamName] = {
      teamName,
      roster,
      captain,
      spend,
      remainingPurse: clampCurrency(TEAM_PURSE_LIMIT - spend),
      squadCount: roster.length,
      captainCount: captain ? 1 : 0,
      slotsLeft: Math.max(TEAM_SQUAD_LIMIT - roster.length, 0),
    }
    return acc
  }, {})
}

export function getEligiblePlayers(players, auctionType) {
  return players.filter((player) => {
    if (auctionType === AUCTION_TYPES.CAPTAINS) {
      return Boolean(player.is_captain)
        && player.auction_status !== 'sold'
        && player.auction_status !== 'unsold'
    }
    // For role-specific categories filter by role; for legacy PLAYERS type show all non-captains
    const role = AUCTION_TYPE_ROLE[auctionType]
    const matchesRole = role ? player.role === role : !player.is_captain
    return matchesRole
      && !player.is_captain
      && player.auction_status !== 'sold'
      && player.auction_status !== 'unsold'
  })
}

export function getAvailableTeamsForSale(rosterMap, auctionType, finalPrice) {
  return Object.values(rosterMap).filter((team) => {
    if (team.remainingPurse < finalPrice) return false
    if (team.squadCount >= TEAM_SQUAD_LIMIT) return false
    if (auctionType === AUCTION_TYPES.CAPTAINS && team.captainCount >= TEAM_CAPTAIN_LIMIT) return false
    return true
  })
}

export function createRandomNomination(players, auctionType, excludeId = null) {
  const pool = getEligiblePlayers(players, auctionType).filter((player) => player.id !== excludeId)
  if (!pool.length) return null
  const index = Math.floor(Math.random() * pool.length)
  return pool[index]
}

export function mergeAuctionState(partial) {
  return {
    ...DEFAULT_AUCTION_STATE,
    ...partial,
    current_bid: safeNumber(partial?.current_bid),
    sold_price: safeNumber(partial?.sold_price),
    nomination_order: Array.isArray(partial?.nomination_order) ? partial.nomination_order : [],
    display_title: partial?.display_title || getAuctionTitle(partial?.auction_type || DEFAULT_AUCTION_STATE.auction_type),
    is_public_visible: partial?.is_public_visible ?? true,
  }
}

export function getPlayerBasePrice(player, settings) {
  const config = getAuctionConfig(settings)
  const override = config.playerBasePriceOverrides?.[player?.id]
  if (override !== undefined && override !== null && override !== '') {
    return clampCurrency(override)
  }
  return player?.is_captain ? config.captainBasePrice : config.playerBasePrice
}

export function formatCr(value) {
  const amount = safeNumber(value)
  const fixed = amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2).replace(/\.?0+$/, '')
  return `${fixed} Cr`
}

export function safeNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

export function clampCurrency(value) {
  // Allow up to 2 decimal places to support 0.25 / 0.50 Cr bid steps
  return Math.max(0, Math.round(safeNumber(value) * 100) / 100)
}
