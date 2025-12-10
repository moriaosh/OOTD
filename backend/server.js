// server.js מעודכן - נקי מקוד מיותר
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

// Middleware 
app.use(cors()); 
app.use(express.json());

// --- חיבור ה-Routes הקריטיים שלנו ---
// כל ה-Routes שלנו משתמשים בפורמט CommonJS (require)

const authRoutes = require('./routes/auth');
const closetRoutes = require('./routes/closet'); 

app.use('/api/auth', authRoutes);
app.use('/api/closet', closetRoutes); // זה יטפל ב-add-item, my-items, suggestions

// ודאי שאין כאן שורות כמו: const itemsRoutes = require('./routes/items');

// הפעלת השרת
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`שרת OOTD רץ על פורט ${PORT}`));