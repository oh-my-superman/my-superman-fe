import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { AppBar } from '#/components/app-bar'
import { BottomNav } from '#/components/bottom-nav'
import { Bell } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useCompanionSession } from '#/features/companion/session-store'
import type { CompanionStatus } from '#/features/companion/companion-socket'
import { useCompanionStore } from '#/store/companion'
import { startProtectionCoordinator } from '#/features/protection/protection-store'

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

export function MainLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const companion = useCompanionStore((s) => s.companion)
  const sessionStatus = useCompanionSession((s) => s.status)
  const startSession = useCompanionSession((s) => s.startSession)
  const endSession = useCompanionSession((s) => s.endSession)

  // Drive background protection-voice streaming (보호모드 → voice frames,
  // paused during calls). Idempotent — only the first call wires it up.
  useEffect(() => {
    startProtectionCoordinator()
  }, [])

  useEffect(() => {
    if (companion) void startSession(true)
    else void endSession()
  }, [companion, startSession, endSession])

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
