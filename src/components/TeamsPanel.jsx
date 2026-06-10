import { useMemo, useState } from 'react'
import { buildRosterMap, getTeamsFromSettings } from '../lib/auction'
export default function TeamsPanel({ players, siteSettings }) {
  const teamNames = useMemo(() => getTeamsFromSettings(siteSettings), [siteSettings])
  const rosterMap = useMemo(() => buildRosterMap(players, teamNames), [players, teamNames])
  const allTeams = [...(siteSettings?.teams?.A || []), ...(siteSettings?.teams?.B || [])]

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.2s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,.08)', paddingBottom: 16 }}>
        <div>
          <h2 style={{ fontFamily: '"Syne"', fontSize: '1.6rem', fontWeight: 800, margin: '0 0 6px', color: '#efefef' }}>Franchises</h2>
          <p style={{ margin: 0, color: '#8a8a8a', fontSize: '.9rem' }}>Clean overview of team squads and their owners.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
        {teamNames.map(teamName => {
          const roster = rosterMap[teamName] || { roster: [], captain: null }
          const sortedRoster = [...roster.roster].sort((a, b) => {
            if (a.is_captain) return -1
            if (b.is_captain) return 1
            return a.name.localeCompare(b.name)
          })

          let ownerName = 'Owner Name'
          const matchedTeam = allTeams.find(t => t.name === teamName)
          if (matchedTeam && matchedTeam.ownerName) ownerName = matchedTeam.ownerName

          return (
            <div key={teamName} style={{ background: '#111', border: '1px solid #222', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222', paddingBottom: 16, marginBottom: 16 }}>
                <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800 }}>{teamName}</div>
                <div style={{ color: '#666', fontSize: '.85rem' }}>{ownerName}</div>
              </div>
              
              {sortedRoster.length ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {sortedRoster.map(player => {
                    const roleLabel = player.role ? player.role.replace(/_/g, ' ') : 'Player'
                    return (
                      <div key={player.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#161616', borderRadius: 8, border: '1px solid #1a1a1a' }}>
                        <div style={{ color: player.is_captain ? '#f5a100' : '#ddd', fontSize: '.9rem', fontWeight: player.is_captain ? 700 : 500 }}>
                          {player.name} {player.is_captain && '(C)'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ color: '#888', fontSize: '.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                            {roleLabel}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={{ color: '#5a5a5a', fontSize: '.8rem' }}>No players assigned yet.</div>
              )}
            </div>
          )
        })}
      </div>

    </div>
  )
}
