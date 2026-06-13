export interface Spot {
  id: string
  type: 'safe' | 'cctv'
  title: string
  lat: number
  lng: number
  /** Human distance label (e.g. "도보 1분", "12m"). */
  dist: string
  /** Secondary meta (e.g. "80m", "방범용"). */
  meta: string
  open: boolean
}

/** Fallback map center — 역삼역 (used when geolocation is denied/unavailable). */
export const SEOLLEUNG_CENTER = { lat: 37.5006, lng: 127.0364 }

/**
 * Nearby safety spots around 역삼역. Mock data with real coordinates — the
 * single source for the map pins, the filter-chip counts, and the bottom-sheet
 * list. Swap this array for an API response to go live.
 */
export const SPOTS: Array<Spot> = [
  // 안심 지킴이 집 (safe houses)
  {
    id: 'safe-gs25',
    type: 'safe',
    title: '안심 지킴이 집 · GS25 역삼점',
    lat: 37.5012,
    lng: 127.0357,
    dist: '도보 1분',
    meta: '80m',
    open: true,
  },
  {
    id: 'safe-seven',
    type: 'safe',
    title: '안심 지킴이 집 · 세븐약국',
    lat: 37.4998,
    lng: 127.0379,
    dist: '도보 2분',
    meta: '140m',
    open: false,
  },
  {
    id: 'safe-woori',
    type: 'safe',
    title: '안심 지킴이 집 · 우리은행 역삼점',
    lat: 37.5019,
    lng: 127.0371,
    dist: '도보 3분',
    meta: '220m',
    open: true,
  },

  // CCTV
  {
    id: 'cctv-12gil',
    type: 'cctv',
    title: 'CCTV · 역삼로 12길',
    lat: 37.5001,
    lng: 127.0369,
    dist: '12m',
    meta: '방범용',
    open: true,
  },
  {
    id: 'cctv-school-zone',
    type: 'cctv',
    title: 'CCTV · 어린이 보호구역',
    lat: 37.4995,
    lng: 127.0352,
    dist: '50m',
    meta: '방범용',
    open: true,
  },
  {
    id: 'cctv-teheran',
    type: 'cctv',
    title: 'CCTV · 테헤란로 일원',
    lat: 37.5009,
    lng: 127.0388,
    dist: '120m',
    meta: '방범용',
    open: true,
  },
  {
    id: 'cctv-school',
    type: 'cctv',
    title: 'CCTV · 역삼초교 앞',
    lat: 37.5016,
    lng: 127.0349,
    dist: '90m',
    meta: '방범용',
    open: true,
  },
  {
    id: 'cctv-sev',
    type: 'cctv',
    title: 'CCTV · 강남세브란스 사거리',
    lat: 37.4989,
    lng: 127.0367,
    dist: '210m',
    meta: '방범용',
    open: true,
  },
  {
    id: 'cctv-center',
    type: 'cctv',
    title: 'CCTV · 역삼동 주민센터',
    lat: 37.5003,
    lng: 127.0341,
    dist: '160m',
    meta: '생활방범',
    open: true,
  },
  {
    id: 'cctv-nonhyeon',
    type: 'cctv',
    title: 'CCTV · 논현로 88길',
    lat: 37.4983,
    lng: 127.0356,
    dist: '240m',
    meta: '방범용',
    open: true,
  },
  {
    id: 'cctv-parking',
    type: 'cctv',
    title: 'CCTV · 역삼1동 공영주차장',
    lat: 37.5021,
    lng: 127.0388,
    dist: '300m',
    meta: '방범용',
    open: true,
  },
]
