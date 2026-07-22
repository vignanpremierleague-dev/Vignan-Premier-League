import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Flame, Gavel, Users, Tv, ChevronRight } from 'lucide-react'
import { AUCTION_STAGES, AUCTION_TYPE_COLOR, AUCTION_TYPE_LABEL, formatCr, getEligiblePlayers, formatName } from '../lib/auction'
import SoldBanner from './SoldBanner'
import TeamPanel  from './TeamPanel'
import { C, ROLE_LABEL, ROLE_COLOR } from './tokens'

import MobileHeader    from './mobile/MobileHeader'
import MobilePlayerCard from './mobile/MobilePlayerCard'
import MobilePoolTab   from './mobile/MobilePoolTab'
import MobileTeamsTab  from './mobile/MobileTeamsTab'
import MobileBottomNav from './mobile/MobileBottomNav'

// ─── Accordion team card (desktop side columns) ───────────────────────────────
function DesktopTeamCard({ teamName, team }) {
  const [expanded, setExpanded] = useState(false)
  const pct = Math.round((team.squadCount / 12) * 100)

  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 9, overflow: 'hidden', flexShrink: 0,
    }}>
      {/* Header — click to toggle */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px', background: C.surface3,
          borderBottom: (expanded && team.roster.length > 0) ? `1px solid ${C.border}` : 'none',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
          {/* Chevron */}
          <ChevronRight size={14} color={C.textMuted} style={{ flexShrink: 0, transition: 'transform .2s', transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '.95rem', color: C.text, letterSpacing: '.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 110 }}>{teamName}</div>
            <div style={{ fontSize: '.72rem', color: team.captain ? C.gold : C.textMuted, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 110 }}>
              {team.captain ? `⭐ ${team.captain.name}` : 'No captain'}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 10 }}>
          <div style={{ fontWeight: 900, fontSize: '1.05rem', color: C.orange }}>{formatCr(team.remainingPurse)}</div>
          <div style={{ fontSize: '.75rem', color: C.textMuted, marginTop: 2 }}>{team.squadCount}/12</div>
        </div>
      </div>

      {/* Squad fill bar */}
      <div style={{ height: 2, background: C.border }}>
        <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg,${C.orange},#ff4b00)`, transition: 'width .3s' }} />
      </div>

      {/* Roster — shown when expanded */}
      {expanded && team.roster.length > 0 && (
        <div style={{ padding: '6px 10px 8px' }}>
          {team.roster.map(p => (
            <div key={p.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '3px 4px', marginBottom: 2,
            }}>
              <span style={{ fontSize: '.73rem', fontWeight: 600, color: C.textSub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 130, textTransform: 'capitalize' }}>
                {p.name}
                {p.is_captain && <span style={{ color: C.gold, marginLeft: 3 }}>★</span>}
              </span>
              <span style={{ fontSize: '.71rem', fontWeight: 800, color: C.orange, flexShrink: 0, marginLeft: 6 }}>
                {formatCr(p.bid_amount)}
              </span>
            </div>
          ))}
        </div>
      )}
      {expanded && team.roster.length === 0 && (
        <div style={{ padding: '10px 14px', fontSize: '.75rem', color: C.textMuted }}>No players yet</div>
      )}
    </div>
  )
}

// ─── Desktop side-column wrapper ─────────────────────────────────────────────
function DesktopTeamColumn({ teamNames, rosterMap }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 6,
      padding: '12px 10px', overflowY: 'auto', flex: 1, minHeight: 0,
    }}>
      {teamNames.map(teamName => (
        <DesktopTeamCard
          key={teamName}
          teamName={teamName}
          team={rosterMap[teamName] || { remainingPurse: 0, squadCount: 0, roster: [], captain: null }}
        />
      ))}
    </div>
  )
}

// ─── Desktop top nav ──────────────────────────────────────────────────────────
function DesktopTopNav({ auctionType, poolCount, soldCount }) {
  const typeLabel  = AUCTION_TYPE_LABEL[auctionType] || 'Auction'
  const typeColor  = AUCTION_TYPE_COLOR[auctionType] || C.orange

  return (
    <div style={{
      width: '100%', height: 64,
      background: C.sidebar, borderBottom: `1px solid ${C.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px', flexShrink: 0, zIndex: 10,
    }}>
      {/* Left — brand + role label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Flame size={20} color={C.orange} />
        <span style={{
          fontWeight: 700, fontSize: '1.15rem', color: C.text,
          fontFamily: '"Syne",sans-serif', letterSpacing: '.08em',
          textTransform: 'uppercase', lineHeight: 1,
        }}>
          VPL
          <span style={{ color: typeColor, fontWeight: 600, letterSpacing: '.04em', marginLeft: 8 }}>
            · {typeLabel}
          </span>
        </span>
      </div>

      {/* Right — In Pool + Sold pills, side by side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* In Pool */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 14px', borderRadius: 8,
          background: C.surface, border: `1px solid ${C.border}`,
        }}>
          <span style={{ fontSize: '.62rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: C.textMuted }}>In Pool</span>
          <span style={{ fontWeight: 900, fontSize: '1.15rem', color: C.text, lineHeight: 1 }}>{poolCount}</span>
        </div>
        {/* Divider */}
        <div style={{ width: 1, height: 26, background: C.border }} />
        {/* Sold */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 14px', borderRadius: 8,
          background: `${C.green}12`, border: `1px solid ${C.green}30`,
        }}>
          <span style={{ fontSize: '.62rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: `${C.green}99` }}>Sold</span>
          <span style={{ fontWeight: 900, fontSize: '1.15rem', color: C.green, lineHeight: 1 }}>{soldCount}</span>
        </div>
      </div>
    </div>
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
        {/* Name + attributes */}
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontWeight: 900, fontSize: 'clamp(1.5rem,3vw,2.8rem)', margin: '0 0 6px', color: C.text, lineHeight: 1.1, wordBreak: 'break-word' }}>
            {formatName(activePlayer.name)}
          </h1>
          <p style={{ color: C.textSub, fontSize: '.9rem', margin: '0 0 10px' }}>
            Year {activePlayer.year} · {activePlayer.branch?.toUpperCase?.()} · Sec {activePlayer.section?.toUpperCase?.()}
          </p>
          {/* Attribute chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {activePlayer.batting_side && (
              <span style={{ fontSize: '.68rem', fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: 'rgba(59,130,246,.1)', border: '1px solid rgba(59,130,246,.25)', color: '#60a5fa', letterSpacing: '.05em', textTransform: 'uppercase' }}>
                {activePlayer.batting_side} Hand Bat
              </span>
            )}
            {activePlayer.bowling_arm && (
              <span style={{ fontSize: '.68rem', fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', color: '#f87171', letterSpacing: '.05em', textTransform: 'uppercase' }}>
                {activePlayer.bowling_arm} Arm{activePlayer.bowling_type ? ` · ${activePlayer.bowling_type.replace(/_/g,' ')}` : ''}
              </span>
            )}
          </div>
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

// ─── Tablet TopNav (simple, centred) ─────────────────────────────────────────
function TabletTopNav({ auctionType }) {
  const typeLabel = AUCTION_TYPE_LABEL[auctionType] || 'Auction'
  return (
    <div style={{ width: '100%', height: 64, background: C.sidebar, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px', flexShrink: 0, zIndex: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Flame size={20} color={C.orange} />
        <span style={{ fontWeight: 600, fontSize: '1.2rem', color: C.text, fontFamily: '"Syne",sans-serif', letterSpacing: '.08em', textTransform: 'uppercase', lineHeight: 1 }}>
          VPL
          <span style={{ color: C.textSub, fontWeight: 500, letterSpacing: '.04em', marginLeft: 8 }}>· {typeLabel}</span>
        </span>
      </div>
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
  const [leftOpen,  setLeftOpen]  = useState(true)

  const poolPlayers = getEligiblePlayers(players, auctionState.auction_type)

  const rootStyle = { height: '100dvh', width: '100vw', overflow: 'hidden', background: C.bg, color: C.text, fontFamily: '"DM Sans",system-ui,sans-serif' }

  // Split teams into two halves for desktop columns
  const half       = Math.ceil(teamNames.length / 2)
  const leftTeams  = teamNames.slice(0, half)
  const rightTeams = teamNames.slice(half)

  // Standby screens when display is stopped
  if (auctionState.is_public_visible === false) {
    if (auctionState.stage === AUCTION_STAGES.ENDED) {
      return (
        <div style={{ ...rootStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', maxWidth: 440, padding: '0 24px' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto 18px', background: C.surface, border: `1px solid ${C.borderMid}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Tv size={24} color={C.textMuted} />
            </div>
            <h2 style={{ fontWeight: 900, fontSize: '1.6rem', margin: '0 0 10px', color: C.text }}>Auction Ended</h2>
            <p style={{ color: C.textSub, fontSize: '.9rem', margin: '0 0 24px', lineHeight: 1.6 }}>The live VPL auction has concluded. Thank you for participating!</p>
            <a href="/auction-results" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#ff6b22,#ff4b00)',
              color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '.88rem',
              boxShadow: '0 4px 12px rgba(255,107,34,.25)', transition: 'all .15s'
            }}>
              View Results
            </a>
          </div>
        </div>
      )
    }

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
        /* Desktop team column header label */
        .ad-col-label {
          height: 48px;
          display: flex; align-items: center;
          padding: 0 14px;
          border-bottom: 1px solid rgba(255,255,255,.08);
          flex-shrink: 0;
        }
      `}</style>

      {/* ── Phone (<640px) ──────────────────────────────────────────────────── */}
      <div className="ad-phone" style={rootStyle}>
        <MobileHeader stage={auctionState.stage} auctionType={auctionState.auction_type} />
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {mobileTab === 'live'  && <MobilePlayerCard {...sharedProps} />}
          {mobileTab === 'pool'  && <MobilePoolTab {...poolProps} />}
          {mobileTab === 'teams' && <MobileTeamsTab teamNames={teamNames} rosterMap={rosterMap} />}
        </div>
        <MobileBottomNav activeTab={mobileTab} onTabChange={setMobileTab} />
        <div style={{ height: 64, flexShrink: 0, background: 'rgba(11,11,11,0.97)' }} />
      </div>

      {/* ── Tablet (640–1023px): slim sidebar + player card ──────────────────── */}
      <div className="ad-tablet" style={{ ...rootStyle, flexDirection: 'column' }}>
        <TabletTopNav auctionType={auctionState.auction_type} />
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0, width: '100%' }}>
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minWidth: 0 }}>
            <AnimatePresence mode="wait">
              <PlayerCard key={activePlayer?.id ?? 'idle'} {...sharedProps} />
            </AnimatePresence>
          </div>
        </div>
        <BottomFooter />
      </div>

      {/* ── Desktop (≥1024px): left teams | player card | right teams ────────── */}
      <div className="ad-desktop" style={{ ...rootStyle, flexDirection: 'column' }}>
        {/* Top nav — space-between: VPL label left, pool+sold right */}
        <DesktopTopNav
          auctionType={auctionState.auction_type}
          poolCount={poolCount}
          soldCount={soldCount}
        />

        {/* Main body */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0, width: '100%' }}>

          {/* Left — first half of teams */}
          <aside style={{
            width: 290, flexShrink: 0,
            background: C.sidebar, borderRight: `1px solid ${C.border}`,
            display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%',
          }}>
            <div className="ad-col-label">
              <span style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: C.textMuted }}>Teams — Purse</span>
            </div>
            <DesktopTeamColumn teamNames={leftTeams} rosterMap={rosterMap} />
          </aside>

          {/* Centre — player card */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minWidth: 0 }}>
            <AnimatePresence mode="wait">
              <PlayerCard key={activePlayer?.id ?? 'idle'} {...sharedProps} />
            </AnimatePresence>
          </div>

          {/* Right — second half of teams */}
          <aside style={{
            width: 290, flexShrink: 0,
            background: C.sidebar, borderLeft: `1px solid ${C.border}`,
            display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%',
          }}>
            <div className="ad-col-label">
              <span style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: C.textMuted }}>Teams — Purse</span>
            </div>
            <DesktopTeamColumn teamNames={rightTeams} rosterMap={rosterMap} />
          </aside>
        </div>

        <BottomFooter />
      </div>
    </>
  )
}
