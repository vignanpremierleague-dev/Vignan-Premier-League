import { AnimatePresence, motion } from 'framer-motion'
import { Flame, Gavel, Users, Tv } from 'lucide-react'
import { AUCTION_STAGES, AUCTION_TYPES, formatCr } from '../lib/auction'
import SoldStamp from './SoldStamp'
import { C, ROLE_LABEL, StatBox, Tag } from './tokens'

export default function AuctionDisplay({ auctionState, activePlayer, currentBid, basePrice, siteSettings }) {
  const isLive   = auctionState.stage === AUCTION_STAGES.LIVE
  const isSold   = auctionState.stage === AUCTION_STAGES.SOLD
  const isUnsold = auctionState.stage === AUCTION_STAGES.UNSOLD

  if (auctionState.is_public_visible === false) {
    return (
      <div style={{
        height: '100vh', width: '100vw', overflow: 'hidden',
        background: '#080808', color: C.text,
        fontFamily: '"DM Sans",system-ui,sans-serif',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', maxWidth: 500 }}>
          <div style={{
            width: 68, height: 68, borderRadius: '50%', margin: '0 auto 20px',
            background: C.surface, border: `1px solid ${C.borderMid}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Tv size={26} color={C.textMuted} />
          </div>
          <h2 style={{ fontWeight: 800, fontSize: '1.7rem', margin: '0 0 10px', color: C.text }}>Auction Paused</h2>
          <p style={{ color: C.textSub, fontSize: '.95rem', margin: 0, lineHeight: 1.6 }}>
            The live display is currently hidden by the host. Please wait.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      height: '100vh', width: '100vw', overflow: 'hidden',
      background: '#080808', color: C.text,
      fontFamily: '"DM Sans",system-ui,sans-serif',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '13px 28px', borderBottom: `1px solid ${C.border}`,
        background: C.sidebar, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Flame size={17} color={C.orange} />
          <span style={{ fontWeight: 800, fontSize: '.95rem', color: C.text }}>VPL Live Auction</span>
        </div>
        <span style={{
          padding: '5px 14px', borderRadius: 6, fontSize: '.76rem', fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase',
          background: auctionState.auction_type === AUCTION_TYPES.CAPTAINS ? 'rgba(245,161,0,.1)' : C.orangeFaint,
          border: `1px solid ${auctionState.auction_type === AUCTION_TYPES.CAPTAINS ? 'rgba(245,161,0,.3)' : C.orangeBorder}`,
          color: auctionState.auction_type === AUCTION_TYPES.CAPTAINS ? C.gold : C.orange,
        }}>
          {auctionState.auction_type === AUCTION_TYPES.CAPTAINS ? '⭐ Captains Draft' : '⭐ Players Draft'}
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
        <AnimatePresence mode="wait">
          {!activePlayer ? (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ textAlign: 'center', maxWidth: 500 }}>
              <div style={{
                width: 68, height: 68, borderRadius: '50%', margin: '0 auto 20px',
                background: C.surface, border: `1px solid ${C.borderMid}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Gavel size={26} color={C.textMuted} />
              </div>
              <h2 style={{ fontWeight: 800, fontSize: '1.7rem', margin: '0 0 10px', color: C.text }}>Auction Standby</h2>
              <p style={{ color: C.textSub, fontSize: '.95rem', margin: 0, lineHeight: 1.6 }}>
                {auctionState.stage === AUCTION_STAGES.COMPLETED
                  ? 'This round is complete. Waiting for the next stage to begin.'
                  : 'Waiting for the host to nominate the next player.'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={activePlayer.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ width: '100%', maxWidth: 860, position: 'relative' }}
            >
              {/* Stamp */}
              <AnimatePresence>
                {(isSold || isUnsold) && (
                  <SoldStamp stage={auctionState.stage} soldTo={auctionState.sold_to} soldPrice={auctionState.sold_price} />
                )}
              </AnimatePresence>

              {/* Card */}
              <div style={{
                background: C.panel, border: `1px solid ${C.borderMid}`,
                borderRadius: 12, display: 'flex', overflow: 'hidden',
              }}>
                {/* Photo */}
                <div style={{
                  width: 300, flexShrink: 0, position: 'relative',
                  background: C.surface, borderRight: `1px solid ${C.border}`,
                  minHeight: 0,
                }}>
                  {activePlayer.photo_url ? (
                    <img src={activePlayer.photo_url} alt={activePlayer.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', inset: 0 }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={60} color={C.textMuted} style={{ opacity: 0.3 }} />
                    </div>
                  )}
                  <span style={{
                    position: 'absolute', bottom: 10, left: 10,
                    background: 'rgba(0,0,0,.75)', border: `1px solid ${C.border}`,
                    color: C.textSub, fontSize: '.7rem', fontWeight: 700, padding: '3px 9px', borderRadius: 5,
                  }}>#{activePlayer.registration_id}</span>
                </div>

                {/* Info */}
                <div style={{ flex: 1, padding: '24px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                      <Tag color={C.orange} bg={C.orangeFaint} border={C.orangeBorder}>
                        {ROLE_LABEL[activePlayer.role] || activePlayer.role}
                      </Tag>
                      {activePlayer.is_captain && (
                        <Tag color={C.gold} bg="rgba(245,161,0,.1)" border="rgba(245,161,0,.28)">⭐ Captain Eligible</Tag>
                      )}
                    </div>
                    <h2 style={{ fontWeight: 900, fontSize: 'clamp(1.6rem,3.5vw,2.6rem)', margin: '0 0 6px', color: C.text, lineHeight: 1.1 }}>
                      {activePlayer.name}
                    </h2>
                    <p style={{ color: C.textSub, fontSize: '.88rem', margin: '0 0 20px' }}>
                      Year {activePlayer.year} &bull; {activePlayer.branch?.toUpperCase?.()} &bull; Sec {activePlayer.section?.toUpperCase?.()}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <StatBox label="Base Price" value={formatCr(basePrice)} />
                      <StatBox label="Batting" value={activePlayer.batting_side ? `${activePlayer.batting_side} Hand` : '—'} color={C.textSub} />
                    </div>
                  </div>

                  {/* Live bid footer */}
                  <div style={{
                    marginTop: 18, padding: '14px 18px', borderRadius: 9,
                    background: C.surface, border: `1px solid ${C.borderMid}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div>
                      <div style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.1em', color: C.textMuted, textTransform: 'uppercase', marginBottom: 5 }}>Current Bid</div>
                      <div style={{ fontWeight: 900, fontSize: 'clamp(1.6rem,3vw,2.2rem)', color: C.orange, lineHeight: 1 }}>
                        {formatCr(currentBid)}
                      </div>
                    </div>
                    <div style={{
                      padding: '7px 16px', borderRadius: 7, fontSize: '.75rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
                      background: isLive ? C.orangeFaint : C.surface3,
                      border: `1px solid ${isLive ? C.orangeBorder : C.border}`,
                      color: isLive ? C.orange : C.textMuted,
                    }}>
                      {isLive ? '⬤  Live' : auctionState.stage.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
