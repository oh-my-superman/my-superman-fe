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
 * Note: Uses <div> instead of <button> even when clickable to allow nested interactive elements.
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

  return (
    <div
      data-sm-slot="list-item"
      data-pressable={pressable ? 'true' : undefined}
      onClick={onClick}
      role={pressable ? 'button' : undefined}
      tabIndex={pressable ? 0 : undefined}
    >
      {leading != null && (
        <div data-sm-part="li-left">
          {leading}
        </div>
      )}
      <div data-sm-part="li-body">
        <div data-sm-part="li-title">
          {title}
        </div>
        {subtitle != null && (
          <div data-sm-part="li-sub">
            {subtitle}
          </div>
        )}
      </div>
      {(trailing != null || chevron) && (
        <div data-sm-part="li-right">
          {trailing}
          {chevron && (
            <ChevronRight
              size={18}
              strokeWidth={2.2}
              style={{ opacity: 0.55 }}
            />
          )}
        </div>
      )}
    </div>
  )
}

export function ListDivider({ inset = false }: { inset?: boolean }) {
  return (
    <hr
      data-sm-slot="list-divider"
      style={inset ? { marginLeft: 72 } : undefined}
    />
  )
}
