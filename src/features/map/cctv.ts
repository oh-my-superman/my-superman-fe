import { createServerFn } from '@tanstack/react-start'

export interface Bbox {
  minX: number // 경도(lng) min
  maxX: number // 경도(lng) max
  minY: number // 위도(lat) min
  maxY: number // 위도(lat) max
}

export interface CctvPoint {
  id: string
  lat: number
  lng: number
  /** 설치목적구분 (e.g. 생활방범, 어린이보호). */
  purpose: string
  address: string
}

export interface CctvResult {
  items: Array<CctvPoint>
  /** Total CCTV inside the bbox (items may be capped to the nearest N). */
  total: number
}

// Cap the response so a dense Seoul viewport doesn't ship thousands of points.
const MAX_RETURN = 200

type RawCctv = Array<[number, number, string, string]>
let cache: RawCctv | null = null

/**
 * Loads the bundled dataset. In production we dynamic-import the JSON (Vite
 * splits it into a server chunk). In dev we read it with fs instead — letting
 * Vite transform a ~3MB JSON module on the fly can hang/crash the dev server.
 */
async function loadCctv(): Promise<RawCctv> {
  if (cache) return cache
  if (import.meta.env.DEV) {
    const [{ readFile }, { resolve }] = await Promise.all([
      import('node:fs/promises'),
      import('node:path'),
    ])
    const file = resolve(process.cwd(), 'src/features/map/cctv-data.json')
    cache = JSON.parse(await readFile(file, 'utf8')) as RawCctv
  } else {
    cache = (await import('#/features/map/cctv-data.json')).default
  }
  return cache
}

/**
 * Returns 방범(crime-prevention) CCTV inside the given bbox, nearest-to-center
 * first. Source is the bundled `cctv-data.json` (preprocessed from the 행안부
 * 전국 CCTV 표준데이터 — that dataset has no queryable API). The JSON is imported
 * inside the handler so it stays in the server bundle, never the client.
 */
export const fetchNearbyCctv = createServerFn({ method: 'GET' })
  .validator((bbox: Bbox) => bbox)
  .handler(async ({ data: bbox }): Promise<CctvResult> => {
    const raw = await loadCctv()
    const cx = (bbox.minX + bbox.maxX) / 2
    const cy = (bbox.minY + bbox.maxY) / 2

    const within: Array<CctvPoint> = []
    for (const [lat, lng, purpose, address] of raw) {
      if (lng < bbox.minX || lng > bbox.maxX) continue
      if (lat < bbox.minY || lat > bbox.maxY) continue
      within.push({ id: `${lat},${lng}`, lat, lng, purpose, address })
    }

    within.sort(
      (a, b) =>
        (a.lat - cy) ** 2 +
        (a.lng - cx) ** 2 -
        ((b.lat - cy) ** 2 + (b.lng - cx) ** 2),
    )

    return { items: within.slice(0, MAX_RETURN), total: within.length }
  })
