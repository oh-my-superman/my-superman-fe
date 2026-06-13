export interface Persona {
  id: string
  name: string
  glyph: string
  bg: string
  fg: string
  status?: 'online'
  /** 짧은 설명구 (예: "다정한 일상 통화"). */
  tagline: string
}

export const PERSONAS: Array<Persona> = [
  {
    id: 'mom',
    name: '엄마',
    glyph: '엄',
    bg: 'var(--coral-100)',
    fg: 'var(--coral-700)',
    status: 'online',
    tagline: '다정한 목소리로 일상을 공유하며 위험을 함께 감지합니다',
  },
  {
    id: 'dad',
    name: '아빠',
    glyph: '아',
    bg: 'var(--neutral-200)',
    fg: 'var(--neutral-700)',
    tagline: '든든하고 엄격하게 주변 상황을 통제하며 안전을 확인합니다',
  },
  {
    id: 'boyfriend',
    name: '남자친구',
    glyph: '💗',
    bg: 'var(--coral-50)',
    fg: 'var(--coral-600)',
    tagline: '자연스러운 대화 속에 세이프 단어를 녹여 위기를 모면합니다',
  },
  {
    id: 'police',
    name: '경찰',
    glyph: '👮',
    bg: 'var(--blue-info)',
    fg: '#fff',
    tagline: '단호하고 전문적인 지시로 즉각적인 위기 대응을 돕습니다',
  },
]

export interface ScheduledCompanion {
  id: string
  title: string
  when: string
  persona: string
}

export const SCHEDULED: Array<ScheduledCompanion> = [
  {
    id: 's1',
    title: '퇴근길 동행',
    when: '매일 밤 11:00 · 회사 → 집',
    persona: '엄마',
  },
  { id: 's2', title: '운동 후 귀가', when: '화·목 21:30', persona: '남자친구' },
]
