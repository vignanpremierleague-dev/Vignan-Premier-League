import { useState, useEffect, useCallback } from 'react'
import { fetchPublicPlayers } from '../lib/publicApi'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import {
  Search, Users, X as XIcon, ChevronLeft, ChevronRight,
  Star, Shield, Zap, Target, Swords
} from 'lucide-react'

/* ─── Constants ─── */
const CACHE_KEY   = 'vpl_players_cache'
const CACHE_TTL   = 5 * 60 * 1000          // 5 minutes

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
const ROLE_ICON = {
  batsman:               <Target size={14} />,
  bowler:                <Zap size={14} />,
  wicket_keeper_batsman: <Shield size={14} />,
  all_rounder:           <Swords size={14} />,
}

const FILTERS = [
  { v: 'all',                   l: 'All Players',    icon: <Users size={14} /> },
  { v: 'captains',              l: 'Captains',        icon: <Star size={14} /> },
  { v: 'batsman',               l: 'Batsmen',         icon: <Target size={14} /> },
  { v: 'bowler',                l: 'Bowlers',         icon: <Zap size={14} /> },
  { v: 'wicket_keeper_batsman', l: 'Wicket Keepers',  icon: <Shield size={14} /> },
  { v: 'all_rounder',           l: 'All Rounders',    icon: <Swords size={14} /> },
]

/* ─── localStorage helpers ─── */
function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { ts, data } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) return null
    return data
  } catch { return null }
}
function writeCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }))
  } catch {}
}

/* ─── Main Page ─── */
export default function PlayersPage() {
  const [players, setPlayers]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [search, setSearch]         = useState('')
  const [spotlight, setSpotlight]   = useState(null)   // index

  /* fetch – cache first */
  const load = useCallback(async (force = false) => {
    setLoading(true); setError('')
    try {
      const cached = !force && readCache()
      if (cached) { setPlayers(cached); setLoading(false); return }
      const rows = await fetchPublicPlayers()
      setPlayers(rows)
      writeCache(rows)
    } catch (e) {
      setError(e.message || 'Failed to load players.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  /* filtered list */
  const filtered = players.filter(p => {
    const matchRole =
      roleFilter === 'all'     ? true :
      roleFilter === 'captains' ? p.is_captain :
      p.role === roleFilter
    const q = search.toLowerCase()
    const matchSearch = !q ||
      p.name?.toLowerCase().includes(q) ||
      p.registration_id?.toLowerCase().includes(q) ||
      p.section?.toLowerCase().includes(q) ||
      p.branch?.toLowerCase().includes(q)
    return matchRole && matchSearch
  })

  return (
    <div style={{ minHeight: '100vh', background: '#08080a', color: '#efefef', fontFamily: '"DM Sans", system-ui, sans-serif' }}>
      <Navbar />
      <div style={{ height: 60 }} />

      {/* Spotlight overlay */}
      {spotlight !== null && (
        <PlayerSpotlight
          players={filtered}
          index={spotlight}
          onNavigate={setSpotlight}
          onClose={() => setSpotlight(null)}
        />
      )}

      {/* ── Hero strip ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,107,34,.08) 0%, rgba(255,75,0,.04) 100%)',
        borderBottom: '1px solid rgba(255,107,34,.12)',
        padding: '48px 24px 40px',
        textAlign: 'center',
      }}>
        <p style={{ fontFamily: '"Syne"', fontSize: '.7rem', fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase', color: '#ff6b22', margin: '0 0 10px' }}>
          Vignan Premier League · Season 1
        </p>
        <h1 style={{ fontFamily: '"Syne"', fontWeight: 900, fontSize: 'clamp(2rem,5vw,3.2rem)', color: '#fff', margin: '0 0 12px', lineHeight: 1.1 }}>
          Player Pool
        </h1>
        <p style={{ color: '#6a6a6a', fontSize: '.9rem', maxWidth: 420, margin: '0 auto' }}>
          All {players.length} registered &amp; verified players competing in VPL 2026.
        </p>
      </div>

      {/* ── Body: sidebar + grid ── */}
      <div style={{ display: 'flex', maxWidth: 1400, margin: '0 auto', padding: '32px 20px', gap: 28, alignItems: 'flex-start' }}>

        {/* ── Left Sidebar: filters ── */}
        <aside className="vpl-sidebar" style={{
          width: 200, flexShrink: 0,
          position: 'sticky', top: 80,
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <p style={{ fontSize: '.65rem', fontWeight: 800, letterSpacing: '.15em', textTransform: 'uppercase', color: '#4a4a4a', marginBottom: 4 }}>
            Filter by Role
          </p>
          {FILTERS.map(f => (
            <button
              key={f.v}
              onClick={() => setRoleFilter(f.v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '11px 14px', borderRadius: 10,
                border: roleFilter === f.v ? '1px solid rgba(255,107,34,.45)' : '1px solid rgba(255,255,255,.06)',
                background: roleFilter === f.v ? 'rgba(255,107,34,.1)' : 'rgba(255,255,255,.02)',
                color: roleFilter === f.v ? '#ff6b22' : '#7a7a7a',
                fontFamily: '"DM Sans"', fontWeight: 600, fontSize: '.85rem',
                cursor: 'pointer', transition: 'all .2s', textAlign: 'left',
              }}
            >
              <span style={{ opacity: roleFilter === f.v ? 1 : 0.5 }}>{f.icon}</span>
              {f.l}
            </button>
          ))}

          {/* count */}
          <div style={{ marginTop: 16, background: 'rgba(255,255,255,.03)', borderRadius: 10, padding: '14px', border: '1px solid rgba(255,255,255,.05)' }}>
            <p style={{ color: '#4a4a4a', fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', margin: '0 0 6px' }}>Showing</p>
            <p style={{ color: '#ff6b22', fontFamily: '"Syne"', fontWeight: 800, fontSize: '1.6rem', margin: 0, lineHeight: 1 }}>
              {filtered.length}
            </p>
            <p style={{ color: '#6a6a6a', fontSize: '.75rem', margin: '4px 0 0' }}>of {players.length} players</p>
          </div>

          {/* refresh */}
          <button
            onClick={() => load(true)}
            style={{
              marginTop: 8, padding: '9px 14px', borderRadius: 10,
              border: '1px solid rgba(255,255,255,.06)',
              background: 'transparent', color: '#5a5a5a',
              fontSize: '.78rem', fontWeight: 600, cursor: 'pointer',
              transition: 'color .2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#efefef'}
            onMouseLeave={e => e.currentTarget.style.color = '#5a5a5a'}
          >
            ↺ Refresh Data
          </button>
        </aside>

        {/* ── Right: search + grid ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* mobile horizontal filters */}
          <div className="vpl-mobile-filters" style={{ display: 'none', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 16, scrollbarWidth: 'none' }}>
            {FILTERS.map(f => (
              <button
                key={f.v}
                onClick={() => setRoleFilter(f.v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
                  padding: '8px 14px', borderRadius: 8,
                  border: roleFilter === f.v ? '1px solid rgba(255,107,34,.45)' : '1px solid rgba(255,255,255,.08)',
                  background: roleFilter === f.v ? 'rgba(255,107,34,.12)' : 'rgba(255,255,255,.03)',
                  color: roleFilter === f.v ? '#ff6b22' : '#7a7a7a',
                  fontFamily: '"DM Sans"', fontWeight: 600, fontSize: '.82rem',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                {f.icon} {f.l}
              </button>
            ))}
          </div>

          {/* search bar */}
          <div style={{ position: 'relative', marginBottom: 28 }}>
            <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#5a5a5a', pointerEvents: 'none' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, reg ID, section…"
              style={{
                width: '100%', padding: '13px 16px 13px 44px', borderRadius: 12,
                background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
                color: '#efefef', fontFamily: '"DM Sans"', fontSize: '.95rem',
                outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(255,107,34,.45)'}
              onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,.08)'}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#5a5a5a', cursor: 'pointer', padding: 4, display: 'flex' }}>
                <XIcon size={16} />
              </button>
            )}
          </div>

          {/* states */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#4a4a4a' }}>
              <div style={{ width: 48, height: 48, border: '3px solid rgba(255,107,34,.2)', borderTopColor: '#ff6b22', borderRadius: '50%', margin: '0 auto 20px', animation: 'vpl-spin 1s linear infinite' }} />
              <p>Loading players…</p>
            </div>
          )}
          {error && !loading && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#e63946' }}>
              <p style={{ fontFamily: '"Syne"', fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>Failed to load players</p>
              <p style={{ color: '#6a6a6a', fontSize: '.85rem' }}>{error}</p>
              <button onClick={() => load(true)} style={{ marginTop: 16, padding: '10px 24px', borderRadius: 10, background: 'rgba(255,107,34,.1)', border: '1px solid rgba(255,107,34,.3)', color: '#ff6b22', cursor: 'pointer', fontWeight: 700 }}>Retry</button>
            </div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#4a4a4a' }}>
              <Users size={48} style={{ opacity: .2, margin: '0 auto 16px' }} />
              <p style={{ fontFamily: '"Syne"', fontWeight: 700, fontSize: '1.1rem' }}>No players match</p>
              <p style={{ color: '#5a5a5a', fontSize: '.85rem' }}>Try a different filter or search term.</p>
            </div>
          )}

          {/* grid */}
          {!loading && !error && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
              {filtered.map((p, idx) => (
                <PlayerCard key={p.id} player={p} onSelect={() => setSpotlight(idx)} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* ── Mobile filter bar (shows below md) ── */}
      <style>{`
        .vpl-sidebar { display: flex !important; }
        .vpl-mobile-filters { display: none !important; }
        @media (max-width: 768px) {
          .vpl-sidebar { display: none !important; }
          .vpl-mobile-filters { display: flex !important; }
          .vpl-mobile-filters::-webkit-scrollbar { display: none; }
        }
        @keyframes vpl-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

/* ─── Player Card ─── */
function PlayerCard({ player: p, onSelect }) {
  const roleColor = ROLE_COLOR[p.role] || '#ff6b22'
  const roleLabel = ROLE_LABEL[p.role] || p.role || 'Player'

  return (
    <div
      onClick={onSelect}
      style={{
        background: '#0f0f11',
        border: `1.5px solid ${roleColor}28`,
        borderRadius: 18,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all .25s ease',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 20px rgba(0,0,0,.4)',
        position: 'relative',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.borderColor = `${roleColor}80`
        e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,.55), 0 0 24px ${roleColor}15`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = `${roleColor}28`
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,.4)'
      }}
    >
      {/* ── BIG IMAGE — fills end to end ── */}
      <div style={{ width: '100%', aspectRatio: '4/5', position: 'relative', background: '#111113', overflow: 'hidden' }}>
        {p.photo_url ? (
          <img
            src={p.photo_url}
            alt={p.name}
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center center',
              display: 'block',
            }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, background: `linear-gradient(135deg, ${roleColor}10 0%, #111113 100%)` }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: `${roleColor}18`, border: `2px solid ${roleColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={32} color={roleColor} style={{ opacity: .5 }} />
            </div>
            <p style={{ color: '#4a4a4a', fontSize: '.75rem', margin: 0 }}>No Photo</p>
          </div>
        )}

        {/* gradient overlay at bottom for text readability */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%', background: 'linear-gradient(to top, rgba(8,8,10,.95) 0%, rgba(8,8,10,.5) 60%, transparent 100%)' }} />

        {/* captain badge */}
        {p.is_captain && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            background: 'rgba(245,158,11,.9)', backdropFilter: 'blur(6px)',
            color: '#000', fontSize: '.6rem', fontWeight: 900,
            letterSpacing: '.1em', textTransform: 'uppercase',
            padding: '4px 8px', borderRadius: 6,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <Star size={10} fill="currentColor" /> Captain
          </div>
        )}

        {/* role pill over image */}
        <div style={{
          position: 'absolute', bottom: 56, left: 12,
          background: roleColor,
          color: '#fff', fontSize: '.62rem', fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '.07em',
          padding: '3px 10px', borderRadius: 5,
          display: 'flex', alignItems: 'center', gap: 4,
          transform: 'skewX(-8deg)',
        }}>
          <span style={{ transform: 'skewX(8deg)', display: 'flex', alignItems: 'center', gap: 4 }}>
            {ROLE_ICON[p.role]}
            {roleLabel}
          </span>
        </div>

        {/* name + reg over image */}
        <div style={{ position: 'absolute', bottom: 10, left: 12, right: 12 }}>
          <p style={{ fontFamily: '"Syne"', fontWeight: 800, color: '#fff', fontSize: '1.05rem', margin: 0, textTransform: 'capitalize', lineHeight: 1.25, textShadow: '0 2px 8px rgba(0,0,0,.8)' }}>
            {p.name}
          </p>
          <p style={{ fontFamily: 'monospace', color: '#ff6b22', fontSize: '.72rem', fontWeight: 700, margin: '3px 0 0', textShadow: '0 1px 4px rgba(0,0,0,.8)' }}>
            {p.registration_id}
          </p>
        </div>
      </div>

      {/* ── Details strip ── */}
      <div style={{ padding: '12px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
        <MiniStat label="YEAR & SECTION" value={`${p.year}yr · ${p.branch?.toUpperCase()}-${p.section?.toUpperCase()}`} />
        <MiniStat label="BATS" value={p.batting_side ? `${p.batting_side} hand` : '—'} />
        <MiniStat label="BOWLS" value={p.bowling_arm ? `${p.bowling_arm} arm` : '—'} />
        <MiniStat label="STYLE" value={p.bowling_type ? p.bowling_type.replace(/_/g,' ') : '—'} />
      </div>
    </div>
  )
}

function MiniStat({ label, value }) {
  return (
    <div>
      <p style={{ color: '#3a3a3a', fontSize: '.57rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.09em', margin: '0 0 2px' }}>{label}</p>
      <p style={{ color: '#b0b0b0', fontSize: '.78rem', fontWeight: 600, margin: 0, textTransform: 'capitalize' }}>{value || '—'}</p>
    </div>
  )
}

/* ─── Full-screen Spotlight ─── */
function PlayerSpotlight({ players, index, onNavigate, onClose }) {
  const p = players[index]
  const roleColor = ROLE_COLOR[p?.role] || '#ff6b22'
  const hasPrev   = index > 0
  const hasNext   = index < players.length - 1

  useEffect(() => {
    const fn = e => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' && hasNext) onNavigate(index + 1)
      if (e.key === 'ArrowLeft'  && hasPrev) onNavigate(index - 1)
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose, onNavigate, index, hasPrev, hasNext])

  if (!p) return null

  const navBtnStyle = (enabled) => ({
    width: 48, height: 48, borderRadius: '50%',
    background: enabled ? 'rgba(255,255,255,.08)' : 'transparent',
    border: '1px solid rgba(255,255,255,.07)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: enabled ? 'pointer' : 'not-allowed',
    color: enabled ? '#fff' : '#333',
    transition: 'all .2s',
    position: 'absolute', top: '50%', transform: 'translateY(-50%)', zIndex: 10,
    flexShrink: 0,
  })

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 700, background: 'rgba(0,0,0,.88)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      {/* Nav buttons */}
      <button onClick={e => { e.stopPropagation(); hasPrev && onNavigate(index - 1) }} style={{ ...navBtnStyle(hasPrev), left: 20 }}>
        <ChevronLeft size={26} />
      </button>
      <button onClick={e => { e.stopPropagation(); hasNext && onNavigate(index + 1) }} style={{ ...navBtnStyle(hasNext), right: 20 }}>
        <ChevronRight size={26} />
      </button>

      {/* Card */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0f0f11',
          border: `2px solid ${roleColor}55`,
          borderRadius: 24,
          width: '100%',
          maxWidth: 420,
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: `0 32px 64px rgba(0,0,0,.8), 0 0 40px ${roleColor}18`,
          position: 'relative',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 14, right: 14, zIndex: 20, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}
        >
          <XIcon size={18} />
        </button>

        {/* Big photo */}
        <div style={{ width: '100%', aspectRatio: '4/5', position: 'relative', background: '#111113', overflow: 'hidden', flexShrink: 0, maxHeight: '55vh' }}>
          {p.photo_url ? (
            <img
              src={p.photo_url}
              alt={p.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center', display: 'block' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${roleColor}12 0%, #111113 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={64} color={roleColor} style={{ opacity: .3 }} />
            </div>
          )}
          {/* gradient */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(to top, rgba(15,15,17,.98) 0%, rgba(15,15,17,.6) 50%, transparent 100%)' }} />

          {/* Captain badge */}
          {p.is_captain && (
            <div style={{ position: 'absolute', top: 14, left: 14, background: 'rgba(245,158,11,.9)', color: '#000', fontSize: '.65rem', fontWeight: 900, letterSpacing: '.1em', padding: '5px 10px', borderRadius: 7, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Star size={11} fill="currentColor" /> Captain
            </div>
          )}

          {/* Name / role over image */}
          <div style={{ position: 'absolute', bottom: 14, left: 18, right: 18 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: roleColor, color: '#fff', fontSize: '.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.07em', padding: '4px 10px', borderRadius: 6, marginBottom: 8 }}>
              {ROLE_ICON[p.role]} {ROLE_LABEL[p.role] || p.role}
            </div>
            <h2 style={{ fontFamily: '"Syne"', fontWeight: 900, color: '#fff', fontSize: '1.55rem', margin: 0, textTransform: 'capitalize', lineHeight: 1.2, textShadow: '0 2px 10px rgba(0,0,0,.9)' }}>
              {p.name}
            </h2>
            <p style={{ fontFamily: 'monospace', color: '#ff6b22', fontSize: '.8rem', fontWeight: 700, margin: '5px 0 0', textShadow: '0 1px 4px rgba(0,0,0,.9)' }}>
              {p.registration_id}
            </p>
          </div>
        </div>

        {/* Details below image */}
        <div style={{ padding: '18px 20px 22px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SpotDetail label="Academic" value={`Year ${p.year} · ${p.branch?.toUpperCase()} · Section ${p.section?.toUpperCase()}`} color={roleColor} />
          {p.phone && <SpotDetail label="Phone" value={p.phone} />}
          {p.batting_side && <SpotDetail label="Batting" value={`${p.batting_side}-handed`} />}
          {(p.bowling_arm || p.bowling_type) && (
            <SpotDetail label="Bowling" value={[p.bowling_arm && `${p.bowling_arm} arm`, p.bowling_type && p.bowling_type.replace(/_/g,' ')].filter(Boolean).join(' · ')} />
          )}
          {/* navigation hint */}
          <p style={{ color: '#3a3a3a', fontSize: '.72rem', textAlign: 'center', marginTop: 6 }}>
            Use ← → arrow keys to browse • ESC to close
          </p>
        </div>
      </div>
    </div>
  )
}

function SpotDetail({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,.03)', borderRadius: 10, padding: '11px 16px', border: '1px solid rgba(255,255,255,.04)' }}>
      <p style={{ color: '#4a4a4a', fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', margin: 0 }}>{label}</p>
      <p style={{ color: color || '#d0d0d0', fontSize: '.88rem', fontWeight: 600, margin: 0, textTransform: 'capitalize', textAlign: 'right', maxWidth: '65%' }}>{value}</p>
    </div>
  )
}
