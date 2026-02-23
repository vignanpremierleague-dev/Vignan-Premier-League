import { motion } from 'framer-motion'
import * as Accordion from '@radix-ui/react-accordion'
import { ChevronDown, Ban, Calendar, AlertOctagon, CalendarClock, Gavel } from 'lucide-react'

const terms = [
  { icon:<Ban size={13} color="#ff6b22"/>,          title:'Fee Policy',         body:'The ₹400 registration fee is non-refundable under any circumstances.' },
  { icon:<Calendar size={13} color="#ff6b22"/>,     title:'Auction Attendance', body:'All registered players must attend the auction ceremony or forfeit their fee.' },
  { icon:<AlertOctagon size={13} color="#ff6b22"/>, title:'Code of Conduct',    body:'Misconduct of any kind leads to immediate disqualification.' },
  { icon:<CalendarClock size={13} color="#ff6b22"/>,title:'Schedule Changes',   body:'Tournament dates may change. All schedule changes communicated in advance.' },
  { icon:<Gavel size={13} color="#ff6b22"/>,        title:'Dispute Resolution', body:"The organizing committee's decision is final and binding in all disputes." },
]

export default function Terms() {
  return (
    <section style={{ padding:'100px 0', background:'#06060a' }}>
      <div className="wrap" style={{ maxWidth:680 }}>
        <motion.div
          initial={{ opacity:0, y:25 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true, margin:'-80px' }} transition={{ duration:.5 }}
          style={{ textAlign:'center', marginBottom:56 }}
        >
          <h2 className="section-heading fire-text" style={{ marginBottom:8 }}>Terms & Conditions</h2>
          <span className="divider" />
        </motion.div>

        <motion.div
          initial={{ opacity:0 }} whileInView={{ opacity:1 }}
          viewport={{ once:true }} transition={{ duration:.5, delay:.2 }}
        >
          <Accordion.Root type="single" collapsible style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {terms.map((t, i) => (
              <Accordion.Item key={i} value={`t${i}`}>
                <Accordion.Trigger className="acc-trigger">
                  <span style={{ display:'flex', alignItems:'center', gap:10 }}>{t.icon} {t.title}</span>
                  <ChevronDown size={15} className="chev" />
                </Accordion.Trigger>
                <Accordion.Content className="acc-content">
                  <p style={{ padding:'14px 20px', fontFamily:'"DM Sans",system-ui,sans-serif', color:'#5a5a7a', fontSize:'.875rem', lineHeight:1.75 }}>{t.body}</p>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </motion.div>
      </div>
    </section>
  )
}
