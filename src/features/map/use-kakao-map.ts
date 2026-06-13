import { useKakaoLoader } from 'react-kakao-maps-sdk'

const APP_KEY = import.meta.env.VITE_KAKAO_MAP_APP_KEY

/**
 * Loads the Kakao Maps SDK with our app key. Returns the loader state plus a
 * `configured` flag so the UI can show a helpful fallback when the
 * `VITE_KAKAO_MAP_APP_KEY` env var is missing.
 */
export function useKakaoMapLoader() {
  const [loading, error] = useKakaoLoader({ appkey: APP_KEY ?? '' })
  return { loading, error, configured: Boolean(APP_KEY) }
}
