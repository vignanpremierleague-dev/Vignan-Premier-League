import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { RefreshCw, Users, Search, Minus } from 'lucide-react'
import { AUCTION_STAGES, AUCTION_TYPES, formatCr, formatName } from '../lib/auction'
import SoldBanner from './SoldBanner'
import { C, ROLE_LABEL, StatBox, Tag, btnNeutral } from './tokens'

export default function PlayerPanel({ auctionState, activePlayer, currentBid, basePrice, soldCount, poolCount, loading, onRefresh, players, onSelectSpecificPlayer, onClear }) {
  const [searchQuery, setSearchQuery] = useState('')
  const isLive = auctionState.stage === AUCTION_STAGES.LIVE
  const isSold = auctionState.stage === AUCTION_STAGES.SOLD
  const isUnsold = auctionState.stage === AUCTION_STAGES.UNSOLD

  return (
    <section style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      borderRight: `1px solid ${C.border}`, overflow: 'hidden',
      background: C.bg,
    }}>
      {/* Top bar */}
      <div style={{
        padding: '13px 20px', borderBottom: `1px solid ${C.border}`,
        background: C.sidebar,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: '.95rem', color: C.text }}>Live Dashboard</div>
          <div style={{ fontSize: '.74rem', color: C.textMuted, marginTop: 1 }}>
            {auctionState.auction_type === AUCTION_TYPES.CAPTAINS ? 'Captains Draft' : 'Players Draft'}
            {' · '}
            <span style={{ color: isLive ? C.orange : C.textSub, fontWeight: 700, textTransform: 'uppercase' }}>
              {auctionState.stage}
            </span>
          </div>
        </div>
        <button
          style={{ ...btnNeutral, fontSize: '.78rem', padding: '7px 12px' }}
          onClick={onRefresh} disabled={loading}
        >
          <RefreshCw size={12} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        {[
          { label: 'Sold',        value: soldCount,           color: C.green },
          { label: 'Pool Left',   value: poolCount,           color: C.text  },
          { label: 'Current Bid', value: formatCr(currentBid),color: C.orange },
          { label: 'Base Price',  value: formatCr(basePrice), color: C.textSub },
        ].map((s, i) => (
          <div key={i} style={{
            flex: 1, padding: '10px 16px',
            borderRight: i < 3 ? `1px solid ${C.border}` : 'none',
            background: C.panel,
          }}>
            <div style={{ fontSize: '.62rem', fontWeight: 700, letterSpacing: '.1em', color: C.textMuted, textTransform: 'uppercase', marginBottom: 3 }}>{s.label}</div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Action Bar (Search & Clear) */}
      <div style={{ display: 'flex', gap: 12, padding: '12px 20px', borderBottom: `1px solid ${C.border}`, background: C.sidebar, position: 'relative', flexShrink: 0, alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={14} color={C.textMuted} style={{ position: 'absolute', left: 12, top: 10 }} />
          <input 
            type="text" 
            placeholder="Search player name or ID..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 34px', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, color: '#fff', fontSize: '.8rem', outline: 'none' }}
          />
          {searchQuery.length > 1 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, maxHeight: 200, overflowY: 'auto', background: '#1a1a1a', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, zIndex: 50, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
              {players?.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.registration_id && p.registration_id.toLowerCase().includes(searchQuery.toLowerCase()))).slice(0, 10).map(p => (
                <button
                  key={p.id}
                  onClick={() => { onSelectSpecificPlayer(p); setSearchQuery(''); }}
                  style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,.05)', color: p.auction_status === 'sold' ? '#888' : '#fff', fontSize: '.75rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontWeight: 600 }}>{formatName(p.name)} <span style={{ color: C.textMuted, fontSize: '.65rem', marginLeft: 6 }}>#{p.registration_id}</span></span>
                  <span style={{ fontSize: '.65rem', background: p.auction_status === 'sold' ? 'rgba(255,255,255,.1)' : 'rgba(255,107,34,.2)', color: p.auction_status === 'sold' ? '#aaa' : '#ff6b22', padding: '2px 6px', borderRadius: 4 }}>{p.auction_status === 'sold' ? 'SOLD' : 'AVAILABLE'}</span>
                </button>
              ))}
              {players?.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.registration_id && p.registration_id.toLowerCase().includes(searchQuery.toLowerCase()))).length === 0 && (
                <div style={{ padding: '12px', color: '#666', fontSize: '.75rem', textAlign: 'center' }}>No matches found.</div>
              )}
            </div>
          )}
        </div>
        
        {activePlayer && isLive && (
          <button
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,.1)', cursor: 'pointer', fontFamily: '"DM Sans"', fontWeight: 600, fontSize: '.8rem', background: 'transparent', color: '#8a8a8a', transition: 'all .15s', whiteSpace: 'nowrap' }}
            onClick={onClear} disabled={loading}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,.05)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#8a8a8a'; e.currentTarget.style.background = 'transparent' }}
          >
            <Minus size={14} />
            Clear Display
          </button>
        )}
      </div>

      {/* Player card area */}
      <div style={{ flex: 1, padding: '16px 20px 20px', overflow: 'hidden', display: 'flex' }}>
        {!activePlayer ? (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: C.panel, borderRadius: 10, border: `1px dashed ${C.border}`,
            color: C.textMuted, textAlign: 'center',
          }}>
            <Users size={36} style={{ marginBottom: 12, opacity: 0.25 }} />
            <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '.9rem', color: C.textSub }}>No player nominated</p>
            <p style={{ margin: 0, fontSize: '.78rem', color: C.textMuted }}>Use the sidebar to nominate the next player</p>
          </div>
        ) : (
          <div style={{
            flex: 1, background: C.panel, borderRadius: 10,
            border: `1px solid ${C.border}`, overflow: 'hidden',
            display: 'flex', position: 'relative',
          }}>
            {/* No absolute stamp overlay — handled inline below */}

            {/* Photo — fills full height */}
            <div style={{
              width: 370, flexShrink: 0,
              background: C.surface, borderRight: `1px solid ${C.border}`,
              position: 'relative', overflow: 'hidden',
            }}>
              {activePlayer.photo_url ? (
                <img
                  src={activePlayer.photo_url}
                  alt={activePlayer.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', inset: 0 }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={48} color={C.textMuted} style={{ opacity: 0.3 }} />
                </div>
              )}
              {/* ID badge */}
              <span style={{
                position: 'absolute', bottom: 12, left: 12,
                background: 'rgba(0,0,0,.8)', border: `1px solid ${C.border}`,
                color: C.textSub, fontSize: '.68rem', fontWeight: 700,
                padding: '4px 10px', borderRadius: 6, letterSpacing: '.05em', fontFamily: 'monospace',
              }}>
                #{activePlayer.registration_id}
              </span>
            </div>

            {/* Info */}
            <div style={{ flex: 1, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14, overflow: 'auto' }}>
              {/* Tags */}
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                <Tag color={C.orange} bg={C.orangeFaint} border={C.orangeBorder}>
                  {ROLE_LABEL[activePlayer.role] || activePlayer.role}
                </Tag>
                {activePlayer.is_captain && (
                  <Tag color={C.gold} bg="rgba(245,161,0,.1)" border="rgba(245,161,0,.28)">
                    ⭐ Captain
                  </Tag>
                )}
              </div>

              {/* Name */}
              <div>
                <h2 style={{ margin: '0 0 4px', fontWeight: 900, fontSize: '2rem', color: C.text, lineHeight: 1.1 }}>
                  {formatName(activePlayer.name)}
                </h2>
                <p style={{ margin: 0, fontSize: '.82rem', color: C.textSub }}>
                  Year {activePlayer.year} &bull; {activePlayer.branch} &bull; Sec {activePlayer.section}
                </p>
              </div>

              {/* Stat grid OR SoldBanner — animated swap */}
              <AnimatePresence mode="wait">
                {(isSold || isUnsold) ? (
                  <motion.div key="banner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                    <SoldBanner stage={auctionState.stage} soldTo={auctionState.sold_to} soldPrice={auctionState.sold_price} />
                  </motion.div>
                ) : (
                  <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                      <StatBox label="Base Price" value={formatCr(basePrice)} />
                      <StatBox label="Current Bid" value={formatCr(currentBid)} color={C.orange} />
                      <StatBox label="Stage" value={auctionState.stage.toUpperCase()} color={isLive ? C.orange : C.textSub} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <StatBox label="Batting" value={activePlayer.batting_side ? `${activePlayer.batting_side} Hand` : '—'} color={C.textSub} />
                      <StatBox label="Bowling" value={activePlayer.bowling_style || '—'} color={C.textSub} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
