export interface SafeHouse {
  id: string
  title: string
  lat: number
  lng: number
  /** Human distance label (e.g. "도보 1분"). */
  dist: string
  /** Secondary meta (e.g. "80m"). */
  meta: string
  open: boolean
}

/** Fallback map center — 역삼역 (used when geolocation is denied/unavailable). */
export const SEOLLEUNG_CENTER = { lat: 37.5006, lng: 127.0364 }

/**
 * 안심 지킴이 집 (safe houses). Mock data — there is no public API for these, so
 * they stay hardcoded. CCTV markers, by contrast, come live from the ITS API
 * (see `cctv.ts`).
 */
export const SAFE_HOUSES: Array<SafeHouse> = [
  {
    id: 'safe-gs25',
    title: '안심 지킴이 집 · GS25 역삼점',
    lat: 37.5012,
    lng: 127.0357,
    dist: '도보 1분',
    meta: '80m',
    open: true,
  },
  {
    id: 'safe-seven',
    title: '안심 지킴이 집 · 세븐약국',
    lat: 37.4998,
    lng: 127.0379,
    dist: '도보 2분',
    meta: '140m',
    open: false,
  },
  {
    id: 'safe-woori',
    title: '안심 지킴이 집 · 우리은행 역삼점',
    lat: 37.5019,
    lng: 127.0371,
    dist: '도보 3분',
    meta: '220m',
    open: true,
  },
]
