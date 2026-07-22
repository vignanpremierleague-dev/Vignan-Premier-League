import { Flame, Phone, Mail, ArrowUp } from 'lucide-react'

const quickLinks = [
  ['Home','/'], ['About','/#about'], ['Rules','/rules'],
  ['Schedule','/schedule'], ['Prizes','/#prizes'], ['Register','/register'], ['Contact','/contact'],
]
const socials = [
  { icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>, href:'https://instagram.com/vignanpremierleague', label:'Instagram' },
  { icon:<Phone     size={15}/>, href:'https://chat.whatsapp.com/L7HXdLMblNRGTNwJbMZPVE?mode=gi_t',               label:'WhatsApp' },
  { icon:<Mail      size={15}/>, href:'mailto:vpl@vignan.ac.in',                  label:'Email' },
]

export default function Footer() {
  const handleLinkClick = (e, href) => {
    const targetPath = href.split('#')[0] || '/';
    const targetHash = href.split('#')[1];

    if (window.location.pathname === targetPath) {
      if (targetHash) {
        e.preventDefault();
        const el = document.getElementById(targetHash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.location.hash = targetHash;
        }
      } else {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      e.preventDefault();
      window.location.href = href;
    }
  };

  return (
    <footer style={{ background:'#06060a', borderTop:'1px solid rgba(255,255,255,.07)' }}>
      <div className="wrap footer-inner">
        {/* 3-column grid */}
        <div className="footer-grid">
          {/* Brand */}
          <div>
            <a 
              href="/" 
              onClick={(e) => handleLinkClick(e, '/')}
              style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none', marginBottom:14 }}
            >
              <Flame style={{ width:18, height:18, color:'#ff6b22', animation:'flicker 1s ease-in-out infinite' }} />
              <span className="fire-text" style={{ fontFamily:'"Syne"', fontSize:'1.1rem', fontWeight:800 }}>VPL</span>
            </a>
            <p style={{ fontFamily:'"DM Sans"', color:'#8b8b8b', fontSize:'.84rem', lineHeight:1.85, maxWidth:240 }}>
              Where Campus Meets Cricket. The ultimate inter-college 8 Over tournament with IPL-style player auctions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontFamily:'"Syne"', color:'#b0b0b0', fontSize:'.73rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.14em', marginBottom:18 }}>Navigation</h4>
            <ul className="footer-nav-list">
              {quickLinks.map(([label, href]) => (
                <li key={href}>
                  <a 
                    href={href} 
                    className="footer-link"
                    onClick={(e) => handleLinkClick(e, href)}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Follow */}
          <div>
            <h4 style={{ fontFamily:'"Syne"', color:'#b0b0b0', fontSize:'.73rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.14em', marginBottom:18 }}>Follow Us</h4>
            <div style={{ display:'flex', gap:10, marginBottom:16 }}>
              {socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  className="social-btn">
                  {s.icon}
                </a>
              ))}
            </div>
            <p style={{ fontFamily:'"DM Sans"', color:'#8b8b8b', fontSize:'.8rem', lineHeight:1.75 }}>
              Stay updated with VPL news, match schedules, and auction highlights.
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ borderTop:'1px solid rgba(255,255,255,.06)', paddingTop:22, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            <p style={{ fontFamily:'"DM Sans"', color:'#9a9a9a', fontSize:'.95rem', margin:0 }}>
              &copy; 2025 Vignan Premier League &mdash; All Rights Reserved.
            </p>
            <p style={{ fontFamily:'"DM Sans"', color:'#8a8a8a', fontSize:'.95rem', margin:0 }}>
              Developed by{' '}
              <a 
                href="https://www.charanmunur.in/" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ color:'#ff6b22', textDecoration:'none', fontWeight: 600, transition:'color .2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = '#ff6b22'}
              >
                charanmunur
              </a>
            </p>
          </div>
          <button
            onClick={() => window.scrollTo({ top:0, behavior:'smooth' })}
            aria-label="Back to top"
            className="scroll-top-btn"
          >
            <ArrowUp size={14}/>
          </button>
        </div>
      </div>

      <style>{`
        .footer-inner { padding:56px 0 32px; }
        .footer-grid  { display:grid; grid-template-columns:1.5fr 1fr 1fr; gap:48px; margin-bottom:44px; }
        .footer-nav-list {
          list-style:none;
          margin:0;
          padding:0;
          display:grid;
          grid-template-columns:repeat(2, minmax(0, max-content));
          column-gap:26px;
          row-gap:10px;
          align-content:start;
        }
        .footer-nav-list li { min-width:0; }
        .footer-link  {
          font-family:"DM Sans",system-ui,sans-serif;
          color:#9a9a9a; font-size:.86rem;
          text-decoration:none; transition:color .2s;
          display:inline-block;
          line-height:1.2;
        }
        .footer-link:hover { color:#ff6b22; }
        .social-btn {
          width:36px; height:36px; border-radius:10px;
          background:rgba(255,255,255,.05);
          border:1px solid rgba(255,255,255,.1);
          display:flex; align-items:center; justify-content:center;
          color:#9a9a9a; text-decoration:none; transition:all .25s;
        }
        .social-btn:hover { color:#ff6b22; border-color:rgba(255,107,34,.35); background:rgba(255,107,34,.06); }
        .scroll-top-btn {
          width:32px; height:32px; border-radius:8px;
          background:rgba(255,255,255,.04);
          border:1px solid rgba(255,255,255,.08);
          display:flex; align-items:center; justify-content:center;
          color:#9a9a9a; cursor:pointer; transition:all .25s;
        }
        .scroll-top-btn:hover { color:#ff6b22; border-color:rgba(255,107,34,.3); }

        @media(max-width:760px) {
          .footer-grid { grid-template-columns:1fr 1fr; gap:32px; }
          .footer-nav-list { grid-template-columns:1fr; row-gap:8px; }
        }
        @media(max-width:480px) {
          .footer-grid { grid-template-columns:1fr; gap:28px; }
          .footer-inner { padding:40px 0 24px; }
        }
      `}</style>
    </footer>
  )
}
