import Navbar        from './components/Navbar'
import Hero           from './components/Hero'
import About          from './components/About'
import HowItWorks     from './components/HowItWorks'
import Timeline       from './components/Timeline'
import Prizes         from './components/Prizes'
import Footer         from './components/Footer'
import EmberParticles  from './components/EmberParticles'
import { useEffect, useState } from 'react'
import { fetchSiteSettings } from './lib/adminApi'

function ContactStrip({ settings }) {
  const whatsappLink = settings?.whatsappLink || "https://chat.whatsapp.com/L7HXdLMblNRGTNwJbMZPVE?mode=gi_t";
  const coordinators = settings?.studentCoordinators || [];
  const supportTitle = settings?.supportTitle || 'Need help?'
  const supportDescription = settings?.supportDescription || 'Reach out for registration queries, rule clarifications, or anything about VPL 2025.'
  const supportWhatsappLabel = settings?.supportWhatsappLabel || 'WhatsApp Group'
  const supportContactLabel = settings?.supportContactLabel || 'All Contacts'
  return (
    <section style={{
      padding: '72px 20px',
      borderTop: '1px solid rgba(255,255,255,.05)',
      textAlign: 'center',
    }}>
      <p style={{
        fontFamily: '"DM Sans",system-ui,sans-serif',
        fontSize: '.67rem', fontWeight: 800, letterSpacing: '.2em',
        textTransform: 'uppercase', color: '#ff6b22', margin: '0 0 14px',
      }}>Support</p>

      <h2 style={{
        fontFamily: '"Syne",system-ui,sans-serif',
        fontSize: 'clamp(1.6rem,4vw,2.2rem)', fontWeight: 900,
        color: '#efefef', margin: '0 0 12px', lineHeight: 1.15,
      }}>{supportTitle}</h2>

      <p style={{
        fontFamily: '"DM Sans"', fontSize: '.86rem',
        color: '#4a4a4a', lineHeight: 1.7,
        maxWidth: 360, margin: '0 auto 32px',
      }}>
        {supportDescription}
      </p>


      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <a
          href={whatsappLink}
          target="_blank" rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 9,
            fontFamily: '"DM Sans"', fontWeight: 700, fontSize: '.82rem',
            color: '#fff', textDecoration: 'none',
            padding: '12px 22px', borderRadius: 10,
            background: '#128C7E',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654A11.882 11.882 0 0012.05 24h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="white"/>
          </svg>
          {supportWhatsappLabel}
        </a>

        <a
          href="/contact"
          style={{
            display: 'inline-flex', alignItems: 'center',
            fontFamily: '"DM Sans"', fontWeight: 700, fontSize: '.82rem',
            color: '#efefef', textDecoration: 'none',
            padding: '12px 22px', borderRadius: 10,
            border: '1px solid rgba(255,255,255,.12)',
            background: 'transparent',
          }}
        >
          {supportContactLabel}
        </a>
      </div>
    </section>
  )
}

function MarqueeAnnouncements({ text }) {
  if (!text) return null
  
  const copies = Array(12).fill(text)
  
  return (
    <div style={{ 
      position: 'relative',
      background: 'rgba(255, 107, 34, 0.08)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 107, 34, 0.15)',
      overflow: 'hidden', 
      whiteSpace: 'nowrap', 
      padding: '12px 0',
      display: 'flex'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '3rem',
        paddingRight: '3rem',
        flexShrink: 0,
        animation: 'marquee-scroll 120s linear infinite',
      }}>
        {copies.map((t, i) => (
          <span key={i} style={{ fontFamily: '"Syne", system-ui, sans-serif', fontWeight: 700, fontSize: '.9rem', letterSpacing: '.05em', textTransform: 'uppercase', color: '#f0eff5', display: 'flex', alignItems: 'center', gap: '3rem' }}>
            {t}
            <span style={{ color: '#ff6b22', fontSize: '1.2rem', lineHeight: 0.8 }}>⚡</span>
          </span>
        ))}
      </div>
      <div aria-hidden="true" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '3rem',
        paddingRight: '3rem',
        flexShrink: 0,
        animation: 'marquee-scroll 120s linear infinite',
      }}>
        {copies.map((t, i) => (
          <span key={i} style={{ fontFamily: '"Syne", system-ui, sans-serif', fontWeight: 700, fontSize: '.9rem', letterSpacing: '.05em', textTransform: 'uppercase', color: '#f0eff5', display: 'flex', alignItems: 'center', gap: '3rem' }}>
            {t}
            <span style={{ color: '#ff6b22', fontSize: '1.2rem', lineHeight: 0.8 }}>⚡</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes marquee-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }`}</style>
    </div>
  )
}

export default function MainSite() {
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    fetchSiteSettings().then(setSettings).catch(console.error)
  }, [])

  return (
    <div className="relative min-h-screen bg-dark text-text-primary font-outfit">
      <EmberParticles />
      <Navbar />
      {/* 60px spacer so content clears the fixed navbar */}
      <div style={{ height: 60 }} />
      {settings?.marqueeMessage && <MarqueeAnnouncements text={settings.marqueeMessage} />}
      <main>
        <Hero settings={settings} />
        <About />
        <HowItWorks />
        <Timeline />
        <Prizes winners={settings?.winners} />
        <ContactStrip settings={settings} />
      </main>
      <Footer />
    </div>
  )
}

