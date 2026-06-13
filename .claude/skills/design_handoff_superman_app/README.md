# Handoff: 나의 슈퍼맨 (My Superman) — 메인 · 지도 화면

## Overview

나의 슈퍼맨은 AI 안전 동행 서비스입니다. 이 핸드오프는 모바일 앱의 두 핵심 화면
— **메인 화면(AI 동행 + 페르소나 통화)** 과 **지도 화면(주변 CCTV·안심 지킴이 집)** —
및 이를 구성하는 공통 컴포넌트·디자인 토큰을 실제 코드베이스(`my-superman-fe`,
React + shadcn/ui)에 옮기기 위한 자료입니다.

## About the Design Files

이 묶음의 파일들은 **HTML/JSX로 만든 디자인 참조(프로토타입)** 입니다 — 의도한 외형과
동작을 보여주는 명세이지, 그대로 복사해 배포하는 프로덕션 코드가 아닙니다.
작업의 목표는 이 디자인을 **레포의 기존 환경(React + Tailwind + shadcn/ui)으로
재현**하는 것입니다. 이 디자인 시스템 자체가 shadcn 위에 세워졌으므로 매핑은 거의 1:1입니다.

- `reference_app/*.jsx` — 화면을 React로 구현한 참조 코드. 컴포넌트는 `window.DesignSystem_*`
  (디자인 시스템 번들)에서 가져다 쓰지만, 레포에서는 **shadcn 컴포넌트로 대체**하면 됩니다.
- `components_core/*` — 각 UI 프리미티브(Button/Avatar/Dialog/Switch 등)의 정확한 스타일 명세.
  shadcn 기본형에 아래 토큰만 입히면 동일해집니다.
- `tokens/` + `styles.css` — 색·타이포·간격·라운드·그림자 토큰. 레포 `globals.css` / Tailwind 테마로 이식.

## Fidelity

**High-fidelity (hifi).** 최종 색·타이포·간격·인터랙션까지 확정된 목업입니다. 픽셀 단위로 재현하세요.

## Target codebase mapping (shadcn)

```bash
npx shadcn@latest add button avatar dialog card switch badge
```

- 우리 `Button/Avatar/Dialog/Card/Switch/Badge` ≈ shadcn 동명 컴포넌트. props 의미가 동일합니다.
- `ListItem` / `ListDivider` / `AppBar` / `BottomNav` / `PhoneFrame` 는 레포에 없는 합성 컴포넌트 →
  `components_core` 와 `reference_app` 를 참고해 새로 작성.
- 아이콘은 **lucide-react** 사용(우리 `Icons.jsx`가 곧 Lucide 벡터). 같은 이름으로 import 하면 됩니다.

---

## Design Tokens

### Colors

**Brand (coral)** — 단일 브랜드 색. `--coral-500` 이 기준값.
| token | hex |
|---|---|
| coral-50 | #fff5f5 |
| coral-100 | #fde8e8 |
| coral-200 | #fad1d1 |
| coral-300 | #f6b4b4 |
| coral-400 | #f39a9a |
| **coral-500** | **#f08080** |
| coral-600 | #e56a6a |
| coral-700 | #cf5050 |
| coral-800 | #ab4040 |
| coral-900 | #8a3636 |

**Warm neutrals** — 0:#ffffff · 50:#faf9f8 · 100:#f4f2f0 · 200:#e9e5e2 · 300:#d8d2cd ·
400:#aca39c · 500:#7d736c · 600:#5b524c · 700:#443d38 · 800:#2a2521 · 900:#1b1714

**Status** — emergency `#e5484d` (112/위급) · safe `#2faf6a` (안전·동행 중) ·
caution `#f5a623` · info `#4a8cf0` (CCTV 핀)

**Semantic** (컴포넌트에서 이것을 참조): background=neutral-0 · surface=neutral-50 ·
foreground=neutral-900 · primary=coral-500 · primary-hover=coral-600 · muted-fg=neutral-500 ·
accent=coral-50 · border=neutral-200 · destructive=#e5484d · success=#2faf6a · ring=coral-400

### Typography — Pretendard Variable

스택: `"Pretendard Variable", -apple-system, "Apple SD Gothic Neo", system-ui, sans-serif`
(CDN: jsDelivr `orioncactus/pretendard@v1.3.9` variable build)
스케일(rem@16): xs .75 / sm .875 / base 1 / lg 1.125 / xl 1.375 / 2xl 1.75 / 3xl 2.25 ·
weights 400/500/600/700 · 제목은 700 + letter-spacing -0.02em.

### Spacing — 4px 스텝

1:4 · 2:8 · 3:12 · 4:16 · 6:24 · 8:32 · 12:48. App 최대 폭 420px.

### Radius (soft)

base 0.75rem(12) · sm ~7 · md ~10(버튼) · lg 12 · xl ~17(카드) · 2xl ~22 · full 9999.

### Shadows (warm-tinted)

sm `0 1px 3px rgba(40,24,24,.08)` · md `0 4px 12px rgba(40,24,24,.08)` ·
lg `0 12px 28px rgba(40,24,24,.12)` · xl `0 24px 48px rgba(40,24,24,.16)` ·
**coral glow** `0 8px 24px rgba(240,128,128,.45)` (라이브/동행 강조).

---

## Screens

### 1) 메인 화면 (Home) — `reference_app/HomeScreen.jsx`, `App.dc.html`

사용자가 동행을 켜고/끄고, AI 페르소나에게 통화·영상통화를 거는 홈.

**Layout** (390px 폭, 세로 column): 상태바 → **AppBar** → 스크롤 본문(좌우 16px) → **BottomNav**.

- **AppBar**: 좌측 코랄 방패 마크(30×30, radius 9, bg coral-500, 흰 shieldCheck 아이콘, coral glow) +
  타이틀 "나의 슈퍼맨"(xl/700). 우측 아이콘 버튼(40×40, ghost) bell·settings. 아래 상태줄:
  초록 점(8px, success) + 텍스트(sm, muted) — 동행 ON: "슈퍼맨이 동행 중 · 위치 공유 켜짐", OFF: "동행 대기 중 · …".
- **AI 동행 토글 카드** (radius 2xl, padding 18×20, gap 16):
  - ON: 배경 `linear-gradient(135deg, coral-50, card)`, border coral-200, shadow coral.
    아이콘 원 52px bg coral-500 흰 shieldCheck. 제목 "AI 동행 시작"(lg/700), 서브 "슈퍼맨이 곁에서 함께 걷고 있어요"(sm, coral-700). 우측 **Switch(on)**.
  - OFF: 배경 card, border default, shadow sm. 아이콘 원 bg coral-50/coral 아이콘. 서브 "탭 한 번으로 AI 동행을 켜세요"(muted). Switch(off, neutral-300 트랙).
- **섹션** "내 슈퍼맨"(sm/700 muted) + 우측 "편집"(sm/600 coral-600). 바로 아래 설명 "다양한 AI 페르소나와 통화"(sm, muted).
- **페르소나 리스트** (flat card, radius xl, 행 사이 ListDivider):
  각 행 = Avatar(44, fallback 글리프/이모지, 온라인 점) + 제목(base/600) + 서브(sm muted, 1줄 ellipsis) +
  우측 **액션 2버튼**(38px 원, gap 8): **통화**(아웃라인: border coral-200, bg card, coral-600, lucide `phone`) ·
  **영상통화**(코랄 채움: bg coral-500, 흰색, shadow xs, lucide `video`). ※통화=왼쪽 아웃라인, 영상통화=오른쪽 코랄.
  마지막 행 "새 페르소나 만들기"(점선 원 + plus, chevron).
  - 페르소나 데이터: 엄마(coral-100/coral-700, online) · 경찰 톤(blue-info/흰, 👮) · 연인(coral-50/coral-600, 💗) · 직장 상사(neutral-200/neutral-700, 👔).
- **예약된 동행** 섹션(동일 card 패턴): clock 아이콘 + 제목 + 시간 + accent Badge.
- **BottomNav**: 메인(phone) · 지도(map) · 설정(settings). active=coral-600, else muted. top border 1px.

### 2) 지도 화면 (Map) — `reference_app/MapScreen.jsx`, `Map.dc.html`

주변 CCTV·안심 지킴이 집 위치를 지도에 표시.

**Layout**: 상태바 → AppBar("안전 지도", 상태줄 "현재 위치 기준 · 반경 500m", 우측 layers 아이콘) →
지도 영역(flex 1) → BottomNav(지도 active).

- **지도**: bg #e7eae4. 흰색 도로(가로 26%/58%, 세로 30%/72%), 공원(#cfe3c0), 강(#bdd7ea), 건물블록(#dadcd4).
- **필터 칩**(상단, card pill, shadow sm): 색점 + 라벨 + 개수 — "CCTV 8"(blue-info), "안심 지킴이 집 3"(coral-500).
- **핀**(클래식 teardrop: 원 + `border-radius:50% 50% 50% 0; rotate(-45deg)`, 흰 2.5px 테두리, drop-shadow):
  CCTV = blue-info + lucide `camera` · 안심 지킴이 집 = coral-500 + lucide `home`(house). 핀 끝이 좌표를 가리키도록 `translate(-50%,-100%)`.
- **내 위치**: coral-500 점 22px + 흰 3px 테두리(앱에선 펄스 링 애니메이션, 2.6s).
- **현재 위치 FAB**(우하단, 46px, card, border, shadow md, lucide `crosshair`, coral-600).
- **바텀시트**(하단 고정, radius 2xl 상단, shadow 위로): 핸들 바 → "내 주변 안전 지점"(base/700) + success Badge "실시간" →
  스팟 리스트(ListItem): 좌측 11px 라운드 아이콘 칩(safe=coral-50/coral, cctv=blue 12%/blue) + 제목 + 서브(거리·메타·"영업 중"은 success/600) + chevron.

### 보조 화면 (참고 — `reference_app/`)

- **통화 화면** `CallScreen.jsx`: 펄스 링 아바타(xl), 타이머, 회전 AI 자막, mic/video/speaker 컨트롤, 큰 빨강 "위급·신고" + 종료.
- **신고 모달** `ReportModal.jsx`: danger-tone 바텀시트, 10초 취소형 카운트다운(원형 progress), 증거 요약(녹음·위치), "지금 신고"/"취소".
- **설정** `SettingsScreen.jsx`: 프로필 + 안전 토글 그룹(자동 신고·위치 공유·사이렌·세이프워드) + 보호자 + 통화 기본값.

## Interactions & Behavior

- **AI 동행 토글**: Switch on/off → 상태줄 텍스트·카드 배경/서브문구·아이콘 원 색이 동기 전환(transition .2s ease).
- **페르소나 통화/영상 버튼**: 탭 → 통화 화면으로 이동(persona 전달). (영상은 영상 모드로 진입 예정.)
- **BottomNav**: 메인 ↔ 지도 ↔ 설정 전환.
- **통화 화면 "위급·신고"**: 신고 모달 오픈 → 10초 후 자동 신고(취소 가능).
- 버튼 press: scale .99 + 살짝 어둡게. hover: accent(coral-50) 또는 한 단계 진한 코랄.
- 모달: fade+zoom(센터) / 슬라이드업(바텀시트). reduced-motion 존중 권장.

## State Management

- `companion: boolean` (홈 AI 동행 on/off) — 상태줄/토글 카드 구동.
- `screen: 'home'|'map'|'call'|'settings'`, `persona` (선택된 페르소나), `report: boolean` (모달).
- 통화 화면: `seconds`(타이머), `muted`, `caption`(회전 인덱스). 모달: `count`(10→0 카운트다운).
- 데모는 전부 클라이언트 가짜 상태. 실제로는 통화/감지/신고 API 연동 지점.

## Assets / Icons

- **Lucide** (lucide-react). 사용 아이콘: phone, phoneOff, video, mic, micOff, volume, shieldCheck,
  alertTriangle, mapPin, camera, home, crosshair, layers, map, bell, settings, user, users, clock,
  sparkles, lock, plus, chevronRight/Left/Down, check, search, heart, history.
- 별도 로고 에셋 없음 → 코랄 방패(shieldCheck) + 워드마크로 대체. 실제 로고가 있으면 교체.
- Pretendard 폰트는 CDN. 프로덕션은 self-host 권장.

## Files (this bundle)

- `tokens/` — colors / typography / spacing / shadows / fonts CSS (원본 토큰)
- `styles.css` — 토큰 진입점(@import 목록)
- `components_core/` — Button·Avatar·Dialog·Card·Switch·Badge·ListItem 의 .jsx/.d.ts/.prompt.md (정확한 스펙)
- `reference_app/` — 화면 React 참조 + 동작 데모(`index.html`) + 두 템플릿(`App.dc.html`, `Map.dc.html`, 시각 참조용)
