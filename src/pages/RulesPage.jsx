import { useState, useEffect } from 'react'
import { Flame, Clock, Users, Scale, GraduationCap, ScrollText, ChevronDown } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

/* ── Rules data ─────────────────────────────────────────────────────────────── */
const rules = [
  {
    icon: <Clock size={18} color="#ff6b22" />,
    title: 'Match Format',
    summary: 'T10, 10 overs per side, 90-minute window',
    items: [
      'T10 format — 10 overs per side.',
      'Standard ICC cricket rules apply.',
      'Powerplay: first 2 overs with field restrictions.',
      'Match must complete within 90 minutes.',
      'In the event of a tie, a Super Over will decide the winner.',
      'DLS method applies for rain-interrupted matches.',
    ],
  },
  {
    icon: <Users size={18} color="#ff6b22" />,
    title: 'Team Composition',
    summary: '11 players + 2 substitutes via auction',
    items: [
      '11 playing members + 2 substitutes per team.',
      'Players are drafted exclusively through the auction.',
      'Players may not refuse their selection after being bought.',
      'Substitutes can only field — they cannot bat or bowl.',
      'A minimum of 8 players must be present to start a match.',
      'Team captains must be registered before the auction.',
    ],
  },
  {
    icon: <Scale size={18} color="#ff6b22" />,
    title: 'Fair Play & Conduct',
    summary: 'Umpire decisions are final — misconduct is penalised',
    items: [
      'Umpire decisions are final and binding in all cases.',
      'Verbal or physical misconduct results in an immediate warning.',
      'Two warnings lead to tournament disqualification.',
      'Spirit of cricket must be upheld at all times.',
      'Deliberate time-wasting will result in penalty runs.',
      'Teams are responsible for the behaviour of their supporters.',
      'Any attempts to tamper with pitch or equipment are strictly banned.',
    ],
  },
  {
    icon: <GraduationCap size={18} color="#ff6b22" />,
    title: 'Eligibility',
    summary: 'Vignan University students only, one registration per player',
    items: [
      'Must be an active student of Vignan University.',
      'Valid student ID card required at registration.',
      'Faculty members are team owners only — they cannot play.',
      'One registration per player; dual registration is disallowed.',
      'Players must be present during the auction to be eligible.',
      'Outgoing students or those with backlogs may be ineligible.',
    ],
  },
  {
    icon: <ScrollText size={18} color="#ff6b22" />,
    title: 'General Rules',
    summary: 'Schedule, disputes, and logistics',
    items: [
      "Match schedule is subject to change at organisers' discretion.",
      'Organisers reserve the right to amend rules as needed.',
      'All disputes are resolved by the organising committee.',
      'Players must arrive at least 15 minutes before their match.',
      'Proper cricket attire is mandatory for all matches.',
      'Use of banned substances results in immediate disqualification.',
      'Results announced by the organising committee are final.',
    ],
  },
]

/* ── Helpers ────────────────────────────────────────────────────────────────── */
function useFadeIn(delay = 0) {
  const [v, setV] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setV(true), delay)
    return () => clearTimeout(t)
  }, [delay])
  return v
}

/* ── Rule Card (expandable) ─────────────────────────────────────────────────── */
function RuleCard({ rule, index }) {
  const [open, setOpen] = useState(index === 0)
  const visible = useFadeIn(100 + index * 80)

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(16px)',
      transition: 'opacity .5s ease, transform .5s ease',
      border: '1px solid rgba(255,255,255,.08)',
      borderRadius: 16,
      background: 'rgba(18,18,18,.9)',
      overflow: 'hidden',
    }}>
      {/* Header row */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 16,
          padding: '18px 20px',
          background: open ? 'rgba(255,107,34,.06)' : 'none',
          borderLeft: open ? '3px solid #ff6b22' : '3px solid transparent',
          border: 'none', cursor: 'pointer', textAlign: 'left',
          transition: 'background .25s, border-left-color .25s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: 'rgba(255,107,34,.1)', border: '1px solid rgba(255,107,34,.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{rule.icon}</div>
          <div>
            <p style={{ fontFamily: '"Syne",system-ui,sans-serif', fontWeight: 800, fontSize: '.95rem', color: '#efefef', margin: 0 }}>
              {rule.title}
            </p>
            <p style={{ fontFamily: '"DM Sans",system-ui,sans-serif', fontSize: '.78rem', color: '#a3a3a3', margin: '3px 0 0' }}>
              {rule.summary}
            </p>
          </div>
        </div>
        <ChevronDown size={17} color="#ff6b22" style={{
          flexShrink: 0,
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform .3s ease',
        }} />
      </button>

      {/* Body */}
      <div style={{
        maxHeight: open ? 600 : 0,
        overflow: 'hidden',
        transition: 'max-height .35s cubic-bezier(.16,1,.3,1)',
      }}>
        <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', padding: '18px 20px 22px' }}>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 11 }}>
            {rule.items.map((item, j) => (
              <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#ff6b22', marginTop: 7, flexShrink: 0,
                }} />
                <span style={{
                  color: '#f0f0f0', fontSize: '.86rem',
                  fontFamily: '"DM Sans",system-ui,sans-serif',
                  lineHeight: 1.65,
                }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

/* ── Page ───────────────────────────────────────────────────────────────────── */
export default function RulesPage() {
  const headVis = useFadeIn(60)

  return (
    <div style={{
      minHeight: '100vh', background: '#070707',
      fontFamily: '"DM Sans",system-ui,sans-serif', color: '#efefef',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient orbs */}
      <div style={{ position: 'fixed', top: '-12%', right: '-8%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,107,34,.05) 0%,transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-10%', left: '-10%', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle,rgba(230,57,70,.04) 0%,transparent 65%)', pointerEvents: 'none' }} />

      <Navbar breadcrumb="Rules" />

      {/* Content */}
      <main style={{ flex: 1, maxWidth: 820, width: '100%', margin: '0 auto', padding: '56px 20px 72px', position: 'relative', zIndex: 1 }}>

        {/* Page heading */}
        <div style={{
          opacity: headVis ? 1 : 0, transform: headVis ? 'translateY(0)' : 'translateY(-18px)',
          transition: 'all .6s ease', textAlign: 'center', marginBottom: 56,
        }}>
          
          <h1 style={{
            fontFamily: '"Syne",system-ui,sans-serif',
            fontSize: 'clamp(1.8rem,5vw,3rem)', fontWeight: 900, color: '#efefef',
            margin: '0 0 12px', lineHeight: 1.1,
          }}>Rules & Regulations</h1>

          <p style={{ color: '#bbb', fontSize: '.88rem', lineHeight: 1.75, maxWidth: 500, margin: '0 auto' }}>
            All participants are expected to read and comply with the official VPL guidelines. Ignorance of the rules is not accepted as an excuse.
          </p>

          <div style={{ width: 48, height: 3, background: 'linear-gradient(90deg,#ff6b22,#e63946)', borderRadius: 2, margin: '20px auto 0' }} />
        </div>

        {/* Rule cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rules.map((r, i) => <RuleCard key={r.title} rule={r} index={i} />)}
        </div>

        {/* Disclaimer note */}
        <div style={{
          marginTop: 40,
          padding: '18px 20px',
          background: 'rgba(255,107,34,.05)',
          border: '1px solid rgba(255,107,34,.18)',
          borderRadius: 16,
          display: 'flex', gap: 14, alignItems: 'flex-start',
        }}>
          <Flame size={17} color="#ff6b22" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{
            fontFamily: '"DM Sans"', fontSize: '.88rem',
            color: '#bbb', lineHeight: 1.6, margin: 0,
          }}>
            <strong style={{ color: '#efefef' }}>Note:</strong> The Organising Committee reserves the right to modify any rule at any point. Changes will be announced to all participants in advance. For queries, contact the event coordinator before match day.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
