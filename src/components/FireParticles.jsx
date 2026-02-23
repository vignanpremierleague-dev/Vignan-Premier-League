import { useEffect, useRef } from 'react'

export default function FireParticles({ count = 20 }) {
  const ref = useRef(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return
    container.innerHTML = ''

    for (let i = 0; i < count; i++) {
      const p = document.createElement('span')
      const size = Math.random() * 5 + 3
      const x = Math.random() * 100
      const delay = Math.random() * 4
      const dur = Math.random() * 4 + 4
      const drift = (Math.random() - 0.5) * 80
      const colors = ['#ff6b00', '#f5a623', '#ff4500', '#ffd700', '#e63946']
      const color = colors[Math.floor(Math.random() * colors.length)]

      Object.assign(p.style, {
        position: 'absolute',
        bottom: '0',
        left: `${x}%`,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: color,
        filter: `blur(${size * 0.4}px)`,
        opacity: '0',
        pointerEvents: 'none',
        '--drift': `${drift}px`,
        animation: `particle-rise ${dur}s ${delay}s ease-out infinite`,
      })
      container.appendChild(p)
    }
  }, [count])

  return (
    <div
      ref={ref}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 5 }}
    />
  )
}
