# OOTD - Outfit Of The Day

A smart wardrobe management application that helps you organize your closet, get AI-powered outfit suggestions based on weather, and plan packing lists for trips.

## Features

### Closet Management
- Upload and organize clothing items with categories, colors, seasons, and occasions
- Tag items with custom labels
- Track items in laundry
- Mark favorite items
- Bulk upload from Excel/CSV
- Backup and restore your wardrobe data

### AI-Powered Outfit Suggestions
- Get personalized outfit recommendations based on current weather
- Smart color matching and style combinations
- Suggestions cached in database to save API tokens
- Support for different occasions (casual, formal, business, etc.)

### Smart Trip Packing
- AI-generated packing lists based on destination, activities, and trip duration
- Weather-aware recommendations
- Matches items from your existing wardrobe
- Suggests items you might need to buy
- Multiple packing styles (Minimalist, Standard, Extended)

### Color Analysis
- AI-powered analysis of your skin tone and features
- Personalized color recommendations
- Seasonal color palette suggestions

### Weekly Outfit Planner
- Plan your outfits for the entire week
- Visual calendar view

### Social Features
- Share your outfits with the community
- Public/private post settings

### Statistics
- View wardrobe analytics
- Category breakdown
- Color distribution
- Season and occasion stats

## Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS
- Lucide React icons

### Backend
- Node.js with Express
- Prisma ORM
- PostgreSQL database

### AI Services
- Google Gemini AI for outfit suggestions and packing lists
- OpenWeather API for weather data

### Cloud Services
- Cloudinary for image storage

### DevOps
- Docker & Docker Compose
- Nginx reverse proxy

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Environment Variables

Create a `.env` file in the `backend` folder:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ootd_db?schema=public"

# JWT
JWT_SECRET=your-secret-key-here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# AI Services
GEMINI_API_KEY=your-gemini-api-key
OPENWEATHER_API_KEY=your-openweather-api-key
```

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ootd.git
   cd ootd
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

3. **Setup database**
   ```bash
   cd backend
   npx prisma migrate deploy
   npx prisma generate
   ```

4. **Start development servers**
   ```bash
   # Backend (from backend folder)
   npm run dev

   # Frontend (from frontend folder)
   npm run dev
   ```

5. **Access the app**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

### Docker Deployment

1. **Create environment file**

   Create a `.env` file in the project root:
   ```env
   DB_USER=ootd_user
   DB_PASS=your-secure-password
   DB_NAME=ootd_db
   JWT_SECRET=your-jwt-secret
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   GEMINI_API_KEY=your-gemini-key
   OPENWEATHER_API_KEY=your-weather-key
   ```

2. **Build and run**
   ```bash
   docker-compose up -d --build
   ```

3. **Access the app**
   - Application: http://localhost:3000

4. **Stop containers**
   ```bash
   docker-compose down
   ```

## Project Structure

```
OOTD/
├── backend/
│   ├── controllers/      # Route handlers
│   ├── middleware/       # Auth middleware
│   ├── prisma/          # Database schema & migrations
│   ├── routes/          # API routes
│   ├── utils/           # Helper services (weather, AI, etc.)
│   └── server.js        # Express app entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── contexts/    # React contexts (Auth)
│   │   ├── pages/       # Page components
│   │   ├── services/    # API service layer
│   │   ├── styles/      # CSS files
│   │   └── utils/       # Helper functions
│   └── index.html
├── tests/               # Selenium tests
├── docker-compose.yml   # Docker configuration
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Closet
- `GET /api/closet/my-items` - Get user's clothing items
- `POST /api/closet/add-item` - Add new item
- `PUT /api/closet/:id` - Update item
- `DELETE /api/closet/:id` - Delete item
- `PATCH /api/closet/:id/laundry` - Toggle laundry status
- `GET /api/closet/suggestions` - Get AI outfit suggestions
- `GET /api/closet/statistics` - Get wardrobe statistics
- `GET /api/closet/backup` - Download backup
- `POST /api/closet/restore` - Restore from backup

### Trips
- `POST /api/trips/generate` - Generate packing list
- `GET /api/trips/my-trips` - Get user's trips
- `GET /api/trips/:tripId` - Get specific trip
- `DELETE /api/trips/:tripId` - Delete trip

### Tags
- `GET /api/tags` - Get user's tags
- `POST /api/tags` - Create tag
- `PUT /api/tags/:id` - Update tag
- `DELETE /api/tags/:id` - Delete tag

### Outfits
- `GET /api/outfits` - Get saved outfits
- `POST /api/outfits` - Save outfit
- `DELETE /api/outfits/:id` - Delete outfit

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) for AI-powered features
- [OpenWeather](https://openweathermap.org/) for weather data
- [Cloudinary](https://cloudinary.com/) for image hosting
