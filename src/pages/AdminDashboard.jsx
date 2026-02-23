import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchAdminPlayers, verifyAdminPlayer, logoutAdmin } from '../lib/adminApi'
import {
  Flame, LogOut, ShieldCheck, Users, CreditCard,
  RefreshCw, CheckCircle, XCircle, ExternalLink, Search,
  User as UserIcon, X as XIcon, ChevronLeft, ChevronRight
} from 'lucide-react'

const TABS = [
  { id: 'payments', label: 'Payment Verification', icon: <CreditCard size={16} /> },
  { id: 'auction',  label: 'Auction Roster',       icon: <Users size={16} />      },
]

const ROLE_OPTIONS = [
  { v: 'all',                    l: 'All Players' },
  { v: 'batsman',                l: 'Batsmen' },
  { v: 'bowler',                 l: 'Bowlers' },
  { v: 'wicket_keeper_batsman',  l: 'Wicket Keepers' },
  { v: 'all_rounder',            l: 'All Rounders' },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const token = sessionStorage.getItem('vpl_admin_token')
  const [tab, setTab]               = useState('payments')
  const [players, setPlayers]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [search, setSearch]         = useState('')
  const [spotlight, setSpotlight]     = useState(null)   // index into rosteredPlayers

  const handleUnauthorized = useCallback(() => {
    sessionStorage.removeItem('vpl_admin_token')
    sessionStorage.removeItem('vpl_admin')
    navigate('/admin')
  }, [navigate])

  const logout = () => {
    if (token) logoutAdmin(token).catch(() => {})
    handleUnauthorized()
  }

  const fetchPlayers = useCallback(async () => {
    if (!token) {
      setError('Your session expired. Please sign in again.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      const { players: rows } = await fetchAdminPlayers(token)
      setPlayers(rows || [])
    } catch (err) {
      if (err.message === 'Unauthorized') {
        handleUnauthorized()
        return
      }
      setError(err.message || 'Failed to load players.')
    } finally {
      setLoading(false)
    }
  }, [handleUnauthorized, token])

  useEffect(() => {
    if (!sessionStorage.getItem('vpl_admin_token')) { navigate('/admin'); return }
    fetchPlayers()
  }, [fetchPlayers, navigate])

  const verifyPlayer = async (id) => {
    try {
      await verifyAdminPlayer(token, id)
      setPlayers(prev => prev.map(p => p.id === id ? { ...p, is_verified: true } : p))
    } catch (err) {
      if (err.message === 'Unauthorized') {
        handleUnauthorized()
        return
      }
      alert('Update failed: ' + (err.message || 'Request failed.'))
    }
  }

  const unverified = players.filter(p => !p.is_verified)
  const verified   = players.filter(p => p.is_verified)

  const rosteredPlayers = players.filter(p => {
    const matchRole = roleFilter === 'all' || p.role === roleFilter
    const matchSearch = search === '' ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.registration_id?.toLowerCase().includes(search.toLowerCase())
    return matchRole && matchSearch
  })

  return (
    <div style={{ minHeight: '100vh', background: '#070707', fontFamily: '"DM Sans",system-ui,sans-serif', color: '#efefef' }}>

      {/* Full-screen player spotlight */}
      {spotlight !== null && (
        <PlayerSpotlight
          players={rosteredPlayers}
          index={spotlight}
          onNavigate={setSpotlight}
          onClose={() => setSpotlight(null)}
        />
      )}

      {/* Top Bar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(7,7,7,.92)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,.08)',
        padding: '0 24px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Flame size={18} color="#ff6b22" />
            <span style={{ fontFamily: '"Syne"', fontWeight: 800, color: '#ff6b22', fontSize: '1.05rem' }}>VPL</span>
            <span style={{ color: '#3a3a3a', margin: '0 6px' }}>/</span>
            <ShieldCheck size={14} color="#9a9a9a" />
            <span style={{ color: '#9a9a9a', fontSize: '.82rem', fontWeight: 600 }}>Admin Panel</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: '.78rem', color: '#5a5a5a' }}>
              {players.length} players · {verified.length} verified
            </span>
            <button onClick={fetchPlayers} title="Refresh"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5a5a5a', padding: 4, display: 'flex' }}>
              <RefreshCw size={16} />
            </button>
            <button onClick={logout} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(230,57,70,.12)', border: '1px solid rgba(230,57,70,.25)',
              borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
              color: '#e63946', fontSize: '.78rem', fontWeight: 600,
            }}>
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px' }}>
        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 28 }}>
          {[
            { label: 'Total Registered',  value: players.length,    color: '#ff6b22' },
            { label: 'Verified',          value: verified.length,   color: '#22c55e' },
            { label: 'Pending Review',    value: unverified.length, color: '#f5a100' },
            { label: 'With Photos',       value: players.filter(p => p.photo_url).length, color: '#a78bfa' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'rgba(18,18,18,.92)', border: '1px solid rgba(255,255,255,.08)',
              borderRadius: 14, padding: '18px 20px',
            }}>
              <p style={{ color: '#6a6a6a', fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>{s.label}</p>
              <p style={{ fontFamily: '"Syne"', fontSize: '1.9rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 10, cursor: 'pointer',
              fontFamily: '"DM Sans"', fontWeight: 600, fontSize: '.84rem',
              border: tab === t.id ? '1px solid rgba(255,107,34,.5)' : '1px solid rgba(255,255,255,.08)',
              background: tab === t.id ? 'rgba(255,107,34,.1)' : 'rgba(18,18,18,.92)',
              color: tab === t.id ? '#ff6b22' : '#6a6a6a',
              transition: 'all .2s',
            }}>
              {t.icon} {t.label}
              {t.id === 'payments' && unverified.length > 0 && (
                <span style={{ background: '#ff6b22', color: '#fff', fontSize: '.65rem', fontWeight: 800, borderRadius: 99, padding: '1px 7px' }}>
                  {unverified.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Error / Loading */}
        {error && (
          <div style={{ padding: '14px 18px', background: 'rgba(230,57,70,.08)', border: '1px solid rgba(230,57,70,.25)', borderRadius: 12, marginBottom: 20, color: '#e63946', fontSize: '.85rem' }}>
            ⚠️ {error}
          </div>
        )}
        {loading && <p style={{ color: '#5a5a5a', textAlign: 'center', padding: '60px 0' }}>Loading players…</p>}

        {/* ── Payment Verification ── */}
        {!loading && tab === 'payments' && (
          <PaymentPanel players={players} unverified={unverified} onVerify={verifyPlayer} />
        )}

        {/* ── Auction Roster ── */}
        {!loading && tab === 'auction' && (
          <AuctionPanel players={rosteredPlayers} allCount={players.length}
            roleFilter={roleFilter} setRoleFilter={setRoleFilter}
            search={search} setSearch={setSearch}
            onSelect={(idx) => setSpotlight(idx)} />
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────── */
/*  Payment Verification Panel                     */
/* ─────────────────────────────────────────────── */
function PaymentPanel({ players, unverified, onVerify }) {
  const [showAll, setShowAll] = useState(false)
  const displayed = showAll ? players : unverified

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontFamily: '"Syne"', fontWeight: 800, fontSize: '1.1rem', color: '#efefef' }}>
          Payment Verification
        </h2>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#9a9a9a', fontSize: '.8rem' }}>
          <input type="checkbox" checked={showAll} onChange={e => setShowAll(e.target.checked)}
            style={{ accentColor: '#ff6b22' }} />
          Show all (including verified)
        </label>
      </div>

      {displayed.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#5a5a5a' }}>
          <CheckCircle size={40} color="#22c55e" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontFamily: '"Syne"', fontWeight: 700, color: '#9a9a9a' }}>All payments verified!</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {displayed.map(p => (
          <div key={p.id} style={{
            background: 'rgba(18,18,18,.92)', border: `1px solid ${p.is_verified ? 'rgba(34,197,94,.2)' : 'rgba(255,255,255,.08)'}`,
            borderRadius: 14, padding: '18px 20px',
            display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12 }}>
              {/* Name + ID */}
              <div>
                <p style={{ color: '#6a6a6a', fontSize: '.68rem', textTransform: 'uppercase', letterSpacing: '.1em' }}>Player</p>
                <p style={{ fontFamily: '"Syne"', fontWeight: 700, color: '#efefef', fontSize: '.9rem' }}>{p.name}</p>
                <p style={{ color: '#6a6a6a', fontSize: '.76rem', fontFamily: 'monospace' }}>{p.registration_id}</p>
              </div>
              {/* Phone */}
              <div>
                <p style={{ color: '#6a6a6a', fontSize: '.68rem', textTransform: 'uppercase', letterSpacing: '.1em' }}>Phone</p>
                <p style={{ color: '#b0b0b0', fontSize: '.85rem' }}>{p.phone}</p>
              </div>
              {/* UTR */}
              <div>
                <p style={{ color: '#6a6a6a', fontSize: '.68rem', textTransform: 'uppercase', letterSpacing: '.1em' }}>UTR Number</p>
                <p style={{ fontFamily: 'monospace', color: '#f5a100', fontSize: '.88rem', fontWeight: 700 }}>{p.utr_number || '—'}</p>
              </div>
              {/* Screenshot */}
              <div>
                <p style={{ color: '#6a6a6a', fontSize: '.68rem', textTransform: 'uppercase', letterSpacing: '.1em' }}>Screenshot</p>
                {p.payment_screenshot_url ? (
                  <a href={p.payment_screenshot_url} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#ff6b22', fontSize: '.8rem', textDecoration: 'none', fontWeight: 600 }}>
                    <ExternalLink size={13} /> View Image
                  </a>
                ) : <span style={{ color: '#3a3a3a', fontSize: '.8rem' }}>No screenshot</span>}
              </div>
            </div>

            {/* Status / Action */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, minWidth: 120 }}>
              {p.is_verified ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#22c55e', fontSize: '.8rem', fontWeight: 700 }}>
                  <CheckCircle size={14} /> Verified
                </span>
              ) : (
                <>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#f5a100', fontSize: '.78rem' }}>
                    <XCircle size={13} /> Pending
                  </span>
                  <button onClick={() => onVerify(p.id)} style={{
                    padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(130deg,#22c55e,#16a34a)',
                    color: '#fff', fontFamily: '"DM Sans"', fontWeight: 700, fontSize: '.8rem',
                    whiteSpace: 'nowrap',
                  }}>
                    ✓ Verify Payment
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
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
      {/* Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20, alignItems: 'center' }}>
        {/* Role filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {ROLE_OPTIONS.map(r => (
            <button key={r.v} onClick={() => setRoleFilter(r.v)} style={{
              padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
              fontFamily: '"DM Sans"', fontWeight: 600, fontSize: '.78rem',
              border: roleFilter === r.v ? '1px solid rgba(255,107,34,.5)' : '1px solid rgba(255,255,255,.08)',
              background: roleFilter === r.v ? 'rgba(255,107,34,.12)' : 'rgba(18,18,18,.92)',
              color: roleFilter === r.v ? '#ff6b22' : '#6a6a6a',
              transition: 'all .2s',
            }}>
              {r.l}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginLeft: 'auto' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#5a5a5a' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name or Reg ID…"
            style={{
              padding: '9px 14px 9px 34px', borderRadius: 10,
              background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
              color: '#efefef', fontFamily: '"DM Sans"', fontSize: '.84rem',
              outline: 'none', width: 220, boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(255,107,34,.45)'}
            onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,.1)'}
          />
        </div>
      </div>

      <p style={{ color: '#5a5a5a', fontSize: '.78rem', marginBottom: 18 }}>
        Showing {players.length} of {allCount} players &mdash; <span style={{ color: '#ff6b22' }}>click a card to spotlight</span>
      </p>

      {players.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#5a5a5a' }}>
          <Users size={40} style={{ margin: '0 auto 12px', opacity: .3 }} />
          <p>No players match the current filter.</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
        {players.map((p, idx) => (
          <PlayerCard key={p.id} player={p} onSelect={() => onSelect(idx)} />
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────── */
/*  Player Card                                    */
/* ─────────────────────────────────────────────── */
const ROLE_LABEL = {
  batsman:               'Batsman',
  bowler:                'Bowler',
  wicket_keeper_batsman: 'Wicket Keeper',
  all_rounder:           'All Rounder',
}
const ROLE_COLOR = {
  batsman:               '#60a5fa',
  bowler:                '#f87171',
  wicket_keeper_batsman: '#a78bfa',
  all_rounder:           '#34d399',
}

function PlayerCard({ player: p, onSelect }) {
  const roleColor = ROLE_COLOR[p.role] || '#9a9a9a'

  return (
    <div
      onClick={() => onSelect?.(p)}
      style={{
        background: 'rgba(18,18,18,.95)', border: '1px solid rgba(255,255,255,.08)',
        borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
        transition: 'transform .25s, border-color .25s, box-shadow .25s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = `${roleColor}50`; e.currentTarget.style.boxShadow = `0 8px 32px ${roleColor}18` }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)'; e.currentTarget.style.boxShadow = '' }}
    >
      {/* Photo header */}
      <div style={{
        background: 'rgba(255,255,255,.03)', padding: '24px 16px 16px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        borderBottom: '1px solid rgba(255,255,255,.06)',
      }}>
        {p.photo_url ? (
          <img src={p.photo_url} alt={p.name}
            style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover',
              border: `2px solid ${roleColor}60` }} />
        ) : (
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,.06)',
            border: '2px solid rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserIcon size={32} color="#4a4a4a" />
          </div>
        )}
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: '"Syne"', fontWeight: 700, color: '#efefef', fontSize: '.95rem' }}>{p.name}</p>
          <p style={{ fontFamily: 'monospace', color: '#ff6b22', fontSize: '.72rem', marginTop: 2 }}>{p.registration_id}</p>
        </div>
        <span style={{
          padding: '3px 12px', borderRadius: 99, fontSize: '.68rem', fontWeight: 700,
          background: `${roleColor}18`, border: `1px solid ${roleColor}40`, color: roleColor,
        }}>
          {ROLE_LABEL[p.role] || p.role}
        </span>
      </div>

      {/* Details */}
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 7 }}>
        <Detail label="Year" value={`Year ${p.year}`} />
        <Detail label="Branch" value={`${p.branch?.toUpperCase?.()} — Sec ${p.section?.toUpperCase?.()}`} />
        {p.batting_side && <Detail label="Batting" value={`${p.batting_side}-handed`} />}
        {p.bowling_arm  && <Detail label="Bowling" value={`${p.bowling_arm} arm · ${(p.bowling_type || '').replace('_',' ')}`} />}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ color: '#3a3a3a', fontSize: '.68rem', textTransform: 'uppercase', letterSpacing: '.08em' }}>Status</span>
          <span style={{ fontSize: '.72rem', color: p.is_verified ? '#22c55e' : '#f5a100', fontWeight: 600 }}>
            {p.is_verified ? '✓ Verified' : '⏳ Pending'}
          </span>
        </div>
        <p style={{ textAlign: 'center', color: '#3a3a3a', fontSize: '.68rem', marginTop: 4 }}>Click to spotlight →</p>
      </div>
    </div>
  )
}

function Detail({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
      <span style={{ color: '#5a5a5a', fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.08em', flexShrink: 0 }}>{label}</span>
      <span style={{ color: '#afafaf', fontSize: '.8rem', fontWeight: 500, textAlign: 'right' }}>{value || '—'}</span>
    </div>
  )
}

/* ─────────────────────────────────────────────── */
/*  Player Spotlight (fullscreen overlay)            */
/* ─────────────────────────────────────────────── */
function PlayerSpotlight({ players, index, onNavigate, onClose }) {
  const p         = players[index]
  const roleColor = ROLE_COLOR[p?.role] || '#ff6b22'
  const hasPrev   = index > 0
  const hasNext   = index < players.length - 1

  useEffect(() => {
    const fn = e => {
      if (e.key === 'Escape')     onClose()
      if (e.key === 'ArrowRight' && hasNext) onNavigate(index + 1)
      if (e.key === 'ArrowLeft'  && hasPrev) onNavigate(index - 1)
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose, onNavigate, index, hasPrev, hasNext])

  if (!p) return null

  const navBtn = (enabled) => ({
    width: 52, height: 52, borderRadius: 14,
    background: enabled ? 'rgba(255,255,255,.1)' : 'rgba(255,255,255,.03)',
    border: `1px solid ${enabled ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.06)'}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: enabled ? 'pointer' : 'not-allowed',
    color: enabled ? '#d0d0d0' : '#2a2a2a',
    transition: 'all .2s', position: 'absolute', top: '50%', transform: 'translateY(-50%)', zIndex: 10,
  })

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(0,0,0,.9)',
        backdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '80px 24px',
        animation: 'spotlightIn .22s ease',
      }}
    >
      {/* Prev */}
      <button
        onClick={e => { e.stopPropagation(); hasPrev && onNavigate(index - 1) }}
        style={{ ...navBtn(hasPrev), left: 20 }}
        onMouseEnter={e => hasPrev && Object.assign(e.currentTarget.style, { background:'rgba(255,107,34,.15)', borderColor:'rgba(255,107,34,.4)', color:'#ff6b22' })}
        onMouseLeave={e => Object.assign(e.currentTarget.style, { background: hasPrev ? 'rgba(255,255,255,.1)':'rgba(255,255,255,.03)', borderColor: hasPrev?'rgba(255,255,255,.18)':'rgba(255,255,255,.06)', color: hasPrev?'#d0d0d0':'#2a2a2a' })}
      ><ChevronLeft size={26} /></button>

      {/* Next */}
      <button
        onClick={e => { e.stopPropagation(); hasNext && onNavigate(index + 1) }}
        style={{ ...navBtn(hasNext), right: 20 }}
        onMouseEnter={e => hasNext && Object.assign(e.currentTarget.style, { background:'rgba(255,107,34,.15)', borderColor:'rgba(255,107,34,.4)', color:'#ff6b22' })}
        onMouseLeave={e => Object.assign(e.currentTarget.style, { background: hasNext ? 'rgba(255,255,255,.1)':'rgba(255,255,255,.03)', borderColor: hasNext?'rgba(255,255,255,.18)':'rgba(255,255,255,.06)', color: hasNext?'#d0d0d0':'#2a2a2a' })}
      ><ChevronRight size={26} /></button>

      {/* Card */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'rgba(18,18,18,.98)',
          border: `1px solid ${roleColor}30`,
          borderRadius: 24,
          maxWidth: 520, width: '100%',
          boxShadow: `0 0 80px ${roleColor}25, 0 0 200px ${roleColor}10`,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16, zIndex: 10,
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#9a9a9a',
          }}
        >
          <XIcon size={18} />
        </button>

        {/* Photo section */}
        <div style={{
          background: `linear-gradient(180deg, ${roleColor}0d 0%, transparent 100%)`,
          padding: '48px 32px 32px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
          borderBottom: `1px solid ${roleColor}18`,
          position: 'relative',
        }}>
          {/* Glow orb */}
          <div style={{
            position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
            width: 280, height: 280, borderRadius: '50%',
            background: `radial-gradient(circle, ${roleColor}18 0%, transparent 65%)`,
            pointerEvents: 'none',
          }} />

          {/* Big photo */}
          {p.photo_url ? (
            <img src={p.photo_url} alt={p.name} style={{
              width: 180, height: 180, borderRadius: '50%', objectFit: 'cover',
              border: `3px solid ${roleColor}60`,
              boxShadow: `0 0 40px ${roleColor}30`,
              position: 'relative',
            }} />
          ) : (
            <div style={{
              width: 180, height: 180, borderRadius: '50%',
              background: 'rgba(255,255,255,.06)',
              border: `3px solid rgba(255,255,255,.12)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}>
              <UserIcon size={72} color="#3a3a3a" />
            </div>
          )}

          {/* Name */}
          <div style={{ textAlign: 'center', position: 'relative' }}>
            <h2 style={{
              fontFamily: '"Syne",system-ui,sans-serif', fontWeight: 800,
              fontSize: '1.6rem', color: '#efefef', letterSpacing: '-.01em', marginBottom: 4,
            }}>{p.name}</h2>
            <p style={{ fontFamily: 'monospace', color: '#ff6b22', fontSize: '.85rem', fontWeight: 700 }}>
              {p.registration_id}
            </p>
          </div>

          {/* Role badge */}
          <span style={{
            padding: '6px 20px', borderRadius: 99, fontSize: '.8rem', fontWeight: 800,
            background: `${roleColor}18`, border: `1.5px solid ${roleColor}50`, color: roleColor,
            textTransform: 'uppercase', letterSpacing: '.1em',
          }}>
            {ROLE_LABEL[p.role] || p.role}
          </span>
        </div>

        {/* Stats grid */}
        <div style={{ padding: '24px 32px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 28px' }}>
          <SpotDetail label="Year" value={`Year ${p.year}`} />
          <SpotDetail label="Branch" value={p.branch?.toUpperCase?.()} />
          <SpotDetail label="Section" value={`Section ${p.section?.toUpperCase?.()}`} />
          <SpotDetail label="Phone" value={p.phone} />
          {p.batting_side && <SpotDetail label="Batting" value={`${p.batting_side}-handed`} color={roleColor} />}
          {p.bowling_arm  && <SpotDetail label="Bowling Arm" value={`${p.bowling_arm} arm`} color={roleColor} />}
          {p.bowling_type && <SpotDetail label="Bowl Style" value={(p.bowling_type || '').replace(/_/g,' ')} color={roleColor} />}
        </div>

        {/* VPL watermark */}
        <div style={{ borderTop: `1px solid rgba(255,255,255,.06)`, padding: '12px 32px', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
          <Flame size={13} color="#ff6b22" />
          <span style={{ fontFamily: '"Syne"', color: '#2a2a2a', fontSize: '.72rem', fontWeight: 800, letterSpacing: '.2em' }}>VPL AUCTION · PLAYER CARD</span>
          <Flame size={13} color="#ff6b22" />
        </div>
      </div>

      <style>{`
        @keyframes spotlightIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

function SpotDetail({ label, value, color }) {
  return (
    <div>
      <p style={{ color: '#4a4a4a', fontSize: '.65rem', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 3 }}>{label}</p>
      <p style={{ color: color || '#d0d0d0', fontSize: '.88rem', fontWeight: 600, fontFamily: '"DM Sans"' }}>{value || '—'}</p>
    </div>
  )
}

