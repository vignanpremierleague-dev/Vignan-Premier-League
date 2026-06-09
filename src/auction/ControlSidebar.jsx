import { CheckCircle, ChevronLeft, Crown, Flame, Minus, Plus, RotateCcw, SkipForward, Tv, Users, Eye, EyeOff } from 'lucide-react'
import { AUCTION_STAGES, AUCTION_TYPES, formatCr } from '../lib/auction'
import { BID_STEPS, C, SectionLabel, btnGhost, btnNeutral, btnOrange, navBtn } from './tokens'

export default function ControlSidebar({
  auctionType, stage, activePlayer, currentBid, basePrice,
  bidStep, loading, isPublic,
  onSwitchType, onNominate, onBidChange, onBidStep, onAdjust,
  onSellOpen, onReset, onDisplayOpen, onBack, onTogglePublic
}) {
  const isLive = stage === AUCTION_STAGES.LIVE
  const canAct = !!activePlayer && isLive

  return (
    <aside style={{
      width: 310, flexShrink: 0,
      background: C.sidebar, borderRight: `1px solid ${C.border}`,
      display: 'flex', flexDirection: 'column',
      height: '100%',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Flame size={20} color={C.orange} style={{ flexShrink: 0 }} />
        <span style={{ fontWeight: 800, color: C.text, fontSize: '1.2rem', fontFamily: '"Syne", sans-serif' }}>
          VPL Control
        </span>
      </div>

      {/* Nav / controls */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto', minHeight: 0 }}>
        {/* Round */}
        <SectionLabel>Draft Round</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { type: AUCTION_TYPES.CAPTAINS, label: 'Captains', icon: <Crown size={18} /> },
            { type: AUCTION_TYPES.PLAYERS,  label: 'Players',  icon: <Users size={18} /> },
          ].map(({ type, label, icon }) => (
            <button key={type} onClick={() => onSwitchType(type)} style={{
              ...navBtn(auctionType === type),
              justifyContent: 'center', flexDirection: 'column', gap: 6, padding: '12px 8px'
            }}>
              {icon} <span>{label}</span>
            </button>
          ))}
        </div>

        <div style={{ borderTop: `1px solid ${C.border}`, margin: '8px 0' }} />

        {/* Nominate */}
        <SectionLabel>Nomination</SectionLabel>
        <button
          style={{ ...btnOrange, width: '100%', padding: '11px 16px', justifyContent: 'center', opacity: loading ? 0.6 : 1 }}
          onClick={onNominate} disabled={loading}
        >
          <SkipForward size={15} />
          {loading ? 'Loading…' : 'Nominate Next Player'}
        </button>

        <div style={{ borderTop: `1px solid ${C.border}`, margin: '8px 0' }} />

        {/* Bid Controls */}
        <SectionLabel>Bid Control</SectionLabel>

        {/* Price input */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: '.7rem', color: C.textMuted, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 6 }}>
            Current Price
          </div>
          <input
            type="number"
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 8,
              background: C.surface, border: `1px solid ${C.borderMid}`,
              color: C.orange, fontSize: '1.4rem', fontWeight: 800,
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
        </div>

        {/* Step selector */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: '.7rem', color: C.textMuted, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 6 }}>
            Step Size
          </div>
          <div style={{ display: 'flex', gap: 5 }}>
            {BID_STEPS.map(step => (
              <button key={step} onClick={() => onBidStep(step)} style={{
                flex: 1, padding: '7px 4px', borderRadius: 7, border: 'none', cursor: 'pointer',
                fontFamily: '"DM Sans"', fontWeight: 700, fontSize: '.75rem',
                background: bidStep === step ? C.orange : C.surface,
                color: bidStep === step ? '#fff' : C.textSub,
                transition: 'all .1s',
              }}>
                {formatCr(step)}
              </button>
            ))}
          </div>
        </div>

        {/* +/- */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <button
            style={{ ...btnOrange, padding: '9px 8px', fontSize: '.82rem', opacity: !activePlayer ? 0.4 : 1 }}
            disabled={!activePlayer} onClick={() => onAdjust(bidStep)}
          >
            <Plus size={14} /> +{formatCr(bidStep)}
          </button>
          <button
            style={{ ...btnNeutral, padding: '9px 8px', fontSize: '.82rem', opacity: !activePlayer ? 0.4 : 1 }}
            disabled={!activePlayer} onClick={() => onAdjust(-bidStep)}
          >
            <Minus size={14} /> -{formatCr(bidStep)}
          </button>
        </div>

        <div style={{ borderTop: `1px solid ${C.border}`, margin: '8px 0' }} />

        {/* Sell */}
        <SectionLabel>Sale</SectionLabel>
        <button
          style={{ ...btnOrange, width: '100%', padding: '11px 16px', opacity: !canAct ? 0.38 : 1, justifyContent: 'center' }}
          disabled={!canAct}
          onClick={onSellOpen}
        >
          <CheckCircle size={15} /> Sold To…
        </button>
      </nav>

      {/* Footer actions */}
      <div style={{ padding: '10px 12px 16px', borderTop: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button style={{ ...btnNeutral, width: '100%', fontSize: '.82rem', color: isPublic ? C.danger : C.orange }} onClick={onTogglePublic}>
          {isPublic ? <EyeOff size={13} style={{ color: C.danger }} /> : <Eye size={13} style={{ color: C.orange }} />}
          {isPublic ? 'Stop Auction Display' : 'Start Auction Display'}
        </button>
        <button style={{ ...btnNeutral, width: '100%', fontSize: '.82rem', color: C.textSub }} onClick={onDisplayOpen}>
          <Tv size={13} style={{ color: C.orange }} /> Open Display Screen
        </button>
        <button style={{ ...btnGhost, width: '100%', fontSize: '.82rem' }} onClick={onReset}>
          <RotateCcw size={13} /> Reset Entire Auction
        </button>
        <button style={{ ...btnNeutral, width: '100%', fontSize: '.82rem' }} onClick={onBack}>
          <ChevronLeft size={13} /> Back to Dashboard
        </button>
      </div>
    </aside>
  )
}
