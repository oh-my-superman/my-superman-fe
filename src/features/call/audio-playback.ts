import { pcm16ToFloat32 } from './pcm'

const PLAYBACK_SAMPLE_RATE = 24000

/**
 * Gapless playback for AI audio (PCM16 24 kHz mono). Each incoming chunk is
 * scheduled right after the previous one via a running cursor, so the stream
 * plays without clicks. `flush()` implements barge-in: when the user
 * interrupts, everything queued/playing is dropped immediately.
 *
 * Buffers are created at 24 kHz regardless of the context's native rate — the
 * source node resamples on playback.
 */
export class AudioPlayback {
  #ctx: AudioContext
  #nextStart = 0
  #sources = new Set<AudioBufferSourceNode>()
  /** Called with `true` while audio is actually playing (AI speaking). */
  #onActiveChange?: (active: boolean) => void
  #active = false
  #idleTimer: ReturnType<typeof setTimeout> | null = null

  constructor(context: AudioContext, onActiveChange?: (active: boolean) => void) {
    this.#ctx = context
    this.#onActiveChange = onActiveChange
  }

  enqueue(samples: Int16Array): void {
    if (samples.length === 0) return
    const float = pcm16ToFloat32(samples)
    const buffer = this.#ctx.createBuffer(1, float.length, PLAYBACK_SAMPLE_RATE)
    buffer.copyToChannel(float, 0)

    const node = this.#ctx.createBufferSource()
    node.buffer = buffer
    node.connect(this.#ctx.destination)

    const startAt = Math.max(this.#nextStart, this.#ctx.currentTime + 0.02)
    node.start(startAt)
    this.#nextStart = startAt + buffer.duration

    this.#sources.add(node)
    node.onended = () => this.#sources.delete(node)

    this.#setActive(true)
    this.#scheduleIdleCheck()
  }

  /** Barge-in: stop and drop everything currently queued or playing. */
  flush(): void {
    this.#sources.forEach((node) => {
      node.onended = null
      try {
        node.stop()
      } catch {
        // already stopped
      }
    })
    this.#sources.clear()
    this.#nextStart = 0
    this.#clearIdleTimer()
    this.#setActive(false)
  }

  /** Mark playback idle once the queue is expected to have drained. */
  #scheduleIdleCheck(): void {
    this.#clearIdleTimer()
    const remainingMs = (this.#nextStart - this.#ctx.currentTime) * 1000 + 120
    this.#idleTimer = setTimeout(
      () => this.#setActive(false),
      Math.max(0, remainingMs),
    )
  }

  #clearIdleTimer(): void {
    if (this.#idleTimer) {
      clearTimeout(this.#idleTimer)
      this.#idleTimer = null
    }
  }

  #setActive(active: boolean): void {
    if (active === this.#active) return
    this.#active = active
    this.#onActiveChange?.(active)
  }
}
