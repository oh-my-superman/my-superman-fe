import { createServerFn } from '@tanstack/react-start'

import type { Bbox } from '#/features/map/cctv'

export interface SafeHousePoint {
  id: string
  lat: number
  lng: number
  name: string
  address: string
}

export interface SafeHouseResult {
  items: Array<SafeHousePoint>
  total: number
}

const MAX_RETURN = 200

type RawSafe = Array<[number, number, string, string]>
let cache: RawSafe | null = null

/** Mirror of `cctv.ts` loading: fs in dev (no Vite JSON transform), bundled
 * dynamic import in prod. (safehouses.json is small, but stays consistent.) */
async function loadSafehouses(): Promise<RawSafe> {
  if (cache) return cache
  if (import.meta.env.DEV) {
    const [{ readFile }, { resolve }] = await Promise.all([
      import('node:fs/promises'),
      import('node:path'),
    ])
    const file = resolve(process.cwd(), 'src/features/map/safehouses.json')
    cache = JSON.parse(await readFile(file, 'utf8')) as RawSafe
  } else {
    cache = (await import('#/features/map/safehouses.json')).default
  }
  return cache
}

/**
 * Returns 안심지킴이집 inside the given bbox, nearest-to-center first. Source is
 * the geocoded `safehouses.json` (서울 여성안심지킴이집, preprocessed — no API).
 */
export const fetchNearbySafehouses = createServerFn({ method: 'GET' })
  .validator((bbox: Bbox) => bbox)
  .handler(async ({ data: bbox }): Promise<SafeHouseResult> => {
    const raw = await loadSafehouses()
    const cx = (bbox.minX + bbox.maxX) / 2
    const cy = (bbox.minY + bbox.maxY) / 2

    const within: Array<SafeHousePoint> = []
    for (const [lat, lng, name, address] of raw) {
      if (lng < bbox.minX || lng > bbox.maxX) continue
      if (lat < bbox.minY || lat > bbox.maxY) continue
      within.push({ id: `${lat},${lng}`, lat, lng, name, address })
    }

    within.sort(
      (a, b) =>
        (a.lat - cy) ** 2 +
        (a.lng - cx) ** 2 -
        ((b.lat - cy) ** 2 + (b.lng - cx) ** 2),
    )

    return { items: within.slice(0, MAX_RETURN), total: within.length }
  })
