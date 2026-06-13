import { useNavigate } from '@tanstack/react-router'
import { Phone, Plus, Sparkles, MessageCircle, Heart, Shield, ShieldAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'

import { Avatar } from '#/components/ui/avatar'
import { Dialog } from '#/components/ui/dialog'
import { ListDivider, ListItem } from '#/components/ui/list-item'
import { MainLayout } from '#/components/main-layout'
import { PERSONAS } from '#/features/home/personas'

const ICON_MAP: Record<string, any> = {
  Heart,
  Shield,
  ShieldAlert,
}

/** Per-persona single call action (right side of each roster row). */
function CallAction({ onCall }: { onCall: () => void }) {
  return (
    <div
      className="call-actions-group"
      style={{ display: 'flex', flexShrink: 0, alignItems: 'center' }}
    >
      <button
        type="button"
        className="call-action-btn"
        data-variant="voice"
        aria-label="통화"
        onClick={(e) => {
          e.stopPropagation()
          onCall()
        }}
        style={{
          width: 40,
          height: 40,
          background: 'transparent',
          color: 'var(--neutral-400)',
          border: 'none',
          boxShadow: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'var(--neutral-100)'
          e.currentTarget.style.color = 'var(--neutral-600)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--neutral-400)'
        }}
      >
        <Phone size={22} />
      </button>
    </div>
  )
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        padding: '24px 20px 8px',
      }}
    >
      <span
        style={{
          fontSize: 'var(--text-xs)',
          fontWeight: 700,
          color: 'var(--coral-500)',
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
        }}
      >
        {children}
      </span>
    </div>
  )
}

/**
 * 통화 화면 — Galaxy Contacts style roster.
 */
export function CallScreen() {
  const navigate = useNavigate()
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [safeWordModalOpen, setSafeWordModalOpen] = useState(false)
  const [safeWords, setSafeWords] = useState(['짜장면'])
  const [newSafeWord, setNewSafeWord] = useState('')

  const callPersona = (id: string, video = false) =>
    navigate({
      to: '/call/$personaId',
      params: { personaId: id },
      search: { video },
    })

  const addSafeWord = () => {
    if (newSafeWord.trim() && !safeWords.includes(newSafeWord.trim())) {
      setSafeWords([...safeWords, newSafeWord.trim()])
      setNewSafeWord('')
    }
  }

  const removeSafeWord = (word: string) => {
    setSafeWords(safeWords.filter((w) => w !== word))
  }

  return (
    <MainLayout>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          background: '#ffffff',
        }}
      >
        <div style={{ padding: '12px 20px 16px' }}>
          <p
            style={{
              fontSize: 13,
              color: 'var(--neutral-500)',
              marginTop: 6,
              fontWeight: 500,
              lineHeight: 1.5,
              wordBreak: 'keep-all',
            }}
          >
            위험 상황 시 AI 슈퍼맨과 통화하세요. <br />
            <strong>모든 대화 맥락과 세이프 단어</strong>를
            <strong>실시간으로 분석</strong>하여
            <br /> 당신의 안전을 지켜드립니다.
          </p>
        </div>

        <SectionLabel>최근 통화 · 페르소나</SectionLabel>

        <div style={{ paddingBottom: 40 }}>
          {PERSONAS.map((p, i) => (
            <div key={p.id}>
              {i > 0 && <ListDivider inset />}
              <ListItem
                leading={
                  <Avatar
                    fallback={
                      p.icon ? (
                        (() => {
                          const Icon = ICON_MAP[p.icon]
                          return Icon ? (
                            <Icon size={20} strokeWidth={2.5} />
                          ) : (
                            p.glyph
                          )
                        })()
                      ) : (
                        p.glyph
                      )
                    }
                    bg={p.bg}
                    fg={p.fg}
                    status={p.status}
                    size="default"
                  />
                }
                title={
                  <span style={{ fontSize: 17, fontWeight: 600 }}>
                    {p.name}
                  </span>
                }
                subtitle={p.tagline}
                trailing={
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSafeWordModalOpen(true)
                      }}
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        border: 'none',
                        background: 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--coral-500)',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'var(--coral-50)'
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      <Shield size={20} strokeWidth={2.5} />
                    </button>
                    <CallAction onCall={() => callPersona(p.id)} />
                  </div>
                }
                onClick={() => callPersona(p.id)}
              />
            </div>
          ))}

          <div style={{ padding: '8px 4px' }}>
            <button
              onClick={() => setCreateModalOpen(true)}
              style={{
                width: '100%',
                padding: '14px 20px',
                background: 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: 16,
                color: 'var(--neutral-400)',
                fontSize: 16,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'var(--neutral-50)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'var(--neutral-100)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--neutral-400)',
                  flexShrink: 0,
                }}
              >
                <Plus size={22} strokeWidth={2.5} />
              </div>
              <span>새 페르소나 만들기</span>
            </button>
          </div>
        </div>
      </div>

      <Dialog
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        title="새 페르소나 만들기"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--neutral-500)',
              }}
            >
              페르소나 이름
            </label>
            <input
              type="text"
              placeholder="예: 든든한 삼촌, 친한 언니"
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: 12,
                border: '1.5px solid var(--neutral-200)',
                background: 'var(--neutral-50)',
                fontSize: 16,
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--neutral-500)',
              }}
            >
              성격 및 대화 스타일
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
              }}
            >
              {[
                { icon: Heart, label: '다정한' },
                { icon: Sparkles, label: '이성적인' },
                { icon: MessageCircle, label: '수다스러운' },
                { icon: Phone, label: '단호한' },
              ].map((style) => (
                <button
                  key={style.label}
                  style={{
                    padding: '14px',
                    borderRadius: 12,
                    border: '1.5px solid var(--neutral-200)',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: 'var(--neutral-700)',
                  }}
                >
                  <style.icon size={18} color="var(--neutral-400)" strokeWidth={2.2} />
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--neutral-500)',
              }}
            >
              페르소나 한 줄 설명
            </label>
            <input
              type="text"
              placeholder="리스트에 표시될 설명을 적어주세요"
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: 12,
                border: '1.5px solid var(--neutral-200)',
                background: 'var(--neutral-50)',
                fontSize: 16,
                outline: 'none',
              }}
            />
          </div>

          <button
            onClick={() => {
              alert('새 페르소나가 생성되었습니다!')
              setCreateModalOpen(false)
            }}
            style={{
              marginTop: 12,
              width: '100%',
              padding: '18px',
              borderRadius: 16,
              background: 'var(--coral-500)',
              color: '#fff',
              border: 'none',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-coral)',
            }}
          >
            페르소나 생성하기
          </button>
        </div>
      </Dialog>

      <Dialog
        open={safeWordModalOpen}
        onOpenChange={setSafeWordModalOpen}
        title="세이프 단어 관리"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <p
            style={{
              fontSize: 14,
              color: 'var(--neutral-500)',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            통화 중 이 단어를 말하면 AI가 위험 상황으로 즉시 인지하고
            보호 조치를 시작합니다.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={newSafeWord}
                onChange={(e) => setNewSafeWord(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addSafeWord()
                }}
                placeholder="새로운 세이프 단어 입력"
                style={{
                  flex: 1,
                  padding: '14px 16px',
                  borderRadius: 12,
                  border: '1.5px solid var(--neutral-200)',
                  background: 'var(--neutral-50)',
                  fontSize: 15,
                  outline: 'none',
                }}
              />
              <button
                onClick={addSafeWord}
                style={{
                  padding: '0 20px',
                  borderRadius: 12,
                  background: 'var(--coral-500)',
                  color: '#fff',
                  border: 'none',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                추가
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                marginTop: 8,
              }}
            >
              {safeWords.map((word) => (
                <div
                  key={word}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    background: 'var(--coral-50)',
                    color: 'var(--coral-600)',
                    borderRadius: 99,
                    fontSize: 14,
                    fontWeight: 700,
                    border: '1px solid var(--coral-100)',
                  }}
                >
                  {word}
                  <button
                    onClick={() => removeSafeWord(word)}
                    style={{
                      border: 'none',
                      background: 'none',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--coral-400)',
                      cursor: 'pointer',
                    }}
                  >
                    <Plus
                      size={14}
                      style={{ transform: 'rotate(45deg)' }}
                      strokeWidth={3}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setSafeWordModalOpen(false)}
            style={{
              marginTop: 10,
              width: '100%',
              padding: '16px',
              borderRadius: 16,
              background: 'var(--neutral-900)',
              color: '#fff',
              border: 'none',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            확인
          </button>
        </div>
      </Dialog>
    </MainLayout>
  )
}
