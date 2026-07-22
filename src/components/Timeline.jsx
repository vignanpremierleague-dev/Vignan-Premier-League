import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ClipboardList, Gavel, Shirt, Swords, Trophy, PartyPopper } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const EVENT_ICONS = [
  <ClipboardList size={20} />,
  <Gavel size={20} />,
  <Shirt size={20} />,
  <Swords size={20} />,
  <Trophy size={20} />,
  <PartyPopper size={20} />,
]

const DEFAULT_EVENTS = [
  { title: 'Registrations Open', date: 'Coming Soon', desc: 'Register online and pay the Rs.300 entry fee to join the player pool.' },
  { title: 'Player Auction', date: 'Coming Soon', desc: 'Faculty team owners bid for players in a high-energy live auction.' },
  { title: 'Team Reveal', date: 'Coming Soon', desc: 'Final squads announced and jersey numbers assigned.' },
  { title: 'League Matches', date: 'Coming Soon', desc: 'Round-robin 8 Over league stage where every match and every ball counts.' },
  { title: 'Knockouts & Finals', date: 'Coming Soon', desc: 'Semi-finals and the Grand Finale for the VPL championship.' },
  { title: 'Awards Ceremony', date: 'Coming Soon', desc: 'Best Batsman, Bowler, and Player of the Tournament will be recognized.' },
]

function buildTimelineEvents(settings) {
  const sourceEvents = Array.isArray(settings?.timelineEvents) && settings.timelineEvents.length
    ? settings.timelineEvents
    : DEFAULT_EVENTS

  return sourceEvents.map((event, index) => ({
    icon: EVENT_ICONS[index] || <ClipboardList size={20} />,
    title: event?.title || DEFAULT_EVENTS[index]?.title || '',
    date: event?.date || 'Coming Soon',
    desc: event?.desc || DEFAULT_EVENTS[index]?.desc || '',
  }))
}

export default function Timeline({ settings }) {
  const lineRef = useRef(null)
  const itemRefs = useRef([])
  const sectionTitle = settings?.timelineSectionTitle || 'Tournament Timeline'
  const timelineWindow = settings?.timelineWindow || 'July - August'
  const events = buildTimelineEvents(settings)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(lineRef.current,
        { scaleY: 0, transformOrigin: 'top' },
        { scaleY: 1, duration: 2, ease: 'none',
          scrollTrigger: { trigger: lineRef.current, start: 'top 80%', end: 'bottom 20%', scrub: true } }
      )
      itemRefs.current.forEach((el, i) => {
        if (!el) return
        const isLeft = i % 2 === 0
        gsap.fromTo(el,
          { opacity: 0, x: isLeft ? -40 : 40 },
          { opacity: 1, x: 0, duration: .7, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true } }
        )
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <section style={{ padding: '100px 0', background: '#06060a' }}>
      <div className="wrap">
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <h2 className="section-heading fire-text" style={{ marginBottom: 8 }}>{sectionTitle}</h2>
          <span className="divider" />
          <p style={{ fontFamily: '"DM Sans",system-ui,sans-serif', color: '#f5a100', fontSize: '.86rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', margin: '14px 0 0' }}>
            {timelineWindow}
          </p>
        </div>

        <div className="tl-desktop" style={{ position: 'relative', maxWidth: 900, margin: '0 auto' }}>
          <div ref={lineRef} style={{
            position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2,
            background: 'linear-gradient(180deg, transparent 0%, #ff6b22 10%, #f5a100 50%, #ff6b22 90%, transparent 100%)',
            transform: 'translateX(-50%)', transformOrigin: 'top',
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 44 }}>
            {events.map((ev, i) => {
              const isLeft = i % 2 === 0
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 48px 1fr', alignItems: 'center' }}>
                  <div style={{ padding: '0 28px 0 0', display: 'flex', justifyContent: 'flex-end' }}>
                    {isLeft && (
                      <div ref={el => itemRefs.current[i] = el} className="halo" style={{ padding: '20px 22px', maxWidth: 380, width: '100%', opacity: 0 }}>
                        <CardContent ev={ev} />
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2 }}>
                    <div style={{ width: 15, height: 15, borderRadius: '50%', background: '#06060a', border: '2.5px solid #ff6b22', boxShadow: '0 0 12px rgba(255,107,34,.5)' }} />
                  </div>
                  <div style={{ padding: '0 0 0 28px', display: 'flex', justifyContent: 'flex-start' }}>
                    {!isLeft && (
                      <div ref={el => itemRefs.current[i] = el} className="halo" style={{ padding: '20px 22px', maxWidth: 380, width: '100%', opacity: 0 }}>
                        <CardContent ev={ev} />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="tl-mobile" style={{ position: 'relative', maxWidth: 520, margin: '0 auto' }}>
          <div style={{
            position: 'absolute', left: 20, top: 0, bottom: 0, width: 2,
            background: 'linear-gradient(180deg, transparent 0%, #ff6b22 8%, #f5a100 50%, #ff6b22 92%, transparent 100%)',
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {events.map((ev, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
                <div style={{ flexShrink: 0, width: 42, display: 'flex', justifyContent: 'center', paddingTop: 18 }}>
                  <div style={{ width: 13, height: 13, borderRadius: '50%', background: '#06060a', border: '2.5px solid #ff6b22', boxShadow: '0 0 10px rgba(255,107,34,.45)', flexShrink: 0 }} />
                </div>
                <div className="halo" style={{ flex: 1, padding: '16px 18px' }}>
                  <CardContent ev={ev} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .tl-desktop { display:block; }
        .tl-mobile  { display:none; }
        @media(max-width:700px) {
          .tl-desktop { display:none; }
          .tl-mobile  { display:block; }
        }
      `}</style>
    </section>
  )
}

function CardContent({ ev }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
      <div className="icon-sq" style={{ width: 40, height: 40, borderRadius: 11, flexShrink: 0, color: '#ff6b22' }}>
        {ev.icon}
      </div>
      <div>
        <span style={{ color: '#f5a100', fontSize: '.67rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.12em', display: 'block', marginBottom: 4 }}>
          {ev.date}
        </span>
        <h3 style={{ fontFamily: '"Syne",system-ui,sans-serif', fontWeight: 700, fontSize: '.92rem', color: '#efefef', marginBottom: 5 }}>
          {ev.title}
        </h3>
        <p style={{ fontFamily: '"DM Sans",system-ui,sans-serif', color: '#8b8b8b', fontSize: '.82rem', lineHeight: 1.65 }}>
          {ev.desc}
        </p>
      </div>
    </div>
  )
}
