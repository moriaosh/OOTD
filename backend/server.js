// server.js – גרסה נקייה, מאובטחת ומוכנה ל-AI (OOTD)

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();

// Trust proxy when behind nginx/reverse proxy (required for rate limiting and HTTPS detection)
app.set('trust proxy', 1);

/* ===============================
   אבטחה כללית
================================ */
app.use(helmet());

/* ===============================
   Rate Limiting
================================ */

// הגבלה כללית לכל ה־API
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 דקות
  max: 100                // 100 בקשות לכל IP
});
app.use('/api/', generalLimiter);

// הגבלה מחמירה ל־AI (יקר!)
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // שעה
  max: 20                  // 20 בקשות AI לשעה
});

app.use('/api/closet/suggestions', aiLimiter);
app.use('/api/purchase/analyze', aiLimiter);
app.use('/api/calendar/recommend', aiLimiter);
app.use('/api/trips/generate', aiLimiter); // AI-powered packing list
app.use('/api/color-analysis/analyze', aiLimiter); // AI-powered color analysis

/* ===============================
   CORS
================================ */
// Build allowed origins list from environment variable + localhost for development
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003'
];

// Add production domain from environment variable if set
// In .env add: FRONTEND_URL=https://your-domain.com
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

const corsOptions = {
  origin: allowedOrigins,
  credentials: true
};

app.use(cors(corsOptions));


/* ===============================
   HTTPS enforcement (Production)
================================ */
// Skip HTTPS redirect when behind a trusted proxy (like nginx in Docker)
// Set TRUST_PROXY=true in environment to disable redirect
app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.TRUST_PROXY !== 'true' &&
    req.headers['x-forwarded-proto'] !== 'https'
  ) {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

/* ===============================
   Middlewares
================================ */
// Increase body size limit for image uploads (base64 images can be large)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

/* ===============================
   Routes
================================ */
const authRoutes = require('./routes/auth');
const closetRoutes = require('./routes/closet');
const tagRoutes = require('./routes/tags');
const postRoutes = require('./routes/posts');
const purchaseRoutes = require('./routes/purchase');
const calendarRoutes = require('./routes/calendar');
const tripsRoutes = require('./routes/trips');
const weeklyRoutes = require('./routes/weeklyRoutes');
const colorAnalysisRoutes = require('./routes/colorAnalysis');
const outfitRoutes = require('./routes/outfits');

app.use('/api/auth', authRoutes);
app.use('/api/closet', closetRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/purchase', purchaseRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/weekly', weeklyRoutes);
app.use('/api/color-analysis', colorAnalysisRoutes);
app.use('/api/outfits', outfitRoutes);

/* ===============================
   Server Start
================================ */
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Bind to all IPv4 interfaces (required for Docker)
app.listen(PORT, HOST, () => {
  console.log(`🚀 שרת OOTD רץ על פורט ${PORT}`);
});

