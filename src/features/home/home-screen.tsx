import { useNavigate } from '@tanstack/react-router'
import { useRef, useEffect } from 'react'
import { Phone, Plus, Video } from 'lucide-react'
import type { ReactNode } from 'react'

import { Avatar } from '#/components/ui/avatar'
import { Card } from '#/components/ui/card'
import { ListDivider, ListItem } from '#/components/ui/list-item'
import { MainLayout } from '#/components/main-layout'
import { PERSONAS } from '#/features/home/personas'
import { useCompanionSession } from '#/features/companion/session-store'
import { useCompanionStore } from '#/store/companion'

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
  const companion = useCompanionStore((s) => s.companion)
  const setCompanion = useCompanionStore((s) => s.setCompanion)
  const startSession = useCompanionSession((s) => s.startSession)
  const endSession = useCompanionSession((s) => s.endSession)
  const videoRef = useRef<HTMLVideoElement>(null)

  const callPersona = (id: string) =>
    navigate({ to: '/call/$personaId', params: { personaId: id } })

  // 보호모드 ⇔ realtime session: ON opens `/ws/companion` (session.start), OFF
  // ends it (session.end). The session itself is an app-wide singleton, so it
  // survives route changes and mobile background/resume — only an explicit OFF
  // tears it down.
  useEffect(() => {
    if (companion) void startSession(true)
    else void endSession()
  }, [companion, startSession, endSession])

  useEffect(() => {
    if (videoRef.current) {
      if (companion) {
        videoRef.current.play().catch(() => {
          // Autoplay might be blocked until user interaction
        })
      } else {
        videoRef.current.pause()
        videoRef.current.currentTime = 0
      }
    }
  }, [companion])

  return (
    <MainLayout>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '0 16px 20px',
        }}
      >
        {/* Large Superman Hero Toggle */}
        <div
          onClick={() => setCompanion(!companion)}
          style={{
            marginTop: 16,
            marginBottom: 32,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: 240,
              height: 240,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Pulse effect when ON */}
            {companion && (
              <>
                <div
                  className="animate-sm-hero-pulse"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    background: 'var(--coral-200)',
                    zIndex: 0,
                  }}
                />
                <div
                  className="animate-sm-hero-pulse"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    background: 'var(--coral-100)',
                    zIndex: 0,
                    animationDelay: '1.5s',
                  }}
                />
              </>
            )}

            {/* Circular Video Container */}
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: '#ffffff',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 1,
                border: 'none',
                boxShadow: companion ? 'var(--shadow-coral)' : 'none',
                transition: 'all .4s ease',
              }}
            >
              <video
                ref={videoRef}
                src="/video/flying_superman.mp4"
                muted
                playsInline
                style={{
                  width: '120%',
                  height: '120%',
                  objectFit: 'cover',
                  transform: companion
                    ? 'scale(1) translateY(+10px)'
                    : 'scale(1)',
                  transition: 'transform .5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  mixBlendMode: 'multiply',
                }}
                onTimeUpdate={() => {
                  // Loop from 5.7s to end when active
                  if (
                    companion &&
                    videoRef.current &&
                    videoRef.current.currentTime >=
                      videoRef.current.duration - 0.2
                  ) {
                    videoRef.current.currentTime = 5.7
                  }
                }}
                onEnded={() => {
                  if (companion && videoRef.current) {
                    videoRef.current.currentTime = 5.7
                    videoRef.current.play()
                  }
                }}
              />
            </div>
          </div>

          <div
            style={{
              marginTop: 16,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 800,
                color: companion ? 'var(--coral-600)' : 'var(--foreground)',
                marginBottom: 4,
              }}
            >
              {companion ? '보호모드 활성' : '보호모드 비활성'}
            </div>
            <div
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--muted-foreground)',
              }}
            >
              {companion
                ? '위험한 상황을 감지하고 있어요.'
                : '탭하여 안전모드를 활성화하세요'}
            </div>
          </div>
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
          style={{
            borderRadius: 'var(--radius-xl)',
            marginBottom: 22,
            border: 'none',
          }}
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
      </div>
    </MainLayout>
  )
}
