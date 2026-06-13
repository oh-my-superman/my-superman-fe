import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'

interface ListItemProps {
  leading?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  trailing?: ReactNode
  /** Show a trailing chevron. */
  chevron?: boolean
  onClick?: () => void
}

/**
 * Row primitive behind the 전화번호부-style home and the map bottom sheet:
 * left slot (avatar/icon) · title + subtitle · right slot (chevron/switch/meta).
 */
export function ListItem({
  leading,
  title,
  subtitle,
  trailing,
  chevron = false,
  onClick,
}: ListItemProps) {
  const pressable = !!onClick

  const body = (
    <>
      {leading != null && <span data-sm-part="li-left">{leading}</span>}
      <span data-sm-part="li-body">
        <span data-sm-part="li-title">{title}</span>
        {subtitle != null && <span data-sm-part="li-sub">{subtitle}</span>}
      </span>
      {(trailing != null || chevron) && (
        <span data-sm-part="li-right">
          {trailing}
          {chevron && (
            <ChevronRight
              size={18}
              strokeWidth={2.2}
              style={{ opacity: 0.55 }}
            />
          )}
        </span>
      )}
    </>
  )

  if (pressable) {
    return (
      <button
        type="button"
        data-sm-slot="list-item"
        data-pressable="true"
        onClick={onClick}
      >
        {body}
      </button>
    )
  }
  return <div data-sm-slot="list-item">{body}</div>
}

export function ListDivider({ inset = false }: { inset?: boolean }) {
  return (
    <hr
      data-sm-slot="list-divider"
      style={inset ? { marginLeft: 72 } : undefined}
    />
  )
}
