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

  constructor(context: AudioContext) {
    this.#ctx = context
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
  }
}
