import { useState } from 'react'

interface SwitchProps {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  size?: 'default' | 'sm'
  disabled?: boolean
  'aria-label'?: string
}

/** Controlled or uncontrolled toggle. shadcn Switch model, coral track. */
export function Switch({
  checked,
  defaultChecked = false,
  onCheckedChange,
  size = 'default',
  disabled,
  'aria-label': ariaLabel,
}: SwitchProps) {
  const isControlled = checked !== undefined
  const [internal, setInternal] = useState(defaultChecked)
  const on = isControlled ? checked : internal

  const toggle = () => {
    if (disabled) return
    if (!isControlled) setInternal(!on)
    onCheckedChange?.(!on)
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      data-sm-slot="switch"
      data-size={size}
      data-checked={on ? 'true' : 'false'}
      disabled={disabled}
      onClick={toggle}
    >
      <span data-sm-part="thumb" />
    </button>
  )
}
