import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Flame, Gavel, Users, Tv, PanelLeft, PanelRight } from 'lucide-react'
import { AUCTION_STAGES, AUCTION_TYPE_COLOR, AUCTION_TYPE_LABEL, formatCr, getEligiblePlayers, formatName } from '../lib/auction'
import SoldBanner from './SoldBanner'
import TeamPanel  from './TeamPanel'
import { C, ROLE_LABEL, ROLE_COLOR } from './tokens'

import MobileHeader    from './mobile/MobileHeader'
import MobilePlayerCard from './mobile/MobilePlayerCard'
import MobilePoolTab   from './mobile/MobilePoolTab'
import MobileTeamsTab  from './mobile/MobileTeamsTab'
import MobileBottomNav from './mobile/MobileBottomNav'

// ─── Round badge (colored dot + label) ───────────────────────────────────────
function RoundBadge({ auctionType }) {
  const color = AUCTION_TYPE_COLOR[auctionType] || C.orange
  const label = AUCTION_TYPE_LABEL[auctionType] || 'Players'
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '6px 12px', borderRadius: 8,
      background: `${color}14`, border: `1px solid ${color}40`,
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: 2, flexShrink: 0,
        background: color, boxShadow: `0 0 6px ${color}80`,
      }} />
      <span style={{ fontWeight: 700, fontSize: '.82rem', color }}>{label}</span>
    </div>
  )
}

// ─── Sidebar (shared, width controlled by caller) ────────────────────────────
function Sidebar({ auctionState, poolCount, soldCount, poolPlayers, width = 280, hideHeader }) {
  return (
    <aside style={{
      width, flexShrink: 0, height: '100%',
      background: C.sidebar, borderRight: `1px solid ${C.border}`,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Header */}
      {!hideHeader && (
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <Flame size={16} color={C.orange} />
          <span style={{ fontWeight: 800, fontSize: '1rem', color: C.text, fontFamily: '"Syne",sans-serif' }}>VPL Live</span>
        </div>
      )}

      {/* Body */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', padding: '14px 14px', gap: 16, overflow: 'hidden' }}>
        {/* Round */}
        <div>
          <div style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: C.textMuted, marginBottom: 6 }}>Now Bidding</div>
          <RoundBadge auctionType={auctionState.auction_type} />
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[{ label: 'In Pool', value: poolCount, color: C.text }, { label: 'Sold', value: soldCount, color: C.green }].map(s => (
            <div key={s.label} style={{ padding: '10px 12px', background: C.surface, borderRadius: 7, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: '.58rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: C.textMuted, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontWeight: 900, fontSize: '1.7rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Pool list */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: C.textMuted, marginBottom: 8 }}>Up Next</div>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
            {poolPlayers.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', background: 'rgba(255,255,255,.03)', borderRadius: 5, border: `1px solid rgba(255,255,255,.04)`, minWidth: 0 }}>
                <span style={{ fontSize: '.76rem', fontWeight: 600, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: 6 }}>{formatName(p.name)}</span>
                <span style={{ fontSize: '.62rem', color: C.textMuted, fontFamily: 'monospace', flexShrink: 0 }}>{p.registration_id}</span>
              </div>
            ))}
            {poolPlayers.length === 0 && <div style={{ fontSize: '.78rem', color: C.textMuted }}>Pool empty</div>}
          </div>
        </div>
      </div>
    </aside>
  )
}

// ─── Player card (desktop + tablet) ──────────────────────────────────────────
function PlayerCard({ activePlayer, currentBid, basePrice, auctionState }) {
  const isSettled = auctionState.stage === AUCTION_STAGES.SOLD || auctionState.stage === AUCTION_STAGES.UNSOLD
  const isLive    = auctionState.stage === AUCTION_STAGES.LIVE
  const roleColor = ROLE_COLOR[activePlayer?.role] || C.orange

  if (!activePlayer) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 40 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', marginBottom: 18, background: C.surface, border: `1px solid ${C.borderMid}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Gavel size={24} color={C.textMuted} />
        </div>
        <h2 style={{ fontWeight: 900, fontSize: '1.7rem', margin: '0 0 8px', color: C.text }}>Auction Standby</h2>
        <p style={{ color: C.textSub, fontSize: '.9rem', margin: 0, lineHeight: 1.6, maxWidth: 360 }}>
          {auctionState.stage === AUCTION_STAGES.COMPLETED ? 'This round is complete.' : 'Waiting for the host to nominate the next player.'}
        </p>
      </div>
    )
  }

  return (
    <motion.div
      key={activePlayer.id}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}
    >
      {/* Photo — left panel, fills full height */}
      <div style={{ width: '78%', maxWidth: 400, flexShrink: 0, position: 'relative', background: C.surface, borderRight: `1px solid ${C.border}`, overflow: 'hidden' }}>
        {activePlayer.photo_url
          ? <img src={activePlayer.photo_url} alt={activePlayer.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={64} color={C.textMuted} style={{ opacity: 0.15 }} /></div>
        }
        {/* Dim overlay when sold */}
        <AnimatePresence>
          {isSettled && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.45)' }} />}
        </AnimatePresence>
        {/* Role tag */}
        <span style={{
          position: 'absolute', top: 14, left: 14,
          background: `${roleColor}22`, backdropFilter: 'blur(8px)',
          border: `1px solid ${roleColor}55`, color: roleColor,
          fontSize: '.7rem', fontWeight: 700, padding: '4px 11px',
          borderRadius: 20, letterSpacing: '.06em', textTransform: 'uppercase',
        }}>
          {ROLE_LABEL[activePlayer.role] || activePlayer.role}
        </span>
        {/* Reg ID */}
        <span style={{ position: 'absolute', bottom: 14, left: 14, background: 'rgba(0,0,0,.7)', border: `1px solid rgba(255,255,255,.1)`, color: C.textSub, fontSize: '.7rem', fontWeight: 700, padding: '3px 8px', borderRadius: 5, fontFamily: 'monospace' }}>
          #{activePlayer.registration_id}
        </span>
      </div>

      {/* Info panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(24px,4vw,48px)', gap: 24, overflow: 'auto', minWidth: 0 }}>
        {/* Name */}
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontWeight: 900, fontSize: 'clamp(1.5rem,3vw,2.8rem)', margin: '0 0 6px', color: C.text, lineHeight: 1.1, wordBreak: 'break-word' }}>
            {formatName(activePlayer.name)}
          </h1>
          <p style={{ color: C.textSub, fontSize: '.9rem', margin: 0 }}>
            Year {activePlayer.year} · {activePlayer.branch?.toUpperCase?.()} · Sec {activePlayer.section?.toUpperCase?.()}
          </p>
        </div>

        {/* Bid / Sold — animated swap */}
        <AnimatePresence mode="wait">
          {isSettled ? (
            <motion.div key="sold" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <SoldBanner stage={auctionState.stage} soldTo={auctionState.sold_to} soldPrice={auctionState.sold_price} />
            </motion.div>
          ) : (
            <motion.div key="bid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ padding: 'clamp(14px,2vw,22px)', borderRadius: 12, background: C.surface, border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: C.textMuted, marginBottom: 8 }}>Base Price</div>
                  <div style={{ fontWeight: 900, fontSize: 'clamp(1.4rem,2.5vw,2.2rem)', color: C.text, lineHeight: 1 }}>{formatCr(basePrice)}</div>
                </div>
                <div style={{ padding: 'clamp(14px,2vw,22px)', borderRadius: 12, background: C.orangeFaint, border: `1px solid ${C.orangeBorder}` }}>
                  <div style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: C.orange, marginBottom: 8, opacity: 0.8 }}>Current Bid</div>
                  <div style={{ fontWeight: 900, fontSize: 'clamp(1.4rem,2.5vw,2.2rem)', color: C.orange, lineHeight: 1 }}>{formatCr(currentBid)}</div>
                </div>
              </div>
              {isLive && (
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
                    style={{ width: 7, height: 7, borderRadius: '50%', background: C.orange, display: 'inline-block' }} />
                  <span style={{ fontSize: '.7rem', fontWeight: 700, color: C.orange, letterSpacing: '.12em', textTransform: 'uppercase' }}>Live Auction</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function TopNav({ title, onToggleLeft, onToggleRight }) {
  return (
    <div style={{ width: '100%', height: 64, background: C.sidebar, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0, zIndex: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {onToggleLeft && (
          <button onClick={onToggleLeft} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: C.textSub, padding: 4, display: 'flex', alignItems: 'center' }}>
            <PanelLeft size={28} />
          </button>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Flame size={20} color={C.orange} />
          <span style={{ fontWeight: 900, fontSize: '1.2rem', color: C.text, fontFamily: '"Syne",sans-serif', letterSpacing: '.05em', textTransform: 'uppercase' }}>
            {title || 'VPL Live Auction'}
          </span>
        </div>
      </div>
      {onToggleRight && (
        <button onClick={onToggleRight} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: C.textSub, padding: 4, display: 'flex', alignItems: 'center' }}>
          <PanelRight size={20} />
        </button>
      )}
    </div>
  )
}

function BottomFooter() {
  return (
    <div style={{ width: '100%', height: 64, background: C.sidebar, borderTop: `1px solid ${C.border}`, flexShrink: 0, zIndex: 10 }}></div>
  )
}

// ─── Root component ───────────────────────────────────────────────────────────
export default function AuctionDisplay({
  auctionState, activePlayer, currentBid, basePrice,
  siteSettings, soldCount = 0, poolCount = 0,
  players = [], teamNames = [], rosterMap = {},
}) {
  const [mobileTab, setMobileTab] = useState('live')
  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)
  const poolPlayers = getEligiblePlayers(players, auctionState.auction_type)

  const rootStyle = { height: '100vh', width: '100vw', overflow: 'hidden', background: C.bg, color: C.text, fontFamily: '"DM Sans",system-ui,sans-serif' }

  const customSubtitle = auctionState.display_title && auctionState.display_title !== 'VPL Captains Auction' 
    ? ` • ${auctionState.display_title.toUpperCase()}` 
    : ''
  const dynamicTitle = `VPL ${AUCTION_TYPE_LABEL[auctionState.auction_type]?.toUpperCase() || ''} AUCTION${customSubtitle}`

  // Not public yet
  if (auctionState.is_public_visible === false) {
    return (
      <div style={{ ...rootStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 440, padding: '0 24px' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto 18px', background: C.surface, border: `1px solid ${C.borderMid}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Tv size={24} color={C.textMuted} />
          </div>
          <h2 style={{ fontWeight: 900, fontSize: '1.6rem', margin: '0 0 10px', color: C.text }}>Auction Coming Soon</h2>
          <p style={{ color: C.textSub, fontSize: '.9rem', margin: 0, lineHeight: 1.6 }}>The live VPL auction hasn't started yet. Grab your seats — action begins shortly!</p>
        </div>
      </div>
    )
  }

  const sharedProps = { auctionState, activePlayer, currentBid, basePrice }
  const poolProps   = { auctionState, poolCount, soldCount, poolPlayers }

  return (
    <>
      <style>{`
        /* Responsive breakpoints for AuctionDisplay */
        .ad-phone   { display: flex;  flex-direction: column; }
        .ad-tablet  { display: none; }
        .ad-desktop { display: none; }
        @media (min-width: 640px) {
          .ad-phone   { display: none; }
          .ad-tablet  { display: flex; }
        }
        @media (min-width: 1024px) {
          .ad-tablet  { display: none; }
          .ad-desktop { display: flex; }
        }
      `}</style>

      {/* ── Phone (<640px) ──────────────────────────────────────────────────── */}
      <div className="ad-phone" style={rootStyle}>
        <MobileHeader stage={auctionState.stage} />
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {mobileTab === 'live'  && <MobilePlayerCard {...sharedProps} />}
          {mobileTab === 'pool'  && <MobilePoolTab {...poolProps} />}
          {mobileTab === 'teams' && <MobileTeamsTab teamNames={teamNames} rosterMap={rosterMap} />}
        </div>
        <MobileBottomNav activeTab={mobileTab} onTabChange={setMobileTab} />
      </div>

      {/* ── Tablet (640–1023px): sidebar + player card ───────────────────────── */}
      <div className="ad-tablet" style={{ ...rootStyle, flexDirection: 'column' }}>
        <TopNav title={dynamicTitle} onToggleLeft={() => setLeftOpen(!leftOpen)} />
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0, width: '100%' }}>
          <motion.div initial={false} animate={{ width: leftOpen ? 252 : 0, opacity: leftOpen ? 1 : 0 }} style={{ overflow: 'hidden', flexShrink: 0 }}>
            <Sidebar {...poolProps} width={252} hideHeader />
          </motion.div>
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minWidth: 0 }}>
            <AnimatePresence mode="wait">
              <PlayerCard key={activePlayer?.id ?? 'idle'} {...sharedProps} />
            </AnimatePresence>
          </div>
        </div>
        <BottomFooter />
      </div>

      {/* ── Desktop (≥1024px): sidebar + player card + TeamPanel ─────────────── */}
      <div className="ad-desktop" style={{ ...rootStyle, flexDirection: 'column' }}>
        <TopNav title={dynamicTitle} onToggleLeft={() => setLeftOpen(!leftOpen)} onToggleRight={() => setRightOpen(!rightOpen)} />
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0, width: '100%' }}>
          <motion.div initial={false} animate={{ width: leftOpen ? 292 : 0, opacity: leftOpen ? 1 : 0 }} style={{ overflow: 'hidden', flexShrink: 0 }}>
            <Sidebar {...poolProps} width={292} hideHeader />
          </motion.div>
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minWidth: 0 }}>
            <AnimatePresence mode="wait">
              <PlayerCard key={activePlayer?.id ?? 'idle'} {...sharedProps} />
            </AnimatePresence>
          </div>
          <motion.div initial={false} animate={{ width: rightOpen ? 322 : 0, opacity: rightOpen ? 1 : 0 }} style={{ overflow: 'hidden', flexShrink: 0, borderLeft: rightOpen ? `1px solid ${C.border}` : 'none' }}>
            <TeamPanel teamNames={teamNames} rosterMap={rosterMap} defaultExpanded />
          </motion.div>
        </div>
        <BottomFooter />
      </div>
    </>
  )
}
