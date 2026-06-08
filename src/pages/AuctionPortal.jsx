import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  fetchAdminPlayers, fetchAuctionState, fetchSiteSettings,
  resetAuction, updateAuctionState, updatePlayerDetails,
} from '../lib/adminApi'
import { fetchPublicAuctionState } from '../lib/publicApi'
import { supabase } from '../lib/supabase'
import {
  AUCTION_STAGES, AUCTION_TYPES, DEFAULT_AUCTION_STATE,
  buildRosterMap, clampCurrency, createRandomNomination,
  getAuctionConfig, getAvailableTeamsForSale,
  getPlayerBasePrice, getTeamsFromSettings, mergeAuctionState,
} from '../lib/auction'
import { readAuctionSnapshot, subscribeAuctionSnapshot, writeAuctionSnapshot } from '../lib/auctionSync'

import AuctionDisplay from '../auction/AuctionDisplay'
import ControlSidebar from '../auction/ControlSidebar'
import PlayerPanel from '../auction/PlayerPanel'
import SellDialog from '../auction/SellDialog'
import TeamPanel from '../auction/TeamPanel'
import { C } from '../auction/tokens'

export default function AuctionPortal({ mode = 'host' }) {
  const navigate = useNavigate()
  const token = localStorage.getItem('vpl_admin_token')
  const isHost = mode === 'host'

  const [players, setPlayers] = useState([])
  const [siteSettings, setSiteSettings] = useState(null)
  const [auctionState, setAuctionState] = useState(() =>
    mergeAuctionState(readAuctionSnapshot() || DEFAULT_AUCTION_STATE)
  )
  const [activePlayer, setActivePlayer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sellOpen, setSellOpen] = useState(false)
  const [bidStep, setBidStep] = useState(1)

  const channelRef = useRef(null)

  const playersRef = useRef([])
  useEffect(() => { playersRef.current = players }, [players])

  const teamNames   = useMemo(() => getTeamsFromSettings(siteSettings), [siteSettings])
  const rosterMap   = useMemo(() => buildRosterMap(players, teamNames), [players, teamNames])
  const auctionConfig = useMemo(() => getAuctionConfig(siteSettings), [siteSettings])

  const basePrice = useMemo(() => {
    if (!activePlayer)
      return auctionState.auction_type === AUCTION_TYPES.CAPTAINS
        ? auctionConfig.captainBasePrice : auctionConfig.playerBasePrice
    return getPlayerBasePrice(activePlayer, siteSettings)
  }, [activePlayer, auctionState.auction_type, auctionConfig, siteSettings])

  const currentBid = Math.max(clampCurrency(auctionState.current_bid), basePrice || 0)

  const resolveActivePlayer = useCallback((nextPlayers, nextState) => {
    const list = Array.isArray(nextPlayers) ? nextPlayers : playersRef.current
    const matched = nextState?.active_player_id ? list.find(p => p.id === nextState.active_player_id) : null
    const next = matched || nextState?.active_player || null
    setActivePlayer(prev => {
      if (!prev && !next) return null
      if (!prev || !next) return next
      if (prev.id === next.id) return prev
      return next
    })
  }, [])

  const applyState = useCallback((incoming, nextPlayers) => {
    const merged = mergeAuctionState(incoming)
    setAuctionState(merged)
    resolveActivePlayer(nextPlayers, merged)
  }, [resolveActivePlayer])

  const syncSnapshot = useCallback(incoming => {
    const merged = mergeAuctionState(incoming)
    setAuctionState(merged)
    resolveActivePlayer(undefined, merged)
  }, [resolveActivePlayer])

  const loadAll = useCallback(async () => {
    if (!token) { navigate('/admin'); return }
    setLoading(true); setError('')
    try {
      const [playersRes, stateRes, settingsRes] = await Promise.all([
        fetchAdminPlayers(token), fetchAuctionState(token), fetchSiteSettings(),
      ])
      const verified = (playersRes.players || []).filter(p => p.is_verified)
      setPlayers(verified)
      setSiteSettings(settingsRes)
      applyState(stateRes || DEFAULT_AUCTION_STATE, verified)
      writeAuctionSnapshot(mergeAuctionState(stateRes || DEFAULT_AUCTION_STATE))
    } catch (err) { setError(err.message || 'Failed to load.') }
    finally { setLoading(false) }
  }, [applyState, navigate, token])

  const loadDisplay = useCallback(async (initial = false) => {
    if (initial) setLoading(true)
    try {
      const [stateRes, settingsRes] = await Promise.all([fetchPublicAuctionState(), fetchSiteSettings()])
      setSiteSettings(settingsRes)
      applyState(stateRes || DEFAULT_AUCTION_STATE, [])
      writeAuctionSnapshot(mergeAuctionState(stateRes || DEFAULT_AUCTION_STATE))
    } catch (err) { setError(err.message || 'Sync failed.') }
    finally { if (initial) setLoading(false) }
  }, [applyState])

  useEffect(() => {
    if (isHost) loadAll()
    else {
      const snap = readAuctionSnapshot()
      if (snap) { applyState(snap, []); setLoading(false) }
      loadDisplay(true)
    }
  }, [isHost, loadAll, loadDisplay, applyState])

  useEffect(() => subscribeAuctionSnapshot(syncSnapshot), [syncSnapshot])

  useEffect(() => {
    if (!supabase) return
    const channel = supabase.channel('public-auction')
    
    if (!isHost) {
      channel.on('broadcast', { event: 'state-update' }, ({ payload }) => {
        applyState(payload, [])
      })
    }
    
    channel.subscribe()
    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [isHost, applyState])

  const persist = useCallback(async patch => {
    const next = mergeAuctionState({ ...auctionState, ...patch, last_event_at: new Date().toISOString() })
    setAuctionState(next)
    resolveActivePlayer(undefined, next)
    writeAuctionSnapshot(next)
    
    if (channelRef.current) {
      const active_player = next.active_player_id ? playersRef.current.find(p => p.id === next.active_player_id) : null
      channelRef.current.send({
        type: 'broadcast',
        event: 'state-update',
        payload: { ...next, active_player }
      }).catch(() => {})
    }

    if (isHost) {
      try { await updateAuctionState(token, next) }
      catch (err) { setError(err.message || 'Sync failed.') }
    }
    return next
  }, [auctionState, isHost, resolveActivePlayer, token])

  const switchType = async type => {
    setSellOpen(false)
    await persist({ auction_type: type, stage: AUCTION_STAGES.IDLE, active_player_id: null, current_bid: 0, sold_to: null, sold_price: 0 })
    setActivePlayer(null)
  }

  const nominateNext = async () => {
    const selected = createRandomNomination(players, auctionState.auction_type, activePlayer?.id || null)
    if (!selected) {
      await persist({ stage: AUCTION_STAGES.COMPLETED, active_player_id: null, current_bid: 0, sold_to: null, sold_price: 0 })
      setActivePlayer(null)
      return
    }
    setSellOpen(false)
    setActivePlayer(selected)
    await persist({ active_player_id: selected.id, current_bid: getPlayerBasePrice(selected, siteSettings), sold_to: null, sold_price: 0, stage: AUCTION_STAGES.LIVE })
  }

  const updateBid = async val => {
    if (!activePlayer) return
    await persist({ current_bid: Math.max(basePrice, clampCurrency(val)) })
  }

  const availableTeams = useMemo(
    () => getAvailableTeamsForSale(rosterMap, auctionState.auction_type, currentBid),
    [auctionState.auction_type, currentBid, rosterMap]
  )

  const markSold = async teamName => {
    if (!activePlayer || !token) return
    if (!availableTeams.find(t => t.teamName === teamName)) { setError('Team not eligible.'); return }
    try {
      setLoading(true)
      const finalPrice = Math.max(basePrice, currentBid)
      const { player: updated } = await updatePlayerDetails(token, activePlayer.id, {
        sold_to: teamName, bid_amount: finalPrice, auction_status: 'sold',
      })
      setPlayers(prev => prev.map(p => p.id === updated.id ? updated : p))
      await persist({ sold_to: teamName, sold_price: finalPrice, current_bid: finalPrice, stage: AUCTION_STAGES.SOLD })
      setSellOpen(false)
    } catch (err) { setError(err.message || 'Failed.') }
    finally { setLoading(false) }
  }

  const handleReset = async () => {
    if (!window.confirm('Reset entire auction? All sales will be cleared.')) return
    try {
      setLoading(true)
      await resetAuction(token)
      await loadAll()
      setSellOpen(false); setActivePlayer(null)
      const fresh = DEFAULT_AUCTION_STATE
      setAuctionState(fresh)
      writeAuctionSnapshot(fresh)
    } catch (err) { setError(err.message || 'Reset failed.') }
    finally { setLoading(false) }
  }

  const soldCount = players.filter(p => p.auction_status === 'sold').length
  const poolCount = players.filter(p => {
    const ok = auctionState.auction_type === AUCTION_TYPES.CAPTAINS ? p.is_captain : !p.is_captain
    return ok && p.auction_status !== 'sold' && p.auction_status !== 'unsold'
  }).length

  /* Display mode */
  if (!isHost) {
    return (
      <AuctionDisplay
        auctionState={auctionState}
        activePlayer={activePlayer}
        currentBid={currentBid}
        basePrice={basePrice}
        siteSettings={siteSettings}
      />
    )
  }

  /* Host mode — 3-column */
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', background: C.bg, color: C.text, fontFamily: '"DM Sans",system-ui,sans-serif', overflow: 'hidden' }}>

      <ControlSidebar
        auctionType={auctionState.auction_type}
        stage={auctionState.stage}
        activePlayer={activePlayer}
        currentBid={currentBid}
        basePrice={basePrice}
        bidStep={bidStep}
        loading={loading}
        isPublic={auctionState.is_public_visible ?? true}
        onSwitchType={switchType}
        onNominate={nominateNext}
        onBidChange={updateBid}
        onBidStep={setBidStep}
        onAdjust={delta => updateBid(currentBid + delta)}
        onTogglePublic={() => persist({ is_public_visible: !(auctionState.is_public_visible ?? true) })}
        onSellOpen={() => setSellOpen(true)}
        onReset={handleReset}
        onDisplayOpen={() => window.open('/auction-display', '_blank')}
        onBack={() => navigate('/dboard')}
      />

      <PlayerPanel
        auctionState={auctionState}
        activePlayer={activePlayer}
        currentBid={currentBid}
        basePrice={basePrice}
        soldCount={soldCount}
        poolCount={poolCount}
        loading={loading}
        onRefresh={loadAll}
      />

      <TeamPanel
        teamNames={teamNames}
        rosterMap={rosterMap}
      />

      {error && (
        <div style={{
          position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          background: '#1a0a0a', border: `1px solid ${C.dangerBorder}`, borderRadius: 9,
          padding: '10px 20px', color: C.danger, fontSize: '.84rem', fontWeight: 600,
          display: 'flex', gap: 12, alignItems: 'center', zIndex: 300,
          boxShadow: '0 8px 24px rgba(0,0,0,.5)',
        }}>
          ⚠ {error}
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: C.danger, cursor: 'pointer', fontWeight: 800 }}>✕</button>
        </div>
      )}

      <SellDialog
        open={sellOpen}
        player={activePlayer}
        currentBid={currentBid}
        availableTeams={availableTeams}
        onSell={markSold}
        onClose={() => setSellOpen(false)}
      />

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
