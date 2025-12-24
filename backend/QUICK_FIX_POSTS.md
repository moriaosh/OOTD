# Quick Fix for Posts Error

## The Problem
You're getting: `Cannot read properties of undefined (reading 'findMany')`

This means `prisma.post` is undefined, which happens when:
1. The Prisma Client hasn't been regenerated after adding the Post model
2. The server is using a cached/old version of Prisma Client
3. The migration hasn't been run yet

## Solution (Do These Steps in Order):

### Step 1: Stop Your Backend Server
**IMPORTANT**: You MUST stop the backend server first, otherwise Prisma can't regenerate the client.

Press `Ctrl+C` in the terminal where your backend is running.

### Step 2: Regenerate Prisma Client
```bash
cd OOTD/backend
npx prisma generate
```

This updates the Prisma Client to include the new `Post` model.

### Step 3: Run the Migration
```bash
npx prisma migrate dev --name add_social_feed
```

This creates the `Post` table in your database.

### Step 4: Restart Your Backend Server
```bash
node server.js
# or
npm start
```

### Step 5: Test
- Navigate to `/feed` in your frontend
- The error should be gone!

---

## If It Still Doesn't Work:

1. **Check if Post model exists in Prisma Client**:
   ```bash
   cd OOTD/backend
   npx prisma studio
   ```
   You should see a `Post` table in the database viewer.

2. **Verify your .env file** has the correct database URL:
   ```env
   DATABASE_URL="postgresql://..."
   ```

3. **Clear node_modules cache** (if needed):
   ```bash
   cd OOTD/backend
   rm -rf node_modules/.prisma
   npx prisma generate
   ```

---

## Why This Happens:
When you add a new model to `schema.prisma`, you need to:
1. Generate the Prisma Client (`npx prisma generate`) - updates the TypeScript types and client code
2. Run the migration (`npx prisma migrate dev`) - creates the actual database table
3. Restart the server - so it loads the new Prisma Client

The server caches the Prisma Client when it starts, so if you don't restart it, it will keep using the old version without the `Post` model.

