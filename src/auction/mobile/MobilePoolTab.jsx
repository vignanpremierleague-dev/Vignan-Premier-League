import { AUCTION_TYPE_COLOR, AUCTION_TYPE_LABEL } from '../../lib/auction'
import { C } from '../tokens'

export default function MobilePoolTab({ auctionState, poolCount, soldCount, poolPlayers }) {
  const aType  = auctionState.auction_type
  const color  = AUCTION_TYPE_COLOR[aType] || '#ff6b22'
  const label  = AUCTION_TYPE_LABEL[aType]  || 'Players'

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 16px' }}>

      {/* Current round banner — colored dot, no emoji */}
      <div style={{
        padding: '10px 14px', borderRadius: 10, marginBottom: 20,
        background: `${color}10`, border: `1px solid ${color}35`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{
          width: 9, height: 9, borderRadius: 3, flexShrink: 0,
          background: color, boxShadow: `0 0 7px ${color}90`,
        }} />
        <div>
          <div style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: `${color}99`, marginBottom: 1 }}>
            Current Round
          </div>
          <div style={{ fontWeight: 800, fontSize: '.9rem', color }}>
            {label}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28 }}>
        <div style={{ padding: '16px', borderRadius: 10, background: C.panel, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: C.textMuted, marginBottom: 6 }}>In Pool</div>
          <div style={{ fontWeight: 900, fontSize: '2rem', color: C.text, lineHeight: 1 }}>{poolCount}</div>
        </div>
        <div style={{ padding: '16px', borderRadius: 10, background: C.panel, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: C.textMuted, marginBottom: 6 }}>Sold</div>
          <div style={{ fontWeight: 900, fontSize: '2rem', color: '#4ade80', lineHeight: 1 }}>{soldCount}</div>
        </div>
      </div>

      {/* Up Next */}
      <div style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: C.textMuted, marginBottom: 12 }}>
        Up Next
      </div>

      {poolPlayers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: C.textMuted, fontSize: '.85rem' }}>
          Pool is empty
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {poolPlayers.map(p => (
            <div key={p.id} style={{
              padding: '12px 14px', borderRadius: 9,
              background: C.panel, border: `1px solid ${C.border}`,
              overflow: 'hidden', minWidth: 0,
            }}>
              <div style={{ fontWeight: 700, fontSize: '.82rem', color: C.text, marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textTransform: 'capitalize' }}>
                {p.name}
              </div>
              <div style={{ fontSize: '.7rem', color: C.textMuted, fontFamily: 'monospace' }}>
                #{p.registration_id}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
