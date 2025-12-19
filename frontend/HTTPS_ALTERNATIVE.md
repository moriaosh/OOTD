# HTTPS Alternatives for Development

Since mkcert installation can be tricky, here are simpler alternatives:

## Option 1: Skip HTTPS for Development (Recommended)
- **Pros**: Simplest, no setup needed
- **Cons**: Browser may show "Not Secure" warning
- **Use**: Just use `http://localhost:3000` - it's fine for local development!

## Option 2: Use ngrok (Tunnel with HTTPS)
1. Install ngrok: https://ngrok.com/download
2. Run your frontend: `npm run dev` (on port 3000)
3. In another terminal: `ngrok http 3000`
4. Use the HTTPS URL ngrok provides

## Option 3: Use Cloudflare Tunnel (Free)
1. Install cloudflared: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
2. Run: `cloudflared tunnel --url http://localhost:3000`
3. Use the HTTPS URL provided

## For Production
- Most hosting platforms (Vercel, Netlify, Heroku) automatically provide HTTPS
- No need to set it up manually!

## Current Setup
The app is now configured to use HTTP by default, which is perfectly fine for development. When you deploy to production, your hosting provider will handle HTTPS automatically.

