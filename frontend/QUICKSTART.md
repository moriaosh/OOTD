# Quick Start Guide

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend server running on port 5000

## Setup Steps

1. **Navigate to frontend directory:**
   ```bash
   cd OOTD/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## Backend Setup

Make sure the backend server is running:

```bash
cd OOTD/backend
npm install
npm start
```

The backend should be running on `http://localhost:5000`

## Features to Test

1. **Registration**: Create a new account at `/register`
2. **Login**: Sign in at `/login`
3. **Add Items**: Upload clothing items with images
4. **View Closet**: Browse your clothing items
5. **Get Suggestions**: Get AI-powered outfit recommendations

## Troubleshooting

### Images not loading
- Make sure images are in the `public/images` folder
- Check browser console for 404 errors

### API connection errors
- Verify backend is running on port 5000
- Check CORS settings in backend
- Verify JWT token is being stored in localStorage

### Build errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Check Node.js version (should be v16+)


