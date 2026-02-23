/* Shared field styling utilities for all steps */

export const fieldStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  marginBottom: 18,
}

export const labelStyle = {
  fontFamily: '"DM Sans",system-ui,sans-serif',
  fontSize: '.75rem',
  fontWeight: 600,
  color: '#5a5a7a',
  textTransform: 'uppercase',
  letterSpacing: '.1em',
}

export const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  fontFamily: '"DM Sans",system-ui,sans-serif',
  fontSize: '.9rem',
  color: '#f0eff5',
  background: 'rgba(255,255,255,.04)',
  border: '1px solid rgba(255,255,255,.08)',
  borderRadius: 10,
  outline: 'none',
  transition: 'border-color .25s',
  boxSizing: 'border-box',
}

export const inputFocusStyle = {
  borderColor: 'rgba(255,107,34,.5)',
  boxShadow: '0 0 0 3px rgba(255,107,34,.08)',
}

export const selectStyle = {
  ...inputStyle,
  cursor: 'pointer',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235a5a7a' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 14px center',
  paddingRight: 36,
}

export const errorStyle = {
  fontFamily: '"DM Sans",system-ui,sans-serif',
  fontSize: '.75rem',
  color: '#e63946',
  marginTop: 4,
}

export function FocusInput({ style = {}, onFocus, onBlur, ...props }) {
  return (
    <input
      {...props}
      style={{ ...inputStyle, ...style }}
      onFocus={e => { e.target.style.borderColor = 'rgba(255,107,34,.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,107,34,.08)'; onFocus?.(e) }}
      onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,.08)'; e.target.style.boxShadow = 'none'; onBlur?.(e)  }}
    />
  )
}

export function FocusSelect({ style = {}, children, ...props }) {
  return (
    <select
      {...props}
      style={{ ...selectStyle, ...style }}
      onFocus={e => { e.target.style.borderColor = 'rgba(255,107,34,.5)' }}
      onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,.08)' }}
    >
      {children}
    </select>
  )
}
