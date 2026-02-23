import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'
import { Phone, Mail, Instagram, MapPin } from 'lucide-react'

const contacts = [
  { icon:<Phone     size={20} color="#ff6b22"/>, label:'WhatsApp',   text:'+91 863 942 6318',              href:'https://chat.whatsapp.com/L7HXdLMblNRGTNwJbMZPVE?mode=gi_t' },
  { icon:<Mail      size={20} color="#ff6b22"/>, label:'Email',      text:'vignanpremierleague@gmail.com',             href:'mailto:vignanpremierleague@gmail.com' },
  { icon:<Instagram size={20} color="#ff6b22"/>, label:'Instagram',  text:'@vignanpremierleague',         href:'https://instagram.com/vignanpremierleague' },
  { icon:<MapPin    size={20} color="#ff6b22"/>, label:'Location',   text:'Vignan University', href:'https://www.google.com/maps/place/Vignan+University/@17.3425484,78.6787552,14z/data=!4m10!1m2!2m1!1svignan+university+hyderabad!3m6!1s0x3bcb0b001c75ae6b:0xc419a613794f4d3e!8m2!3d17.3425484!4d78.716864!15sCht2aWduYW4gdW5pdmVyc2l0eSBoeWRlcmFiYWRaHSIbdmlnbmFuIHVuaXZlcnNpdHkgaHlkZXJhYmFkkgEKdW5pdmVyc2l0eZoBJENoZERTVWhOTUc5blMwVkpRMEZuU1VRM2RqWk1lbk4zUlJBQuABAPoBBAgkEEk!16s%2Fg%2F11y5_pf7ww?entry=ttu&g_ep=EgoyMDI2MDIxOC4wIKXMDSoASAFQAw%3D%3D' },
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
    <section id="contact" ref={sectionRef} style={{ padding:'100px 0', background:'#0f0f0f' }}>
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
                <p style={{ fontFamily:'"DM Sans"', color:'#7a7a7a', fontSize:'.68rem', textTransform:'uppercase', letterSpacing:'.12em', fontWeight:600 }}>{c.label}</p>
                <p style={{ fontFamily:'"DM Sans"', color:'#d0d0d0', fontWeight:600, fontSize:'.875rem', marginTop:3 }}>{c.text}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
