import { useEffect, useRef } from 'react'

export default function EmberParticles() {
  const ref = useRef(null)

  useEffect(() => {
    const c = ref.current
    if (!c) return
    for (let i = 0; i < 22; i++) {
      const p = document.createElement('span')
      const size = Math.random() * 3 + 1.5
      const x    = Math.random() * 100
      const y    = Math.random() * 100
      const dur  = Math.random() * 8 + 6
      const del  = Math.random() * 6
      Object.assign(p.style, {
        position: 'fixed',
        left: `${x}%`,
        top: `${y}%`,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: Math.random() > .5 ? '#ff6b00' : '#f5a623',
        filter: `blur(${size * .5}px)`,
        pointerEvents: 'none',
        animation: `ember-float ${dur}s ${del}s ease-in-out infinite`,
      })
      c.appendChild(p)
    }
  }, [])

  return (
    <div
      ref={ref}
      style={{ position:'fixed', inset:0, zIndex:1, pointerEvents:'none' }}
    />
  )
}
