/* eslint-disable react-refresh/only-export-components */
/** Shared design tokens and micro-components for the Auction portal */

export const C = {
  bg:           '#0a0a0a',
  sidebar:      '#111111',
  panel:        '#161618',
  surface:      '#1a1a1e',
  surface3:     '#202024',
  border:       'rgba(255,255,255,.08)',
  borderMid:    'rgba(255,255,255,.12)',
  orange:       '#ff6b22',
  orangeFaint:  'rgba(255,107,34,.1)',
  orangeBorder: 'rgba(255,107,34,.28)',
  text:         '#efefef',
  textSub:      '#9a9a9a',
  textMuted:    '#5a5a5a',
  danger:       '#e63946',
  dangerFaint:  'rgba(230,57,70,.1)',
  dangerBorder: 'rgba(230,57,70,.28)',
  green:        '#4ade80',
  gold:         '#f5a100',
}

export const ROLE_LABEL = {
  batsman: 'Batsman', bowler: 'Bowler',
  wicket_keeper_batsman: 'Wicket Keeper', all_rounder: 'All Rounder',
}

/** Matches ROLE_COLOR in AdminDashboard — single source of truth */
export const ROLE_COLOR = {
  batsman:               '#3b82f6',
  bowler:                '#ef4444',
  wicket_keeper_batsman: '#8b5cf6',
  all_rounder:           '#10b981',
  captains:              '#f5a100',
}

export const BID_STEPS = [0.25, 0.5, 0.75, 1]

// Matches admin panel nav button style exactly
export function navBtn(active) {
  return {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '11px 14px', borderRadius: 10, cursor: 'pointer',
    fontFamily: '"DM Sans",system-ui,sans-serif', fontWeight: 600, fontSize: '.88rem',
    border: 'none', textAlign: 'left', width: '100%', transition: 'all .15s',
    background: active ? 'rgba(255,107,34,.1)' : 'transparent',
    color: active ? C.orange : C.textSub,
  }
}

export const btnOrange = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  padding: '10px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
  fontFamily: '"DM Sans",system-ui,sans-serif', fontWeight: 700, fontSize: '.85rem',
  background: 'linear-gradient(135deg,#ff6b22,#ff4b00)', color: '#fff',
  boxShadow: '0 4px 12px rgba(255,107,34,.25)', transition: 'all .15s',
}

export const btnGhost = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
  fontFamily: '"DM Sans",system-ui,sans-serif', fontWeight: 600, fontSize: '.85rem',
  background: 'transparent', color: C.danger,
  border: `1px solid ${C.dangerBorder}`, transition: 'all .15s',
}

export const btnNeutral = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  padding: '9px 14px', borderRadius: 8, cursor: 'pointer',
  fontFamily: '"DM Sans",system-ui,sans-serif', fontWeight: 600, fontSize: '.83rem',
  background: 'transparent', border: `1px solid ${C.border}`,
  color: C.textSub, transition: 'all .15s',
}

export function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: '.68rem', fontWeight: 700, letterSpacing: '.12em',
      textTransform: 'uppercase', color: C.textMuted, marginBottom: 8,
    }}>
      {children}
    </div>
  )
}

export function StatBox({ label, value, color }) {
  return (
    <div style={{ background: C.surface3, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px' }}>
      <div style={{ fontSize: '.64rem', fontWeight: 700, letterSpacing: '.1em', color: C.textMuted, textTransform: 'uppercase', marginBottom: 5 }}>{label}</div>
      <div style={{ fontWeight: 800, fontSize: '1rem', color: color || C.text }}>{value}</div>
    </div>
  )
}

export function Tag({ children, color = C.textSub, bg = C.surface3, border = C.border }) {
  return (
    <span style={{
      fontSize: '.7rem', fontWeight: 700, letterSpacing: '.06em',
      textTransform: 'uppercase', padding: '3px 10px', borderRadius: 5,
      background: bg, border: `1px solid ${border}`, color,
    }}>
      {children}
    </span>
  )
}
