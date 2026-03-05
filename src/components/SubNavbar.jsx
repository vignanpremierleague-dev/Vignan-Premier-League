import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Flame, X, ChevronRight } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Home',        href: '/',         route: true },
  { label: 'Dignitaries', href: '/team',     route: true },
  { label: 'Rules',       href: '/rules',    route: true },
  { label: 'Register',    href: '/register', route: true },
  { label: 'Contact',     href: '/contact',  route: true },
]

export default function SubNavbar({ breadcrumb, pill }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const close = () => setOpen(false)

  const handleLink = (link) => {
    close()
    navigate(link.href)
  }

  const isActive = (href) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: 'rgba(7,7,7,.92)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,.07)',
        padding: '0 20px',
      }}>
        <div className="subnav-bar" style={{ maxWidth: 1100, margin: '0 auto', height: 60 }}>

          {/* ── Left: logo + breadcrumb ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none' }}>
              <Flame size={17} color="#ff6b22" />
              <span style={{ fontFamily: '"Syne",system-ui,sans-serif', fontWeight: 800, color: '#ff6b22', fontSize: '1rem' }}>VPL</span>
            </Link>
            {breadcrumb && (
              <>
                <span style={{ color: '#2a2a2a' }}>·</span>
                <ChevronRight size={12} color="#3a3a3a" />
                <span style={{ fontFamily: '"DM Sans",system-ui,sans-serif', fontSize: '.76rem', fontWeight: 600, color: '#bbb' }}>
                  {breadcrumb}
                </span>
              </>
            )}
          </div>

          {/* ── Center: nav links (desktop only) ── */}
          <nav className="subnav-center">
            {NAV_LINKS.filter(l => l.label !== 'Register').map(l => {
              const active = isActive(l.href)
              return (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={e => { e.preventDefault(); navigate(l.href) }}
                  style={{
                    fontFamily: '"DM Sans"',
                    fontSize: '.73rem',
                    fontWeight: active ? 700 : 500,
                    textDecoration: 'none',
                    textTransform: 'uppercase',
                    letterSpacing: '.1em',
                    cursor: 'pointer',
                    padding: '5px 12px',
                    borderRadius: 8,
                    transition: 'color .2s, background .2s',
                    color: active ? '#f0eff5' : '#6a6a6a',
                    background: active ? 'rgba(255,107,34,.1)' : 'transparent',
                    borderBottom: active ? '2px solid #ff6b22' : '2px solid transparent',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      e.currentTarget.style.color = '#d0cfcf'
                      e.currentTarget.style.background = 'rgba(255,255,255,.04)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      e.currentTarget.style.color = '#6a6a6a'
                      e.currentTarget.style.background = 'transparent'
                    }
                  }}
                >{l.label}</a>
              )
            })}
          </nav>

          {/* ── Right: Register CTA + hamburger ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {pill && (
              <div className="subnav-center" style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '5px 11px', borderRadius: 10,
                background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
              }}>
                {pill.icon}
                <span style={{ fontFamily: '"DM Sans"', fontSize: '.7rem', fontWeight: 700, color: '#d9d9d9', letterSpacing: '.03em' }}>{pill.label}</span>
              </div>
            )}
            <a
              href="/register"
              onClick={e => { e.preventDefault(); navigate('/register') }}
              className="subnav-center"
              style={{
                fontFamily: '"DM Sans"', fontSize: '.73rem', fontWeight: 700,
                color: '#ff6b22', border: '1px solid rgba(255,107,34,.4)',
                borderRadius: 8, padding: '7px 16px', textDecoration: 'none',
                background: 'rgba(255,107,34,.07)', cursor: 'pointer', letterSpacing: '.04em',
                transition: 'background .2s, border-color .2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,107,34,.18)'; e.currentTarget.style.borderColor = 'rgba(255,107,34,.7)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,107,34,.07)'; e.currentTarget.style.borderColor = 'rgba(255,107,34,.4)' }}
            >Register</a>

            {/* Hamburger */}
            <button
              className="subnav-hamburger"
              onClick={() => setOpen(o => !o)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'none', flexDirection: 'column', gap: 5, alignItems: 'center', justifyContent: 'center' }}
            >
              <span className={`ham-bar ham-top ${open ? 'open' : ''}`} />
              <span className={`ham-bar ham-mid ${open ? 'open' : ''}`} />
              <span className={`ham-bar ham-bot ${open ? 'open' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div className={`nav-drawer ${open ? 'nav-drawer-open' : ''}`} aria-hidden={!open}>
        <div className="nav-backdrop" onClick={close} />
        <div className="nav-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
            <Link to="/" onClick={close} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <Flame size={18} color="#ff6b22" />
              <span style={{ fontFamily: '"Syne"', fontWeight: 800, color: '#ff6b22', fontSize: '1.1rem' }}>VPL</span>
            </Link>
            <button onClick={close} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a8a8a', padding: 4 }}>
              <X size={22} />
            </button>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {NAV_LINKS.map((l, i) => {
              const active = isActive(l.href)
              return (
                <button
                  key={l.label}
                  onClick={() => handleLink(l)}
                  className="mob-nav-link"
                  style={{
                    animationDelay: open ? `${i * 0.06}s` : '0s',
                    background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer',
                    color: active ? '#ff6b22' : undefined,
                  }}
                >
                  {l.label}
                  {active && <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: '#ff6b22', marginLeft: 10, verticalAlign: 'middle' }} />}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      <style>{`
        /* ── Navbar bar — desktop: 3-col grid, mobile: flex space-between ── */
        .subnav-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        /* Center nav cluster, shown only on desktop via grid-area trick */
        .subnav-center {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .subnav-hamburger { display: none !important; }

        @media (min-width: 721px) {
          /* On desktop: 3-column grid so center nav is truly centered */
          .subnav-bar {
            display: grid;
            grid-template-columns: 1fr auto 1fr;
          }
          /* right column: push to end */
          .subnav-bar > div:last-child {
            justify-content: flex-end;
          }
        }

        @media (max-width: 720px) {
          /* On mobile: just logo left, hamburger right — nothing in center */
          .subnav-center { display: none !important; }
          .subnav-hamburger { display: flex !important; }
        }

        .ham-bar { display:block; width:22px; height:2px; background:#f0eff5; border-radius:2px; transition:transform .3s ease, opacity .3s ease; transform-origin:center; }
        .ham-top.open  { transform:translateY(7px) rotate(45deg); }
        .ham-mid.open  { opacity:0; transform:scaleX(0); }
        .ham-bot.open  { transform:translateY(-7px) rotate(-45deg); }
        .nav-drawer { position:fixed; inset:0; z-index:300; pointer-events:none; visibility:hidden; }
        .nav-drawer-open { pointer-events:all; visibility:visible; }
        .nav-backdrop { position:absolute; inset:0; background:rgba(6,6,10,.75); backdrop-filter:blur(4px); opacity:0; transition:opacity .35s ease; }
        .nav-drawer-open .nav-backdrop { opacity:1; }
        .nav-panel { position:absolute; top:0; right:0; bottom:0; width:min(300px,82vw); background:rgba(16,16,16,.98); border-left:1px solid rgba(255,255,255,.08); padding:24px 28px; display:flex; flex-direction:column; transform:translateX(100%); transition:transform .38s cubic-bezier(.16,1,.3,1); }
        .nav-drawer-open .nav-panel { transform:translateX(0); }
        .mob-nav-link { font-family:"Syne",system-ui,sans-serif; font-size:1.4rem; font-weight:700; color:#8a8a8a; padding:12px 0; border-bottom:1px solid rgba(255,255,255,.04); transition:color .2s, padding-left .2s; width:100%; animation:mobLinkIn .4s cubic-bezier(.16,1,.3,1) both; background:none; border-left:none; border-right:none; border-top:none; text-align:left; cursor:pointer; }
        .mob-nav-link:hover { color:#f0eff5; padding-left:8px; }
        @keyframes mobLinkIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
      `}</style>
    </>
  )
}
