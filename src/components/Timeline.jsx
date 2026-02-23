import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ClipboardList, Gavel, Shirt, Swords, Trophy, PartyPopper } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const events = [
  { icon:<ClipboardList size={20} color="#ff6b22"/>, title:'Registrations Open', date:'Coming Soon', desc:'Register online and pay the ₹400 entry fee to join the player pool.' },
  { icon:<Gavel         size={20} color="#ff6b22"/>, title:'Player Auction',      date:'Coming Soon', desc:'Faculty team owners bid for players in a high-energy live auction.' },
  { icon:<Shirt         size={20} color="#ff6b22"/>, title:'Team Reveal',         date:'Coming Soon', desc:'Final squads announced and jersey numbers assigned.' },
  { icon:<Swords        size={20} color="#ff6b22"/>, title:'League Matches',      date:'Coming Soon', desc:'Round-robin T10 league stage—every match, every ball counts.' },
  { icon:<Trophy        size={20} color="#ff6b22"/>, title:'Knockouts & Finals',  date:'Coming Soon', desc:'Semi-finals and the Grand Finale for the VPL championship.' },
  { icon:<PartyPopper   size={20} color="#ff6b22"/>, title:'Awards Ceremony',     date:'Coming Soon', desc:'Best Batsman, Bowler, and Player of Tournament awarded.' },
]

export default function Timeline() {
  const lineRef = useRef(null)
  const itemRefs = useRef([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate the vertical line drawing
      gsap.fromTo(lineRef.current,
        { scaleY: 0, transformOrigin: 'top' },
        {
          scaleY: 1, duration: 2, ease: 'none',
          scrollTrigger: { trigger: lineRef.current, start: 'top 80%', end: 'bottom 20%', scrub: true }
        }
      )

      // Cards: alternating left/right slide-in
      itemRefs.current.forEach((el, i) => {
        if (!el) return
        const isLeft = i % 2 === 0
        gsap.fromTo(el,
          { opacity: 0, x: isLeft ? -50 : 50 },
          {
            opacity: 1, x: 0, duration: .7, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true }
          }
        )
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <section style={{ padding:'100px 0', background:'#06060a' }}>
      <div className="wrap">
        {/* Heading */}
        <div style={{ textAlign:'center', marginBottom:80 }}>
          <h2 className="section-heading fire-text" style={{ marginBottom:8 }}>Tournament Timeline</h2>
          <span className="divider" />
        </div>

        {/* Timeline grid: 2-col with center line */}
        <div style={{ position:'relative', maxWidth:900, margin:'0 auto' }}>

          {/* Center vertical line */}
          <div ref={lineRef} style={{
            position:'absolute',
            left:'50%', top:0, bottom:0,
            width:2,
            background:'linear-gradient(180deg, transparent 0%, #ff6b22 10%, #f5a100 50%, #ff6b22 90%, transparent 100%)',
            transform:'translateX(-50%)',
            transformOrigin:'top',
          }} />

          {/* Items */}
          <div style={{ display:'flex', flexDirection:'column', gap:48 }}>
            {events.map((ev, i) => {
              const isLeft = i % 2 === 0
              return (
                <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 48px 1fr', alignItems:'center', gap:0 }}>

                  {/* Left slot */}
                  <div style={{ padding:'0 28px 0 0', display:'flex', justifyContent:'flex-end' }}>
                    {isLeft && (
                      <div ref={el => itemRefs.current[i] = el} className="halo" style={{ padding:'22px 24px', maxWidth:380, width:'100%', opacity:0 }}>
                        <CardContent ev={ev} />
                      </div>
                    )}
                  </div>

                  {/* Center dot */}
                  <div style={{ display:'flex', justifyContent:'center', alignItems:'center', position:'relative', zIndex:2 }}>
                    <div style={{
                      width:16, height:16, borderRadius:'50%',
                      background:'#06060a',
                      border:'2.5px solid #ff6b22',
                      boxShadow:'0 0 14px rgba(255,107,34,.5), 0 0 28px rgba(255,107,34,.2)',
                    }} />
                  </div>

                  {/* Right slot */}
                  <div style={{ padding:'0 0 0 28px', display:'flex', justifyContent:'flex-start' }}>
                    {!isLeft && (
                      <div ref={el => itemRefs.current[i] = el} className="halo" style={{ padding:'22px 24px', maxWidth:380, width:'100%', opacity:0 }}>
                        <CardContent ev={ev} />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function CardContent({ ev }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
      <div className="icon-sq" style={{ width:42, height:42, borderRadius:12, flexShrink:0 }}>
        {ev.icon}
      </div>
      <div>
        <span style={{ color:'#f5a100', fontSize:'.68rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.12em', display:'block', marginBottom:4 }}>
          {ev.date}
        </span>
        <h3 style={{ fontFamily:'"Syne",system-ui,sans-serif', fontWeight:700, fontSize:'.95rem', color:'#f0eff5', marginBottom:6 }}>
          {ev.title}
        </h3>
        <p style={{ fontFamily:'"DM Sans",system-ui,sans-serif', color:'#5a5a7a', fontSize:'.82rem', lineHeight:1.65 }}>
          {ev.desc}
        </p>
      </div>
    </div>
  )
}
