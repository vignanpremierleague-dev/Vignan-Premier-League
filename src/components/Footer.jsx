import { Flame, Instagram, Phone, Mail, ArrowUp } from 'lucide-react'

const quickLinks = [
  ['Home','#home'], ['About','#about'], ['Rules','#rules'],
  ['Schedule','#schedule'], ['Prizes','#prizes'], ['Register','#register'], ['Contact','#contact'],
]
const socials = [
  { icon:<Instagram size={15}/>, href:'https://instagram.com/vignanpremierleague', label:'Instagram' },
  { icon:<Phone     size={15}/>, href:'https://wa.me/91XXXXXXXXXX',               label:'WhatsApp' },
  { icon:<Mail      size={15}/>, href:'mailto:vpl@vignan.ac.in',                  label:'Email' },
]

export default function Footer() {
  return (
    <footer style={{ background:'#06060a', borderTop:'1px solid rgba(255,255,255,.04)' }}>
      <div className="wrap" style={{ padding:'60px 0 36px' }}>
        {/* 3-column grid */}
        <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr 1fr', gap:48, marginBottom:48 }}>
          {/* Brand */}
          <div>
            <a href="#home" style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none', marginBottom:16 }}>
              <Flame style={{ width:18, height:18, color:'#ff6b22', animation:'flicker 1s ease-in-out infinite' }} />
              <span className="fire-text" style={{ fontFamily:'"Syne"', fontSize:'1.1rem', fontWeight:800 }}>VPL</span>
            </a>
            <p style={{ fontFamily:'"DM Sans"', color:'#2a2a4a', fontSize:'.82rem', lineHeight:1.8, maxWidth:240 }}>
              Where Campus Meets Cricket. The ultimate inter-college T10 tournament with IPL-style player auctions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontFamily:'"Syne"', color:'#c4c3da', fontSize:'.75rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.14em', marginBottom:18 }}>Navigation</h4>
            <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:11 }}>
              {quickLinks.map(([label, href]) => (
                <li key={href}>
                  <a href={href} style={{ fontFamily:'"DM Sans"', color:'#3a3a5a', fontSize:'.85rem', textDecoration:'none', transition:'color .25s' }}
                    onMouseEnter={e=>e.target.style.color='#ff6b22'}
                    onMouseLeave={e=>e.target.style.color='#3a3a5a'}
                  >{label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Follow */}
          <div>
            <h4 style={{ fontFamily:'"Syne"', color:'#c4c3da', fontSize:'.75rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.14em', marginBottom:18 }}>Follow Us</h4>
            <div style={{ display:'flex', gap:10, marginBottom:16 }}>
              {socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  style={{ width:36, height:36, borderRadius:10, background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.06)', display:'flex', alignItems:'center', justifyContent:'center', color:'#3a3a5a', textDecoration:'none', transition:'all .25s' }}
                  onMouseEnter={e=>{ e.currentTarget.style.color='#ff6b22'; e.currentTarget.style.borderColor='rgba(255,107,34,.3)'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.color='#3a3a5a'; e.currentTarget.style.borderColor='rgba(255,255,255,.06)'; }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
            <p style={{ fontFamily:'"DM Sans"', color:'#2a2a4a', fontSize:'.78rem', lineHeight:1.7 }}>
              Stay updated with VPL news, match schedules, and auction highlights.
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ borderTop:'1px solid rgba(255,255,255,.04)', paddingTop:24, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <p style={{ fontFamily:'"DM Sans"', color:'#1e1e38', fontSize:'.78rem' }}>&copy; 2025 Vignan Premier League &mdash; All Rights Reserved.</p>
          <button
            onClick={() => window.scrollTo({ top:0, behavior:'smooth' })}
            aria-label="Back to top"
            style={{ width:32, height:32, borderRadius:8, background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.06)', display:'flex', alignItems:'center', justifyContent:'center', color:'#3a3a5a', cursor:'pointer', transition:'all .25s' }}
            onMouseEnter={e=>{ e.currentTarget.style.color='#ff6b22'; e.currentTarget.style.borderColor='rgba(255,107,34,.3)'; }}
            onMouseLeave={e=>{ e.currentTarget.style.color='#3a3a5a'; e.currentTarget.style.borderColor='rgba(255,255,255,.06)'; }}
          >
            <ArrowUp size={14}/>
          </button>
        </div>
      </div>
    </footer>
  )
}
