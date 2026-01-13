# OOTD Project Cleanup Report

## 🗑️ Files to Delete

### 1. Old HTML Files (Non-React, No Longer Used)
**Location**: `frontend/` root
These are old static HTML files from before React migration:
- `add-item.html`
- `closet.html`
- `favorites.html`
- `home.html`
- `index.html`
- `login.html`
- `profile.html`
- `register.html`

**Status**: ❌ Delete - React components replaced these

---

### 2. Old JavaScript Files
**Location**: `frontend/js/`
These went with the old HTML files:
- `js/add-item.js`
- `js/app.js`
- `js/favorites.js`

**Status**: ❌ Delete - React components replaced these

---

### 3. Old CSS Files
**Location**: `frontend/css/`
Old styles before Tailwind:
- `css/styles.css`

**Status**: ❌ Delete - Using Tailwind now

---

### 4. Legacy/Old React Files
**Location**: `frontend/src/`
- `src/pages/WeeklyPlannerOld.jsx` - Old version, replaced by current WeeklyPlanner.jsx
- `src/styles/legacy.css` - Legacy styles
- `app.jsx` (root level) - Duplicate of src/App.jsx
- `components/ClosetDisplay.jsx` (root level) - Old component

**Status**: ❌ Delete - Replaced by newer versions

---

### 5. Duplicate Image Folders
**Location**: `frontend/`
Same images exist in TWO places:
- `images/` (root level) ❌ DELETE THIS
- `public/images/` (correct location) ✅ KEEP THIS

**Files duplicated**:
- categories/accessories.png
- categories/bottoms.png
- categories/dresses.png
- categories/outerwear.png
- categories/shoes.png
- categories/tops.png
- default-profile.png
- OOTD.png
- Gemini_Generated_Image_ptx2esptx2esptx2.png (also not needed)

**Status**: ❌ Delete `frontend/images/` folder entirely

---

### 6. Old/Duplicate Backend Controllers & Routes
**Location**: `backend/controllers/` and `backend/routes/`

**Duplicate/Unused**:
- `controllers/items.controller.js` - Old duplicate (uses prisma.item instead of prisma.clothe)
- `routes/items.routes.js` - Goes with above

**Status**: ❌ Delete - Replaced by closetController.js

---

### 7. Temporary/System Files
**Location**: Various
- `backend/nul` - Windows temp file
- `frontend/nul` - Windows temp file
- `backend/server.log` - Log file (regenerates automatically)

**Status**: ❌ Delete - Temp files

---

### 8. HTTPS Setup Files (If Not Using HTTPS)
**Location**: Various

If you're not using HTTPS locally (just HTTP):
- `backend/HTTPS_SETUP.md`
- `backend/INSTALL_MKCERT_WINDOWS.md`
- `backend/test-https.js`
- `frontend/HTTPS_SETUP_FRONTEND.md`
- `frontend/HTTPS_ALTERNATIVE.md`
- `frontend/vite.config.https.js`

**Status**: ⚠️ **Keep if using HTTPS, Delete if not**

---

### 9. Outdated Documentation Files
**Location**: Root and backend

These docs describe features already implemented or are outdated:
- `FAVORITES_FEATURE.md` - Feature already implemented
- `FRONTEND_INTEGRATION_GUIDE.md` - Already integrated
- `IMPLEMENTATION_GUIDE.md` - Already implemented
- `backend/FIX_POSTS_ERRORS.md` - Temporary fix doc
- `backend/QUICK_FIX_POSTS.md` - Temporary fix doc
- `backend/TEST_POST_ROUTES.md` - Test doc
- `backend/PURCHASE_API_TEST.md` - Test doc (can keep if useful)
- `backend/SOCIAL_FEED_SETUP.md` - Setup already done
- `backend/TAGGING_SYSTEM.md` - System already implemented

**Status**: ⚠️ **Optional Delete** - Can keep if you want reference

---

### 10. TypeScript Config (If Not Using TypeScript)
**Location**: `backend/`
- `tsconfig.json` - TypeScript config but project uses JavaScript

**Status**: ⚠️ Check if needed, probably delete

---

## ✅ Files to Keep

### Important Files:
- `SESSION_LOG.md` ✅ - Complete project documentation (I just created)
- `QUICK_START.md` ✅ - Quick reference guide (I just created)
- `BULK_UPLOAD_GUIDE.md` ✅ - User guide for Excel upload
- `backend/.env` ✅ - Environment variables (KEEP!)
- `backend/.env.example` ✅ - Example for version control
- `backend/ootd-collection.json` ✅ - API testing collection
- `frontend/QUICKSTART.md` ✅ - Quick reference
- `frontend/README.md` ✅ - Project docs
- `.gitignore` files ✅ - Important for git

---

## 📊 Cleanup Summary

**Total Files to Delete**: ~35-45 files
**Disk Space to Save**: ~2-5 MB (mostly duplicate images)
**Result**: Cleaner, more organized project structure

---

## ⚡ Quick Cleanup Commands

### Safe Cleanup (Recommended):
```bash
# Navigate to project
cd C:/Users/Moria/Documents/OOTD/OOTD

# Delete old HTML files
rm frontend/*.html

# Delete old JS folder
rm -rf frontend/js

# Delete old CSS folder
rm -rf frontend/css

# Delete duplicate images folder
rm -rf frontend/images

# Delete old components
rm frontend/app.jsx
rm frontend/components/ClosetDisplay.jsx

# Delete legacy files
rm frontend/src/pages/WeeklyPlannerOld.jsx
rm frontend/src/styles/legacy.css

# Delete old backend controllers/routes
rm backend/controllers/items.controller.js
rm backend/routes/items.routes.js

# Delete temp files
rm backend/nul
rm frontend/nul
rm backend/server.log

# Delete TypeScript config (if not using TS)
rm backend/tsconfig.json
```

### Optional - Delete Documentation:
```bash
rm FAVORITES_FEATURE.md
rm FRONTEND_INTEGRATION_GUIDE.md
rm IMPLEMENTATION_GUIDE.md
rm backend/FIX_POSTS_ERRORS.md
rm backend/QUICK_FIX_POSTS.md
rm backend/TEST_POST_ROUTES.md
rm backend/SOCIAL_FEED_SETUP.md
rm backend/TAGGING_SYSTEM.md
```

### Optional - Delete HTTPS Files (if not using):
```bash
rm backend/HTTPS_SETUP.md
rm backend/INSTALL_MKCERT_WINDOWS.md
rm backend/test-https.js
rm frontend/HTTPS_SETUP_FRONTEND.md
rm frontend/HTTPS_ALTERNATIVE.md
rm frontend/vite.config.https.js
```

---

## 🎯 Improved Project Structure

**After cleanup, your structure will be**:

```
OOTD/
├── backend/
│   ├── controllers/        (only active controllers)
│   ├── routes/            (only active routes)
│   ├── prisma/
│   ├── middleware/
│   ├── utils/
│   ├── scripts/
│   ├── .env
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── images/        (ONLY images folder)
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── SESSION_LOG.md         (your complete guide)
├── QUICK_START.md
├── BULK_UPLOAD_GUIDE.md
└── .gitignore
```

**Much cleaner! 🎉**

---

## ⚠️ Before You Delete

1. **Commit current state to git** (if using git):
   ```bash
   git add .
   git commit -m "Before cleanup"
   ```

2. **Or create a backup**:
   ```bash
   # From OOTD folder
   cd ..
   tar -czf OOTD_backup.tar.gz OOTD/
   # Or just copy the folder
   ```

3. **Then run the cleanup commands**

4. **Test that everything still works**:
   - Backend: `npm run dev`
   - Frontend: `npm run dev`
   - Test main features

---

**Ready to clean up? Let me know and I'll run these commands for you!**
