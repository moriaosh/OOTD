// server.js מעודכן
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

// Middleware (נשאר תקין)
app.use(cors()); // מאפשר לפרונט לגשת לשרת
app.use(express.json());

// Routes (חיבור כל הנתיבים)
const authRoutes = require('./routes/auth');
const closetRoutes = require('./routes/closet');
const itemsRoutes = require('./routes/items');

app.use('/api/auth', authRoutes);
app.use('/api/closet', closetRoutes); // חיבור ה-Route של הוספת הבגד
app.use('/api/items', itemsRoutes);


// הפעלת השרת
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`שרת OOTD רץ על פורט ${PORT}`));
