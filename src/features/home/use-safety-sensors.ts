import { useEffect, useRef, useState } from 'react'

interface SensorThresholds {
  lux: number
  pressure: number
  decibel: number
}

const DEFAULT_THRESHOLDS: SensorThresholds = {
  lux: 10, // Too dark
  pressure: 1000, // Just a placeholder threshold
  decibel: 80, // Loud noise
}

export function useSafetySensors(active: boolean) {
  const [data, setData] = useState({ lux: 0, pressure: 0, db: 0 })
  const audioContextRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const sensorsRef = useRef<any[]>([])
  const lastAlertTimeRef = useRef<number>(0)

  const triggerAlert = (msg: string) => {
    const now = Date.now()
    if (now - lastAlertTimeRef.current > 5000) {
      // 5s cooldown
      alert(msg)
      lastAlertTimeRef.current = now
    }
  }

  useEffect(() => {
    if (!active) {
      stopAll()
      return
    }

    startSensors()

    return () => {
      stopAll()
    }
  }, [active])

  async function startSensors() {
    // 1. Decibel Sensing (Audio)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const audioContext = new AudioContext()
      audioContextRef.current = audioContext

      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)

      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const checkAudio = () => {
        if (!active) return
        analyser.getByteFrequencyData(dataArray)
        let sum = 0
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i]
        }
        const average = sum / bufferLength
        const db = Math.round(average) // Simplified dB-like value

        setData((prev) => ({ ...prev, db }))

        if (db > DEFAULT_THRESHOLDS.decibel) {
          triggerAlert(`[경고] 높은 소음 감지: ${db}dB`)
        }

        requestAnimationFrame(checkAudio)
      }
      checkAudio()
    } catch (err) {
      console.warn('Audio sensor failed:', err)
    }

    // 2. Light Sensor (Experimental Generic Sensor API)
    if ('AmbientLightSensor' in window) {
      try {
        const luxSensor = new (window as any).AmbientLightSensor()
        luxSensor.addEventListener('reading', () => {
          const lux = luxSensor.lux
          setData((prev) => ({ ...prev, lux }))
          if (lux < DEFAULT_THRESHOLDS.lux) {
            triggerAlert(`[경고] 급격한 조도 저하 감지: ${lux} lux`)
          }
        })
        luxSensor.start()
        sensorsRef.current.push(luxSensor)
      } catch (err) {
        console.warn('Light sensor failed:', err)
      }
    }

    // 3. Barometer (Experimental Generic Sensor API)
    if ('Barometer' in window) {
      try {
        const pressureSensor = new (window as any).Barometer()
        pressureSensor.addEventListener('reading', () => {
          const pressure = pressureSensor.pressure
          setData((prev) => ({ ...prev, pressure }))
          // Pressure thresholds are tricky, usually looking for sudden drops
        })
        pressureSensor.start()
        sensorsRef.current.push(pressureSensor)
      } catch (err) {
        console.warn('Barometer failed:', err)
      }
    }
  }

  function stopAll() {
    sensorsRef.current.forEach((s) => s.stop())
    sensorsRef.current = []

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
  }

  return data
}
