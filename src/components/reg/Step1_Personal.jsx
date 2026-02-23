import { useState, useRef } from 'react'
import { uploadToCloudinary } from '../../lib/cloudinary'
import { fieldStyle, labelStyle, errorStyle, FocusInput } from './fieldStyles'
import { Camera, Loader, X } from 'lucide-react'

export default function Step1_Personal({ data, setData, errors }) {
  const [uploading, setUploading] = useState(false)
  const [uploadErr, setUploadErr] = useState('')
  const photoRef = useRef(null)
  const set = k => e => setData(prev => ({ ...prev, [k]: e.target.value }))

  const handlePhoto = async e => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setUploadErr('Only image files allowed.'); return }
    if (file.size > 5 * 1024 * 1024)    { setUploadErr('File must be under 5 MB.'); return }
    setUploadErr('')
    setUploading(true)
    try {
      const url = await uploadToCloudinary(file)
      setData(prev => ({ ...prev, photo_url: url }))
    } catch (err) {
      setUploadErr(err.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <h3 className="step-title">Personal Details</h3>
      <p className="step-desc">Enter your credentials exactly as on your college ID card.</p>

      <div style={fieldStyle}>
        <label style={labelStyle}>Student Registration ID *</label>
        <FocusInput
          type="text" placeholder="e.g. 22B81A0501"
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
          <FocusInput type="email" placeholder="you@vignan.ac.in" value={data.email} onChange={set('email')} />
          {errors.email && <span style={errorStyle}>{errors.email}</span>}
        </div>
      </div>

      {/* Player photo for auction */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Player Photo for Auction *</label>
        <p style={{ fontFamily:'"DM Sans"', color:'#2a2a4a', fontSize:'.74rem', marginBottom:8 }}>
          Upload a clear, recent passport-style photo. This will be displayed at the player auction.
        </p>
        <input ref={photoRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display:'none' }} />

        {!data.photo_url ? (
          <button
            type="button"
            onClick={() => photoRef.current?.click()}
            disabled={uploading}
            className="upload-zone"
          >
            {uploading
              ? <Loader size={22} color="#ff6b22" style={{ animation:'spin 1s linear infinite' }} />
              : <Camera size={22} color="#3a3a5a" />
            }
            <span style={{ fontFamily:'"DM Sans"', color: uploading ? '#ff6b22' : '#3a3a5a', fontSize:'.85rem', fontWeight:500 }}>
              {uploading ? 'Uploading...' : 'Click to upload photo'}
            </span>
            <span style={{ fontFamily:'"DM Sans"', color:'#2a2a4a', fontSize:'.72rem' }}>JPG or PNG, max 5 MB</span>
          </button>
        ) : (
          <div style={{ position:'relative', display:'inline-block' }}>
            <img src={data.photo_url} alt="Player"
              style={{ width:120, height:120, objectFit:'cover', borderRadius:14, border:'2px solid rgba(255,107,34,.4)', display:'block' }} />
            <button
              type="button"
              onClick={() => { setData(prev => ({ ...prev, photo_url:'' })); if(photoRef.current) photoRef.current.value='' }}
              style={{
                position:'absolute', top:-8, right:-8,
                width:24, height:24, borderRadius:'50%',
                background:'#e63946', border:'none', cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}
            ><X size={12} color="#fff" /></button>
            <p style={{ fontFamily:'"DM Sans"', color:'#f5a100', fontSize:'.72rem', marginTop:6, fontWeight:600 }}>✓ Photo uploaded</p>
          </div>
        )}
        {uploadErr && <span style={errorStyle}>{uploadErr}</span>}
        {errors.photo_url && <span style={errorStyle}>{errors.photo_url}</span>}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}
