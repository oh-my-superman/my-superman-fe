import { useNavigate, useRouterState } from '@tanstack/react-router'
import { Map, Phone, Shield } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { useCompanionStore } from '#/store/companion'

interface Tab {
  to: string
  icon: LucideIcon
  label: string
  /** Center emphasis (raised round button). */
  primary?: boolean
}

const TABS: Array<Tab> = [
  { to: '/', icon: Phone, label: '슈퍼 통화' },
  { to: '/protection', icon: Shield, label: '보호 모드', primary: true },
  { to: '/map', icon: Map, label: '안전 지도' },
]

/** Shared tab bar: 통화 · 슈퍼맨(중앙 강조) · 지도. Active tab derived from the route. */
export function BottomNav() {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  // 보호모드 ON → coral-filled (활성), OFF → white circle.
  const companion = useCompanionStore((s) => s.companion)

  return (
    <div
      style={{
        flex: 'none',
        display: 'flex',
        alignItems: 'stretch',
        background: 'var(--background)',
        padding: '8px 0 8px',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {TABS.map((t) => {
        const active =
          t.to === '/' ? pathname === '/' : pathname.startsWith(t.to)
        const TabIcon = t.icon

        if (t.primary) {
          return (
            <button
              key={t.to}
              type="button"
              aria-label={t.label}
              onClick={() => navigate({ to: t.to })}
              style={{
                flex: 1,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 4,
                fontFamily: 'var(--font-sans)',
              }}
            >
              <div
                style={{
                  marginTop: -30,
                  width: 42,
                  height: 42,
                  borderRadius: 99,
                  background: companion ? 'var(--coral-500)' : 'var(--card)',
                  color: companion ? '#fff' : 'var(--coral-500)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: companion
                    ? '4px solid var(--background)'
                    : '2px solid var(--coral-200)',
                  boxShadow: companion
                    ? 'var(--shadow-coral)'
                    : 'var(--shadow-md)',
                  transition: 'background-color .15s ease, color .15s ease',
                }}
              >
                <TabIcon size={26} fill="currentColor" />
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  // Pink only on the protection screen; muted elsewhere.
                  color: active
                    ? 'var(--coral-600)'
                    : 'var(--muted-foreground)',
                }}
              >
                {t.label}
              </span>
            </button>
          )
        }

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
              justifyContent: 'flex-end',
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
