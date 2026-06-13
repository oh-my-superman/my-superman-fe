/* HomeScreen — the 전화번호부-style home. A roster of call personas
 * ("내 슈퍼맨"), a big "start now" CTA, and scheduled companions. */

const { Avatar, Badge, Card, ListItem, ListDivider, Switch } =
  window.DesignSystem_b303af
const { Icon, BottomNav, AppBar } = window

/* Per-persona call + video-call actions (right side of each row). */
function CallActions({ onCall, onVideo }) {
  const base = {
    width: 38,
    height: 38,
    borderRadius: 99,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flex: 'none',
  }
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button
        aria-label="통화"
        onClick={onCall}
        style={{
          ...base,
          border: '1px solid var(--coral-200)',
          background: 'var(--card)',
          color: 'var(--coral-600)',
        }}
      >
        <Icon name="phone" size={18} />
      </button>
      <button
        aria-label="영상통화"
        onClick={onVideo}
        style={{
          ...base,
          border: 'none',
          background: 'var(--coral-500)',
          color: '#fff',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <Icon name="video" size={19} />
      </button>
    </div>
  )
}

function SectionLabel({ children, action, onAction }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 4px 8px',
      }}
    >
      <span
        style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 700,
          color: 'var(--muted-foreground)',
        }}
      >
        {children}
      </span>
      {action && (
        <button
          onClick={onAction}
          style={{
            border: 'none',
            background: 'none',
            color: 'var(--coral-600)',
            fontWeight: 600,
            fontSize: 'var(--text-sm)',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {action}
        </button>
      )}
    </div>
  )
}

function HomeScreen({
  personas,
  scheduled,
  onSelectPersona,
  onOpenSettings,
  onStartNow,
  onNavigate,
}) {
  const [companion, setCompanion] = React.useState(true)
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--surface)',
      }}
    >
      {/* App bar */}
      <AppBar
        title="나의 슈퍼맨"
        status={
          companion
            ? '슈퍼맨이 동행 중 · 위치 공유 켜짐'
            : '동행 대기 중 · 위치 공유 켜짐'
        }
        actions={[
          { icon: 'bell', label: '알림' },
          { icon: 'settings', label: '설정', onClick: onOpenSettings },
        ]}
      />

      {/* Scroll area */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '0 16px 20px',
        }}
      >
        {/* AI 동행 toggle */}
        <div
          style={{
            marginBottom: 22,
            borderRadius: 'var(--radius-2xl)',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            background: companion
              ? 'linear-gradient(135deg, var(--coral-50), var(--card))'
              : 'var(--card)',
            border: companion
              ? '1px solid var(--coral-200)'
              : '1px solid var(--border)',
            boxShadow: companion ? 'var(--shadow-coral)' : 'var(--shadow-sm)',
            transition:
              'background .2s ease, border-color .2s ease, box-shadow .2s ease',
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 99,
              flex: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: companion ? 'var(--coral-500)' : 'var(--coral-50)',
              color: companion ? '#fff' : 'var(--coral-600)',
              boxShadow: companion ? 'var(--shadow-coral)' : 'none',
              transition: 'background .2s ease',
            }}
          >
            <Icon name="shieldCheck" size={26} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 700,
                letterSpacing: 'var(--tracking-tight)',
              }}
            >
              AI 동행 시작
            </div>
            <div
              style={{
                fontSize: 'var(--text-sm)',
                color: companion
                  ? 'var(--coral-700)'
                  : 'var(--muted-foreground)',
                marginTop: 2,
              }}
            >
              {companion
                ? '슈퍼맨이 곁에서 함께 걷고 있어요'
                : '탭 한 번으로 AI 동행을 켜세요'}
            </div>
          </div>
          <Switch checked={companion} onCheckedChange={setCompanion} />
        </div>

        {/* Personas */}
        <SectionLabel action="편집" onAction={() => { }}>
          내 슈퍼맨
        </SectionLabel>
        <div
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--muted-foreground)',
            padding: '0 4px 10px',
          }}
        >
          다양한 AI 페르소나와 통화
        </div>
        <Card
          flat
          style={{ borderRadius: 'var(--radius-xl)', marginBottom: 22 }}
        >
          {personas.map((p, i) => (
            <React.Fragment key={p.id}>
              {i > 0 && <ListDivider />}
              <ListItem
                leading={
                  <Avatar
                    fallback={p.glyph}
                    bg={p.bg}
                    fg={p.fg}
                    status={p.status}
                  />
                }
                title={p.name}
                subtitle={p.tagline}
                trailing={
                  <CallActions
                    onCall={() => onSelectPersona(p)}
                    onVideo={() => onSelectPersona(p)}
                  />
                }
              />
            </React.Fragment>
          ))}
          <ListDivider />
          <ListItem
            leading={
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 99,
                  border: '1.5px dashed var(--neutral-300)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--muted-foreground)',
                }}
              >
                <Icon name="plus" size={20} />
              </div>
            }
            title="새 페르소나 만들기"
            subtitle="성격 · 말투 · 호칭을 직접 설정"
            chevron
            onClick={() => { }}
          />
        </Card>

        {/* Scheduled */}
        <SectionLabel>예약된 동행</SectionLabel>
        <Card flat style={{ borderRadius: 'var(--radius-xl)' }}>
          {scheduled.map((s, i) => (
            <React.Fragment key={s.id}>
              {i > 0 && <ListDivider />}
              <ListItem
                leading={
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 99,
                      background: 'var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--coral-600)',
                    }}
                  >
                    <Icon name="clock" size={20} />
                  </div>
                }
                title={s.title}
                subtitle={s.when}
                trailing={<Badge variant="accent">{s.persona}</Badge>}
                chevron
                onClick={() => { }}
              />
            </React.Fragment>
          ))}
        </Card>
      </div>

      {/* Bottom tab bar */}
      <BottomNav active="home" onNavigate={onNavigate} />
    </div>
  )
}

const iconBtn = {
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

Object.assign(window, { HomeScreen })
