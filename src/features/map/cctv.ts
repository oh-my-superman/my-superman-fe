import { createServerFn } from '@tanstack/react-start'

import { cctvApiPath, serviceUrl } from '#/lib/service-url'
import {
  extractItems,
  fetchServiceJson,
  isRecord,
  nearbyQuery,
  readNumber,
  readString,
} from '#/features/map/nearby-service'
import type { Bbox } from '#/features/map/nearby-service'

export type { Bbox } from '#/features/map/nearby-service'

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

function normalizeCctvPoint(value: unknown): CctvPoint | null {
  if (Array.isArray(value)) {
    const [lat, lng, purpose, address] = value
    if (typeof lat !== 'number' || typeof lng !== 'number') return null
    return {
      id: `${lat},${lng}`,
      lat,
      lng,
      purpose: String(purpose ?? ''),
      address: String(address ?? ''),
    }
  }
  if (!isRecord(value)) return null

  const lat = readNumber(value, ['lat', 'latitude', 'y', '위도'])
  const lng = readNumber(value, ['lng', 'lon', 'longitude', 'x', '경도'])
  if (lat === null || lng === null) return null

  const id =
    readString(value, ['id', 'cctvId', 'facilityId']) || `${lat},${lng}`

  return {
    id,
    lat,
    lng,
    purpose: readString(value, [
      'purpose',
      'installationPurpose',
      'installPurpose',
      'purposeName',
      'category',
      'type',
      '설치목적구분',
    ]),
    address: readString(value, [
      'address',
      'addr',
      'roadAddress',
      'jibunAddress',
      'location',
      '소재지도로명주소',
      '소재지지번주소',
    ]),
  }
}

/**
 * Returns CCTV inside the given bbox from `mysuperman-service`.
 */
export const fetchNearbyCctv = createServerFn({ method: 'GET' })
  .validator((bbox: Bbox) => bbox)
  .handler(async ({ data: bbox }): Promise<CctvResult> => {
    const raw = await fetchServiceJson(
      serviceUrl(cctvApiPath(), nearbyQuery(bbox, MAX_RETURN)),
    )
    const { items, total } = extractItems(raw)
    const normalized = items
      .map(normalizeCctvPoint)
      .filter((item): item is CctvPoint => item !== null)

    return {
      items: normalized.slice(0, MAX_RETURN),
      total: total ?? normalized.length,
    }
  })
