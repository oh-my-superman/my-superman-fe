/* SettingsScreen — 설정 화면. Profile, grouped safety toggles, guardians,
 * call defaults. Built from ListItem + Switch + Avatar + Card. */

const { Avatar, Badge, Card, ListItem, ListDivider, Switch } =
  window.DesignSystem_b303af
const { Icon } = window

function GroupLabel({ children }) {
  return (
    <div
      style={{
        fontSize: 'var(--text-sm)',
        fontWeight: 700,
        color: 'var(--muted-foreground)',
        padding: '0 4px 8px',
      }}
    >
      {children}
    </div>
  )
}
function LeadIcon({ name, tint = 'var(--coral-600)', bg = 'var(--accent)' }) {
  return (
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: 10,
        background: bg,
        color: tint,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name={name} size={19} />
    </div>
  )
}

function SettingsScreen({ onBack }) {
  const [autoReport, setAutoReport] = React.useState(true)
  const [shareLoc, setShareLoc] = React.useState(true)
  const [siren, setSiren] = React.useState(false)

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
      <div
        style={{
          flex: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px 10px',
        }}
      >
        <button
          onClick={onBack}
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
          <Icon name="chevronLeft" size={24} />
        </button>
        <span
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 700,
            letterSpacing: 'var(--tracking-tight)',
          }}
        >
          설정
        </span>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '0 16px 24px',
        }}
      >
        {/* Profile */}
        <Card
          flat
          style={{ borderRadius: 'var(--radius-xl)', marginBottom: 22 }}
        >
          <ListItem
            leading={<Avatar size="lg" fallback="지은" status="online" />}
            title="김지은"
            subtitle="010-••••-1234 · 보호자 2명 연결됨"
            trailing={
              <Badge variant="success" dot>
                안심
              </Badge>
            }
            chevron
            onClick={() => {}}
          />
        </Card>

        <GroupLabel>안전</GroupLabel>
        <Card
          flat
          style={{ borderRadius: 'var(--radius-xl)', marginBottom: 22 }}
        >
          <ListItem
            leading={
              <LeadIcon
                name="alertTriangle"
                tint="var(--destructive)"
                bg="color-mix(in srgb, var(--destructive) 12%, #fff)"
              />
            }
            title="위급 시 자동 신고"
            subtitle="감지 시 10초 뒤 보호자에게 전송"
            trailing={
              <Switch checked={autoReport} onCheckedChange={setAutoReport} />
            }
          />
          <ListDivider />
          <ListItem
            leading={<LeadIcon name="mapPin" />}
            title="실시간 위치 공유"
            trailing={
              <Switch checked={shareLoc} onCheckedChange={setShareLoc} />
            }
          />
          <ListDivider />
          <ListItem
            leading={<LeadIcon name="volume" />}
            title="사이렌 경보"
            subtitle="신고 전 주변에 큰 소리로 알림"
            trailing={<Switch checked={siren} onCheckedChange={setSiren} />}
          />
          <ListDivider />
          <ListItem
            leading={<LeadIcon name="lock" />}
            title="세이프워드"
            trailing={
              <span
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--muted-foreground)',
                }}
              >
                "우산 가져갈게"
              </span>
            }
            chevron
            onClick={() => {}}
          />
        </Card>

        <GroupLabel>보호자</GroupLabel>
        <Card
          flat
          style={{ borderRadius: 'var(--radius-xl)', marginBottom: 22 }}
        >
          <ListItem
            leading={
              <Avatar
                fallback="엄"
                bg="var(--coral-100)"
                fg="var(--coral-700)"
              />
            }
            title="엄마"
            subtitle="010-••••-5678"
            trailing={<Badge variant="accent">1순위</Badge>}
            chevron
            onClick={() => {}}
          />
          <ListDivider />
          <ListItem
            leading={
              <Avatar
                fallback="언니"
                bg="var(--coral-100)"
                fg="var(--coral-700)"
              />
            }
            title="김지수 (언니)"
            subtitle="010-••••-9012"
            chevron
            onClick={() => {}}
          />
          <ListDivider />
          <ListItem
            leading={
              <LeadIcon
                name="plus"
                tint="var(--muted-foreground)"
                bg="var(--neutral-100)"
              />
            }
            title="보호자 추가"
            chevron
            onClick={() => {}}
          />
        </Card>

        <GroupLabel>통화</GroupLabel>
        <Card
          flat
          style={{ borderRadius: 'var(--radius-xl)', marginBottom: 22 }}
        >
          <ListItem
            leading={<LeadIcon name="user" />}
            title="기본 페르소나"
            trailing={
              <span
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--muted-foreground)',
                }}
              >
                엄마
              </span>
            }
            chevron
            onClick={() => {}}
          />
          <ListDivider />
          <ListItem
            leading={<LeadIcon name="phone" />}
            title="위치 기반 자동 전화"
            subtitle="위험 구간 진입 시 먼저 걸려와요"
            trailing={<Switch defaultChecked />}
          />
          <ListDivider />
          <ListItem
            leading={<LeadIcon name="sparkles" />}
            title="대화 주제"
            trailing={
              <span
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--muted-foreground)',
                }}
              >
                일상 · 안부
              </span>
            }
            chevron
            onClick={() => {}}
          />
        </Card>

        <GroupLabel>일반</GroupLabel>
        <Card flat style={{ borderRadius: 'var(--radius-xl)' }}>
          <ListItem
            leading={<LeadIcon name="bell" />}
            title="알림"
            chevron
            onClick={() => {}}
          />
          <ListDivider />
          <ListItem
            leading={<LeadIcon name="shieldCheck" />}
            title="개인정보 처리방침"
            subtitle="녹음은 기기 내에서만 짧게 보관돼요"
            chevron
            onClick={() => {}}
          />
        </Card>
      </div>
    </div>
  )
}

Object.assign(window, { SettingsScreen })
