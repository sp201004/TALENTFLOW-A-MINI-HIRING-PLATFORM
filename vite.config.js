import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    // Allow any available port - no strictPort restriction
    port: 5173, // Preferred port, but will try others if busy
  }
})
