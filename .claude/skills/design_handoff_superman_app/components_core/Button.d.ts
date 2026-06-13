import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. @default "default" */
  variant?:
    | 'default'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'destructive'
    | 'link'
  /** Control height / padding. @default "default" (44px touch target) */
  size?: 'sm' | 'default' | 'lg' | 'icon' | 'icon-sm'
  /** Stretch to full container width. */
  block?: boolean
}

/**
 * Primary action control for 나의 슈퍼맨. Coral-filled by default; 44px tall
 * to stay thumb-friendly on mobile. Use `destructive` only for danger/report
 * actions, never for ordinary CTAs.
 *
 * @startingPoint section="Core" subtitle="Coral CTA, 6 variants, mobile-sized" viewport="700x200"
 */
export function Button(props: ButtonProps): JSX.Element
