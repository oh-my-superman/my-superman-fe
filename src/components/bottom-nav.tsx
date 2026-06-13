import { useNavigate, useRouterState } from '@tanstack/react-router'
import { Map, Phone, Shield } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Tab {
  to: string
  icon: LucideIcon
  label: string
  /** Center emphasis (raised round button). */
  primary?: boolean
}

const TABS: Array<Tab> = [
  { to: '/', icon: Phone, label: '슈퍼 통화' },
  { to: '/protection', icon: Shield, label: '슈퍼맨', primary: true },
  { to: '/map', icon: Map, label: '안전 지도' },
]

/** Shared tab bar: 통화 · 슈퍼맨(중앙 강조) · 지도. Active tab derived from the route. */
export function BottomNav() {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <div
      style={{
        flex: 'none',
        display: 'flex',
        alignItems: 'stretch',
        background: 'var(--background)',
        padding: '8px 0 8px',
        position: 'relative',
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
                  width: 56,
                  height: 56,
                  borderRadius: 99,
                  background: active ? 'var(--coral-600)' : 'var(--coral-500)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '4px solid var(--background)',
                  boxShadow: 'var(--shadow-coral)',
                  transition: 'background-color .15s ease',
                }}
              >
                <TabIcon size={26} fill="currentColor" />
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--coral-600)',
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
