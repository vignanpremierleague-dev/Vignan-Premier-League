import { Flame, ArrowUpRight, Radio } from 'lucide-react'
import FireParticles from './FireParticles'

export default function Hero({ settings, topOffset = 0 }) {
  const seasonLabel = settings?.heroSeasonLabel || 'Season 1 · 2026'
  const line1 = settings?.heroTitleLine1 || 'VIGNAN'
  const line2 = settings?.heroTitleLine2 || 'PREMIER'
  const line3 = settings?.heroTitleLine3 || 'LEAGUE'
  const subtitle = settings?.heroSubtitle || '8 Over Format · IPL-Style Auction · Faculty Team Owners · Vignan Campus'
  const primaryLabel = settings?.heroPrimaryCtaLabel || 'Register Now'
  const primaryHref = settings?.heroPrimaryCtaHref || '/register'
  const secondaryLabel = 'View Teams'
  const secondaryHref = '/teams'
  const contentPadding = topOffset > 0 ? '64px 0 40px' : '96px 0 64px'

  return (
    <section
      id="home"
      style={{
        position: 'relative',
        minHeight: `calc(100vh - ${topOffset}px)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        overflow: 'hidden',
        background: '#06060a',
      }}
    >
      {/* Background: glass + drifting orbs + grid */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(14,8,20,.97) 0%, rgba(6,6,10,.99) 50%, rgba(10,6,16,.97) 100%)',
        }} />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,107,34,.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,34,.022) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
      </div>

      <FireParticles count={22} />

      {/* Content */}
      <div className="wrap hero-content" style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: contentPadding }}>

        {/* Season badge */}
        <div className="hero-fade-up" style={{ display: 'flex', justifyContent: 'center', marginBottom: 20, animationDelay: '0.1s' }}>
          <span className="tag hero-season-pill">
            <Flame style={{ width: 12, height: 12, animation: 'flicker .8s ease-in-out infinite' }} />
            {seasonLabel}
          </span>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 20 }}>
          <h1
            className="display-heading"
            style={{
              fontSize: 'clamp(2.6rem,6.6vw,6rem)',
              letterSpacing: '-.02em',
              lineHeight: 1.0,
              fontFamily: '"Syne",system-ui,sans-serif',
            }}
          >
            <span className="hero-line fire-text" style={{ display: 'block', animationDelay: '0.2s' }}>{line1}</span>
            <span className="hero-line fire-text" style={{ display: 'block', animationDelay: '0.35s' }}>{line2}</span>
            <span className="hero-line fire-text" style={{ display: 'block', animationDelay: '0.5s' }}>{line3}</span>
          </h1>
        </div>

        {/* Subtitle */}
        <p
          className="hero-fade-up"
          style={{
            fontFamily: '"DM Sans",system-ui,sans-serif',
            color: '#9a9a9a',
            fontSize: '.95rem',
            maxWidth: 400,
            margin: '0 auto 28px',
            lineHeight: 1.65,
            animationDelay: '0.65s',
          }}
        >
          {subtitle}
        </p>

        {/* Buttons */}
        <div className="hero-fade-up hero-cta-row" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', animationDelay: '0.8s' }}>
          {settings?.registrationsOpen === false ? (
            <>
              <a href="/schedule" className="btn-primary hero-btn-primary" onClick={e => { e.preventDefault(); window.location.href = '/schedule' }}>
                View Schedule <ArrowUpRight style={{ width: 16, height: 16 }} />
              </a>
              <a href={secondaryHref} className="btn-ghost hero-btn-ghost">
                {secondaryLabel} <ArrowUpRight style={{ width: 16, height: 16 }} />
              </a>
            </>
          ) : (
            <>
              <a href={primaryHref} className="btn-primary hero-btn-primary" onClick={e => { e.preventDefault(); window.location.href = primaryHref }}>
                <Flame style={{ width: 16, height: 16 }} /> {primaryLabel}
              </a>
              <a href="/schedule" className="btn-ghost hero-btn-ghost" onClick={e => { e.preventDefault(); window.location.href = '/schedule' }}>
                View Schedule <ArrowUpRight style={{ width: 16, height: 16 }} />
              </a>
            </>
          )}
        </div>
      </div>

      {/* Bottom fade */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 160,
        background: 'linear-gradient(to top, #06060a 0%, transparent 100%)',
        zIndex: 1, pointerEvents: 'none',
      }} />
    </section>
  )
}
