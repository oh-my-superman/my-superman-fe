/// <reference types="vite/client" />
/// <reference types="kakao.maps.d.ts" />

interface ImportMetaEnv {
  /** Kakao Maps JavaScript app key (public; protected by domain allowlist). */
  readonly VITE_KAKAO_MAP_APP_KEY?: string
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
