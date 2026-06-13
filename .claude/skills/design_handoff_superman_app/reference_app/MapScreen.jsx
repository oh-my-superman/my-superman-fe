/* MapScreen — 지도 화면. Nearby CCTV + 안심 지킴이 집 (safe-house) locations on a
 * stylized map, with filter chips, a "current location" button, and a
 * bottom sheet listing nearby safe spots by distance. */

const {
  Badge: MapBadge,
  ListItem: MapListItem,
  ListDivider: MapDivider,
} = window.DesignSystem_b303af
const { Icon: MIcon, BottomNav: MapBottomNav, AppBar: MapAppBar } = window

const MAP_CSS = `
@keyframes sm-loc-pulse{0%{transform:scale(1);opacity:.5}70%{transform:scale(3);opacity:0}100%{opacity:0}}
`

const CCTV = 'var(--blue-info)'
const SAFE = 'var(--coral-500)'

function Pin({ color, icon, top, left, size = 34 }) {
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left,
        transform: 'translate(-50%,-100%)',
        filter: 'drop-shadow(0 4px 7px rgba(40,24,24,.28))',
        zIndex: 5,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          background: color,
          borderRadius: '50% 50% 50% 0',
          transform: 'rotate(-45deg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2.5px solid #fff',
        }}
      >
        <div
          style={{ transform: 'rotate(45deg)', color: '#fff', display: 'flex' }}
        >
          <MIcon name={icon} size={Math.round(size * 0.46)} />
        </div>
      </div>
    </div>
  )
}

function Chip({ color, label, count }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 99,
        padding: '7px 12px',
        boxShadow: 'var(--shadow-sm)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <span
        style={{ width: 9, height: 9, borderRadius: 99, background: color }}
      />
      <span
        style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--muted-foreground)',
        }}
      >
        {count}
      </span>
    </div>
  )
}

const SPOTS = [
  {
    type: 'safe',
    title: '안심 지킴이 집 · GS25 역삼점',
    dist: '도보 1분',
    meta: '80m',
    open: true,
  },
  {
    type: 'cctv',
    title: 'CCTV · 역삼로 12길',
    dist: '12m',
    meta: '방범용',
    open: true,
  },
  {
    type: 'safe',
    title: '안심 지킴이 집 · 세븐약국',
    dist: '도보 2분',
    meta: '140m',
    open: false,
  },
  {
    type: 'cctv',
    title: 'CCTV · 어린이 보호구역',
    dist: '50m',
    meta: '방범용',
    open: true,
  },
]

function MapScreen({ onNavigate }) {
  React.useEffect(() => {
    if (document.getElementById('sm-map-css')) return
    const el = document.createElement('style')
    el.id = 'sm-map-css'
    el.textContent = MAP_CSS
    document.head.appendChild(el)
  }, [])

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--surface)',
      }}
    >
      {/* App bar */}
      <MapAppBar
        title="안전 지도"
        status="현재 위치 기준 · 반경 500m"
        actions={[{ icon: 'layers', label: '레이어' }]}
      />

      {/* Map */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          position: 'relative',
          overflow: 'hidden',
          background: '#e7eae4',
        }}
      >
        {/* roads */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '26%',
            height: 15,
            background: '#fff',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '58%',
            height: 22,
            background: '#fff',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '30%',
            width: 15,
            background: '#fff',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '72%',
            width: 13,
            background: '#fff',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            left: '8%',
            width: 14,
            height: '70%',
            background: '#fff',
            transform: 'rotate(34deg)',
            transformOrigin: 'top left',
          }}
        />
        {/* park + water */}
        <div
          style={{
            position: 'absolute',
            top: '6%',
            right: '6%',
            width: 92,
            height: 80,
            borderRadius: 14,
            background: '#cfe3c0',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-6%',
            left: '-8%',
            width: 150,
            height: 90,
            borderRadius: 20,
            background: '#bdd7ea',
            transform: 'rotate(-12deg)',
          }}
        />
        {/* building blocks */}
        {[
          ['6%', '40%', 54, 38],
          ['44%', '38%', 60, 40],
          ['78%', '34%', 44, 40],
          ['40%', '70%', 70, 44],
          ['8%', '72%', 48, 30],
        ].map(([l, t, w, h], i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: l,
              top: t,
              width: w,
              height: h,
              borderRadius: 8,
              background: '#dadcd4',
            }}
          />
        ))}

        {/* filter chips */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 14,
            right: 14,
            display: 'flex',
            gap: 8,
            zIndex: 8,
          }}
        >
          <Chip color={CCTV} label="CCTV" count="8" />
          <Chip color={SAFE} label="안심 지킴이 집" count="3" />
        </div>

        {/* pins */}
        <Pin color={CCTV} icon="camera" top="36%" left="22%" />
        <Pin color={CCTV} icon="camera" top="30%" left="58%" />
        <Pin color={CCTV} icon="camera" top="64%" left="80%" size={30} />
        <Pin color={CCTV} icon="camera" top="70%" left="40%" size={30} />
        <Pin color={SAFE} icon="home" top="44%" left="68%" size={38} />
        <Pin color={SAFE} icon="home" top="74%" left="18%" size={34} />

        {/* user location */}
        <div
          style={{
            position: 'absolute',
            top: '52%',
            left: '46%',
            transform: 'translate(-50%,-50%)',
            zIndex: 6,
          }}
        >
          <span
            style={{
              position: 'absolute',
              inset: 0,
              margin: 'auto',
              width: 22,
              height: 22,
              borderRadius: 99,
              background: 'var(--coral-400)',
              animation: 'sm-loc-pulse 2.6s ease-out infinite',
            }}
          />
          <span
            style={{
              position: 'relative',
              display: 'block',
              width: 22,
              height: 22,
              borderRadius: 99,
              background: 'var(--coral-500)',
              border: '3px solid #fff',
              boxShadow: 'var(--shadow-md)',
            }}
          />
        </div>

        {/* current-location FAB */}
        <button
          aria-label="현재 위치"
          style={{
            position: 'absolute',
            right: 16,
            bottom: 250,
            width: 46,
            height: 46,
            borderRadius: 14,
            border: '1px solid var(--border)',
            background: 'var(--card)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--coral-600)',
            zIndex: 8,
          }}
        >
          <MIcon name="crosshair" size={22} />
        </button>

        {/* Bottom sheet */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'var(--card)',
            borderTopLeftRadius: 'var(--radius-2xl)',
            borderTopRightRadius: 'var(--radius-2xl)',
            boxShadow: '0 -10px 30px rgba(40,24,24,.10)',
            padding: '10px 16px 14px',
            maxHeight: 236,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9,
          }}
        >
          <div
            style={{
              width: 40,
              height: 5,
              borderRadius: 3,
              background: 'var(--neutral-300)',
              margin: '0 auto 10px',
            }}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 4px 8px',
            }}
          >
            <span style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>
              내 주변 안전 지점
            </span>
            <MapBadge variant="success" dot>
              실시간
            </MapBadge>
          </div>
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
            {SPOTS.map((s, i) => {
              const safe = s.type === 'safe'
              return (
                <React.Fragment key={i}>
                  {i > 0 && <MapDivider />}
                  <MapListItem
                    leading={
                      <span
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 11,
                          background: safe
                            ? 'var(--coral-50)'
                            : 'color-mix(in srgb, var(--blue-info) 12%, #fff)',
                          color: safe ? 'var(--coral-600)' : 'var(--blue-info)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flex: 'none',
                        }}
                      >
                        <MIcon name={safe ? 'home' : 'camera'} size={19} />
                      </span>
                    }
                    title={s.title}
                    subtitle={
                      <span>
                        {s.dist} · {s.meta}
                        {safe && s.open ? (
                          <span
                            style={{ color: 'var(--success)', fontWeight: 600 }}
                          >
                            {' '}
                            · 영업 중
                          </span>
                        ) : null}
                      </span>
                    }
                    chevron
                    onClick={() => {}}
                  />
                </React.Fragment>
              )
            })}
          </div>
        </div>
      </div>

      <MapBottomNav active="map" onNavigate={onNavigate} />
    </div>
  )
}

Object.assign(window, { MapScreen })
