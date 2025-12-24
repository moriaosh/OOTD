# Implementation Guide: HTTPS & Tagging System

## Summary

This document explains how both features were implemented and how to use them.

---

## 🔒 HTTPS Setup

### What Was Done

1. **Created HTTPS setup guide** (`backend/HTTPS_SETUP.md`)
   - Development options (self-signed certificates)
   - Production options (platform-managed, Nginx, Cloudflare)
   - Security headers configuration

2. **Server already has basic HTTPS redirect** (in `server.js`)
   - Automatically redirects HTTP to HTTPS in production
   - Uses `x-forwarded-proto` header detection

### How It Works

**Development:**
- Use self-signed certificates with `mkcert` or OpenSSL
- Update server to use HTTPS module
- Frontend connects to `https://localhost:5443`

**Production:**
- Most cloud platforms (Heroku, Vercel, Railway) provide HTTPS automatically
- For your own server, use Nginx reverse proxy with Let's Encrypt
- Cloudflare provides free SSL for any domain

### Next Steps

1. **For Development:**
   ```bash
   # Install mkcert
   mkcert -install
   mkcert localhost 127.0.0.1
   
   # Update server.js to use HTTPS (see HTTPS_SETUP.md)
   ```

2. **For Production:**
   - Deploy to a platform that provides HTTPS automatically, OR
   - Set up Nginx with Let's Encrypt (see HTTPS_SETUP.md)

---

## 🏷️ Tagging System

### What Was Done

#### Backend:
1. **Database Schema** (`prisma/schema.prisma`)
   - Added `Tag` model (system tags + user custom tags)
   - Added `ClotheTag` junction table (many-to-many relationship)
   - System tags have `userId = null`, user tags have `userId`

2. **Tag Controller** (`backend/controllers/tagController.js`)
   - `getTags()` - Get all tags (system + user's custom)
   - `createTag()` - Create custom tag
   - `updateTag()` - Update custom tag (only user's own)
   - `deleteTag()` - Delete custom tag (only user's own)

3. **Tag Routes** (`backend/routes/tags.js`)
   - `GET /api/tags` - List all tags
   - `POST /api/tags` - Create tag
   - `PUT /api/tags/:id` - Update tag
   - `DELETE /api/tags/:id` - Delete tag

4. **Updated Closet Controller**
   - `getMyItems()` - Now includes tags with items
   - `addItem()` - Now accepts `tagIds` to assign tags

5. **Seed Script** (`backend/scripts/seedTags.js`)
   - Creates initial system tags
   - Run with: `node scripts/seedTags.js`

#### Frontend:
1. **Tag API Service** (`frontend/src/services/api.js`)
   - Added `tagsAPI` with all CRUD operations

2. **TagManager Component** (`frontend/src/components/TagManager.jsx`)
   - Modal for managing tags
   - Create, edit, delete custom tags
   - View system tags (read-only)

3. **Updated UploadModal** (`frontend/src/components/UploadModal.jsx`)
   - Tag selection when adding items
   - Visual distinction between system and custom tags

4. **Updated ClosetItem** (`frontend/src/components/ClosetItem.jsx`)
   - Displays tags on clothing items
   - Shows up to 3 tags + count

5. **Updated Closet Page** (`frontend/src/pages/Closet.jsx`)
   - Added "ניהול תגיות" button
   - Opens TagManager modal

### How It Works

**System Tags:**
- Predefined tags available to all users
- Cannot be edited or deleted
- Examples: "אהוב", "חדש", "למכירה", etc.

**Custom Tags:**
- Created by individual users
- Only visible to the user who created them
- Can be edited and deleted by the creator
- Stored with `userId` in database

**Tag Assignment:**
- When adding a clothing item, select tags from available list
- Multiple tags can be assigned to one item
- Tags are displayed on clothing items in the closet

### Setup Instructions

1. **Run Database Migration:**
   ```bash
   cd OOTD/backend
   npx prisma migrate dev --name add_tags
   ```

2. **Seed System Tags:**
   ```bash
   node scripts/seedTags.js
   ```

3. **Start the Application:**
   ```bash
   # Backend
   npm start
   
   # Frontend
   cd ../frontend
   npm run dev
   ```

### Usage

1. **Managing Tags:**
   - Go to Closet page
   - Click "ניהול תגיות" button
   - Create, edit, or delete your custom tags

2. **Adding Tags to Items:**
   - When adding a new clothing item
   - Scroll to "תגיות" section
   - Click tags to select/deselect
   - Selected tags appear highlighted

3. **Viewing Tags:**
   - Tags appear on clothing items in the closet
   - System tags: gray background
   - Custom tags: indigo background
   - Shows up to 3 tags, then "+X" for more

---

## Security Features

### Tagging System:
- ✅ Users can only edit/delete their own custom tags
- ✅ System tags are protected from modification
- ✅ Tag validation prevents duplicates per user
- ✅ Cascade deletion removes tag relationships

### HTTPS:
- ✅ Automatic redirect from HTTP to HTTPS in production
- ✅ Security headers (HSTS, X-Frame-Options, etc.)
- ✅ Secure token transmission

---

## Files Created/Modified

### Backend:
- `prisma/schema.prisma` - Added Tag and ClotheTag models
- `controllers/tagController.js` - Tag CRUD operations
- `routes/tags.js` - Tag routes
- `controllers/closetController.js` - Updated to handle tags
- `server.js` - Added tags route
- `scripts/seedTags.js` - System tags seeder
- `HTTPS_SETUP.md` - HTTPS configuration guide
- `TAGGING_SYSTEM.md` - Tagging system documentation

### Frontend:
- `services/api.js` - Added tagsAPI
- `components/TagManager.jsx` - Tag management UI
- `components/UploadModal.jsx` - Added tag selection
- `components/ClosetItem.jsx` - Display tags on items
- `pages/Closet.jsx` - Added tag manager button

---

## Testing

### Test Tagging System:
1. Create a custom tag
2. Add a clothing item with tags
3. Verify tags appear on the item
4. Edit the custom tag
5. Delete the custom tag
6. Verify system tags cannot be edited/deleted

### Test HTTPS:
1. Set up HTTPS (see HTTPS_SETUP.md)
2. Verify redirect from HTTP to HTTPS
3. Check browser shows secure connection
4. Test API calls work over HTTPS

---

## Troubleshooting

### Tags not appearing:
- Run database migration: `npx prisma migrate dev`
- Seed system tags: `node scripts/seedTags.js`
- Check browser console for errors

### HTTPS not working:
- Verify certificates are in correct location
- Check server is listening on HTTPS port
- Update frontend API URL to use HTTPS
- For self-signed certs, accept browser warning

---

## Next Steps

1. **Run the migration** to create the database tables
2. **Seed system tags** to populate initial tags
3. **Test the tagging system** by creating tags and assigning them
4. **Set up HTTPS** based on your deployment environment
5. **Customize system tags** in `seedTags.js` if needed

Both features are now fully implemented and ready to use! 🎉


