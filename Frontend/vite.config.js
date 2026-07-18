import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Dev-only: the frontend code always talks to same-origin
      // /api and /socket.io paths (see services/api.js, services/socket.js),
      // which is exactly right once the backend serves the built
      // frontend in production. In dev, Vite runs on a separate port
      // from the backend, so proxy those paths to it instead.
      "/api": "http://localhost:3000",
      "/socket.io": {
        target: "http://localhost:3000",
        ws: true,
      },
    },
  },
})
