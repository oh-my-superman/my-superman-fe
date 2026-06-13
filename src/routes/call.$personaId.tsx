import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { PhoneOff } from 'lucide-react'

import { Avatar } from '#/components/ui/avatar'
import { PERSONAS } from '#/features/home/personas'

export const Route = createFileRoute('/call/$personaId')({
  component: CallScreen,
})

/** Placeholder call screen — the full call experience is out of scope here. */
function CallScreen() {
  const { personaId } = Route.useParams()
  const navigate = useNavigate()
  const persona = PERSONAS.find((p) => p.id === personaId) ?? PERSONAS[0]

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
        height: '100%',
        background: 'var(--surface)',
        padding: 24,
        textAlign: 'center',
      }}
    >
      <Avatar
        fallback={persona.glyph}
        bg={persona.bg}
        fg={persona.fg}
        size="xl"
      />
      <div>
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
          통화 화면 준비 중
        </div>
      </div>
      <button
        type="button"
        aria-label="종료"
        onClick={() => navigate({ to: '/' })}
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
  )
}
