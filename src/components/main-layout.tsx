import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { AppBar } from '#/components/app-bar'
import { BottomNav } from '#/components/bottom-nav'
import { useCompanionSession } from '#/features/companion/session-store'
import { useCompanionStore } from '#/store/companion'
import { startProtectionCoordinator } from '#/features/protection/protection-store'

export function MainLayout({ children }: { children: ReactNode }) {
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
          status="보호모드"
          statusValue={companion ? 'ON' : 'OFF'}
          statusActive={companion && sessionStatus !== 'error'}
          actions={[]}
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
