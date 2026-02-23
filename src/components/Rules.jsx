import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as Accordion from '@radix-ui/react-accordion'
import { ChevronDown, Clock, Users, Scale, GraduationCap, ScrollText } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const rules = [
  { icon:<Clock size={14} color="#ff6b22"/>, title:'Match Format', items:[
    'T10 format — 10 overs per side.',
    'Standard ICC cricket rules apply.',
    'Powerplay: first 2 overs with field restrictions.',
    'Maximum 2 overs per bowler.',
    'Match must complete within 90 minutes.',
  ]},
  { icon:<Users size={14} color="#ff6b22"/>, title:'Team Composition', items:[
    '11 playing members + 2 substitutes.',
    'Players drafted exclusively through the auction.',
    'Players may not refuse their selection.',
    'Substitutes can only field, not bat or bowl.',
  ]},
  { icon:<Scale size={14} color="#ff6b22"/>, title:'Fair Play & Conduct', items:[
    'Umpire decisions are final and binding.',
    'Misconduct results in warning then penalty.',
    'Two warnings = tournament disqualification.',
    'Spirit of cricket must be upheld at all times.',
  ]},
  { icon:<GraduationCap size={14} color="#ff6b22"/>, title:'Eligibility', items:[
    'Must be currently enrolled at Vignan.',
    'Valid student ID required at registration.',
    'Faculty are owners only—they cannot play.',
    'One registration per player.',
  ]},
  { icon:<ScrollText size={14} color="#ff6b22"/>, title:'General Rules', items:[
    'Schedule subject to change.',
    'Organizers may amend rules as needed.',
    'Disputes resolved by organizing committee.',
    'Players must arrive 30 min before match.',
  ]},
]

export default function Rules() {
  const headRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headRef.current,
        { opacity:0, y:30 },
        { opacity:1, y:0, duration:.6, ease:'power2.out',
          scrollTrigger:{ trigger:headRef.current, start:'top 85%', once:true } }
      )
    })
    return () => ctx.revert()
  }, [])

  return (
    <section id="rules" style={{ padding:'100px 0', background:'#06060a' }}>
      <div className="wrap" style={{ maxWidth:700 }}>
        <div ref={headRef} style={{ textAlign:'center', marginBottom:56, opacity:0 }}>
          <h2 className="section-heading fire-text" style={{ marginBottom:8 }}>Rules & Regulations</h2>
          <span className="divider" />
        </div>

        <Accordion.Root type="single" collapsible style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {rules.map((r, i) => (
            <Accordion.Item key={i} value={`r${i}`}>
              <Accordion.Trigger className="acc-trigger">
                <span style={{ display:'flex', alignItems:'center', gap:10 }}>{r.icon} {r.title}</span>
                <ChevronDown size={16} className="chev" />
              </Accordion.Trigger>
              <Accordion.Content className="acc-content">
                <ul style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:10 }}>
                  {r.items.map((item, j) => (
                    <li key={j} style={{ display:'flex', alignItems:'flex-start', gap:10, fontFamily:'"DM Sans",system-ui,sans-serif', color:'#5a5a7a', fontSize:'.875rem', lineHeight:1.65 }}>
                      <span style={{ width:5, height:5, borderRadius:'50%', background:'#ff6b22', marginTop:8, flexShrink:0 }}/>
                      {item}
                    </li>
                  ))}
                </ul>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </section>
  )
}
