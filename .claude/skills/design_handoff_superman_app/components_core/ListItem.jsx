import React from 'react'

/* 나의 슈퍼맨 — ListItem
 * The row primitive behind the 전화번호부-style home and settings screens.
 * left slot (avatar/icon) · title + subtitle · right slot (chevron/switch/meta). */

const CSS = `
[data-sm-slot="list-item"]{display:flex;align-items:center;gap:var(--space-3);width:100%;box-sizing:border-box;
  padding:var(--space-3) var(--space-4);background:transparent;border:none;text-align:left;
  font-family:var(--font-sans);color:var(--foreground);transition:background-color .14s ease;}
[data-sm-slot="list-item"][data-pressable="true"]{cursor:pointer;}
[data-sm-slot="list-item"][data-pressable="true"]:hover{background:var(--accent);}
[data-sm-slot="list-item"][data-pressable="true"]:active{background:var(--coral-100);}
[data-sm-slot="list-item"] [data-sm-part="li-left"]{flex:none;display:flex;align-items:center;justify-content:center;}
[data-sm-slot="list-item"] [data-sm-part="li-body"]{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;}
[data-sm-slot="list-item"] [data-sm-part="li-title"]{font-size:var(--text-base);font-weight:var(--font-semibold);
  letter-spacing:var(--tracking-normal);line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
[data-sm-slot="list-item"] [data-sm-part="li-sub"]{font-size:var(--text-sm);color:var(--muted-foreground);
  line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
[data-sm-slot="list-item"] [data-sm-part="li-right"]{flex:none;display:flex;align-items:center;gap:var(--space-2);color:var(--muted-foreground);}
[data-sm-slot="list-divider"]{height:1px;background:var(--border);margin:0 var(--space-4);border:none;}
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

const Chevron = () => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ opacity: 0.55 }}
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
)

export function ListItem({
  leading,
  title,
  subtitle,
  trailing,
  chevron = false,
  onClick,
  className = '',
  ...p
}) {
  useInjectedCss('sm-listitem-css', CSS)
  const pressable = !!onClick
  const Tag = pressable ? 'button' : 'div'
  return (
    <Tag
      type={pressable ? 'button' : undefined}
      data-sm-slot="list-item"
      data-pressable={pressable ? 'true' : undefined}
      onClick={onClick}
      className={className}
      {...p}
    >
      {leading != null && <span data-sm-part="li-left">{leading}</span>}
      <span data-sm-part="li-body">
        <span data-sm-part="li-title">{title}</span>
        {subtitle != null && <span data-sm-part="li-sub">{subtitle}</span>}
      </span>
      {(trailing != null || chevron) && (
        <span data-sm-part="li-right">
          {trailing}
          {chevron && <Chevron />}
        </span>
      )}
    </Tag>
  )
}

export function ListDivider() {
  useInjectedCss('sm-listitem-css', CSS)
  return <hr data-sm-slot="list-divider" />
}
