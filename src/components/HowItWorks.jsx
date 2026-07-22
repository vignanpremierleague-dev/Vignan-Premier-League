import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'
import { UserPlus, Gavel, Users, Trophy } from 'lucide-react'

const steps = [
  { n: '01', icon: <UserPlus size={22} />, title: 'Register', desc: 'Register online and pay Rs. 300 to enter the player pool.' },
  { n: '02', icon: <Gavel size={22} />, title: 'Auction', desc: 'Faculty team owners bid for players in a live auction.' },
  { n: '03', icon: <Users size={22} />, title: 'Get Drafted', desc: 'Join your team and prepare for the tournament.' },
  { n: '04', icon: <Trophy size={22} />, title: 'Play & Win', desc: 'Compete in 8 over format and chase the VPL trophy.' },
]

export default function HowItWorks() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animate(sectionRef.current.querySelectorAll('.step-card'), {
            opacity: [0, 1],
            translateY: [50, 0],
            scale: [0.94, 1],
            delay: stagger(90, { start: 60 }),
            duration: 600,
            ease: 'outExpo',
          })
          observer.disconnect()
        }
      },
      { threshold: 0.12 },
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="how-it-works" ref={sectionRef} style={{ padding: '100px 0', background: '#06060a' }}>
      <div className="wrap">
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 className="section-heading fire-text" style={{ marginBottom: 8 }}>How It Works</h2>
          <span className="divider" />
          <p style={{ fontFamily: '"DM Sans",system-ui,sans-serif', color: '#8b8b8b', fontSize: '.9rem', maxWidth: 540, margin: '14px auto 0', lineHeight: 1.7 }}>
            Four simple stages from registration to match day.
          </p>
        </div>

        <div className="hiw-grid">
          {steps.map((s) => (
            <div key={s.n} className="step-card hiw-card">
              <div className="hiw-top">
                <span className="hiw-number">{s.n}</span>
                <span className="hiw-line" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <div className="hiw-icon">
                  {s.icon}
                </div>
              </div>

              <h3 className="hiw-title">{s.title}</h3>
              <p className="hiw-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .hiw-grid {
          display:grid;
          gap:18px;
          grid-template-columns:repeat(4, minmax(0, 1fr));
        }
        .hiw-card {
          padding:24px 20px;
          min-height:246px;
          border-radius:18px;
          border:1px solid rgba(255,255,255,.08);
          background:rgba(18,18,18,.92);
          text-align:center;
          opacity:0;
        }
        .hiw-top {
          display:flex;
          align-items:center;
          gap:10px;
          margin-bottom:14px;
        }
        .hiw-number {
          min-width:34px;
          height:24px;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          border-radius:999px;
          border:1px solid rgba(255,107,34,.35);
          background:rgba(255,107,34,.1);
          color:#ff6b22;
          font-family:"Syne",system-ui,sans-serif;
          font-size:.72rem;
          font-weight:700;
          letter-spacing:.08em;
        }
        .hiw-line {
          flex:1;
          height:1px;
          background:linear-gradient(90deg, rgba(255,107,34,.35), rgba(255,107,34,0));
        }
        .hiw-icon {
          width:52px;
          height:52px;
          border-radius:14px;
          background:rgba(255,107,34,.12);
          border:1px solid rgba(255,107,34,.25);
          display:flex;
          align-items:center;
          justify-content:center;
          color:#ff6b22;
          margin:0 auto;
        }
        .hiw-title {
          font-family:"Syne",system-ui,sans-serif;
          font-weight:700;
          font-size:1rem;
          color:#efefef;
          margin-bottom:10px;
        }
        .hiw-desc {
          font-family:"DM Sans",system-ui,sans-serif;
          color:#8b8b8b;
          font-size:.84rem;
          line-height:1.72;
        }
        @media(max-width:1024px) {
          .hiw-grid { grid-template-columns:repeat(2, minmax(0, 1fr)); }
        }
        @media(max-width:560px) {
          .hiw-grid { grid-template-columns:1fr; }
          .hiw-card { min-height:auto; }
        }
      `}</style>
    </section>
  )
}
