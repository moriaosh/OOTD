# HTTPS Setup Guide

## Overview
This guide explains how to set up HTTPS for your OOTD application in both development and production environments.

## Current Setup
The server already has basic HTTPS redirect logic for production (see `server.js` lines 9-15).

## Option 1: Development with Self-Signed Certificate (Local Testing)

### Step 1: Install required packages
```bash
npm install --save-dev https
```

### Step 2: Create SSL certificates
You can use `mkcert` (recommended) or OpenSSL:

**Using mkcert (Easiest):**
1. Install mkcert: https://github.com/FiloSottile/mkcert
2. Run:
```bash
mkcert -install
mkcert localhost 127.0.0.1
```
This creates `localhost.pem` and `localhost-key.pem`

**Using OpenSSL:**
```bash
openssl req -x509 -newkey rsa:4096 -nodes -keyout key.pem -out cert.pem -days 365 -subj "/CN=localhost"
```

### Step 3: Update server.js
Create a new file `server-https.js` or modify `server.js`:

```javascript
const https = require('https');
const fs = require('fs');
const express = require('express');
// ... rest of your imports

const app = express();
// ... your middleware and routes

const PORT = process.env.PORT || 5000;
const HTTPS_PORT = process.env.HTTPS_PORT || 5443;

// HTTP server (redirects to HTTPS)
app.listen(PORT, () => {
  console.log(`HTTP server redirecting to HTTPS on port ${PORT}`);
});

// HTTPS server
if (process.env.NODE_ENV === 'development' && fs.existsSync('./localhost.pem')) {
  const options = {
    key: fs.readFileSync('./localhost-key.pem'),
    cert: fs.readFileSync('./localhost.pem')
  };

  https.createServer(options, app).listen(HTTPS_PORT, () => {
    console.log(`HTTPS server running on port ${HTTPS_PORT}`);
  });
} else {
  // Production: use your hosting platform's HTTPS
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
```

## Option 2: Production (Recommended)

### For Cloud Platforms (Heroku, Vercel, Railway, etc.)
Most platforms handle HTTPS automatically:
- **Heroku**: Automatically provides HTTPS
- **Vercel**: Automatically provides HTTPS
- **Railway**: Automatically provides HTTPS
- **Render**: Automatically provides HTTPS

Just deploy your app - HTTPS is handled by the platform!

### For Your Own Server (VPS/Dedicated)

#### Using Nginx Reverse Proxy (Recommended)
1. Install Nginx
2. Install Certbot for Let's Encrypt:
```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
```

3. Get SSL certificate:
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

4. Nginx config (`/etc/nginx/sites-available/ootd`):
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Using PM2 with SSL
```bash
npm install -g pm2
pm2 start server.js
pm2 startup
pm2 save
```

## Option 3: Using Cloudflare (Free SSL)
1. Sign up for Cloudflare
2. Add your domain
3. Update DNS nameservers
4. Enable "Always Use HTTPS" in SSL/TLS settings
5. Cloudflare provides free SSL automatically

## Frontend Configuration

Update your frontend API URL in production:
```env
VITE_API_URL=https://yourdomain.com/api
```

## Testing HTTPS Locally

1. Start your backend with HTTPS
2. Update frontend `.env`:
```env
VITE_API_URL=https://localhost:5443/api
```

3. Browser will show security warning (expected for self-signed cert)
4. Click "Advanced" → "Proceed to localhost"

## Security Headers (Recommended)

Add to your Express app:
```javascript
app.use((req, res, next) => {
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
  }
  next();
});
```

## Notes
- Self-signed certificates are for development only
- Production should use Let's Encrypt or platform-provided SSL
- Always use HTTPS in production for security
- Update CORS settings if needed for HTTPS

