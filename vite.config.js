import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Patriot Smart Aquaponik',
        short_name: 'Patriot IoT',
        description: 'Dashboard Pemantau Aquaponik Terpadu',
        theme_color: '#0f2847',
        background_color: '#f3f4f6',
        display: 'standalone',
        icons: [
          // Nanti Anda perlu menaruh logo berukuran 192x192 dan 512x512 ke dalam folder public/
          {
            src: '/logo192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logo512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
