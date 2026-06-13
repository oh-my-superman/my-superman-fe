/// <reference types="vite/client" />
/// <reference types="kakao.maps.d.ts" />

interface ImportMetaEnv {
  /** Kakao Maps JavaScript app key (public; protected by domain allowlist). */
  readonly VITE_KAKAO_MAP_APP_KEY?: string
  /**
   * Base origin of mysuperman-service, e.g. `http://localhost:8080`.
   * REST calls use this directly and WebSocket calls derive `ws(s)://` from it.
   * (Exposed via the `API_` envPrefix in vite.config.ts.)
   */
  readonly API_BASE_URL?: string
  /** CCTV endpoint path under `API_BASE_URL`. */
  readonly VITE_CCTV_API_PATH?: string
  /** Safe-house endpoint path under `API_BASE_URL`. */
  readonly VITE_SAFEHOUSE_API_PATH?: string
  /**
   * Presigned-upload endpoint path under `API_BASE_URL`.
   * Default `/api/uploads/presign`. The BE signs an S3 PUT URL here.
   */
  readonly VITE_PRESIGN_API_PATH?: string
  /**
   * Base origin of the BE realtime server, e.g. `ws://localhost:8080` (or
   * `wss://…` in prod). The `/ws/companion` path is appended automatically.
   * Optional compatibility override; `API_BASE_URL` is preferred.
   */
  readonly VITE_WS_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Compact CCTV dataset (built by scripts/build-cctv.mjs). Declared here so tsc
// uses this type instead of parsing the ~3MB JSON literal. Tuple layout:
// [lat, lng, purpose, address]
declare module '#/features/map/cctv-data.json' {
  const data: Array<[number, number, string, string]>
  export default data
}

// Geocoded 안심지킴이집 dataset (built by scripts/build-safehouses.mjs).
// Tuple layout: [lat, lng, name, address]
declare module '#/features/map/safehouses.json' {
  const data: Array<[number, number, string, string]>
  export default data
}
