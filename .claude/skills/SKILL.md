---
name: superman-design
description: Use this skill to generate well-branded interfaces and assets for 나의 슈퍼맨 (My Superman), an AI safe-companion service — either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick orientation

- **Brand**: warm AI safe-companion. One brand color — coral `#f08080`. Tone is a reassuring companion in 해요체 Korean; clear and decisive in emergency/report contexts. Never fear-mongering.
- **Foundations**: `styles.css` is the entry point (link it). Tokens live in `tokens/` (coral scale, warm neutrals, reserved status colors, Pretendard type, soft radii, warm shadows).
- **Type**: Pretendard Variable (CDN). **Icons**: Lucide, 2px stroke (curated in `ui_kits/app/Icons.jsx`).
- **Components** (`components/core/`): Button · Avatar · Badge · Card · Switch · Dialog · ListItem. Each has a `.prompt.md` with usage. Mount from `window.DesignSystem_b303af` after loading `_ds_bundle.js`.
- **UI kit** (`ui_kits/app/`): mobile app — home (persona roster), call, report modal, settings. `index.html` is the interactive demo; mirror its structure for new screens.

## Rules of thumb

- Mobile-first, 390px phone frame, 44px touch targets, full-width bottom primary action.
- Coral for brand/affirmative; emergency red ONLY for 위급/신고. Keep them visually separate.
- Warm-white surface canvas with floating cards; coral gradient reserved for the start-call CTA and call screen.
- Don't hand-draw SVG icons or generate images — reuse Lucide and the existing assets; ask for a real logo if needed.
