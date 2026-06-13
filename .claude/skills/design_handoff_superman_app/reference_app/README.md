# 나의 슈퍼맨 — App UI Kit

Interactive, high-fidelity recreation of the **나의 슈퍼맨 (My Superman)** mobile
app: an AI safe-companion that walks you home, deters threats over a natural
AI call, and auto-reports emergencies with evidence.

Open **`index.html`** for the click-through demo (renders inside a 390px phone frame).

## Flow

- **메인 / 홈 (Home)** — `HomeScreen.jsx`. A 전화번호부-style roster of call personas
  (엄마 · 경찰 톤 · 연인 · 직장 상사), a big "지금 바로 동행 시작" CTA, and scheduled
  companions. Tap any persona → starts a call. Bottom tab: 메인.
- **지도 (Map)** — `MapScreen.jsx`. Nearby **CCTV** and **안심 지킴이 집** (safe-house)
  locations on a stylized map: filter chips, pins, live user location, a
  current-location button, and a bottom sheet listing safe spots by distance.
- **통화 (Call)** — `CallScreen.jsx`. Live AI companion call: pulsing persona
  avatar, running timer, rotating AI captions, mic/video/speaker controls, and a
  red **위급 · 신고** action.
- **신고 안내 모달 (Report)** — `ReportModal.jsx`. Danger-tone bottom sheet with a
  10-second cancellable countdown and an evidence summary (녹음 · 위치). Built on the
  `Dialog` primitive.
- **설정 (Settings)** — `SettingsScreen.jsx`. Profile, grouped safety toggles
  (자동 신고 · 위치 공유 · 사이렌 · 세이프워드), guardians, and call defaults.

## Composition

Every screen is assembled from the published primitives (`window.DesignSystem_b303af`):
`Button · Avatar · Badge · Switch · ListItem / ListDivider · Card · Dialog`.
Local-only helpers: `PhoneFrame.jsx` (device shell), `BottomNav.jsx` (메인·지도·설정 tabs), and `Icons.jsx` (Lucide vectors).

Babel-transpiled scripts don't share scope, so each file ends with
`Object.assign(window, { … })` to publish its components for the next script.

> This is a recreation for design reference, not production code — telephony,
> detection, and reporting are faked client-side.
