import { useEffect, useRef } from 'react'

import { useCompanionSession } from '../companion/session-store'
import { uploadToS3 } from './s3-upload'

const CAPTURE_INTERVAL_MS = 3_000
const JPEG_QUALITY = 0.7
// Placeholder identity until auth lands (matches session-store).
const USER_ID = 1

/**
 * While `active`, grabs a JPEG from the (hidden) camera `<video>` every 3s,
 * uploads it to S3 via a BE presigned URL, and reports it to the BE as a
 * `screen` evidence frame (`photoUri` + GPS + capturedAt). Audio is not
 * captured. Returns a ref to attach to a muted, playsInline `<video>`.
 *
 * Driven by the call screen with `active = (status === 'live')`, so the camera
 * only runs during an active call and is torn down when it ends.
 */
export function useCameraEvidence(
  active: boolean,
): React.RefObject<HTMLVideoElement | null> {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!active || typeof navigator === 'undefined') return

    // Object flag so the async closures see live mutations (a plain `let`
    // would be narrowed to its initial value by the type checker).
    const control = { cancelled: false }
    const isCancelled = () => control.cancelled
    let stream: MediaStream | null = null
    let interval: ReturnType<typeof setInterval> | null = null
    let geoWatch: number | null = null
    let coords: { latitude: number; longitude: number } | null = null
    let uploading = false
    const canvas = document.createElement('canvas')

    if ('geolocation' in navigator) {
      geoWatch = navigator.geolocation.watchPosition(
        (pos) => {
          coords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }
        },
        () => {
          // permission denied / unavailable — frames go out without GPS
        },
        { enableHighAccuracy: false, maximumAge: 10_000, timeout: 10_000 },
      )
    }

    const captureAndUpload = async () => {
      const video = videoRef.current
      if (!video || uploading || video.readyState < 2) return
      const width = video.videoWidth
      const height = video.videoHeight
      if (!width || !height) return

      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(video, 0, 0, width, height)

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY),
      )
      if (!blob || isCancelled()) return

      uploading = true
      try {
        const session = useCompanionSession.getState()
        const photoUri = await uploadToS3(blob, {
          contentType: 'image/jpeg',
          sessionId: session.sessionId,
        })
        if (isCancelled()) return
        session.send({
          type: 'screen',
          userId: USER_ID,
          photoUri,
          ...(coords ?? {}),
          capturedAt: new Date().toISOString(),
        })
      } catch (err) {
        console.error('[evidence] capture upload failed', err)
      } finally {
        uploading = false
      }
    }

    const setup = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        })
      } catch (err) {
        console.error('[evidence] camera unavailable', err)
        return
      }
      if (isCancelled()) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }
      const video = videoRef.current
      if (!video) return
      video.srcObject = stream
      try {
        await video.play()
      } catch {
        // autoplay may be blocked until a gesture; capture resumes once playing
      }
      interval = setInterval(() => void captureAndUpload(), CAPTURE_INTERVAL_MS)
    }
    void setup()

    return () => {
      control.cancelled = true
      if (interval) clearInterval(interval)
      if (geoWatch !== null) {
        navigator.geolocation.clearWatch(geoWatch)
      }
      stream?.getTracks().forEach((track) => track.stop())
      if (videoRef.current) videoRef.current.srcObject = null
    }
  }, [active])

  return videoRef
}
