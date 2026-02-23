import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'
import { UserPlus, Gavel, Users, Trophy } from 'lucide-react'

const steps = [
  { n:'01', icon:<UserPlus size={22} color="#ff6b22"/>, title:'Register',     desc:'Sign up online and pay ₹400 to enter the player pool.' },
  { n:'02', icon:<Gavel    size={22} color="#ff6b22"/>, title:'Auction',      desc:'Faculty team owners bid for players in a live auction.' },
  { n:'03', icon:<Users    size={22} color="#ff6b22"/>, title:'Get Drafted',  desc:'Join your team and prepare for the tournament.' },
  { n:'04', icon:<Trophy   size={22} color="#ff6b22"/>, title:'Play & Win',   desc:'Compete in T10 format and chase the VPL trophy!' },
]

export default function HowItWorks() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animate(sectionRef.current.querySelectorAll('.step-card'), {
          opacity: [0, 1],
          translateY: [60, 0],
          scale: [.92, 1],
          delay: stagger(100, { start: 100 }),
          duration: 650,
          ease: 'outExpo',
        })
        observer.disconnect()
      }
    }, { threshold: .15 })
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} style={{ padding:'100px 0', background:'#0c0c14' }}>
      <div className="wrap">
        <div style={{ textAlign:'center', marginBottom:64 }}>
          <h2 className="section-heading fire-text" style={{ marginBottom:8 }}>How It Works</h2>
          <span className="divider" />
        </div>

        <div style={{ display:'grid', gap:20, gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))' }}>
          {steps.map((s) => (
            <div key={s.n} className="step-card halo" style={{ padding:'32px 26px', textAlign:'center', position:'relative', opacity:0 }}>
              <span style={{
                position:'absolute', top:14, right:18,
                fontFamily:'"Syne",system-ui,sans-serif',
                fontSize:'3rem', fontWeight:800,
                color:'rgba(255,107,34,.06)', userSelect:'none',
              }}>{s.n}</span>

              <div style={{ display:'flex', justifyContent:'center', marginBottom:16 }}>
                <div className="icon-sq">{s.icon}</div>
              </div>
              <h3 style={{ fontFamily:'"Syne",system-ui,sans-serif', fontWeight:700, fontSize:'.95rem', color:'#f0eff5', marginBottom:8 }}>{s.title}</h3>
              <p style={{ fontFamily:'"DM Sans",system-ui,sans-serif', color:'#5a5a7a', fontSize:'.84rem', lineHeight:1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
