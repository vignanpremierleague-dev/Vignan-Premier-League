import { useState, useEffect } from 'react'
import { Flame, RefreshCw, Users, Star } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { fetchPublicPlayers } from '../lib/publicApi'
import { fetchSiteSettings } from '../lib/adminApi'
import { buildRosterMap, formatName } from '../lib/auction'
import { ROLE_LABEL } from '../auction/tokens'

const CACHE_KEY = 'vpl_public_teams_cache'
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function useFadeIn(delay = 0) {
  const [v, setV] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setV(true), delay)
    return () => clearTimeout(t)
  }, [delay])
  return v
}

function TeamCard({ teamName, teamData, index }) {
  const visible = useFadeIn(100 + index * 100)
  
  if (!teamData || teamData.roster.length === 0) return null

  // Sort roster: Captain first, then alphabetically
  const roster = [...teamData.roster].sort((a, b) => {
    if (a.is_captain) return -1
    if (b.is_captain) return 1
    return a.name.localeCompare(b.name)
  })

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(16px)',
      transition: 'opacity .5s ease, transform .5s ease',
      border: '1px solid #222',
      borderRadius: 12,
      background: '#111',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '"DM Sans",system-ui,sans-serif'
    }}>
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222', paddingBottom: '16px', marginBottom: '16px' }}>
        <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800 }}>{teamName}</div>
        <div style={{ color: '#666', fontSize: '.85rem' }}>{teamData.ownerName || 'Owner Name'}</div>
      </div>

      {/* Roster List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {roster.map(p => {
          const roleLabel = ROLE_LABEL[p.role] || p.role || 'Player'
          
          return (
            <div key={p.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 16px', background: '#161616', borderRadius: '8px',
              border: '1px solid #1a1a1a'
            }}>
              <div style={{ color: p.is_captain ? '#f5a100' : '#ddd', fontSize: '.9rem', fontWeight: p.is_captain ? 700 : 500 }}>
                {formatName(p.name)} {p.is_captain && '(C)'}
              </div>
              <div style={{ color: '#888', fontSize: '.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                {roleLabel}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function TeamsPublic() {
  const headVis = useFadeIn(60)
  const [loading, setLoading] = useState(true)
  const [rosterMap, setRosterMap] = useState({})
  const [teamNames, setTeamNames] = useState([])
  const [lastRefreshed, setLastRefreshed] = useState(null)

  const fetchTeamsData = async (forceRefresh = false) => {
    setLoading(true)
    try {
      let players = []
      let siteSettings = null
      const now = Date.now()
      
      // Try cache first
      if (!forceRefresh) {
        try {
          const cached = JSON.parse(localStorage.getItem(CACHE_KEY))
          if (cached && cached.timestamp && (now - cached.timestamp < CACHE_TTL) && Array.isArray(cached.players)) {
            players = cached.players
            siteSettings = cached.siteSettings
            setLastRefreshed(new Date(cached.timestamp))
          }
        } catch (e) { console.error('Cache read error', e) }
      }

      // If no cache or forced refresh, hit the API
      if (players.length === 0 || !siteSettings) {
        const [pData, sData] = await Promise.all([
          fetchPublicPlayers(),
          fetchSiteSettings()
        ])
        players = pData
        siteSettings = sData
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          timestamp: now,
          players,
          siteSettings
        }))
        setLastRefreshed(new Date(now))
      }

      // Extract owners
      const allTeams = [...(siteSettings?.teams?.A || []), ...(siteSettings?.teams?.B || [])]
      const ownersMap = {}
      allTeams.forEach(t => {
        if (t.name && t.ownerName) ownersMap[t.name] = t.ownerName
      })

      // Process players into teams
      const soldPlayers = players.filter(p => p.auction_status === 'sold' && p.sold_to)
      const uniqueTeams = [...new Set(soldPlayers.map(p => p.sold_to))].sort()
      
      const map = buildRosterMap(players, uniqueTeams)
      uniqueTeams.forEach(tName => {
        if (map[tName]) {
          map[tName].ownerName = ownersMap[tName] || 'Owner Name'
        }
      })
      
      setTeamNames(uniqueTeams)
      setRosterMap(map)
      
    } catch (error) {
      console.error('Failed to load teams:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeamsData()
  }, [])

  return (
    <div style={{
      minHeight: '100vh', background: '#070707',
      fontFamily: '"DM Sans",system-ui,sans-serif', color: '#efefef',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient orbs */}
      <div style={{ position: 'fixed', top: '-12%', right: '-8%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,107,34,.05) 0%,transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-10%', left: '-10%', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle,rgba(230,57,70,.04) 0%,transparent 65%)', pointerEvents: 'none' }} />

      <Navbar breadcrumb="Teams" />

      {/* Content */}
      <main style={{ flex: 1, maxWidth: 1080, width: '100%', margin: '0 auto', padding: '56px 20px 72px', position: 'relative', zIndex: 1 }}>

        {/* Page heading */}
        <div style={{
          opacity: headVis ? 1 : 0, transform: headVis ? 'translateY(0)' : 'translateY(-18px)',
          transition: 'all .6s ease', textAlign: 'center', marginBottom: 56,
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontFamily: '"Syne", sans-serif', fontSize: '2.5rem', fontWeight: 800, margin: 0, color: '#fff' }}>Teams</h1>
          </div>    

          <p style={{ color: '#bbb', fontSize: '.88rem', lineHeight: 1.75, maxWidth: 500, margin: '0 auto 20px' }}>
            Meet the official franchises and their star-studded rosters for the upcoming season.
          </p>
          
          {lastRefreshed && !loading && (
            <div style={{ fontSize: '.65rem', color: '#666', marginTop: 8 }}>
              Last updated: {lastRefreshed.toLocaleTimeString()}
            </div>
          )}

          <div style={{ width: 48, height: 3, background: 'linear-gradient(90deg,#ff6b22,#e63946)', borderRadius: 2, margin: '20px auto 0' }} />
        </div>

        {/* Teams Grid */}
        <div className="teams-grid" style={{ 
          display: 'grid', 
          gap: 20,
          alignItems: 'start'
        }}>
          {teamNames.map((teamName, i) => (
            <TeamCard key={teamName} teamName={teamName} teamData={rosterMap[teamName]} index={i} />
          ))}
          {teamNames.length === 0 && !loading && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 60, color: '#888', border: '1px dashed rgba(255,255,255,.1)', borderRadius: 16 }}>
              <Users size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
              <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>No Teams Formed Yet</div>
              <p style={{ fontSize: '.85rem', marginTop: 8 }}>Wait for the auction to begin and teams to start buying players.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
      
      <style>{`
        .teams-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        @media (max-width: 768px) {
          .teams-grid {
            grid-template-columns: 1fr;
          }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
