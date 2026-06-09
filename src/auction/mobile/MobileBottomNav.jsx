import { Flame, Users, Shield } from 'lucide-react'
import { C } from '../tokens'

const TABS = [
  { id: 'pool',  label: 'Up Next', Icon: Users  },
  { id: 'live',  label: 'Live',    Icon: Flame  },
  { id: 'teams', label: 'Teams',   Icon: Shield },
]

export default function MobileBottomNav({ activeTab, onTabChange }) {
  return (
    <div style={{
      height: 60,
      flexShrink: 0,
      background: 'rgba(11,11,11,0.97)',
      borderTop: `1px solid ${C.border}`,
      display: 'flex', alignItems: 'stretch',
    }}>
      {TABS.map(({ id, label, Icon }) => {
        const active = activeTab === id
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 4,
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: '8px 0',
              transition: 'opacity .15s',
              position: 'relative',
            }}
          >
            {/* Active indicator line */}
            {active && (
              <div style={{
                position: 'absolute', top: 0, left: '25%', right: '25%',
                height: 2, borderRadius: 2,
                background: C.orange,
              }} />
            )}
            <Icon size={18} color={active ? C.orange : C.textMuted} strokeWidth={active ? 2.5 : 1.8} />
            <span style={{
              fontSize: '.64rem', fontWeight: 700, letterSpacing: '.04em',
              color: active ? C.orange : C.textMuted,
              textTransform: 'uppercase',
            }}>{label}</span>
          </button>
        )
      })}
    </div>
  )
}
