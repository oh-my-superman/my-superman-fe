import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Mic, MicOff, PhoneOff, ShieldAlert } from 'lucide-react'

import { PERSONAS } from '#/features/home/personas'
import { useCall } from '#/features/call/call-store'

export const Route = createFileRoute('/call/$personaId')({
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

/** Live AI voice call. Streams mic audio and plays the AI's voice in realtime. */
function CallScreen() {
  const { personaId } = Route.useParams()
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

  // Auto-start the call on mount, end it on leave.
  useEffect(() => {
    start(persona.id)
    return () => stop()
  }, [persona.id, start, stop])

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
        background: 'var(--surface)',
        padding: 24,
      }}
    >
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

      {danger && <DangerModal onClose={dismissDanger} />}
    </div>
  )
}

/** Shown when the BE reports a danger event during the call. */
function DangerModal({ onClose }: { onClose: () => void }) {
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
            margin: '0 0 20px',
            fontSize: 'var(--text-base)',
            fontWeight: 600,
            lineHeight: 1.5,
            color: 'var(--foreground)',
          }}
        >
          통화 중 위험 신호가 감지되었어요.
          <br />1분 후 신고 메시지를 보낼게요.
        </p>
        <button
          type="button"
          onClick={onClose}
          style={{
            width: '100%',
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
    </div>
  )
}
