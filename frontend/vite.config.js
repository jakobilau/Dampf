import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [react(),
  VitePWA({
    registerType: 'autoUpdate',

    manifest: {
      name: "Dampf",
      short_name: "Dampf",
      description: "Unsere Webanwendung",

      start_url: "/",
      scope: "/",

      display: "standalone",
      display_override: ["window-controls-overlay", "standalone"],

      theme_color: "#0f0f0f",
      background_color: "#0f0f0f",

      icons: [
        {
          src: "/pwa-192x192.png",
          sizes: "192x192",
          type: "image/png"
        },
        {
          src: "/pwa-512x512.png",
          sizes: "512x512",
          type: "image/png"
        },
        {
          src: "/pwa-512x512-maskable.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable"
        }
      ]
    }
  })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})

