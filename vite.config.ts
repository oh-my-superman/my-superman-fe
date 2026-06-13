import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  // Expose `API_*` env vars to client code in addition to Vite's default
  // `VITE_*` (so `import.meta.env.API_BASE_URL` is available).
  envPrefix: ['VITE_', 'API_'],
  // Nitro auto-detects the Vercel build environment and emits the Build Output API
  // format, so no Vercel-specific config is needed beyond this plugin.
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart(),
    nitro(),
    viteReact(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      outDir: '.output/public',
      workbox: {
        globDirectory: '.output/public',
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
      manifest: {
        name: '나의 슈퍼맨',
        short_name: '나의 슈퍼맨',
        description: '도움이 필요한 곳에 나타나는 나의 슈퍼맨',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/image/superman_app_icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
          {
            src: '/logo192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/logo512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
})

export default config
