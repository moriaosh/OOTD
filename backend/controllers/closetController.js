// This Controller handles the core logic for managing the user's closet: 
// image upload, Cloudinary integration, and PostgreSQL/Prisma saving.

const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const prisma = require('../utils/prismaClient'); 

// Task 5: Cloudinary Configuration (Reads from .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Task 6: Multer Setup for Memory Storage (Critical for Cloudinary)
const upload = multer({ storage: multer.memoryStorage() });
const uploadImageMiddleware = upload.single('image');

// --- 1. Add Item (Upload and Save) ---
const addItemLogic = async (req, res) => {
    const { name, category, color } = req.body;
    const userId = req.user.id; 

    if (!req.file) {
      return res.status(400).json({ message: 'לא נבחרה תמונה להעלאה.' });
    }
    if (!name || !category || !color) {
      return res.status(400).json({ message: 'אנא ספק/י שם, קטגוריה וצבע עבור הפריט.' });
    }

    try {
        // Prepare file for Cloudinary
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;

        // Task 7: Upload to Cloudinary
        const cloudinaryResponse = await cloudinary.uploader.upload(dataURI, {
            folder: `ootd-closet/${userId}`, 
            transformation: [{ width: 500, crop: 'scale' }]
        });

        const imageUrl = cloudinaryResponse.secure_url; 

        // Task 12: Save item to PostgreSQL via Prisma
        const newItem = await prisma.clothe.create({
            data: {
                userId,
                name,
                category,
                color,
                imageUrl,
            },
        });

        res.status(201).json({ message: 'הבגד הועלה ונשמר בהצלחה!', item: newItem });
    } catch (error) {
        console.error('Error adding closet item:', error);
        res.status(500).json({ message: 'שגיאה בהעלאת הפריט.', error: error.message });
    }
};

// Wrapper function to run Multer middleware before the core logic
const addItem = (req, res) => {
    uploadImageMiddleware(req, res, (err) => {
        if (err) {
            console.error('Multer Error:', err);
            return res.status(400).json({ message: "File upload failed or invalid file." });
        }
        // If upload is successful, continue to the core logic
        addItemLogic(req, res);
    });
};

// --- 2. Get User's Items ---
const getMyItems = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Task 14: Retrieve all clothes for the user
        const clothes = await prisma.clothe.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        res.status(200).json(clothes);
    } catch (error) {
        console.error('Error fetching closet items:', error);
        res.status(500).json({ message: 'שגיאה בשליפת הפריטים מהארון.', error: error.message });
    }
};

module.exports = {
    addItem,
    getMyItems,
};