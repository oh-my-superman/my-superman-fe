import { useEffect, useRef, useState } from 'react'

interface SensorThresholds {
  lux: number
  pressure: number
  decibel: number
}

const DEFAULT_THRESHOLDS: SensorThresholds = {
  lux: 10,
  pressure: 1000,
  decibel: 80,
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
  
  // For pressure delta calculation over time
  const pressureHistoryRef = useRef<{ val: number, time: number }[]>([])

  const triggerAlert = (msg: string) => {
    const now = Date.now()
    if (now - lastAlertTimeRef.current > 10000) {
      alert(msg)
      lastAlertTimeRef.current = now
    }
  }

  // 1. Calculate Danger Score whenever sensor data updates
  useEffect(() => {
    if (!active) return

    // Individual Base Scores (0-100) - Fine-tuned for stability
    const motionScore = Math.min(100, (data.motion / 28) * 100)
    const noiseScore = Math.min(100, (Math.max(0, data.db - 20) / 55) * 100)
    const rotationScore = Math.min(100, (data.rotation / 500) * 100)
    
    // Pressure Delta Calculation: Compare current with ~1s ago
    const now = Date.now()
    pressureHistoryRef.current.push({ val: data.pressure, time: now })
    // Keep only last 2 seconds of history
    pressureHistoryRef.current = pressureHistoryRef.current.filter(p => now - p.time < 2000)
    
    const oneSecAgo = pressureHistoryRef.current.find(p => now - p.time >= 1000)
    const pressureDelta = oneSecAgo ? Math.abs(data.pressure - oneSecAgo.val) : 0
    const pressureScore = Math.min(100, (pressureDelta / 2.5) * 100)

    // Contextual Lux Score
    const isDark = data.lux < 5
    const hasActivity = motionScore > 15 || noiseScore > 20 || rotationScore > 15
    const luxScore = (isDark && hasActivity) ? 100 : 0

    // Final Score: Max of any one sensor
    const finalScore = Math.round(
      Math.max(motionScore, noiseScore, rotationScore, luxScore, pressureScore)
    )

    if (finalScore !== data.dangerScore) {
      setData(prev => ({ ...prev, dangerScore: finalScore }))
      
      if (finalScore > 90) {
        triggerAlert(`[긴급] 매우 위험한 상황이 감지되었습니다! (위험도: ${finalScore}%)`)
      }
    }
  }, [active, data.lux, data.db, data.motion, data.rotation, data.pressure, data.dangerScore])

  // 2. Sensor Initialization
  useEffect(() => {
    if (!active) {
      stopAll()
      return
    }

    async function startSensors() {
      // Permissions
      if (navigator.permissions) {
        try {
          await Promise.all([
            navigator.permissions.query({ name: 'accelerometer' as any }).catch(() => ({ state: 'granted' })),
            navigator.permissions.query({ name: 'gyroscope' as any }).catch(() => ({ state: 'granted' })),
            navigator.permissions.query({ name: 'ambient-light-sensor' as any }).catch(() => ({ state: 'granted' })),
          ])
        } catch (e) { /* ignore */ }
      }

      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceMotionEvent as any).requestPermission()
          if (permission !== 'granted') return
        } catch (err) { /* ignore */ }
      }

      // Audio
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = stream
        const AudioContextCtor = (window as any).AudioContext || (window as any).webkitAudioContext
        const audioContext = new AudioContextCtor()
        audioContextRef.current = audioContext
        
        const source = audioContext.createMediaStreamSource(stream)
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 256
        source.connect(analyser)
        const bufferLength = analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)

        const checkAudio = () => {
          if (!audioContextRef.current) return
          analyser.getByteFrequencyData(dataArray)
          let sum = 0
          for (let i = 0; i < bufferLength; i++) sum += dataArray[i]
          const average = sum / bufferLength
          setData(prev => ({ ...prev, db: Math.round(average) }))
          requestAnimationFrame(checkAudio)
        }
        checkAudio()
      } catch (err) { console.warn('Audio fail:', err) }

      // Ambient Light
      if ('AmbientLightSensor' in window) {
        try {
          const luxSensor = new (window as any).AmbientLightSensor({ frequency: 5 })
          luxSensor.addEventListener('reading', () => {
            setData(prev => ({ ...prev, lux: Math.round(luxSensor.lux) }))
          })
          luxSensor.start()
          sensorsRef.current.push(luxSensor)
        } catch (e) { /* ignore */ }
      }

      // Barometer
      if ('Barometer' in window) {
        try {
          const pressureSensor = new (window as any).Barometer({ frequency: 5 })
          pressureSensor.addEventListener('reading', () => {
            setData(prev => ({ ...prev, pressure: Math.round(pressureSensor.pressure) }))
          })
          pressureSensor.start()
          sensorsRef.current.push(pressureSensor)
        } catch (e) { /* ignore */ }
      }

      // Motion
      const handleMotion = (event: DeviceMotionEvent) => {
        const acc = event.acceleration || event.accelerationIncludingGravity
        if (acc) {
          let magnitude = Math.sqrt((acc.x || 0)**2 + (acc.y || 0)**2 + (acc.z || 0)**2)
          if (!event.acceleration && event.accelerationIncludingGravity) {
            magnitude = Math.abs(magnitude - 9.81)
          }
          setData(prev => ({ ...prev, motion: Math.round(magnitude * 10) / 10 }))
        }
        const rot = event.rotationRate
        if (rot) {
          const val = Math.round(Math.abs(rot.alpha || 0) + Math.abs(rot.beta || 0) + Math.abs(rot.gamma || 0))
          setData(prev => ({ ...prev, rotation: val }))
        }
      }
      window.addEventListener('devicemotion', handleMotion)
      sensorsRef.current.push({ stop: () => window.removeEventListener('devicemotion', handleMotion) })
    }

    startSensors()
    return () => stopAll()
  }, [active])

  function stopAll() {
    sensorsRef.current.forEach(s => s.stop && s.stop())
    sensorsRef.current = []
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
  }

  return data
}
