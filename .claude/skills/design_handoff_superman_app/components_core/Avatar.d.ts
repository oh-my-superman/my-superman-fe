import React from 'react'

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Image URL. Falls back to `fallback` on error or when absent. */
  src?: string
  alt?: string
  /** Shown when no image: initials, an emoji, or a glyph. */
  fallback?: React.ReactNode
  /** @default "default" */
  size?: 'sm' | 'default' | 'lg' | 'xl'
  /** Status dot. "online" = 동행 중, "busy" = 위급, "idle" = 대기. */
  status?: 'online' | 'busy' | 'idle'
  /** Override fallback background / text color (e.g. per-persona tint). */
  bg?: string
  fg?: string
}

/**
 * Round avatar for call personas and people. Graceful image fallback to
 * initials or an emoji, with an optional status dot. `xl` is the call-screen size.
 *
 * @startingPoint section="Core" subtitle="Persona avatar with status dot" viewport="700x180"
 */
export function Avatar(props: AvatarProps): JSX.Element
