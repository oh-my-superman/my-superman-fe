import { useNavigate } from '@tanstack/react-router'
import { useRef, useEffect } from 'react'
import { Zap, Activity, Volume2, ShieldCheck, ShieldAlert } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { Card } from '#/components/ui/card'
import { MainLayout } from '#/components/main-layout'
import { useCompanionSession } from '#/features/companion/session-store'
import { useCompanionStore } from '#/store/companion'
import { useSafetySensors } from '#/features/home/use-safety-sensors'

function LevelMeter({
  label,
  value,
  unit,
  color,
  percent,
}: {
  label: string
  value: number
  unit: string
  color: string
  percent: number
}) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        height: '100%',
      }}
    >
      <div
        style={{
          flex: 1,
          width: 48,
          background: 'var(--neutral-100)',
          borderRadius: 24,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}
      >
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${Math.min(100, Math.max(5, percent))}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{
            width: '100%',
            background: color,
            borderRadius: 24,
            boxShadow: `0 0 20px ${color}40`,
          }}
        />
        {/* Subtle glass effect on top */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
            pointerEvents: 'none',
          }}
        />
      </div>

      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            color: 'var(--neutral-500)',
            fontSize: 11,
            fontWeight: 700,
            marginBottom: 4,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {label}
        </div>
        <div
          style={{ fontSize: 15, fontWeight: 800, color: 'var(--foreground)' }}
        >
          {value}
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              marginLeft: 1,
              color: 'var(--neutral-400)',
            }}
          >
            {unit}
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * 보호 화면 — a big AI-companion toggle and real-time level meters.
 */
export function ProtectionScreen() {
  const navigate = useNavigate()
  const companion = useCompanionStore((s) => s.companion)
  const setCompanion = useCompanionStore((s) => s.setCompanion)
  const startSession = useCompanionSession((s) => s.startSession)
  const endSession = useCompanionSession((s) => s.endSession)
  const sensorData = useSafetySensors(companion)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Map sensor data to percentages for the meters
  const getLuxPercent = (lx: number) => Math.min(100, (lx / 500) * 100)
  const getPressurePercent = (hPa: number) => {
    // Normal range approx 980-1030
    const base = 980
    return Math.min(100, Math.max(0, ((hPa - base) / 50) * 100))
  }
  const getDbPercent = (db: number) => Math.min(100, (db / 100) * 100)

  useEffect(() => {
    if (companion) void startSession(true)
    else void endSession()
  }, [companion, startSession, endSession])

  useEffect(() => {
    if (videoRef.current) {
      if (companion) {
        videoRef.current.play().catch(() => {})
      } else {
        videoRef.current.pause()
        videoRef.current.currentTime = 0
      }
    }
  }, [companion])

  return (
    <MainLayout>
      <div
        style={{
          flex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '0 20px 24px',
          overflow: 'hidden',
        }}
      >
        {/* Large Superman Hero Toggle */}
        <div
          onClick={() => setCompanion(!companion)}
          style={{
            flex: '1.2',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: 220,
              height: 220,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Pulse effect when ON */}
            <AnimatePresence>
              {companion && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  style={{ position: 'absolute', inset: -20 }}
                >
                  <div
                    className="animate-sm-hero-pulse"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '50%',
                      background:
                        'radial-gradient(circle, var(--coral-200) 0%, transparent 70%)',
                      zIndex: 0,
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: '#ffffff',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 1,
                boxShadow: companion
                  ? 'var(--shadow-coral)'
                  : 'var(--shadow-sm)',
                transition: 'all .4s ease',
              }}
            >
              <video
                ref={videoRef}
                src="/video/flying_superman.mp4"
                muted
                playsInline
                style={{
                  width: '120%',
                  height: '120%',
                  objectFit: 'cover',
                  transform: companion
                    ? 'scale(1) translateY(+10px)'
                    : 'scale(1)',
                  transition: 'transform .5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  mixBlendMode: 'multiply',
                }}
                onTimeUpdate={() => {
                  if (
                    companion &&
                    videoRef.current &&
                    videoRef.current.currentTime >=
                      videoRef.current.duration - 0.2
                  ) {
                    videoRef.current.currentTime = 5.7
                  }
                }}
                onEnded={() => {
                  if (companion && videoRef.current) {
                    videoRef.current.currentTime = 5.7
                    videoRef.current.play()
                  }
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: companion ? 'var(--coral-600)' : 'var(--foreground)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {companion ? (
                <ShieldCheck size={24} />
              ) : (
                <ShieldAlert size={24} />
              )}
              {companion ? '보호 모드 작동 중' : '보호 모드 해제됨'}
            </div>
            <p
              style={{
                fontSize: 14,
                color: 'var(--neutral-500)',
                marginTop: 6,
                fontWeight: 500,
              }}
            >
              {companion
                ? '주변 환경을 실시간으로 감시합니다'
                : '탭하여 실시간 감지를 시작하세요'}
            </p>
          </div>
        </div>

        {/* Vertical Level Meters Area */}
        <div style={{ flex: '1', minHeight: 0, paddingBottom: 10 }}>
          <AnimatePresence>
            {companion ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  height: '100%',
                  display: 'flex',
                  gap: 16,
                  padding: '24px',
                  background: '#fff',
                  borderRadius: 'var(--radius-3xl)',
                }}
              >
                <LevelMeter
                  label="주변 밝기"
                  value={sensorData.lux}
                  unit="lx"
                  color="#f5a623"
                  percent={getLuxPercent(sensorData.lux)}
                />
                <div
                  style={{
                    width: 1,
                    background: 'var(--neutral-100)',
                    height: '80%',
                    alignSelf: 'center',
                  }}
                />
                <LevelMeter
                  label="물리적 충격"
                  value={sensorData.pressure}
                  unit="hPa"
                  color="#4a8cf0"
                  percent={getPressurePercent(sensorData.pressure)}
                />
                <div
                  style={{
                    width: 1,
                    background: 'var(--neutral-100)',
                    height: '80%',
                    alignSelf: 'center',
                  }}
                />
                <LevelMeter
                  label="소음"
                  value={sensorData.db}
                  unit="dB"
                  color="#f08080"
                  percent={getDbPercent(sensorData.db)}
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--neutral-50)',
                  borderRadius: 'var(--radius-3xl)',
                  border: '1.5px dashed var(--neutral-200)',
                  color: 'var(--neutral-400)',
                  fontSize: 14,
                  fontWeight: 600,
                  textAlign: 'center',
                  padding: 40,
                }}
              >
                센서 데이터가 이곳에 표시됩니다
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MainLayout>
  )
}
