import { useState, useRef } from 'react'
import { fieldStyle, labelStyle, errorStyle, FocusInput } from './fieldStyles'
import { Camera, X } from 'lucide-react'

export default function Step1_Personal({ data, setData, errors }) {
  const [uploadErr, setUploadErr] = useState('')
  const photoRef = useRef(null)
  const set = k => e => setData(prev => ({ ...prev, [k]: e.target.value }))

  const clearPhoto = () => {
    setData(prev => {
      if (prev.photo_url?.startsWith('blob:')) URL.revokeObjectURL(prev.photo_url)
      return { ...prev, photo_url: '', photo_file: null }
    })
    if (photoRef.current) photoRef.current.value = ''
  }

  const handlePhoto = e => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setUploadErr('Only image files allowed.'); return }
    if (file.size > 5 * 1024 * 1024) { setUploadErr('File must be under 5 MB.'); return }

    setUploadErr('')
    setData(prev => {
      if (prev.photo_url?.startsWith('blob:')) URL.revokeObjectURL(prev.photo_url)
      return { ...prev, photo_url: URL.createObjectURL(file), photo_file: file }
    })
  }

  return (
    <div>
      <h3 className="step-title">Personal Details</h3>
      <p className="step-desc">Enter your credentials exactly as on your college ID card.</p>

      <div style={fieldStyle}>
        <label style={labelStyle}>Student Registration ID *</label>
        <FocusInput
          type="text" placeholder="e.g. 242FA23044"
          value={data.registration_id} onChange={set('registration_id')}
          style={{ textTransform: 'uppercase' }}
        />
        {errors.registration_id && <span style={errorStyle}>{errors.registration_id}</span>}
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Full Name *</label>
        <FocusInput type="text" placeholder="Your full name" value={data.name} onChange={set('name')} />
        {errors.name && <span style={errorStyle}>{errors.name}</span>}
      </div>

      <div className="form-grid-2">
        <div style={fieldStyle}>
          <label style={labelStyle}>Phone Number *</label>
          <FocusInput type="tel" placeholder="10-digit mobile number" value={data.phone} onChange={set('phone')} maxLength={10} />
          {errors.phone && <span style={errorStyle}>{errors.phone}</span>}
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Email Address *</label>
          <FocusInput type="email" placeholder="yourname@gmail.com" value={data.email} onChange={set('email')} />
          {errors.email && <span style={errorStyle}>{errors.email}</span>}
        </div>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Player Photo for Auction *</label>
        <p style={{ fontFamily: '"DM Sans"', color: '#8a8a8a', fontSize: '.75rem', marginBottom: 8 }}>
          Upload a clear, recent passport-style photo. This will be displayed at the player auction.
        </p>
        <input ref={photoRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />

        {!data.photo_url ? (
          <button type="button" onClick={() => photoRef.current?.click()} className="upload-zone">
            <Camera size={22} color="#8a8a8a" />
            <span style={{ fontFamily: '"DM Sans"', color: '#9a9a9a', fontSize: '.85rem', fontWeight: 500 }}>
              Click to select photo
            </span>
            <span style={{ fontFamily: '"DM Sans"', color: '#8a8a8a', fontSize: '.73rem' }}>JPG or PNG, max 5 MB</span>
          </button>
        ) : (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img
              src={data.photo_url}
              alt="Player"
              style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 14, border: '2px solid rgba(255,107,34,.4)', display: 'block' }}
            />
            <button
              type="button"
              onClick={clearPhoto}
              style={{
                position: 'absolute', top: -8, right: -8,
                width: 24, height: 24, borderRadius: '50%',
                background: '#e63946', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={12} color="#fff" />
            </button>
            <p style={{ fontFamily: '"DM Sans"', color: '#f5a100', fontSize: '.72rem', marginTop: 6, fontWeight: 600 }}>
              Photo selected (uploads on submit)
            </p>
          </div>
        )}
        {uploadErr && <span style={errorStyle}>{uploadErr}</span>}
        {errors.photo_url && <span style={errorStyle}>{errors.photo_url}</span>}
      </div>
    </div>
  )
}
