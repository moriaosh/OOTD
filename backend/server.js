// server.js מעודכן - נקי מקוד מיותר
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

app.use((req, res, next) => {
  // בדיקה אם אנחנו בפרודקשן (לא בבית) ואם הבקשה לא מאובטחת
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

// Middleware 
app.use(cors()); 
app.use(express.json());

// --- חיבור ה-Routes הקריטיים שלנו ---
// כל ה-Routes שלנו משתמשים בפורמט CommonJS (require)

const authRoutes = require('./routes/auth');
const closetRoutes = require('./routes/closet');
const tagRoutes = require('./routes/tags');
const postRoutes = require('./routes/posts');

app.use('/api/auth', authRoutes);
app.use('/api/closet', closetRoutes); // זה יטפל ב-add-item, my-items, suggestions
app.use('/api/tags', tagRoutes); // זה יטפל ב-tags CRUD
app.use('/api/posts', postRoutes); // זה יטפל ב-posts CRUD

// ודאי שאין כאן שורות כמו: const itemsRoutes = require('./routes/items');

// הפעלת השרת
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`שרת OOTD רץ על פורט ${PORT}`));