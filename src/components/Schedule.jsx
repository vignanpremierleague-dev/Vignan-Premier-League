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
    <section id="schedule" style={{ padding:'100px 0', background:'#0c0c14' }}>
      <div className="wrap">
        <div style={{ textAlign:'center', marginBottom:56 }}>
          <h2 className="section-heading fire-text" style={{ marginBottom:8 }}>Schedule & Fixtures</h2>
          <span className="divider" />
          <p style={{ fontFamily:'"DM Sans",system-ui,sans-serif', color:'#3a3a5a', fontSize:'.8rem', marginTop:14 }}>
            Dates & teams will be confirmed after the player auction
          </p>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:20, maxWidth:780, margin:'0 auto' }}>
          {stages.map((stage, si) => (
            <div key={stage.label} ref={el => tableRefs.current[si] = el} className="halo" style={{ overflow:'hidden', opacity:0 }}>
              <div style={{ padding:'12px 22px', borderBottom:'1px solid rgba(255,255,255,.04)', display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:'#ff6b22', flexShrink:0, boxShadow:'0 0 8px rgba(255,107,34,.5)' }}/>
                <span style={{ fontFamily:'"Syne",system-ui,sans-serif', fontWeight:700, fontSize:'.85rem', color:'#ff6b22' }}>{stage.label}</span>
              </div>
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:'"DM Sans",system-ui,sans-serif', fontSize:'.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom:'1px solid rgba(255,255,255,.04)' }}>
                      {['Match','Team 1','','Team 2','Date'].map((h, i) => (
                        <th key={i} style={{ padding:'10px 20px', textAlign:'left', color:'#2a2a4a', fontWeight:600, fontSize:'.7rem', textTransform:'uppercase', letterSpacing:'.1em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stage.matches.map((m, mi) => (
                      <tr key={mi} className="tbl-row">
                        <td style={{ padding:'13px 20px', fontWeight:600, color:'#c0bfd8' }}>{m.m}</td>
                        <td style={{ padding:'13px 20px', color:'#5a5a7a' }}>{m.t1}</td>
                        <td style={{ padding:'13px 8px', color:'#ff6b22', fontWeight:800, fontSize:'.72rem', textAlign:'center' }}>VS</td>
                        <td style={{ padding:'13px 20px', color:'#5a5a7a' }}>{m.t2}</td>
                        <td style={{ padding:'13px 20px', color:'#f5a100', fontWeight:600 }}>TBD</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
