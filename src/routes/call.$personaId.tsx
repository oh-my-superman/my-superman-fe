import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Mic, MicOff, PhoneOff, ShieldAlert } from 'lucide-react'

import { Avatar } from '#/components/ui/avatar'
import { PERSONAS } from '#/features/home/personas'
import { useCall } from '#/features/call/call-store'
import { useCompanionSession } from '#/features/companion/session-store'

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
  const muted = useCall((s) => s.muted)
  const danger = useCall((s) => s.danger)
  const error = useCall((s) => s.error)
  const start = useCall((s) => s.start)
  const stop = useCall((s) => s.stop)
  const toggleMute = useCall((s) => s.toggleMute)
  const sessionStatus = useCompanionSession((s) => s.status)
  const sessionId = useCompanionSession((s) => s.sessionId)
  const sendCompanionFrame = useCompanionSession((s) => s.send)

  // Auto-start the call on mount, end it on leave.
  useEffect(() => {
    start(persona.id)
    return () => stop()
  }, [persona.id, start, stop])

  useEffect(() => {
    if (sessionStatus !== 'ready' || !sessionId) return
    sendCompanionFrame({
      type: 'screen.view',
      session_id: sessionId,
      data: {
        screen: 'call',
        path: `/call/${personaId}`,
        personaId,
        personaName: persona.name,
        timestamp: new Date().toISOString(),
      },
    })
  }, [persona.name, personaId, sendCompanionFrame, sessionId, sessionStatus])

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
      {danger && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--destructive)',
            color: '#fff',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            marginBottom: 12,
          }}
        >
          <ShieldAlert size={18} />
          위험 감지 ({String(danger.cause)})
        </div>
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
        <Avatar
          fallback={persona.glyph}
          bg={persona.bg}
          fg={persona.fg}
          size="xl"
        />
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
    </div>
  )
}
