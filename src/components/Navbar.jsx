import { useState, useEffect, useRef } from 'react'
import { Flame, X, ChevronRight } from 'lucide-react'
import { fetchSiteSettings } from '../lib/adminApi'

const links = [
  { label: 'Home',        href: '/',         route: true  },
  { label: 'Teams',       href: '/teams',    route: true  },
  { label: 'Dignitaries', href: '/team',     route: true  },
  { label: 'Rules',       href: '/rules',    route: true  },
  { label: 'Schedule',    href: '/schedule', route: true  },
  { label: 'Contact',     href: '/contact',  route: true  },
]

export default function Navbar({ breadcrumb } = {}) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen]         = useState(false)
  const [pathname] = useState(typeof window !== 'undefined' ? window.location.pathname : '/')
  const [settings, setSettings] = useState(null)
  const navRef = useRef(null)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    fetchSiteSettings().then(setSettings).catch(console.error)
  }, [])

  // prevent body scroll when menu is open on mobile
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const close = () => setOpen(false)

  return (
    <>
      <header
        ref={navRef}
        className={scrolled ? 'nav-glass' : ''}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
          transition: 'background .35s ease, border-color .35s ease',
        }}
      >
        <div className="wrap" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height: 60 }}>

          {/* Logo + optional breadcrumb */}
          <div style={{ display:'flex', alignItems:'center', gap:10, zIndex:201 }}>
            <a href="/" onClick={e => { e.preventDefault(); window.location.href='/' }} style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none' }}>
              <Flame style={{ width:18, height:18, color:'#ff6b22', animation:'flicker 1s ease-in-out infinite' }} />
              <span className="fire-text" style={{ fontSize:'1.1rem', fontWeight:800 }}>VPL</span>
            </a>
            {breadcrumb && (
              <>
                <ChevronRight size={13} color="#aaa" />
                <span style={{ fontFamily:'"DM Sans",system-ui,sans-serif', fontSize:'.76rem', fontWeight:600, color:'#bbb' }}>{breadcrumb}</span>
              </>
            )}
          </div>

          {/* Desktop links */}
          <nav className="nav-desktop">
            {links.map(l => {
              const active = l.route && pathname === l.href
              return (
                <a
                  key={l.href}
                  href={l.href}
                  className={`nav-link ${active ? 'active' : ''}`}
                  onClick={l.route ? e => { e.preventDefault(); window.location.href = l.href } : undefined}
                >{l.label}</a>
              )
            })}
          </nav>

          {/* Desktop CTA */}
          {settings?.registrationsOpen === false ? (
            <button className="btn-primary nav-cta" style={{ fontSize:'.76rem', padding:'9px 20px', opacity: 0.5, cursor: 'not-allowed', background: '#333', borderColor: '#444', color: '#7a7a7a', boxShadow: 'none' }} disabled>
              Closed
            </button>
          ) : (
            <a href="/register" className="btn-primary nav-cta" style={{ fontSize:'.76rem', padding:'9px 20px' }}
              onClick={e => { e.preventDefault(); window.location.href='/register' }}>
              Register
            </a>
          )}

          {/* Hamburger button — mobile/tablet only */}
          <button
            className="nav-hamburger"
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <span className={`ham-bar ham-top ${open ? 'open' : ''}`} />
            <span className={`ham-bar ham-mid ${open ? 'open' : ''}`} />
            <span className={`ham-bar ham-bot ${open ? 'open' : ''}`} />
          </button>
        </div>
      </header>

      {/* Spacer for sub-pages so content isn't hidden under the fixed navbar */}
      {breadcrumb && <div style={{ height: 60 }} />}

      {/* Mobile / Tablet full-screen drawer */}
      <div className={`nav-drawer ${open ? 'nav-drawer-open' : ''}`} aria-hidden={!open}>
        {/* Backdrop */}
        <div className="nav-backdrop" onClick={close} />

        {/* Panel */}
        <div className="nav-panel">
          {/* Top row inside panel */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 40 }}>
            <a href="#home" onClick={close} style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none' }}>
              <Flame style={{ width:18, height:18, color:'#ff6b22' }} />
              <span className="fire-text" style={{ fontSize:'1.1rem', fontWeight:800 }}>VPL</span>
            </a>
            <button onClick={close} style={{ background:'none', border:'none', cursor:'pointer', color:'#8a8a8a', padding:4 }}>
              <X size={22} />
            </button>
          </div>

          {/* Nav links */}
          <nav style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {links.map((l, i) => (
              <a
                key={l.href} href={l.href} onClick={close}
                className="mob-nav-link"
                style={{ animationDelay: open ? `${i * 0.06}s` : '0s' }}
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div style={{ marginTop:'auto', paddingTop: 32 }}>
            {settings?.registrationsOpen === false ? (
              <button className="btn-primary" style={{ width:'100%', justifyContent:'center', fontSize:'.9rem', padding:'14px 20px', opacity: 0.5, cursor: 'not-allowed', background: '#333', borderColor: '#444', color: '#7a7a7a', boxShadow: 'none' }} disabled>
                Registrations Closed
              </button>
            ) : (
              <a href="/register" onClick={e => { close(); e.preventDefault(); window.location.href='/register' }} className="btn-primary" style={{ width:'100%', justifyContent:'center', fontSize:'.9rem', padding:'14px 20px' }}>
                <Flame size={16} /> Register Now
              </a>
            )}
          </div>
        </div>
      </div>

      <style>{`
        /* ── Desktop nav ── */
        .nav-desktop {
          position: absolute; left: 50%; transform: translateX(-50%);
          display:flex; align-items:center; gap:28px;
        }
        .nav-link {
          font-family:"DM Sans",system-ui,sans-serif;
          color:#8e8e8e; font-size:.78rem; font-weight:500;
          text-decoration:none; text-transform:uppercase; letter-spacing:.1em;
          transition:color .2s;
          position: relative;
          padding: 6px 0;
        }
        .nav-link:hover { color:#f0eff5; }
        .nav-link.active { color:#ff6b22; }
        .nav-link::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0;
          height: 2px; background: #ff6b22;
          transform: scaleX(0); transition: transform .2s ease-out;
          transform-origin: left;
        }
        .nav-link.active::after { transform: scaleX(1); }
        .nav-link:hover::after { transform: scaleX(1); }
        .nav-cta { display:inline-flex; position: relative; z-index: 201; }
        .nav-hamburger { display:none; }

        /* ── Hamburger bars ── */
        .ham-bar {
          display:block; width:22px; height:2px;
          background:#f0eff5; border-radius:2px;
          transition: transform .35s cubic-bezier(0.4, 0, 0.2, 1), opacity .35s ease;
          transform-origin:center;
        }
        .ham-top.open  { transform:translateY(7px) rotate(45deg); }
        .ham-mid.open  { opacity:0; transform:scaleX(0); }
        .ham-bot.open  { transform:translateY(-7px) rotate(-45deg); }

        /* ── Mobile drawer ── */
        .nav-drawer {
          position:fixed; inset:0; z-index:300;
          pointer-events:none; visibility:hidden;
        }
        .nav-drawer-open {
          pointer-events:all; visibility:visible;
        }
        .nav-backdrop {
          position:absolute; inset:0;
          background:rgba(6,6,10,.7);
          backdrop-filter:blur(4px);
          opacity:0; transition:opacity .35s ease;
        }
        .nav-drawer-open .nav-backdrop { opacity:1; }

        .nav-panel {
          position:absolute; top:0; right:0; bottom:0;
          width:min(260px, 75vw);
          max-width:100vw;
          box-sizing:border-box;
          background:rgba(16,16,16,.98);
          border-left:1px solid rgba(255,255,255,.08);
          padding:24px 28px;
          display:flex; flex-direction:column;
          transform:translateX(100%);
          transition:transform .38s cubic-bezier(.16,1,.3,1);
        }
        .nav-drawer-open .nav-panel { transform:translateX(0); }

        /* Mobile nav links */
        .mob-nav-link {
          font-family:"Syne",system-ui,sans-serif;
          font-size:1.4rem; font-weight:700;
          color:#8a8a8a; text-decoration:none;
          padding:12px 0;
          border-bottom:1px solid rgba(255,255,255,.04);
          transition:color .2s, padding-left .2s;
          animation:mobLinkIn .4s cubic-bezier(.16,1,.3,1) both;
        }
        .mob-nav-link:hover { color:#f0eff5; padding-left:8px; }
        @keyframes mobLinkIn {
          from { opacity:0; transform:translateX(20px); }
          to   { opacity:1; transform:translateX(0); }
        }

        /* ── Tablet/Mobile breakpoint ── */
        @media(max-width:840px) {
          .nav-desktop { display:none; }
          .nav-cta     { display:none; }
          .nav-hamburger {
            display:flex; flex-direction:column; gap:5px;
            background:none; border:none; cursor:pointer; padding:6px;
            align-items:center; justify-content:center;
          }
        }
        @media(max-width:420px) {
          .nav-panel { width:74vw; padding:20px 18px; }
          .mob-nav-link { font-size:1.22rem; }
        }
      `}</style>
    </>
  )
}
