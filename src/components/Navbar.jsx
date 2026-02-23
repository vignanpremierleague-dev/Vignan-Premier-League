import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Flame, Menu, X } from 'lucide-react'

const links = [
  { label:'Home',     href:'#home' },
  { label:'About',    href:'#about' },
  { label:'Rules',    href:'#rules' },
  { label:'Schedule', href:'#schedule' },
  { label:'Prizes',   href:'#prizes' },
  { label:'Contact',  href:'#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const navRef = useRef(null)

  useEffect(() => {
    // Entrance animation
    gsap.fromTo(navRef.current,
      { opacity: 0, y: -30 },
      { opacity: 1, y: 0, duration: .8, delay: 1.6, ease: 'power3.out' }
    )

    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <header
      ref={navRef}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        opacity: 0, // GSAP will reveal
        transition: 'background .35s ease, border-color .35s ease',
      }}
      className={scrolled ? 'nav-glass' : ''}
    >
      <div className="wrap" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height: 64 }}>
        {/* Logo */}
        <a href="#home" style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none' }}>
          <Flame style={{ width:18, height:18, color:'#ff6b22', animation:'flicker 1s ease-in-out infinite' }} />
          <span className="fire-text" style={{ fontSize:'1.15rem', fontWeight:800 }}>VPL</span>
        </a>

        {/* Desktop links */}
        <nav style={{ display:'flex', alignItems:'center', gap:32 }} className="hidden md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} style={{
              fontFamily:'"DM Sans",system-ui,sans-serif',
              color:'#5a5a7a', fontSize:'.8rem',
              fontWeight:500, textDecoration:'none',
              textTransform:'uppercase', letterSpacing:'.1em',
              transition:'color .25s',
            }}
            onMouseEnter={e=>e.target.style.color='#f0eff5'}
            onMouseLeave={e=>e.target.style.color='#5a5a7a'}
            >{l.label}</a>
          ))}
        </nav>

        {/* CTA */}
        <a href="#register" className="btn-primary" style={{ display:'none', fontSize:'.78rem', padding:'10px 22px' }} id="nav-cta">
          Register
        </a>

        {/* Mobile toggle */}
        <button
          className="md:hidden" onClick={()=>setOpen(!open)}
          style={{ color:'#ff6b22', background:'none', border:'none', cursor:'pointer', padding:4 }}
        >
          {open ? <X size={22}/> : <Menu size={22}/>}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="nav-glass" style={{ margin:'0 16px 8px', borderRadius:16, padding:'16px 20px', display:'flex', flexDirection:'column', gap:14 }}>
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={()=>setOpen(false)}
              style={{ color:'#7a7a9a', fontSize:'.9rem', textDecoration:'none', fontWeight:500 }}
            >{l.label}</a>
          ))}
          <a href="#register" className="btn-primary" style={{ textAlign:'center', marginTop:4 }}>Register Now</a>
        </div>
      )}

      {/* Show desktop CTA after mount */}
      <style>{`@media(min-width:768px){#nav-cta{display:inline-flex !important;}}`}</style>
    </header>
  )
}
