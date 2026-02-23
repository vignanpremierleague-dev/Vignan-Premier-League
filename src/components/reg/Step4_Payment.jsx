import { useState, useRef } from 'react'
import { uploadToCloudinary } from '../../lib/cloudinary'
import { Copy, Check, Upload, Image, Loader } from 'lucide-react'
import { fieldStyle, labelStyle, errorStyle, FocusInput } from './fieldStyles'

const UPI_ID = 'munursaicharan@okaxis'

export default function Step4_Payment({ data, setData, errors }) {
  const [copied, setCopied] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadErr, setUploadErr] = useState('')
  const fileRef = useRef(null)

  const set = k => e => setData(prev => ({ ...prev, [k]: e.target.value }))

  const copyUpi = () => {
    navigator.clipboard.writeText(UPI_ID)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleFileChange = async e => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setUploadErr('Only image files allowed.'); return }
    if (file.size > 5 * 1024 * 1024)    { setUploadErr('File must be under 5 MB.'); return }

    setUploadErr('')
    setUploading(true)
    try {
      const url = await uploadToCloudinary(file)
      setData(prev => ({ ...prev, payment_screenshot_url: url }))
    } catch (err) {
      setUploadErr(err.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <h3 style={{ fontFamily: '"Syne",system-ui,sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#f0eff5', marginBottom: 6 }}>
        Payment
      </h3>
      <p style={{ fontFamily: '"DM Sans"', color: '#5a5a7a', fontSize: '.84rem', marginBottom: 28, lineHeight: 1.6 }}>
        Pay ₹400 to the UPI below, then enter your UTR and upload the payment screenshot as proof.
      </p>

      {/* UPI card */}
      <div
        onClick={copyUpi}
        style={{
          padding: '18px 22px', borderRadius: 14, marginBottom: 24, cursor: 'pointer',
          background: 'rgba(255,107,34,.04)',
          border: '1px solid rgba(255,107,34,.18)',
          transition: 'border-color .25s',
        }}
        onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(255,107,34,.4)'}
        onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,107,34,.18)'}
      >
        <p style={{ fontFamily: '"DM Sans"', color: '#3a3a5a', fontSize: '.68rem', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 8, fontWeight: 600 }}>
          Registration Fee — ₹400 &middot; Click to copy UPI ID
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontFamily: 'monospace', color: '#ff6b22', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '.02em' }}>
            {UPI_ID}
          </span>
          {copied ? <Check size={16} color="#f5a100" /> : <Copy size={15} color="#3a3a5a" />}
        </div>
        {copied && (
          <p style={{ fontFamily: '"DM Sans"', color: '#f5a100', fontSize: '.72rem', marginTop: 6 }}>✓ Copied!</p>
        )}
      </div>

      {/* UTR */}
      <div style={fieldStyle}>
        <label style={labelStyle}>UTR Number *</label>
        <FocusInput
          type="text" placeholder="12-digit UTR from your UPI app"
          value={data.utr_number} onChange={set('utr_number')}
          maxLength={22}
        />
        <span style={{ fontFamily: '"DM Sans"', color: '#2a2a4a', fontSize: '.72rem', marginTop: 2 }}>
          Find this in your UPI app's transaction history (usually 12 digits)
        </span>
        {errors.utr_number && <span style={errorStyle}>{errors.utr_number}</span>}
      </div>

      {/* Screenshot upload */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Payment Screenshot *</label>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />

        {!data.payment_screenshot_url ? (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{
              width: '100%', padding: '24px 20px',
              background: 'rgba(255,255,255,.03)',
              border: '1.5px dashed rgba(255,255,255,.12)',
              borderRadius: 12, cursor: uploading ? 'not-allowed' : 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              transition: 'border-color .25s, background .25s',
            }}
            onMouseEnter={e=>{ if(!uploading){ e.currentTarget.style.borderColor='rgba(255,107,34,.4)'; e.currentTarget.style.background='rgba(255,107,34,.04)'; }}}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,.12)'; e.currentTarget.style.background='rgba(255,255,255,.03)'; }}
          >
            {uploading
              ? <Loader size={22} color="#ff6b22" style={{ animation: 'spin 1s linear infinite' }} />
              : <Upload size={22} color="#3a3a5a" />
            }
            <span style={{ fontFamily: '"DM Sans"', color: uploading ? '#ff6b22' : '#3a3a5a', fontSize: '.85rem', fontWeight: 500 }}>
              {uploading ? 'Uploading...' : 'Click to upload screenshot'}
            </span>
            <span style={{ fontFamily: '"DM Sans"', color: '#2a2a4a', fontSize: '.72rem' }}>PNG, JPG up to 5 MB</span>
          </button>
        ) : (
          <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,107,34,.3)' }}>
            <img src={data.payment_screenshot_url} alt="Payment screenshot"
              style={{ width: '100%', maxHeight: 220, objectFit: 'contain', display: 'block', background: '#0c0c14' }} />
            <button
              type="button"
              onClick={() => { setData(prev => ({ ...prev, payment_screenshot_url: '' })); if(fileRef.current) fileRef.current.value = '' }}
              style={{
                position: 'absolute', top: 8, right: 8,
                background: 'rgba(230,57,70,.85)', border: 'none', borderRadius: 8,
                padding: '6px 12px', cursor: 'pointer',
                fontFamily: '"DM Sans"', fontSize: '.75rem', color: '#fff', fontWeight: 600,
              }}
            >Remove</button>
            <div style={{ padding: '8px 14px', background: 'rgba(255,107,34,.06)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Image size={13} color="#f5a100" />
              <span style={{ fontFamily: '"DM Sans"', color: '#f5a100', fontSize: '.75rem' }}>Screenshot uploaded successfully</span>
            </div>
          </div>
        )}
        {uploadErr && <span style={errorStyle}>{uploadErr}</span>}
        {errors.payment_screenshot_url && <span style={errorStyle}>{errors.payment_screenshot_url}</span>}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
