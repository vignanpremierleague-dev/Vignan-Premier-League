import { AlertTriangle } from 'lucide-react'
import { fieldStyle, labelStyle, errorStyle, FocusSelect } from './fieldStyles'

const ROLES = [
  { v:'batsman',              l:'Batsman' },
  { v:'bowler',               l:'Bowler' },
  { v:'wicket_keeper_batsman',l:'Wicket Keeper Batsman' },
  { v:'all_rounder',          l:'All Rounder' },
]

const needsBatting = r => ['batsman','wicket_keeper_batsman','all_rounder'].includes(r)
const needsBowling = r => ['bowler','all_rounder'].includes(r)

const pillBase = (active) => ({
  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
  border: `1.5px solid ${active ? '#ff6b22' : 'rgba(255,255,255,.12)'}`,
  background: active ? 'rgba(255,107,34,.1)' : 'rgba(255,255,255,.04)',
  fontFamily: '"DM Sans"', fontSize: '.875rem',
  color: active ? '#ff6b22' : '#9a9a9a',
  fontWeight: 600, textTransform: 'capitalize', transition: 'all .2s',
})

export default function Step3_Role({ data, setData, errors }) {
  const set = k => e => setData(prev => ({ ...prev, [k]: e.target.value }))

  const handleRole = e => {
    const role = e.target.value
    setData(prev => ({
      ...prev, role,
      batting_side: needsBatting(role) ? prev.batting_side : '',
      bowling_arm:  needsBowling(role) ? prev.bowling_arm  : '',
      bowling_type: needsBowling(role) ? prev.bowling_type : '',
    }))
  }

  return (
    <div>
      <h3 className="step-title">Role &amp; Skills</h3>
      <p className="step-desc">Select your primary role. Extra fields will appear based on your selection.</p>

      {/* Role select */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Playing Role *</label>
        <FocusSelect value={data.role} onChange={handleRole}>
          <option value="">Select your role</option>
          {ROLES.map(r => <option key={r.v} value={r.v}>{r.l}</option>)}
        </FocusSelect>
        {errors.role && <span style={errorStyle}>{errors.role}</span>}
      </div>

      {/* Bowling action notice — shown whenever bowling is involved */}
      {needsBowling(data.role) && (
        <div style={{
          display:'flex', gap:10, padding:'13px 15px', marginBottom:18,
          background:'rgba(245,161,0,.07)', border:'1px solid rgba(245,161,0,.22)',
          borderRadius:10,
        }}>
          <AlertTriangle size={16} color="#f5a100" style={{ flexShrink:0, marginTop:1 }} />
          <p style={{ fontFamily:'"DM Sans"', color:'#c4a040', fontSize:'.8rem', lineHeight:1.6 }}>
            <strong style={{ color:'#f5a100' }}>Bowling Action Notice:</strong> Your bowling action will be
            assessed before the auction to ensure it meets fair-play standards. Players with an
            illegal throw (chucking) action will not be eligible to bowl in matches.
          </p>
        </div>
      )}

      {/* Batting side */}
      {needsBatting(data.role) && (
        <div style={fieldStyle}>
          <label style={labelStyle}>Batting Side *</label>
          <div style={{ display:'flex', gap:12 }}>
            {['left','right'].map(side => (
              <label key={side} style={pillBase(data.batting_side === side)}>
                <input type="radio" name="batting_side" value={side} checked={data.batting_side === side}
                  onChange={set('batting_side')} style={{ display:'none' }} />
                {side}-handed
              </label>
            ))}
          </div>
          {errors.batting_side && <span style={errorStyle}>{errors.batting_side}</span>}
        </div>
      )}

      {/* Bowling fields */}
      {needsBowling(data.role) && (
        <>
          <div style={fieldStyle}>
            <label style={labelStyle}>Bowling Arm *</label>
            <div style={{ display:'flex', gap:12 }}>
              {['left','right'].map(arm => (
                <label key={arm} style={pillBase(data.bowling_arm === arm)}>
                  <input type="radio" name="bowling_arm" value={arm} checked={data.bowling_arm === arm}
                    onChange={set('bowling_arm')} style={{ display:'none' }} />
                  {arm} arm
                </label>
              ))}
            </div>
            {errors.bowling_arm && <span style={errorStyle}>{errors.bowling_arm}</span>}
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Bowling Type *</label>
            <div style={{ display:'flex', gap:12 }}>
              {[{ v:'spinner', l:'Spinner' }, { v:'medium_fast', l:'Medium Fast' }].map(t => (
                <label key={t.v} style={pillBase(data.bowling_type === t.v)}>
                  <input type="radio" name="bowling_type" value={t.v} checked={data.bowling_type === t.v}
                    onChange={set('bowling_type')} style={{ display:'none' }} />
                  {t.l}
                </label>
              ))}
            </div>
            {errors.bowling_type && <span style={errorStyle}>{errors.bowling_type}</span>}
          </div>
        </>
      )}
    </div>
  )
}

