import React from 'react'

/* 나의 슈퍼맨 — Switch. shadcn Switch model. Controlled or uncontrolled. */

const CSS = `
[data-sm-slot="switch"]{position:relative;display:inline-flex;flex:none;align-items:center;
  border:none;padding:0;cursor:pointer;border-radius:var(--radius-full);
  background:var(--neutral-300);transition:background-color .18s ease;outline:none;}
[data-sm-slot="switch"][data-size="default"]{width:46px;height:28px;}
[data-sm-slot="switch"][data-size="sm"]{width:38px;height:23px;}
[data-sm-slot="switch"][data-checked="true"]{background:var(--primary);}
[data-sm-slot="switch"]:disabled{opacity:.5;cursor:not-allowed;}
[data-sm-slot="switch"]:focus-visible{box-shadow:0 0 0 var(--ring-width) color-mix(in srgb,var(--ring) 55%,transparent);}
[data-sm-slot="switch"] [data-sm-part="thumb"]{position:absolute;top:50%;left:3px;transform:translateY(-50%);
  background:#fff;border-radius:var(--radius-full);box-shadow:var(--shadow-sm);transition:left .18s cubic-bezier(.16,1,.3,1);}
[data-sm-slot="switch"][data-size="default"] [data-sm-part="thumb"]{width:22px;height:22px;}
[data-sm-slot="switch"][data-size="sm"] [data-sm-part="thumb"]{width:17px;height:17px;}
[data-sm-slot="switch"][data-size="default"][data-checked="true"] [data-sm-part="thumb"]{left:21px;}
[data-sm-slot="switch"][data-size="sm"][data-checked="true"] [data-sm-part="thumb"]{left:18px;}
`

function useInjectedCss(id, css) {
  React.useEffect(() => {
    if (document.getElementById(id)) return
    const e = document.createElement('style')
    e.id = id
    e.textContent = css
    document.head.appendChild(e)
  }, [id, css])
}

export function Switch({
  checked,
  defaultChecked = false,
  onCheckedChange,
  size = 'default',
  disabled,
  className = '',
  ...p
}) {
  useInjectedCss('sm-switch-css', CSS)
  const isControlled = checked !== undefined
  const [internal, setInternal] = React.useState(defaultChecked)
  const on = isControlled ? checked : internal
  const toggle = () => {
    if (disabled) return
    if (!isControlled) setInternal(!on)
    onCheckedChange && onCheckedChange(!on)
  }
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      data-sm-slot="switch"
      data-size={size}
      data-checked={on ? 'true' : 'false'}
      disabled={disabled}
      onClick={toggle}
      className={className}
      {...p}
    >
      <span data-sm-part="thumb" />
    </button>
  )
}
