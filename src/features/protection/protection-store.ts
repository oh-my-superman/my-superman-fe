import { create } from 'zustand'

import { useCompanionStore } from '#/store/companion'
import { useCompanionSession } from '../companion/session-store'
import { useCall } from '../call/call-store'
import { ProtectionVoiceController } from './protection-voice'
import type { CompanionFrame } from '../companion/companion-socket'

/**
 * Coordinates background protection-mode voice streaming and surfaces AI scream
 * events.
 *
 * Voice is streamed when: 보호모드 ON **and** the WS session is ready **and**
 * no call is active. A call takes over the mic/audio, so voice pauses for its
 * duration (GPS and the session itself are untouched) and resumes when the call
 * ends if 보호모드 is still on.
 */
const controller = new ProtectionVoiceController()

/** Call states during which protection voice must stay paused. */
const ACTIVE_CALL_STATUSES: ReadonlyArray<string> = [
  'connecting',
  'starting',
  'live',
  'stopping',
]

interface ProtectionState {
  /** Whether the mic is currently being streamed as `voice` frames. */
  voiceStreaming: boolean
  /** Latest AI scream-detection state. */
  screaming: boolean
  lastScreamScore: number | null
}

export const useProtection = create<ProtectionState>(() => ({
  voiceStreaming: false,
  screaming: false,
  lastScreamScore: null,
}))

function recompute(): void {
  const protectionOn = useCompanionStore.getState().companion
  const sessionReady = useCompanionSession.getState().status === 'ready'
  const callActive = ACTIVE_CALL_STATUSES.includes(useCall.getState().status)
  const shouldStream = protectionOn && sessionReady && !callActive

  if (shouldStream) void controller.start()
  else controller.stop()
  useProtection.setState({ voiceStreaming: shouldStream })
}

let initialized = false

/**
 * Activate the coordinator once for the app lifetime. Idempotent; safe to call
 * from any mounting component (e.g. the main layout).
 */
export function startProtectionCoordinator(): void {
  if (initialized || typeof window === 'undefined') return
  initialized = true

  // AI → FE scream events arrive over the shared `/ws/companion` socket.
  useCompanionSession.getState().subscribe((frame: CompanionFrame) => {
    if (frame.type === 'danger' && frame.cause === 'scream') {
      useProtection.setState({
        screaming: true,
        lastScreamScore: typeof frame.score === 'number' ? frame.score : null,
      })
    } else if (frame.type === 'scream_cleared') {
      useProtection.setState({ screaming: false })
    }
  })

  // Re-evaluate whenever 보호모드, session status, or call status changes.
  useCompanionStore.subscribe(recompute)
  useCompanionSession.subscribe(recompute)
  useCall.subscribe(recompute)
  recompute()
}
