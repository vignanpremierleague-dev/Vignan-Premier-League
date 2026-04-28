import { useState, useRef } from 'react'
import { Upload, Image } from 'lucide-react'
import { fieldStyle, labelStyle, errorStyle, FocusInput } from './fieldStyles'

const UPI_PAYMENT_LINK = 'upi://pay?pa=revanthkotamraju-4@okhdfcbank&am=300.00&cu=INR'

export default function Step4_Payment({ data, setData, errors }) {
  const [uploadErr, setUploadErr] = useState('')
  const fileRef = useRef(null)

  const set = k => e => setData(prev => ({ ...prev, [k]: e.target.value }))

  const clearScreenshot = () => {
    setData(prev => {
      if (prev.payment_screenshot_url?.startsWith('blob:')) URL.revokeObjectURL(prev.payment_screenshot_url)
      return { ...prev, payment_screenshot_url: '', payment_file: null }
    })
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleFileChange = e => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setUploadErr('Only image files allowed.'); return }
    if (file.size > 5 * 1024 * 1024) { setUploadErr('File must be under 5 MB.'); return }

    setUploadErr('')
    setData(prev => {
      if (prev.payment_screenshot_url?.startsWith('blob:')) URL.revokeObjectURL(prev.payment_screenshot_url)
      return {
        ...prev,
        payment_screenshot_url: URL.createObjectURL(file),
        payment_file: file,
      }
    })
  }

  return (
    <div>
      <h3 className="step-title">Payment</h3>
      <p className="step-desc">Pay Rs.300 by scanning the QR below, then enter your UTR and upload the payment screenshot as proof.</p>

      <div
        style={{
          padding: '18px 22px', borderRadius: 14, marginBottom: 24,
          background: 'rgba(255,107,34,.04)',
          border: '1px solid rgba(255,107,34,.18)',
          textAlign: 'center',
        }}
      >
        <p style={{ fontFamily: '"DM Sans"', color: '#8a8a8a', fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 8, fontWeight: 600 }}>
          Registration Fee - Rs.300
        </p>
        <img
          src="/gpay-qr.png"
          alt="Payment QR"
          style={{
            width: '100%',
            maxWidth: 280,
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,.12)',
            background: '#fff',
            margin: '8px auto 10px',
            display: 'block',
          }}
        />
          <a
            href={UPI_PAYMENT_LINK}
            className="btn-ghost"
            style={{ padding: '8px 14px', fontSize: '.72rem', marginBottom: 10 }}
          >
          Open UPI App
        </a>
        <p style={{ fontFamily: '"DM Sans"', color: '#a0a0a0', fontSize: '.78rem' }}>
          Scan the QR or tap above to pay with a UPI app.
        </p>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>UTR Number *</label>
        <FocusInput
          type="text" placeholder="12-digit UTR from your UPI app"
          value={data.utr_number} onChange={set('utr_number')}
          maxLength={22}
        />
        <span style={{ fontFamily: '"DM Sans"', color: '#8a8a8a', fontSize: '.73rem', marginTop: 2 }}>
          Find this in your UPI app's transaction history (usually 12 digits)
        </span>
        {errors.utr_number && <span style={errorStyle}>{errors.utr_number}</span>}
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Payment Screenshot *</label>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />

        {!data.payment_screenshot_url ? (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            style={{
              width: '100%', padding: '24px 20px',
              background: 'rgba(255,255,255,.03)',
              border: '1.5px dashed rgba(255,255,255,.12)',
              borderRadius: 12, cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              transition: 'border-color .25s, background .25s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,107,34,.4)'; e.currentTarget.style.background = 'rgba(255,107,34,.04)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.12)'; e.currentTarget.style.background = 'rgba(255,255,255,.03)' }}
          >
            <Upload size={22} color="#8a8a8a" />
            <span style={{ fontFamily: '"DM Sans"', color: '#9a9a9a', fontSize: '.85rem', fontWeight: 500 }}>
              Click to select screenshot
            </span>
            <span style={{ fontFamily: '"DM Sans"', color: '#8a8a8a', fontSize: '.73rem' }}>PNG, JPG up to 5 MB</span>
          </button>
        ) : (
          <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,107,34,.3)' }}>
            <img
              src={data.payment_screenshot_url}
              alt="Payment screenshot"
              style={{ width: '100%', maxHeight: 220, objectFit: 'contain', display: 'block', background: '#0f0f0f' }}
            />
            <button
              type="button"
              onClick={clearScreenshot}
              style={{
                position: 'absolute', top: 8, right: 8,
                background: 'rgba(230,57,70,.85)', border: 'none', borderRadius: 8,
                padding: '6px 12px', cursor: 'pointer',
                fontFamily: '"DM Sans"', fontSize: '.75rem', color: '#fff', fontWeight: 600,
              }}
            >
              Remove
            </button>
            <div style={{ padding: '8px 14px', background: 'rgba(255,107,34,.06)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Image size={13} color="#f5a100" />
              <span style={{ fontFamily: '"DM Sans"', color: '#f5a100', fontSize: '.75rem' }}>
                Screenshot selected (uploads on submit)
              </span>
            </div>
          </div>
        )}
        {uploadErr && <span style={errorStyle}>{uploadErr}</span>}
        {errors.payment_screenshot_url && <span style={errorStyle}>{errors.payment_screenshot_url}</span>}
      </div>
    </div>
  )
}
