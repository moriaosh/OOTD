# Fix Posts Errors - Quick Guide

## Error 1: `Cannot read properties of undefined (reading 'findMany')`

**Cause**: The `Post` table doesn't exist in your database yet. You need to run the Prisma migration.

**Solution**:
```bash
cd OOTD/backend
npx prisma migrate dev --name add_social_feed
```

This will:
- Create the `Post` table in your database
- Generate the updated Prisma Client with the Post model

After running this, restart your backend server.

---

## Error 2: `CLOUDINARY UPLOAD ERROR: Error: Must supply api_key`

**Cause**: Cloudinary environment variables are missing or have incorrect names.

**Solution**: Check your `.env` file in `OOTD/backend/.env` and make sure you have:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Note**: The variable names must be exactly:
- `CLOUDINARY_CLOUD_NAME` (not `CLOUDINARY_NAME`)
- `CLOUDINARY_API_KEY` (not `CLOUDINARY_KEY`)
- `CLOUDINARY_API_SECRET` (not `CLOUDINARY_SECRET`)

If you have different variable names in your `.env`, either:
1. Rename them to match the above, OR
2. Update the values in your `.env` file

After updating `.env`, restart your backend server.

---

## Quick Fix Steps:

1. **Run the migration**:
   ```bash
   cd OOTD/backend
   npx prisma migrate dev --name add_social_feed
   ```

2. **Check your `.env` file** for Cloudinary variables:
   ```bash
   # Make sure these exist:
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   ```

3. **Restart your backend server**

4. **Test again** - the errors should be resolved!

---

## Verify Everything Works:

1. Check that the migration ran successfully:
   ```bash
   npx prisma studio
   ```
   You should see a `Post` table in the database.

2. Test the feed endpoint:
   - Navigate to `/feed` in your frontend
   - It should load without errors (even if empty)

3. Test creating a post:
   - Log in
   - Click "צור פרסום חדש"
   - Upload an image and create a post
   - It should work without Cloudinary errors

