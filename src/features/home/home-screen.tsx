import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Bell,
  Clock,
  Phone,
  Plus,
  Settings,
  Video,
} from 'lucide-react'
import type { ReactNode } from 'react'

import { Avatar } from '#/components/ui/avatar'
import { Badge } from '#/components/ui/badge'
import { Card } from '#/components/ui/card'
import { ListDivider, ListItem } from '#/components/ui/list-item'
import { Switch } from '#/components/ui/switch'
import { AppBar } from '#/components/app-bar'
import { BottomNav } from '#/components/bottom-nav'
import { PERSONAS, SCHEDULED } from '#/features/home/personas'

/** Per-persona call + video-call actions (right side of each roster row). */
function CallActions({
  onCall,
  onVideo,
}: {
  onCall: () => void
  onVideo: () => void
}) {
  const base: React.CSSProperties = {
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
        type="button"
        aria-label="통화"
        onClick={onCall}
        style={{
          ...base,
          border: '1px solid var(--coral-200)',
          background: 'var(--card)',
          color: 'var(--coral-600)',
        }}
      >
        <Phone size={18} />
      </button>
      <button
        type="button"
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
        <Video size={19} />
      </button>
    </div>
  )
}

function SectionLabel({
  children,
  action,
  onAction,
}: {
  children: ReactNode
  action?: string
  onAction?: () => void
}) {
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
          type="button"
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

/**
 * 메인 화면 — the 전화번호부-style home: a big AI-companion toggle, a roster of
 * call personas ("내 슈퍼맨"), and scheduled companions.
 */
export function HomeScreen() {
  const navigate = useNavigate()
  const [companion, setCompanion] = useState(true)

  const callPersona = (id: string) =>
    navigate({ to: '/call/$personaId', params: { personaId: id } })

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--surface)',
      }}
    >
      <AppBar
        title="나의 슈퍼맨"
        status={
          companion
            ? '슈퍼맨이 동행 중 · 위치 공유 켜짐'
            : '동행 대기 중 · 위치 공유 켜짐'
        }
        actions={[
          { icon: Bell, label: '알림' },
          {
            icon: Settings,
            label: '설정',
            onClick: () => navigate({ to: '/settings' }),
          },
        ]}
      />

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
              boxShadow: companion ? 'var(--shadow-coral)' : 'none',
              transition: 'background .2s ease',
              overflow: 'hidden',
            }}
          >
            <img
              src="/image/superman_app_icon.svg"
              alt="메인 화면 아이콘"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: companion ? 1 : 0.6,
                transition: 'opacity .2s ease',
              }}
            />
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
          <Switch
            checked={companion}
            onCheckedChange={setCompanion}
            aria-label="AI 동행"
          />
        </div>

        {/* Personas */}
        <SectionLabel action="편집" onAction={() => {}}>
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
          {PERSONAS.map((p, i) => (
            <div key={p.id}>
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
                    onCall={() => callPersona(p.id)}
                    onVideo={() => callPersona(p.id)}
                  />
                }
              />
            </div>
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
                <Plus size={20} />
              </div>
            }
            title="새 페르소나 만들기"
            subtitle="성격 · 말투 · 호칭을 직접 설정"
            chevron
            onClick={() => {}}
          />
        </Card>

        {/* Scheduled */}
        <SectionLabel>예약된 동행</SectionLabel>
        <Card flat style={{ borderRadius: 'var(--radius-xl)' }}>
          {SCHEDULED.map((s, i) => (
            <div key={s.id}>
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
                    <Clock size={20} />
                  </div>
                }
                title={s.title}
                subtitle={s.when}
                trailing={<Badge variant="accent">{s.persona}</Badge>}
                chevron
                onClick={() => {}}
              />
            </div>
          ))}
        </Card>
      </div>

      <BottomNav />
    </div>
  )
}
