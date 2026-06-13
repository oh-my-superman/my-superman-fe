import { createServerFn } from '@tanstack/react-start'

import { safehouseApiPath, serviceUrl } from '#/lib/service-url'
import {
  extractItems,
  fetchServiceJson,
  isRecord,
  nearbyQuery,
  readNumber,
  readString,
} from '#/features/map/nearby-service'
import type { Bbox } from '#/features/map/nearby-service'

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

function normalizeSafeHousePoint(value: unknown): SafeHousePoint | null {
  if (Array.isArray(value)) {
    const [lat, lng, name, address] = value
    if (typeof lat !== 'number' || typeof lng !== 'number') return null
    return {
      id: `${lat},${lng}`,
      lat,
      lng,
      name: String(name ?? ''),
      address: String(address ?? ''),
    }
  }
  if (!isRecord(value)) return null

  const lat = readNumber(value, ['lat', 'latitude', 'y', '위도'])
  const lng = readNumber(value, ['lng', 'lon', 'longitude', 'x', '경도'])
  if (lat === null || lng === null) return null

  const id =
    readString(value, ['id', 'safehouseId', 'facilityId', 'placeId']) ||
    `${lat},${lng}`

  return {
    id,
    lat,
    lng,
    name: readString(value, [
      'name',
      'title',
      'facilityName',
      'storeName',
      'placeName',
      '업소명',
      '시설명',
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
 * Returns 안심지킴이집 inside the given bbox from `mysuperman-service`.
 */
export const fetchNearbySafehouses = createServerFn({ method: 'GET' })
  .validator((bbox: Bbox) => bbox)
  .handler(async ({ data: bbox }): Promise<SafeHouseResult> => {
    const raw = await fetchServiceJson(
      serviceUrl(safehouseApiPath(), nearbyQuery(bbox, MAX_RETURN)),
    )
    const { items, total } = extractItems(raw)
    const normalized = items
      .map(normalizeSafeHousePoint)
      .filter((item): item is SafeHousePoint => item !== null)

    return {
      items: normalized.slice(0, MAX_RETURN),
      total: total ?? normalized.length,
    }
  })
