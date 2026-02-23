import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ClipboardList, Gavel, Shirt, Swords, Trophy, PartyPopper } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const events = [
  { icon:<ClipboardList size={20}/>, title:'Registrations Open', date:'Coming Soon', desc:'Register online and pay the ₹400 entry fee to join the player pool.' },
  { icon:<Gavel         size={20}/>, title:'Player Auction',      date:'Coming Soon', desc:'Faculty team owners bid for players in a high-energy live auction.' },
  { icon:<Shirt         size={20}/>, title:'Team Reveal',         date:'Coming Soon', desc:'Final squads announced and jersey numbers assigned.' },
  { icon:<Swords        size={20}/>, title:'League Matches',      date:'Coming Soon', desc:'Round-robin T10 league stage — every match, every ball counts.' },
  { icon:<Trophy        size={20}/>, title:'Knockouts & Finals',  date:'Coming Soon', desc:'Semi-finals and the Grand Finale for the VPL championship.' },
  { icon:<PartyPopper   size={20}/>, title:'Awards Ceremony',     date:'Coming Soon', desc:'Best Batsman, Bowler, and Player of Tournament awarded.' },
]

export default function Timeline() {
  const lineRef  = useRef(null)
  const itemRefs = useRef([])

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
    <section style={{ padding:'100px 0', background:'#06060a' }}>
      <div className="wrap">
        <div style={{ textAlign:'center', marginBottom:72 }}>
          <h2 className="section-heading fire-text" style={{ marginBottom:8 }}>Tournament Timeline</h2>
          <span className="divider" />
        </div>

        {/* ── Desktop: alternating 2-column ── */}
        <div className="tl-desktop" style={{ position:'relative', maxWidth:900, margin:'0 auto' }}>
          {/* Center line */}
          <div ref={lineRef} style={{
            position:'absolute', left:'50%', top:0, bottom:0, width:2,
            background:'linear-gradient(180deg, transparent 0%, #ff6b22 10%, #f5a100 50%, #ff6b22 90%, transparent 100%)',
            transform:'translateX(-50%)', transformOrigin:'top',
          }} />

          <div style={{ display:'flex', flexDirection:'column', gap:44 }}>
            {events.map((ev, i) => {
              const isLeft = i % 2 === 0
              return (
                <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 48px 1fr', alignItems:'center' }}>
                  {/* Left slot */}
                  <div style={{ padding:'0 28px 0 0', display:'flex', justifyContent:'flex-end' }}>
                    {isLeft && (
                      <div ref={el => itemRefs.current[i] = el} className="halo" style={{ padding:'20px 22px', maxWidth:380, width:'100%', opacity:0 }}>
                        <CardContent ev={ev} />
                      </div>
                    )}
                  </div>
                  {/* Dot */}
                  <div style={{ display:'flex', justifyContent:'center', alignItems:'center', zIndex:2 }}>
                    <div style={{ width:15, height:15, borderRadius:'50%', background:'#06060a', border:'2.5px solid #ff6b22', boxShadow:'0 0 12px rgba(255,107,34,.5)' }} />
                  </div>
                  {/* Right slot */}
                  <div style={{ padding:'0 0 0 28px', display:'flex', justifyContent:'flex-start' }}>
                    {!isLeft && (
                      <div ref={el => itemRefs.current[i] = el} className="halo" style={{ padding:'20px 22px', maxWidth:380, width:'100%', opacity:0 }}>
                        <CardContent ev={ev} />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Mobile: single vertical line on left ── */}
        <div className="tl-mobile" style={{ position:'relative', maxWidth:520, margin:'0 auto' }}>
          {/* Left vertical line */}
          <div style={{
            position:'absolute', left:20, top:0, bottom:0, width:2,
            background:'linear-gradient(180deg, transparent 0%, #ff6b22 8%, #f5a100 50%, #ff6b22 92%, transparent 100%)',
          }} />

          <div style={{ display:'flex', flexDirection:'column', gap:28 }}>
            {events.map((ev, i) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:0 }}>
                {/* Dot on left line */}
                <div style={{ flexShrink:0, width:42, display:'flex', justifyContent:'center', paddingTop:18 }}>
                  <div style={{ width:13, height:13, borderRadius:'50%', background:'#06060a', border:'2.5px solid #ff6b22', boxShadow:'0 0 10px rgba(255,107,34,.45)', flexShrink:0 }} />
                </div>
                {/* Card */}
                <div className="halo" style={{ flex:1, padding:'16px 18px' }}>
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
    <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
      <div className="icon-sq" style={{ width:40, height:40, borderRadius:11, flexShrink:0, color:'#ff6b22' }}>
        {ev.icon}
      </div>
      <div>
        <span style={{ color:'#f5a100', fontSize:'.67rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.12em', display:'block', marginBottom:4 }}>
          {ev.date}
        </span>
        <h3 style={{ fontFamily:'"Syne",system-ui,sans-serif', fontWeight:700, fontSize:'.92rem', color:'#efefef', marginBottom:5 }}>
          {ev.title}
        </h3>
        <p style={{ fontFamily:'"DM Sans",system-ui,sans-serif', color:'#8b8b8b', fontSize:'.82rem', lineHeight:1.65 }}>
          {ev.desc}
        </p>
      </div>
    </div>
  )
}
