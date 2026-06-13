/* AppBar — shared header for the main tabs (메인 · 지도). Brand shield + screen
 * title, an optional live-status line, and right-side icon actions. Using one
 * component guarantees the two screens read as one app. */

const { Icon: ABIcon } = window

const abIconBtn = {
  width: 40,
  height: 40,
  borderRadius: 99,
  border: 'none',
  background: 'transparent',
  color: 'var(--foreground)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
}

function AppBar({ title, status, actions = [] }) {
  return (
    <div style={{ flex: 'none', background: 'var(--surface)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 18px 0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background: 'var(--coral-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: 'var(--shadow-coral)',
              flex: 'none',
            }}
          >
            <ABIcon name="shieldCheck" size={18} />
          </div>
          <span
            style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 700,
              letterSpacing: 'var(--tracking-tight)',
            }}
          >
            {title}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {actions.map((a, i) => (
            <button
              key={i}
              aria-label={a.label}
              onClick={a.onClick}
              style={abIconBtn}
            >
              <ABIcon name={a.icon} size={21} />
            </button>
          ))}
        </div>
      </div>
      {status && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 22px 14px',
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 99,
              background: 'var(--success)',
              flex: 'none',
            }}
          />
          <span
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--muted-foreground)',
            }}
          >
            {status}
          </span>
        </div>
      )}
    </div>
  )
}

Object.assign(window, { AppBar })
