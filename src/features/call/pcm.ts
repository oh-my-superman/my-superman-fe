/** PCM16 ↔ Float32 ↔ base64 helpers for the live audio call. */

/** Float32 samples in [-1, 1] → little-endian PCM16. */
export function floatToPcm16(input: Float32Array): Int16Array<ArrayBuffer> {
  const out = new Int16Array(input.length)
  for (let i = 0; i < input.length; i += 1) {
    const s = Math.max(-1, Math.min(1, input[i]))
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }
  return out
}

/** PCM16 → Float32 samples in [-1, 1]. */
export function pcm16ToFloat32(input: Int16Array): Float32Array<ArrayBuffer> {
  const out = new Float32Array(input.length)
  for (let i = 0; i < input.length; i += 1) {
    out[i] = input[i] / 0x8000
  }
  return out
}

/** Raw bytes → base64 (chunked so large buffers don't blow the call stack). */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  const CHUNK = 0x8000
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
  }
  return btoa(binary)
}

/** base64 (PCM16 payload) → Int16 samples. */
export function base64ToInt16(base64: string): Int16Array<ArrayBuffer> {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  // PCM16 is little-endian, matching Int16Array on all common platforms.
  return new Int16Array(bytes.buffer)
}
