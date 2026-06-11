import { Flame } from 'lucide-react'
import { AUCTION_STAGES, AUCTION_TYPE_LABEL } from '../../lib/auction'
import { C } from '../tokens'

export default function MobileHeader({ stage, auctionType }) {
  const isLive = stage === AUCTION_STAGES.LIVE
  const typeLabel = AUCTION_TYPE_LABEL[auctionType] || 'Auction'

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 40,
      background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(10px)',
      borderBottom: `1px solid ${C.border}`,
      padding: '0 20px',
      height: 52,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Flame size={17} color={C.orange} />
        <span style={{
          fontWeight: 600, fontSize: '1rem',
          color: C.text, letterSpacing: '.08em',
          fontFamily: '"Syne", sans-serif',
          lineHeight: 1, textTransform: 'uppercase',
        }}>
          VPL
          <span style={{ color: C.textSub, fontWeight: 500, letterSpacing: '.04em', marginLeft: 6 }}>· {typeLabel}</span>
        </span>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '4px 10px', borderRadius: 20,
        background: isLive ? 'rgba(255,107,34,.1)' : C.surface,
        border: `1px solid ${isLive ? C.orangeBorder : C.border}`,
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: isLive ? C.orange : C.textMuted,
          display: 'inline-block',
          boxShadow: isLive ? `0 0 6px ${C.orange}` : 'none',
        }} />
        <span style={{
          fontSize: '.68rem', fontWeight: 700, letterSpacing: '.08em',
          textTransform: 'uppercase',
          color: isLive ? C.orange : C.textMuted,
        }}>{isLive ? 'Live' : stage}</span>
      </div>
    </div>
  )
}
