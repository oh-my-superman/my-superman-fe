import { createFileRoute } from '@tanstack/react-router'

import { MapScreen } from '#/features/map/map-screen'

export const Route = createFileRoute('/map')({ component: MapScreen })
