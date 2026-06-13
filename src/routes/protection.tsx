import { createFileRoute } from '@tanstack/react-router'

import { ProtectionScreen } from '#/features/home/protection-screen'

export const Route = createFileRoute('/protection')({
  component: ProtectionScreen,
})
