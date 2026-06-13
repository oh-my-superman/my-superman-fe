import { createFileRoute } from '@tanstack/react-router'
import { Settings as SettingsIcon } from 'lucide-react'

import { AppBar } from '#/components/app-bar'
import { BottomNav } from '#/components/bottom-nav'

export const Route = createFileRoute('/settings')({ component: SettingsScreen })

/** Placeholder — full settings screen is out of scope for this handoff. */
function SettingsScreen() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--surface)',
      }}
    >
      <AppBar title="설정" />
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
      <BottomNav />
    </div>
  )
}
