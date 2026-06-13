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
  const [data, setData] = useState({ 
    lux: 0, 
    pressure: 1013, 
    db: 0, 
    motion: 0, 
    rotation: 0,
    dangerScore: 0 
  })
  const audioContextRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const sensorsRef = useRef<any[]>([])
  const lastAlertTimeRef = useRef<number>(0)
  const lastPressureRef = useRef<number>(1013)

  const triggerAlert = (msg: string) => {
    const now = Date.now()
    if (now - lastAlertTimeRef.current > 10000) { // Increased to 10s for fusion logic
      alert(msg)
      lastAlertTimeRef.current = now
    }
  }

  // Consolidated Risk Assessment
  useEffect(() => {
    if (!active) return

    const calculateDanger = () => {
      // 1. Individual Base Scores (0-100)
      const motionScore = Math.min(100, (data.motion / 35) * 100)
      const noiseScore = Math.min(100, (Math.max(0, data.db - 40) / 60) * 100)
      const rotationScore = Math.min(100, (data.rotation / 600) * 100)
      
      const pressureDelta = Math.abs(data.pressure - lastPressureRef.current)
      const pressureScore = Math.min(100, (pressureDelta / 3) * 100)
      lastPressureRef.current = data.pressure

      // 2. Contextual Lux Score (Pocket Detection)
      // Only count darkness as a risk if there's also suspicious movement or noise
      const isDark = data.lux < 5
      const hasActivity = motionScore > 20 || noiseScore > 25 || rotationScore > 20
      const luxScore = (isDark && hasActivity) ? 100 : 0

      // 3. Weighted Sum (Updated weights: Focus more on physical signals)
      let total = (
        (motionScore * 0.40) + 
        (noiseScore * 0.30) + 
        (rotationScore * 0.20) + 
        (pressureScore * 0.10)
      )

      // 4. Combo & Context Bonuses
      // Abduction Case: Dark + Pressure Change + Some Activity
      if (isDark && pressureScore > 50 && hasActivity) total += 25
      
      // Struggle Case: Dark + High Motion
      if (isDark && motionScore > 50) total += 15

      const finalScore = Math.round(Math.min(100, total))
      
      if (finalScore !== data.dangerScore) {
        setData(prev => ({ ...prev, dangerScore: finalScore }))
        
        if (finalScore > 80) {
          triggerAlert(`[긴급] 매우 위험한 상황이 감지되었습니다! (위험도: ${finalScore}%)`)
        } else if (finalScore > 50 && lastAlertTimeRef.current === 0) {
           // Basic caution logging or silent alert to server could go here
        }
      }
    }

    const timer = setInterval(calculateDanger, 1000)
    return () => clearInterval(timer)
  }, [data, active])

  async function startSensors() {
    // 0. Request Permissions
    if ('permissions' in navigator) {
      try {
        // Some browsers require explicit permission query for sensors
        await Promise.all([
          navigator.permissions.query({ name: 'accelerometer' as any }).catch(() => ({ state: 'granted' })),
          navigator.permissions.query({ name: 'gyroscope' as any }).catch(() => ({ state: 'granted' })),
          navigator.permissions.query({ name: 'ambient-light-sensor' as any }).catch(() => ({ state: 'granted' })),
        ])
      } catch (e) {
        console.warn('Permission query not fully supported')
      }
    }

    // 0-1. iOS Motion Permission
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission()
        if (permission !== 'granted') return
      } catch (err) {
        console.error('Motion permission error:', err)
      }
    }

    // 1. Decibel Sensing (Audio)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const AudioContextCtor = (
        window as Window & {
          AudioContext?: typeof AudioContext
          webkitAudioContext?: typeof AudioContext
        }
      ).AudioContext ?? (window as any).webkitAudioContext
      const audioContext = new AudioContextCtor()
      audioContextRef.current = audioContext

      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)

      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const checkAudio = () => {
        if (!active || !audioContextRef.current) return
        analyser.getByteFrequencyData(dataArray)
        let sum = 0
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i]
        }
        const average = sum / bufferLength
        const db = Math.round(average)

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

    // 2. Light Sensor (Generic Sensor API)
    if ('AmbientLightSensor' in window) {
      try {
        const luxSensor = new (window as any).AmbientLightSensor({ frequency: 2 })
        luxSensor.addEventListener('reading', () => {
          const lux = Math.round(luxSensor.lux)
          setData((prev) => ({ ...prev, lux }))
          if (lux < DEFAULT_THRESHOLDS.lux) {
            triggerAlert(`[경고] 급격한 조도 저하 감지: ${lux} lux`)
          }
        })
        luxSensor.addEventListener('error', (event: any) => {
          console.warn('Lux sensor error:', event.error.name, event.error.message)
        })
        luxSensor.start()
        sensorsRef.current.push(luxSensor)
      } catch (err) {
        console.warn('Light sensor init failed:', err)
      }
    }

    // 3. Barometer (Generic Sensor API)
    if ('Barometer' in window) {
      try {
        const pressureSensor = new (window as any).Barometer({ frequency: 2 })
        pressureSensor.addEventListener('reading', () => {
          const pressure = Math.round(pressureSensor.pressure)
          setData((prev) => ({ ...prev, pressure }))
        })
        pressureSensor.addEventListener('error', (event: any) => {
          console.warn('Barometer error:', event.error.name, event.error.message)
        })
        pressureSensor.start()
        sensorsRef.current.push(pressureSensor)
      } catch (err) {
        console.warn('Barometer init failed:', err)
      }
    }

    // 4. Motion & Rotation (Standard API)
    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.acceleration || event.accelerationIncludingGravity
      if (acc) {
        let magnitude = Math.sqrt((acc.x || 0) ** 2 + (acc.y || 0) ** 2 + (acc.z || 0) ** 2)
        if (!event.acceleration && event.accelerationIncludingGravity) {
          magnitude = Math.abs(magnitude - 9.81)
        }
        const motionVal = Math.round(magnitude * 10) / 10
        setData((prev) => ({ ...prev, motion: motionVal }))
        if (motionVal > 25) {
          triggerAlert(`[경고] 강한 충격 감지!`)
        }
      }

      const rot = event.rotationRate
      if (rot) {
        const rotationVal = Math.round(
          Math.abs(rot.alpha || 0) + Math.abs(rot.beta || 0) + Math.abs(rot.gamma || 0)
        )
        setData((prev) => ({ ...prev, rotation: rotationVal }))
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
