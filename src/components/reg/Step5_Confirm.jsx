import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle } from 'lucide-react'

const ROLE_LABELS = {
  batsman: 'Batsman',
  bowler: 'Bowler',
  wicket_keeper_batsman: 'Wicket Keeper Batsman',
  all_rounder: 'All Rounder',
}

const COURSE_LABELS = { btech: 'B.Tech', mtech: 'M.Tech', mba: 'MBA', bba: 'BBA', pharma: 'Pharma' }
const BRANCH_LABELS = { cse: 'CSE', ece: 'ECE', bt_bi: 'BT & BI', ds: 'Data Science', aiml: 'AI & ML' }

function Row({ label, value }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
      <span style={{ fontFamily: '"DM Sans"', color: '#8a8a8a', fontSize: '.76rem', textTransform: 'uppercase', letterSpacing: '.09em', fontWeight: 600, flexShrink: 0 }}>{label}</span>
      <span style={{ fontFamily: '"DM Sans"', color: '#d4d4d4', fontSize: '.875rem', fontWeight: 500, textAlign: 'right', wordBreak: 'break-all' }}>{value}</span>
    </div>
  )
}

export default function Step5_Confirm({ data, submitting, submitError, termsAccepted, setTermsAccepted }) {
  const [showTerms, setShowTerms] = useState(false)

  useEffect(() => {
    if (!showTerms) return undefined

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [showTerms])

  const termsDialog = showTerms ? (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.68)',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'calc(100% - 32px)',
          maxWidth: 520,
          maxHeight: 'calc(100vh - 32px)',
          borderRadius: 16,
          background: '#111',
          border: '1px solid rgba(255,255,255,.08)',
          boxShadow: '0 20px 60px rgba(0,0,0,.45)',
          overflow: 'auto',
        }}
      >
        <div style={{ padding: '18px 18px 12px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <h4 style={{ fontFamily: '"Syne",system-ui,sans-serif', color: '#efefef', margin: 0, fontSize: '1.1rem' }}>
            Terms and Conditions
          </h4>
        </div>

        <div style={{ padding: 18 }}>
          <p style={{ fontFamily: '"DM Sans"', color: '#cfcfcf', fontSize: '.84rem', lineHeight: 1.75, margin: 0 }}>
            All payments are subject to verification. Any attempt to submit a false UTR number, use another participant&apos;s UTR number, or provide misleading payment details may result in disciplinary action. The registration fee is non-refundable if the bowling test is not cleared.
          </p>

          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              padding: '14px 0 0',
              marginTop: 14,
              borderTop: '1px solid rgba(255,255,255,.06)',
            }}
          >
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              style={{ marginTop: 3, accentColor: '#ff6b22', flexShrink: 0 }}
            />
            <span style={{ fontFamily: '"DM Sans"', color: '#efefef', fontSize: '.8rem', lineHeight: 1.65 }}>
              I have read and agree to the terms and conditions.
            </span>
          </label>
        </div>

        <div style={{ padding: 18, paddingTop: 0, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => setShowTerms(false)}
            className="btn-ghost"
            style={{ padding: '10px 16px' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  ) : null

  return (
    <div>
      <h3 className="step-title">Review & Submit</h3>
      <p className="step-desc">Verify all details. You cannot edit after submitting.</p>

      {data.photo_url && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{ textAlign: 'center' }}>
            <img
              src={data.photo_url}
              alt="Player"
              style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,107,34,.4)', marginBottom: 6 }}
            />
            <p style={{ fontFamily: '"DM Sans"', color: '#8a8a8a', fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.1em' }}>Auction Photo</p>
          </div>
        </div>
      )}

      <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, padding: '4px 16px', marginBottom: 18 }}>
        <Row label="Reg ID" value={data.registration_id?.toUpperCase()} />
        <Row label="Name" value={data.name} />
        <Row label="Phone" value={data.phone} />
        <Row label="Email" value={data.email} />
        <Row label="Year" value={data.year ? `${data.year} year` : ''} />
        <Row label="Course" value={COURSE_LABELS[data.course]} />
        <Row label="Branch" value={BRANCH_LABELS[data.branch]} />
        <Row label="Section" value={data.section?.toUpperCase()} />
        <Row label="Role" value={ROLE_LABELS[data.role]} />
        {data.batting_side && <Row label="Batting" value={`${data.batting_side}-handed`} />}
        {data.bowling_arm && <Row label="Bowling arm" value={`${data.bowling_arm} arm`} />}
        {data.bowling_type && <Row label="Bowl type" value={data.bowling_type === 'spinner' ? 'Spinner' : 'Medium Fast'} />}
        <Row label="UTR" value={data.utr_number} />
      </div>

      {data.payment_screenshot_url && (
        <div style={{ marginBottom: 18, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,107,34,.2)' }}>
          <p style={{ background: 'rgba(255,107,34,.06)', padding: '8px 14px', fontFamily: '"DM Sans"', color: '#f5a100', fontSize: '.72rem', fontWeight: 600 }}>PAYMENT SCREENSHOT</p>
          <img
            src={data.payment_screenshot_url}
            alt="Payment"
            style={{ width: '100%', maxHeight: 140, objectFit: 'contain', display: 'block', background: '#0f0f0f' }}
          />
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, padding: '12px 14px', borderRadius: 10, background: 'rgba(245,161,0,.06)', border: '1px solid rgba(245,161,0,.15)', marginBottom: submitError ? 16 : 0 }}>
        <CheckCircle size={15} color="#f5a100" style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontFamily: '"DM Sans"', color: '#9a9a8a', fontSize: '.8rem', lineHeight: 1.65 }}>
          Your registration will be confirmed after payment verification. You will be contacted by phone or email.
        </p>
      </div>

      <div
        style={{
          marginTop: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          flexWrap: 'nowrap',
          width: '100%',
          maxWidth: 420,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          style={{ accentColor: '#ff6b22', flexShrink: 0, alignSelf: 'center', margin: 0 }}
        />
        <div style={{ textAlign: 'left' }}>
          <span style={{ fontFamily: '"DM Sans"', color: '#cfcfcf', fontSize: '.8rem', lineHeight: 1.65 }}>
            I agree to the{' '}
          </span>
          <button
            type="button"
            onClick={() => setShowTerms(true)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontFamily: '"DM Sans"',
              fontSize: '.8rem',
              color: '#ff6b22',
              textDecoration: 'underline',
            }}
          >
            Terms and Conditions
          </button>
        </div>
      </div>

      {submitError && (
        <div style={{ padding: '12px 14px', background: 'rgba(230,57,70,.08)', border: '1px solid rgba(230,57,70,.2)', borderRadius: 10, marginTop: 14 }}>
          <p style={{ fontFamily: '"DM Sans"', color: '#e63946', fontSize: '.85rem' }}>{submitError}</p>
        </div>
      )}

      {submitting && (
        <p style={{ fontFamily: '"DM Sans"', color: '#ff6b22', fontSize: '.85rem', textAlign: 'center', marginTop: 12 }}>Submitting...</p>
      )}

      {typeof document !== 'undefined' ? createPortal(termsDialog, document.body) : null}
    </div>
  )
}
