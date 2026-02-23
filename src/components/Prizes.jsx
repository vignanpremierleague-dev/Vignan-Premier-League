import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'
import { Trophy, Medal, Target, Crosshair, Star } from 'lucide-react'

const prizes = [
  { icon:<Trophy    size={24}/>, title:'Winner Trophy',        desc:'Championship Trophy + Certificates for the entire team', color:'#f5a100' },
  { icon:<Medal     size={24}/>, title:'Runner Up',            desc:'Runner-up Certificates for all team members',            color:'#b0b0c8' },
  { icon:<Target    size={24}/>, title:'Best Batsman',         desc:'Award for the highest run-scorer of the tournament',     color:'#ff6b22' },
  { icon:<Crosshair size={24}/>, title:'Best Bowler',          desc:'Award for the highest wicket-taker of the tournament',   color:'#e63946' },
  { icon:<Star      size={24}/>, title:'Player of Tournament', desc:'Overall most impactful player receives this award',      color:'#ffd700' },
]

export default function Prizes() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animate(sectionRef.current.querySelectorAll('.prize-card'), {
          opacity: [0, 1],
          translateY: [50, 0],
          scale: [.9, 1],
          delay: stagger(80, { start: 50 }),
          duration: 700,
          ease: 'outExpo',
        })
        observer.disconnect()
      }
    }, { threshold:.15 })
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="prizes" ref={sectionRef} style={{ padding:'100px 0', background:'#06060a' }}>
      <div className="wrap">
        <div style={{ textAlign:'center', marginBottom:60 }}>
          <h2 className="section-heading fire-text" style={{ marginBottom:8 }}>Prizes & Rewards</h2>
          <span className="divider" />
        </div>
        <div style={{
          display:'grid', gap:20,
          gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',
          maxWidth:920, margin:'0 auto',
        }}>
          {prizes.map((p) => (
            <div key={p.title} className="prize-card halo" style={{ padding:'32px 24px', textAlign:'center', position:'relative', overflow:'hidden', opacity:0 }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:p.color }}/>
              <div style={{ display:'flex', justifyContent:'center', marginBottom:16 }}>
                <div className="icon-sq" style={{ color:p.color, background:`${p.color}12`, borderColor:`${p.color}25` }}>{p.icon}</div>
              </div>
              <h3 style={{ fontFamily:'"Syne",system-ui,sans-serif', fontWeight:700, fontSize:'.95rem', color:'#f0eff5', marginBottom:8 }}>{p.title}</h3>
              <p style={{ fontFamily:'"DM Sans",system-ui,sans-serif', color:'#5a5a7a', fontSize:'.82rem', lineHeight:1.65 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
