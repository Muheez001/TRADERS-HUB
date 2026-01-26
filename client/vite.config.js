import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        host: true,
        allowedHosts: ['.ngrok-free.dev', 'siziest-jerold-unpatriarchally.ngrok-free.dev'],
        proxy: {
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true
            },
            '/socket.io': {
                target: 'http://localhost:3001',
                changeOrigin: true,
                ws: true
            }
        }
    }
})
