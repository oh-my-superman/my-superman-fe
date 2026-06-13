const DEFAULT_SERVICE_PORT = '8080'
const DEFAULT_HTTP_BASE = `http://localhost:${DEFAULT_SERVICE_PORT}`
const DEFAULT_CCTV_PATH = '/api/cctv/nearby'
const DEFAULT_SAFEHOUSE_PATH = '/api/safehouses/nearby'

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '')
}

function ensureLeadingSlash(value: string): string {
  return value.startsWith('/') ? value : `/${value}`
}

function pageHostHttpBase(): string | null {
  if (typeof window === 'undefined') return null
  const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:'
  return `${protocol}//${window.location.hostname}:${DEFAULT_SERVICE_PORT}`
}

function httpToWsBase(httpBase: string): string {
  return httpBase.replace(/^https:/, 'wss:').replace(/^http:/, 'ws:')
}

export function serviceHttpBase(): string {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim()
  return trimTrailingSlash(
    configured || pageHostHttpBase() || DEFAULT_HTTP_BASE,
  )
}

export function companionWsUrl(): string {
  const configuredWs = import.meta.env.VITE_WS_BASE_URL?.trim()
  const wsBase = configuredWs
    ? trimTrailingSlash(configuredWs)
    : httpToWsBase(serviceHttpBase())
  return `${wsBase}/ws/companion`
}

export function cctvApiPath(): string {
  return ensureLeadingSlash(
    import.meta.env.VITE_CCTV_API_PATH?.trim() || DEFAULT_CCTV_PATH,
  )
}

export function safehouseApiPath(): string {
  return ensureLeadingSlash(
    import.meta.env.VITE_SAFEHOUSE_API_PATH?.trim() || DEFAULT_SAFEHOUSE_PATH,
  )
}

export function serviceUrl(
  path: string,
  query?: Record<string, string | number | boolean | null | undefined>,
): string {
  const url = new URL(`${serviceHttpBase()}${ensureLeadingSlash(path)}`)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== null && value !== undefined) {
        url.searchParams.set(key, String(value))
      }
    }
  }
  return url.toString()
}
