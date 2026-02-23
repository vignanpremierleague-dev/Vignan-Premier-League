import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'
import { Trophy, Medal, Target, Crosshair, Star, Flame } from 'lucide-react'

// ── Top 2 podium prizes ──────────────────────────────────────────────────────
const podium = [
  {
    icon: <Trophy size={28} />,
    rank: '🥇 Winner',
    title: 'Champions Trophy',
    desc: 'Championship Trophy + Merit Certificates for the entire winning team',
    color: '#f5a100',
    glow: 'rgba(245,161,0,.35)',
    big: true,
  },
  {
    icon: <Medal size={24} />,
    rank: '🥈 Runner Up',
    title: 'Runner-Up Shield',
    desc: 'Runner-up Shield + Certificates for all team members',
    color: '#b4b4b4',
    glow: 'rgba(180,180,180,.22)',
    big: false, mid: true,
  },
  {
    icon: <Medal size={24} />,
    rank: '🥉 2nd Runner Up',
    title: 'Bronze Award',
    desc: 'Bronze Medal + Participation Certificates for the semi-finalist team',
    color: '#cd7f32',
    glow: 'rgba(205,127,50,.22)',
    big: false,
  },
]

// ── Individual awards ────────────────────────────────────────────────────────
const awards = [
  { icon: <Target    size={22} />, title: 'Best Batsman',         desc: 'Highest run-scorer of the tournament',  color: '#ff6b22' },
  { icon: <Crosshair size={22} />, title: 'Best Bowler',          desc: 'Highest wicket-taker of the tournament', color: '#e63946' },
  { icon: <Star      size={22} />, title: 'Player of Tournament', desc: 'Most impactful player overall',          color: '#ffd700' },
]

export default function Prizes() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animate(sectionRef.current.querySelectorAll('.prize-anim'), {
          opacity: [0, 1], translateY: [40, 0], scale: [.94, 1],
          delay: stagger(90, { start: 60 }),
          duration: 650, ease: 'outExpo',
        })
        observer.disconnect()
      }
    }, { threshold: .1 })
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="prizes" ref={sectionRef} style={{ padding: '100px 0', background: '#070707' }}>
      <div className="wrap">
        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 className="section-heading fire-text" style={{ marginBottom: 8 }}>Prizes &amp; Rewards</h2>
          <span className="divider" />
          <p style={{ fontFamily: '"DM Sans",system-ui,sans-serif', color: '#6a6a6a', fontSize: '.84rem', marginTop: 14 }}>
            Glory, recognition, and rewards for the fiercest competitors
          </p>
        </div>

        {/* ── Podium Row (Winner + Runner-up) ── */}
        <div className="prizes-podium">
          {/* Runner-up — left */}
          <PodiumCard p={podium[1]} delay="0.1s" />
          {/* Winner — centre, elevated */}
          <PodiumCard p={podium[0]} delay="0s" />
          {/* Bronze — right */}
          <PodiumCard p={podium[2]} delay="0.2s" />
        </div>

        {/* ── Individual Awards Row ── */}
        <div style={{ textAlign: 'center', margin: '52px 0 20px' }}>
          <span style={{
            fontFamily: '"Syne"', fontWeight: 700, fontSize: '.73rem', color: '#4a4a4a',
            textTransform: 'uppercase', letterSpacing: '.2em',
          }}>Individual Awards</span>
        </div>

        <div className="prizes-awards">
          {awards.map((a) => (
            <AwardCard key={a.title} a={a} />
          ))}
        </div>
      </div>

      <style>{`
        /* Podium: winner centred + taller on desktop */
        .prizes-podium {
          display: grid;
          grid-template-columns: 1fr 1.18fr 1fr;
          gap: 18px;
          max-width: 860px;
          margin: 0 auto;
          align-items: end;
        }
        .prizes-spacer { display: block; }

        /* Awards row */
        .prizes-awards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          max-width: 860px;
          margin: 0 auto;
        }

        /* Mobile: stack everything */
        @media(max-width: 680px) {
          .prizes-podium {
            grid-template-columns: 1fr;
            align-items: stretch;
          }
          .prizes-spacer { display: none; }
          .prizes-awards { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  )
}

function PodiumCard({ p, delay }) {
  const pad     = p.big ? '40px 28px' : p.mid ? '32px 24px' : '24px 20px'
  const iconSz  = p.big ? 64 : p.mid ? 54 : 46
  const iconR   = p.big ? 18 : 14
  const titleSz = p.big ? '1.12rem' : p.mid ? '1rem' : '.9rem'
  const descSz  = p.big ? '.84rem' : '.78rem'
  return (
    <div className="prize-anim" style={{
      opacity: 0,
      background: `rgba(18,18,18,.95)`,
      border: `1px solid ${p.color}30`,
      borderRadius: 20,
      padding: pad,
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
      animationDelay: delay,
      boxShadow: p.big ? `0 0 60px ${p.glow}, 0 0 120px ${p.glow}40` : 'none',
      transition: 'transform .3s ease, box-shadow .3s ease',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)' }}
    onMouseLeave={e => { e.currentTarget.style.transform = '' }}
    >
      {/* Top colour bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: p.big ? 3 : 2, background: p.color }} />

      {/* Glow orb behind icon */}
      <div style={{
        position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
        width: 120, height: 120, borderRadius: '50%',
        background: `radial-gradient(circle, ${p.color}14 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Rank badge */}
      <span style={{
        display: 'inline-block', marginBottom: 18,
        fontFamily: '"DM Sans"', fontSize: p.big ? '.82rem' : p.mid ? '.78rem' : '.72rem',
        fontWeight: 700, color: p.color,
        background: `${p.color}14`,
        border: `1px solid ${p.color}30`,
        borderRadius: 99, padding: '4px 14px',
      }}>{p.rank}</span>

      {/* Icon */}
      <div style={{
        width: iconSz, height: iconSz,
        borderRadius: iconR,
        background: `${p.color}14`, border: `1.5px solid ${p.color}35`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: p.color, margin: '0 auto 18px',
      }}>
        {p.icon}
      </div>

      <h3 style={{
        fontFamily: '"Syne",system-ui,sans-serif', fontWeight: 800,
        fontSize: titleSz,
        color: '#efefef', marginBottom: 10,
      }}>{p.title}</h3>

      <p style={{
        fontFamily: '"DM Sans",system-ui,sans-serif',
        color: '#8a8a8a', fontSize: descSz,
        lineHeight: 1.65,
      }}>{p.desc}</p>

      {/* Winner flame accent */}
      {p.big && (
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
          <Flame size={14} color={p.color} style={{ animation: 'flicker 1s ease-in-out infinite' }} />
        </div>
      )}
    </div>
  )
}

function AwardCard({ a }) {
  return (
    <div className="prize-anim" style={{
      opacity: 0,
      background: 'rgba(18,18,18,.9)',
      border: '1px solid rgba(255,255,255,.07)',
      borderRadius: 16, padding: '22px 20px',
      display: 'flex', alignItems: 'flex-start', gap: 14,
      transition: 'transform .3s, border-color .3s',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = `${a.color}35` }}
    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'rgba(255,255,255,.07)' }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: `${a.color}12`, border: `1px solid ${a.color}28`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: a.color,
      }}>{a.icon}</div>
      <div>
        <h4 style={{ fontFamily: '"Syne"', fontWeight: 700, fontSize: '.88rem', color: '#efefef', marginBottom: 5 }}>{a.title}</h4>
        <p style={{ fontFamily: '"DM Sans"', color: '#7a7a7a', fontSize: '.78rem', lineHeight: 1.6 }}>{a.desc}</p>
      </div>
    </div>
  )
}
