// This Controller handles the core logic for managing the user's closet: 
// image upload, Cloudinary integration, and PostgreSQL/Prisma saving.

// שימוש ב-require ובייבוא ישיר של Cloudinary, ללא קובץ config נפרד
const { PrismaClient } = require('@prisma/client');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

const prisma = new PrismaClient();

// פונקציות עזר קטנות עבור AI
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const isNeutral = (color) => ['שחור', 'לבן', 'אפור', 'בז'].includes(color);

// Task 5: הגדרת Cloudinary (הערכים נקראים מקובץ .env)
// הקונפיגורציה מוכנסת כאן ישירות (לא נדרש קובץ config נפרד)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Task 6: Multer Setup for Memory Storage (Critical for Cloudinary)
const upload = multer({ storage: multer.memoryStorage() });
const uploadImageMiddleware = upload.single('image');


// --- 1. Get User's Items (Task 14) ---
const getMyItems = async (req, res) => {
    try {
        const userId = req.user.id; 
        
        const clothes = await prisma.clothe.findMany({
            where: { userId }, 
            orderBy: { createdAt: 'desc' },
        });

        res.status(200).json(clothes);

    } catch (error) {
        console.error('Error fetching closet items:', error);
        res.status(500).json({ message: 'שגיאה בשליפת פריטי הארון.' });
    }
};


// --- 2. Generate AI Outfit Suggestions (Task 95) ---
const generateOutfitSuggestions = async (req, res) => {
    const userId = req.user.id;

    try {
        const allClothes = await prisma.clothe.findMany({ where: { userId } });

        if (allClothes.length < 3) {
            return res.status(200).json({ suggestions: [], message: 'יש להעלות לפחות 3 פריטים כדי לקבל המלצה.' });
        }

        // חלוקה לקטגוריות (לוגיקת MVP)
        const categorized = {
            top: allClothes.filter(c => ['חולצה', 'טופ', 'סריג'].includes(c.category)),
            bottom: allClothes.filter(c => ['מכנס', 'חצאית'].includes(c.category)),
            shoe: allClothes.filter(c => c.category === 'נעל'),
            dress: allClothes.filter(c => c.category === 'שמלה'),
            outerwear: allClothes.filter(c => ['ז\'קט', 'מעיל'].includes(c.category)),
        };

        const suggestions = [];
        // יצירת 3 שילובים אקראיים מתוך הקטגוריות
        
        if (categorized.top.length && categorized.bottom.length && categorized.shoe.length) {
            suggestions.push({
                name: "לוק בסיסי קלאסי",
                items: [getRandomItem(categorized.top), getRandomItem(categorized.bottom), getRandomItem(categorized.shoe)]
            });
        }
        
        if (categorized.dress.length && categorized.shoe.length) {
             suggestions.push({
                name: "לוק שמלה קליל",
                items: [getRandomItem(categorized.dress), getRandomItem(categorized.shoe)]
            });
        }
        
        // נותן רק 3 הצעות מקסימום
        res.status(200).json({ suggestions: suggestions.slice(0, 3) });

    } catch (error) {
        console.error('AI Suggestion Error:', error);
        res.status(500).json({ message: 'שגיאה ביצירת המלצות לבוש.' });
    }
};


// --- 3. Add Item (Upload and Save) ---
const addItemLogic = async (req, res) => {
    const userId = req.user.id; 
    // קבלת שדות מלאים כולל שדות חדשים מהטופס
    const { name, category, color, season, occasion, notes } = req.body; 

    if (!req.file) {
      return res.status(400).json({ message: 'יש לבחור קובץ תמונה להעלאה.' });
    }
    if (!name || !category || !color) {
      return res.status(400).json({ message: 'אנא ספק/י שם, קטגוריה וצבע עבור הפריט.' });
    }

    let imageUrl;
    try {
        // המרת הקובץ ל-Base64 לשליחה ישירה ל-Cloudinary
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
        
        // Task 7: Upload to Cloudinary
        const cloudinaryResponse = await cloudinary.uploader.upload(dataURI, {
            folder: `ootd-closet/${userId}`, 
            transformation: [{ width: 500, crop: 'scale' }]
        });

        imageUrl = cloudinaryResponse.secure_url; 

        // 3. Task 12: Save item to PostgreSQL via Prisma
        const newItem = await prisma.clothe.create({
            data: {
                userId,
                name,
                category,
                color,
                imageUrl,
                season: season || null, 
                occasion: occasion || null, 
                notes: notes || null,
            },
        });

        res.status(201).json({ message: 'הבגד הועלה ונשמר בהצלחה!', item: newItem });
    } catch (error) {
        console.error('CLOUDINARY UPLOAD ERROR:', error);
        res.status(500).json({ message: 'שגיאה בהעלאת הפריט.', error: error.message });
    }
};

// Wrapper function to run Multer middleware before the core logic
const wrappedAddItem = (req, res) => {
    uploadImageMiddleware(req, res, (err) => {
        if (err) {
            console.error('Multer Error:', err);
            return res.status(400).json({ message: "File upload failed or invalid file." });
        }
        addItemLogic(req, res);
    });
};


// ודא שכל הפונקציות מיוצאות כראוי
module.exports = {
    addItem: wrappedAddItem,
    getMyItems,
    generateOutfitSuggestions, // <--- הפונקציה החסרה שצריך לייצא!
};