import React from 'react'
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** @default "default" */
  variant?:
    | 'default'
    | 'secondary'
    | 'outline'
    | 'success'
    | 'danger'
    | 'warning'
    | 'accent'
  /** Leading status dot. */
  dot?: boolean
}
/**
 * Small status pill — 동행 중, 예약됨, 위급 등. Use `success` for safe/connected
 * states, `danger` for 위급, `warning` for pending.
 * @startingPoint section="Core" subtitle="Status pills, 7 variants" viewport="700x140"
 */
export function Badge(props: BadgeProps): JSX.Element
