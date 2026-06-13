import React from 'react'

/* 나의 슈퍼맨 — Card. Soft, warm surface container. shadcn Card model. */

const CSS = `
[data-sm-slot="card"]{display:flex;flex-direction:column;background:var(--card);color:var(--card-foreground);
  border:1px solid var(--border);border-radius:var(--radius-xl);box-shadow:var(--shadow-sm);
  font-family:var(--font-sans);overflow:hidden;}
[data-sm-slot="card"][data-flat="true"]{box-shadow:none;}
[data-sm-slot="card"][data-inset="true"]{background:var(--surface);border-color:transparent;box-shadow:none;}
[data-sm-slot="card-header"]{display:flex;flex-direction:column;gap:var(--space-1);padding:var(--space-5) var(--space-5) 0;}
[data-sm-slot="card-title"]{font-size:var(--text-lg);font-weight:var(--font-semibold);letter-spacing:var(--tracking-normal);margin:0;}
[data-sm-slot="card-description"]{font-size:var(--text-sm);color:var(--muted-foreground);line-height:var(--leading-normal);margin:0;}
[data-sm-slot="card-content"]{padding:var(--space-5);}
[data-sm-slot="card-footer"]{display:flex;align-items:center;gap:var(--space-2);padding:0 var(--space-5) var(--space-5);}
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

export function Card({ flat, inset, className = '', children, ...p }) {
  useInjectedCss('sm-card-css', CSS)
  return (
    <div
      data-sm-slot="card"
      data-flat={flat ? 'true' : undefined}
      data-inset={inset ? 'true' : undefined}
      className={className}
      {...p}
    >
      {children}
    </div>
  )
}
export function CardHeader({ className = '', children, ...p }) {
  return (
    <div data-sm-slot="card-header" className={className} {...p}>
      {children}
    </div>
  )
}
export function CardTitle({ className = '', children, ...p }) {
  return (
    <h3 data-sm-slot="card-title" className={className} {...p}>
      {children}
    </h3>
  )
}
export function CardDescription({ className = '', children, ...p }) {
  return (
    <p data-sm-slot="card-description" className={className} {...p}>
      {children}
    </p>
  )
}
export function CardContent({ className = '', children, ...p }) {
  return (
    <div data-sm-slot="card-content" className={className} {...p}>
      {children}
    </div>
  )
}
export function CardFooter({ className = '', children, ...p }) {
  return (
    <div data-sm-slot="card-footer" className={className} {...p}>
      {children}
    </div>
  )
}
