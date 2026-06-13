import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  Hand,
  Mic,
  MicOff,
  PhoneOff,
  PictureInPicture2,
  ScreenShare,
  Settings,
  ShieldAlert,
  Smile,
  Sparkles,
  SwitchCamera,
  User,
  Video,
  Volume2,
} from 'lucide-react'

import { PERSONAS } from '#/features/home/personas'
import { useCall } from '#/features/call/call-store'
import { SAFEWORD } from '#/features/call/call-controller'
import { useCameraEvidence } from '#/features/capture/use-camera-evidence'
import { useCompanionSession } from '#/features/companion/session-store'
import {
  buildDangerReport,
  sendDangerReport,
} from '#/features/report/build-report'
import type {
  DangerReportRequest,
  ReportBuildResult,
} from '#/features/report/build-report'

const isVideoSearch = (value: unknown) =>
  value === true || value === 'true' || value === '1'

const EVIDENCE_UPLOAD_ENABLED =
  import.meta.env.VITE_EVIDENCE_UPLOAD_ENABLED === 'true'
const REPORT_CONFIRM_SECONDS = 15

export const Route = createFileRoute('/call/$personaId')({
  validateSearch: (search: Record<string, unknown>) => ({
    video: isVideoSearch(search.video),
  }),
  component: CallScreen,
})

const STATUS_LABEL: Record<string, string> = {
  idle: '',
  connecting: '연결 중…',
  starting: '연결 중…',
  live: '통화 중',
  stopping: '종료 중…',
  ended: '통화 종료',
  error: '연결 실패',
}

type ReportStatus = 'idle' | 'confirming' | 'building' | 'ready' | 'error'

interface ReportState {
  status: ReportStatus
  result: ReportBuildResult | null
  error: string | null
  secondsLeft: number
}

const INITIAL_REPORT_STATE: ReportState = {
  status: 'idle',
  result: null,
  error: null,
  secondsLeft: REPORT_CONFIRM_SECONDS,
}

function dangerEventKey(
  danger: NonNullable<ReturnType<typeof useCall.getState>['danger']>,
) {
  const eventId = danger.event_id
  if (typeof eventId === 'string' && eventId) return eventId
  const ts = danger.ts_ms
  if (typeof ts === 'string' || typeof ts === 'number') return String(ts)
  const phrase = typeof danger.phrase === 'string' ? danger.phrase : ''
  return `${danger.cause}:${phrase}`
}

function reportCause(
  danger: NonNullable<ReturnType<typeof useCall.getState>['danger']>,
) {
  return danger.cause === 'safeword' || danger.cause === 'scream'
    ? danger.cause
    : null
}

/** Live AI voice call. Streams mic audio and plays the AI's voice in realtime. */
function CallScreen() {
  const { personaId } = Route.useParams()
  const { video: isVideoCall } = Route.useSearch()
  const navigate = useNavigate()
  const persona = PERSONAS.find((p) => p.id === personaId) ?? PERSONAS[0]

  const status = useCall((s) => s.status)
  const speaking = useCall((s) => s.speaking)
  const muted = useCall((s) => s.muted)
  const danger = useCall((s) => s.danger)
  const error = useCall((s) => s.error)
  const start = useCall((s) => s.start)
  const stop = useCall((s) => s.stop)
  const toggleMute = useCall((s) => s.toggleMute)
  const dismissDanger = useCall((s) => s.dismissDanger)
  const [report, setReport] = useState<ReportState>(INITIAL_REPORT_STATE)
  const reportEventKeyRef = useRef<string | null>(null)
  const reportRequestRef = useRef<DangerReportRequest | null>(null)
  const reportInFlightRef = useRef(false)

  const callFinished = status === 'ended' || status === 'error'
  const cameraActive = isVideoCall ? !callFinished : status === 'live'

  const evidenceVideoRef = useCameraEvidence(
    cameraActive,
    EVIDENCE_UPLOAD_ENABLED && status === 'live',
    {
      facingMode: isVideoCall ? 'user' : 'environment',
    },
  )

  // Auto-start the call on mount, end it on leave.
  useEffect(() => {
    start(persona.id)
    return () => stop()
  }, [persona.id, start, stop])

  const confirmReport = useCallback(() => {
    const request = reportRequestRef.current
    if (!request || reportInFlightRef.current) return

    reportInFlightRef.current = true
    setReport({
      status: 'building',
      result: null,
      error: null,
      secondsLeft: 0,
    })

    void (async () => {
      let draft: ReportBuildResult | null = null

      try {
        draft = await buildDangerReport(request)
        setReport({
          status: 'building',
          result: draft,
          error: null,
          secondsLeft: 0,
        })
        await sendDangerReport({ request, draft })
        setReport({
          status: 'ready',
          result: draft,
          error: null,
          secondsLeft: 0,
        })
        reportRequestRef.current = null
        stop()
        navigate({ to: '/', replace: true })
      } catch (err) {
        console.error('[report] danger report submit failed', err)
        setReport({
          status: 'error',
          result: draft,
          error: '신고 요청에 실패했어요.',
          secondsLeft: 0,
        })
      } finally {
        reportInFlightRef.current = false
      }
    })()
  }, [navigate, stop])

  const cancelReport = useCallback(() => {
    reportRequestRef.current = null
    reportInFlightRef.current = false
    reportEventKeyRef.current = null
    setReport(INITIAL_REPORT_STATE)
    dismissDanger()
  }, [dismissDanger])

  useEffect(() => {
    if (!danger) {
      reportEventKeyRef.current = null
      reportRequestRef.current = null
      setReport(INITIAL_REPORT_STATE)
      return
    }
    const cause = reportCause(danger)
    if (!cause) return

    const eventKey = dangerEventKey(danger)
    if (reportEventKeyRef.current === eventKey) return
    reportEventKeyRef.current = eventKey

    const phrase = typeof danger.phrase === 'string' ? danger.phrase : SAFEWORD
    const sessionId = useCompanionSession.getState().sessionId
    if (!sessionId) {
      setReport({
        status: 'error',
        result: null,
        error: '세션 정보가 없어 신고 메시지를 만들 수 없어요.',
        secondsLeft: 0,
      })
      return
    }

    reportRequestRef.current = {
      sessionId,
      cause,
      ...(cause === 'safeword' ? { safeword: phrase } : {}),
    }
    setReport({
      status: 'confirming',
      result: null,
      error: null,
      secondsLeft: REPORT_CONFIRM_SECONDS,
    })
  }, [danger])

  useEffect(() => {
    if (report.status !== 'confirming') return
    if (report.secondsLeft <= 0) {
      confirmReport()
      return
    }

    const timer = setTimeout(() => {
      setReport((prev) =>
        prev.status === 'confirming'
          ? { ...prev, secondsLeft: Math.max(0, prev.secondsLeft - 1) }
          : prev,
      )
    }, 1000)

    return () => clearTimeout(timer)
  }, [confirmReport, report.secondsLeft, report.status])

  const endCall = () => {
    stop()
    navigate({ to: '/' })
  }

  const connecting = status === 'connecting' || status === 'starting'
  const videoCtrlStyle: CSSProperties = {
    width: 52,
    height: 52,
    borderRadius: 99,
    border: 'none',
    background: 'rgba(255,255,255,0.14)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  }

  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (status !== 'live') {
      setElapsed(0)
      return
    }
    const t = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(t)
  }, [status])
  const elapsedLabel = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`

  // Shared 5-button control bar for the video-call layouts.
  const videoControls = (
    <div
      style={{
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '18px 18px 26px',
      }}
    >
      <button type="button" aria-label="효과" style={videoCtrlStyle}>
        <Sparkles size={22} />
      </button>
      <button
        type="button"
        aria-label={muted ? '음소거 해제' : '음소거'}
        aria-pressed={muted}
        onClick={toggleMute}
        style={{
          ...videoCtrlStyle,
          background: muted ? '#fff' : 'rgba(255,255,255,0.14)',
          color: muted ? 'var(--neutral-900)' : '#fff',
        }}
      >
        {muted ? <MicOff size={22} /> : <Mic size={22} />}
      </button>
      <button
        type="button"
        aria-label="종료"
        onClick={endCall}
        style={{
          width: 64,
          height: 64,
          borderRadius: 99,
          border: 'none',
          background: 'var(--coral-500)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-coral)',
        }}
      >
        <PhoneOff size={26} />
      </button>
      <button type="button" aria-label="카메라 전환" style={videoCtrlStyle}>
        <SwitchCamera size={22} />
      </button>
      <button type="button" aria-label="영상" style={videoCtrlStyle}>
        <Video size={22} />
      </button>
    </div>
  )

  // ── Live video call: remote (AI persona) main + self-camera PiP (reference). ──
  if (isVideoCall && status === 'live') {
    const chips: Array<{
      icon: 'rec' | 'share' | 'react' | 'hand'
      label: string
    }> = [
      { icon: 'rec', label: '통화 녹음 시작' },
      { icon: 'share', label: '화면 공유' },
      { icon: 'react', label: '빠른 공감' },
      { icon: 'hand', label: '손들기' },
    ]
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          background: 'var(--neutral-900)',
          color: '#fff',
          overflow: 'hidden',
        }}
      >
        {/* Header: name + count + timer (left), icons (right) */}
        <div
          style={{
            flex: 'none',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            padding: '14px 18px 6px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>
                {persona.name}
              </span>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 8px',
                  borderRadius: 99,
                  background: 'rgba(255,255,255,0.14)',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <User size={13} />2
              </span>
            </div>
            <div
              style={{ fontSize: 'var(--text-sm)', opacity: 0.8, marginTop: 2 }}
            >
              {elapsedLabel}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 18, opacity: 0.92 }}>
            <Settings size={22} />
            <Volume2 size={22} />
            <PictureInPicture2 size={22} />
          </div>
        </div>

        {/* Action chips (horizontal scroll) */}
        <div
          style={{
            flex: 'none',
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            padding: '4px 14px 10px',
          }}
        >
          {chips.map((c) => (
            <span
              key={c.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 12px',
                borderRadius: 99,
                border: '1px solid rgba(255,255,255,0.18)',
                background: 'rgba(255,255,255,0.06)',
                fontSize: 13,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                flex: 'none',
              }}
            >
              {c.icon === 'rec' && (
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 99,
                    border: '2px solid #fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: 99,
                      background: 'var(--coral-500)',
                    }}
                  />
                </span>
              )}
              {c.icon === 'share' && <ScreenShare size={16} />}
              {c.icon === 'react' && <Smile size={16} />}
              {c.icon === 'hand' && <Hand size={16} />}
              {c.label}
            </span>
          ))}
        </div>

        {/* Main video (AI persona) + self PiP */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            margin: '0 12px',
            borderRadius: 'var(--radius-2xl)',
            overflow: 'hidden',
            position: 'relative',
            background: '#000',
          }}
        >
          <img
            src="/image/listening.png"
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: speaking ? 0 : 1,
              transition: 'opacity .15s ease',
            }}
          />
          <img
            src="/image/talking.png"
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: speaking ? 1 : 0,
              transition: 'opacity .15s ease',
            }}
          />

          {/* Remote label */}
          <span
            style={{
              position: 'absolute',
              right: 14,
              bottom: 14,
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              textShadow: '0 1px 4px rgba(0,0,0,.5)',
            }}
          >
            {persona.name}
          </span>

          {/* Self camera PiP */}
          <div
            style={{
              position: 'absolute',
              left: 14,
              bottom: 14,
              width: '30%',
              minWidth: 96,
              aspectRatio: '3 / 4',
              borderRadius: 16,
              overflow: 'hidden',
              background: 'var(--neutral-800)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <video
              ref={evidenceVideoRef}
              muted
              playsInline
              autoPlay
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)',
                display: 'block',
              }}
            />
            <span
              style={{
                position: 'absolute',
                left: 8,
                bottom: 6,
                fontSize: 11,
                fontWeight: 600,
                textShadow: '0 1px 4px rgba(0,0,0,.6)',
              }}
            >
              나
            </span>
          </div>
        </div>

        {videoControls}

        {danger && (
          <DangerModal
            danger={danger}
            report={report}
            onConfirm={confirmReport}
            onCancel={cancelReport}
            onClose={dismissDanger}
          />
        )}
      </div>
    )
  }

  // ── Video call (connecting): full-screen front camera + name/status (reference). ──
  if (isVideoCall) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          background: 'var(--neutral-900)',
          color: '#fff',
          overflow: 'hidden',
        }}
      >
        {/* Header icons */}
        <div
          style={{
            flex: 'none',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 18,
            padding: '14px 18px 8px',
            opacity: 0.92,
          }}
        >
          <Settings size={22} />
          <Volume2 size={22} />
          <PictureInPicture2 size={22} />
        </div>

        {/* Full-screen camera */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            margin: '0 12px',
            borderRadius: 'var(--radius-2xl)',
            overflow: 'hidden',
            position: 'relative',
            background: '#000',
          }}
        >
          <video
            ref={evidenceVideoRef}
            muted
            playsInline
            autoPlay
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)',
              display: 'block',
            }}
          />

          {/* Name + status + connecting dots */}
          <div
            style={{
              position: 'absolute',
              top: 28,
              left: 0,
              right: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              textShadow: '0 1px 6px rgba(0,0,0,.45)',
            }}
          >
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>
              {persona.name}
            </div>
            <div style={{ fontSize: 'var(--text-sm)', opacity: 0.92 }}>
              {error ?? STATUS_LABEL[status]}
            </div>
            {connecting && (
              <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 99,
                      background: 'var(--coral-400)',
                      animation: 'sm-dot-blink 1.2s ease-in-out infinite',
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Recording pill */}
          <div
            style={{
              position: 'absolute',
              bottom: 18,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              borderRadius: 99,
              background: 'rgba(20,16,16,.55)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: 99,
                border: '2px solid #fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 'none',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 99,
                  background: 'var(--coral-500)',
                }}
              />
            </span>
            통화 녹음 시작
          </div>
        </div>

        {videoControls}

        {danger && (
          <DangerModal
            danger={danger}
            report={report}
            onConfirm={confirmReport}
            onCancel={cancelReport}
            onClose={dismissDanger}
          />
        )}
      </div>
    )
  }

  // ── Voice call: AI persona portrait + simple controls. ──
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--surface)',
        padding: 24,
      }}
    >
      {/* Hidden evidence camera (voice call). */}
      <video
        ref={evidenceVideoRef}
        muted
        playsInline
        autoPlay
        aria-hidden
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Persona identity + status */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: 220,
            height: 220,
            borderRadius: '50%',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <img
            src="/image/listening.png"
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: speaking ? 0 : 1,
              transition: 'opacity .15s ease',
            }}
          />
          <img
            src="/image/talking.png"
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: speaking ? 1 : 0,
              transition: 'opacity .15s ease',
            }}
          />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>
            {persona.name}
          </div>
          <div
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--muted-foreground)',
              marginTop: 4,
            }}
          >
            {error ?? STATUS_LABEL[status]}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 28,
          paddingBottom: 12,
        }}
      >
        <button
          type="button"
          aria-label={muted ? '음소거 해제' : '음소거'}
          aria-pressed={muted}
          onClick={toggleMute}
          style={{
            width: 56,
            height: 56,
            borderRadius: 99,
            border: 'none',
            background: muted ? 'var(--neutral-700)' : 'var(--neutral-200)',
            color: muted ? '#fff' : 'var(--neutral-700)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          {muted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>
        <button
          type="button"
          aria-label="종료"
          onClick={endCall}
          style={{
            width: 64,
            height: 64,
            borderRadius: 99,
            border: 'none',
            background: 'var(--destructive)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <PhoneOff size={26} />
        </button>
      </div>

      {danger && (
        <DangerModal
          danger={danger}
          report={report}
          onConfirm={confirmReport}
          onCancel={cancelReport}
          onClose={dismissDanger}
        />
      )}
    </div>
  )
}

/** Shown when the BE reports a danger event during the call. */
function DangerModal({
  danger,
  report,
  onConfirm,
  onCancel,
  onClose,
}: {
  danger: NonNullable<ReturnType<typeof useCall.getState>['danger']>
  report: ReportState
  onConfirm: () => void
  onCancel: () => void
  onClose: () => void
}) {
  const isSafeword = danger.cause === 'safeword'
  const isScream = danger.cause === 'scream'
  const title = isSafeword
    ? '세이프워드가 감지됐어요.'
    : isScream
      ? '비명 소리가 감지됐어요.'
      : '통화 중 위험 신호가 감지됐어요.'
  const description = (() => {
    if (!isSafeword && !isScream) return '위험 상황을 확인하고 있어요.'
    if (report.status === 'confirming') {
      return `${report.secondsLeft}초 후 자동으로 신고 요청을 보낼게요.`
    }
    if (report.status === 'building') return '신고 요청을 보내고 있어요.'
    if (report.status === 'ready') return '신고 요청이 접수됐어요.'
    if (report.status === 'error') return report.error ?? '신고 요청 실패'
    return '신고 요청으로 넘어갈게요.'
  })()
  const confirming = report.status === 'confirming'
  const building = report.status === 'building'

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.45)',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 340,
          background: 'var(--card)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px 24px 20px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 99,
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--destructive)',
            color: '#fff',
          }}
        >
          <ShieldAlert size={28} />
        </div>
        <p
          style={{
            margin: '0 0 8px',
            fontSize: 'var(--text-base)',
            fontWeight: 600,
            lineHeight: 1.5,
            color: 'var(--foreground)',
          }}
        >
          {title}
        </p>
        <p
          style={{
            margin: report.result?.reportMessage ? '0 0 14px' : '0 0 20px',
            fontSize: 'var(--text-sm)',
            lineHeight: 1.5,
            color: 'var(--muted-foreground)',
          }}
        >
          {description}
        </p>
        {report.result?.reportMessage && (
          <div
            style={{
              maxHeight: 160,
              overflowY: 'auto',
              marginBottom: 16,
              padding: 12,
              borderRadius: 'var(--radius-md)',
              background: 'var(--neutral-100)',
              textAlign: 'left',
              whiteSpace: 'pre-wrap',
              fontSize: 'var(--text-xs)',
              lineHeight: 1.55,
              color: 'var(--neutral-800)',
            }}
          >
            {report.result.reportMessage}
          </div>
        )}
        {confirming ? (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                background: 'var(--card)',
                color: 'var(--neutral-700)',
                fontSize: 'var(--text-base)',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              취소
            </button>
            <button
              type="button"
              onClick={onConfirm}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 'var(--radius-lg)',
                border: 'none',
                background: 'var(--destructive)',
                color: '#fff',
                fontSize: 'var(--text-base)',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              확인
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onClose}
            disabled={building}
            style={{
              width: '100%',
              height: 48,
              borderRadius: 'var(--radius-lg)',
              border: 'none',
              background: building
                ? 'var(--neutral-300)'
                : 'var(--destructive)',
              color: building ? 'var(--neutral-600)' : '#fff',
              fontSize: 'var(--text-base)',
              fontWeight: 700,
              cursor: building ? 'default' : 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {building ? '요청 중' : '확인'}
          </button>
        )}
      </div>
    </div>
  )
}
