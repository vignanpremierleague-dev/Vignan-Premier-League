import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Mail, MapPin, Clock } from 'lucide-react'

/* ── Brand SVGs ───────────────────────────────────────────────────────────── */
const WhatsAppSVG = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654A11.882 11.882 0 0012.05 24h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="currentColor"/>
  </svg>
)

const InstagramSVG = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919C8.333 2.175 8.741 2.163 12 2.163zm0-2.163C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" fill="currentColor"/>
  </svg>
)

/* ── Data ─────────────────────────────────────────────────────────────────── */
const channels = [
  {
    id: 'whatsapp',
    Icon: WhatsAppSVG,
    label: 'WhatsApp',
    handle: '+91 863 942 6318',
    cta: 'Join our group',
    href: 'https://chat.whatsapp.com/L7HXdLMblNRGTNwJbMZPVE?mode=gi_t',
    glow: 'rgba(37,211,102,.25)',
    gradFrom: 'rgba(37,211,102,.12)',
    gradTo:   'rgba(37,211,102,.02)',
    iconColor: '#25D366',
  },
  {
    id: 'instagram',
    Icon: InstagramSVG,
    label: 'Instagram',
    handle: '@vignanpremierleague',
    cta: 'Follow for updates',
    href: 'https://instagram.com/vignanpremierleague',
    glow: 'rgba(225,48,108,.25)',
    gradFrom: 'rgba(225,48,108,.12)',
    gradTo:   'rgba(225,48,108,.02)',
    iconColor: '#E1306C',
  },
  {
    id: 'email',
    Icon: () => <Mail size={26} strokeWidth={1.5} color="currentColor" />,
    label: 'Email',
    handle: 'vignanpremierleague@gmail.com',
    cta: 'Send a message',
    href: 'mailto:vignanpremierleague@gmail.com',
    glow: 'rgba(255,107,34,.28)',
    gradFrom: 'rgba(255,107,34,.12)',
    gradTo:   'rgba(255,107,34,.02)',
    iconColor: '#ff6b22',
  },
  {
    id: 'location',
    Icon: () => <MapPin size={26} strokeWidth={1.5} color="currentColor" />,
    label: 'Location',
    handle: 'Vignan University',
    cta: 'View on Google Maps',
    href: 'https://www.google.com/maps/place/Vignan+University/@17.3425484,78.6787552,14z',
    glow: 'rgba(96,165,250,.22)',
    gradFrom: 'rgba(96,165,250,.1)',
    gradTo:   'rgba(96,165,250,.02)',
    iconColor: '#60a5fa',
  },
]

const info = [
  { Icon: MapPin, label: 'Venue', value: 'Vignan University Cricket Ground, Vadlamudi, Guntur, Andhra Pradesh — 522213' },
  { Icon: Clock,  label: 'Event Dates', value: 'March 2025 — Schedule announced upon registration close' },
  { Icon: Mail,   label: 'Registrations', value: 'Open until seats are filled. Complete your entry via the Register page.' },
]

/* ── Channel Card ─────────────────────────────────────────────────────────── */
function ChannelCard({ ch }) {
  return (
    <a
      href={ch.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`ch-card ch-card-${ch.id}`}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <div className="ch-bg" style={{ background: `radial-gradient(ellipse at top left, ${ch.gradFrom}, ${ch.gradTo} 70%)` }} />
      <div className="ch-icon" style={{ color: ch.iconColor }}>
        <ch.Icon size={28} />
      </div>
      <p className="ch-label">{ch.label}</p>
      <p className="ch-handle">{ch.handle}</p>
      <p className="ch-cta">{ch.cta} →</p>
    </a>
  )
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function ContactPage() {
  return (
    <div style={{
      minHeight: '100vh', background: '#070707',
      fontFamily: '"DM Sans",system-ui,sans-serif', color: '#efefef',
      display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative',
    }}>
      {/* Background orbs */}
      <div style={{ position: 'fixed', top: '-15%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,34,.05) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-12%', left: '-8%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(96,165,250,.03) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />

      <Navbar breadcrumb="Contact" />

      <main style={{ flex: 1, maxWidth: 760, width: '100%', margin: '0 auto', padding: '52px 20px 72px', position: 'relative', zIndex: 1 }}>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 className="contact-anim" style={{ fontFamily: '"Syne"', fontSize: 'clamp(1.8rem,5vw,2.8rem)', fontWeight: 900, lineHeight: 1.1, color: '#efefef', margin: '0 0 12px' }}>
            Get in Touch
          </h1>
          <p className="contact-anim" style={{ color: '#bbb', fontSize: '.87rem', lineHeight: 1.75, maxWidth: 380, margin: '0 auto', animationDelay: '0.05s' }}>
            Reach out to the VPL organising committee through any of the channels below.
          </p>
          <div className="contact-anim" style={{ width: 36, height: 2, background: 'linear-gradient(90deg,#ff6b22,#e63946)', borderRadius: 2, margin: '16px auto 0', animationDelay: '0.1s' }} />
        </div>

        {/* Responsive Channel grid */}
        <div className="ch-grid">
          {channels.map((ch, i) => (
            <div key={ch.id} className="contact-anim" style={{ animationDelay: `${(i * 0.05) + 0.15}s` }}>
              <ChannelCard ch={ch} />
            </div>
          ))}
        </div>

        {/* Info block */}
        <div className="contact-anim" style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,.05)', animationDelay: '0.35s' }}>
          {info.map((item, i) => (
            <div key={item.label} style={{
              display: 'flex', alignItems: 'flex-start', gap: 14,
              padding: '18px 22px',
              background: i % 2 === 0 ? 'rgba(14,14,14,.95)' : 'rgba(10,10,10,.95)',
              borderBottom: i < info.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none',
            }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: 'rgba(255,107,34,.08)', border: '1px solid rgba(255,107,34,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <item.Icon size={15} color="#ff6b22" strokeWidth={1.8} />
              </div>
              <div>
                <p style={{ fontFamily: '"DM Sans"', fontSize: '.6rem', fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase', color: '#ff6b22', margin: 0 }}>{item.label}</p>
                <p style={{ fontFamily: '"DM Sans"', fontSize: '.82rem', color: '#bbb', margin: '5px 0 0', lineHeight: 1.65 }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>

      </main>

      <Footer />

      <style>{`
        .contact-anim {
          animation: contactAppear .6s cubic-bezier(.16,1,.3,1) both;
        }
        @keyframes contactAppear {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .ch-card {
          position: relative; overflow: hidden;
          padding: 28px 24px;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,.07);
          background: rgba(14,14,14,.94);
          transition: transform .2s ease, border-color .3s ease, background .3s ease;
        }
        .ch-card:hover {
          transform: translateY(-2px);
          background: rgba(18,18,18,.96);
        }
        .ch-card-whatsapp:hover  { border-color: rgba(37,211,102,.3); }
        .ch-card-instagram:hover { border-color: rgba(225,48,108,.3); }
        .ch-card-email:hover     { border-color: rgba(255,107,34,.3); }
        .ch-card-location:hover  { border-color: rgba(96,165,250,.3); }

        /* Gradient bg — always visible, no hover */
        .ch-bg {
          position: absolute; inset: 0;
          opacity: 0.35;
          pointer-events: none;
        }

        .ch-icon {
          width: 52px; height: 52px; border-radius: 14px;
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.08);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 18px;
          position: relative;
        }

        .ch-label {
          font-family: "Syne",system-ui,sans-serif;
          font-size: .78rem; font-weight: 800;
          letter-spacing: .16em; text-transform: uppercase;
          color: #bbb; margin: 0 0 6px;
          position: relative;
        }
        .ch-handle {
          font-family: "Syne",system-ui,sans-serif;
          font-size: clamp(.9rem,2.5vw,1.1rem); font-weight: 700;
          color: #efefef; margin: 0 0 12px;
          position: relative;
        }
        .ch-cta {
          font-family: "DM Sans",system-ui,sans-serif;
          font-size: .75rem; font-weight: 600;
          color: #aaa; margin: 0; letter-spacing: .04em;
          transition: color .25s;
          position: relative;
        }

        .ch-grid {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 32px;
        }

        @media (max-width: 600px) {
          .ch-grid { grid-template-columns: 1fr; gap: 10px; }
        }

        @media (max-width: 480px) {
          .ch-card { padding: 22px 18px; }
          .ch-icon { width: 44px; height: 44px; border-radius: 11px; margin-bottom: 14px; }
          .ch-handle { font-size: .9rem; }
        }
      `}</style>
    </div>
  )
}
