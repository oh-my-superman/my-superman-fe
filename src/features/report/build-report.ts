import { serviceUrl } from '#/lib/service-url'

interface ReportGps {
  lat: number
  lng: number
  accuracy: number
  captured_at: string
}

export interface ReportBuildResult {
  reportMessage: string
  generatedAt: string | null
}

function readString(value: unknown, keys: Array<string>): string | null {
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  for (const key of keys) {
    const candidate = record[key]
    if (typeof candidate === 'string' && candidate.trim()) return candidate
  }
  return null
}

async function getCurrentGps(): Promise<ReportGps | null> {
  if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
    return null
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          captured_at: new Date(pos.timestamp).toISOString(),
        }),
      () => resolve(null),
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 4_000 },
    )
  })
}

export async function buildSafewordReport(params: {
  sessionId: string
  safeword: string
}): Promise<ReportBuildResult> {
  const gps = await getCurrentGps()

  const response = await fetch(serviceUrl('/api/report/build'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: params.sessionId,
      transcript: null,
      user: {
        name: 'Daniel',
        note: '세이프워드 자동 신고 사용자',
      },
      gps,
      photos: [],
      safeword: params.safeword,
    }),
  })

  if (!response.ok) {
    throw new Error(`report/build failed: ${response.status}`)
  }

  const json = (await response.json()) as unknown
  return {
    reportMessage:
      readString(json, ['report_message', 'reportMessage']) ??
      '신고 메시지가 생성됐어요.',
    generatedAt: readString(json, ['generated_at', 'generatedAt']),
  }
}
