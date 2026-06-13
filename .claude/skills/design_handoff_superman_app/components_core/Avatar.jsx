import React from 'react'

/* 나의 슈퍼맨 — Avatar
 * Recreation of the shadcn Avatar. Represents call personas (엄마, 경찰,
 * 연인…). Image with graceful fallback, optional status badge (동행 중 dot).
 * Sizes: sm 32 · default 44 · lg 64 · xl 96 (call screen). */

const CSS = `
[data-sm-slot="avatar"]{position:relative;display:inline-flex;flex:none;align-items:center;justify-content:center;
  overflow:visible;border-radius:var(--radius-full);user-select:none;font-family:var(--font-sans);}
[data-sm-slot="avatar"] [data-sm-part="img"]{width:100%;height:100%;object-fit:cover;border-radius:var(--radius-full);display:block;}
[data-sm-slot="avatar"] [data-sm-part="fallback"]{width:100%;height:100%;display:flex;align-items:center;justify-content:center;
  border-radius:var(--radius-full);background:var(--coral-100);color:var(--coral-700);font-weight:var(--font-semibold);line-height:1;}
[data-sm-slot="avatar"][data-size="sm"]{width:32px;height:32px;font-size:13px;}
[data-sm-slot="avatar"][data-size="default"]{width:44px;height:44px;font-size:16px;}
[data-sm-slot="avatar"][data-size="lg"]{width:64px;height:64px;font-size:24px;}
[data-sm-slot="avatar"][data-size="xl"]{width:96px;height:96px;font-size:38px;}
[data-sm-slot="avatar"] [data-sm-part="badge"]{position:absolute;right:0;bottom:0;border-radius:var(--radius-full);
  border:2px solid var(--background);box-sizing:border-box;}
[data-sm-slot="avatar"][data-size="sm"] [data-sm-part="badge"]{width:10px;height:10px;}
[data-sm-slot="avatar"][data-size="default"] [data-sm-part="badge"]{width:12px;height:12px;}
[data-sm-slot="avatar"][data-size="lg"] [data-sm-part="badge"]{width:16px;height:16px;}
[data-sm-slot="avatar"][data-size="xl"] [data-sm-part="badge"]{width:22px;height:22px;border-width:3px;}
[data-sm-status="online"]{background:var(--success);}
[data-sm-status="busy"]{background:var(--destructive);}
[data-sm-status="idle"]{background:var(--muted-foreground);}
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

export function Avatar({
  src,
  alt = '',
  fallback,
  size = 'default',
  status,
  bg,
  fg,
  className = '',
  style,
  ...props
}) {
  useInjectedCss('sm-avatar-css', CSS)
  const [errored, setErrored] = React.useState(false)
  const showImg = src && !errored
  return (
    <span
      data-sm-slot="avatar"
      data-size={size}
      className={className}
      style={style}
      {...props}
    >
      {showImg ? (
        <img
          data-sm-part="img"
          src={src}
          alt={alt}
          onError={() => setErrored(true)}
        />
      ) : (
        <span data-sm-part="fallback" style={{ background: bg, color: fg }}>
          {fallback}
        </span>
      )}
      {status ? <span data-sm-part="badge" data-sm-status={status} /> : null}
    </span>
  )
}
