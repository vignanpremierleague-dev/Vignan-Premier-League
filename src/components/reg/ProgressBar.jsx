const STEPS = ['Personal', 'Academic', 'Role', 'Payment', 'Review']

export default function ProgressBar({ step }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <div className="progress-track" style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {STEPS.map((label, i) => {
          const num = i + 1
          const done = num < step
          const active = num === step
          return (
            <div key={label} className="prog-step" style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 0 }}>
                <div
                  className="prog-node"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: '"Syne",system-ui,sans-serif',
                    fontWeight: 700,
                    fontSize: '.8rem',
                    background: done ? 'linear-gradient(135deg,#ff6b22,#e63946)' : active ? 'rgba(255,107,34,.15)' : 'rgba(255,255,255,.04)',
                    border: `2px solid ${done || active ? '#ff6b22' : 'rgba(255,255,255,.08)'}`,
                    color: done ? '#fff' : active ? '#ff6b22' : '#8a8a8a',
                    transition: 'all .3s ease',
                    flexShrink: 0,
                  }}
                >
                  {done ? 'OK' : num}
                </div>
                <span
                  className="prog-label"
                  style={{
                    fontSize: '.65rem',
                    color: active ? '#ff6b22' : '#8a8a8a',
                    fontWeight: active ? 700 : 400,
                    fontFamily: '"DM Sans",system-ui,sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '.08em',
                    whiteSpace: 'normal',
                    textAlign: 'center',
                    transition: 'color .3s ease',
                  }}
                >
                  {label}
                </span>
              </div>

              {i < STEPS.length - 1 && (
                <div
                  className="prog-conn"
                  style={{
                    flex: 1,
                    height: 2,
                    marginBottom: 22,
                    marginLeft: 8,
                    marginRight: 8,
                    background: done ? 'linear-gradient(90deg,#ff6b22,rgba(255,107,34,.3))' : 'rgba(255,255,255,.06)',
                    transition: 'background .4s ease',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
