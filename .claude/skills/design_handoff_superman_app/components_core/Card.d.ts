import React from 'react'
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Remove the shadow. */
  flat?: boolean
  /** Inset style: surface background, no border/shadow — for grouped rows. */
  inset?: boolean
}
/**
 * Warm surface container. Compose with CardHeader / CardTitle /
 * CardDescription / CardContent / CardFooter.
 * @startingPoint section="Core" subtitle="Surface container + parts" viewport="700x240"
 */
export function Card(props: CardProps): JSX.Element
export function CardHeader(
  props: React.HTMLAttributes<HTMLDivElement>,
): JSX.Element
export function CardTitle(
  props: React.HTMLAttributes<HTMLHeadingElement>,
): JSX.Element
export function CardDescription(
  props: React.HTMLAttributes<HTMLParagraphElement>,
): JSX.Element
export function CardContent(
  props: React.HTMLAttributes<HTMLDivElement>,
): JSX.Element
export function CardFooter(
  props: React.HTMLAttributes<HTMLDivElement>,
): JSX.Element
