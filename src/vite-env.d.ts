/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Kakao Maps JavaScript app key (public; protected by domain allowlist). */
  readonly VITE_KAKAO_MAP_APP_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
