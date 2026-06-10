import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { formatCr } from '../lib/auction'
import { C } from './tokens'

function TeamCard({ teamName, team, defaultExpanded }) {
  const [expanded, setExpanded] = useState(defaultExpanded ?? false)
  const pct = Math.round((team.squadCount / 12) * 100)

  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9, overflow: 'hidden',
    }}>
      {/* Header */}
      <div 
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', background: C.surface3,
          borderBottom: (expanded && team.roster.length > 0) ? `1px solid ${C.border}` : 'none',
          cursor: 'pointer'
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          {expanded ? <ChevronDown size={14} color={C.textMuted} style={{ flexShrink: 0 }} /> : <ChevronRight size={14} color={C.textMuted} style={{ flexShrink: 0 }} />}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '.88rem', color: C.text, letterSpacing: '.02em' }}>{teamName}</div>
            <div style={{ fontSize: '.7rem', color: team.captain ? C.gold : C.textMuted, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
              {team.captain ? `⭐ ${team.captain.name}` : 'No captain'}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
          <div style={{ fontWeight: 800, fontSize: '.92rem', color: C.orange }}>{formatCr(team.remainingPurse)}</div>
          <div style={{ fontSize: '.68rem', color: C.textMuted, marginTop: 2 }}>{team.squadCount}/12</div>
        </div>
      </div>

      {/* Squad capacity bar */}
      <div style={{ height: 2, background: C.border, borderRadius: 1 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg,${C.orange},#ff4b00)`, borderRadius: 1, transition: 'width .3s' }} />
      </div>

      {/* Roster list */}
      {expanded && team.roster.length > 0 && (
        <div style={{ padding: '6px 10px 8px' }}>
          {team.roster.map(p => (
            <div key={p.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '3px 4px', marginBottom: 2,
            }}>
              <span style={{ fontSize: '.74rem', fontWeight: 600, color: C.textSub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160, textTransform: 'capitalize' }}>
                {p.name}
                {p.is_captain && <span style={{ color: C.gold, marginLeft: 3 }}>★</span>}
              </span>
              <span style={{ fontSize: '.72rem', fontWeight: 800, color: C.orange, flexShrink: 0, marginLeft: 6 }}>
                {formatCr(p.bid_amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function TeamPanel({ teamNames, rosterMap, defaultExpanded = false, fullWidth = false }) {
  return (
    <aside style={{
      width: fullWidth ? '100%' : 322,
      flexShrink: 0,
      background: C.sidebar,
      display: 'flex', flexDirection: 'column',
      overflow: fullWidth ? 'visible' : 'hidden',
      height: fullWidth ? 'auto' : '100%',
    }}>
      {!fullWidth && (
        <div style={{ padding: '13px 18px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ fontWeight: 800, fontSize: '.9rem', color: C.text }}>Team Trackers</div>
          <div style={{ fontSize: '.73rem', color: C.textMuted, marginTop: 1 }}>Purse &amp; squad status</div>
        </div>
      )}

      <div style={{ flex: 1, overflowY: fullWidth ? 'visible' : 'auto', padding: fullWidth ? '0' : 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {teamNames.map(teamName => (
            <TeamCard key={teamName} teamName={teamName} team={rosterMap[teamName]} defaultExpanded={defaultExpanded} />
          ))}
        </div>
      </div>
    </aside>
  )
}
