import type { ReactNode } from 'react'
import { AppBar } from '#/components/app-bar'
import { BottomNav } from '#/components/bottom-nav'
import { Bell, Settings } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useCompanionStore } from '#/store/companion'

export function MainLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const companion = useCompanionStore((s) => s.companion)

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
          status={
            companion ? '보호모드 활성화 · 위험상황 감지 중' : '보호모드 비활성'
          }
          statusActive={companion}
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
