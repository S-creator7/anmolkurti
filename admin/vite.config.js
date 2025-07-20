// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/admin/',          // 👈 absolutely essential for production
  plugins: [react()],
  server: {
    port: 5173              // for local dev only, no effect in prod
  }
})
