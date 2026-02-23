import { CheckCircle } from 'lucide-react'

const ROLE_LABELS = {
  batsman: 'Batsman', bowler: 'Bowler',
  wicket_keeper_batsman: 'Wicket Keeper Batsman', all_rounder: 'All Rounder',
}
const COURSE_LABELS = { btech:'B.Tech', mtech:'M.Tech', mba:'MBA', bba:'BBA', pharma:'Pharma' }
const BRANCH_LABELS = { cse:'CSE', ece:'ECE', bt_bi:'BT & BI', ds:'Data Science', aiml:'AI & ML' }

function Row({ label, value }) {
  if (!value) return null
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,.04)' }}>
      <span style={{ fontFamily:'"DM Sans"', color:'#8a8a8a', fontSize:'.76rem', textTransform:'uppercase', letterSpacing:'.09em', fontWeight:600, flexShrink:0 }}>{label}</span>
      <span style={{ fontFamily:'"DM Sans"', color:'#d4d4d4', fontSize:'.875rem', fontWeight:500, textAlign:'right', wordBreak:'break-all' }}>{value}</span>
    </div>
  )
}

export default function Step5_Confirm({ data, submitting, submitError }) {
  return (
    <div>
      <h3 className="step-title">Review & Submit</h3>
      <p className="step-desc">Verify all details. You cannot edit after submitting.</p>

      {/* Player photo preview */}
      {data.photo_url && (
        <div style={{ display:'flex', justifyContent:'center', marginBottom:20 }}>
          <div style={{ textAlign:'center' }}>
            <img src={data.photo_url} alt="Player"
              style={{ width:80, height:80, borderRadius:'50%', objectFit:'cover', border:'2px solid rgba(255,107,34,.4)', marginBottom:6 }} />
            <p style={{ fontFamily:'"DM Sans"', color:'#8a8a8a', fontSize:'.72rem', textTransform:'uppercase', letterSpacing:'.1em' }}>Auction Photo</p>
          </div>
        </div>
      )}

      {/* Summary */}
      <div style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)', borderRadius:14, padding:'4px 16px', marginBottom:18 }}>
        <Row label="Reg ID"   value={data.registration_id?.toUpperCase()} />
        <Row label="Name"     value={data.name} />
        <Row label="Phone"    value={data.phone} />
        <Row label="Email"    value={data.email} />
        <Row label="Year"     value={data.year ? `${data.year} year` : ''} />
        <Row label="Course"   value={COURSE_LABELS[data.course]} />
        <Row label="Branch"   value={BRANCH_LABELS[data.branch]} />
        <Row label="Section"  value={data.section?.toUpperCase()} />
        <Row label="Role"     value={ROLE_LABELS[data.role]} />
        {data.batting_side  && <Row label="Batting"  value={`${data.batting_side}-handed`} />}
        {data.bowling_arm   && <Row label="Bowling arm"  value={`${data.bowling_arm} arm`} />}
        {data.bowling_type  && <Row label="Bowl type" value={data.bowling_type === 'spinner' ? 'Spinner' : 'Medium Fast'} />}
        <Row label="UTR"     value={data.utr_number} />
      </div>

      {/* Payment screenshot */}
      {data.payment_screenshot_url && (
        <div style={{ marginBottom:18, borderRadius:12, overflow:'hidden', border:'1px solid rgba(255,107,34,.2)' }}>
          <p style={{ background:'rgba(255,107,34,.06)', padding:'8px 14px', fontFamily:'"DM Sans"', color:'#f5a100', fontSize:'.72rem', fontWeight:600 }}>PAYMENT SCREENSHOT</p>
          <img src={data.payment_screenshot_url} alt="Payment"
            style={{ width:'100%', maxHeight:140, objectFit:'contain', display:'block', background:'#0f0f0f' }} />
        </div>
      )}

      {/* Note */}
      <div style={{ display:'flex', gap:10, padding:'12px 14px', borderRadius:10, background:'rgba(245,161,0,.06)', border:'1px solid rgba(245,161,0,.15)', marginBottom: submitError ? 16 : 0 }}>
        <CheckCircle size={15} color="#f5a100" style={{ flexShrink:0, marginTop:1 }} />
        <p style={{ fontFamily:'"DM Sans"', color:'#9a9a8a', fontSize:'.8rem', lineHeight:1.65 }}>
          Your registration is confirmed after payment verification. You'll be contacted on your phone/email.
        </p>
      </div>

      {submitError && (
        <div style={{ padding:'12px 14px', background:'rgba(230,57,70,.08)', border:'1px solid rgba(230,57,70,.2)', borderRadius:10, marginTop:14 }}>
          <p style={{ fontFamily:'"DM Sans"', color:'#e63946', fontSize:'.85rem' }}>{submitError}</p>
        </div>
      )}
      {submitting && (
        <p style={{ fontFamily:'"DM Sans"', color:'#ff6b22', fontSize:'.85rem', textAlign:'center', marginTop:12 }}>Submitting…</p>
      )}
    </div>
  )
}

