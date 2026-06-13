export interface Bbox {
  minX: number // lng min
  maxX: number // lng max
  minY: number // lat min
  maxY: number // lat max
}

export function nearbyQuery(
  bbox: Bbox,
  limit: number,
): Record<string, string | number> {
  return {
    minX: bbox.minX,
    maxX: bbox.maxX,
    minY: bbox.minY,
    maxY: bbox.maxY,
    limit,
  }
}

export async function fetchServiceJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    const detail = body ? `: ${body.slice(0, 200)}` : ''
    throw new Error(`mysuperman-service ${response.status}${detail}`)
  }

  return response.json() as Promise<unknown>
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function readNumber(
  record: Record<string, unknown>,
  keys: Array<string>,
): number | null {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value)
      if (Number.isFinite(parsed)) return parsed
    }
  }
  return null
}

export function readString(
  record: Record<string, unknown>,
  keys: Array<string>,
): string {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
    if (typeof value === 'number' && Number.isFinite(value))
      return String(value)
  }
  return ''
}

export function extractItems(raw: unknown): {
  items: Array<unknown>
  total: number | null
} {
  if (Array.isArray(raw)) return { items: raw, total: raw.length }
  if (!isRecord(raw)) return { items: [], total: null }

  const total = readNumber(raw, [
    'total',
    'totalCount',
    'count',
    'size',
    'totalElements',
  ])

  for (const key of ['items', 'data', 'results', 'content', 'list']) {
    const value = raw[key]
    if (Array.isArray(value)) return { items: value, total }
    if (isRecord(value)) {
      const nested = extractItems(value)
      if (nested.items.length > 0) {
        return { items: nested.items, total: total ?? nested.total }
      }
    }
  }

  return { items: [], total }
}
