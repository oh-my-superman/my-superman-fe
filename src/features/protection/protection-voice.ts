import { useCompanionSession } from '../companion/session-store'
import { startAudioCapture } from '../call/audio-capture'
import type { AudioCaptureHandle } from '../call/audio-capture'

/**
 * Background protection-mode voice: while 보호모드 is on (and no call is
 * active), streams the mic to the BE as `voice` frames so the AI scream
 * detector (`/protection/scream/stream`) can listen. Reuses the same 16 kHz
 * PCM16 capture pipeline as the call.
 *
 * Lifecycle is driven by the coordinator in `protection-store.ts`, not here —
 * this class only knows how to start/stop streaming.
 */
export class ProtectionVoiceController {
  #ctx: AudioContext | null = null
  #capture: AudioCaptureHandle | null = null
  #starting = false
  #gestureCleanup: (() => void) | null = null
  /** Invalidates an in-flight start() when stop()/restart happens mid-await. */
  #token = 0

  get active(): boolean {
    return this.#capture !== null || this.#starting
  }

  async start(): Promise<void> {
    if (typeof window === 'undefined') return
    if (this.#capture || this.#starting) return
    this.#starting = true
    const token = (this.#token += 1)
    try {
      const ctx = new AudioContext({ sampleRate: 16000 })
      this.#ctx = ctx
      void ctx.resume()
      this.#resumeOnGesture()

      const session = useCompanionSession.getState()
      const capture = await startAudioCapture(ctx, (base64) => {
        session.send({ type: 'voice', data: base64, sample_rate: 16000 })
      })
      if (token !== this.#token) {
        // stop() ran while we were acquiring the mic
        capture.stop()
        return
      }
      this.#capture = capture
    } catch {
      this.#teardown()
    } finally {
      this.#starting = false
    }
  }

  stop(): void {
    this.#token += 1
    this.#starting = false
    this.#teardown()
  }

  #teardown(): void {
    this.#capture?.stop()
    this.#capture = null
    this.#ctx?.close().catch(() => {})
    this.#ctx = null
    this.#gestureCleanup?.()
    this.#gestureCleanup = null
  }

  #resumeOnGesture(): void {
    const events = ['touchend', 'mousedown', 'keydown'] as const
    const handler = () => void this.#ctx?.resume()
    events.forEach((event) =>
      window.addEventListener(event, handler, { once: true, passive: true }),
    )
    this.#gestureCleanup = () =>
      events.forEach((event) => window.removeEventListener(event, handler))
  }
}
