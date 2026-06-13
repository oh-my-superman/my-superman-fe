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
  statusActive?: boolean
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
export function AppBar({
  title,
  status,
  statusActive = true,
  actions = [],
}: AppBarProps) {
  return (
    <div style={{ flex: 'none', background: '#ffffff' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px 12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img
            src="/image/my-superman-logo.svg"
            alt={title}
            style={{
              height: 16,
              objectFit: 'contain',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {status && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 10px',
                background: 'rgba(0, 0, 0, 0.05)',
                border: 'none',
                borderRadius: 99,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 99,
                  background: statusActive
                    ? 'var(--success)'
                    : 'var(--muted-foreground)',
                  flex: 'none',
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: statusActive ? 'var(--muted-foreground)' : '#928c86',
                }}
              >
                {status}
              </span>
            </div>
          )}
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
    </div>
  )
}
