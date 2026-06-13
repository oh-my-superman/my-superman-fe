import { useNavigate, useRouterState } from '@tanstack/react-router'
import { Map, Phone, Settings } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Tab {
  to: string
  icon: LucideIcon
  label: string
}

const TABS: Array<Tab> = [
  { to: '/', icon: Phone, label: '메인' },
  { to: '/map', icon: Map, label: '지도' },
  { to: '/settings', icon: Settings, label: '설정' },
]

/** Shared tab bar: 메인 · 지도 · 설정. Active tab derived from the route. */
export function BottomNav() {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <div
      style={{
        flex: 'none',
        display: 'flex',
        borderTop: 'none',
        background: 'var(--background)',
        padding: '8px 0 4px',
      }}
    >
      {TABS.map((t) => {
        const active =
          t.to === '/' ? pathname === '/' : pathname.startsWith(t.to)
        const TabIcon = t.icon
        return (
          <button
            key={t.to}
            type="button"
            onClick={() => navigate({ to: t.to })}
            style={{
              flex: 1,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              fontFamily: 'var(--font-sans)',
              color: active ? 'var(--coral-600)' : 'var(--muted-foreground)',
            }}
          >
            <TabIcon size={22} fill="currentColor" />
            <span style={{ fontSize: 11, fontWeight: 600 }}>{t.label}</span>
          </button>
        )
      })}
    </div>
  )
}
