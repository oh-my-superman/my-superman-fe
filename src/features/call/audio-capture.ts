import { arrayBufferToBase64, floatToPcm16 } from './pcm'

/**
 * Mic capture for the live call. Captures mono audio at 16 kHz (the rate Gemini
 * Live expects), converts it to PCM16, and hands ~100ms base64 chunks to the
 * caller for streaming as `call.audio`.
 *
 * The AudioWorklet processor is loaded from a Blob URL so we don't need a
 * separately-served file in the bundle.
 */

const WORKLET_SRC = `
class PcmCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this._chunk = 1600 // 100ms @ 16kHz
    this._buf = new Float32Array(this._chunk)
    this._len = 0
  }
  process(inputs) {
    const ch = inputs[0] && inputs[0][0]
    if (!ch) return true
    for (let i = 0; i < ch.length; i++) {
      this._buf[this._len++] = ch[i]
      if (this._len === this._chunk) {
        this.port.postMessage(this._buf.slice(0))
        this._len = 0
      }
    }
    return true
  }
}
registerProcessor('pcm-capture', PcmCaptureProcessor)
`

export interface AudioCaptureHandle {
  stop: () => void
  setMuted: (muted: boolean) => void
}

/**
 * Wire the mic into `context` (which must be a 16 kHz AudioContext) and stream
 * PCM16 chunks via `onChunk`. The context is owned by the caller.
 */
export async function startAudioCapture(
  context: AudioContext,
  onChunk: (base64: string) => void,
): Promise<AudioCaptureHandle> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      channelCount: 1,
    },
  })

  const url = URL.createObjectURL(
    new Blob([WORKLET_SRC], { type: 'application/javascript' }),
  )
  try {
    await context.audioWorklet.addModule(url)
  } finally {
    URL.revokeObjectURL(url)
  }

  const source = context.createMediaStreamSource(stream)
  const node = new AudioWorkletNode(context, 'pcm-capture')
  let muted = false

  node.port.onmessage = (event) => {
    if (muted) return
    const pcm = floatToPcm16(event.data as Float32Array)
    onChunk(arrayBufferToBase64(pcm.buffer))
  }

  source.connect(node)
  // Keep the graph pulling. The worklet emits no output, so this stays silent
  // (no echo).
  node.connect(context.destination)

  return {
    setMuted: (value) => {
      muted = value
      stream.getAudioTracks().forEach((track) => (track.enabled = !value))
    },
    stop: () => {
      node.port.onmessage = null
      try {
        source.disconnect()
      } catch {
        // already disconnected
      }
      try {
        node.disconnect()
      } catch {
        // already disconnected
      }
      stream.getTracks().forEach((track) => track.stop())
    },
  }
}
