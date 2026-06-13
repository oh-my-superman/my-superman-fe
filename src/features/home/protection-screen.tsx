import { useRef, useEffect } from 'react'
import { ShieldAlert } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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
  isContext = false,
}: {
  label: string
  value: number
  unit: string
  color: string
  percent: number
  isContext?: boolean
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
          width: '100%',
          maxWidth: 48,
          background: 'var(--neutral-100)',
          borderRadius: 12,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}
      >
        <motion.div
          initial={isContext ? { height: '2%' } : { height: 0 }}
          animate={
            isContext
              ? { height: ['2%', '4%', '2%'] }
              : { height: `${Math.min(100, Math.max(5, percent))}%` }
          }
          transition={
            isContext
              ? { repeat: Infinity, duration: 2.5, ease: 'easeInOut' }
              : { type: 'spring', stiffness: 300, damping: 30 }
          }
          style={{
            width: '100%',
            background: color,
            borderRadius: 12,
            boxShadow: `0 0 20px ${color}40`,
          }}
        />
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
            fontSize: 10,
            fontWeight: 700,
            marginBottom: 4,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </div>
        <div
          style={{ fontSize: 13, fontWeight: 800, color: 'var(--foreground)' }}
        >
          {value}
          <span
            style={{
              fontSize: 9,
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
  const companion = useCompanionStore((s) => s.companion)
  const setCompanion = useCompanionStore((s) => s.setCompanion)
  const startSession = useCompanionSession((s) => s.startSession)
  const endSession = useCompanionSession((s) => s.endSession)
  const sensorData = useSafetySensors(companion)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Map sensor data to percentages for the meters (Synced with Balanced thresholds)
  const getLuxPercent = (lx: number) => Math.min(50, Math.max(0, (10 - lx) * 5)) // 0 lx = 50%, 10+ lx = 0%
  const getPressureRisk = (hPa: number) => {
    // Baseline: 1013 hPa = 33% (1/3)
    const baseline = 33
    const diff = Math.abs(hPa - 1013)
    const variation = Math.min(67, diff * 15) // Max 67% additional for diff
    const pulse = (sensorData.pressure % 10) * 0.5 // Minimal pulse for "live" feel
    
    return Math.min(100, baseline + variation + pulse)
  }
  const getMotionPercent = (m: number) => Math.min(100, (m / 28) * 100)
  const getRotationPercent = (r: number) => Math.min(100, (r / 500) * 100)
  const getDbPercent = (db: number) =>
    Math.min(100, (Math.max(0, db - 20) / 55) * 100)

  const getStatusInfo = () => {
    const score = sensorData.dangerScore
    if (score > 80)
      return {
        label: '긴급 위험 감지',
        color: 'var(--red-emergency)',
        bg: '#fef2f2',
      }
    if (score > 40)
      return {
        label: '주변 상황 주의',
        color: 'var(--amber-caution)',
        bg: '#fffbeb',
      }
    return {
      label: '실시간 보호 중',
      color: 'var(--green-safe)',
      bg: '#f0fdf4',
    }
  }

  const status = getStatusInfo()

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
              width: 240,
              height: 240,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Circular Progress Bar (Danger Score) */}
            <AnimatePresence>
              {companion && (
                <svg
                  style={{
                    position: 'absolute',
                    transform: 'rotate(-90deg)',
                    zIndex: 0,
                  }}
                  width="240"
                  height="240"
                  viewBox="0 0 240 240"
                >
                  {/* Track */}
                  <circle
                    cx="120"
                    cy="120"
                    r="116"
                    fill="transparent"
                    stroke="var(--neutral-100)"
                    strokeWidth="4"
                  />
                  {/* Progress */}
                  <motion.circle
                    cx="120"
                    cy="120"
                    r="116"
                    fill="transparent"
                    stroke="#f08080"
                    strokeWidth="5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: sensorData.dangerScore / 100 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{
                      filter: `drop-shadow(0 0 6px #f0808040)`,
                    }}
                  />
                </svg>
              )}
            </AnimatePresence>

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
                width: 216,
                height: 216,
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
            <AnimatePresence mode="wait">
              {companion ? (
                <motion.div
                  key="active-status"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 14px',
                      borderRadius: 99,
                      background: status.bg,
                      color: status.color,
                      border: `1px solid ${status.color}25`,
                    }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 99,
                        background: status.color,
                      }}
                    />
                    <span style={{ fontSize: 14, fontWeight: 800 }}>
                      {status.label}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--neutral-400)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    분석 위험{' '}
                    <span style={{ color: '#f08080' }}>
                      {sensorData.dangerScore}%
                    </span>
                  </div>
                </motion.div>
              ) : (
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: 'var(--neutral-600)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  <ShieldAlert size={24} />
                  보호 모드 해제됨
                </div>
              )}
            </AnimatePresence>
            <p
              style={{
                fontSize: 13,
                color: 'var(--neutral-400)',
                fontWeight: 500,
                lineHeight: 1.5,
                marginTop: 8,
              }}
            >
              {companion ? (
                <>
                  종합적인 위험 상황을{' '}
                  <strong style={{ color: 'var(--neutral-600)' }}>
                    실시간으로 분석
                  </strong>
                  하고 있어요.
                  <br />
                  위험 상황으로 판단되면{' '}
                  <strong style={{ color: 'var(--neutral-600)' }}>
                    슈퍼 통화
                  </strong>
                  로 연결돼요.
                </>
              ) : (
                '탭하여 보호모드를 시작하세요'
              )}
            </p>
          </div>
        </div>

        {/* Vertical Level Meters Area */}
        <div
          style={{ flex: '1', minHeight: 0, paddingBottom: 10, marginTop: 12 }}
        >
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
                  gap: 8,
                  padding: '24px 12px',
                  background: '#fff',
                  borderRadius: 'var(--radius-3xl)',
                }}
              >
                <LevelMeter
                  label="밝기"
                  value={sensorData.lux}
                  unit="lx"
                  color="#FFE066"
                  percent={getLuxPercent(sensorData.lux)}
                />
                <LevelMeter
                  label="기압"
                  value={sensorData.pressure}
                  unit="hPa"
                  color="#74C0FC"
                  percent={getPressureRisk(sensorData.pressure)}
                />
                <LevelMeter
                  label="충격"
                  value={sensorData.motion}
                  unit="m/s²"
                  color="#FF8787"
                  percent={getMotionPercent(sensorData.motion)}
                />
                <LevelMeter
                  label="회전"
                  value={sensorData.rotation}
                  unit="°/s"
                  color="#9775FA"
                  percent={getRotationPercent(sensorData.rotation)}
                />
                <LevelMeter
                  label="소음"
                  value={sensorData.db}
                  unit="dB"
                  color="#FFA8A8"
                  percent={getDbPercent(sensorData.db)}
                />
                <LevelMeter
                  label="맥락"
                  value={2}
                  unit="%"
                  color="#CED4DA"
                  percent={0}
                  isContext
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
