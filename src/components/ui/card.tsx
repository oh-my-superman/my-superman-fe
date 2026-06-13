import type { CSSProperties, ReactNode } from 'react'

interface CardProps {
  /** Drop the shadow (used for flat list cards on the warm surface). */
  flat?: boolean
  /** Surface-colored, borderless variant. */
  inset?: boolean
  className?: string
  style?: CSSProperties
  children: ReactNode
}

/** Soft, warm surface container. shadcn Card model. */
export function Card({ flat, inset, className, style, children }: CardProps) {
  return (
    <div
      data-sm-slot="card"
      data-flat={flat ? 'true' : undefined}
      data-inset={inset ? 'true' : undefined}
      className={className}
      style={style}
    >
      {children}
    </div>
  )
}
