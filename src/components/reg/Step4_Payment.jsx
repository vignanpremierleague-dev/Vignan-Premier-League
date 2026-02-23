import { useState, useRef } from 'react'
import { Copy, Check, Upload, Image } from 'lucide-react'
import { fieldStyle, labelStyle, errorStyle, FocusInput } from './fieldStyles'

const UPI_ID = 'munursaicharan@okaxis'

export default function Step4_Payment({ data, setData, errors }) {
  const [copied, setCopied] = useState(false)
  const [uploadErr, setUploadErr] = useState('')
  const fileRef = useRef(null)

  const set = k => e => setData(prev => ({ ...prev, [k]: e.target.value }))

  const copyUpi = () => {
    navigator.clipboard.writeText(UPI_ID)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

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
      <p className="step-desc">Pay Rs.400 to the UPI below, then enter your UTR and upload the payment screenshot as proof.</p>

      <div
        onClick={copyUpi}
        style={{
          padding: '18px 22px', borderRadius: 14, marginBottom: 24, cursor: 'pointer',
          background: 'rgba(255,107,34,.04)',
          border: '1px solid rgba(255,107,34,.18)',
          transition: 'border-color .25s',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,107,34,.4)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,107,34,.18)'}
      >
        <p style={{ fontFamily: '"DM Sans"', color: '#8a8a8a', fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 8, fontWeight: 600 }}>
          Registration Fee - Rs.400 · Click to copy UPI ID
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontFamily: 'monospace', color: '#ff6b22', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '.02em' }}>
            {UPI_ID}
          </span>
          {copied ? <Check size={16} color="#f5a100" /> : <Copy size={15} color="#8a8a8a" />}
        </div>
        {copied && (
          <p style={{ fontFamily: '"DM Sans"', color: '#f5a100', fontSize: '.72rem', marginTop: 6 }}>Copied!</p>
        )}
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
