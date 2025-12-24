# Social Feed Feature - Setup Guide

## Overview
This guide will help you set up the new Social Feed feature that allows users to upload outfit photos with privacy controls.

## Database Migration

After updating the Prisma schema, you need to create and apply a migration:

```bash
cd OOTD/backend
npx prisma migrate dev --name add_social_feed
```

This will:
1. Create a new migration file
2. Apply the migration to your database
3. Generate the updated Prisma Client

## Verify the Migration

After running the migration, verify that the `Post` table was created:

```bash
npx prisma studio
```

Or check your database directly - you should see a new `Post` table with the following fields:
- `id` (UUID)
- `userId` (String, foreign key to User)
- `imageUrl` (String)
- `caption` (String)
- `isPublic` (Boolean, default: false)
- `createdAt` (DateTime)

## API Endpoints

### POST /api/posts
Create a new post (requires authentication)
- **Body**: FormData with:
  - `image`: Image file
  - `caption`: String
  - `isPublic`: Boolean (true/false)
- **Response**: Created post with user info (name only, no password/email)

### GET /api/posts/feed
Get public feed (no authentication required)
- **Response**: Array of public posts ordered by createdAt (descending)
- **User data**: Only includes firstName, lastName, id (no password/email)

### GET /api/posts/my-posts
Get user's own posts (requires authentication)
- **Response**: Array of user's posts (both public and private)

## Frontend Routes

- `/feed` - Public feed page (accessible to everyone)
- Create Post button appears in the feed header for authenticated users

## Features

1. **Privacy Toggle**: Users can choose if a post is:
   - **Public**: Visible to everyone in the feed
   - **Private**: Visible only to the user in their profile

2. **Image Upload**: 
   - Supports common image formats
   - Max file size: 5MB
   - Images are uploaded to Cloudinary
   - Stored in folder: `ootd-posts/{userId}`

3. **Feed Display**:
   - Pinterest-style responsive grid layout
   - Shows image, caption, author name, and timestamp
   - Only displays posts where `isPublic = true`

## Security Notes

- User passwords and emails are **never** returned in post responses
- Only `firstName`, `lastName`, and `id` are included in user data
- Posts require authentication to create
- Public feed is accessible without authentication (read-only)

## Testing

1. **Create a Post**:
   - Log in to your account
   - Navigate to `/feed`
   - Click "צור פרסום חדש"
   - Upload an image, add a caption
   - Toggle "Share to Public Feed" on/off
   - Submit

2. **View Public Feed**:
   - Navigate to `/feed` (no login required)
   - You should see all posts where `isPublic = true`

3. **View Your Posts**:
   - The `getMyPosts` endpoint can be used to show user's own posts in their profile

## Troubleshooting

### Migration fails
- Make sure your database is running
- Check that `DATABASE_URL` in `.env` is correct
- Ensure you have the latest Prisma Client: `npx prisma generate`

### Images not uploading
- Verify Cloudinary credentials in `.env`:
  - `CLOUDINARY_NAME`
  - `CLOUDINARY_KEY`
  - `CLOUDINARY_SECRET`

### Posts not appearing in feed
- Check that `isPublic` is set to `true` when creating the post
- Verify the post was created successfully (check database)
- Ensure the feed endpoint is returning data (check browser network tab)

