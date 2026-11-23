import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // バックエンドのCORS許可オリジン（http://localhost:5173）と一致させる
  server: { port: 5173, strictPort: true },
})
