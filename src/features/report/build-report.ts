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

export type ReportBuildCause = 'safeword' | 'scream'

export interface DangerReportRequest {
  sessionId: string
  cause: ReportBuildCause
  safeword?: string
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

function reportContext(cause: ReportBuildCause): {
  transcript: string | null
  userNote: string
} {
  if (cause === 'scream') {
    return {
      transcript:
        '비명 소리가 감지되었습니다. 사용자가 긴급 상황을 알렸을 가능성이 있습니다.',
      userNote: '비명 감지 자동 신고 사용자',
    }
  }

  return {
    transcript: null,
    userNote: '세이프워드 자동 신고 사용자',
  }
}

async function createDangerReportBody(params: DangerReportRequest) {
  const gps = await getCurrentGps()
  const context = reportContext(params.cause)
  return {
    user_id: 1,
    session_id: params.sessionId,
    transcript: context.transcript,
    user: {
      name: 'Daniel',
      note: context.userNote,
    },
    gps,
    photos: [],
    ...(params.safeword ? { safeword: params.safeword } : {}),
  }
}

export async function buildDangerReport(
  params: DangerReportRequest,
): Promise<ReportBuildResult> {
  const body = await createDangerReportBody(params)

  const response = await fetch(serviceUrl('/api/report/build'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
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

export async function sendDangerReport(params: {
  request: DangerReportRequest
  draft: ReportBuildResult
}): Promise<void> {
  const body = {
    ...(await createDangerReportBody(params.request)),
    cause: params.request.cause,
    report_message: params.draft.reportMessage,
    generated_at: params.draft.generatedAt,
  }

  const response = await fetch(serviceUrl('/api/report/send'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`report/send failed: ${response.status}`)
  }
}
