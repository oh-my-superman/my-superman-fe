import { useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

export type AvatarSize = 'sm' | 'default' | 'lg' | 'xl'

interface AvatarProps {
  src?: string
  alt?: string
  fallback?: ReactNode
  size?: AvatarSize
  /** Fallback background color (CSS value, e.g. var(--coral-100)). */
  bg?: string
  /** Fallback foreground color. */
  fg?: string
  className?: string
  style?: CSSProperties
}

/** Persona avatar with graceful image fallback. */
export function Avatar({
  src,
  alt = '',
  fallback,
  size = 'default',
  bg,
  fg,
  className,
  style,
}: AvatarProps) {
  const [errored, setErrored] = useState(false)
  const showImg = src && !errored

  return (
    <span
      data-sm-slot="avatar"
      data-size={size}
      className={className}
      style={style}
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
    </span>
  )
}
