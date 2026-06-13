import { create } from 'zustand'

import { CompanionSocket } from './companion-socket'
import type { CompanionFrame, CompanionStatus } from './companion-socket'

/**
 * Single app-wide realtime session over `/ws/companion`.
 *
 * The socket lives for the whole app (a module singleton), not for any one
 * component — so navigating between routes, or a mobile page being backgrounded
 * and resumed, never drops the session. Components read `status` and call
 * `startSession` / `endSession` / `setEnabled`.
 *
 * Scope: one connection PER TAB/WINDOW, shared across all routes in that tab.
 * This is intentional — the app targets mobile / installed PWA, which run a
 * single window, so multi-tab fan-out is a desktop-only edge case and we let
 * each tab hold its own connection rather than pull in cross-tab leader
 * election (Web Locks / SharedWorker — the latter isn't supported on iOS).
 */

// Until auth exists, the realtime session uses a placeholder identity. Replace
// with the signed-in user once that lands.
const CURRENT_USER = { userId: 1, userName: 'Daniel' }

const socket = new CompanionSocket()

interface CompanionSessionState {
  status: CompanionStatus
  sessionId: string | null
  /** Open the session (`session.start`). `enabled` = 보호모드 on/off. */
  startSession: (enabled?: boolean) => Promise<void>
  /** End the session (`session.end`) and close the socket. */
  endSession: () => Promise<void>
  /** Toggle 보호모드 on the live session without closing it. */
  setEnabled: (enabled: boolean) => void
  /** Send a raw realtime frame (gps / voice / screen / call.*). */
  send: (frame: CompanionFrame) => boolean
  /** Subscribe to inbound frames (e.g. AI call events). Returns an unsubscribe. */
  subscribe: (fn: (frame: CompanionFrame) => void) => () => void
}

export const useCompanionSession = create<CompanionSessionState>((set) => {
  socket.onStatus((status) =>
    set({ status, sessionId: socket.session?.sessionId ?? null }),
  )

  return {
    status: socket.status,
    sessionId: socket.session?.sessionId ?? null,
    startSession: async (enabled = true) => {
      try {
        await socket.open({ ...CURRENT_USER, enabled })
      } catch (err) {
        // Surfaced via `status === 'error'`; logged for debugging.
        console.error('[companion] failed to start session', err)
      }
    },
    endSession: () => socket.close(),
    setEnabled: (enabled) => socket.setEnabled(enabled),
    send: (frame) => socket.send(frame),
    subscribe: (fn) => socket.onFrame(fn),
  }
})
