import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'
import { Timer, Gavel, MapPin } from 'lucide-react'

const stats = [
  { icon:<Timer size={22} color="#ff6b22"/>, title:'T10 Format',       desc:'10 overs of explosive cricket action per side — fast, intense, non-stop.' },
  { icon:<Gavel size={22} color="#ff6b22"/>, title:'Faculty Auctions', desc:'Faculty bid for students in a live IPL-style auction ceremony.' },
  { icon:<MapPin size={22} color="#ff6b22"/>, title:'Vignan Ground',   desc:'All matches at the official Vignan campus cricket ground.' },
]

export default function About() {
  const cardsRef = useRef([])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animate(cardsRef.current.filter(Boolean), {
            opacity: [0, 1],
            translateY: [50, 0],
            delay: stagger(120),
            duration: 700,
            ease: 'outExpo',
          })
          observer.disconnect()
        }
      })
    }, { threshold: .2 })
    if (cardsRef.current[0]) observer.observe(cardsRef.current[0])
    return () => observer.disconnect()
  }, [])

  return (
    <section id="about" style={{ padding:'100px 0', background:'#06060a', position:'relative' }}>
      {/* Subtle orb */}
      <div style={{
        position:'absolute', top:'-20%', right:'-10%',
        width:500, height:500, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(255,107,34,.06) 0%, transparent 70%)',
        pointerEvents:'none',
      }} />
      <div className="wrap">
        <div style={{ textAlign:'center', marginBottom:64 }}>
          <h2 className="section-heading fire-text" style={{ marginBottom:8 }}>About VPL</h2>
          <span className="divider" />
          <p style={{ fontFamily:'"DM Sans",system-ui,sans-serif', color:'#8b8b8b', maxWidth:580, margin:'20px auto 0', lineHeight:1.8, fontSize:'.95rem' }}>
            The <strong style={{ color:'#ff6b22', fontWeight:600 }}>Vignan Premier League</strong> is a college cricket tournament like no other. Players attend a live auction where faculty act as team owners, drafting their squads. Teams then battle in the electrifying T10 format.
          </p>
        </div>

        <div style={{ display:'grid', gap:22, gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))' }}>
          {stats.map((s, i) => (
            <div key={s.title} ref={el => cardsRef.current[i] = el} className="halo" style={{ padding:'36px 30px', textAlign:'center', opacity:0 }}>
              <div style={{ display:'flex', justifyContent:'center', marginBottom:18 }}>
                <div className="icon-sq">{s.icon}</div>
              </div>
              <h3 style={{ fontFamily:'"Syne",system-ui,sans-serif', fontWeight:700, fontSize:'1.05rem', color:'#efefef', marginBottom:10 }}>{s.title}</h3>
              <p style={{ fontFamily:'"DM Sans",system-ui,sans-serif', color:'#8b8b8b', fontSize:'.875rem', lineHeight:1.75 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
