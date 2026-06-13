import type { LucideIcon } from 'lucide-react'

export interface AppBarAction {
  icon: LucideIcon
  label: string
  onClick?: () => void
}

interface AppBarProps {
  title: string
  /** Optional status label (e.g. "보호모드") */
  status?: string
  /** Optional status value (e.g. "ON", "OFF") shown in a chip. */
  statusValue?: string
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
  statusValue,
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
          padding: '18px 18px',
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
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {status && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--neutral-500)',
                  letterSpacing: '-0.01em',
                }}
              >
                {status}
              </span>
              <div
                className={statusActive ? 'animate-sm-chip-pulse' : ''}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '4px 10px',
                  background: statusActive
                    ? 'rgba(240, 128, 128, 0.7)'
                    : 'var(--neutral-100)',
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
                    fontSize: 10,
                    fontWeight: 900,
                    color: statusActive ? '#ffffff' : 'var(--muted-foreground)',
                    letterSpacing: '0.02em',
                  }}
                >
                  {statusValue || (statusActive ? 'ON' : 'OFF')}
                </span>
              </div>
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
