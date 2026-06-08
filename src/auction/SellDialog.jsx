import { formatCr } from '../lib/auction'
import { C, btnNeutral } from './tokens'

export default function SellDialog({ open, player, currentBid, availableTeams, onSell, onClose }) {
  if (!open || !player) return null
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(5px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: C.sidebar, border: `1px solid ${C.borderMid}`,
        borderRadius: 12, width: '100%', maxWidth: 420, padding: 26,
      }}>
        <h3 style={{ margin: '0 0 6px', fontWeight: 800, fontSize: '1.05rem', color: C.text }}>Assign Sale</h3>
        <p style={{ margin: '0 0 18px', color: C.textSub, fontSize: '.84rem' }}>
          Selling <strong style={{ color: C.text }}>{player.name}</strong> at{' '}
          <strong style={{ color: C.orange }}>{formatCr(currentBid)}</strong>
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, maxHeight: 300, overflowY: 'auto', marginBottom: 14 }}>
          {availableTeams.length > 0 ? availableTeams.map(t => (
            <button
              key={t.teamName}
              onClick={() => onSell(t.teamName)}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px', borderRadius: 8, cursor: 'pointer',
                background: C.surface, border: `1px solid ${C.border}`,
                color: C.text, fontFamily: '"DM Sans"', width: '100%',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.orange; e.currentTarget.style.background = C.orangeFaint }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.surface }}
            >
              <span style={{ fontWeight: 700, fontSize: '.9rem' }}>{t.teamName}</span>
              <span style={{ color: C.textMuted, fontSize: '.8rem' }}>Purse: {formatCr(t.remainingPurse)}</span>
            </button>
          )) : (
            <div style={{ textAlign: 'center', padding: '20px 0', color: C.textMuted, fontSize: '.88rem' }}>
              No eligible teams for this bid amount.
            </div>
          )}
        </div>
        <button style={{ ...btnNeutral, width: '100%' }} onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}
