import { useState, useEffect } from 'react'

export default function ConfirmationModal({ isOpen, title, message, verifyTextRaw, onConfirm, onCancel }) {
  const [input, setInput] = useState('')
  
  useEffect(() => {
    if (isOpen) setInput('')
  }, [isOpen])

  if (!isOpen) return null

  const handleConfirm = (e) => {
    e.preventDefault()
    if (input === verifyTextRaw) onConfirm()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#111', border: '1px solid rgba(255,107,34,.2)', borderRadius: 16, padding: 32, width: '100%', maxWidth: 440, boxShadow: '0 12px 40px rgba(0,0,0,.5)' }}>
        <h3 style={{ margin: '0 0 12px', color: '#fff', fontSize: '1.4rem', fontFamily: '"Syne"', fontWeight: 800 }}>{title}</h3>
        <div style={{ color: '#aaa', fontSize: '.95rem', marginBottom: 24, lineHeight: 1.5 }}>{message}</div>
        
        <form onSubmit={handleConfirm}>
          <label style={{ display: 'block', marginBottom: 24 }}>
            <span style={{ display: 'block', fontSize: '.85rem', color: '#888', marginBottom: 8, fontWeight: 600 }}>
              Type <strong style={{ color: '#fff', fontSize: '.95rem', letterSpacing: '.05em' }}>{verifyTextRaw}</strong> to confirm:
            </span>
            <input 
              autoFocus
              value={input} 
              onChange={e => setInput(e.target.value)} 
              placeholder={`Type ${verifyTextRaw} here`}
              style={{ width: '100%', padding: '12px 14px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: '1rem', outline: 'none' }} 
              onFocus={e => e.target.style.borderColor = '#ff6b22'}
              onBlur={e => e.target.style.borderColor = '#333'}
            />
          </label>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onCancel} style={{ padding: '10px 20px', background: '#222', color: '#efefef', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
            <button type="submit" disabled={input !== verifyTextRaw} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #ff6b22, #ff4b00)', color: '#fff', border: 'none', borderRadius: 8, cursor: input === verifyTextRaw ? 'pointer' : 'not-allowed', fontWeight: 700, opacity: input === verifyTextRaw ? 1 : 0.4 }}>Confirm Sale</button>
          </div>
        </form>
      </div>
    </div>
  )
}
