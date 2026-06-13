/* PhoneFrame — a 390-wide mobile shell with status bar + home indicator.
 * Children render inside the scrollable screen area. positioned:relative so
 * Dialog (absolute) anchors to the phone, not the page. */

function PhoneFrame({ children, bg = 'var(--background)' }) {
  return (
    <div
      style={{
        width: 390,
        height: 800,
        background: '#000',
        borderRadius: 46,
        padding: 5,
        boxShadow: 'var(--shadow-xl)',
        flex: 'none',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          background: bg,
          borderRadius: 41,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'var(--font-sans)',
        }}
      >
        {/* status bar */}
        <div
          style={{
            height: 50,
            flex: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 26px 0 30px',
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--foreground)',
            zIndex: 20,
          }}
        >
          <span>9:41</span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
              <rect x="0" y="7" width="3" height="5" rx="1" />
              <rect x="5" y="4" width="3" height="8" rx="1" />
              <rect x="10" y="1.5" width="3" height="10.5" rx="1" />
              <rect x="15" y="0" width="3" height="12" rx="1" opacity="0.35" />
            </svg>
            <svg width="22" height="12" viewBox="0 0 22 12" fill="none">
              <rect
                x="1"
                y="1"
                width="17"
                height="10"
                rx="2.5"
                stroke="currentColor"
                strokeOpacity="0.4"
              />
              <rect
                x="2.5"
                y="2.5"
                width="12"
                height="7"
                rx="1.2"
                fill="currentColor"
              />
              <rect
                x="19"
                y="4"
                width="2"
                height="4"
                rx="1"
                fill="currentColor"
                fillOpacity="0.5"
              />
            </svg>
          </div>
        </div>
        {/* screen body */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          {children}
        </div>
        {/* home indicator */}
        <div
          style={{
            height: 22,
            flex: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
          }}
        >
          <div
            style={{
              width: 130,
              height: 5,
              borderRadius: 3,
              background: 'var(--neutral-900)',
              opacity: 0.28,
            }}
          />
        </div>
      </div>
    </div>
  )
}

Object.assign(window, { PhoneFrame })
