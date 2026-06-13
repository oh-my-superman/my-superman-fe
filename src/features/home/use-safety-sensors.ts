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
  const [data, setData] = useState({ lux: 0, pressure: 0, db: 0, motion: 0, rotation: 0 })
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
    // 0. Request Motion Permissions (iOS)
    if (
      typeof (DeviceMotionEvent as any).requestPermission === 'function'
    ) {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission()
        if (permission !== 'granted') {
          console.warn('Motion permission denied')
        }
      } catch (err) {
        console.error('Motion permission error:', err)
      }
    }

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
        })
        pressureSensor.start()
        sensorsRef.current.push(pressureSensor)
      } catch (err) {
        console.warn('Barometer failed:', err)
      }
    }

    // 4. Motion & Rotation (Standard API)
    const handleMotion = (event: DeviceMotionEvent) => {
      // 1st priority: acceleration (excludes gravity)
      // 2nd priority: accelerationIncludingGravity (requires subtracting gravity)
      const acc = event.acceleration || event.accelerationIncludingGravity
      
      if (acc) {
        let magnitude = Math.sqrt((acc.x || 0)**2 + (acc.y || 0)**2 + (acc.z || 0)**2)
        
        // If using includingGravity, subtract approx earth gravity (9.8)
        if (!event.acceleration && event.accelerationIncludingGravity) {
          magnitude = Math.abs(magnitude - 9.80665)
        }

        const motionVal = Math.round(magnitude * 10) / 10
        setData(prev => ({ ...prev, motion: motionVal }))
        
        // Threshold for strong impact (approx 2.5G - 3G beyond gravity/rest)
        if (motionVal > 25) { 
          triggerAlert(`[경고] 강한 충격 감지!`)
        }
      }
      
      const rot = event.rotationRate
      if (rot) {
        const rotationVal = Math.round(Math.abs(rot.alpha || 0) + Math.abs(rot.beta || 0) + Math.abs(rot.gamma || 0))
        setData(prev => ({ ...prev, rotation: rotationVal }))
      }
    }

    window.addEventListener('devicemotion', handleMotion)
    sensorsRef.current.push({ stop: () => window.removeEventListener('devicemotion', handleMotion) })
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
