import React from 'react'

/* 나의 슈퍼맨 — Dialog (modal)
 * Recreation of the shadcn Dialog without Radix. Controlled via `open` /
 * `onOpenChange`. Centered card over a dim overlay; ESC + overlay-click close.
 * Sub-parts (Header/Title/Description/Footer) are layout helpers.
 * `bottomSheet` slides up from the bottom — the common mobile pattern. */

const CSS = `
@keyframes sm-dialog-overlay-in{from{opacity:0}to{opacity:1}}
@keyframes sm-dialog-pop-in{from{opacity:0;transform:translate(-50%,-46%) scale(.96)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
@keyframes sm-dialog-sheet-in{from{opacity:0;transform:translate(-50%,12px)}to{opacity:1;transform:translate(-50%,0)}}
[data-sm-slot="dialog-overlay"]{position:absolute;inset:0;background:rgba(27,23,20,.5);
  animation:sm-dialog-overlay-in .18s ease;z-index:50;}
[data-sm-slot="dialog-content"]{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
  z-index:51;width:calc(100% - 2rem);max-width:380px;box-sizing:border-box;
  background:var(--popover);color:var(--popover-foreground);
  border-radius:var(--radius-xl);box-shadow:var(--shadow-xl);
  padding:var(--space-6);display:flex;flex-direction:column;gap:var(--space-4);
  font-family:var(--font-sans);animation:sm-dialog-pop-in .2s cubic-bezier(.16,1,.3,1);}
[data-sm-slot="dialog-content"][data-tone="danger"]{box-shadow:0 24px 48px rgba(229,72,77,.28),0 0 0 1px rgba(229,72,77,.18);}
[data-sm-slot="dialog-content"][data-sheet="true"]{top:auto;bottom:12px;transform:translate(-50%,0);
  max-width:none;width:calc(100% - 1rem);border-radius:var(--radius-2xl);
  animation:sm-dialog-sheet-in .24s cubic-bezier(.16,1,.3,1);}
[data-sm-slot="dialog-close"]{position:absolute;top:14px;right:14px;width:32px;height:32px;display:flex;
  align-items:center;justify-content:center;border:none;background:transparent;color:var(--muted-foreground);
  border-radius:var(--radius-full);cursor:pointer;opacity:.7;transition:opacity .15s,background .15s;}
[data-sm-slot="dialog-close"]:hover{opacity:1;background:var(--muted);}
[data-sm-slot="dialog-header"]{display:flex;flex-direction:column;gap:var(--space-2);text-align:center;}
[data-sm-slot="dialog-title"]{font-size:var(--text-xl);font-weight:var(--font-bold);letter-spacing:var(--tracking-tight);
  line-height:var(--leading-tight);margin:0;}
[data-sm-slot="dialog-description"]{font-size:var(--text-sm);color:var(--muted-foreground);
  line-height:var(--leading-normal);margin:0;}
[data-sm-slot="dialog-footer"]{display:flex;flex-direction:column;gap:var(--space-2);margin-top:var(--space-1);}
`

function useInjectedCss(id, css) {
  React.useEffect(() => {
    if (document.getElementById(id)) return
    const el = document.createElement('style')
    el.id = id
    el.textContent = css
    document.head.appendChild(el)
  }, [id, css])
}

export function Dialog({
  open,
  onOpenChange,
  children,
  showCloseButton = true,
  bottomSheet = false,
  tone = 'default',
  container,
}) {
  useInjectedCss('sm-dialog-css', CSS)
  React.useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onOpenChange && onOpenChange(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  if (!open) return null
  // Render absolutely inside the nearest positioned ancestor (the phone frame),
  // or fixed to the viewport when no container styling is provided.
  return (
    <div
      data-sm-slot="dialog-root"
      style={{
        position: container === 'fixed' ? 'fixed' : 'absolute',
        inset: 0,
        zIndex: 50,
      }}
    >
      <div
        data-sm-slot="dialog-overlay"
        onClick={() => onOpenChange && onOpenChange(false)}
      />
      <div
        data-sm-slot="dialog-content"
        data-sheet={bottomSheet ? 'true' : undefined}
        data-tone={tone}
        role="dialog"
        aria-modal="true"
      >
        {children}
        {showCloseButton && (
          <button
            data-sm-slot="dialog-close"
            aria-label="닫기"
            onClick={() => onOpenChange && onOpenChange(false)}
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

export function DialogHeader({ children, className = '', ...p }) {
  return (
    <div data-sm-slot="dialog-header" className={className} {...p}>
      {children}
    </div>
  )
}
export function DialogTitle({ children, className = '', ...p }) {
  return (
    <h2 data-sm-slot="dialog-title" className={className} {...p}>
      {children}
    </h2>
  )
}
export function DialogDescription({ children, className = '', ...p }) {
  return (
    <p data-sm-slot="dialog-description" className={className} {...p}>
      {children}
    </p>
  )
}
export function DialogFooter({ children, className = '', ...p }) {
  return (
    <div data-sm-slot="dialog-footer" className={className} {...p}>
      {children}
    </div>
  )
}
