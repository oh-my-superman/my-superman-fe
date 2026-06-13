import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { AppBar } from '#/components/app-bar'
import { BottomNav } from '#/components/bottom-nav'
import { Bell, Settings } from 'lucide-react'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useCompanionSession } from '#/features/companion/session-store'
import type { CompanionStatus } from '#/features/companion/companion-socket'
import { useCompanionStore } from '#/store/companion'

function companionStatusLabel(
  companion: boolean,
  status: CompanionStatus,
): string {
  if (!companion) return '보호모드 비활성'
  if (status === 'ready') return '보호모드 활성화 · 서비스 연결됨'
  if (status === 'connecting') return '보호모드 활성화 · 서비스 연결 중'
  if (status === 'closing') return '보호모드 종료 중'
  if (status === 'error') return '보호모드 활성화 · 서비스 연결 실패'
  return '보호모드 활성화'
}

function screenName(pathname: string): string {
  if (pathname === '/') return 'home'
  if (pathname.startsWith('/map')) return 'map'
  if (pathname.startsWith('/settings')) return 'settings'
  return 'unknown'
}

export function MainLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const companion = useCompanionStore((s) => s.companion)
  const sessionStatus = useCompanionSession((s) => s.status)
  const sessionId = useCompanionSession((s) => s.sessionId)
  const startSession = useCompanionSession((s) => s.startSession)
  const endSession = useCompanionSession((s) => s.endSession)
  const sendCompanionFrame = useCompanionSession((s) => s.send)

  useEffect(() => {
    if (companion) void startSession(true)
    else void endSession()
  }, [companion, startSession, endSession])

  useEffect(() => {
    if (!companion || sessionStatus !== 'ready' || !sessionId) return
    sendCompanionFrame({
      type: 'screen.view',
      session_id: sessionId,
      data: {
        screen: screenName(pathname),
        path: pathname,
        timestamp: new Date().toISOString(),
      },
    })
  }, [companion, pathname, sendCompanionFrame, sessionId, sessionStatus])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--surface)',
      }}
    >
      <div style={{ background: '#ffffff', flex: 'none' }}>
        <AppBar
          title="나의 슈퍼맨"
          status={companionStatusLabel(companion, sessionStatus)}
          statusActive={companion && sessionStatus !== 'error'}
          actions={[
            { icon: Bell, label: '알림' },
            {
              icon: Settings,
              label: '설정',
              onClick: () => navigate({ to: '/settings' }),
            },
          ]}
        />
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </div>

      <BottomNav />
    </div>
  )
}
