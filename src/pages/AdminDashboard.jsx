import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchAdminPlayers, verifyAdminPlayer, blockAdminPlayerDevice, unblockAdminPlayerDevice, logoutAdmin, updateSiteSettings, fetchSiteSettings, updatePlayerDetails } from '../lib/adminApi'
import { uploadToCloudinary } from '../lib/cloudinary'
import { buildRosterMap, formatCr, getAuctionConfig, getPlayerBasePrice, getTeamsFromSettings } from '../lib/auction'
import {
  Flame, LogOut, ShieldCheck, Users, CreditCard,
  RefreshCw, CheckCircle, XCircle, ExternalLink, Search,
  User as UserIcon, X as XIcon, ChevronLeft, ChevronRight, Settings, Plus, Trash2, Upload, Shield
} from 'lucide-react'
import TeamsPanel from '../components/TeamsPanel'

const TABS = [
  { id: 'payments', label: 'Payments', icon: <CreditCard size={18} /> },
  { id: 'teams',    label: 'Teams',    icon: <Shield size={18} />     },
  { id: 'auction',  label: 'Players',  icon: <Users size={18} />      },
  { id: 'edit_players', label: 'Edit Details', icon: <Settings size={18} /> },
  { id: 'qr_setup', label: 'Payment QR Setup', icon: <ExternalLink size={18} /> },
  { id: 'cms',      label: 'Site Data', icon: <Settings size={18} />   },
  { id: 'schedule', label: 'Tournament', icon: <span style={{ transform: 'rotate(90deg)' }}><Users size={18} /></span> },
]

const ROLE_OPTIONS = [
  { v: 'all',                    l: 'All Players' },
  { v: 'batsman',                l: 'Batsmen' },
  { v: 'bowler',                 l: 'Bowlers' },
  { v: 'wicket_keeper_batsman',  l: 'Wicket Keepers' },
  { v: 'all_rounder',            l: 'All Rounders' },
]

const TAB_STORAGE_KEY = 'vpl_admin_active_tab'
const DEFAULT_STUDENT_COORDINATORS = [
  { name: 'D. sai suraj', section: 'Student Coordinator', phone: '' },
  { name: 'K.Revanth sai', section: 'Student Coordinator', phone: '' },
  { name: 'K.Rohith kumar', section: 'Student Coordinator', phone: '' },
  { name: 'M.Aravind Reddy', section: 'Student Coordinator', phone: '' },
  { name: 'M.Harish', section: 'Student Coordinator', phone: '' },
  { name: 'M. Sai Charan', section: 'Student Coordinator', phone: '' },
  { name: 'M.v.janardhan', section: 'Student Coordinator', phone: '' },
  { name: 'N.gagan', section: 'Student Coordinator', phone: '' },
  { name: 'P.Sagar', section: 'Student Coordinator', phone: '' },
  { name: 'Sk.Imam', section: 'Student Coordinator', phone: '' },
  { name: 'T.Revanth Goud', section: 'Student Coordinator', phone: '' },
]
const DEFAULT_TIMELINE_EVENTS = [
  { title: 'Registrations Open', date: 'Coming Soon', desc: 'Register online and pay the Rs.300 entry fee to join the player pool.' },
  { title: 'Player Auction', date: 'Coming Soon', desc: 'Faculty team owners bid for players in a high-energy live auction.' },
  { title: 'Team Reveal', date: 'Coming Soon', desc: 'Final squads announced and jersey numbers assigned.' },
  { title: 'League Matches', date: 'Coming Soon', desc: 'Round-robin T10 league stage where every match and every ball counts.' },
  { title: 'Knockouts & Finals', date: 'Coming Soon', desc: 'Semi-finals and the Grand Finale for the VPL championship.' },
  { title: 'Awards Ceremony', date: 'Coming Soon', desc: 'Best Batsman, Bowler, and Player of the Tournament will be recognized.' },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const token = localStorage.getItem('vpl_admin_token')
  const [tab, setTab]               = useState(() => {
    const saved = localStorage.getItem(TAB_STORAGE_KEY)
    return TABS.some(t => t.id === saved) ? saved : 'payments'
  })
  const [players, setPlayers]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [search, setSearch]         = useState('')
  const [spotlight, setSpotlight]   = useState(null)
  const [isCompact, setIsCompact]   = useState(() => window.innerWidth < 1024)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  // CMS State
  const [siteSettings, setSiteSettings] = useState(null)
  const [savingCMS, setSavingCMS] = useState(false)

  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem('vpl_admin_token')
    localStorage.removeItem('vpl_admin')
    navigate('/admin')
  }, [navigate])

  const logout = () => {
    if (token) logoutAdmin(token).catch(() => {})
    handleUnauthorized()
  }

  const fetchData = useCallback(async () => {
    if (!token) {
      setError('Your session expired. Please sign in again.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      const [{ players: rows }, settingsData] = await Promise.all([
        fetchAdminPlayers(token),
        fetchSiteSettings()
      ])
      setPlayers(rows || [])
      setSiteSettings(settingsData || null)
    } catch (err) {
      if (err.message === 'Unauthorized') {
        handleUnauthorized()
        return
      }
      setError(err.message || 'Failed to load data.')
    } finally {
      setLoading(false)
    }
  }, [handleUnauthorized, token])

  useEffect(() => {
    if (!localStorage.getItem('vpl_admin_token')) { navigate('/admin'); return }
    fetchData()
  }, [fetchData, navigate])

  useEffect(() => {
    localStorage.setItem(TAB_STORAGE_KEY, tab)
  }, [tab])

  useEffect(() => {
    const onResize = () => setIsCompact(window.innerWidth < 1024)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const verifyPlayer = async (id) => {
    try {
      await verifyAdminPlayer(token, id)
      setPlayers(prev => prev.map(p => p.id === id ? { ...p, is_verified: true } : p))
    } catch (err) {
      if (err.message === 'Unauthorized') handleUnauthorized()
      else alert('Update failed: ' + (err.message || 'Request failed.'))
    }
  }

  const blockPlayerDevice = async (id) => {
    try {
      const { player } = await blockAdminPlayerDevice(token, id)
      setPlayers(prev => prev.map((p) => p.id === id ? player : p))
    } catch (err) {
      if (err.message === 'Unauthorized') handleUnauthorized()
      else alert('Block failed: ' + (err.message || 'Request failed.'))
    }
  }

  const unblockPlayerDevice = async (id) => {
    try {
      const { player } = await unblockAdminPlayerDevice(token, id)
      setPlayers(prev => prev.map((p) => p.id === id ? player : p))
    } catch (err) {
      if (err.message === 'Unauthorized') handleUnauthorized()
      else alert('Unblock failed: ' + (err.message || 'Request failed.'))
    }
  }

  const handleSaveCMS = async (newSettings) => {
    setSavingCMS(true)
    try {
      await updateSiteSettings(token, newSettings)
      setSiteSettings(newSettings)
      alert('Site content updated successfully.')
    } catch (err) {
      if (err.message === 'Unauthorized') handleUnauthorized()
      else alert('Failed to save settings: ' + err.message)
    } finally {
      setSavingCMS(false)
    }
  }

  const unverified = players.filter(p => !p.is_verified)

  const verifiedPlayers = players.filter(p => p.is_verified)

  const rosteredPlayers = verifiedPlayers.filter(p => {
    const matchRole = roleFilter === 'all' || p.role === roleFilter
    const matchSearch = search === '' ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.registration_id?.toLowerCase().includes(search.toLowerCase())
    return matchRole && matchSearch
  })

  return (
    <div className="admin-shell" style={{ display: 'flex', flexDirection: isCompact ? 'column' : 'row', minHeight: '100vh', background: '#0a0a0a', fontFamily: '"DM Sans",system-ui,sans-serif', color: '#efefef' }}>

      {/* Full-screen player spotlight */}
      {spotlight !== null && (
        <PlayerSpotlight
          players={rosteredPlayers}
          index={spotlight}
          onNavigate={setSpotlight}
          onClose={() => setSpotlight(null)}
        />
      )}

      {/* ── Sidebar (Desktop) / Bottom Bar (Mobile) ── */}
      {!isCompact ? (
        <aside className="admin-sidebar" style={{
          width: sidebarCollapsed ? 76 : 260, flexShrink: 0,
          background: '#111111', borderRight: '1px solid rgba(255,255,255,.08)',
          display: 'flex', flexDirection: 'column',
          transition: 'width .2s ease',
          overflow: 'hidden'
        }}>
          <div style={{ padding: sidebarCollapsed ? '24px 10px' : '24px 20px', borderBottom: '1px solid rgba(255,255,255,.08)', display: 'flex', justifyContent: 'center' }}>
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                margin: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                outline: 'none'
              }}
            >
              <Flame size={20} color="#ff6b22" style={{ flexShrink: 0 }} />
              {!sidebarCollapsed && (
                <span style={{ fontFamily: '"Syne"', fontWeight: 800, color: '#efefef', fontSize: '1.2rem', whiteSpace: 'nowrap' }}>
                  VPL Admin
                </span>
              )}
            </button>
          </div>

          <nav className="admin-nav" style={{ flex: 1, padding: sidebarCollapsed ? '20px 8px' : '20px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: sidebarCollapsed ? '12px' : '12px 16px', borderRadius: 10, cursor: 'pointer',
                fontFamily: '"DM Sans"', fontWeight: 600, fontSize: '.9rem',
                border: 'none',
                background: tab === t.id ? 'rgba(255,107,34,.1)' : 'transparent',
                color: tab === t.id ? '#ff6b22' : '#8a8a8a',
                transition: 'all .2s', textAlign: 'left',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                  {t.icon}
                </div>
                {!sidebarCollapsed && <span style={{ flex: 1 }}>{t.label}</span>}
                
                {t.id === 'payments' && unverified.length > 0 && (
                  sidebarCollapsed ? (
                    <span style={{
                      position: 'absolute', top: 4, right: 4,
                      background: '#ff6b22', color: '#fff', fontSize: '.55rem', fontWeight: 900,
                      borderRadius: 99, padding: '1px 4px', minWidth: 12, textAlign: 'center'
                    }}>
                      {unverified.length}
                    </span>
                  ) : (
                    <span style={{ background: '#ff6b22', color: '#fff', fontSize: '.65rem', fontWeight: 800, borderRadius: 99, padding: '2px 8px' }}>
                      {unverified.length}
                    </span>
                  )
                )}
              </button>
            ))}
          </nav>

          <div style={{ padding: sidebarCollapsed ? '10px 8px' : '10px 20px 0', borderTop: '1px solid rgba(255,255,255,.08)' }}>
            <button onClick={() => window.open('/admin/auction', '_blank')} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: sidebarCollapsed ? 0 : 8, width: '100%',
              background: 'linear-gradient(135deg, #ff6b22 0%, #ff4b00 100%)', border: 'none',
              borderRadius: 8, padding: '10px 14px', cursor: 'pointer',
              color: '#fff', fontSize: '.85rem', fontWeight: 700,
              boxShadow: '0 4px 12px rgba(255,107,34,.25)',
              transition: 'all .25s ease'
            }}>
              <Flame size={16} style={{ flexShrink: 0 }} />
              {!sidebarCollapsed && <span>Host Live Auction</span>}
            </button>
          </div>

          <div style={{ padding: sidebarCollapsed ? '10px 8px 20px' : '10px 20px 20px' }}>
            <button onClick={logout} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: sidebarCollapsed ? 0 : 8, width: '100%',
              background: 'transparent', border: '1px solid rgba(230,57,70,.25)',
              borderRadius: 8, padding: '10px 14px', cursor: 'pointer',
              color: '#e63946', fontSize: '.85rem', fontWeight: 600,
            }}>
              <LogOut size={16} style={{ flexShrink: 0 }} />
              {!sidebarCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        </aside>
      ) : (
        // Mobile bottom navigation bar
        <nav className="admin-nav-mobile" style={{
          position: 'fixed', bottom: 10, left: 10, right: 10, height: 62,
          background: 'rgba(14,14,14,.92)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,.08)', borderRadius: 16,
          display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
          padding: '0 4px', zIndex: 500, boxShadow: '0 12px 40px rgba(0,0,0,.75)'
        }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 3, padding: '4px 6px', borderRadius: 8, cursor: 'pointer', flex: 1,
              fontFamily: '"DM Sans"', fontWeight: 700, fontSize: '.63rem',
              border: 'none', background: 'transparent',
              color: tab === t.id ? '#ff6b22' : '#7a7a7a',
              transition: 'all .2s', position: 'relative'
            }}>
              <div style={{ transform: tab === t.id ? 'scale(1.1) translateY(-1px)' : 'scale(1)', transition: 'transform .2s', color: tab === t.id ? '#ff6b22' : '#7a7a7a' }}>
                {t.icon}
              </div>
              <span style={{ fontSize: '.58rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.02em', display: 'block' }}>
                {t.label.split(' ')[0]}
              </span>
              {t.id === 'payments' && unverified.length > 0 && (
                <span style={{
                  position: 'absolute', top: 2, right: '18%',
                  background: '#ff6b22', color: '#fff', fontSize: '.55rem', fontWeight: 900,
                  borderRadius: 99, padding: '1px 5px', minWidth: 14, textAlign: 'center'
                }}>
                  {unverified.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      )}

      {/* ── Main Content ── */}
      <main className="admin-main" style={{ flex: 1, height: isCompact ? 'auto' : '100vh', overflowY: 'auto', minWidth: 0, paddingBottom: isCompact ? 90 : 0 }}>
        {isCompact ? (
          // Mobile Topbar
          <header className="admin-topbar-mobile" style={{
            position: 'sticky', top: 0, zIndex: 100,
            background: 'rgba(10,10,10,.85)', backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(255,255,255,.08)',
            padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Flame size={18} color="#ff6b22" />
              <span style={{ fontFamily: '"Syne"', fontWeight: 800, color: '#efefef', fontSize: '1.05rem' }}>VPL Admin</span>
              <span style={{ fontSize: '.68rem', fontWeight: 800, background: 'rgba(255,107,34,.12)', color: '#ff6b22', padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                {TABS.find(t=>t.id===tab)?.label.split(' ')[0]}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={fetchData} title="Refresh"
                style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, cursor: 'pointer', color: '#a0a0a0', padding: 8, display: 'flex' }}>
                <RefreshCw size={14} />
              </button>
              <button onClick={logout} title="Sign Out"
                style={{ background: 'rgba(230,57,70,.08)', border: '1px solid rgba(230,57,70,.25)', borderRadius: 8, cursor: 'pointer', color: '#e63946', padding: 8, display: 'flex' }}>
                <LogOut size={14} />
              </button>
            </div>
          </header>
        ) : (
          // Desktop Topbar
          <header className="admin-topbar" style={{
            position: 'sticky', top: 0, zIndex: 100,
            background: 'rgba(10,10,10,.9)', backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(255,255,255,.08)',
            padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <h1 style={{ fontFamily: '"Syne"', fontWeight: 700, fontSize: '1.4rem' }}>
              {TABS.find(t=>t.id===tab)?.label}
            </h1>
            <button onClick={fetchData} title="Refresh"
              style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, cursor: 'pointer', color: '#a0a0a0', padding: 8, display: 'flex' }}>
              <RefreshCw size={16} />
            </button>
          </header>
        )}

        <div className="admin-content" style={{ padding: isCompact ? '16px 12px' : '32px' }}>
          {error && (
            <div style={{ padding: '14px 18px', background: 'rgba(230,57,70,.08)', border: '1px solid rgba(230,57,70,.25)', borderRadius: 12, marginBottom: 20, color: '#e63946', fontSize: '.85rem' }}>
              ⚠️ {error}
            </div>
          )}
          
          {loading && !players.length && <p style={{ color: '#5a5a5a', textAlign: 'center', padding: '60px 0' }}>Loading data…</p>}

          {/* Tab Content Mapping */}
          {!loading && tab === 'payments' && (
            <PaymentPanel players={players} unverified={unverified} onVerify={verifyPlayer} onBlockDevice={blockPlayerDevice} onUnblockDevice={unblockPlayerDevice} isCompact={isCompact} />
          )}

          {!loading && tab === 'teams' && siteSettings && (
            <TeamsPanel players={players} siteSettings={siteSettings} />
          )}

          {!loading && tab === 'auction' && (
            <AuctionPanel players={rosteredPlayers} allCount={verifiedPlayers.length}
              roleFilter={roleFilter} setRoleFilter={setRoleFilter}
              search={search} setSearch={setSearch}
              onSelect={(idx) => setSpotlight(idx)} isCompact={isCompact} />
          )}

          {!loading && tab === 'edit_players' && (
            <EditPlayersPanel players={players} setPlayers={setPlayers} token={token} handleUnauthorized={handleUnauthorized} isCompact={isCompact} siteSettings={siteSettings} setSiteSettings={setSiteSettings} />
          )}

          {!loading && tab === 'qr_setup' && siteSettings && (
            <PaymentQRPanel settings={siteSettings} onSave={handleSaveCMS} saving={savingCMS} isCompact={isCompact} />
          )}

          {!loading && tab === 'cms' && siteSettings && (
            <CMSPanel settings={siteSettings} onSave={handleSaveCMS} saving={savingCMS} isCompact={isCompact} />
          )}

          {!loading && tab === 'schedule' && (
            <SchedulePanel settings={siteSettings} onSave={handleSaveCMS} saving={savingCMS} isCompact={isCompact} players={players} />
          )}
        </div>
      </main>
      <style>{`
        .admin-shell * { box-sizing: border-box; }
        .admin-shell input, .admin-shell select {
          outline: none;
          border: 1px solid rgba(255,255,255,.12) !important;
          transition: border-color .2s, background .2s;
        }
        .admin-shell input:focus, .admin-shell select:focus {
          border-color: rgba(255,107,34,.45) !important;
        }
        .admin-shell button {
          transition: all .2s ease;
        }
        .admin-shell button:hover {
          filter: brightness(1.06);
        }
        .admin-nav::-webkit-scrollbar { height: 6px; }
        .admin-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,.18); border-radius: 99px; }
      `}</style>
    </div>
  )
}

/* ─────────────────────────────────────────────── */
/*  Payment Verification Panel                     */
/* ─────────────────────────────────────────────── */
function PaymentPanel({ players, unverified, onVerify, onBlockDevice, onUnblockDevice, isCompact }) {
  const [showAll, setShowAll] = useState(false)
  const [openScreenshotIndex, setOpenScreenshotIndex] = useState(null)
  const displayed = showAll ? players : unverified

  // Close overlay on Escape
  useEffect(() => {
    if (openScreenshotIndex === null) return
    const fn = (e) => {
      if (e.key === 'Escape') setOpenScreenshotIndex(null)
      if (e.key === 'ArrowRight' && openScreenshotIndex < displayed.length - 1) setOpenScreenshotIndex(prev => prev + 1)
      if (e.key === 'ArrowLeft' && openScreenshotIndex > 0) setOpenScreenshotIndex(prev => prev - 1)
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [openScreenshotIndex, displayed])

  const activeP = openScreenshotIndex !== null ? displayed[openScreenshotIndex] : null

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <p style={{ color: '#8a8a8a', fontSize: '1rem' }}>Ensure UTR numbers match screenshots exactly.</p>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#a0a0a0', fontSize: '.85rem' }}>
          <input type="checkbox" checked={showAll} onChange={e => setShowAll(e.target.checked)}
            style={{ accentColor: '#ff6b22', width: 16, height: 16 }} />
          Show all (including verified)
        </label>
      </div>

      {displayed.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#5a5a5a' }}>
          <CheckCircle size={48} color="#22c55e" style={{ margin: '0 auto 16px' }} />
          <p style={{ fontFamily: '"Syne"', fontWeight: 700, fontSize: '1.2rem', color: '#9a9a9a' }}>All payments verified!</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {displayed.map((p, idx) => {
          if (isCompact) {
            return (
              <div key={p.id} style={{
                background: '#111113',
                border: `1.5px solid ${p.is_verified ? 'rgba(34,197,94,.35)' : 'rgba(255,255,255,.06)'}`,
                borderRadius: 16,
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                position: 'relative',
                boxShadow: '0 8px 24px rgba(0,0,0,.3)'
              }}>
                {/* Header: Player Info and Status Badge */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  borderBottom: '1px solid rgba(255,255,255,.06)',
                  paddingBottom: 12
                }}>
                  <div>
                    <p style={{ color: '#ff6b22', fontSize: '.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.1em', margin: 0 }}>Player Profile</p>
                    <h4 style={{ fontFamily: '"Syne"', fontWeight: 800, color: '#efefef', fontSize: '1.05rem', margin: '4px 0 2px 0', textTransform: 'capitalize' }}>{p.name}</h4>
                    <p style={{ color: '#8a8a8a', fontSize: '.75rem', fontFamily: 'monospace', margin: 0 }}>{p.registration_id}</p>
                  </div>
                  <div>
                    {p.is_verified ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#22c55e', fontSize: '.75rem', fontWeight: 800, background: 'rgba(34,197,94,.1)', padding: '4px 10px', borderRadius: 20 }}>
                        <CheckCircle size={12} /> VERIFIED
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f5a100', fontSize: '.75rem', fontWeight: 800, background: 'rgba(245,161,0,.1)', padding: '4px 10px', borderRadius: 20 }}>
                        <XCircle size={12} /> PENDING
                      </span>
                    )}
                  </div>
                </div>

                {/* Middle Grid: Payment Details */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px 16px'
                }}>
                  <div>
                    <p style={{ color: '#6a6a6a', fontSize: '.6rem', textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 2px 0' }}>Phone</p>
                    <p style={{ color: '#b0b0b0', fontSize: '.82rem', margin: 0, fontWeight: 600 }}>{p.phone}</p>
                  </div>
                  
                  <div>
                    <p style={{ color: '#6a6a6a', fontSize: '.6rem', textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 2px 0' }}>UTR Number</p>
                    <p style={{ fontFamily: 'monospace', color: '#ff6b22', fontSize: '.9rem', fontWeight: 800, margin: 0 }}>{p.utr_number || '—'}</p>
                  </div>

                  <div>
                    <p style={{ color: '#6a6a6a', fontSize: '.6rem', textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 2px 0' }}>IP Address</p>
                    <p style={{ color: '#b0b0b0', fontSize: '.8rem', fontFamily: 'monospace', margin: 0 }}>{p.registration_ip || '—'}</p>
                  </div>

                  <div>
                    <p style={{ color: '#6a6a6a', fontSize: '.6rem', textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 2px 0' }}>Screenshot</p>
                    {p.payment_screenshot_url ? (
                      <button
                        type="button"
                        onClick={() => setOpenScreenshotIndex(idx)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4, color: '#3b82f6',
                          fontSize: '.82rem', fontWeight: 700,
                          background: 'none', border: 'none', padding: 0, cursor: 'pointer', margin: 0
                        }}
                      >
                        <ExternalLink size={12} /> View Slip
                      </button>
                    ) : <span style={{ color: '#4a4a4a', fontSize: '.82rem', fontWeight: 600 }}>Missing</span>}
                  </div>
                </div>

                {/* Bottom Row: Fingerprint & Security */}
                <div style={{
                  background: 'rgba(10,10,10,.5)',
                  borderRadius: 8,
                  padding: '8px 10px',
                  border: '1px solid rgba(255,255,255,.03)'
                }}>
                  <p style={{ color: '#6a6a6a', fontSize: '.6rem', textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 2px 0' }}>Device Fingerprint</p>
                  <p style={{ color: '#9a9a9a', fontSize: '.72rem', fontFamily: 'monospace', wordBreak: 'break-all', margin: 0 }}>
                    {p.device_fingerprint || '—'}
                  </p>
                </div>

                {/* Footer Actions: verify, block, unblock */}
                <div style={{
                  display: 'flex',
                  gap: 10,
                  marginTop: 4,
                  borderTop: '1px solid rgba(255,255,255,.06)',
                  paddingTop: 12
                }}>
                  {!p.is_verified && (
                    <button 
                      onClick={() => onVerify(p.id)} 
                      style={{
                        flex: 1.5,
                        padding: '10px 14px', 
                        borderRadius: 8, 
                        border: 'none', 
                        cursor: 'pointer',
                        background: '#22c55e', 
                        color: '#fff', 
                        fontFamily: '"DM Sans"', 
                        fontWeight: 800, 
                        fontSize: '.8rem',
                        boxShadow: '0 4px 12px rgba(34,197,94,.2)'
                      }}
                    >
                      Verify Payment
                    </button>
                  )}

                  {p.device_blocked_at ? (
                    <button
                      onClick={() => onUnblockDevice(p.id)}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid rgba(34,197,94,.28)',
                        cursor: 'pointer',
                        background: 'rgba(34,197,94,.08)',
                        color: '#22c55e',
                        fontFamily: '"DM Sans"',
                        fontWeight: 800,
                        fontSize: '.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                      }}
                    >
                      <CheckCircle size={12} /> Unblock
                    </button>
                  ) : (
                    <button
                      onClick={() => onBlockDevice(p.id)}
                      disabled={!p.device_fingerprint}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid rgba(230,57,70,.28)',
                        cursor: p.device_fingerprint ? 'pointer' : 'not-allowed',
                        background: 'rgba(230,57,70,.08)',
                        color: p.device_fingerprint ? '#e63946' : '#6a6a6a',
                        fontFamily: '"DM Sans"',
                        fontWeight: 800,
                        fontSize: '.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                      }}
                    >
                      <ShieldCheck size={12} /> Block Device
                    </button>
                  )}
                </div>
              </div>
            )
          }

          // Desktop view
          return (
            <div key={p.id} style={{
              background: '#111113',
              border: `1.5px solid ${p.is_verified ? 'rgba(34,197,94,.35)' : 'rgba(255,255,255,.08)'}`,
              borderRadius: 16,
              padding: '24px',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 24,
              alignItems: 'center',
              boxShadow: '0 8px 24px rgba(0,0,0,.3)',
              transition: 'all .25s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = p.is_verified ? 'rgba(34,197,94,.6)' : 'rgba(255,107,34,.3)';
              e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,.5), 0 0 12px ${p.is_verified ? 'rgba(34,197,94,.1)' : 'rgba(255,107,34,.05)'}`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = p.is_verified ? 'rgba(34,197,94,.35)' : 'rgba(255,255,255,.08)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.3)';
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 20 }}>
                <div>
                  <p style={{ color: '#ff6b22', fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.12em', fontWeight: 800, marginBottom: 4 }}>Player</p>
                  <p style={{ fontFamily: '"Syne"', fontWeight: 800, color: '#efefef', fontSize: '1.05rem', margin: 0, textTransform: 'capitalize' }}>{p.name}</p>
                  <p style={{ color: '#8a8a8a', fontSize: '.8rem', fontFamily: 'monospace', marginTop: 2, marginBottom: 0 }}>{p.registration_id}</p>
                </div>
                <div>
                  <p style={{ color: '#6a6a6a', fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700, marginBottom: 4 }}>Phone</p>
                  <p style={{ color: '#b0b0b0', fontSize: '.9rem', fontWeight: 600, margin: 0 }}>{p.phone}</p>
                </div>
                <div>
                  <p style={{ color: '#6a6a6a', fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700, marginBottom: 4 }}>IP Address</p>
                  <p style={{ color: '#b0b0b0', fontSize: '.9rem', fontFamily: 'monospace', margin: 0 }}>{p.registration_ip || '—'}</p>
                </div>
                <div>
                  <p style={{ color: '#6a6a6a', fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700, marginBottom: 4 }}>UTR Number</p>
                  <p style={{ fontFamily: 'monospace', color: '#ff6b22', fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>{p.utr_number || '—'}</p>
                </div>
                <div>
                  <p style={{ color: '#6a6a6a', fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700, marginBottom: 4 }}>Screenshot</p>
                  {p.payment_screenshot_url ? (
                    <button
                      type="button"
                      onClick={() => setOpenScreenshotIndex(idx)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6, color: '#3b82f6',
                        fontSize: '.88rem', fontWeight: 700,
                        background: 'none', border: 'none', padding: 0, cursor: 'pointer', margin: 0
                      }}
                    >
                      <ExternalLink size={14} /> Full View
                    </button>
                  ) : <span style={{ color: '#4a4a4a', fontSize: '.85rem', fontWeight: 600 }}>Missing</span>}
                </div>
                <div>
                  <p style={{ color: '#6a6a6a', fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700, marginBottom: 4 }}>Device Fingerprint</p>
                  <p style={{ color: '#b0b0b0', fontSize: '.8rem', fontFamily: 'monospace', wordBreak: 'break-all', margin: 0 }}>{p.device_fingerprint || '—'}</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12, minWidth: 160, borderLeft: '1px solid rgba(255,255,255,.05)', paddingLeft: 24 }}>
                {p.is_verified ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#22c55e', fontSize: '.95rem', fontWeight: 800, background: 'rgba(34,197,94,.1)', padding: '6px 14px', borderRadius: 20 }}>
                    <CheckCircle size={16} /> Verified
                  </span>
                ) : (
                  <>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f5a100', fontSize: '.85rem', fontWeight: 700 }}>
                      <XCircle size={15} /> Pending Action
                    </span>
                    <button onClick={() => onVerify(p.id)} style={{
                      padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: '#22c55e', color: '#fff', fontFamily: '"DM Sans"', fontWeight: 800, fontSize: '.85rem',
                      whiteSpace: 'nowrap', width: '100%', textAlign: 'center',
                      boxShadow: '0 4px 12px rgba(34,197,94,.2)'
                    }}>
                      Verify Payment
                    </button>
                  </>
                )}
                {p.device_blocked_at ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, width: '100%' }}>
                    <span style={{ color: '#e63946', fontSize: '.8rem', fontWeight: 800, textAlign: 'right' }}>
                      Device Blocked
                    </span>
                    <button
                      onClick={() => onUnblockDevice(p.id)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 8,
                        border: '1px solid rgba(34,197,94,.28)',
                        cursor: 'pointer',
                        background: 'rgba(34,197,94,.08)',
                        color: '#22c55e',
                        fontFamily: '"DM Sans"',
                        fontWeight: 800,
                        fontSize: '.8rem',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                        width: '100%',
                      }}
                    >
                      <CheckCircle size={12} />
                      Unblock Device
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onBlockDevice(p.id)}
                    disabled={!p.device_fingerprint}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 8,
                      border: '1px solid rgba(230,57,70,.28)',
                      cursor: p.device_fingerprint ? 'pointer' : 'not-allowed',
                      background: 'rgba(230,57,70,.08)',
                      color: p.device_fingerprint ? '#e63946' : '#6a6a6a',
                      fontFamily: '"DM Sans"',
                      fontWeight: 800,
                      fontSize: '.8rem',
                      whiteSpace: 'nowrap',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <ShieldCheck size={14} />
                    Block Device
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Fullscreen Overlay with Prev/Next Navigation */}
      {activeP && (
        <div
          onClick={() => setOpenScreenshotIndex(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 600,
            background: 'rgba(0,0,0,.92)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {/* Prev Button */}
          <button onClick={(e) => { e.stopPropagation(); if (openScreenshotIndex > 0) setOpenScreenshotIndex(openScreenshotIndex - 1) }}
            style={{ position: 'absolute', left: 40, top: '50%', transform: 'translateY(-50%)', width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,.1)', border: 'none', color: '#fff', cursor: openScreenshotIndex > 0 ? 'pointer' : 'not-allowed', opacity: openScreenshotIndex > 0 ? 1 : 0.3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={28} />
          </button>

          {/* Next Button */}
          <button onClick={(e) => { e.stopPropagation(); if (openScreenshotIndex < displayed.length - 1) setOpenScreenshotIndex(openScreenshotIndex + 1) }}
            style={{ position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%)', width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,.1)', border: 'none', color: '#fff', cursor: openScreenshotIndex < displayed.length - 1 ? 'pointer' : 'not-allowed', opacity: openScreenshotIndex < displayed.length - 1 ? 1 : 0.3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronRight size={28} />
          </button>

          <div
            onClick={e => e.stopPropagation()}
            style={{ display: 'flex', flexDirection: 'column', height: '90vh', maxWidth: 800, width: '100%', background: '#111', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,.1)' }}
          >
            {/* Top Bar with UTR prominently displayed */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '16px 24px', background: '#1a1a1a', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
               <div style={{ flex: 1 }}>
                 <p style={{ color: '#a0a0a0', fontSize: '.8rem', textTransform: 'uppercase', letterSpacing: 1 }}>{activeP.name}</p>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                    <span style={{ fontSize: '1rem', color: '#fff', fontWeight: 600 }}>UTR:</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '1.4rem', fontWeight: 800, color: '#ff6b22', background: 'rgba(255,107,34,.15)', padding: '2px 10px', borderRadius: 6 }}>
                      {activeP.utr_number}
                    </span>
                 </div>
               </div>
               <button onClick={() => setOpenScreenshotIndex(null)} style={{ background: 'rgba(255,255,255,.1)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}>
                  <XIcon size={18} />
               </button>
            </div>

            {/* Image Area */}
            <div style={{ flex: 1, padding: 20, overflow: 'hidden', display: 'flex', justifyContent: 'center', background: '#050505' }}>
              <img src={activeP.payment_screenshot_url} alt="Payment" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: 8 }} />
            </div>

            {/* Bottom Bar: Action */}
            <div style={{ padding: '20px 24px', background: '#1a1a1a', borderTop: '1px solid rgba(255,255,255,.08)', display: 'flex', justifyContent: 'center' }}>
               {!activeP.is_verified ? (
                 <button onClick={() => onVerify(activeP.id)} style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '14px 40px', fontSize: '1.1rem', fontWeight: 700, borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                   <CheckCircle size={20} /> Verify Payment
                 </button>
               ) : (
                 <div style={{ padding: '14px 40px', color: '#22c55e', background: 'rgba(34,197,94,.1)', borderRadius: 12, fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
                   <CheckCircle size={20} /> Verified
                 </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────── */
/*  CMS Controls Panel                             */
/* ─────────────────────────────────────────────── */
function buildCMSForm(settings) {
  const source = settings || {}
  const sourceCoordinators = Array.isArray(source.studentCoordinators) && source.studentCoordinators.length
    ? source.studentCoordinators
    : DEFAULT_STUDENT_COORDINATORS
  const sourceTimelineEvents = Array.isArray(source.timelineEvents) && source.timelineEvents.length
    ? source.timelineEvents
    : DEFAULT_TIMELINE_EVENTS
  const normalizedCoordinators = sourceCoordinators.map((c) => ({
    name: c?.name || '',
    section: c?.section || c?.role || '',
    phone: c?.phone || '',
  }))
  const normalizedTimelineEvents = sourceTimelineEvents.map((event, index) => ({
    title: event?.title || DEFAULT_TIMELINE_EVENTS[index]?.title || '',
    date: event?.date || 'Coming Soon',
    desc: event?.desc || DEFAULT_TIMELINE_EVENTS[index]?.desc || '',
  }))
  return {
    ...source,
    heroSeasonLabel: source.heroSeasonLabel || 'Season 1 · 2026',
    heroTitleLine1: source.heroTitleLine1 || 'VIGNAN',
    heroTitleLine2: source.heroTitleLine2 || 'PREMIER',
    heroTitleLine3: source.heroTitleLine3 || 'LEAGUE',
    heroSubtitle: source.heroSubtitle || 'T10 Format · IPL-Style Auction · Faculty Team Owners · Vignan Campus',
    heroPrimaryCtaLabel: source.heroPrimaryCtaLabel || 'Register Now',
    heroPrimaryCtaHref: source.heroPrimaryCtaHref || '/register',
    heroSecondaryCtaLabel: source.heroSecondaryCtaLabel || 'Explore',
    heroSecondaryCtaHref: source.heroSecondaryCtaHref || '#about',
    supportTitle: source.supportTitle || 'Need help?',
    supportDescription: source.supportDescription || 'Reach out for registration queries, rule clarifications, or anything about VPL 2025.',
    supportWhatsappLabel: source.supportWhatsappLabel || 'WhatsApp Group',
    supportContactLabel: source.supportContactLabel || 'All Contacts',
    registerSectionTitle: source.registerSectionTitle || 'Register Now',
    registrationClosedTitle: source.registrationClosedTitle || 'Registrations Closed',
    registrationClosedMessage: source.registrationClosedMessage || 'Player registrations for the Vignan Premier League are temporarily closed. Please check the WhatsApp group for updates or contact our coordinators.',
    timelineSectionTitle: source.timelineSectionTitle || 'Tournament Timeline',
    timelineWindow: source.timelineWindow || 'July - August',
    timelineEvents: normalizedTimelineEvents,
    studentCoordinators: normalizedCoordinators,
    winners: Array.isArray(source.winners) ? source.winners : [],
  }
}

function CMSPanel({ settings, onSave, saving, isCompact }) {
  const [form, setForm] = useState(() => buildCMSForm(settings))

  useEffect(() => {
    setForm(buildCMSForm(settings))
  }, [settings])

  const updateForm = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleArrayUpdate = (field, index, key, value) => {
    const list = [...form[field]]
    list[index][key] = value
    updateForm(field, list)
  }
  const addArrayItem = (field, template) => updateForm(field, [...form[field], template])
  const removeArrayItem = (field, index) => updateForm(field, form[field].filter((_, i) => i !== index))

  return (
    <div style={{ width: '100%', maxWidth: 'none' }}>
      <div style={{
        position: 'sticky',
        top: isCompact ? 64 : 72,
        zIndex: 50,
        marginBottom: 16,
        background: 'rgba(12,12,12,.96)',
        border: '1px solid rgba(255,255,255,.08)',
        borderRadius: 12,
        padding: isCompact ? '10px 12px' : '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}>
        <div>
          <p style={{ color: '#efefef', fontWeight: 700, fontSize: '.92rem' }}>Site Data Controls</p>
          <p style={{ color: '#7a7a7a', fontSize: '.78rem' }}>Changes reflect across the main site after save.</p>
        </div>
        <button onClick={() => onSave(form)} disabled={saving} style={{ background: '#ff6b22', color: '#fff', border: 'none', padding: '10px 20px', fontSize: '.9rem', fontWeight: 700, borderRadius: 10, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, whiteSpace: 'nowrap' }}>
          {saving ? 'Saving...' : 'Save Site Data'}
        </button>
      </div>

      {/* Registration Toggle */}
      <div style={{ background: '#111', padding: 24, borderRadius: 16, border: '1px solid rgba(255,255,255,.08)', marginBottom: 24 }}>
         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
               <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: 4 }}>Registrations Status</h3>
               <p style={{ color: '#8a8a8a', fontSize: '.9rem' }}>Toggle whether the public registration form is open or closed.</p>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 12 }}>
               <span style={{ color: form.registrationsOpen ? '#22c55e' : '#e63946', fontWeight: 700 }}>
                 {form.registrationsOpen ? 'OPEN' : 'CLOSED'}
               </span>
               <div onClick={() => updateForm('registrationsOpen', !form.registrationsOpen)} 
                    style={{ width: 50, height: 26, background: form.registrationsOpen ? '#22c55e' : '#444', borderRadius: 99, position: 'relative', transition: 'background .3s' }}>
                  <div style={{ position: 'absolute', top: 3, left: form.registrationsOpen ? 27 : 3, width: 20, height: 20, background: '#fff', borderRadius: '50%', transition: 'left .3s' }} />
               </div>
            </label>
         </div>
      </div>

      {/* Main Site Controls */}
      <div style={{ background: '#111', padding: 24, borderRadius: 16, border: '1px solid rgba(255,255,255,.08)', marginBottom: 24 }}>
         <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: 16 }}>Main Site Content</h3>
         <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: isCompact ? '1fr' : '1fr 1fr', gap: 12 }}>
              <label>
                <span style={{ display: 'block', color: '#8a8a8a', fontSize: '.85rem', marginBottom: 6 }}>Hero Season Label</span>
                <input value={form.heroSeasonLabel || ''} onChange={e => updateForm('heroSeasonLabel', e.target.value)}
                  style={{ width: '100%', padding: 12, background: '#1a1a1a', borderRadius: 8, color: '#fff', fontSize: '.95rem' }} />
              </label>
              <label>
                <span style={{ display: 'block', color: '#8a8a8a', fontSize: '.85rem', marginBottom: 6 }}>Hero Subtitle</span>
                <input value={form.heroSubtitle || ''} onChange={e => updateForm('heroSubtitle', e.target.value)}
                  style={{ width: '100%', padding: 12, background: '#1a1a1a', borderRadius: 8, color: '#fff', fontSize: '.95rem' }} />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isCompact ? '1fr' : '1fr 1fr 1fr', gap: 12 }}>
              <label>
                <span style={{ display: 'block', color: '#8a8a8a', fontSize: '.85rem', marginBottom: 6 }}>Hero Title Line 1</span>
                <input value={form.heroTitleLine1 || ''} onChange={e => updateForm('heroTitleLine1', e.target.value)}
                  style={{ width: '100%', padding: 12, background: '#1a1a1a', borderRadius: 8, color: '#fff', fontSize: '.95rem' }} />
              </label>
              <label>
                <span style={{ display: 'block', color: '#8a8a8a', fontSize: '.85rem', marginBottom: 6 }}>Hero Title Line 2</span>
                <input value={form.heroTitleLine2 || ''} onChange={e => updateForm('heroTitleLine2', e.target.value)}
                  style={{ width: '100%', padding: 12, background: '#1a1a1a', borderRadius: 8, color: '#fff', fontSize: '.95rem' }} />
              </label>
              <label>
                <span style={{ display: 'block', color: '#8a8a8a', fontSize: '.85rem', marginBottom: 6 }}>Hero Title Line 3</span>
                <input value={form.heroTitleLine3 || ''} onChange={e => updateForm('heroTitleLine3', e.target.value)}
                  style={{ width: '100%', padding: 12, background: '#1a1a1a', borderRadius: 8, color: '#fff', fontSize: '.95rem' }} />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isCompact ? '1fr' : '1fr 1fr 1fr 1fr', gap: 12 }}>
              <label>
                <span style={{ display: 'block', color: '#8a8a8a', fontSize: '.85rem', marginBottom: 6 }}>Primary CTA Label</span>
                <input value={form.heroPrimaryCtaLabel || ''} onChange={e => updateForm('heroPrimaryCtaLabel', e.target.value)}
                  style={{ width: '100%', padding: 12, background: '#1a1a1a', borderRadius: 8, color: '#fff', fontSize: '.95rem' }} />
              </label>
              <label>
                <span style={{ display: 'block', color: '#8a8a8a', fontSize: '.85rem', marginBottom: 6 }}>Primary CTA Link</span>
                <input value={form.heroPrimaryCtaHref || ''} onChange={e => updateForm('heroPrimaryCtaHref', e.target.value)}
                  style={{ width: '100%', padding: 12, background: '#1a1a1a', borderRadius: 8, color: '#fff', fontSize: '.95rem' }} />
              </label>
              <label>
                <span style={{ display: 'block', color: '#8a8a8a', fontSize: '.85rem', marginBottom: 6 }}>Secondary CTA Label</span>
                <input value={form.heroSecondaryCtaLabel || ''} onChange={e => updateForm('heroSecondaryCtaLabel', e.target.value)}
                  style={{ width: '100%', padding: 12, background: '#1a1a1a', borderRadius: 8, color: '#fff', fontSize: '.95rem' }} />
              </label>
              <label>
                <span style={{ display: 'block', color: '#8a8a8a', fontSize: '.85rem', marginBottom: 6 }}>Secondary CTA Link</span>
                <input value={form.heroSecondaryCtaHref || ''} onChange={e => updateForm('heroSecondaryCtaHref', e.target.value)}
                  style={{ width: '100%', padding: 12, background: '#1a1a1a', borderRadius: 8, color: '#fff', fontSize: '.95rem' }} />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isCompact ? '1fr' : '1fr 1fr', gap: 12 }}>
              <label>
                <span style={{ display: 'block', color: '#8a8a8a', fontSize: '.85rem', marginBottom: 6 }}>Support Section Title</span>
                <input value={form.supportTitle || ''} onChange={e => updateForm('supportTitle', e.target.value)}
                  style={{ width: '100%', padding: 12, background: '#1a1a1a', borderRadius: 8, color: '#fff', fontSize: '.95rem' }} />
              </label>
              <label>
                <span style={{ display: 'block', color: '#8a8a8a', fontSize: '.85rem', marginBottom: 6 }}>Support Description</span>
                <input value={form.supportDescription || ''} onChange={e => updateForm('supportDescription', e.target.value)}
                  style={{ width: '100%', padding: 12, background: '#1a1a1a', borderRadius: 8, color: '#fff', fontSize: '.95rem' }} />
              </label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isCompact ? '1fr' : '1fr 1fr', gap: 12 }}>
              <label>
                <span style={{ display: 'block', color: '#8a8a8a', fontSize: '.85rem', marginBottom: 6 }}>Support WhatsApp Button Label</span>
                <input value={form.supportWhatsappLabel || ''} onChange={e => updateForm('supportWhatsappLabel', e.target.value)}
                  style={{ width: '100%', padding: 12, background: '#1a1a1a', borderRadius: 8, color: '#fff', fontSize: '.95rem' }} />
              </label>
              <label>
                <span style={{ display: 'block', color: '#8a8a8a', fontSize: '.85rem', marginBottom: 6 }}>Support Contact Button Label</span>
                <input value={form.supportContactLabel || ''} onChange={e => updateForm('supportContactLabel', e.target.value)}
                  style={{ width: '100%', padding: 12, background: '#1a1a1a', borderRadius: 8, color: '#fff', fontSize: '.95rem' }} />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isCompact ? '1fr' : '1fr 1fr', gap: 12 }}>
              <label>
                <span style={{ display: 'block', color: '#8a8a8a', fontSize: '.85rem', marginBottom: 6 }}>Register Section Title</span>
                <input value={form.registerSectionTitle || ''} onChange={e => updateForm('registerSectionTitle', e.target.value)}
                  style={{ width: '100%', padding: 12, background: '#1a1a1a', borderRadius: 8, color: '#fff', fontSize: '.95rem' }} />
              </label>
              <label>
                <span style={{ display: 'block', color: '#8a8a8a', fontSize: '.85rem', marginBottom: 6 }}>Closed Registration Title</span>
                <input value={form.registrationClosedTitle || ''} onChange={e => updateForm('registrationClosedTitle', e.target.value)}
                  style={{ width: '100%', padding: 12, background: '#1a1a1a', borderRadius: 8, color: '#fff', fontSize: '.95rem' }} />
              </label>
            </div>
            <label>
              <span style={{ display: 'block', color: '#8a8a8a', fontSize: '.85rem', marginBottom: 6 }}>Closed Registration Message</span>
              <textarea value={form.registrationClosedMessage || ''} onChange={e => updateForm('registrationClosedMessage', e.target.value)}
                rows={3}
                style={{ width: '100%', padding: 12, background: '#1a1a1a', borderRadius: 8, color: '#fff', fontSize: '.95rem', resize: 'vertical' }} />
            </label>
         </div>
      </div>

      {/* Global Information */}
      <div style={{ background: '#111', padding: 24, borderRadius: 16, border: '1px solid rgba(255,255,255,.08)', marginBottom: 24 }}>
         <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: 16 }}>Global Information</h3>
         <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label>
               <span style={{ display: 'block', color: '#8a8a8a', fontSize: '.85rem', marginBottom: 6 }}>Marquee Announcement text (HTML not supported)</span>
               <textarea value={form.marqueeMessage} onChange={e => updateForm('marqueeMessage', e.target.value)}
                  rows={2}
                  style={{ width: '100%', padding: 12, background: '#1a1a1a', borderRadius: 8, color: '#fff', fontSize: '.95rem', resize: 'vertical' }} />
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: isCompact ? '1fr' : '1fr 1fr', gap: 16 }}>
               <label>
                  <span style={{ display: 'block', color: '#8a8a8a', fontSize: '.85rem', marginBottom: 6 }}>Contact Email</span>
                  <input value={form.contactEmail} onChange={e => updateForm('contactEmail', e.target.value)}
                     style={{ width: '100%', padding: 12, background: '#1a1a1a', borderRadius: 8, color: '#fff', fontSize: '.95rem' }} />
               </label>
               <label>
                  <span style={{ display: 'block', color: '#8a8a8a', fontSize: '.85rem', marginBottom: 6 }}>Contact Phone</span>
                  <input value={form.contactPhone} onChange={e => updateForm('contactPhone', e.target.value)}
                     style={{ width: '100%', padding: 12, background: '#1a1a1a', borderRadius: 8, color: '#fff', fontSize: '.95rem' }} />
               </label>
            </div>
            <label>
               <span style={{ display: 'block', color: '#8a8a8a', fontSize: '.85rem', marginBottom: 6 }}>WhatsApp Invite Link</span>
               <input value={form.whatsappLink} onChange={e => updateForm('whatsappLink', e.target.value)}
                  style={{ width: '100%', padding: 12, background: '#1a1a1a', borderRadius: 8, color: '#fff', fontSize: '.95rem' }} />
            </label>
         </div>
      </div>

      {/* Timeline Controls */}
      <div style={{ background: '#111', padding: 24, borderRadius: 16, border: '1px solid rgba(255,255,255,.08)', marginBottom: 24 }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12 }}>
           <div>
             <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: 4 }}>Timeline Content</h3>
             <p style={{ color: '#8a8a8a', fontSize: '.8rem', marginTop: 4 }}>Edit the timeline section title, season window, and each event card shown on the home page.</p>
           </div>
           <button
             type="button"
             onClick={() => updateForm('timelineEvents', DEFAULT_TIMELINE_EVENTS.map((event) => ({ ...event })))}
             style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'rgba(245,158,11,.12)', color: '#f5a100', border: '1px solid rgba(245,158,11,.25)', borderRadius: 8, cursor: 'pointer', fontSize: '.8rem' }}
           >
             Load Defaults
           </button>
         </div>

         <div style={{ display: 'grid', gridTemplateColumns: isCompact ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 16 }}>
           <label>
             <span style={{ display: 'block', color: '#8a8a8a', fontSize: '.85rem', marginBottom: 6 }}>Timeline Section Title</span>
             <input value={form.timelineSectionTitle || ''} onChange={e => updateForm('timelineSectionTitle', e.target.value)}
               style={{ width: '100%', padding: 12, background: '#1a1a1a', borderRadius: 8, color: '#fff', fontSize: '.95rem' }} />
           </label>
           <label>
             <span style={{ display: 'block', color: '#8a8a8a', fontSize: '.85rem', marginBottom: 6 }}>Timeline Window</span>
             <input value={form.timelineWindow || ''} onChange={e => updateForm('timelineWindow', e.target.value)}
               style={{ width: '100%', padding: 12, background: '#1a1a1a', borderRadius: 8, color: '#fff', fontSize: '.95rem' }} />
           </label>
         </div>

         <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {form.timelineEvents.map((event, i) => (
              <div key={i} style={{ background: '#1a1a1a', padding: 14, borderRadius: 10, border: '1px solid rgba(255,255,255,.05)' }}>
                 <div style={{ display: 'grid', gridTemplateColumns: isCompact ? '1fr' : '1.4fr .8fr', gap: 12, marginBottom: 12 }}>
                   <label>
                     <span style={{ display: 'block', color: '#8a8a8a', fontSize: '.8rem', marginBottom: 6 }}>Event Title</span>
                     <input value={event.title} onChange={e => handleArrayUpdate('timelineEvents', i, 'title', e.target.value)} style={{ width: '100%', padding: 10, background: '#222', border: 'none', color: '#fff', borderRadius: 6 }} />
                   </label>
                   <label>
                     <span style={{ display: 'block', color: '#8a8a8a', fontSize: '.8rem', marginBottom: 6 }}>Event Date Label</span>
                     <input value={event.date} onChange={e => handleArrayUpdate('timelineEvents', i, 'date', e.target.value)} style={{ width: '100%', padding: 10, background: '#222', border: 'none', color: '#fff', borderRadius: 6 }} />
                   </label>
                 </div>
                 <label>
                   <span style={{ display: 'block', color: '#8a8a8a', fontSize: '.8rem', marginBottom: 6 }}>Description</span>
                   <textarea value={event.desc} onChange={e => handleArrayUpdate('timelineEvents', i, 'desc', e.target.value)}
                     rows={2}
                     style={{ width: '100%', padding: 10, background: '#222', border: 'none', color: '#fff', borderRadius: 6, resize: 'vertical' }} />
                 </label>
              </div>
            ))}
         </div>
      </div>

      {/* Coordinators */}
      <div style={{ background: '#111', padding: 24, borderRadius: 16, border: '1px solid rgba(255,255,255,.08)', marginBottom: 24 }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
           <div>
             <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Student Coordinators (Dignitaries Page)</h3>
             <p style={{ color: '#8a8a8a', fontSize: '.8rem', marginTop: 4 }}>Edit names and section text shown in the Dignitaries section.</p>
           </div>
           <div style={{ display: 'flex', gap: 8 }}>
             <button
               type="button"
               onClick={() => updateForm('studentCoordinators', DEFAULT_STUDENT_COORDINATORS.map((c) => ({ ...c })))}
               style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'rgba(245,158,11,.12)', color: '#f5a100', border: '1px solid rgba(245,158,11,.25)', borderRadius: 8, cursor: 'pointer', fontSize: '.8rem' }}
             >
               Load Names
             </button>
             <button onClick={() => addArrayItem('studentCoordinators', {name:'', section:'', phone:''})} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'rgba(255,255,255,.1)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '.8rem' }}>
               <Plus size={14} /> Add Person
             </button>
           </div>
         </div>
         <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {form.studentCoordinators.map((c, i) => (
              <div key={i} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', background: '#1a1a1a', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,.05)' }}>
                 <input placeholder="Name" value={c.name} onChange={e => handleArrayUpdate('studentCoordinators', i, 'name', e.target.value)} style={{ flex: 1, padding: 8, background: '#222', border: 'none', color: '#fff', borderRadius: 6 }} />
                 <input placeholder="Section" value={c.section || ''} onChange={e => handleArrayUpdate('studentCoordinators', i, 'section', e.target.value)} style={{ flex: 1, padding: 8, background: '#222', border: 'none', color: '#fff', borderRadius: 6 }} />
                 <input placeholder="Phone" value={c.phone} onChange={e => handleArrayUpdate('studentCoordinators', i, 'phone', e.target.value)} style={{ flex: 1, padding: 8, background: '#222', border: 'none', color: '#fff', borderRadius: 6 }} />
                 <button onClick={() => removeArrayItem('studentCoordinators', i)} style={{ background: 'transparent', border: 'none', color: '#e63946', cursor: 'pointer' }}><Trash2 size={18} /></button>
              </div>
            ))}
            {form.studentCoordinators.length === 0 && <p style={{ color: '#6a6a6a', fontSize: '.85rem' }}>No coordinators configured.</p>}
         </div>
      </div>

      {/* Winners List */}
      <div style={{ background: '#111', padding: 24, borderRadius: 16, border: '1px solid rgba(255,255,255,.08)', marginBottom: 32 }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
           <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Winners & Prizes</h3>
           <button onClick={() => addArrayItem('winners', {team:'', prize:'', player:''})} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'rgba(255,255,255,.1)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '.8rem' }}>
             <Plus size={14} /> Add Winner
           </button>
         </div>
         <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {form.winners.map((w, i) => (
              <div key={i} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', background: '#1a1a1a', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,.05)' }}>
                 <input placeholder="Name/Team" value={w.team} onChange={e => handleArrayUpdate('winners', i, 'team', e.target.value)} style={{ flex: 1.5, padding: 8, background: '#222', border: 'none', color: '#fff', borderRadius: 6 }} />
                 <input placeholder="Prize (e.g. Champions Shield)" value={w.prize} onChange={e => handleArrayUpdate('winners', i, 'prize', e.target.value)} style={{ flex: 1.5, padding: 8, background: '#222', border: 'none', color: '#fff', borderRadius: 6 }} />
                 <input placeholder="Sub-text (Optional)" value={w.player} onChange={e => handleArrayUpdate('winners', i, 'player', e.target.value)} style={{ flex: 1, padding: 8, background: '#222', border: 'none', color: '#fff', borderRadius: 6 }} />
                 <button onClick={() => removeArrayItem('winners', i)} style={{ background: 'transparent', border: 'none', color: '#e63946', cursor: 'pointer' }}><Trash2 size={18} /></button>
              </div>
            ))}
            {form.winners.length === 0 && <p style={{ color: '#6a6a6a', fontSize: '.85rem' }}>No winners published yet.</p>}
         </div>
      </div>

    </div>
  )
}

/* ─────────────────────────────────────────────── */
/*  Auction Roster Panel                           */
/* ─────────────────────────────────────────────── */
function AuctionPanel({ players, allCount, roleFilter, setRoleFilter, search, setSearch, onSelect }) {
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {ROLE_OPTIONS.map(r => (
            <button key={r.v} onClick={() => setRoleFilter(r.v)} style={{
              padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
              fontFamily: '"DM Sans"', fontWeight: 600, fontSize: '.85rem',
              border: roleFilter === r.v ? '1px solid rgba(255,107,34,.5)' : '1px solid rgba(255,255,255,.08)',
              background: roleFilter === r.v ? 'rgba(255,107,34,.12)' : '#111',
              color: roleFilter === r.v ? '#ff6b22' : '#8a8a8a',
              transition: 'all .2s',
            }}>
              {r.l}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative', marginLeft: 'auto' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#6a6a6a' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name or Reg ID…"
            style={{
              padding: '10px 14px 10px 38px', borderRadius: 10,
              background: '#111', border: '1px solid rgba(255,255,255,.1)',
              color: '#efefef', fontFamily: '"DM Sans"', fontSize: '.9rem',
              outline: 'none', width: 240, boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(255,107,34,.45)'}
            onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,.1)'}
          />
        </div>
      </div>

      <p style={{ color: '#6a6a6a', fontSize: '.85rem', marginBottom: 20 }}>
        Showing {players.length} of {allCount} verified players &mdash; <span style={{ color: '#ff6b22' }}>click to view detail</span>
      </p>

      {players.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#5a5a5a' }}>
          <Users size={48} style={{ margin: '0 auto 16px', opacity: .2 }} />
          <p style={{ fontSize: '1.1rem' }}>No players match the current filter.</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 20 }}>
        {players.map((p, idx) => (
          <PlayerCard key={p.id} player={p} onSelect={() => onSelect(idx)} />
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────── */
/*  Player Card (Redesign)                         */
/* ─────────────────────────────────────────────── */
const ROLE_LABEL = {
  batsman:               'Batsman',
  bowler:                'Bowler',
  wicket_keeper_batsman: 'Wicket Keeper',
  all_rounder:           'All Rounder',
}
const ROLE_COLOR = {
  batsman:               '#3b82f6',
  bowler:                '#ef4444',
  wicket_keeper_batsman: '#8b5cf6',
  all_rounder:           '#10b981',
}

function PlayerCard({ player: p, onSelect }) {
  const roleColor = ROLE_COLOR[p.role] || '#ff6b22'

  return (
    <div
      onClick={() => onSelect?.(p)}
      style={{
        background: '#111113',
        border: `1.5px solid ${roleColor}30`,
        borderRadius: 20,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all .25s ease',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxShadow: '0 8px 24px rgba(0,0,0,.3)'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${roleColor}a0`;
        e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,.45), 0 0 12px ${roleColor}20`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = `${roleColor}30`;
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.3)';
      }}
    >
      {/* Main card body */}
      <div style={{ padding: '24px 20px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, position: 'relative', zIndex: 1 }}>
        {/* Dual-Ring Photo Frame */}
        <div style={{
          position: 'relative',
          padding: 4,
          borderRadius: 20,
          background: '#18181a',
          border: '1.5px solid rgba(255, 255, 255, 0.05)',
          boxShadow: `0 0 12px ${roleColor}15`
        }}>
          {p.photo_url ? (
            <img src={p.photo_url} alt={p.name}
              style={{ width: 84, height: 84, borderRadius: 16, objectFit: 'cover', display: 'block', border: `1.5px solid ${roleColor}80` }} />
          ) : (
            <div style={{ width: 84, height: 84, borderRadius: 16, background: 'rgba(255,255,255,.03)', border: `1.5px solid rgba(255,255,255,.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserIcon size={32} color="#5a5a5a" />
            </div>
          )}
        </div>

        {/* Slanted Sporty Role Banner (Solid Color) */}
        <div style={{
          transform: 'skewX(-10deg)',
          background: roleColor,
          borderRadius: 4,
          padding: '3px 12px',
          color: '#fff',
          fontSize: '.68rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '.06em',
          marginTop: -6
        }}>
          {ROLE_LABEL[p.role] || p.role}
        </div>

        {/* Athlete Name & Identity */}
        <div style={{ textAlign: 'center', marginTop: 4, minHeight: 48, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ fontFamily: '"DM Sans", system-ui, sans-serif', fontWeight: 600, color: '#fff', fontSize: '1.15rem', lineHeight: '1.3', letterSpacing: 'normal', textTransform: 'capitalize', margin: 0 }}>{p.name}</p>
          <p style={{ fontFamily: 'monospace', color: '#ff6b22', fontSize: '.78rem', marginTop: 4, fontWeight: 700, margin: '4px 0 0 0' }}>{p.registration_id}</p>
        </div>
      </div>

      {/* Structured Stats Grid */}
      <div style={{ padding: '0 16px 18px 16px', display: 'flex', flexDirection: 'column', flex: 1, position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px 14px',
          padding: '12px 14px',
          background: 'rgba(10,10,10,.6)',
          borderRadius: 14,
          border: '1px solid rgba(255,255,255,.03)',
          marginTop: 'auto'
        }}>
          <MiniStat label="CLASS" value={`${p.year}Yr • ${p.branch?.toUpperCase()}-${p.section?.toUpperCase()}`} />
          <MiniStat label="ROLE" value={ROLE_LABEL[p.role]?.split(' ')[0]} color={roleColor} />
          <MiniStat label="BATS" value={p.batting_side ? `${p.batting_side?.toUpperCase()} Hand` : '—'} />
          <MiniStat label="BOWLS" value={p.bowling_arm ? `${p.bowling_arm?.toUpperCase()} Arm` : '—'} />
        </div>
      </div>
    </div>
  )
}

function MiniStat({ label, value, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ color: '#555', fontSize: '.6rem', fontWeight: 800, letterSpacing: '.08em' }}>{label}</span>
      <span style={{ color: color || '#d8d8d8', fontSize: '.78rem', fontWeight: 700, fontFamily: '"DM Sans", sans-serif' }}>{value || '—'}</span>
    </div>
  )
}

/* ─────────────────────────────────────────────── */
/*  Player Spotlight (fullscreen detail)             */
/* ─────────────────────────────────────────────── */
function PlayerSpotlight({ players, index, onNavigate, onClose }) {
  const p         = players[index]
  const roleColor = ROLE_COLOR[p?.role] || '#ff6b22'

  const hasPrev = index > 0
  const hasNext = index < players.length - 1

  useEffect(() => {
    const fn = e => { 
      if (e.key === 'Escape') onClose() 
      if (e.key === 'ArrowRight' && hasNext) onNavigate(index + 1)
      if (e.key === 'ArrowLeft' && hasPrev) onNavigate(index - 1)
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose, onNavigate, index, hasPrev, hasNext])

  if (!p) return null

  const navBtn = (enabled) => ({
    width: 50, height: 50, borderRadius: '50%',
    background: enabled ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,.01)',
    border: '1px solid rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: enabled ? 'pointer' : 'not-allowed', color: enabled ? '#fff' : '#444',
    transition: 'all .2s', position: 'absolute', top: '50%', transform: 'translateY(-50%)', zIndex: 10,
  })

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      
      {/* Prev */}
      <button onClick={e => { e.stopPropagation(); hasPrev && onNavigate(index - 1) }} style={{ ...navBtn(hasPrev), left: 24 }}>
        <ChevronLeft size={28} />
      </button>

      {/* Next */}
      <button onClick={e => { e.stopPropagation(); hasNext && onNavigate(index + 1) }} style={{ ...navBtn(hasNext), right: 24 }}>
        <ChevronRight size={28} />
      </button>

      <div onClick={e => e.stopPropagation()} style={{ background: '#121214', border: `2px solid ${roleColor}80`, borderRadius: 24, width: '100%', maxWidth: 480, overflow: 'hidden', position: 'relative', boxShadow: '0 24px 48px rgba(0,0,0,0.8)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,.1)', border: 'none', borderRadius: 8, padding: 8, color: '#fff', cursor: 'pointer' }}><XIcon size={20} /></button>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 24px 24px 24px', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
          {p.photo_url ? (
             <img src={p.photo_url} alt={p.name} style={{ width: 140, height: 140, borderRadius: 24, objectFit: 'cover', border: `3px solid ${roleColor}`, padding: 4, background: '#18181b' }} />
          ) : (
             <div style={{ width: 140, height: 140, borderRadius: 24, background: '#18181b', border: `3px solid rgba(255,255,255,.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserIcon size={56} color="#4a4a4a" /></div>
          )}
          <h2 style={{ fontSize: '1.85rem', color: '#fff', marginTop: 16, fontFamily: '"DM Sans", "Inter", sans-serif', fontWeight: 600, lineHeight: '1.3', letterSpacing: 'normal', textTransform: 'capitalize', textAlign: 'center', margin: '16px 0 0 0' }}>{p.name}</h2>
          <p style={{ color: '#ff6b22', fontFamily: 'monospace', fontSize: '1rem', marginTop: 6, fontWeight: 700, margin: '6px 0 0 0' }}>{p.registration_id}</p>
          
          {/* Solid Color Role Tag */}
          <span style={{ 
            marginTop: 14, 
            background: roleColor, 
            color: '#fff', 
            padding: '6px 18px', 
            borderRadius: 8, 
            fontSize: '.8rem', 
            fontWeight: 800, 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em' 
          }}>
            {ROLE_LABEL[p.role] || p.role}
          </span>
        </div>

        <div style={{ padding: '24px 24px 32px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SpotDetail label="Academic Details" value={`Year ${p.year} • ${p.branch?.toUpperCase?.()} • Sec ${p.section?.toUpperCase?.()}`} />
          <SpotDetail label="Phone Number" value={p.phone} />
          {p.batting_side && <SpotDetail label="Batting Style" value={`${p.batting_side}-handed`} color={roleColor} />}
          {p.bowling_arm && <SpotDetail label="Bowling Details" value={`${p.bowling_arm} arm • ${(p.bowling_type||'').replace(/_/g,' ')}`} color={roleColor} />}
        </div>
      </div>
    </div>
  )
}

function SpotDetail({ label, value, color }) {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      background: '#18181b',
      borderRadius: 12,
      border: '1.5px solid rgba(255,255,255,0.03)',
      padding: '12px 18px'
    }}>
      <p style={{ color: '#6a6a6f', fontSize: '.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{label}</p>
      <p style={{ color: color || '#fff', fontSize: '.92rem', fontWeight: 700, margin: 0, fontFamily: '"DM Sans", sans-serif' }}>{value}</p>
    </div>
  )
}

/* ─────────────────────────────────────────────── */
/*  Schedule and Fixtures Panel                    */
/* ─────────────────────────────────────────────── */
const DEFAULT_TEAMS = {
  A: Array.from({ length: 5 }, (_, i) => ({ name: `Team ${i + 1}`, p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' })),
  B: Array.from({ length: 5 }, (_, i) => ({ name: `Team ${i + 6}`, p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' })),
}
const DEFAULT_MATCHES = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  grp: i < 10 ? 'A' : 'B',
  t1: i < 10 ? `Team ${(i % 5) + 1}` : `Team ${(i % 5) + 6}`,
  t2: i < 10 ? `Team ${((i + 1) % 5) + 1}` : `Team ${((i + 1) % 5) + 6}`,
  date: 'TBD', time: 'TBD', winner: '',
}))
const DEFAULT_KNOCKOUT = {
  semiFinal1: { label: 'Semi-Final 1', team1Seed: 'A1', team1Name: 'Group A Winner', team2Seed: 'B2', team2Name: 'Group B Runner-up' },
  semiFinal2: { label: 'Semi-Final 2', team1Seed: 'B1', team1Name: 'Group B Winner', team2Seed: 'A2', team2Name: 'Group A Runner-up' },
  final: { label: 'Grand Finale', team1Name: 'Winner SF1', team2Name: 'Winner SF2' },
}

function buildScheduleForm(settings) {
  const source = settings || {}

  const normalizeTeam = (team, fallbackName) => ({
    name: team?.name || fallbackName,
    p: Number.isFinite(Number(team?.p)) ? Number(team.p) : 0,
    w: Number.isFinite(Number(team?.w)) ? Number(team.w) : 0,
    l: Number.isFinite(Number(team?.l)) ? Number(team.l) : 0,
    pts: Number.isFinite(Number(team?.pts)) ? Number(team.pts) : 0,
    nrr: typeof team?.nrr === 'string' ? team.nrr : '+0.000',
  })

  const defaultA = DEFAULT_TEAMS.A.map((t) => ({ ...t }))
  const defaultB = DEFAULT_TEAMS.B.map((t) => ({ ...t }))
  const sourceA = Array.isArray(source?.teams?.A) && source.teams.A.length ? source.teams.A : defaultA
  const sourceB = Array.isArray(source?.teams?.B) && source.teams.B.length ? source.teams.B : defaultB
  const sourceMatches = Array.isArray(source?.leagueMatches) && source.leagueMatches.length
    ? source.leagueMatches
    : DEFAULT_MATCHES

  return {
    ...source,
    teams: {
      A: sourceA.map((t, i) => normalizeTeam(t, `Team ${i + 1}`)),
      B: sourceB.map((t, i) => normalizeTeam(t, `Team ${i + 6}`)),
    },
    leagueMatches: sourceMatches.map((m, i) => ({
      id: Number.isFinite(Number(m?.id)) ? Number(m.id) : i + 1,
      grp: m?.grp === 'A' || m?.grp === 'B' ? m.grp : (i < 10 ? 'A' : 'B'),
      t1: m?.t1 || '',
      t2: m?.t2 || '',
      date: m?.date || 'TBD',
      time: m?.time || 'TBD',
      status: m?.status || 'UPCOMING',
      winner: m?.winner || '',
      result: m?.result || '',
    })),
    knockout: {
      semiFinal1: {
        label: source?.knockout?.semiFinal1?.label || DEFAULT_KNOCKOUT.semiFinal1.label,
        team1Seed: source?.knockout?.semiFinal1?.team1Seed || DEFAULT_KNOCKOUT.semiFinal1.team1Seed,
        team1Name: source?.knockout?.semiFinal1?.team1Name || DEFAULT_KNOCKOUT.semiFinal1.team1Name,
        team2Seed: source?.knockout?.semiFinal1?.team2Seed || DEFAULT_KNOCKOUT.semiFinal1.team2Seed,
        team2Name: source?.knockout?.semiFinal1?.team2Name || DEFAULT_KNOCKOUT.semiFinal1.team2Name,
      },
      semiFinal2: {
        label: source?.knockout?.semiFinal2?.label || DEFAULT_KNOCKOUT.semiFinal2.label,
        team1Seed: source?.knockout?.semiFinal2?.team1Seed || DEFAULT_KNOCKOUT.semiFinal2.team1Seed,
        team1Name: source?.knockout?.semiFinal2?.team1Name || DEFAULT_KNOCKOUT.semiFinal2.team1Name,
        team2Seed: source?.knockout?.semiFinal2?.team2Seed || DEFAULT_KNOCKOUT.semiFinal2.team2Seed,
        team2Name: source?.knockout?.semiFinal2?.team2Name || DEFAULT_KNOCKOUT.semiFinal2.team2Name,
      },
      final: {
        label: source?.knockout?.final?.label || DEFAULT_KNOCKOUT.final.label,
        team1Name: source?.knockout?.final?.team1Name || DEFAULT_KNOCKOUT.final.team1Name,
        team2Name: source?.knockout?.final?.team2Name || DEFAULT_KNOCKOUT.final.team2Name,
      },
    },
  }
}

function SchedulePanel({ settings, onSave, saving, isCompact, players }) {
  const [form, setForm] = useState(() => buildScheduleForm(settings))
  const teamNames = getTeamsFromSettings(form)
  const rosterMap = buildRosterMap(players || [], teamNames)

  useEffect(() => {
    setForm(buildScheduleForm(settings))
  }, [settings])

  const updateForm = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleGroupTeamUpdate = (group, index, key, value) => {
    const list = [...form.teams[group]]
    // If it's a number field, parse it
    if (key !== 'name' && key !== 'nrr') {
      value = parseInt(value) || 0
    }
    if (!list[index]) return
    list[index] = { ...list[index], [key]: value }
    updateForm('teams', { ...form.teams, [group]: list })
  }

  const handleMatchUpdate = (index, key, value) => {
    if (index < 0) return
    const list = [...form.leagueMatches]
    if (!list[index]) return
    list[index] = { ...list[index], [key]: value }
    updateForm('leagueMatches', list)
  }

  const handleMatchStatusUpdate = (index, status) => {
    if (index < 0) return
    const list = [...form.leagueMatches]
    if (!list[index]) return
    const next = { ...list[index], status }
    if (status !== 'COMPLETED') next.winner = ''
    list[index] = next
    updateForm('leagueMatches', list)
  }

  const updateKnockout = (stage, key, value) => {
    updateForm('knockout', {
      ...form.knockout,
      [stage]: {
        ...form.knockout[stage],
        [key]: value,
      },
    })
  }

  const resetTournamentData = () => {
    setForm((prev) => ({
      ...prev,
      teams: {
        A: DEFAULT_TEAMS.A.map((t) => ({ ...t })),
        B: DEFAULT_TEAMS.B.map((t) => ({ ...t })),
      },
      leagueMatches: DEFAULT_MATCHES.map((m) => ({ ...m })),
      knockout: {
        semiFinal1: { ...DEFAULT_KNOCKOUT.semiFinal1 },
        semiFinal2: { ...DEFAULT_KNOCKOUT.semiFinal2 },
        final: { ...DEFAULT_KNOCKOUT.final },
      },
    }))
  }

  const tableHeaderGrid = {
    display: 'grid',
    gridTemplateColumns: 'minmax(160px,2fr) repeat(4, minmax(60px,1fr)) minmax(86px,1.2fr)',
    gap: 8,
    padding: '0 12px',
    fontSize: '.75rem',
    color: '#6a6a6a',
    textTransform: 'uppercase',
    minWidth: 620,
  }

  const tableRowGrid = {
    display: 'grid',
    gridTemplateColumns: 'minmax(160px,2fr) repeat(4, minmax(60px,1fr)) minmax(86px,1.2fr)',
    gap: 8,
    background: '#1a1a1a',
    padding: 8,
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,.05)',
    minWidth: 620,
  }

  const compactInput = {
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
    background: '#222',
    border: 'none',
    padding: 8,
    borderRadius: 6,
  }

  return (
    <div style={{ width: '100%', maxWidth: 'none' }}>
      <div style={{
        position: 'sticky',
        top: isCompact ? 64 : 72,
        zIndex: 50,
        marginBottom: 16,
        background: 'rgba(12,12,12,.96)',
        border: '1px solid rgba(255,255,255,.08)',
        borderRadius: 12,
        padding: isCompact ? '10px 12px' : '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}>
        <div>
          <p style={{ color: '#efefef', fontWeight: 700, fontSize: '.92rem' }}>Tournament Controls</p>
          <p style={{ color: '#7a7a7a', fontSize: '.78rem' }}>League + Knockout data syncs to public schedule page.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => {
              if (!window.confirm('Reset tournament data to defaults? This only updates the form until you save.')) return
              resetTournamentData()
            }}
            disabled={saving}
            style={{ background: 'transparent', color: '#f5a100', border: '1px solid rgba(245,158,11,.35)', padding: '10px 14px', fontSize: '.85rem', fontWeight: 700, borderRadius: 10, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, whiteSpace: 'nowrap' }}
          >
            Reset Tournament
          </button>
          <button onClick={() => onSave(form)} disabled={saving} style={{ background: '#ff6b22', color: '#fff', border: 'none', padding: '10px 20px', fontSize: '.9rem', fontWeight: 700, borderRadius: 10, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, whiteSpace: 'nowrap' }}>
            {saving ? 'Saving...' : 'Save Tournament'}
          </button>
        </div>
      </div>

      {/* POINTS TABLE MANAGER */}
      <div style={{ background: '#111', padding: 24, borderRadius: 16, border: '1px solid rgba(255,255,255,.08)', marginBottom: 24 }}>
         <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: 16 }}>Points Table Management</h3>
         
         {/* Group A */}
         <div style={{ marginBottom: 24 }}>
           <h4 style={{ color: '#ff6b22', fontSize: '.9rem', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Group A</h4>
           <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
             <div className="admin-desktop-header" style={tableHeaderGrid}>
                <span>Team Name</span><span>Played</span><span>Won</span><span>Lost</span><span>Points</span><span>NRR</span>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                {form.teams.A.map((t, i) => (
                  <div key={i} className="admin-row-stack" style={tableRowGrid}>
                    <input value={t.name} onChange={e => handleGroupTeamUpdate('A', i, 'name', e.target.value)} placeholder="Team Name" style={{ ...compactInput, color: '#fff' }} />
                    <input type="number" value={t.p} onChange={e => handleGroupTeamUpdate('A', i, 'p', e.target.value)} style={{ ...compactInput, color: '#aaa', textAlign: 'center' }} />
                    <input type="number" value={t.w} onChange={e => handleGroupTeamUpdate('A', i, 'w', e.target.value)} style={{ ...compactInput, color: '#4ade80', textAlign: 'center' }} />
                    <input type="number" value={t.l} onChange={e => handleGroupTeamUpdate('A', i, 'l', e.target.value)} style={{ ...compactInput, color: '#f87171', textAlign: 'center' }} />
                    <input type="number" value={t.pts} onChange={e => handleGroupTeamUpdate('A', i, 'pts', e.target.value)} style={{ ...compactInput, color: '#ffb800', textAlign: 'center', fontWeight: 'bold' }} />
                    <input value={t.nrr} onChange={e => handleGroupTeamUpdate('A', i, 'nrr', e.target.value)} style={{ ...compactInput, color: '#fff', textAlign: 'center' }} />
                  </div>
                ))}
             </div>
           </div>
         </div>

         {/* Group B */}
         <div>
           <h4 style={{ color: '#3b82f6', fontSize: '.9rem', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Group B</h4>
           <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {form.teams.B.map((t, i) => (
                  <div key={i} className="admin-row-stack" style={tableRowGrid}>
                    <input value={t.name} onChange={e => handleGroupTeamUpdate('B', i, 'name', e.target.value)} placeholder="Team Name" style={{ ...compactInput, color: '#fff' }} />
                    <input type="number" value={t.p} onChange={e => handleGroupTeamUpdate('B', i, 'p', e.target.value)} style={{ ...compactInput, color: '#aaa', textAlign: 'center' }} />
                    <input type="number" value={t.w} onChange={e => handleGroupTeamUpdate('B', i, 'w', e.target.value)} style={{ ...compactInput, color: '#4ade80', textAlign: 'center' }} />
                    <input type="number" value={t.l} onChange={e => handleGroupTeamUpdate('B', i, 'l', e.target.value)} style={{ ...compactInput, color: '#f87171', textAlign: 'center' }} />
                    <input type="number" value={t.pts} onChange={e => handleGroupTeamUpdate('B', i, 'pts', e.target.value)} style={{ ...compactInput, color: '#ffb800', textAlign: 'center', fontWeight: 'bold' }} />
                    <input value={t.nrr} onChange={e => handleGroupTeamUpdate('B', i, 'nrr', e.target.value)} style={{ ...compactInput, color: '#fff', textAlign: 'center' }} />
                  </div>
                ))}
             </div>
           </div>
         </div>
      </div>

      {/* FIXTURES MANAGER */}
      <div style={{ background: '#111', padding: 24, borderRadius: 16, border: '1px solid rgba(255,255,255,.08)', marginBottom: 32 }}>
         <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: 16 }}>League Matches Fixtures</h3>
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            
            {/* Group A Fixtures */}
            <div>
               <h4 style={{ color: '#ff6b22', fontSize: '.9rem', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Group A Matches</h4>
               <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                 {form.leagueMatches.filter(m => m.grp === 'A').map((m) => {
                   const ogIndex = form.leagueMatches.findIndex(lm => lm.id === m.id)
                   return (
                     <div key={m.id} style={{ display: 'flex', flexDirection: 'column', gap: 8, background: '#1a1a1a', padding: '12px', borderRadius: 8, border: '1px solid rgba(255,107,34,.1)' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6a6a6a', fontSize: '.75rem', fontWeight: 700 }}>
                          <span>MATCH {m.id}</span>
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                         <input value={m.t1} onChange={e => handleMatchUpdate(ogIndex, 't1', e.target.value)} style={{ ...compactInput, flex: 1, color: '#fff' }} />
                         <span style={{ fontSize: '.75rem', color: '#fff', fontWeight: 800 }}>VS</span>
                         <input value={m.t2} onChange={e => handleMatchUpdate(ogIndex, 't2', e.target.value)} style={{ ...compactInput, flex: 1, color: '#fff' }} />
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                         <input value={m.date} onChange={e => handleMatchUpdate(ogIndex, 'date', e.target.value)} placeholder="Date" style={{ ...compactInput, flex: 1.5, color: '#f5a100', fontSize: '.85rem' }} />
                         <input value={m.time} onChange={e => handleMatchUpdate(ogIndex, 'time', e.target.value)} placeholder="Time" style={{ ...compactInput, flex: 1, color: '#a0a0a0', fontSize: '.85rem' }} />
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                         <select value={m.status || 'UPCOMING'} onChange={e => handleMatchStatusUpdate(ogIndex, e.target.value)} style={{ ...compactInput, flex: 0.8, color: '#fff', fontSize: '.8rem' }}>
                           <option value="UPCOMING">Upcoming</option>
                           <option value="LIVE">Live</option>
                           <option value="COMPLETED">Ended</option>
                           <option value="ABANDONED">Abandoned</option>
                         </select>
                         <input value={m.result || ''} onChange={e => handleMatchUpdate(ogIndex, 'result', e.target.value)} placeholder="Match note (optional)" style={{ ...compactInput, flex: 1.2, color: '#fff', fontSize: '.85rem' }} />
                       </div>
                       {(m.status || 'UPCOMING') === 'COMPLETED' && (
                         <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                           <select value={m.winner || ''} onChange={e => handleMatchUpdate(ogIndex, 'winner', e.target.value)} style={{ ...compactInput, flex: 1, color: '#22c55e', fontSize: '.85rem' }}>
                             <option value="">Select winner</option>
                             <option value={m.t1 || 'Team 1'}>{m.t1 || 'Team 1'}</option>
                             <option value={m.t2 || 'Team 2'}>{m.t2 || 'Team 2'}</option>
                           </select>
                           <input value={m.result || ''} onChange={e => handleMatchUpdate(ogIndex, 'result', e.target.value)} placeholder="e.g. won by 6 wickets" style={{ ...compactInput, flex: 1.2, color: '#fff', fontSize: '.85rem' }} />
                         </div>
                       )}
                     </div>
                   )
                 })}
               </div>
            </div>

            {/* Group B Fixtures */}
            <div>
               <h4 style={{ color: '#3b82f6', fontSize: '.9rem', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Group B Matches</h4>
               <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                 {form.leagueMatches.filter(m => m.grp === 'B').map((m) => {
                   const ogIndex = form.leagueMatches.findIndex(lm => lm.id === m.id)
                   return (
                     <div key={m.id} style={{ display: 'flex', flexDirection: 'column', gap: 8, background: '#1a1a1a', padding: '12px', borderRadius: 8, border: '1px solid rgba(59,130,246,.1)' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6a6a6a', fontSize: '.75rem', fontWeight: 700 }}>
                          <span>MATCH {m.id}</span>
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                         <input value={m.t1} onChange={e => handleMatchUpdate(ogIndex, 't1', e.target.value)} style={{ ...compactInput, flex: 1, color: '#fff' }} />
                         <span style={{ fontSize: '.75rem', color: '#fff', fontWeight: 800 }}>VS</span>
                         <input value={m.t2} onChange={e => handleMatchUpdate(ogIndex, 't2', e.target.value)} style={{ ...compactInput, flex: 1, color: '#fff' }} />
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                         <input value={m.date} onChange={e => handleMatchUpdate(ogIndex, 'date', e.target.value)} placeholder="Date" style={{ ...compactInput, flex: 1.5, color: '#f5a100', fontSize: '.85rem' }} />
                         <input value={m.time} onChange={e => handleMatchUpdate(ogIndex, 'time', e.target.value)} placeholder="Time" style={{ ...compactInput, flex: 1, color: '#a0a0a0', fontSize: '.85rem' }} />
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                         <select value={m.status || 'UPCOMING'} onChange={e => handleMatchStatusUpdate(ogIndex, e.target.value)} style={{ ...compactInput, flex: 0.8, color: '#fff', fontSize: '.8rem' }}>
                           <option value="UPCOMING">Upcoming</option>
                           <option value="LIVE">Live</option>
                           <option value="COMPLETED">Ended</option>
                           <option value="ABANDONED">Abandoned</option>
                         </select>
                         <input value={m.result || ''} onChange={e => handleMatchUpdate(ogIndex, 'result', e.target.value)} placeholder="Match note (optional)" style={{ ...compactInput, flex: 1.2, color: '#fff', fontSize: '.85rem' }} />
                       </div>
                       {(m.status || 'UPCOMING') === 'COMPLETED' && (
                         <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                           <select value={m.winner || ''} onChange={e => handleMatchUpdate(ogIndex, 'winner', e.target.value)} style={{ ...compactInput, flex: 1, color: '#22c55e', fontSize: '.85rem' }}>
                             <option value="">Select winner</option>
                             <option value={m.t1 || 'Team 1'}>{m.t1 || 'Team 1'}</option>
                             <option value={m.t2 || 'Team 2'}>{m.t2 || 'Team 2'}</option>
                           </select>
                           <input value={m.result || ''} onChange={e => handleMatchUpdate(ogIndex, 'result', e.target.value)} placeholder="e.g. won by 6 wickets" style={{ ...compactInput, flex: 1.2, color: '#fff', fontSize: '.85rem' }} />
                         </div>
                       )}
                     </div>
                   )
                 })}
               </div>
            </div>

         </div>
      </div>

      {/* KNOCKOUT STAGE MANAGER */}
      <div style={{ background: '#111', padding: 24, borderRadius: 16, border: '1px solid rgba(255,255,255,.08)', marginBottom: 24 }}>
        <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: 16 }}>Knockout Stage</h3>

        <div style={{ display: 'grid', gridTemplateColumns: isCompact ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10, padding: 12 }}>
            <p style={{ color: '#ff6b22', fontSize: '.78rem', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>Semi Final 1</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 10 }}>
              <input value={form.knockout.semiFinal1.label} onChange={e => updateKnockout('semiFinal1', 'label', e.target.value)} placeholder="Label" style={{ background: '#222', color: '#fff', padding: 10, borderRadius: 8 }} />
              <div />
              <input value={form.knockout.semiFinal1.team1Seed} onChange={e => updateKnockout('semiFinal1', 'team1Seed', e.target.value)} placeholder="Seed 1" style={{ background: '#222', color: '#fff', padding: 10, borderRadius: 8 }} />
              <input value={form.knockout.semiFinal1.team1Name} onChange={e => updateKnockout('semiFinal1', 'team1Name', e.target.value)} placeholder="Team 1 name" style={{ background: '#222', color: '#fff', padding: 10, borderRadius: 8 }} />
              <input value={form.knockout.semiFinal1.team2Seed} onChange={e => updateKnockout('semiFinal1', 'team2Seed', e.target.value)} placeholder="Seed 2" style={{ background: '#222', color: '#fff', padding: 10, borderRadius: 8 }} />
              <input value={form.knockout.semiFinal1.team2Name} onChange={e => updateKnockout('semiFinal1', 'team2Name', e.target.value)} placeholder="Team 2 name" style={{ background: '#222', color: '#fff', padding: 10, borderRadius: 8 }} />
            </div>
          </div>

          <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10, padding: 12 }}>
            <p style={{ color: '#3b82f6', fontSize: '.78rem', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>Semi Final 2</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 10 }}>
              <input value={form.knockout.semiFinal2.label} onChange={e => updateKnockout('semiFinal2', 'label', e.target.value)} placeholder="Label" style={{ background: '#222', color: '#fff', padding: 10, borderRadius: 8 }} />
              <div />
              <input value={form.knockout.semiFinal2.team1Seed} onChange={e => updateKnockout('semiFinal2', 'team1Seed', e.target.value)} placeholder="Seed 1" style={{ background: '#222', color: '#fff', padding: 10, borderRadius: 8 }} />
              <input value={form.knockout.semiFinal2.team1Name} onChange={e => updateKnockout('semiFinal2', 'team1Name', e.target.value)} placeholder="Team 1 name" style={{ background: '#222', color: '#fff', padding: 10, borderRadius: 8 }} />
              <input value={form.knockout.semiFinal2.team2Seed} onChange={e => updateKnockout('semiFinal2', 'team2Seed', e.target.value)} placeholder="Seed 2" style={{ background: '#222', color: '#fff', padding: 10, borderRadius: 8 }} />
              <input value={form.knockout.semiFinal2.team2Name} onChange={e => updateKnockout('semiFinal2', 'team2Name', e.target.value)} placeholder="Team 2 name" style={{ background: '#222', color: '#fff', padding: 10, borderRadius: 8 }} />
            </div>
          </div>
        </div>

        <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10, padding: 12 }}>
          <p style={{ color: '#ffb800', fontSize: '.78rem', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>Final</p>
          <div style={{ display: 'grid', gridTemplateColumns: isCompact ? '1fr' : '1fr 1fr 1fr', gap: 10 }}>
            <input value={form.knockout.final.label} onChange={e => updateKnockout('final', 'label', e.target.value)} placeholder="Final Label" style={{ background: '#222', color: '#fff', padding: 10, borderRadius: 8 }} />
            <input value={form.knockout.final.team1Name} onChange={e => updateKnockout('final', 'team1Name', e.target.value)} placeholder="Finalist 1" style={{ background: '#222', color: '#fff', padding: 10, borderRadius: 8 }} />
            <input value={form.knockout.final.team2Name} onChange={e => updateKnockout('final', 'team2Name', e.target.value)} placeholder="Finalist 2" style={{ background: '#222', color: '#fff', padding: 10, borderRadius: 8 }} />
          </div>
        </div>
      </div>

      <div style={{ background: '#111', padding: 24, borderRadius: 16, border: '1px solid rgba(255,255,255,.08)' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: 8 }}>Auction Team Squads</h3>
        <p style={{ color: '#7a7a7a', fontSize: '.82rem', marginBottom: 18 }}>Captains, full player list, spend, and purse balance are derived from the live auction data.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {teamNames.map((teamName) => {
            const roster = rosterMap[teamName] || { roster: [], captain: null, spend: 0, remainingPurse: 100, squadCount: 0 }
            return (
              <div key={teamName} style={{ background: '#171717', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '.98rem' }}>{teamName}</div>
                    <div style={{ color: '#7a7a7a', fontSize: '.75rem', marginTop: 4 }}>Captain: {roster.captain?.name || 'Not assigned'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#ffb800', fontWeight: 800, fontSize: '.82rem' }}>{formatCr(roster.spend)}</div>
                    <div style={{ color: '#55d79a', fontSize: '.75rem', marginTop: 4 }}>{formatCr(roster.remainingPurse)} left</div>
                  </div>
                </div>
                <div style={{ color: '#9a9a9a', fontSize: '.74rem', marginBottom: 10 }}>Squad: {roster.squadCount}/12</div>
                {roster.roster.length ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {roster.roster.map((player) => (
                      <div key={player.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', background: '#101010', borderRadius: 10, padding: '10px 12px' }}>
                        <div style={{ color: '#efefef', fontSize: '.83rem' }}>
                          {player.name}
                          {player.is_captain ? ' (C)' : ''}
                        </div>
                        <div style={{ color: '#ffb800', fontFamily: 'monospace', fontSize: '.8rem' }}>{formatCr(player.bid_amount)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: '#5a5a5a', fontSize: '.8rem' }}>No players assigned yet.</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────── */
/*  Edit Players Panel                             */
/* ─────────────────────────────────────────────── */
function EditPlayersPanel({ players, setPlayers, token, handleUnauthorized, isCompact, siteSettings, setSiteSettings }) {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [editingPlayer, setEditingPlayer] = useState(null)
  
  const filtered = players.filter(p => {
    const matchRole = roleFilter === 'all' || p.role === roleFilter
    const matchSearch = search === '' ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.registration_id?.toLowerCase().includes(search.toLowerCase())
    return matchRole && matchSearch
  })

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: isCompact ? 'column' : 'row', gap: 16, marginBottom: 24, justifyContent: 'space-between', alignItems: isCompact ? 'stretch' : 'center' }}>
        <div style={{ display: 'flex', flex: 1, gap: 12 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#5a5a5a' }} />
            <input
              type="text" placeholder="Search by name or Reg ID..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '12px 14px 12px 40px', background: '#111', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, color: '#fff', fontSize: '.9rem' }}
            />
          </div>
          <select
            value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            style={{ padding: '0 16px', background: '#111', color: '#fff', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, fontSize: '.9rem', cursor: 'pointer' }}
          >
            {ROLE_OPTIONS.map(opt => <option key={opt.v} value={opt.v}>{opt.l}</option>)}
          </select>
        </div>
      </div>

      <div style={{ background: '#111', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '60px 0', color: '#5a5a5a' }}>No players found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600 }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,.02)', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
                  <th style={{ padding: '16px 20px', color: '#8a8a8a', fontSize: '.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>Player</th>
                  <th style={{ padding: '16px 20px', color: '#8a8a8a', fontSize: '.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>Reg ID</th>
                  <th style={{ padding: '16px 20px', color: '#8a8a8a', fontSize: '.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>Phone</th>
                  <th style={{ padding: '16px 20px', color: '#8a8a8a', fontSize: '.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>Role</th>
                  <th style={{ padding: '16px 20px', color: '#8a8a8a', fontSize: '.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>Status</th>
                  <th style={{ padding: '16px 20px', color: '#8a8a8a', fontSize: '.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,.05)', transition: 'background .15s' }}>
                    <td style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                      {p.photo_url ? (
                        <img src={p.photo_url} alt={p.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,.1)' }} />
                      ) : (
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserIcon size={16} color="#8a8a8a" /></div>
                      )}
                      <span style={{ fontWeight: 600, color: '#efefef' }}>{p.name}</span>
                    </td>
                    <td style={{ padding: '14px 20px', fontFamily: 'monospace', color: '#a0a0a0' }}>{p.registration_id}</td>
                    <td style={{ padding: '14px 20px', color: '#a0a0a0' }}>{p.phone}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: '.75rem', fontWeight: 700, color: ROLE_COLOR[p.role] || '#ff6b22', background: `${ROLE_COLOR[p.role] || '#ff6b22'}15`, padding: '4px 10px', borderRadius: 6, textTransform: 'uppercase' }}>
                        {ROLE_LABEL[p.role] || p.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      {p.is_verified ? (
                        <span style={{ color: '#22c55e', fontSize: '.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={14} /> Verified</span>
                      ) : (
                        <span style={{ color: '#f5a100', fontSize: '.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><XCircle size={14} /> Unverified</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <button
                        onClick={() => setEditingPlayer(p)}
                        style={{ padding: '6px 14px', background: 'rgba(255,107,34,.1)', color: '#ff6b22', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '.8rem' }}
                      >
                        Modify
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingPlayer && (
        <PlayerEditorModal
          player={editingPlayer}
          token={token}
          onClose={() => setEditingPlayer(null)}
          handleUnauthorized={handleUnauthorized}
          setPlayers={setPlayers}
          isCompact={isCompact}
          siteSettings={siteSettings}
          setSiteSettings={setSiteSettings}
        />
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────── */
/*  Player Editor Modal                            */
/* ─────────────────────────────────────────────── */
function PlayerEditorModal({ player, token, onClose, handleUnauthorized, setPlayers, isCompact, siteSettings, setSiteSettings }) {
  const [form, setForm] = useState({ ...player })
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const auctionConfig = getAuctionConfig(siteSettings)
  const [basePrice, setBasePrice] = useState(() => String(getPlayerBasePrice(player, siteSettings)))
  
  const photoFileRef = useRef(null)

  const handleFieldChange = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }))
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPhoto(true)
    try {
      const asset = await uploadToCloudinary(file)
      handleFieldChange('photo_url', asset.secureUrl)
    } catch (err) {
      alert('Upload failed: ' + err.message)
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const basePriceValue = Number(basePrice)
      const nextSettings = {
        ...(siteSettings || {}),
        auctionConfig: {
          ...auctionConfig,
          playerBasePriceOverrides: {
            ...auctionConfig.playerBasePriceOverrides,
            [player.id]: Number.isFinite(basePriceValue) ? Math.max(0, Math.round(basePriceValue)) : getPlayerBasePrice(player, siteSettings),
          },
        },
      }

      const [{ player: updated }] = await Promise.all([
        updatePlayerDetails(token, player.id, {
        phone: form.phone,
        registration_id: form.registration_id,
        photo_url: form.photo_url,
        is_verified: form.is_verified,
        is_captain: form.is_captain,
        }),
        updateSiteSettings(token, nextSettings),
      ])
      
      setPlayers(prev => prev.map(p => p.id === player.id ? updated : p))
      setSiteSettings(nextSettings)
      alert('Player details updated successfully.')
      onClose()
    } catch (err) {
      if (err.message === 'Unauthorized') handleUnauthorized()
      else alert('Failed to update details: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#111', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16, width: '100%', maxWidth: 650, maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
          <h2 style={{ fontFamily: '"Syne"', fontWeight: 700, fontSize: '1.2rem', color: '#fff' }}>Edit Player Details</h2>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.05)', border: 'none', borderRadius: 8, padding: 8, color: '#fff', cursor: 'pointer', display: 'flex' }}><XIcon size={16} /></button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Editable Section */}
          <div style={{ background: 'rgba(255,107,34,.03)', padding: 20, borderRadius: 12, border: '1px solid rgba(255,107,34,.2)', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span style={{ display: 'block', color: '#ff6b22', fontSize: '.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em' }}>Editable Details</span>
            
            {/* Editable Player Photo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
                {form.photo_url ? (
                  <img src={form.photo_url} alt="Photo" style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover', border: '1.5px solid rgba(255,107,34,.3)' }} />
                ) : (
                  <div style={{ width: 80, height: 80, borderRadius: 12, background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserIcon size={28} color="#8a8a8a" /></div>
                )}
                {uploadingPhoto && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.6)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff6b22', fontSize: '.7rem', fontWeight: 700 }}>Uploading...</div>}
              </div>
              <div>
                <input ref={photoFileRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                <button type="button" onClick={() => photoFileRef.current?.click()} style={{ padding: '8px 14px', background: 'rgba(255,107,34,.1)', border: '1px solid rgba(255,107,34,.25)', color: '#ff6b22', borderRadius: 8, cursor: 'pointer', fontSize: '.8rem', fontWeight: 700 }}>Upload New Player Photo</button>
                <p style={{ color: '#6a6a6a', fontSize: '.72rem', marginTop: 6 }}>This image will be used during the live player auction.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isCompact ? '1fr' : '1fr 1fr 1fr', gap: 14 }}>
              <label>
                <span style={{ display: 'block', color: '#efefef', fontSize: '.78rem', marginBottom: 6, fontWeight: 600 }}>Registration Number / ID *</span>
                <input value={form.registration_id} onChange={e => handleFieldChange('registration_id', e.target.value.toUpperCase())} required style={{ width: '100%', padding: 11, background: '#111', border: '1px solid rgba(255,107,34,.3)', borderRadius: 8, color: '#fff', fontSize: '.9rem', fontFamily: 'monospace', outline: 'none' }} />
              </label>
              <label>
                <span style={{ display: 'block', color: '#efefef', fontSize: '.78rem', marginBottom: 6, fontWeight: 600 }}>Phone Number *</span>
                <input value={form.phone} onChange={e => handleFieldChange('phone', e.target.value)} required style={{ width: '100%', padding: 11, background: '#111', border: '1px solid rgba(255,107,34,.3)', borderRadius: 8, color: '#fff', fontSize: '.9rem', outline: 'none' }} />
              </label>
              <label>
                <span style={{ display: 'block', color: '#efefef', fontSize: '.78rem', marginBottom: 6, fontWeight: 600 }}>Verification Status *</span>
                <select
                  value={form.is_verified ? 'verified' : 'unverified'}
                  onChange={e => handleFieldChange('is_verified', e.target.value === 'verified')}
                  style={{ width: '100%', padding: 11, background: '#111', border: '1px solid rgba(255,107,34,.3)', borderRadius: 8, color: form.is_verified ? '#22c55e' : '#f5a100', fontSize: '.9rem', outline: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  <option value="unverified" style={{ color: '#f5a100', background: '#111' }}>Pending / Unverified</option>
                  <option value="verified" style={{ color: '#22c55e', background: '#111' }}>Verified</option>
                </select>
              </label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14, marginTop: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', background: '#111', padding: '12px 14px', borderRadius: 8, border: '1px solid rgba(255,107,34,.15)' }}>
                <input
                  type="checkbox"
                  checked={Boolean(form.is_captain)}
                  onChange={e => handleFieldChange('is_captain', e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: '#ff6b22', cursor: 'pointer' }}
                />
                <span style={{ color: '#fff', fontSize: '.9rem', fontWeight: 600 }}>Mark as Captain Candidate</span>
              </label>
              <label>
                <span style={{ display: 'block', color: '#efefef', fontSize: '.78rem', marginBottom: 6, fontWeight: 600 }}>Base Price (Cr)</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={basePrice}
                  onChange={e => setBasePrice(e.target.value)}
                  style={{ width: '100%', padding: 11, background: '#111', border: '1px solid rgba(255,107,34,.3)', borderRadius: 8, color: '#fff', fontSize: '.9rem', outline: 'none' }}
                />
                <p style={{ color: '#6a6a6a', fontSize: '.72rem', marginTop: 6 }}>
                  Current defaults: captains {formatCr(auctionConfig.captainBasePrice)}, players {formatCr(auctionConfig.playerBasePrice)}.
                </p>
              </label>
            </div>
          </div>

          {/* Read-Only Informational Section */}
          <div style={{ background: 'rgba(255,255,255,.01)', padding: 20, borderRadius: 12, border: '1px solid rgba(255,255,255,.04)', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span style={{ display: 'block', color: '#8a8a8a', fontSize: '.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>Read-Only Player Info</span>
            
            <div style={{ display: 'grid', gridTemplateColumns: isCompact ? '1fr' : '1fr 1fr', gap: 14 }}>
              <label>
                <span style={{ display: 'block', color: '#5a5a5a', fontSize: '.75rem', marginBottom: 4 }}>Full Name</span>
                <input value={form.name} disabled style={{ width: '100%', padding: 10, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.05)', borderRadius: 8, color: '#7a7a7a', fontSize: '.9rem', cursor: 'not-allowed' }} />
              </label>
              <label>
                <span style={{ display: 'block', color: '#5a5a5a', fontSize: '.75rem', marginBottom: 4 }}>Email Address</span>
                <input value={form.email} disabled style={{ width: '100%', padding: 10, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.05)', borderRadius: 8, color: '#7a7a7a', fontSize: '.9rem', cursor: 'not-allowed' }} />
              </label>
              <label>
                <span style={{ display: 'block', color: '#5a5a5a', fontSize: '.75rem', marginBottom: 4 }}>Academic Branch / Class</span>
                <input value={`Year ${form.year} • ${form.branch?.toUpperCase?.()} • Sec ${form.section?.toUpperCase?.()}`} disabled style={{ width: '100%', padding: 10, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.05)', borderRadius: 8, color: '#7a7a7a', fontSize: '.9rem', cursor: 'not-allowed' }} />
              </label>
              <label>
                <span style={{ display: 'block', color: '#5a5a5a', fontSize: '.75rem', marginBottom: 4 }}>Playing Role & Styles</span>
                <input value={`${ROLE_LABEL[form.role] || form.role} ${form.batting_side ? `• Bat: ${form.batting_side}-hand` : ''} ${form.bowling_arm ? `• Bowl: ${form.bowling_arm} arm` : ''}`} disabled style={{ width: '100%', padding: 10, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.05)', borderRadius: 8, color: '#7a7a7a', fontSize: '.9rem', cursor: 'not-allowed' }} />
              </label>
              <label>
                <span style={{ display: 'block', color: '#5a5a5a', fontSize: '.75rem', marginBottom: 4 }}>UTR Number (Payment)</span>
                <input value={form.utr_number || '—'} disabled style={{ width: '100%', padding: 10, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.05)', borderRadius: 8, color: '#7a7a7a', fontSize: '.9rem', cursor: 'not-allowed', fontFamily: 'monospace' }} />
              </label>
            </div>
          </div>

          {/* Modal Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid rgba(255,255,255,.05)', paddingTop: 20 }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', background: 'rgba(255,255,255,.05)', border: 'none', color: '#efefef', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
            <button type="submit" disabled={saving || uploadingPhoto} style={{ padding: '10px 24px', background: '#ff6b22', border: 'none', color: '#fff', borderRadius: 8, cursor: 'pointer', fontWeight: 700, opacity: (saving || uploadingPhoto) ? 0.7 : 1 }}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────── */
/*  Payment QR Setup Panel                         */
/* ─────────────────────────────────────────────── */
function PaymentQRPanel({ settings, onSave, saving, isCompact }) {
  const [form, setForm] = useState({ ...settings })
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  const handleQrUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const asset = await uploadToCloudinary(file)
      setForm(prev => ({ ...prev, paymentQrUrl: asset.secureUrl }))
    } catch (err) {
      alert('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = () => {
    onSave(form)
  }

  return (
    <div style={{ width: '100%', maxWidth: 'none' }}>
      <div style={{
        position: 'sticky',
        top: isCompact ? 64 : 72,
        zIndex: 50,
        marginBottom: 24,
        background: 'rgba(12,12,12,.96)',
        border: '1px solid rgba(255,255,255,.08)',
        borderRadius: 12,
        padding: isCompact ? '10px 12px' : '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}>
        <div>
          <p style={{ color: '#efefef', fontWeight: 700, fontSize: '.92rem' }}>Payment QR Code Setup</p>
          <p style={{ color: '#7a7a7a', fontSize: '.78rem' }}>Upload or reset the UPI Payment QR code dynamically.</p>
        </div>
        <button onClick={handleSave} disabled={saving || uploading} style={{ background: '#ff6b22', color: '#fff', border: 'none', padding: '10px 20px', fontSize: '.9rem', fontWeight: 700, borderRadius: 10, cursor: (saving || uploading) ? 'not-allowed' : 'pointer', opacity: (saving || uploading) ? 0.7 : 1, whiteSpace: 'nowrap' }}>
          {saving ? 'Saving...' : 'Save QR Setup'}
        </button>
      </div>

      <div style={{ background: '#111', padding: 24, borderRadius: 16, border: '1px solid rgba(255,255,255,.08)', display: 'grid', gridTemplateColumns: isCompact ? '1fr' : '1fr 1.5fr', gap: 24 }}>
        
        {/* QR Code Preview */}
        <div style={{ background: '#1a1a1a', padding: 20, borderRadius: 12, border: '1px solid rgba(255,255,255,.05)', textAlign: 'center' }}>
          <span style={{ display: 'block', color: '#8a8a8a', fontSize: '.8rem', marginBottom: 16, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>Current Active QR</span>
          <div style={{ position: 'relative', width: '100%', maxWidth: 260, margin: '0 auto' }}>
            <img
              src={form.paymentQrUrl || '/gpay-qr.jpeg'}
              alt="Payment QR"
              style={{ width: '100%', borderRadius: 12, border: '1px solid rgba(255,255,255,.12)', background: '#fff', display: 'block' }}
            />
            {uploading && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.75)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff6b22', fontWeight: 700 }}>Uploading Image...</div>}
          </div>
        </div>

        {/* Upload Action Card */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16 }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>Change Payment QR Code</h3>
          <p style={{ color: '#8a8a8a', fontSize: '.9rem', lineHeight: 1.6 }}>
            Upload a fresh UPI payment QR code generated from your GPay, PhonePe, Paytm, or other banking apps. It will instantly update across the public player registration form.
          </p>
          
          <input ref={fileRef} type="file" accept="image/*" onChange={handleQrUpload} style={{ display: 'none' }} />
          
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading || saving}
            style={{
              padding: '16px 24px',
              background: 'rgba(255,107,34,.05)',
              border: '1.5px dashed rgba(255,107,34,.3)',
              borderRadius: 12,
              cursor: 'pointer',
              color: '#ff6b22',
              fontWeight: 700,
              fontSize: '.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all .2s'
            }}
          >
            <Upload size={18} />
            {uploading ? 'Processing Image...' : 'Upload QR Code from System'}
          </button>
          
          <span style={{ color: '#5a5a5a', fontSize: '.75rem', textAlign: 'center' }}>Supported formats: PNG, JPG, JPEG (Max size: 5 MB)</span>
        </div>
      </div>
    </div>
  )
}
