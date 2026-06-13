import React from 'react'

export interface DialogProps {
  /** Controlled open state. */
  open: boolean
  /** Called with the next open state (overlay click, ESC, close button). */
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
  /** Show the top-right × button. @default true */
  showCloseButton?: boolean
  /** Slide up from the bottom edge instead of centering. @default false */
  bottomSheet?: boolean
  /** "danger" adds an emergency-red ring — for 신고/위급 modals. @default "default" */
  tone?: 'default' | 'danger'
  /** "fixed" pins to the viewport; default is absolute (inside a phone frame). */
  container?: 'fixed' | 'absolute'
}

/**
 * Centered modal (or bottom sheet) over a dim overlay. Controlled. Composes
 * with DialogHeader / DialogTitle / DialogDescription / DialogFooter.
 * Use tone="danger" for the auto-report / 위급 confirmation flow.
 *
 * @startingPoint section="Core" subtitle="Modal & bottom sheet, danger tone" viewport="700x460"
 */
export function Dialog(props: DialogProps): JSX.Element | null
export function DialogHeader(
  props: React.HTMLAttributes<HTMLDivElement>,
): JSX.Element
export function DialogTitle(
  props: React.HTMLAttributes<HTMLHeadingElement>,
): JSX.Element
export function DialogDescription(
  props: React.HTMLAttributes<HTMLParagraphElement>,
): JSX.Element
export function DialogFooter(
  props: React.HTMLAttributes<HTMLDivElement>,
): JSX.Element
