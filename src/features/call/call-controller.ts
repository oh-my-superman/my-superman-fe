import { useCompanionSession } from '../companion/session-store'
import { useCompanionStore } from '#/store/companion'
import { startAudioCapture } from './audio-capture'
import { AudioPlayback } from './audio-playback'
import { base64ToInt16 } from './pcm'
import { voiceForPersona } from './voices'
import type { CompanionFrame } from '../companion/companion-socket'
import type { AudioCaptureHandle } from './audio-capture'

/** Fixed for now — will move to user settings later. */
const SAFEWORD = '짜장면'

export type CallStatus =
  | 'idle'
  /** Ensuring the WS session is ready. */
  | 'connecting'
  /** `call.start` sent, waiting for `setup_complete`. */
  | 'starting'
  /** Streaming mic + playing AI audio. */
  | 'live'
  | 'stopping'
  | 'ended'
  | 'error'

export interface DangerEvent {
  cause: string
  [key: string]: unknown
}

export interface CallListeners {
  onStatus: (status: CallStatus) => void
  /** True while AI audio is playing (speaking), false while idle (listening). */
  onSpeaking: (speaking: boolean) => void
  onDanger: (danger: DangerEvent) => void
  onError: (message: string) => void
}

/**
 * Drives one live AI voice call over the shared `/ws/companion` socket:
 * `call.start` → stream `call.audio` ⇄ play AI `audio` → `call.stop`. AI events
 * (transcripts, interrupted, danger, errors) are surfaced via listeners.
 */
export class CallController {
  #status: CallStatus = 'idle'
  #muted = false
  /** Invalidates in-flight async work when a call is stopped/restarted. */
  #token = 0

  #captureCtx: AudioContext | null = null
  #playbackCtx: AudioContext | null = null
  #capture: AudioCaptureHandle | null = null
  #playback: AudioPlayback | null = null
  #unsubFrames: (() => void) | null = null
  #gestureCleanup: (() => void) | null = null
  #callStartSent = false

  #listeners: Partial<CallListeners> = {}

  setListeners(listeners: Partial<CallListeners>): void {
    this.#listeners = listeners
  }

  get status(): CallStatus {
    return this.#status
  }
  get muted(): boolean {
    return this.#muted
  }

  async start(personaId: string): Promise<void> {
    if (
      this.#status !== 'idle' &&
      this.#status !== 'ended' &&
      this.#status !== 'error'
    ) {
      return
    }
    if (typeof window === 'undefined') return

    const token = (this.#token += 1)
    this.#muted = false
    this.#callStartSent = false
    this.#setStatus('connecting')

    // iOS unlocks audio only inside a user gesture. start() runs from the call
    // screen mount (after navigation), so contexts may begin 'suspended' — we
    // resume them now and again on the first touch as a fallback.
    this.#captureCtx = new AudioContext({ sampleRate: 16000 })
    this.#playbackCtx = new AudioContext()
    this.#playback = new AudioPlayback(this.#playbackCtx, (speaking) =>
      this.#listeners.onSpeaking?.(speaking),
    )
    void this.#captureCtx.resume()
    void this.#playbackCtx.resume()
    this.#resumeOnGesture()

    const session = useCompanionSession.getState()
    this.#unsubFrames = session.subscribe((frame) => this.#onFrame(frame))

    try {
      // Preserve the user's current 보호모드 state; a call shouldn't force it on.
      await session.startSession(useCompanionStore.getState().companion)
    } catch {
      this.#fail(token, '세션 연결에 실패했어요')
      return
    }
    if (token !== this.#token) return // stopped/restarted while connecting
    const liveSession = useCompanionSession.getState()
    if (liveSession.status !== 'ready' || !liveSession.sessionId) {
      this.#fail(token, 'WebSocket 연결이 준비되지 않았어요')
      return
    }

    this.#setStatus('starting')
    this.#callStartSent = liveSession.send({
      type: 'call.start',
      session_id: liveSession.sessionId,
      persona_id: personaId,
      safeword: SAFEWORD,
      voice_name: voiceForPersona(personaId),
      model: null,
    })
  }

  async stop(): Promise<void> {
    this.#token += 1 // invalidate any in-flight start()
    if (this.#status === 'idle' || this.#status === 'ended') {
      this.#cleanup()
      return
    }
    this.#setStatus('stopping')
    if (this.#callStartSent) {
      const session = useCompanionSession.getState()
      session.send({ type: 'call.stop', session_id: session.sessionId })
    }
    this.#cleanup()
    this.#setStatus('ended')
  }

  setMuted(muted: boolean): void {
    this.#muted = muted
    this.#capture?.setMuted(muted)
  }

  #onFrame(frame: CompanionFrame): void {
    switch (frame.type) {
      case 'setup_complete':
        void this.#beginCapture(this.#token)
        break
      case 'audio': {
        if (typeof frame.data === 'string' && this.#playback) {
          this.#playback.enqueue(base64ToInt16(frame.data))
        }
        break
      }
      case 'interrupted':
        this.#playback?.flush()
        break
      case 'danger':
        this.#listeners.onDanger?.(frame as unknown as DangerEvent)
        break
      case 'error':
        this.#listeners.onError?.(
          typeof frame.message === 'string'
            ? frame.message
            : '오류가 발생했어요',
        )
        break
      default:
        break
    }
  }

  async #beginCapture(token: number): Promise<void> {
    if (this.#capture || !this.#captureCtx) return
    try {
      const session = useCompanionSession.getState()
      const capture = await startAudioCapture(this.#captureCtx, (base64) => {
        session.send({
          type: 'call.audio',
          data: base64,
          mime_type: 'audio/pcm;rate=16000',
        })
      })
      if (token !== this.#token) {
        capture.stop()
        return
      }
      this.#capture = capture
      this.#capture.setMuted(this.#muted)
      this.#setStatus('live')
    } catch {
      this.#fail(token, '마이크 권한이 필요해요')
    }
  }

  #resumeOnGesture(): void {
    const events = ['touchend', 'mousedown', 'keydown'] as const
    const handler = () => {
      void this.#captureCtx?.resume()
      void this.#playbackCtx?.resume()
    }
    events.forEach((event) =>
      window.addEventListener(event, handler, { once: true, passive: true }),
    )
    this.#gestureCleanup = () =>
      events.forEach((event) => window.removeEventListener(event, handler))
  }

  #cleanup(): void {
    this.#capture?.stop()
    this.#capture = null
    this.#playback?.flush()
    this.#playback = null
    this.#captureCtx?.close().catch(() => {})
    this.#captureCtx = null
    this.#playbackCtx?.close().catch(() => {})
    this.#playbackCtx = null
    this.#unsubFrames?.()
    this.#unsubFrames = null
    this.#gestureCleanup?.()
    this.#gestureCleanup = null
    this.#callStartSent = false
  }

  #fail(token: number, message: string): void {
    if (token !== this.#token) return
    this.#listeners.onError?.(message)
    this.#cleanup()
    this.#setStatus('error')
  }

  #setStatus(status: CallStatus): void {
    if (status === this.#status) return
    this.#status = status
    this.#listeners.onStatus?.(status)
  }
}
