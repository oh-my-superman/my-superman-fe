import type { LucideIcon } from 'lucide-react'

export interface AppBarAction {
  icon: LucideIcon
  label: string
  onClick?: () => void
}

interface AppBarProps {
  title: string
  /** Optional live-status line under the title (with a green dot). */
  status?: string
  actions?: Array<AppBarAction>
}

const iconBtn: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 99,
  border: 'none',
  background: 'transparent',
  color: 'var(--foreground)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
}

/**
 * Shared header for the main tabs (메인 · 지도): brand shield + screen title,
 * an optional live-status line, and right-side icon actions.
 */
export function AppBar({ title, status, actions = [] }: AppBarProps) {
  return (
    <div style={{ flex: 'none', background: 'var(--surface)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px 0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img
            src="/image/superman_app_icon.svg"
            alt="슈퍼맨 로고"
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              flex: 'none',
              boxShadow: 'var(--shadow-coral)',
            }}
          />
          <span
            style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 700,
              letterSpacing: 'var(--tracking-tight)',
            }}
          >
            {title}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {actions.map((a) => {
            const ActionIcon = a.icon
            return (
              <button
                key={a.label}
                type="button"
                aria-label={a.label}
                onClick={a.onClick}
                style={iconBtn}
              >
                <ActionIcon size={21} />
              </button>
            )
          })}
        </div>
      </div>
      {status && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 22px 14px',
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 99,
              background: 'var(--success)',
              flex: 'none',
            }}
          />
          <span
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--muted-foreground)',
            }}
          >
            {status}
          </span>
        </div>
      )}
    </div>
  )
}
