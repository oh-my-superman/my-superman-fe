import { ClientOnly } from '@tanstack/react-router'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { CustomOverlayMap, Map } from 'react-kakao-maps-sdk'
import { debounce } from 'es-toolkit'
import { Camera, Crosshair, Home, Layers } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Badge } from '#/components/ui/badge'
import { ListDivider, ListItem } from '#/components/ui/list-item'
import { AppBar } from '#/components/app-bar'
import { BottomNav } from '#/components/bottom-nav'
import { SAFE_HOUSES, SEOLLEUNG_CENTER } from '#/features/map/spots'
import { fetchNearbyCctv } from '#/features/map/cctv'
import type { Bbox } from '#/features/map/cctv'
import { useKakaoMapLoader } from '#/features/map/use-kakao-map'

const CCTV_COLOR = 'var(--blue-info)'
const SAFE_COLOR = 'var(--coral-500)'

// How many CCTV to draw / list (nearest first) so dense areas stay readable.
const MAX_CCTV_MARKERS = 60
const MAX_CCTV_LIST = 30

interface LatLng {
  lat: number
  lng: number
}

function bboxAround({ lat, lng }: LatLng): Bbox {
  return {
    minX: lng - 0.012,
    maxX: lng + 0.012,
    minY: lat - 0.009,
    maxY: lat + 0.009,
  }
}

/** Round a bbox so small map nudges reuse the same query cache entry. */
function roundBbox(b: Bbox) {
  const r = (n: number) => Math.round(n * 1000) / 1000
  return { minX: r(b.minX), maxX: r(b.maxX), minY: r(b.minY), maxY: r(b.maxY) }
}

function haversineM(a: LatLng, b: LatLng): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

function distLabel(m: number): string {
  return m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(1)}km`
}

/** Teardrop pin (reused as Kakao CustomOverlayMap content). */
function PinMarker({
  color,
  icon: PinIcon,
  size = 34,
  active = false,
  onClick,
}: {
  color: string
  icon: LucideIcon
  size?: number
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: 'none',
        background: 'transparent',
        padding: 0,
        cursor: 'pointer',
        transform: 'translate(-50%, -100%)',
        filter: 'drop-shadow(0 4px 7px rgba(40,24,24,.28))',
      }}
    >
      <div
        style={{
          width: active ? size + 4 : size,
          height: active ? size + 4 : size,
          background: color,
          borderRadius: '50% 50% 50% 0',
          transform: 'rotate(-45deg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: active ? '3px solid #fff' : '2.5px solid #fff',
          transition: 'width .12s ease, height .12s ease',
        }}
      >
        <div
          style={{ transform: 'rotate(45deg)', color: '#fff', display: 'flex' }}
        >
          <PinIcon size={Math.round(size * 0.46)} />
        </div>
      </div>
    </button>
  )
}

/** Pulsing current-location dot. */
function UserDot() {
  return (
    <div style={{ transform: 'translate(-50%, -50%)' }}>
      <span
        data-sm-loc-ring
        style={{
          position: 'absolute',
          inset: 0,
          margin: 'auto',
          width: 22,
          height: 22,
          borderRadius: 99,
          background: 'var(--coral-400)',
          animation: 'sm-loc-pulse 2.6s ease-out infinite',
        }}
      />
      <span
        style={{
          position: 'relative',
          display: 'block',
          width: 22,
          height: 22,
          borderRadius: 99,
          background: 'var(--coral-500)',
          border: '3px solid #fff',
          boxShadow: 'var(--shadow-md)',
        }}
      />
    </div>
  )
}

function Chip({
  color,
  label,
  count,
}: {
  color: string
  label: string
  count: number | string
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 99,
        padding: '7px 12px',
        boxShadow: 'var(--shadow-sm)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <span
        style={{ width: 9, height: 9, borderRadius: 99, background: color }}
      />
      <span
        style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--muted-foreground)',
        }}
      >
        {count}
      </span>
    </div>
  )
}

interface CctvNear {
  id: string
  lat: number
  lng: number
  purpose: string
  address: string
  distance: number
}

/** Centered notice shown over the map canvas (missing key / load error). */
function MapNotice({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        textAlign: 'center',
        color: 'var(--muted-foreground)',
        fontSize: 'var(--text-sm)',
        lineHeight: 1.5,
      }}
    >
      <span>{children}</span>
    </div>
  )
}

/** The Kakao map canvas with safe-house + CCTV pins and the user-location dot. */
function KakaoCanvas({
  center,
  userPos,
  selectedId,
  cctv,
  onBboxChange,
  onSelect,
}: {
  center: LatLng
  userPos: LatLng | null
  selectedId: string | null
  cctv: Array<CctvNear>
  onBboxChange: (bbox: Bbox) => void
  onSelect: (id: string, pos: LatLng) => void
}) {
  // Debounced bbox sync from the live map viewport (drag / zoom).
  const syncBbox = useMemo(
    () =>
      debounce((map: kakao.maps.Map) => {
        const b = map.getBounds()
        const sw = b.getSouthWest()
        const ne = b.getNorthEast()
        onBboxChange({
          minX: sw.getLng(),
          maxX: ne.getLng(),
          minY: sw.getLat(),
          maxY: ne.getLat(),
        })
      }, 350),
    [onBboxChange],
  )
  useEffect(() => () => syncBbox.cancel(), [syncBbox])

  // Load the Kakao Maps SDK before rendering <Map> (it needs the global `kakao`).
  const { loading, error, configured } = useKakaoMapLoader()
  if (!configured) {
    return (
      <MapNotice>
        지도를 표시하려면 <code>VITE_KAKAO_MAP_APP_KEY</code> 를 설정하세요.
      </MapNotice>
    )
  }
  if (error) {
    return (
      <MapNotice>
        지도를 불러오지 못했어요. Kakao 콘솔에 현재 도메인이 등록됐는지 확인해
        주세요.
      </MapNotice>
    )
  }
  if (loading) return null // map-area bg shows through while the SDK loads

  return (
    <Map
      center={center}
      isPanto
      level={4}
      style={{ width: '100%', height: '100%' }}
      onCreate={syncBbox}
      onBoundsChanged={syncBbox}
    >
      {SAFE_HOUSES.map((s) => (
        <CustomOverlayMap
          key={s.id}
          position={{ lat: s.lat, lng: s.lng }}
          yAnchor={1}
          zIndex={selectedId === s.id ? 30 : 20}
          clickable
        >
          <PinMarker
            color={SAFE_COLOR}
            icon={Home}
            size={38}
            active={selectedId === s.id}
            onClick={() => onSelect(s.id, { lat: s.lat, lng: s.lng })}
          />
        </CustomOverlayMap>
      ))}

      {cctv.slice(0, MAX_CCTV_MARKERS).map((c) => (
        <CustomOverlayMap
          key={c.id}
          position={{ lat: c.lat, lng: c.lng }}
          yAnchor={1}
          zIndex={selectedId === c.id ? 30 : 5}
          clickable
        >
          <PinMarker
            color={CCTV_COLOR}
            icon={Camera}
            size={30}
            active={selectedId === c.id}
            onClick={() => onSelect(c.id, { lat: c.lat, lng: c.lng })}
          />
        </CustomOverlayMap>
      ))}

      {userPos && (
        <CustomOverlayMap position={userPos} yAnchor={0.5} zIndex={6}>
          <UserDot />
        </CustomOverlayMap>
      )}
    </Map>
  )
}

/**
 * 지도 화면 — 안심 지킴이 집(목업) + 방범 CCTV(행안부 전국 CCTV 표준데이터 전처리)를
 * 카카오 지도에 표시. 지도를 움직이면 보이는 영역(bbox) 기준으로 근처 CCTV를 다시 조회한다.
 */
export function MapScreen() {
  const [center, setCenter] = useState<LatLng>(SEOLLEUNG_CENTER)
  const [userPos, setUserPos] = useState<LatLng | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [bbox, setBbox] = useState<Bbox>(() => bboxAround(SEOLLEUNG_CENTER))

  const locate = useCallback(() => {
    // Runs only from useEffect / onClick (client), so navigator is available.
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserPos(next)
        setCenter(next)
        setBbox(bboxAround(next))
      },
      () => {
        // denied / unavailable → keep the 역삼역 fallback center
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30_000 },
    )
  }, [])

  // Auto-locate on entry.
  useEffect(() => {
    locate()
  }, [locate])

  const cctvQuery = useQuery({
    queryKey: ['cctv', roundBbox(bbox)],
    queryFn: () => fetchNearbyCctv({ data: bbox }),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  })

  const total = cctvQuery.data?.total ?? 0
  const refPoint = userPos ?? center

  // Sort returned CCTV by distance from the reference point.
  const cctvNear: Array<CctvNear> = useMemo(() => {
    const items = cctvQuery.data?.items ?? []
    return items
      .map((c) => ({
        ...c,
        distance: haversineM(refPoint, { lat: c.lat, lng: c.lng }),
      }))
      .sort((a, b) => a.distance - b.distance)
  }, [cctvQuery.data, refPoint])

  const selectSpot = useCallback((id: string, pos: LatLng) => {
    setSelectedId(id)
    setCenter(pos)
  }, [])

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--surface)',
      }}
    >
      <AppBar
        title="안전 지도"
        status="현재 위치 기준 · 보이는 영역의 방범 CCTV"
        actions={[{ icon: Layers, label: '레이어' }]}
      />

      <div
        style={{
          flex: 1,
          minHeight: 0,
          position: 'relative',
          overflow: 'hidden',
          background: '#e7eae4',
        }}
      >
        <ClientOnly fallback={null}>
          <KakaoCanvas
            center={center}
            userPos={userPos}
            selectedId={selectedId}
            cctv={cctvNear}
            onBboxChange={setBbox}
            onSelect={selectSpot}
          />
        </ClientOnly>

        {/* filter chips */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 14,
            right: 14,
            display: 'flex',
            gap: 8,
            zIndex: 8,
          }}
        >
          <Chip
            color={CCTV_COLOR}
            label="CCTV"
            count={cctvQuery.isLoading ? '…' : total}
          />
          <Chip
            color={SAFE_COLOR}
            label="안심 지킴이 집"
            count={SAFE_HOUSES.length}
          />
        </div>

        {/* current-location FAB */}
        <button
          type="button"
          aria-label="현재 위치"
          onClick={locate}
          style={{
            position: 'absolute',
            right: 16,
            bottom: 250,
            width: 46,
            height: 46,
            borderRadius: 14,
            border: '1px solid var(--border)',
            background: 'var(--card)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--coral-600)',
            zIndex: 8,
          }}
        >
          <Crosshair size={22} />
        </button>

        {/* Bottom sheet */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'var(--card)',
            borderTopLeftRadius: 'var(--radius-2xl)',
            borderTopRightRadius: 'var(--radius-2xl)',
            boxShadow: '0 -10px 30px rgba(40,24,24,.10)',
            padding: '10px 16px 14px',
            maxHeight: 236,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9,
          }}
        >
          <div
            style={{
              width: 40,
              height: 5,
              borderRadius: 3,
              background: 'var(--neutral-300)',
              margin: '0 auto 10px',
            }}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 4px 8px',
            }}
          >
            <span style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>
              내 주변 안전 지점
            </span>
            <Badge variant="success" dot>
              실시간
            </Badge>
          </div>
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
            {SAFE_HOUSES.map((s, i) => (
              <div key={s.id}>
                {i > 0 && <ListDivider />}
                <ListItem
                  leading={<SpotIcon safe />}
                  title={s.title}
                  subtitle={
                    <span>
                      {s.dist} · {s.meta}
                      {s.open ? (
                        <span
                          style={{ color: 'var(--success)', fontWeight: 600 }}
                        >
                          {' '}
                          · 영업 중
                        </span>
                      ) : null}
                    </span>
                  }
                  chevron
                  onClick={() => selectSpot(s.id, { lat: s.lat, lng: s.lng })}
                />
              </div>
            ))}

            {cctvNear.slice(0, MAX_CCTV_LIST).map((c) => (
              <div key={c.id}>
                <ListDivider />
                <ListItem
                  leading={<SpotIcon />}
                  title={c.address || `방범 CCTV (${c.purpose})`}
                  subtitle={`${c.purpose} CCTV · ${distLabel(c.distance)}`}
                  chevron
                  onClick={() => selectSpot(c.id, { lat: c.lat, lng: c.lng })}
                />
              </div>
            ))}

            {!cctvQuery.isLoading && total === 0 && (
              <p
                style={{
                  margin: '12px 4px',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--muted-foreground)',
                }}
              >
                이 영역에는 등록된 방범 CCTV가 없어요. 지도를 옮겨 보세요.
                (데이터: 서울 지역)
              </p>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

/** Rounded icon chip used at the left of each bottom-sheet row. */
function SpotIcon({ safe = false }: { safe?: boolean }) {
  return (
    <span
      style={{
        width: 40,
        height: 40,
        borderRadius: 11,
        background: safe
          ? 'var(--coral-50)'
          : 'color-mix(in srgb, var(--blue-info) 12%, #fff)',
        color: safe ? 'var(--coral-600)' : 'var(--blue-info)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 'none',
      }}
    >
      {safe ? <Home size={19} /> : <Camera size={19} />}
    </span>
  )
}
