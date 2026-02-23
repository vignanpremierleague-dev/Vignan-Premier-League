import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const stages = [
  { label:'League Stage', matches:[
    { m:'Match 1', t1:'Team A', t2:'Team B' }, { m:'Match 2', t1:'Team C', t2:'Team D' },
    { m:'Match 3', t1:'Team A', t2:'Team C' }, { m:'Match 4', t1:'Team B', t2:'Team D' },
    { m:'Match 5', t1:'Team A', t2:'Team D' }, { m:'Match 6', t1:'Team B', t2:'Team C' },
  ]},
  { label:'Knockout', matches:[
    { m:'Semi-Final 1', t1:'TBD', t2:'TBD' }, { m:'Semi-Final 2', t1:'TBD', t2:'TBD' },
  ]},
  { label:'Finals', matches:[
    { m:'Grand Finale', t1:'TBD', t2:'TBD' },
  ]},
]

export default function Schedule() {
  const tableRefs = useRef([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      tableRefs.current.forEach((el, i) => {
        if (!el) return
        gsap.fromTo(el,
          { opacity:0, y:30 },
          { opacity:1, y:0, duration:.6, delay:i*.12, ease:'power2.out',
            scrollTrigger:{ trigger:el, start:'top 88%', once:true } }
        )
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <section id="schedule" style={{ padding:'100px 0', background:'#0f0f0f' }}>
      <div className="wrap">
        <div style={{ textAlign:'center', marginBottom:52 }}>
          <h2 className="section-heading fire-text" style={{ marginBottom:8 }}>Schedule &amp; Fixtures</h2>
          <span className="divider" />
          <p style={{ fontFamily:'"DM Sans",system-ui,sans-serif', color:'#8c8c8c', fontSize:'.83rem', marginTop:14 }}>
            Dates &amp; teams will be confirmed after the player auction
          </p>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:20, maxWidth:780, margin:'0 auto' }}>
          {stages.map((stage, si) => (
            <div key={stage.label} ref={el => tableRefs.current[si] = el} className="sched-card" style={{ opacity:0 }}>
              {/* Stage header */}
              <div style={{ padding:'12px 20px', borderBottom:'1px solid rgba(255,255,255,.07)', display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:'#ff6b22', flexShrink:0, boxShadow:'0 0 8px rgba(255,107,34,.5)' }}/>
                <span style={{ fontFamily:'"Syne",system-ui,sans-serif', fontWeight:700, fontSize:'.88rem', color:'#ff6b22' }}>{stage.label}</span>
              </div>

              {/* Desktop table */}
              <table className="sched-table" style={{ width:'100%', borderCollapse:'collapse', fontFamily:'"DM Sans",system-ui,sans-serif', fontSize:'.85rem' }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid rgba(255,255,255,.06)' }}>
                    {['Match','Team 1','','Team 2','Date'].map((h, i) => (
                      <th key={i} style={{ padding:'10px 18px', textAlign:'left', color:'#8a8a8a', fontWeight:600, fontSize:'.7rem', textTransform:'uppercase', letterSpacing:'.1em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stage.matches.map((m, mi) => (
                    <tr key={mi} className="tbl-row">
                      <td style={{ padding:'13px 18px', fontWeight:600, color:'#d2d2d2' }}>{m.m}</td>
                      <td style={{ padding:'13px 18px', color:'#aaaaaa' }}>{m.t1}</td>
                      <td style={{ padding:'8px 6px', color:'#ff6b22', fontWeight:800, fontSize:'.7rem', textAlign:'center' }}>VS</td>
                      <td style={{ padding:'13px 18px', color:'#aaaaaa' }}>{m.t2}</td>
                      <td style={{ padding:'13px 18px', color:'#f5a100', fontWeight:600 }}>TBD</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile cards */}
              <div className="sched-mobile">
                {stage.matches.map((m, mi) => (
                  <div key={mi} style={{ padding:'14px 18px', borderBottom: mi < stage.matches.length - 1 ? '1px solid rgba(255,255,255,.05)' : 'none' }}>
                    <p style={{ fontFamily:'"Syne"', fontSize:'.75rem', fontWeight:700, color:'#ff6b22', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:8 }}>{m.m}</p>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <span style={{ fontFamily:'"DM Sans"', color:'#b8b8b8', fontWeight:600, flex:1, textAlign:'right' }}>{m.t1}</span>
                      <span style={{ fontFamily:'"DM Sans"', color:'#ff6b22', fontWeight:800, fontSize:'.72rem', padding:'2px 8px', background:'rgba(255,107,34,.1)', borderRadius:6 }}>VS</span>
                      <span style={{ fontFamily:'"DM Sans"', color:'#b8b8b8', fontWeight:600, flex:1 }}>{m.t2}</span>
                    </div>
                    <p style={{ fontFamily:'"DM Sans"', color:'#f5a100', fontSize:'.75rem', fontWeight:600, marginTop:6 }}>Date: TBD</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .sched-card {
          background: rgba(18,18,18,.92);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 16px;
          overflow: hidden;
        }
        .sched-table { display: table; width: 100%; }
        .sched-mobile { display: none; }
        .tbl-row:not(:last-child) { border-bottom: 1px solid rgba(255,255,255,.04); }
        .tbl-row:hover { background: rgba(255,255,255,.02); }
      `}</style>
    </section>
  )
}
