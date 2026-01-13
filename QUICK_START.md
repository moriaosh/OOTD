# OOTD - Quick Start Guide

## 🚀 Start Servers

### Terminal 1 - Backend:
```bash
cd C:\Users\Moria\Documents\OOTD\OOTD\backend
npm run dev
```
Expected output: `🚀 שרת OOTD רץ על פורט 5000`

### Terminal 2 - Frontend:
```bash
cd C:\Users\Moria\Documents\OOTD\OOTD\frontend
npm run dev
```
Expected output: `Local: http://localhost:3000/` (or 3001/3002/3003)

---

## ⚠️ If Backend Won't Start

**Error**: `[nodemon] clean exit - waiting for changes before restart`

**Fix**:
```bash
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill it (replace <PID> with actual number)
taskkill //F //PID <PID>

# Restart backend
npm run dev
```

---

## ⚠️ If You Get CORS Errors

**Error**: `blocked by CORS policy: No 'Access-Control-Allow-Origin' header`

**Fix**:
1. Check which port frontend is running on (e.g., 3002)
2. Open `backend/server.js`
3. Make sure that port is in the CORS list (line 45-50):
   ```javascript
   origin: [
     'http://localhost:3000',
     'http://localhost:3001',
     'http://localhost:3002',
     'http://localhost:3003'  // Add if needed
   ]
   ```
4. Save file (nodemon will auto-restart)
5. Refresh browser

---

## 📂 Important Files

- **Session Log**: `SESSION_LOG.md` - Complete details of everything
- **Bulk Upload Guide**: `BULK_UPLOAD_GUIDE.md` - Excel format
- **Backend Env**: `backend/.env` - Database & API keys
- **CORS Config**: `backend/server.js:44-51`

---

## ✅ New Features Location

1. **Edit/Delete Items**: Closet page → Hover over item → Click icons
2. **Laundry Toggle**: Closet page → Hover → Washing machine icon
3. **Backup/Restore**: Profile page → "גיבוי ושחזור נתונים"
4. **Bulk Upload**: Closet page → "העלאה מרובה" button
5. **Purchase Advisor**: Closet page → "יועץ קניות" button OR `/purchase-advisor`
6. **Save Outfits**: Suggestions page → "שמור לוק" button
7. **View Saved Outfits**: Favorites page (completely redesigned)

---

## 🆘 Emergency: Kill All Node Processes

If everything is messed up:
```bash
taskkill //F //IM node.exe
```

Then restart both servers fresh.

---

**Full details**: See `SESSION_LOG.md`
