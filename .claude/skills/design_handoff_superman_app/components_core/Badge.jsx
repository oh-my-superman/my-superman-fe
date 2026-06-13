import React from 'react'

/* 나의 슈퍼맨 — Badge. Status pill. shadcn Badge model, coral brand. */

const CSS = `
[data-sm-slot="badge"]{display:inline-flex;align-items:center;gap:4px;font-family:var(--font-sans);
  font-size:var(--text-xs);font-weight:var(--font-semibold);line-height:1;letter-spacing:var(--tracking-normal);
  padding:4px 9px;border-radius:var(--radius-full);border:1px solid transparent;white-space:nowrap;}
[data-sm-slot="badge"] svg{width:12px;height:12px;}
[data-sm-slot="badge"] [data-sm-part="dot"]{width:6px;height:6px;border-radius:var(--radius-full);background:currentColor;}
[data-sm-slot="badge"][data-variant="default"]{background:var(--primary);color:var(--primary-foreground);}
[data-sm-slot="badge"][data-variant="secondary"]{background:var(--secondary);color:var(--secondary-foreground);}
[data-sm-slot="badge"][data-variant="outline"]{background:transparent;color:var(--foreground);border-color:var(--border);}
[data-sm-slot="badge"][data-variant="success"]{background:color-mix(in srgb,var(--success) 14%,#fff);color:#1f7a4a;}
[data-sm-slot="badge"][data-variant="danger"]{background:color-mix(in srgb,var(--destructive) 12%,#fff);color:var(--destructive);}
[data-sm-slot="badge"][data-variant="warning"]{background:color-mix(in srgb,var(--warning) 18%,#fff);color:#9a6207;}
[data-sm-slot="badge"][data-variant="accent"]{background:var(--accent);color:var(--accent-foreground);}
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

export function Badge({
  variant = 'default',
  dot = false,
  className = '',
  children,
  ...p
}) {
  useInjectedCss('sm-badge-css', CSS)
  return (
    <span
      data-sm-slot="badge"
      data-variant={variant}
      className={className}
      {...p}
    >
      {dot ? <span data-sm-part="dot" /> : null}
      {children}
    </span>
  )
}
