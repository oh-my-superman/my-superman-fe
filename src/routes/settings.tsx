import { createFileRoute } from '@tanstack/react-router'
import { Settings as SettingsIcon } from 'lucide-react'

import { MainLayout } from '#/components/main-layout'

export const Route = createFileRoute('/settings')({ component: SettingsScreen })

/** Placeholder — full settings screen is out of scope for this handoff. */
function SettingsScreen() {
  return (
    <MainLayout>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          color: 'var(--muted-foreground)',
          padding: 24,
          textAlign: 'center',
        }}
      >
        <SettingsIcon size={32} />
        <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>
          설정 화면 준비 중
        </p>
      </div>
    </MainLayout>
  )
}
