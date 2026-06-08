import { AnimatePresence } from 'framer-motion'
import { RefreshCw, Users } from 'lucide-react'
import { AUCTION_STAGES, AUCTION_TYPES, formatCr } from '../lib/auction'
import SoldStamp from './SoldStamp'
import { C, ROLE_LABEL, StatBox, Tag, btnNeutral } from './tokens'

export default function PlayerPanel({ auctionState, activePlayer, currentBid, basePrice, soldCount, poolCount, loading, onRefresh }) {
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

      {/* Player card area */}
      <div style={{ flex: 1, padding: 20, overflow: 'hidden', display: 'flex' }}>
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
            {/* Sold / Unsold stamp */}
            <AnimatePresence>
              {(isSold || isUnsold) && (
                <SoldStamp stage={auctionState.stage} soldTo={auctionState.sold_to} soldPrice={auctionState.sold_price} />
              )}
            </AnimatePresence>

            {/* Photo — clear square block */}
            <div style={{
              width: 300, flexShrink: 0,
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
                position: 'absolute', bottom: 10, left: 10,
                background: 'rgba(0,0,0,.75)', border: `1px solid ${C.border}`,
                color: C.textSub, fontSize: '.68rem', fontWeight: 700,
                padding: '3px 8px', borderRadius: 5, letterSpacing: '.05em',
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
                <h2 style={{ margin: '0 0 5px', fontWeight: 800, fontSize: '1.7rem', color: C.text, lineHeight: 1.1 }}>
                  {activePlayer.name}
                </h2>
                <p style={{ margin: 0, fontSize: '.82rem', color: C.textSub }}>
                  Year {activePlayer.year} &bull; {activePlayer.branch} &bull; Sec {activePlayer.section}
                </p>
              </div>

              {/* Stat grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                <StatBox label="Base Price" value={formatCr(basePrice)} />
                <StatBox label="Current Bid" value={formatCr(currentBid)} color={C.orange} />
                <StatBox label="Stage" value={auctionState.stage.toUpperCase()} color={isLive ? C.orange : C.textSub} />
              </div>

              {/* Secondary info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <StatBox label="Batting" value={activePlayer.batting_side ? `${activePlayer.batting_side} Hand` : '—'} color={C.textSub} />
                <StatBox label="Bowling" value={activePlayer.bowling_style || '—'} color={C.textSub} />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
