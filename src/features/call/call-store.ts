import { create } from 'zustand'

import { CallController } from './call-controller'
import type { CallStatus, DangerEvent } from './call-controller'

/**
 * App-wide live-call state. One {@link CallController} singleton drives the
 * audio + WS; this store mirrors its status/transcripts/danger into React.
 */
const controller = new CallController()

interface CallState {
  status: CallStatus
  /** True while the AI is speaking (audio playing), false while listening. */
  speaking: boolean
  danger: DangerEvent | null
  error: string | null
  muted: boolean
  start: (personaId: string) => void
  stop: () => void
  toggleMute: () => void
  dismissDanger: () => void
}

export const useCall = create<CallState>((set, get) => {
  controller.setListeners({
    onStatus: (status) => set({ status }),
    onSpeaking: (speaking) => set({ speaking }),
    onDanger: (danger) => set({ danger }),
    onError: (error) => set({ error }),
  })

  return {
    status: 'idle',
    speaking: false,
    danger: null,
    error: null,
    muted: false,
    start: (personaId) => {
      set({ speaking: false, danger: null, error: null, muted: false })
      void controller.start(personaId)
    },
    stop: () => void controller.stop(),
    toggleMute: () => {
      const next = !get().muted
      controller.setMuted(next)
      set({ muted: next })
    },
    dismissDanger: () => set({ danger: null }),
  }
})
