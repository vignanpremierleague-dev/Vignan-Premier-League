/* eslint-disable no-unused-vars */
import { AnimatePresence, motion } from 'framer-motion'
import { Flame, Gavel, Users, Tv } from 'lucide-react'
import { AUCTION_STAGES, AUCTION_TYPES, formatCr } from '../lib/auction'
import SoldStamp from './SoldStamp'
import TeamPanel from './TeamPanel'
import { C, ROLE_LABEL, StatBox, Tag } from './tokens'

export default function AuctionDisplay({ auctionState, activePlayer, currentBid, basePrice, siteSettings, soldCount = 0, poolCount = 0, players = [], teamNames = [], rosterMap = {} }) {
  const isLive   = auctionState.stage === AUCTION_STAGES.LIVE
  const isSold   = auctionState.stage === AUCTION_STAGES.SOLD
  const isUnsold = auctionState.stage === AUCTION_STAGES.UNSOLD

  const poolPlayers = players.filter(p => {
    const ok = auctionState.auction_type === AUCTION_TYPES.CAPTAINS ? p.is_captain : !p.is_captain
    return ok && p.auction_status !== 'sold' && p.auction_status !== 'unsold'
  })

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
          <h2 style={{ fontWeight: 800, fontSize: '1.7rem', margin: '0 0 10px', color: C.text }}>Auction Coming Soon</h2>
          <p style={{ color: C.textSub, fontSize: '.95rem', margin: 0, lineHeight: 1.6 }}>
            The live VPL auction hasn't started yet. Grab your seats, the action begins shortly!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="auction-display-container" style={{
      height: '100vh', width: '100vw', overflow: 'hidden',
      background: C.bg, color: C.text,
      fontFamily: '"DM Sans",system-ui,sans-serif',
      display: 'flex',
    }}>
      <style>{`
        @media (max-width: 1024px) {
          .auction-display-container { flex-direction: column !important; height: auto !important; overflow: auto !important; }
          .auction-display-left, .auction-display-right { width: 100% !important; border-right: none !important; border-left: none !important; border-bottom: 1px solid rgba(255,255,255,.08); }
          .auction-display-center { overflow: visible !important; min-height: 80vh; }
          .auction-card-wrapper { flex-direction: column !important; }
          .auction-card-photo { width: 100% !important; height: 300px !important; border-right: none !important; border-bottom: 1px solid rgba(255,255,255,.12); }
        }
      `}</style>
      {/* Left Sidebar */}
      <aside className="auction-display-left" style={{ width: 310, flexShrink: 0, background: C.sidebar, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', height: '100%' }}>
         <div style={{ padding: '20px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
           <Flame size={20} color={C.orange} />
           <span style={{ fontWeight: 800, fontSize: '1.2rem', color: C.text, fontFamily: '"Syne", sans-serif' }}>VPL Live</span>
         </div>
         <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
           <div style={{ marginBottom: 28 }}>
             <div style={{ fontSize: '.75rem', color: C.textMuted, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Draft Round</div>
             <div style={{ display: 'inline-block', padding: '8px 14px', background: auctionState.auction_type === AUCTION_TYPES.CAPTAINS ? 'rgba(245,161,0,.1)' : C.orangeFaint, border: `1px solid ${auctionState.auction_type === AUCTION_TYPES.CAPTAINS ? 'rgba(245,161,0,.3)' : C.orangeBorder}`, borderRadius: 8, color: auctionState.auction_type === AUCTION_TYPES.CAPTAINS ? C.gold : C.orange, fontWeight: 700, fontSize: '.85rem' }}>
               {auctionState.auction_type === AUCTION_TYPES.CAPTAINS ? '⭐ Captains Draft' : '⭐ Players Draft'}
             </div>
           </div>
           <div style={{ marginBottom: 28 }}>
             <div style={{ fontSize: '.75rem', color: C.textMuted, fontWeight: 700, textTransform: 'uppercase', marginBottom: 5 }}>Players Left in Pool</div>
             <div style={{ fontSize: '2.8rem', fontWeight: 900, color: C.text, lineHeight: 1 }}>{poolCount}</div>
           </div>
           <div style={{ marginBottom: 28 }}>
             <div style={{ fontSize: '.75rem', color: C.textMuted, fontWeight: 700, textTransform: 'uppercase', marginBottom: 5 }}>Players Sold</div>
             <div style={{ fontSize: '2.8rem', fontWeight: 900, color: C.green, lineHeight: 1 }}>{soldCount}</div>
           </div>
           
           <div style={{ flex: 1, overflowY: 'auto', marginTop: 10, paddingRight: 6 }}>
             <div style={{ fontSize: '.7rem', color: C.textMuted, fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>Up Next</div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
               {poolPlayers.map(p => (
                 <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'rgba(255,255,255,.03)', borderRadius: 6, border: `1px solid rgba(255,255,255,.05)` }}>
                   <span style={{ fontSize: '.8rem', fontWeight: 600, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: 10 }}>{p.name}</span>
                   <span style={{ fontSize: '.7rem', color: C.textMuted, fontFamily: 'monospace' }}>{p.registration_id}</span>
                 </div>
               ))}
               {poolPlayers.length === 0 && <div style={{ fontSize: '.8rem', color: C.textMuted }}>Pool empty</div>}
             </div>
           </div>
         </div>
      </aside>

      {/* Center Content */}
      <div className="auction-display-center" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 28, overflow: 'hidden' }}>
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
                <div className="auction-card-wrapper" style={{
                  background: C.panel, border: `1px solid ${C.borderMid}`,
                  borderRadius: 12, display: 'flex', overflow: 'hidden',
                }}>
                  {/* Photo */}
                  <div className="auction-card-photo" style={{
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

      {/* Right Team Panel */}
      <div className="auction-display-right" style={{ borderLeft: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <TeamPanel teamNames={teamNames} rosterMap={rosterMap} defaultExpanded={true} />
      </div>
    </div>
  )
}
