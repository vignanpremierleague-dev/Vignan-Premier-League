import { useState, useEffect } from 'react'
import { Gavel, Users, Trophy, TrendingUp } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { fetchPublicPlayers } from '../lib/publicApi'
import { formatCr, formatName } from '../lib/auction'
import { ROLE_LABEL, ROLE_COLOR } from '../auction/tokens'

const CACHE_KEY = 'vpl_auction_results_cache'
const CACHE_TTL = 3 * 60 * 1000 // 3 minutes

// Role rank for tiebreaking display (captains first)
const ROLE_ORDER = { captains: 0, batsman: 1, all_rounder: 2, bowler: 3, wicket_keeper_batsman: 4 }

function useFadeIn(delay = 0) {
  const [v, setV] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setV(true), delay)
    return () => clearTimeout(t)
  }, [delay])
  return v
}

function RankBadge({ rank }) {
  if (rank === 1) return (
    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#f5a100,#ff6b22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 16px rgba(245,161,0,.4)' }}>
      <Trophy size={16} color="#fff" />
    </div>
  )
  if (rank === 2) return (
    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#9ca3af,#d1d5db)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontWeight: 900, fontSize: '.85rem', color: '#111' }}>2</span>
    </div>
  )
  if (rank === 3) return (
    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#b45309,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontWeight: 900, fontSize: '.85rem', color: '#fff' }}>3</span>
    </div>
  )
  return (
    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontWeight: 700, fontSize: '.8rem', color: '#6a6a6a' }}>{rank}</span>
    </div>
  )
}

function PlayerCard({ player, rank, index }) {
  const [imgError, setImgError] = useState(false)
  const visible = useFadeIn(80 + index * 45)
  const roleColor = ROLE_COLOR[player.role] || '#ff6b22'
  const roleLabel = ROLE_LABEL[player.role] || player.role || 'Player'
  const isTopThree = rank <= 3

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      transition: 'opacity .5s ease, transform .5s ease',
      background: isTopThree ? 'rgba(255,107,34,.04)' : '#111',
      border: `1px solid ${isTopThree ? 'rgba(255,107,34,.18)' : '#1e1e1e'}`,
      borderRadius: 14,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '"DM Sans",system-ui,sans-serif',
      position: 'relative',
    }}>
      {/* Rank glow for top 3 */}
      {isTopThree && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: rank === 1
            ? 'linear-gradient(90deg,#f5a100,#ff6b22,#f5a100)'
            : rank === 2
            ? 'linear-gradient(90deg,#9ca3af,#d1d5db,#9ca3af)'
            : 'linear-gradient(90deg,#b45309,#d97706,#b45309)',
        }} />
      )}

      {/* Photo */}
      <div style={{ position: 'relative', aspectRatio: '3/4', background: '#0d0d0d', overflow: 'hidden' }}>
        {player.photo_url && !imgError ? (
          <img
            src={player.photo_url}
            alt={player.name}
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={48} color="#2a2a2a" />
          </div>
        )}

        {/* Gradient overlay at bottom */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%', background: 'linear-gradient(to top,rgba(0,0,0,.92) 0%,transparent 100%)' }} />

        {/* Role badge — top left */}
        <span style={{
          position: 'absolute', top: 10, left: 10,
          background: `${roleColor}22`, backdropFilter: 'blur(8px)',
          border: `1px solid ${roleColor}44`,
          color: roleColor, fontSize: '.62rem', fontWeight: 700,
          padding: '3px 9px', borderRadius: 20,
          letterSpacing: '.06em', textTransform: 'uppercase',
        }}>
          {roleLabel}
        </span>

        {/* Rank badge — top right */}
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <RankBadge rank={rank} />
        </div>

        {/* Price overlay — bottom */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 14px' }}>
          <div style={{ fontWeight: 900, fontSize: '1.5rem', color: '#ff6b22', lineHeight: 1, textShadow: '0 2px 8px rgba(0,0,0,.8)' }}>
            {formatCr(player.bid_amount)}
          </div>
          <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(255,107,34,.7)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
            Final Bid
          </div>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '14px 14px 16px' }}>
        <div style={{ fontWeight: 800, fontSize: '.95rem', color: '#efefef', marginBottom: 4, lineHeight: 1.2, textTransform: 'capitalize' }}>
          {formatName(player.name)}
          {player.is_captain && <span style={{ color: '#f5a100', marginLeft: 5 }}>★</span>}
        </div>
        <div style={{ fontSize: '.7rem', color: '#5a5a5a', marginBottom: 10 }}>
          Year {player.year} · {player.branch?.toUpperCase?.()} · {player.section?.toUpperCase?.()}
        </div>

        {/* Team sold to */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '8px 10px', borderRadius: 8,
          background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', flexShrink: 0 }} />
          <span style={{ fontSize: '.72rem', fontWeight: 700, color: '#9a9a9a', letterSpacing: '.05em', textTransform: 'uppercase', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {player.sold_to}
          </span>
        </div>
      </div>
    </div>
  )
}

// Hero top-3 podium for largest screens
function PodiumCard({ player, rank }) {
  const [imgError, setImgError] = useState(false)
  const visible = useFadeIn(rank * 120)
  const roleColor = ROLE_COLOR[player.role] || '#ff6b22'
  const roleLabel = ROLE_LABEL[player.role] || player.role

  const heights = { 1: 340, 2: 290, 3: 260 }
  const h = heights[rank] || 260

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(.97)',
      transition: 'all .6s cubic-bezier(.16,1,.3,1)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      width: rank === 1 ? 200 : 170,
    }}>
      {/* Photo */}
      <div style={{
        width: rank === 1 ? 130 : 106,
        height: rank === 1 ? 130 : 106,
        borderRadius: '50%', overflow: 'hidden',
        border: `3px solid ${rank === 1 ? '#f5a100' : rank === 2 ? '#9ca3af' : '#b45309'}`,
        boxShadow: `0 0 ${rank === 1 ? 24 : 12}px ${rank === 1 ? 'rgba(245,161,0,.35)' : 'rgba(0,0,0,.4)'}`,
        background: '#111', marginBottom: 12, flexShrink: 0,
      }}>
        {player.photo_url && !imgError
          ? <img src={player.photo_url} alt={player.name} onError={() => setImgError(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={32} color="#333" /></div>
        }
      </div>

      {/* Info */}
      <div style={{ textAlign: 'center', marginBottom: 10, width: '100%' }}>
        <div style={{ fontWeight: 900, fontSize: rank === 1 ? '.95rem' : '.86rem', color: '#efefef', textTransform: 'capitalize', lineHeight: 1.2 }}>
          {formatName(player.name)}{player.is_captain && <span style={{ color: '#f5a100' }}> ★</span>}
        </div>
        <div style={{ fontSize: '.62rem', fontWeight: 700, color: roleColor, letterSpacing: '.06em', textTransform: 'uppercase', marginTop: 3 }}>{roleLabel}</div>
        <div style={{ fontSize: '.68rem', color: '#5a5a5a', marginTop: 2 }}>{player.sold_to}</div>
      </div>

      {/* Podium block */}
      <div style={{
        width: '100%', height: h, borderRadius: '10px 10px 0 0',
        background: rank === 1
          ? 'linear-gradient(180deg,rgba(245,161,0,.18) 0%,rgba(245,161,0,.06) 100%)'
          : rank === 2
          ? 'linear-gradient(180deg,rgba(156,163,175,.12) 0%,rgba(156,163,175,.04) 100%)'
          : 'linear-gradient(180deg,rgba(180,83,9,.12) 0%,rgba(180,83,9,.04) 100%)',
        border: `1px solid ${rank === 1 ? 'rgba(245,161,0,.25)' : rank === 2 ? 'rgba(156,163,175,.2)' : 'rgba(180,83,9,.2)'}`,
        borderBottom: 'none',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
        paddingTop: 20,
      }}>
        <div style={{ fontWeight: 900, fontSize: rank === 1 ? '1.7rem' : '1.3rem', color: rank === 1 ? '#f5a100' : rank === 2 ? '#d1d5db' : '#d97706' }}>
          {formatCr(player.bid_amount)}
        </div>
        <div style={{ fontSize: '.58rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#4a4a4a', marginTop: 4 }}>
          #{rank === 1 ? '1st' : rank === 2 ? '2nd' : '3rd'}
        </div>
      </div>
    </div>
  )
}

export default function AuctionResults() {
  const headVis = useFadeIn(60)
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastRefreshed, setLastRefreshed] = useState(null)

  const loadData = async () => {
    setLoading(true)

    try {
      const now = Date.now()
      let data = null

      try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY))
        if (cached && cached.timestamp && (now - cached.timestamp < CACHE_TTL)) {
          data = cached.players
          setLastRefreshed(new Date(cached.timestamp))
        }
      } catch (_) {}

      if (!data) {
        data = await fetchPublicPlayers()
        localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: now, players: data }))
        setLastRefreshed(new Date(now))
      }

      const sold = data
        .filter(p => p.auction_status === 'sold' && p.sold_to)
        .sort((a, b) => Number(b.bid_amount) - Number(a.bid_amount))

      setPlayers(sold)
    } catch (err) {
      console.error('Failed to load results:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const top3    = players.slice(0, 3)
  const rest    = players.slice(3)

  return (
    <div style={{
      minHeight: '100vh', background: '#070707',
      fontFamily: '"DM Sans",system-ui,sans-serif', color: '#efefef',
      display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient orbs */}
      <div style={{ position: 'fixed', top: '-10%', right: '-6%', width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,107,34,.06) 0%,transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-8%', left: '-8%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(59,130,246,.04) 0%,transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />

      <Navbar breadcrumb="Auction Results" />

      <main style={{ flex: 1, maxWidth: 1180, width: '100%', margin: '0 auto', padding: '52px 20px 80px', position: 'relative', zIndex: 1 }}>

        {/* Page header */}
        <div style={{
          opacity: headVis ? 1 : 0, transform: headVis ? 'translateY(0)' : 'translateY(-18px)',
          transition: 'all .6s ease', textAlign: 'center', marginBottom: 56,
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 20, background: 'rgba(255,107,34,.08)', border: '1px solid rgba(255,107,34,.18)', marginBottom: 18 }}>
            <TrendingUp size={13} color="#ff6b22" />
            <span style={{ fontSize: '.65rem', fontWeight: 700, color: '#ff6b22', letterSpacing: '.12em', textTransform: 'uppercase' }}>Most Expensive Picks</span>
          </div>
          <h1 style={{ fontFamily: '"Syne",sans-serif', fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 900, margin: '0 0 12px', color: '#fff', lineHeight: 1.1 }}>
            Auction <span style={{ color: '#ff6b22' }}>Results</span>
          </h1>
          <p style={{ color: '#5a5a5a', fontSize: '.88rem', lineHeight: 1.7, maxWidth: 440, margin: '0 auto 16px' }}>
            Players ranked by their final bid price — the biggest purchases from the VPL auction floor.
          </p>

          {!loading && (
            <div style={{ fontSize: '.68rem', color: '#444' }}>
              {players.length} players sold
              {lastRefreshed && ` · Updated ${lastRefreshed.toLocaleTimeString()}`}
            </div>
          )}

          <div style={{ width: 48, height: 3, background: 'linear-gradient(90deg,#ff6b22,#e63946)', borderRadius: 2, margin: '20px auto 0' }} />
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 16 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 14, background: '#111', border: '1px solid #1a1a1a', overflow: 'hidden', animation: 'pulse 1.5s ease-in-out infinite' }}>
                <div style={{ aspectRatio: '3/4', background: '#161616' }} />
                <div style={{ padding: '14px 14px 16px' }}>
                  <div style={{ height: 14, background: '#1a1a1a', borderRadius: 4, marginBottom: 8, width: '75%' }} />
                  <div style={{ height: 10, background: '#161616', borderRadius: 4, width: '50%' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && players.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', border: '1px dashed rgba(255,255,255,.06)', borderRadius: 20 }}>
            <Gavel size={48} color="#2a2a2a" style={{ marginBottom: 20 }} />
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#4a4a4a', marginBottom: 8 }}>No Results Yet</div>
            <p style={{ fontSize: '.85rem', color: '#333', maxWidth: 320, margin: '0 auto' }}>
              The auction hasn't concluded yet. Check back once bidding is complete.
            </p>
          </div>
        )}

        {/* ── Top 3 Podium ── */}
        {!loading && top3.length >= 2 && (
          <div style={{ marginBottom: 64 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 0 }} className="podium-row">
              {/* 2nd */}
              {top3[1] && <PodiumCard player={top3[1]} rank={2} />}
              {/* 1st — centre */}
              {top3[0] && <PodiumCard player={top3[0]} rank={1} />}
              {/* 3rd */}
              {top3[2] && <PodiumCard player={top3[2]} rank={3} />}
            </div>
          </div>
        )}

        {/* ── Rest of the grid ── */}
        {!loading && players.length > 0 && (
          <>
            {rest.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#3a3a3a' }}>
                  Other Top Picks
                </div>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.05)' }} />
              </div>
            )}

            <div className="results-grid">
              {(rest.length > 0 ? rest : players).map((player, i) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  rank={rest.length > 0 ? i + 4 : i + 1}
                  index={i}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />

      <style>{`
        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 16px;
        }
        .podium-row {
          gap: 0;
        }
        @media (max-width: 600px) {
          .results-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .podium-row {
            overflow-x: auto;
            padding-bottom: 12px;
            justify-content: flex-start;
            gap: 8px;
          }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
