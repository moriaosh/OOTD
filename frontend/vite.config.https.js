// HTTPS configuration for Vite
// To use: rename this to vite.config.js or merge with existing config

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    https: {
      // Use mkcert certificates if they exist
      key: fs.existsSync(path.resolve(__dirname, '../backend/localhost-key.pem'))
        ? fs.readFileSync(path.resolve(__dirname, '../backend/localhost-key.pem'))
        : undefined,
      cert: fs.existsSync(path.resolve(__dirname, '../backend/localhost.pem'))
        ? fs.readFileSync(path.resolve(__dirname, '../backend/localhost.pem'))
        : undefined,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})

