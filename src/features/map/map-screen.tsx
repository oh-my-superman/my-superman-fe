import { ClientOnly } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import { CustomOverlayMap, Map } from 'react-kakao-maps-sdk'
import { Camera, Crosshair, Home, Layers } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Badge } from '#/components/ui/badge'
import { ListDivider, ListItem } from '#/components/ui/list-item'
import { AppBar } from '#/components/app-bar'
import { BottomNav } from '#/components/bottom-nav'
import { SEOLLEUNG_CENTER, SPOTS } from '#/features/map/spots'
import { useKakaoMapLoader } from '#/features/map/use-kakao-map'
import type { Spot } from '#/features/map/spots'

const CCTV_COLOR = 'var(--blue-info)'
const SAFE_COLOR = 'var(--coral-500)'

interface LatLng {
  lat: number
  lng: number
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
  count: number
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

/** The Kakao map canvas with spot pins + the user-location dot. Client-only. */
function KakaoCanvas({
  center,
  userPos,
  selectedId,
  onSelectSpot,
}: {
  center: LatLng
  userPos: LatLng | null
  selectedId: string | null
  onSelectSpot: (spot: Spot) => void
}) {
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
    >
      {SPOTS.map((s) => {
        const safe = s.type === 'safe'
        return (
          <CustomOverlayMap
            key={s.id}
            position={{ lat: s.lat, lng: s.lng }}
            yAnchor={1}
            zIndex={selectedId === s.id ? 20 : 5}
            clickable
          >
            <PinMarker
              color={safe ? SAFE_COLOR : CCTV_COLOR}
              icon={safe ? Home : Camera}
              size={safe ? 38 : 32}
              active={selectedId === s.id}
              onClick={() => onSelectSpot(s)}
            />
          </CustomOverlayMap>
        )
      })}

      {userPos && (
        <CustomOverlayMap position={userPos} yAnchor={0.5} zIndex={6}>
          <UserDot />
        </CustomOverlayMap>
      )}
    </Map>
  )
}

/**
 * 지도 화면 — nearby CCTV + 안심 지킴이 집 on a real Kakao map, with filter chips,
 * automatic current-location, and a bottom sheet listing safe spots by distance.
 */
export function MapScreen() {
  const [center, setCenter] = useState<LatLng>(SEOLLEUNG_CENTER)
  const [userPos, setUserPos] = useState<LatLng | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const locate = useCallback(() => {
    // Runs only from useEffect / onClick (client), so navigator is available.
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserPos(next)
        setCenter(next)
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

  const selectSpot = useCallback((spot: Spot) => {
    setSelectedId(spot.id)
    setCenter({ lat: spot.lat, lng: spot.lng })
  }, [])

  const cctvCount = SPOTS.filter((s) => s.type === 'cctv').length
  const safeCount = SPOTS.filter((s) => s.type === 'safe').length

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
        status="현재 위치 기준 · 반경 500m"
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
        {/* Map canvas — browser-only (Kakao SDK touches window). */}
        <ClientOnly fallback={null}>
          <KakaoCanvas
            center={center}
            userPos={userPos}
            selectedId={selectedId}
            onSelectSpot={selectSpot}
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
          <Chip color={CCTV_COLOR} label="CCTV" count={cctvCount} />
          <Chip color={SAFE_COLOR} label="안심 지킴이 집" count={safeCount} />
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
            {SPOTS.map((s, i) => {
              const safe = s.type === 'safe'
              return (
                <div key={s.id}>
                  {i > 0 && <ListDivider />}
                  <ListItem
                    leading={
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
                    }
                    title={s.title}
                    subtitle={
                      <span>
                        {s.dist} · {s.meta}
                        {safe && s.open ? (
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
                    onClick={() => selectSpot(s)}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
