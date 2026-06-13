import React from 'react'

/* 나의 슈퍼맨 — Button
 * Faithful recreation of the shadcn Button, restyled on the coral brand
 * and authored with CSS custom properties (no Tailwind runtime).
 * Variants: default | secondary | outline | ghost | destructive | link
 * Sizes:    sm | default | lg | icon | icon-sm */

const CSS = `
[data-sm-slot="button"]{
  display:inline-flex;align-items:center;justify-content:center;gap:var(--space-2);
  font-family:var(--font-sans);font-weight:var(--font-semibold);
  letter-spacing:var(--tracking-normal);white-space:nowrap;
  border:1px solid transparent;border-radius:var(--radius-md);
  cursor:pointer;user-select:none;outline:none;
  transition:background-color .15s ease,color .15s ease,box-shadow .15s ease,opacity .12s ease,transform .04s ease;
}
[data-sm-slot="button"] svg{flex:none;width:1.15em;height:1.15em;pointer-events:none;}
[data-sm-slot="button"]:disabled{pointer-events:none;opacity:.5;}
[data-sm-slot="button"]:focus-visible{box-shadow:0 0 0 var(--ring-width) color-mix(in srgb,var(--ring) 55%,transparent);}
[data-sm-slot="button"]:active:not(:disabled){transform:translateY(.5px) scale(.99);}

/* sizes */
[data-sm-slot="button"][data-size="default"]{height:44px;padding:0 var(--space-5);font-size:var(--text-base);}
[data-sm-slot="button"][data-size="sm"]{height:36px;padding:0 var(--space-4);font-size:var(--text-sm);border-radius:var(--radius-sm);}
[data-sm-slot="button"][data-size="lg"]{height:52px;padding:0 var(--space-6);font-size:var(--text-lg);border-radius:var(--radius-lg);}
[data-sm-slot="button"][data-size="icon"]{height:44px;width:44px;padding:0;}
[data-sm-slot="button"][data-size="icon-sm"]{height:36px;width:36px;padding:0;border-radius:var(--radius-sm);}

/* variants */
[data-sm-slot="button"][data-variant="default"]{background:var(--primary);color:var(--primary-foreground);box-shadow:var(--shadow-xs);}
[data-sm-slot="button"][data-variant="default"]:hover:not(:disabled){background:var(--primary-hover);}
[data-sm-slot="button"][data-variant="secondary"]{background:var(--secondary);color:var(--secondary-foreground);}
[data-sm-slot="button"][data-variant="secondary"]:hover:not(:disabled){background:var(--neutral-200);}
[data-sm-slot="button"][data-variant="outline"]{background:var(--background);color:var(--foreground);border-color:var(--border);box-shadow:var(--shadow-xs);}
[data-sm-slot="button"][data-variant="outline"]:hover:not(:disabled){background:var(--accent);color:var(--accent-foreground);border-color:var(--coral-200);}
[data-sm-slot="button"][data-variant="ghost"]{background:transparent;color:var(--foreground);}
[data-sm-slot="button"][data-variant="ghost"]:hover:not(:disabled){background:var(--accent);color:var(--accent-foreground);}
[data-sm-slot="button"][data-variant="destructive"]{background:var(--destructive);color:var(--destructive-foreground);box-shadow:var(--shadow-xs);}
[data-sm-slot="button"][data-variant="destructive"]:hover:not(:disabled){background:color-mix(in srgb,var(--destructive) 88%,#000);}
[data-sm-slot="button"][data-variant="link"]{background:transparent;color:var(--primary);height:auto;padding:0;text-underline-offset:4px;}
[data-sm-slot="button"][data-variant="link"]:hover:not(:disabled){text-decoration:underline;}
[data-sm-slot="button"][data-block="true"]{width:100%;}
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

export function Button({
  variant = 'default',
  size = 'default',
  block = false,
  className = '',
  type = 'button',
  children,
  ...props
}) {
  useInjectedCss('sm-button-css', CSS)
  return (
    <button
      type={type}
      data-sm-slot="button"
      data-variant={variant}
      data-size={size}
      data-block={block ? 'true' : undefined}
      className={className}
      {...props}
    >
      {children}
    </button>
  )
}
