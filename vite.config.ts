import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Served from https://<user>.github.io/myring/
export default defineConfig({
  plugins: [react()],
  base: '/myring/',
})
