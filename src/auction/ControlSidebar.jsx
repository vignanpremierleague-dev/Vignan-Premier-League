import { useState } from 'react'
import { CheckCircle, ChevronLeft, Flame, Minus, Plus, RotateCcw, SkipForward, Tv, Eye, EyeOff, Radio } from 'lucide-react'
import { AUCTION_STAGES, AUCTION_TYPE_COLOR, AUCTION_TYPE_LABEL, AUCTION_TYPES, formatCr } from '../lib/auction'
import { BID_STEPS, C, navBtn } from './tokens'

const row = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  gap: 6, padding: '7px 10px', borderRadius: 8,
  fontFamily: '"DM Sans",system-ui,sans-serif', fontWeight: 700,
  fontSize: '.78rem', border: 'none', cursor: 'pointer', transition: 'all .15s',
}

/** Small colored square matching admin portal role card colors */
function RoundDot({ color }) {
  return (
    <span style={{
      width: 8, height: 8, borderRadius: 2, flexShrink: 0,
      background: color, display: 'inline-block',
      boxShadow: `0 0 6px ${color}80`,
    }} />
  )
}

export default function ControlSidebar({
  auctionType, stage, activePlayer, currentBid, basePrice,
  bidStep, loading, isPublic, isAuctionLive, auctionState,
  onSwitchType, onNominate, onBidChange, onBidStep, onAdjust,
  onSellOpen, onReset, onDisplayOpen, onBack, onTogglePublic, onToggleAuctionLive, onUpdateTitle,
  onSetStage
}) {
  const isLive = stage === AUCTION_STAGES.LIVE
  const canAct = !!activePlayer && isLive

  return (
    <aside className="vpl-control-sidebar" style={{
      width: 280, flexShrink: 0,
      background: C.sidebar, borderRight: `1px solid ${C.border}`,
      display: 'flex', flexDirection: 'column',
      height: '100%',
    }}>
      {/* Logo */}
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <Flame size={18} color={C.orange} />
        <span style={{ fontWeight: 800, color: C.text, fontSize: '1rem', fontFamily: '"Syne", sans-serif' }}>VPL Control</span>

      </div>

      {/* Controls — scrollable */}
      <div style={{ flex: 1, padding: '12px 12px 12px', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0, overflowY: 'auto' }}>

        {/* ── Auction Round ──────────────────────────────────── */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ fontSize: '.7rem', color: '#6a6a6a', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700 }}>Auction Round</div>
            <input 
              type="text" 
              placeholder="e.g. Day 2" 
              value={(auctionState?.display_title === 'VPL Captains Auction' ? '' : auctionState?.display_title) || ''}
              onChange={e => onUpdateTitle(e.target.value)}
              style={{ width: 80, padding: '2px 6px', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 4, color: '#fff', fontSize: '.65rem', outline: 'none' }}
              title="Auction Day / Subtitle"
            />
          </div>
          {/* Captains — full width, gold */}
          <button onClick={() => onSwitchType(AUCTION_TYPES.CAPTAINS)} style={{
            ...navBtn(auctionType === AUCTION_TYPES.CAPTAINS),
            width: '100%', justifyContent: 'flex-start', marginBottom: 6, padding: '8px 12px',
            ...(auctionType === AUCTION_TYPES.CAPTAINS ? { background: 'rgba(245,161,0,.1)', color: '#f5a100' } : {})
          }}>
            <RoundDot color={AUCTION_TYPE_COLOR.captains} />
            {AUCTION_TYPE_LABEL.captains}
          </button>
          {/* Player categories — 2x2 grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
            {[
              { type: AUCTION_TYPES.ALL_ROUNDERS,  label: AUCTION_TYPE_LABEL.all_rounders  },
              { type: AUCTION_TYPES.BATSMEN,        label: AUCTION_TYPE_LABEL.batsmen        },
              { type: AUCTION_TYPES.BOWLERS,        label: AUCTION_TYPE_LABEL.bowlers        },
              { type: AUCTION_TYPES.WICKET_KEEPERS, label: AUCTION_TYPE_LABEL.wicket_keepers },
            ].map(({ type, label }) => {
              const color = AUCTION_TYPE_COLOR[type]
              const active = auctionType === type
              return (
                <button key={type} onClick={() => onSwitchType(type)} style={{
                  ...navBtn(active),
                  justifyContent: 'flex-start', padding: '7px 8px', fontSize: '.74rem',
                  ...(active ? { background: `${color}18`, color } : {})
                }}>
                  <RoundDot color={color} />
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        <Divider />

        {/* ── Nomination ───────────────────────────────────────── */}
        <button
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: '"DM Sans"', fontWeight: 700, fontSize: '.85rem', background: 'linear-gradient(135deg,#ff6b22,#ff4b00)', color: '#fff', boxShadow: '0 4px 12px rgba(255,107,34,.25)', transition: 'all .15s', opacity: loading ? 0.6 : 1, width: '100%' }}
          onClick={onNominate} disabled={loading}
        >
          <SkipForward size={14} />
          {loading ? 'Loading…' : 'Nominate Next'}
        </button>

        <Divider />

        {/* ── Bid Control ──────────────────────────────────────── */}
        <div>
          <div style={labelStyle}>Bid Control</div>

          {/* Price input */}
          <input
            type="number"
            style={{
              width: '100%', padding: '8px 12px', borderRadius: 8, marginBottom: 8,
              background: C.surface, border: `1px solid ${C.borderMid}`,
              color: C.orange, fontSize: '1.5rem', fontWeight: 800,
              fontFamily: '"DM Sans"', outline: 'none', boxSizing: 'border-box',
            }}
            value={currentBid}
            min={basePrice}
            step="1"
            disabled={!activePlayer}
            onChange={e => onBidChange(Number(e.target.value))}
            onFocus={e => e.target.style.borderColor = C.orange}
            onBlur={e => e.target.style.borderColor = C.borderMid}
          />

          {/* Step selector */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
            {BID_STEPS.map(step => (
              <button key={step} onClick={() => onBidStep(step)} style={{
                flex: 1, padding: '6px 2px', borderRadius: 6, border: 'none', cursor: 'pointer',
                fontFamily: '"DM Sans"', fontWeight: 700, fontSize: '.72rem',
                background: bidStep === step ? C.orange : C.surface,
                color: bidStep === step ? '#fff' : C.textSub,
                transition: 'all .1s',
              }}>
                {formatCr(step)}
              </button>
            ))}
          </div>

          {/* +/- */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <button
              style={{ ...row, background: C.surface, color: C.textSub, border: `1px solid ${C.border}`, opacity: !activePlayer ? 0.4 : 1 }}
              disabled={!activePlayer} onClick={() => onAdjust(-bidStep)}
            >
              <Minus size={13} /> {formatCr(bidStep)}
            </button>
            <button
              style={{ ...row, background: 'linear-gradient(135deg,#ff6b22,#ff4b00)', color: '#fff', opacity: !activePlayer ? 0.4 : 1 }}
              disabled={!activePlayer} onClick={() => onAdjust(bidStep)}
            >
              <Plus size={13} /> {formatCr(bidStep)}
            </button>
          </div>
        </div>

        <Divider />

        {/* ── Sell ─────────────────────────────────────────────── */}
        <button
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: '"DM Sans"', fontWeight: 700, fontSize: '.85rem', background: canAct ? 'linear-gradient(135deg,#ff6b22,#ff4b00)' : C.surface, color: canAct ? '#fff' : C.textMuted, boxShadow: canAct ? '0 4px 12px rgba(255,107,34,.25)' : 'none', transition: 'all .15s', opacity: !canAct ? 0.38 : 1, width: '100%' }}
          disabled={!canAct}
          onClick={onSellOpen}
        >
          <CheckCircle size={14} /> Sell Player
        </button>

        <Divider />

        {/* ── Auction Status ──────────────────────────────────── */}
        <div>
          <div style={labelStyle}>Auction Status</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <button
              onClick={() => onSetStage(AUCTION_STAGES.COMING_SOON)}
              style={{
                ...row,
                background: stage === AUCTION_STAGES.COMING_SOON ? 'rgba(59,130,246,.12)' : C.surface,
                color: stage === AUCTION_STAGES.COMING_SOON ? '#60a5fa' : C.textSub,
                border: stage === AUCTION_STAGES.COMING_SOON ? '1px solid rgba(59,130,246,.3)' : `1px solid ${C.border}`,
              }}
            >
              Coming Soon
            </button>
            <button
              onClick={() => onSetStage(AUCTION_STAGES.ENDED)}
              style={{
                ...row,
                background: stage === AUCTION_STAGES.ENDED ? 'rgba(230,57,70,.12)' : C.surface,
                color: stage === AUCTION_STAGES.ENDED ? '#f87171' : C.textSub,
                border: stage === AUCTION_STAGES.ENDED ? '1px solid rgba(230,57,70,.3)' : `1px solid ${C.border}`,
              }}
            >
              End Auction
            </button>
          </div>
        </div>
      </div>

      {/* ── Footer: 4 compact icon+label buttons in a 2x2 grid ── */}
      <div style={{ padding: '10px 12px 12px', borderTop: `1px solid ${C.border}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, flexShrink: 0 }}>
        <FooterBtn
          Icon={isPublic ? EyeOff : Eye}
          label={isPublic ? 'Stop Display' : 'Start Display'}
          color={isPublic ? C.danger : C.orange}
          onClick={onTogglePublic}
        />
        <FooterBtn Icon={Tv} label="Open Screen" color={C.orange} onClick={onDisplayOpen} />
        <FooterBtn
          Icon={Radio}
          label={isAuctionLive ? 'Stop Live' : 'Start Live'}
          color={isAuctionLive ? C.danger : '#22c55e'}
          onClick={onToggleAuctionLive}
        />
        <FooterBtn Icon={ChevronLeft} label="Dashboard" color={C.textSub} onClick={onBack} />
      </div>

      <style>{`
        @keyframes vplPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </aside>
  )
}

function Divider() {
  return <div style={{ borderTop: `1px solid ${C.border}`, margin: '0' }} />
}

const labelStyle = {
  fontSize: '.62rem', fontWeight: 700, letterSpacing: '.12em',
  textTransform: 'uppercase', color: C.textMuted, marginBottom: 7,
}

function FooterBtn({ Icon, label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 4, padding: '8px 6px', borderRadius: 8, border: `1px solid ${C.border}`,
        background: 'transparent', cursor: 'pointer', transition: 'all .15s',
        fontFamily: '"DM Sans"',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.04)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <Icon size={14} color={color} />
      <span style={{ fontSize: '.62rem', fontWeight: 700, color: color, whiteSpace: 'nowrap' }}>{label}</span>
    </button>
  )
}
