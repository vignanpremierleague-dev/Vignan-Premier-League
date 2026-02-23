import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'
import { Phone, Mail, Instagram, MapPin } from 'lucide-react'

const contacts = [
  { icon:<Phone     size={20} color="#ff6b22"/>, label:'WhatsApp',   text:'+91 XXXXX XXXXX',              href:'https://wa.me/91XXXXXXXXXX' },
  { icon:<Mail      size={20} color="#ff6b22"/>, label:'Email',      text:'vpl@vignan.ac.in',             href:'mailto:vpl@vignan.ac.in' },
  { icon:<Instagram size={20} color="#ff6b22"/>, label:'Instagram',  text:'@vignanpremierleague',         href:'https://instagram.com/vignanpremierleague' },
  { icon:<MapPin    size={20} color="#ff6b22"/>, label:'Location',   text:'Vignan Campus Cricket Ground', href:'#' },
]

export default function Contact() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animate(sectionRef.current.querySelectorAll('.contact-card'), {
          opacity: [0, 1],
          translateY: [30, 0],
          delay: stagger(80),
          duration: 600,
          ease: 'outExpo',
        })
        observer.disconnect()
      }
    }, { threshold:.2 })
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="contact" ref={sectionRef} style={{ padding:'100px 0', background:'#0c0c14' }}>
      <div className="wrap">
        <div style={{ textAlign:'center', marginBottom:56 }}>
          <h2 className="section-heading fire-text" style={{ marginBottom:8 }}>Get In Touch</h2>
          <span className="divider" />
        </div>

        <div style={{
          display:'grid', gap:16,
          gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',
          maxWidth:660, margin:'0 auto',
        }}>
          {contacts.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target={c.href.startsWith('http') ? '_blank' : undefined}
              rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="contact-card halo"
              style={{ padding:'20px 22px', display:'flex', alignItems:'center', gap:16, textDecoration:'none', opacity:0 }}
            >
              <div className="icon-sq" style={{ width:46, height:46, borderRadius:12 }}>{c.icon}</div>
              <div>
                <p style={{ fontFamily:'"DM Sans"', color:'#2a2a4a', fontSize:'.68rem', textTransform:'uppercase', letterSpacing:'.12em', fontWeight:600 }}>{c.label}</p>
                <p style={{ fontFamily:'"DM Sans"', color:'#c4c3da', fontWeight:600, fontSize:'.875rem', marginTop:3 }}>{c.text}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
