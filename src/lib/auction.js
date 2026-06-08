export const AUCTION_TYPES = {
  CAPTAINS: 'captains',
  PLAYERS: 'players',
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
  return auctionType === AUCTION_TYPES.CAPTAINS ? 'VPL Captains Auction' : 'VPL Players Auction'
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
    const matchesType = auctionType === AUCTION_TYPES.CAPTAINS ? Boolean(player.is_captain) : !player.is_captain
    return matchesType && player.auction_status !== 'sold' && player.auction_status !== 'unsold'
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
  return Math.max(0, Math.round(safeNumber(value)))
}
