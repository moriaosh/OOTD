# HTTPS Setup for React Frontend (Vite)

## Quick Setup

### Option 1: Use mkcert Certificates (Recommended)

1. **Generate certificates** (if you haven't already):
   ```powershell
   cd OOTD\backend
   .\mkcert.exe -install
   .\mkcert.exe localhost 127.0.0.1
   ```

2. **Update vite.config.js** to use HTTPS:
   ```javascript
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'
   import fs from 'fs'
   import path from 'path'

   export default defineConfig({
     plugins: [react()],
     server: {
       port: 3000,
       https: {
         key: fs.readFileSync(path.resolve(__dirname, '../backend/localhost-key.pem')),
         cert: fs.readFileSync(path.resolve(__dirname, '../backend/localhost.pem')),
       },
       proxy: {
         '/api': {
           target: 'http://localhost:5000',
           changeOrigin: true,
         }
       }
     }
   })
   ```

3. **Restart the dev server**:
   ```powershell
   npm run dev
   ```

4. **Access the app**:
   - Go to: `https://localhost:3000`
   - Browser will show a security warning (expected for self-signed cert)
   - Click "Advanced" → "Proceed to localhost"

### Option 2: Simple HTTP (Current - No HTTPS)

If you want to keep using HTTP for now, just use:
- `http://localhost:3000`

The backend can still use HTTPS separately if needed.

## Verify HTTPS

1. Check the URL bar - should show `https://` and a lock icon
2. Open browser console and run:
   ```javascript
   console.log('Protocol:', window.location.protocol);
   // Should output: "Protocol: https:"
   ```

## Notes

- For production, HTTPS is usually handled by your hosting platform
- Development HTTPS is optional but recommended for testing
- The proxy will still forward API calls to the backend (even if backend uses HTTP)

