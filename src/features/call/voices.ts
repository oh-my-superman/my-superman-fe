/**
 * Maps a persona to a Gemini Live voice name. Defaults to `Kore` for unknown
 * personas.
 */
const VOICE_BY_PERSONA: Record<string, string> = {
  mom: 'Kore', // 다정한 여성 톤
  police: 'Charon', // 단단한 남성 톤
  lover: 'Aoede', // 부드러운 톤
  boss: 'Puck', // 공적/사무적 톤
}

export function voiceForPersona(personaId: string): string {
  return VOICE_BY_PERSONA[personaId] ?? 'Kore'
}
