import type { ReactNode } from 'react'

export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'outline'
  | 'success'
  | 'danger'
  | 'warning'
  | 'accent'

interface BadgeProps {
  variant?: BadgeVariant
  /** Leading status dot (uses currentColor). */
  dot?: boolean
  className?: string
  children: ReactNode
}

/** Status pill. shadcn Badge model, coral brand. */
export function Badge({
  variant = 'default',
  dot = false,
  className,
  children,
}: BadgeProps) {
  return (
    <span data-sm-slot="badge" data-variant={variant} className={className}>
      {dot ? <span data-sm-part="dot" /> : null}
      {children}
    </span>
  )
}
