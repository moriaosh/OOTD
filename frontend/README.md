# OOTD Frontend - React Application

This is the React frontend for the OOTD (Outfit Of The Day) application.

## Setup Instructions

### 1. Install Dependencies

```bash
cd OOTD/frontend
npm install
```

### 2. Environment Variables (Optional)

Create a `.env` file in the frontend directory if you need to customize the API URL:

```env
VITE_API_URL=http://localhost:5000/api
```

By default, the app uses `http://localhost:5000/api`.

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── ClosetItem.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── UploadModal.jsx
│   ├── contexts/            # React contexts
│   │   └── AuthContext.jsx
│   ├── pages/               # Page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Closet.jsx
│   │   ├── Suggestions.jsx
│   │   └── Profile.jsx
│   ├── services/            # API service layer
│   │   └── api.js
│   ├── App.jsx              # Main app component with routing
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── images/                   # Static images
├── index.html               # HTML template
├── package.json
├── vite.config.js           # Vite configuration
└── tailwind.config.js       # Tailwind CSS configuration
```

## Features

- **Authentication**: Login and registration with JWT tokens
- **Closet Management**: View, add, and manage clothing items
- **Image Upload**: Upload clothing images with preview
- **Outfit Suggestions**: AI-powered outfit recommendations
- **Responsive Design**: Works on desktop and mobile devices
- **RTL Support**: Right-to-left layout for Hebrew content

## API Integration

The frontend integrates with the backend API at `http://localhost:5000/api`:

- `/api/auth/register` - User registration
- `/api/auth/login` - User login
- `/api/closet/my-items` - Get user's clothing items
- `/api/closet/add-item` - Add new clothing item
- `/api/closet/suggestions` - Get outfit suggestions

## Technologies Used

- React 18
- React Router 6
- Vite (build tool)
- Tailwind CSS
- Lucide React (icons)
- Fetch API for HTTP requests


