import { fieldStyle, labelStyle, errorStyle, FocusSelect } from './fieldStyles'

const ROLES = [
  { v:'batsman',              l:'Batsman' },
  { v:'bowler',               l:'Bowler' },
  { v:'wicket_keeper_batsman',l:'Wicket Keeper Batsman' },
  { v:'all_rounder',          l:'All Rounder' },
]

const needsBatting = r => ['batsman','wicket_keeper_batsman','all_rounder'].includes(r)
const needsBowling = r => ['bowler','all_rounder'].includes(r)

export default function Step3_Role({ data, setData, errors }) {
  const set = k => e => setData(prev => ({ ...prev, [k]: e.target.value }))

  const handleRole = e => {
    const role = e.target.value
    setData(prev => ({
      ...prev,
      role,
      batting_side: needsBatting(role) ? prev.batting_side : '',
      bowling_arm:  needsBowling(role) ? prev.bowling_arm  : '',
      bowling_type: needsBowling(role) ? prev.bowling_type : '',
    }))
  }

  return (
    <div>
      <h3 style={{ fontFamily: '"Syne",system-ui,sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#f0eff5', marginBottom: 6 }}>
        Role & Skills
      </h3>
      <p style={{ fontFamily: '"DM Sans"', color: '#5a5a7a', fontSize: '.84rem', marginBottom: 28, lineHeight: 1.6 }}>
        Select your primary role. Conditional fields will appear based on your selection.
      </p>

      {/* Role */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Playing Role *</label>
        <FocusSelect value={data.role} onChange={handleRole}>
          <option value="">Select your role</option>
          {ROLES.map(r => <option key={r.v} value={r.v}>{r.l}</option>)}
        </FocusSelect>
        {errors.role && <span style={errorStyle}>{errors.role}</span>}
      </div>

      {/* Batting side */}
      {needsBatting(data.role) && (
        <div style={fieldStyle}>
          <label style={labelStyle}>Batting Side *</label>
          <div style={{ display: 'flex', gap: 12 }}>
            {['left','right'].map(side => (
              <label key={side} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '12px 18px', borderRadius: 10, cursor: 'pointer',
                border: `1.5px solid ${data.batting_side === side ? '#ff6b22' : 'rgba(255,255,255,.08)'}`,
                background: data.batting_side === side ? 'rgba(255,107,34,.08)' : 'rgba(255,255,255,.03)',
                fontFamily: '"DM Sans"', fontSize: '.875rem', color: data.batting_side === side ? '#ff6b22' : '#5a5a7a',
                fontWeight: 600, textTransform: 'capitalize', transition: 'all .2s',
              }}>
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
            <div style={{ display: 'flex', gap: 12 }}>
              {['left','right'].map(arm => (
                <label key={arm} style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  padding: '12px 18px', borderRadius: 10, cursor: 'pointer',
                  border: `1.5px solid ${data.bowling_arm === arm ? '#ff6b22' : 'rgba(255,255,255,.08)'}`,
                  background: data.bowling_arm === arm ? 'rgba(255,107,34,.08)' : 'rgba(255,255,255,.03)',
                  fontFamily: '"DM Sans"', fontSize: '.875rem', color: data.bowling_arm === arm ? '#ff6b22' : '#5a5a7a',
                  fontWeight: 600, textTransform: 'capitalize', transition: 'all .2s',
                }}>
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
            <div style={{ display: 'flex', gap: 12 }}>
              {[{ v:'spinner', l:'Spinner' }, { v:'medium_fast', l:'Medium Fast' }].map(t => (
                <label key={t.v} style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '12px 18px', borderRadius: 10, cursor: 'pointer',
                  border: `1.5px solid ${data.bowling_type === t.v ? '#ff6b22' : 'rgba(255,255,255,.08)'}`,
                  background: data.bowling_type === t.v ? 'rgba(255,107,34,.08)' : 'rgba(255,255,255,.03)',
                  fontFamily: '"DM Sans"', fontSize: '.875rem', color: data.bowling_type === t.v ? '#ff6b22' : '#5a5a7a',
                  fontWeight: 600, transition: 'all .2s',
                }}>
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
