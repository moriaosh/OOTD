# How to Verify HTTPS is Working

## Quick Visual Checks

### 1. Browser Address Bar
- **HTTPS working:** You'll see a lock icon 🔒 in the address bar
- **HTTP (not secure):** You'll see "Not secure" or an info icon ⓘ
- **URL should start with:** `https://` not `http://`

### 2. Browser Developer Tools
1. Open your website
2. Press `F12` (or right-click → Inspect)
3. Go to the **Network** tab
4. Refresh the page
5. Click on any request
6. Look at the **Headers** section:
   - **Request URL** should show `https://`
   - **Protocol** should show `h2` or `http/2.0` (HTTPS)
   - **Status Code** should be `200` or similar

### 3. Check Certificate Details
1. Click the lock icon 🔒 in the address bar
2. Click "Connection is secure" or "Certificate"
3. You should see:
   - Certificate issuer (e.g., "mkcert" for local development)
   - Valid from/to dates
   - Certificate details

## Programmatic Checks

### 1. Check Server Logs
When your server starts, it should log:
```
HTTPS server running on port 5443
```
or
```
Server running on port 5000 (HTTPS enabled)
```

### 2. Test with curl (Command Line)
```powershell
# Test HTTPS endpoint
curl -k https://localhost:5443/api/auth/login

# Or with verbose output to see certificate
curl -v -k https://localhost:5443/api/auth/login
```

The `-k` flag allows self-signed certificates (for development).

### 3. Check in Browser Console
Open browser console (F12) and run:
```javascript
// Check if page is loaded over HTTPS
console.log('Protocol:', window.location.protocol);
// Should output: "Protocol: https:"

// Check if secure context
console.log('Is Secure:', window.isSecureContext);
// Should output: true

// Check current URL
console.log('Current URL:', window.location.href);
// Should start with https://
```

### 4. Test API Endpoints
In browser console or Postman:
```javascript
// This should work over HTTPS
fetch('https://localhost:5443/api/closet/my-items', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('ootd_authToken')}`
  }
})
.then(res => console.log('HTTPS working!', res.status))
.catch(err => console.error('HTTPS error:', err));
```

## Common Issues

### Issue: Browser shows "Not Secure"
**Causes:**
- Server is still running on HTTP
- Certificate not properly installed
- Mixed content (HTTP resources on HTTPS page)

**Solution:**
- Verify server is using HTTPS module
- Check certificate files exist
- Ensure all resources (images, scripts) load over HTTPS

### Issue: "NET::ERR_CERT_AUTHORITY_INVALID"
**Causes:**
- Self-signed certificate not trusted
- mkcert root certificate not installed

**Solution:**
```powershell
# Reinstall mkcert root certificate
mkcert -install
```

### Issue: Connection Refused
**Causes:**
- Server not running
- Wrong port
- Firewall blocking connection

**Solution:**
- Check server is running
- Verify port in server.js matches URL
- Check Windows Firewall settings

## Verification Checklist

- [ ] URL starts with `https://`
- [ ] Lock icon 🔒 visible in address bar
- [ ] Browser console shows `window.location.protocol === 'https:'`
- [ ] Network tab shows `h2` or `http/2.0` protocol
- [ ] No "Not secure" warnings
- [ ] API calls work without CORS errors
- [ ] Server logs show HTTPS server running

## Quick Test Script

Save this as `test-https.html` and open in browser:

```html
<!DOCTYPE html>
<html>
<head>
    <title>HTTPS Test</title>
</head>
<body>
    <h1>HTTPS Verification</h1>
    <div id="results"></div>
    <script>
        const results = document.getElementById('results');
        const checks = {
            'Protocol': window.location.protocol,
            'Is Secure Context': window.isSecureContext,
            'Current URL': window.location.href,
            'Host': window.location.host
        };
        
        let html = '<h2>Results:</h2><ul>';
        for (const [key, value] of Object.entries(checks)) {
            const status = (key === 'Protocol' && value === 'https:') || 
                          (key === 'Is Secure Context' && value === true) 
                          ? '✅' : '❌';
            html += `<li>${status} <strong>${key}:</strong> ${value}</li>`;
        }
        html += '</ul>';
        
        if (window.location.protocol === 'https:') {
            html += '<p style="color: green; font-size: 20px;">✅ HTTPS is working!</p>';
        } else {
            html += '<p style="color: red; font-size: 20px;">❌ Still using HTTP</p>';
        }
        
        results.innerHTML = html;
    </script>
</body>
</html>
```


