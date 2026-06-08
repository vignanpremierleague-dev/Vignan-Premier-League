import { ChevronLeft, Shield, Trophy } from 'lucide-react'
import { useMemo, useState } from 'react'
import { buildRosterMap, formatCr, getTeamsFromSettings } from '../lib/auction'

export default function TeamsPanel({ players, siteSettings }) {
  const [selectedTeam, setSelectedTeam] = useState(null)

  const teamNames = useMemo(() => getTeamsFromSettings(siteSettings), [siteSettings])
  const rosterMap = useMemo(() => buildRosterMap(players, teamNames), [players, teamNames])

  if (selectedTeam && rosterMap[selectedTeam]) {
    const team = rosterMap[selectedTeam]
    const pct = Math.round((team.squadCount / 12) * 100)

    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.2s ease-out' }}>
        <button onClick={() => setSelectedTeam(null)} style={{
          display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none',
          color: '#8a8a8a', cursor: 'pointer', fontFamily: '"DM Sans"', fontWeight: 600, fontSize: '.9rem',
          padding: 0, width: 'fit-content'
        }}>
          <ChevronLeft size={16} /> Back to Franchises
        </button>

        {/* Detailed Team Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1a1e 0%, #111111 100%)',
          border: '1px solid rgba(255,107,34,.2)', borderRadius: 16, padding: '32px 40px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 12px 40px rgba(0,0,0,.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 80, height: 80, borderRadius: 20, background: 'rgba(255,107,34,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,107,34,.2)' }}>
              <Shield size={40} color="#ff6b22" />
            </div>
            <div>
              <h2 style={{ margin: '0 0 8px', fontFamily: '"Syne"', fontSize: '2.4rem', fontWeight: 900, color: '#efefef', letterSpacing: '.02em' }}>{selectedTeam}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: team.captain ? '#f5a100' : '#8a8a8a', fontSize: '1rem', fontWeight: 600 }}>
                {team.captain ? <><Trophy size={16} /> Captain: {team.captain.name}</> : 'No captain appointed'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 40, textAlign: 'right' }}>
            <div>
              <div style={{ fontSize: '.8rem', color: '#6a6a6a', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700, marginBottom: 8 }}>Remaining Purse</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ff6b22', fontFamily: '"DM Sans"' }}>{formatCr(team.remainingPurse)}</div>
            </div>
            <div>
              <div style={{ fontSize: '.8rem', color: '#6a6a6a', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700, marginBottom: 8 }}>Squad Size</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#efefef', fontFamily: '"DM Sans"' }}>
                {team.squadCount}<span style={{ color: '#5a5a5a', fontSize: '1.4rem' }}>/12</span>
              </div>
            </div>
          </div>
        </div>

        {/* Squad Capacity Bar */}
        <div style={{ padding: '0 10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '.8rem', fontWeight: 700, color: '#8a8a8a', textTransform: 'uppercase', letterSpacing: '.05em' }}>
            <span>Squad Fill Status</span>
            <span>{pct}%</span>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,.06)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #ff6b22, #ff4b00)', borderRadius: 3, transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }} />
          </div>
        </div>

        {/* Detailed Roster List */}
        <div>
          <h3 style={{ fontFamily: '"Syne"', fontSize: '1.4rem', fontWeight: 800, color: '#efefef', margin: '0 0 16px', paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,.08)' }}>
            Current Roster
          </h3>
          
          {team.roster.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center', background: '#111111', borderRadius: 16, border: '1px dashed rgba(255,255,255,.1)' }}>
              <Users size={48} color="#333" style={{ marginBottom: 16 }} />
              <div style={{ color: '#8a8a8a', fontSize: '1.1rem', fontWeight: 600 }}>No players acquired yet.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {team.roster.map(player => (
                <div key={player.id} style={{
                  background: '#161618', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, padding: 16,
                  display: 'flex', flexDirection: 'column', gap: 12, transition: 'transform 0.2s', cursor: 'default'
                }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#efefef', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {player.name}
                        {player.is_captain && <Trophy size={14} color="#f5a100" />}
                      </div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                        <span style={{ fontSize: '.7rem', fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: 'rgba(255,255,255,.05)', color: '#8a8a8a', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                          #{player.registration_id}
                        </span>
                        <span style={{ fontSize: '.7rem', fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: 'rgba(255,107,34,.1)', color: '#ff6b22', border: '1px solid rgba(255,107,34,.2)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                          {player.role.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '.75rem', color: '#6a6a6a', fontWeight: 600 }}>SOLD PRICE</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ff6b22', fontFamily: '"DM Sans"' }}>{formatCr(player.bid_amount)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      </div>
    )
  }

  // OVERVIEW GRID
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,.08)', paddingBottom: 16 }}>
        <div>
          <h2 style={{ fontFamily: '"Syne"', fontSize: '1.6rem', fontWeight: 800, margin: '0 0 6px', color: '#efefef' }}>Franchises</h2>
          <p style={{ margin: 0, color: '#8a8a8a', fontSize: '.9rem' }}>Select a team to view their full roster and details.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
        {teamNames.map(teamName => {
          const team = rosterMap[teamName]
          const pct = Math.round((team.squadCount / 12) * 100)

          return (
            <button key={teamName} onClick={() => setSelectedTeam(teamName)} style={{
              background: '#111111', border: '1px solid rgba(255,255,255,.08)',
              borderRadius: 16, padding: '24px', cursor: 'pointer', textAlign: 'left',
              display: 'flex', flexDirection: 'column', gap: 20, transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative', overflow: 'hidden'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,107,34,.4)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,.4)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,107,34,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Shield size={24} color="#ff6b22" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.25rem', color: '#efefef', letterSpacing: '.02em', fontFamily: '"Syne"' }}>{teamName}</h3>
                  <div style={{ fontSize: '.75rem', color: team.captain ? '#f5a100' : '#6a6a6a', marginTop: 4, fontWeight: 600 }}>
                    {team.captain ? `⭐ ${team.captain.name}` : 'No captain'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', background: '#161618', padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,.04)' }}>
                <div>
                  <div style={{ fontSize: '.65rem', color: '#6a6a6a', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700, marginBottom: 4 }}>Purse</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ff6b22', fontFamily: '"DM Sans"' }}>{formatCr(team.remainingPurse)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '.65rem', color: '#6a6a6a', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700, marginBottom: 4 }}>Squad</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#efefef', fontFamily: '"DM Sans"' }}>{team.squadCount}<span style={{ color: '#5a5a5a' }}>/12</span></div>
                </div>
              </div>

              <div style={{ height: 3, background: 'rgba(255,255,255,.06)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #ff6b22, #ff4b00)', borderRadius: 2 }} />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
