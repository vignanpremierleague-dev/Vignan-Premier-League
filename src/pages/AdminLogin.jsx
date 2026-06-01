import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginAdmin } from '../lib/adminApi'
import { Flame, Lock, User, Eye, EyeOff, ShieldCheck } from 'lucide-react'

export default function AdminLogin() {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (localStorage.getItem('vpl_admin') || localStorage.getItem('vpl_admin_token')) {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [navigate])

  if (localStorage.getItem('vpl_admin') || localStorage.getItem('vpl_admin_token')) {
    return null
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 600)) // subtle delay
    try {
      const { token } = await loginAdmin(user, pass)
      if (!token) throw new Error('Missing session token.')
      localStorage.setItem('vpl_admin', '1')
      localStorage.setItem('vpl_admin_token', token)
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message || 'Invalid username or password.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#070707',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"DM Sans",system-ui,sans-serif',
      padding: '24px',
    }}>
      {/* Background orb */}
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,107,34,.06) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div className="glass-panel" style={{
        width: '100%', maxWidth: 400,
        padding: '44px 36px',
        position: 'relative', zIndex: 1,
        boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
            background: 'rgba(255,107,34,.12)', border: '1px solid rgba(255,107,34,.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ShieldCheck size={26} color="#ff6b22" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
            <Flame size={16} color="#ff6b22" />
            <span style={{ fontFamily: '"Syne"', fontWeight: 800, fontSize: '1.1rem', color: '#ff6b22' }}>VPL Admin</span>
          </div>
          <p style={{ color: '#6a6a6a', fontSize: '.82rem' }}>Vignan Premier League — Control Panel</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: '#9b9b9b', fontSize: '.73rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <User size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#5a5a5a' }} />
              <input
                type="text" value={user} onChange={e => setUser(e.target.value)}
                placeholder="admin"
                style={{
                  width: '100%', padding: '12px 14px 12px 40px',
                  background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)',
                  borderRadius: 10, color: '#efefef', fontSize: '.9rem',
                  outline: 'none', boxSizing: 'border-box', fontFamily: '"DM Sans"',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(255,107,34,.5)'}
                onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,.12)'}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', color: '#9b9b9b', fontSize: '.73rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#5a5a5a' }} />
              <input
                type={showPass ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)}
                placeholder="••••••••••"
                style={{
                  width: '100%', padding: '12px 42px 12px 40px',
                  background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)',
                  borderRadius: 10, color: '#efefef', fontSize: '.9rem',
                  outline: 'none', boxSizing: 'border-box', fontFamily: '"DM Sans"',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(255,107,34,.5)'}
                onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,.12)'}
              />
              <button type="button" onClick={() => setShowPass(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#5a5a5a', padding: 2 }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <p style={{ color: '#e63946', fontSize: '.8rem', marginBottom: 16, textAlign: 'center' }}>{error}</p>
          )}

          <button type="submit" disabled={loading} className="btn-primary" style={{
            width: '100%', padding: '14px', borderRadius: 12,
            justifyContent: 'center', fontSize: '.95rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1, marginTop: 8
          }}>
            {loading ? 'Authenticating…' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#3a3a3a', fontSize: '.72rem', marginTop: 24 }}>
          Access restricted to authorised administrators only.
        </p>
      </div>
    </div>
  )
}
