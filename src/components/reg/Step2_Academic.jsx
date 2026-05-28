import { fieldStyle, labelStyle, errorStyle, FocusSelect } from './fieldStyles'

const YEARS   = [{ v:'1', l:'1st Year' }, { v:'2', l:'2nd Year' }, { v:'3', l:'3rd Year' }, { v:'4', l:'4th Year' }]
const COURSES = [{ v:'btech', l:'B.Tech' }, { v:'mtech', l:'M.Tech' }, { v:'mba', l:'MBA' }, { v:'bba', l:'BBA' }, { v:'pharma', l:'Pharma' }]
const BRANCHES= [{ v:'cse', l:'CSE' }, { v:'ece', l:'ECE' }, { v:'ds', l:'Data Science' }, { v:'aiml', l:'AI & ML' }, { v:'cs', l:'Cybersecurity' }, { v:'bt', l:'Biotechnology' }, { v:'bi', l:'Bioinformatics' }]
const SECS    = ['A','B','C','D']

export default function Step2_Academic({ data, setData, errors }) {
  const set = k => e => setData(prev => ({ ...prev, [k]: e.target.value }))

  return (
    <div>
      <h3 className="step-title">Academic Details</h3>
      <p className="step-desc">Select your current academic year, programme, branch and section.</p>

      <div className="form-grid-2">
        <div style={fieldStyle}>
          <label style={labelStyle}>Year *</label>
          <FocusSelect value={data.year} onChange={set('year')}>
            <option value="">Select year</option>
            {YEARS.map(y => <option key={y.v} value={y.v}>{y.l}</option>)}
          </FocusSelect>
          {errors.year && <span style={errorStyle}>{errors.year}</span>}
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Course *</label>
          <FocusSelect value={data.course} onChange={set('course')}>
            <option value="">Select course</option>
            {COURSES.map(c => <option key={c.v} value={c.v}>{c.l}</option>)}
          </FocusSelect>
          {errors.course && <span style={errorStyle}>{errors.course}</span>}
        </div>
      </div>

      <div className="form-grid-2">
        <div style={fieldStyle}>
          <label style={labelStyle}>Branch *</label>
          <FocusSelect value={data.branch} onChange={set('branch')}>
            <option value="">Select branch</option>
            {BRANCHES.map(b => <option key={b.v} value={b.v}>{b.l}</option>)}
          </FocusSelect>
          {errors.branch && <span style={errorStyle}>{errors.branch}</span>}
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Section *</label>
          <FocusSelect value={data.section} onChange={set('section')}>
            <option value="">Select section</option>
            {SECS.map(s => <option key={s} value={s.toLowerCase()}>{s}</option>)}
          </FocusSelect>
          {errors.section && <span style={errorStyle}>{errors.section}</span>}
        </div>
      </div>
    </div>
  )
}
