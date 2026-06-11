import { AnimatePresence, motion } from 'framer-motion'
import { Users, Gavel } from 'lucide-react'
import { AUCTION_STAGES, formatCr } from '../../lib/auction'
import SoldBanner from '../SoldBanner'
import { C, ROLE_LABEL } from '../tokens'

// ── Bid row shown when auction is live / idle ────────────────────────────────
function BidRow({ basePrice, currentBid }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <div style={{ padding: '14px 16px', borderRadius: 0, background: C.surface, borderTop: `1px solid ${C.border}` }}>
        <div style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '.1em', color: C.textMuted, textTransform: 'uppercase', marginBottom: 5 }}>Base Price</div>
        <div style={{ fontWeight: 800, fontSize: '1.2rem', color: C.text }}>{formatCr(basePrice)}</div>
      </div>
      <div style={{ padding: '14px 16px', borderRadius: 0, background: C.orangeFaint, borderTop: `1px solid ${C.orangeBorder}` }}>
        <div style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '.1em', color: C.orange, textTransform: 'uppercase', marginBottom: 5, opacity: 0.8 }}>Current Bid</div>
        <div style={{ fontWeight: 900, fontSize: '1.2rem', color: C.orange }}>{formatCr(currentBid)}</div>
      </div>
    </div>
  )
}

// ── Full-bleed player layout ─────────────────────────────────────────────────
function PlayerCard({ activePlayer, currentBid, basePrice, auctionState }) {
  const isSold    = auctionState.stage === AUCTION_STAGES.SOLD
  const isUnsold  = auctionState.stage === AUCTION_STAGES.UNSOLD
  const isSettled = isSold || isUnsold

  return (
    <motion.div
      key={activePlayer.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      {/* Photo — capped so bottom nav tabs stay visible */}
      <div style={{ flex: 1, minHeight: 0, maxHeight: 'calc(100dvh - 52px - 60px - 76px - 64px)', position: 'relative', background: C.surface, overflow: 'hidden' }}>
        {activePlayer.photo_url ? (
          <img
            src={activePlayer.photo_url}
            alt={activePlayer.name}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={72} color={C.textMuted} style={{ opacity: 0.15 }} />
          </div>
        )}

        {/* Dim overlay when settled */}
        <AnimatePresence>
          {isSettled && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.45)' }} />
          )}
        </AnimatePresence>

        {/* Bottom gradient fade */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to top, rgba(10,10,10,.95), transparent)', pointerEvents: 'none' }} />

        {/* Name overlay on photo */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 16px' }}>
          {/* Role tag */}
          <div style={{ marginBottom: 6 }}>
            <span style={{ background: 'rgba(255,107,34,.15)', backdropFilter: 'blur(6px)', border: `1px solid ${C.orangeBorder}`, color: C.orange, fontSize: '.62rem', fontWeight: 700, padding: '3px 9px', borderRadius: 20, letterSpacing: '.06em', textTransform: 'uppercase' }}>
              {ROLE_LABEL[activePlayer.role] || activePlayer.role}
            </span>
          </div>
          <h2 style={{
            margin: 0, fontWeight: 900, fontSize: '1.6rem', color: '#fff',
            lineHeight: 1.1, textTransform: 'capitalize',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            textShadow: '0 2px 8px rgba(0,0,0,.8)',
          }}>
            {activePlayer.name}
          </h2>
          <p style={{ margin: '3px 0 0', fontSize: '.75rem', color: 'rgba(255,255,255,.6)' }}>
            Year {activePlayer.year} · {activePlayer.branch?.toUpperCase?.()} · Sec {activePlayer.section?.toUpperCase?.()}
            <span style={{ marginLeft: 8, fontFamily: 'monospace', opacity: 0.7 }}>#{activePlayer.registration_id}</span>
          </p>
          {/* Attribute chips */}
          {(activePlayer.batting_side || activePlayer.bowling_arm) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 7 }}>
              {activePlayer.batting_side && (
                <span style={{ fontSize: '.6rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(59,130,246,.18)', border: '1px solid rgba(59,130,246,.35)', color: '#93c5fd', letterSpacing: '.05em', textTransform: 'uppercase' }}>
                  {activePlayer.batting_side} Hand Bat
                </span>
              )}
              {activePlayer.bowling_arm && (
                <span style={{ fontSize: '.6rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.3)', color: '#fca5a5', letterSpacing: '.05em', textTransform: 'uppercase' }}>
                  {activePlayer.bowling_arm} Arm{activePlayer.bowling_type ? ` · ${activePlayer.bowling_type.replace(/_/g, ' ')}` : ''}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bid row OR sold banner — always visible below photo */}
      <AnimatePresence mode="wait">
        {isSettled ? (
          <motion.div key="sold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            style={{ padding: '10px 14px', flexShrink: 0 }}>
            <SoldBanner stage={auctionState.stage} soldTo={auctionState.sold_to} soldPrice={auctionState.sold_price} />
          </motion.div>
        ) : (
          <motion.div key="bid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            style={{ flexShrink: 0 }}>
            <BidRow basePrice={basePrice} currentBid={currentBid} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Root export ──────────────────────────────────────────────────────────────
export default function MobilePlayerCard({ activePlayer, currentBid, basePrice, auctionState }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        {!activePlayer ? (
          <motion.div
            key="standby"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px' }}
          >
            <div style={{ width: 60, height: 60, borderRadius: '50%', marginBottom: 16, background: C.surface, border: `1px solid ${C.borderMid}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Gavel size={22} color={C.textMuted} />
            </div>
            <h3 style={{ margin: '0 0 8px', fontWeight: 800, fontSize: '1.2rem', color: C.text }}>Auction Standby</h3>
            <p style={{ margin: 0, fontSize: '.85rem', color: C.textMuted, lineHeight: 1.6, maxWidth: 260 }}>
              {auctionState.stage === AUCTION_STAGES.COMPLETED
                ? 'This round is complete.'
                : 'Waiting for the host to nominate the next player.'}
            </p>
          </motion.div>
        ) : (
          <PlayerCard
            activePlayer={activePlayer}
            currentBid={currentBid}
            basePrice={basePrice}
            auctionState={auctionState}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
