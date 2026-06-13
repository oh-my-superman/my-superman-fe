export interface Persona {
  id: string
  name: string
  glyph: string
  bg: string
  fg: string
  status?: 'online'
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
    tagline: '다정한 일상 통화 · 가장 자주 사용',
  },
  {
    id: 'police',
    name: '경찰 톤',
    glyph: '👮',
    bg: 'var(--blue-info)',
    fg: '#fff',
    tagline: '강한 억지력 · "순찰차 그쪽으로 보냈어요"',
  },
  {
    id: 'lover',
    name: '연인',
    glyph: '💗',
    bg: 'var(--coral-50)',
    fg: 'var(--coral-600)',
    tagline: '자연스러운 안부 · 심리적 안정',
  },
  {
    id: 'boss',
    name: '직장 상사',
    glyph: '👔',
    bg: 'var(--neutral-200)',
    fg: 'var(--neutral-700)',
    tagline: '업무 통화처럼 · 공적 상황 위장',
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
  { id: 's2', title: '운동 후 귀가', when: '화·목 21:30', persona: '연인' },
]
