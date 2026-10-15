
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    host: '0.0.0.0',
    port: 5173,

    proxy: {
      // ESP32 1 — Sensores e LEDs
      '/api/sensores': {
        target: 'http://192.168.4.1',
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/api\/sensores/, '/api'),
      },

      // ESP32 2 — Cancela
      '/api/cancela': {
        target: 'http://192.168.4.2',
        changeOrigin: true,
      },
    },
  },
})
