import { useNavigate } from '@tanstack/react-router'
import { Phone, Plus, Video } from 'lucide-react'
import type { ReactNode } from 'react'

import { Avatar } from '#/components/ui/avatar'
import { ListDivider, ListItem } from '#/components/ui/list-item'
import { MainLayout } from '#/components/main-layout'
import { PERSONAS } from '#/features/home/personas'

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
 * 통화 화면 — a roster of call personas ("내 슈퍼맨").
 */
export function CallScreen() {
  const navigate = useNavigate()

  const callPersona = (id: string, video = false) =>
    navigate({
      to: '/call/$personaId',
      params: { personaId: id },
      search: { video },
    })

  return (
    <MainLayout>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          background: 'var(--card)', // Typically white
        }}
      >
        <div style={{ padding: '16px 20px 8px' }}>
          <SectionLabel action="편집" onAction={() => {}}>
            내 슈퍼맨
          </SectionLabel>
          <div
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--muted-foreground)',
              padding: '0 4px',
            }}
          >
            다양한 AI 페르소나와 통화
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          {PERSONAS.map((p, i) => (
            <div key={p.id}>
              {i > 0 && <ListDivider inset />}
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
                    onVideo={() => callPersona(p.id, true)}
                  />
                }
              />
            </div>
          ))}
          <ListDivider inset />
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
        </div>
      </div>
    </MainLayout>
  )
}
