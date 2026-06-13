import React from 'react'
export interface ListItemProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  'title'
> {
  /** Left slot — usually an <Avatar> or icon. */
  leading?: React.ReactNode
  title?: React.ReactNode
  subtitle?: React.ReactNode
  /** Right slot — Badge, Switch, meta text, etc. */
  trailing?: React.ReactNode
  /** Append a › chevron (implies navigable). */
  chevron?: boolean
  /** Makes the row a pressable button with hover/active states. */
  onClick?: () => void
}
/**
 * Row primitive for contact-list and settings screens. Avatar/icon + title +
 * subtitle + trailing slot. Pressable when given onClick. Pair with ListDivider.
 * @startingPoint section="Core" subtitle="Contact / settings row" viewport="700x240"
 */
export function ListItem(props: ListItemProps): JSX.Element
export function ListDivider(): JSX.Element
