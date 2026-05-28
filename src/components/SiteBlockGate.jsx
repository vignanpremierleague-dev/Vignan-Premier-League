import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Flame, ShieldCheck } from 'lucide-react'
import { getOrCreateDeviceFingerprint } from '../lib/deviceFingerprint'
import { fetchPublicAccessStatus } from '../lib/publicApi'

export default function SiteBlockGate({ children }) {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')
  const [status, setStatus] = useState({ loading: true, blocked: false, checked: false, reason: '' })

  useEffect(() => {
    let cancelled = false

    if (isAdminRoute) return () => {}

    const run = async () => {
      try {
        const fingerprint = await getOrCreateDeviceFingerprint()
        const result = await fetchPublicAccessStatus(fingerprint)
        if (cancelled) return
        setStatus({
          loading: false,
          blocked: Boolean(result.blocked),
          checked: true,
          reason: result.reason || '',
        })
      } catch {
        if (cancelled) return
        setStatus({ loading: false, blocked: false, checked: true, reason: '' })
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [isAdminRoute])

  if (isAdminRoute) return children

  if (status.loading && !status.checked) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#efefef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"DM Sans",system-ui,sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <Flame size={32} color="#ff6b22" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: '#9a9a9a' }}>Checking access…</p>
        </div>
      </div>
    )
  }

  if (status.blocked) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#efefef', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: '"DM Sans",system-ui,sans-serif' }}>
        <div style={{ maxWidth: 520, width: '100%', background: '#111', border: '1px solid rgba(230,57,70,.28)', borderRadius: 18, padding: '36px 28px', textAlign: 'center' }}>
          <ShieldCheck size={42} color="#e63946" style={{ margin: '0 auto 18px' }} />
          <h1 style={{ margin: '0 0 12px', fontFamily: '"Syne",system-ui,sans-serif', fontSize: '1.8rem' }}>Access Blocked</h1>
          <p style={{ margin: 0, color: '#9a9a9a', lineHeight: 1.7 }}>
            {status.reason || 'This device has been blocked from accessing the VPL website.'}
          </p>
        </div>
      </div>
    )
  }

  return children
}
