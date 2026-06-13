/* BottomNav — shared tab bar: 메인 · 지도 · 설정. */

const { Icon: NavIcon } = window

function BottomNav({ active, onNavigate }) {
  const tabs = [
    { key: 'home', icon: 'phone', label: '메인' },
    { key: 'map', icon: 'map', label: '지도' },
    { key: 'settings', icon: 'settings', label: '설정' },
  ]
  return (
    <div
      style={{
        flex: 'none',
        display: 'flex',
        borderTop: '1px solid var(--border)',
        background: 'var(--background)',
        padding: '8px 0 4px',
      }}
    >
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onNavigate && onNavigate(t.key)}
          style={{
            flex: 1,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            fontFamily: 'var(--font-sans)',
            color:
              active === t.key ? 'var(--coral-600)' : 'var(--muted-foreground)',
          }}
        >
          <NavIcon name={t.icon} size={22} />
          <span style={{ fontSize: 11, fontWeight: 600 }}>{t.label}</span>
        </button>
      ))}
    </div>
  )
}

Object.assign(window, { BottomNav })
