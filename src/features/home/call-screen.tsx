import { useNavigate } from '@tanstack/react-router'
import { Phone, Plus } from 'lucide-react'
import type { ReactNode } from 'react'

import { Avatar } from '#/components/ui/avatar'
import { ListDivider, ListItem } from '#/components/ui/list-item'
import { MainLayout } from '#/components/main-layout'
import { PERSONAS } from '#/features/home/personas'

/** Per-persona single call action (right side of each roster row). */
function CallAction({ onCall }: { onCall: () => void }) {
  return (
    <div
      className="call-actions-group"
      style={{ display: 'flex', flexShrink: 0, alignItems: 'center' }}
    >
      <button
        type="button"
        className="call-action-btn"
        data-variant="voice"
        aria-label="통화"
        onClick={(e) => {
          e.stopPropagation()
          onCall()
        }}
        style={{
          width: 40,
          height: 40,
          background: 'transparent',
          color: 'var(--neutral-400)',
          border: 'none',
          boxShadow: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'var(--neutral-100)'
          e.currentTarget.style.color = 'var(--neutral-600)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--neutral-400)'
        }}
        >
        <Phone size={22} />
        </button>
    </div>
  )
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        padding: '24px 20px 8px',
      }}
    >
      <span
        style={{
          fontSize: 'var(--text-xs)',
          fontWeight: 700,
          color: 'var(--coral-500)',
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
        }}
      >
        {children}
      </span>
    </div>
  )
}

/**
 * 통화 화면 — Galaxy Contacts style roster.
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
          background: '#ffffff',
        }}
      >
        <div style={{ padding: '32px 24px 16px' }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: 'var(--foreground)',
              margin: 0,
            }}
          >
            내 슈퍼맨
          </h1>
          <p
            style={{
              fontSize: 13,
              color: 'var(--neutral-500)',
              marginTop: 6,
              fontWeight: 500,
              lineHeight: 1.5,
              wordBreak: 'keep-all',
            }}
          >
            위험 상황 시 AI 슈퍼맨과 통화하세요. 모든 대화 맥락과 세이프 단어를
            실시간으로 분석하여 당신의 안전을 지켜드립니다.
          </p>
        </div>

        <SectionLabel>최근 통화 또는 즐겨찾기</SectionLabel>

        <div style={{ paddingBottom: 40 }}>
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
                    size="default"
                  />
                }
                title={
                  <span style={{ fontSize: 17, fontWeight: 600 }}>
                    {p.name}
                  </span>
                }
                subtitle={p.tagline}
                trailing={<CallAction onCall={() => callPersona(p.id)} />}
                onClick={() => callPersona(p.id)}
              />
            </div>
          ))}

          <div style={{ padding: '24px 20px' }}>
            <button
              onClick={() => {}}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: 16,
                background: 'var(--neutral-50)',
                border: '1px dashed var(--neutral-300)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                color: 'var(--neutral-600)',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Plus size={20} strokeWidth={2.5} />새 페르소나 만들기
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
