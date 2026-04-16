import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { uploadToCloudinary } from '../lib/cloudinary'
import ProgressBar     from './reg/ProgressBar'
import Step1_Personal  from './reg/Step1_Personal'
import Step2_Academic  from './reg/Step2_Academic'
import Step3_Role      from './reg/Step3_Role'
import Step4_Payment   from './reg/Step4_Payment'
import Step5_Confirm   from './reg/Step5_Confirm'
import { Flame, ArrowRight, ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import { fetchSiteSettings } from '../lib/adminApi'

const INIT = {
  registration_id: '', name: '', phone: '', email: '', photo_url: '',
  photo_file: null,
  year: '', course: '', branch: '', section: '',
  role: '', batting_side: '', bowling_arm: '', bowling_type: '',
  utr_number: '', payment_screenshot_url: '',
  payment_file: null,
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(step, data) {
  const e = {}
  if (step === 1) {
    if (!data.registration_id.trim()) e.registration_id = 'Registration ID is required.'
    if (!data.name.trim())            e.name = 'Name is required.'
    if (!data.phone.trim() || data.phone.length < 10) e.phone = 'Enter a valid 10-digit phone number.'
    if (!emailRe.test(data.email))    e.email = 'Enter a valid email address.'
    if (!data.photo_file)             e.photo_url = 'Player photo is required for the auction.'
  }
  if (step === 2) {
    if (!data.year)    e.year    = 'Select your year.'
    if (!data.course)  e.course  = 'Select your course.'
    if (!data.branch)  e.branch  = 'Select your branch.'
    if (!data.section) e.section = 'Select your section.'
  }
  if (step === 3) {
    if (!data.role) { e.role = 'Select a playing role.'; return e }
    const needsBat = ['batsman','wicket_keeper_batsman','all_rounder'].includes(data.role)
    const needsBow = ['bowler','all_rounder'].includes(data.role)
    if (needsBat && !data.batting_side)  e.batting_side  = 'Select your batting side.'
    if (needsBow && !data.bowling_arm)   e.bowling_arm   = 'Select your bowling arm.'
    if (needsBow && !data.bowling_type)  e.bowling_type  = 'Select your bowling type.'
  }
  if (step === 4) {
    if (!data.utr_number.trim())        e.utr_number = 'UTR number is required.'
    if (!data.payment_file)             e.payment_screenshot_url = 'Please upload the payment screenshot.'
  }
  return e
}

export default function Registration() {
  const [step, setStep]           = useState(1)
  const [data, setData]           = useState(INIT)
  const [errors, setErrors]       = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess]     = useState(false)
  const [settings, setSettings]   = useState(null)
  const successCardRef = useRef(null)
  const whatsappLink = settings?.whatsappLink || 'https://chat.whatsapp.com/L7HXdLMblNRGTNwJbMZPVE?mode=gi_t'
  const registerSectionTitle = settings?.registerSectionTitle || 'Register Now'
  const closedTitle = settings?.registrationClosedTitle || 'Registrations Closed'
  const closedMessage = settings?.registrationClosedMessage || 'Player registrations for the Vignan Premier League are temporarily closed. Please check the WhatsApp group for updates or contact our coordinators.'

  useEffect(() => {
    fetchSiteSettings().then(setSettings).catch()
  }, [])

  const scrollToSection = () => {
    const el = document.getElementById('register')
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' })
  }

  const goNext = () => {
    const errs = validate(step, data)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setStep(s => s + 1)
    scrollToSection()
  }
  const goBack = () => { setErrors({}); setStep(s => s - 1); scrollToSection() }

  useEffect(() => {
    if (!success || !successCardRef.current) return
    requestAnimationFrame(() => {
      successCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }, [success])

  const parseInsertError = (error) => {
    if (error?.code === '23505') {
      if (error.message?.includes('registration_id')) return 'This Registration ID is already registered.'
      if (error.message?.includes('utr_number')) return 'This UTR number was already used.'
      return 'A duplicate entry was detected.'
    }
    return error?.message || 'Submission failed. Please try again.'
  }

  const handleSubmit = async () => {
    const errs = { ...validate(1, data), ...validate(2, data), ...validate(3, data), ...validate(4, data) }
    if (Object.keys(errs).length) {
      setErrors(errs)
      setSubmitError('Please complete all required fields before submitting.')
      return
    }
    if (!supabase) {
      setSubmitError('Registration service is not configured. Please contact support.')
      return
    }

    setSubmitting(true)
    setSubmitError('')
    try {
      const payload = {
        registration_id:         data.registration_id.trim().toUpperCase(),
        name:                    data.name.trim(),
        phone:                   data.phone.trim(),
        email:                   data.email.trim().toLowerCase(),
        photo_url:               null,
        year:                    data.year,
        course:                  data.course,
        branch:                  data.branch,
        section:                 data.section,
        role:                    data.role,
        batting_side:            data.batting_side || null,
        bowling_arm:             data.bowling_arm  || null,
        bowling_type:            data.bowling_type || null,
        utr_number:              data.utr_number.trim() || null,
        payment_screenshot_url:  null,
        is_verified:             false,   // always starts unverified
      }
      const { data: inserted, error: insertError } = await supabase
        .from('vpl_players')
        .insert(payload)
        .select('id')
        .single()

      if (insertError) {
        setSubmitError(parseInsertError(insertError))
        return
      }

      const insertedId = inserted?.id
      if (!insertedId) {
        setSubmitError('Submission failed because registration ID was not returned.')
        return
      }

      let photoAsset = null
      let paymentAsset = null

      try {
        photoAsset = await uploadToCloudinary(data.photo_file)
        paymentAsset = await uploadToCloudinary(data.payment_file)

        const { error: updateError } = await supabase
          .from('vpl_players')
          .update({
            photo_url: photoAsset.secureUrl,
            payment_screenshot_url: paymentAsset.secureUrl,
          })
          .eq('id', insertedId)

        if (updateError) throw updateError

        setData(prev => {
          if (prev.photo_url?.startsWith('blob:')) URL.revokeObjectURL(prev.photo_url)
          if (prev.payment_screenshot_url?.startsWith('blob:')) URL.revokeObjectURL(prev.payment_screenshot_url)
          return {
            ...prev,
            photo_url: photoAsset.secureUrl,
            payment_screenshot_url: paymentAsset.secureUrl,
            photo_file: null,
            payment_file: null,
          }
        })
        setSuccess(true)
      } catch (err) {
        const { error: deleteError } = await supabase
          .from('vpl_players')
          .delete()
          .eq('id', insertedId)

        if (deleteError) {
          setSubmitError('Submission failed and rollback was partial. Please contact support before retrying.')
        } else {
          setSubmitError(err?.message || 'Submission failed. Please try again.')
        }
      }
    } catch (err) {
      setSubmitError(err?.message || 'Unexpected error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  /* ── Success Screen ───────────────────────────────────── */
  if (success) {
    return (
      <section id="register" style={{ padding:'100px 0', background:'#0f0f0f' }}>
        <div ref={successCardRef} className="wrap" style={{ maxWidth:520, margin:'0 auto', textAlign:'center', padding:'0 16px' }}>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:24 }}>
            <CheckCircle size={64} color="#ff6b22" strokeWidth={1.5} />
          </div>
          <h2 className="section-heading fire-text" style={{ marginBottom:12 }}>You're In!</h2>
          <p style={{ fontFamily:'"DM Sans"', color:'#8b8b8b', fontSize:'.95rem', lineHeight:1.8, marginBottom:28 }}>
            Registration received, <strong style={{ color:'#d4d4d4' }}>{data.name}</strong>! We'll verify your payment and confirm your auction spot.
          </p>

          {/* Player photo */}
          {data.photo_url && (
            <div style={{ display:'flex', justifyContent:'center', marginBottom:24 }}>
              <img src={data.photo_url} alt="Player"
                style={{ width:90, height:90, borderRadius:'50%', objectFit:'cover', border:'2.5px solid rgba(255,107,34,.5)', boxShadow:'0 0 24px rgba(255,107,34,.2)' }} />
            </div>
          )}

          {/* Reg ID */}
          <div style={{ background:'rgba(255,107,34,.05)', border:'1px solid rgba(255,107,34,.15)', borderRadius:12, padding:'16px 20px', marginBottom:24, textAlign:'left' }}>
            <p style={{ fontFamily:'"DM Sans"', color:'#8b8b8b', fontSize:'.75rem', marginBottom:5, textTransform:'uppercase', letterSpacing:'.1em' }}>Your Registration ID</p>
            <p style={{ fontFamily:'monospace', color:'#ff6b22', fontWeight:800, fontSize:'1.1rem' }}>{data.registration_id.toUpperCase()}</p>
          </div>

          {/* WhatsApp CTA */}
          <a
            href={whatsappLink}
            target="_blank" rel="noopener noreferrer"
            className="btn-primary"
            style={{ width:'100%', justifyContent:'center', marginBottom:12, fontSize:'.9rem', padding:'15px 24px' }}
          >
            {/* WhatsApp icon inline */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Join VPL WhatsApp Group
          </a>
          <a href="#home" className="btn-ghost" style={{ width:'100%', justifyContent:'center' }}>Back to Home</a>
        </div>
      </section>
    )
  }

  /* ── Form ─────────────────────────────────────────────── */
  if (settings && !settings.registrationsOpen) {
    return (
      <section id="register" style={{ padding:'100px 0', background:'#0f0f0f' }}>
        <div className="wrap" style={{ maxWidth:520, margin:'0 auto', textAlign:'center', padding:'0 16px' }}>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:24 }}>
            <XCircle size={64} color="#e63946" strokeWidth={1.5} />
          </div>
          <h2 className="section-heading" style={{ marginBottom:12, color: '#efefef' }}>{closedTitle}</h2>
          <p style={{ fontFamily:'"DM Sans"', color:'#8b8b8b', fontSize:'.95rem', lineHeight:1.8, marginBottom:28 }}>
            {closedMessage}
          </p>
          <a href="/" className="btn-ghost" style={{ width:'100%', justifyContent:'center', display: 'flex' }}>Back to Home</a>
        </div>
      </section>
    )
  }

  return (
    <section id="register" style={{ padding:'80px 0', background:'#0f0f0f', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', bottom:'-20%', left:'50%', transform:'translateX(-50%)', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle, rgba(255,107,34,.04) 0%, transparent 65%)', pointerEvents:'none' }} />

      <div className="wrap" style={{ position:'relative', zIndex:10 }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <h2 className="section-heading fire-text" style={{ marginBottom:8 }}>{registerSectionTitle}</h2>
          <span className="divider" />
        </div>

        <div className="glass-panel reg-card">
          <ProgressBar step={step} />

          {step === 1 && <Step1_Personal data={data} setData={setData} errors={errors} />}
          {step === 2 && <Step2_Academic data={data} setData={setData} errors={errors} />}
          {step === 3 && <Step3_Role     data={data} setData={setData} errors={errors} />}
          {step === 4 && <Step4_Payment  data={data} setData={setData} errors={errors} />}
          {step === 5 && <Step5_Confirm  data={data} submitting={submitting} submitError={submitError} />}

          <div className="reg-nav">
            {step > 1 && (
              <button type="button" onClick={goBack} className="btn-ghost" disabled={submitting}>
                <ArrowLeft size={16} /> Back
              </button>
            )}
            {step < 5 && (
              <button type="button" onClick={goNext} className="btn-primary" style={{ marginLeft:'auto' }}>
                Continue <ArrowRight size={16} />
              </button>
            )}
            {step === 5 && (
              <button type="button" onClick={handleSubmit} className="btn-primary"
                disabled={submitting} style={{ marginLeft:'auto', opacity: submitting ? .7 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}>
                <Flame size={16} /> {submitting ? 'Submitting…' : 'Submit Registration'}
              </button>
            )}
          </div>

          <p style={{ fontFamily:'"DM Sans"', color:'#8a8a8a', fontSize:'.72rem', textAlign:'center', marginTop:14 }}>
            Step {step} of 5
          </p>
        </div>
      </div>
    </section>
  )
}
