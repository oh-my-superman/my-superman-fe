import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Mic, MicOff, PhoneOff, ShieldAlert } from 'lucide-react'

import { PERSONAS } from '#/features/home/personas'
import { useCall } from '#/features/call/call-store'
import { SAFEWORD } from '#/features/call/call-controller'
import { useCameraEvidence } from '#/features/capture/use-camera-evidence'
import { useCompanionSession } from '#/features/companion/session-store'
import { buildDangerReport } from '#/features/report/build-report'
import type {
  ReportBuildCause,
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

interface ReportRequest {
  sessionId: string
  cause: ReportBuildCause
  safeword?: string
}

function dangerEventKey(danger: NonNullable<ReturnType<typeof useCall.getState>['danger']>) {
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
  const reportRequestRef = useRef<ReportRequest | null>(null)
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

    buildDangerReport(request)
      .then((result) => {
        setReport({
          status: 'ready',
          result,
          error: null,
          secondsLeft: 0,
        })
        reportRequestRef.current = null
        stop()
        navigate({ to: '/', replace: true })
      })
      .catch((err) => {
        console.error('[report] danger report build failed', err)
        setReport({
          status: 'error',
          result: null,
          error: '신고 메시지 생성에 실패했어요.',
          secondsLeft: 0,
        })
      })
      .finally(() => {
        reportInFlightRef.current = false
      })
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
      {isVideoCall ? (
        <div
          aria-label="내 카메라 화면"
          style={{
            position: 'absolute',
            right: 20,
            bottom: 108,
            zIndex: 3,
            width: 'min(34vw, 132px)',
            minWidth: 104,
            aspectRatio: '3 / 4',
            borderRadius: 18,
            overflow: 'hidden',
            background: 'var(--neutral-800)',
            boxShadow: 'var(--shadow-lg)',
            border: '2px solid rgba(255, 255, 255, 0.85)',
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
        </div>
      ) : (
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
      )}

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
        {/* AI 발화/경청 연출: 오디오 재생 중이면 talking, 아니면 listening */}
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
    if (report.status === 'building') return '신고 메시지를 생성하고 있어요.'
    if (report.status === 'ready') return '신고 메시지가 준비됐어요.'
    if (report.status === 'error') return report.error ?? '신고 메시지 생성 실패'
    return '신고 메시지 생성으로 넘어갈게요.'
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
