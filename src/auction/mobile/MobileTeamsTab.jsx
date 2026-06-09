import TeamPanel from '../TeamPanel'
import { C } from '../tokens'

export default function MobileTeamsTab({ teamNames, rosterMap }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 16px' }}>
      {/* Section header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 800, fontSize: '.95rem', color: C.text }}>Team Trackers</div>
        <div style={{ fontSize: '.75rem', color: C.textMuted, marginTop: 2 }}>Purse &amp; squad status</div>
      </div>

      {/* Full-width TeamPanel, no internal scroll */}
      <TeamPanel teamNames={teamNames} rosterMap={rosterMap} defaultExpanded fullWidth />
    </div>
  )
}
