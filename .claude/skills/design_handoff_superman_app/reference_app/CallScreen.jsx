/* CallScreen — an in-progress AI companion call. Pulsing persona avatar,
 * live timer, AI caption, and call controls. The red action opens the
 * report flow (세이프워드 / 위급). */

const { Avatar, Badge, Button } = window.DesignSystem_b303af
const { Icon } = window

const PULSE_CSS = `
@keyframes sm-call-pulse{0%{transform:scale(1);opacity:.5}70%{transform:scale(1.6);opacity:0}100%{opacity:0}}
@keyframes sm-call-pulse2{0%{transform:scale(1);opacity:.35}70%{transform:scale(2);opacity:0}100%{opacity:0}}
.sm-pulse-ring{position:absolute;inset:0;border-radius:99px;background:var(--coral-400);}
`

const CAPTIONS = [
  '응 엄마, 나 지금 골목 들어왔어.',
  '거의 다 왔지? 천천히 와, 기다리고 있을게.',
  '오늘 하루는 어땠어? 별일 없었고?',
  '응, 지하철역 앞이지? 거기서 5분이면 도착이네.',
]

function ControlButton({ icon, label, onClick, active, danger }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 7,
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
        color: 'var(--neutral-700)',
      }}
    >
      <span
        style={{
          width: 58,
          height: 58,
          borderRadius: 99,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: active ? 'var(--neutral-800)' : 'var(--neutral-100)',
          color: active ? '#fff' : 'var(--neutral-700)',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <Icon name={icon} size={24} />
      </span>
      <span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span>
    </button>
  )
}

function CallScreen({ persona, onEnd, onEmergency }) {
  React.useEffect(() => {
    if (document.getElementById('sm-call-css')) return
    const el = document.createElement('style')
    el.id = 'sm-call-css'
    el.textContent = PULSE_CSS
    document.head.appendChild(el)
  }, [])
  const [secs, setSecs] = React.useState(42)
  const [muted, setMuted] = React.useState(false)
  const [caption, setCaption] = React.useState(0)
  React.useEffect(() => {
    const t = setInterval(() => setSecs((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [])
  React.useEffect(() => {
    const t = setInterval(
      () => setCaption((c) => (c + 1) % CAPTIONS.length),
      3800,
    )
    return () => clearInterval(t)
  }, [])
  const mm = String(Math.floor(secs / 60)).padStart(2, '0')
  const ss = String(secs % 60).padStart(2, '0')

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background:
          'linear-gradient(180deg, var(--coral-50) 0%, var(--surface) 46%)',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          flex: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 18px',
        }}
      >
        <button
          onClick={onEnd}
          aria-label="뒤로"
          style={{
            width: 40,
            height: 40,
            border: 'none',
            background: 'transparent',
            borderRadius: 99,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--foreground)',
          }}
        >
          <Icon name="chevronDown" size={24} />
        </button>
        <Badge variant="success" dot>
          동행 중 · 안전
        </Badge>
        <span style={{ width: 40 }} />
      </div>

      {/* Persona */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 18,
          padding: '0 28px',
        }}
      >
        <div style={{ position: 'relative', width: 120, height: 120 }}>
          <span
            className="sm-pulse-ring"
            style={{ animation: 'sm-call-pulse 2.4s ease-out infinite' }}
          />
          <span
            className="sm-pulse-ring"
            style={{ animation: 'sm-call-pulse2 2.4s ease-out infinite .6s' }}
          />
          <div style={{ position: 'relative' }}>
            <Avatar
              size="xl"
              fallback={persona.glyph}
              bg={persona.bg}
              fg={persona.fg}
              status="online"
              style={{ width: 120, height: 120, boxShadow: 'var(--shadow-lg)' }}
            />
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 700,
              letterSpacing: 'var(--tracking-tight)',
            }}
          >
            {persona.name}
          </div>
          <div
            style={{
              fontSize: 'var(--text-base)',
              color: 'var(--muted-foreground)',
              marginTop: 4,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {mm}:{ss}
          </div>
        </div>

        {/* Live caption */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: '12px 16px',
            boxShadow: 'var(--shadow-sm)',
            maxWidth: 320,
          }}
        >
          <Icon
            name="sparkles"
            size={16}
            color="var(--coral-500)"
            style={{ marginTop: 2 }}
          />
          <span
            style={{
              fontSize: 'var(--text-sm)',
              lineHeight: 1.45,
              color: 'var(--foreground)',
            }}
          >
            {CAPTIONS[caption]}
          </span>
        </div>
        <div
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--muted-foreground)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Icon name="lock" size={13} /> 세이프워드 감지 시 자동으로
          보호해드려요
        </div>
      </div>

      {/* Controls */}
      <div style={{ flex: 'none', padding: '0 28px 8px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            marginBottom: 22,
          }}
        >
          <ControlButton
            icon={muted ? 'micOff' : 'mic'}
            label={muted ? '음소거됨' : '음소거'}
            active={muted}
            onClick={() => setMuted((m) => !m)}
          />
          <ControlButton icon="video" label="영상통화" onClick={() => {}} />
          <ControlButton
            icon="volume"
            label="스피커"
            active
            onClick={() => {}}
          />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button variant="destructive" size="lg" block onClick={onEmergency}>
            <Icon name="alertTriangle" size={20} /> 위급 · 신고
          </Button>
          <button
            onClick={onEnd}
            aria-label="통화 종료"
            style={{
              width: 64,
              flex: 'none',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--neutral-800)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Icon name="phoneOff" size={24} />
          </button>
        </div>
      </div>
    </div>
  )
}

Object.assign(window, { CallScreen })
