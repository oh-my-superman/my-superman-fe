import React from 'react'
export interface SwitchProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onChange'
> {
  /** Controlled on state. Omit for uncontrolled (use defaultChecked). */
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  /** @default "default" */
  size?: 'sm' | 'default'
  disabled?: boolean
}
/**
 * On/off toggle for settings rows (자동 신고, 위치 공유 등). Controlled or
 * uncontrolled; coral when on.
 * @startingPoint section="Core" subtitle="Settings toggle" viewport="700x120"
 */
export function Switch(props: SwitchProps): JSX.Element
