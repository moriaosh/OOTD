// server.js מעודכן - נקי מקוד מיותר
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
dotenv.config();

const app = express();

// --- אבטחה ו-Rate Limiting ---

  app.use(helmet()); // Security headers

  // General rate limit
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests
  });
  app.use('/api/', limiter);

  // Stricter limit for AI endpoints (EXPENSIVE!)
  const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20 // 20 AI requests per hour
  });
  app.use('/api/closet/suggestions', aiLimiter);
  app.use('/api/purchase/analyze', aiLimiter);

  // Secure CORS
  const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  };
  app.use(cors(corsOptions));

app.use((req, res, next) => {
  // בדיקה אם אנחנו בפרודקשן (לא בבית) ואם הבקשה לא מאובטחת
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

// Middleware
app.use(express.json());

// --- חיבור ה-Routes הקריטיים שלנו ---
// כל ה-Routes שלנו משתמשים בפורמט CommonJS (require)

const authRoutes = require('./routes/auth');
const closetRoutes = require('./routes/closet');
const tagRoutes = require('./routes/tags');
const postRoutes = require('./routes/posts');
const purchaseRoutes = require('./routes/purchase');

app.use('/api/auth', authRoutes);
app.use('/api/closet', closetRoutes); // זה יטפל ב-add-item, my-items, suggestions
app.use('/api/tags', tagRoutes); // זה יטפל ב-tags CRUD
app.use('/api/posts', postRoutes); // זה יטפל ב-posts CRUD
app.use('/api/purchase', purchaseRoutes); // זה יטפל ב-purchase advisor

// ודאי שאין כאן שורות כמו: const itemsRoutes = require('./routes/items');

// הפעלת השרת
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`שרת OOTD רץ על פורט ${PORT}`));