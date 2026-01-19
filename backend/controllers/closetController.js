// This Controller handles the core logic for managing the user's closet:
// image upload, Cloudinary integration, and PostgreSQL/Prisma saving.

// שימוש ב-require ובייבוא ישיר של Cloudinary, ללא קובץ config נפרד
const { PrismaClient } = require('@prisma/client');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { getWeatherByCity, getWeatherRecommendations, filterClothesByWeather } = require('../utils/weatherService');
const { generateAIOutfits } = require('../utils/geminiService');

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
            include: {
                tags: {
                    include: {
                        tag: true
                    }
                }
            }
        });

        // Transform the data to include tags as an array
        const clothesWithTags = clothes.map(clothe => ({
            ...clothe,
            tags: clothe.tags.map(ct => ct.tag)
        }));

        res.status(200).json(clothesWithTags);

    } catch (error) {
        console.error('Error fetching closet items:', error);
        res.status(500).json({ message: 'שגיאה בשליפת פריטי הארון.' });
    }
};


// --- 2. Generate AI Outfit Suggestions with Weather (Enhanced) ---
const generateOutfitSuggestions = async (req, res) => {
    const userId = req.user.id;
    const { location, useAI = 'true' } = req.query; // Optional: city & AI mode
    const enableAI = useAI === 'true';

    try {
        // Filter out items in laundry
        const allClothes = await prisma.clothe.findMany({
            where: {
                userId,
                inLaundry: false // Exclude items in laundry
            }
        });

        if (allClothes.length < 3) {
            return res.status(200).json({
                suggestions: [],
                message: 'יש להעלות לפחות 3 פריטים זמינים (שלא בכביסה) כדי לקבל המלצה.'
            });
        }

        let weather = null;
        let weatherRecs = null;
        let categorized;
        let usingAI = false;

        // If location provided, fetch weather
        if (location) {
            try {
                weather = await getWeatherByCity(location);
                weatherRecs = getWeatherRecommendations(weather);
            } catch (weatherError) {
                console.error('Weather fetch failed:', weatherError);
            }
        }

        let suggestions = [];

        // Try AI-powered suggestions first (if enabled)
        if (enableAI) {
            try {
                console.log('Attempting AI outfit generation...');
                const aiSuggestions = await generateAIOutfits(allClothes, weather);

                if (aiSuggestions && aiSuggestions.length > 0) {
                    suggestions = aiSuggestions;
                    usingAI = true;
                    console.log(`AI generated ${aiSuggestions.length} outfits successfully`);
                }
            } catch (aiError) {
                console.error('AI outfit generation failed, falling back to basic mode:', aiError.message);
                // Will fall through to basic algorithm below
            }
        }

        // Fallback: Basic algorithm (if AI disabled or failed)
        if (suggestions.length === 0) {
            console.log('Using basic outfit algorithm...');

            // Filter/categorize clothes by weather if available
            if (weatherRecs) {
                categorized = filterClothesByWeather(allClothes, weatherRecs);
            } else {
                categorized = {
                    top: allClothes.filter(c => ['חולצה', 'טופ', 'סריג'].includes(c.category)),
                    bottom: allClothes.filter(c => ['מכנס', 'חצאית'].includes(c.category)),
                    shoe: allClothes.filter(c => c.category === 'נעל'),
                    dress: allClothes.filter(c => c.category === 'שמלה'),
                    outerwear: allClothes.filter(c => ['ז\'קט', 'מעיל'].includes(c.category)),
                    accessory: allClothes.filter(c => c.category === 'אביזר')
                };
            }

            // Suggestion 1: Classic outfit (top + bottom + shoes + optional outerwear)
            if (categorized.top.length && categorized.bottom.length && categorized.shoe.length) {
                const outfit = {
                    name: weatherRecs ? "לוק מותאם למזג האוויר" : "לוק בסיסי קלאסי",
                    items: [
                        getRandomItem(categorized.top),
                        getRandomItem(categorized.bottom),
                        getRandomItem(categorized.shoe)
                    ],
                    explanation: null
                };

                // Add outerwear if weather requires it or if temperature is low
                if (weatherRecs?.requiresOuterwear && categorized.outerwear.length) {
                    outfit.items.push(getRandomItem(categorized.outerwear));
                }

                // Add weather explanation
                if (weather && weatherRecs) {
                    const explanationParts = [];
                    explanationParts.push(`טמפרטורה: ${weather.temperature}°C`);

                    if (weatherRecs.requiresOuterwear) {
                        explanationParts.push('הוספנו מעיל כי קר בחוץ');
                    }
                    if (weatherRecs.requiresRainGear) {
                        explanationParts.push('מזג אוויר גשום - מומלץ מטריה');
                    }
                    if (weatherRecs.preferredSeasons.length > 0) {
                        explanationParts.push(`פריטים מותאמים לעונת ${weatherRecs.preferredSeasons.join('/')}`);
                    }

                    outfit.explanation = explanationParts.join(' • ');
                }

                suggestions.push(outfit);
            }

            // Suggestion 2: Dress-based outfit
            if (categorized.dress.length && categorized.shoe.length) {
                const outfit = {
                    name: weatherRecs ? "שמלה מותאמת למזג האוויר" : "לוק שמלה קליל",
                    items: [
                        getRandomItem(categorized.dress),
                        getRandomItem(categorized.shoe)
                    ],
                    explanation: null
                };

                // Add jacket/outerwear if cold
                if (weatherRecs?.requiresOuterwear && categorized.outerwear.length) {
                    outfit.items.push(getRandomItem(categorized.outerwear));
                }

                // Add weather explanation
                if (weather && weatherRecs) {
                    const explanationParts = [];
                    explanationParts.push(`טמפרטורה: ${weather.temperature}°C`);

                    if (weatherRecs.requiresOuterwear) {
                        explanationParts.push('הוספנו ז\'קט כי קריר בחוץ');
                    }
                    if (weatherRecs.requiresRainGear) {
                        explanationParts.push('גשום - תיקחי מטריה');
                    }

                    outfit.explanation = explanationParts.join(' • ');
                }

                suggestions.push(outfit);
            }

            // Suggestion 3: Alternative combination (different items)
            if (categorized.top.length > 1 && categorized.bottom.length > 1 && categorized.shoe.length) {
                const outfit = {
                    name: "לוק חלופי",
                    items: [
                        getRandomItem(categorized.top),
                        getRandomItem(categorized.bottom),
                        getRandomItem(categorized.shoe)
                    ],
                    explanation: weather ? `שילוב נוסף מותאם ל-${weather.temperature}°C` : null
                };

                suggestions.push(outfit);
            }

            // If no suggestions were created but user has items, provide helpful message
            if (suggestions.length === 0 && allClothes.length >= 3 && categorized) {
                let helpMessage = null;
                const missing = [];
                if (!categorized.shoe.length) missing.push('נעליים');
                if (!categorized.top.length && !categorized.dress.length) missing.push('חולצות או שמלות');
                if (!categorized.bottom.length && !categorized.dress.length) missing.push('מכנסיים או חצאיות');

                if (missing.length > 0) {
                    helpMessage = `יש לך ${allClothes.length} פריטים, אבל חסרים פריטים מסוגים מסוימים ליצירת לוק שלם. נסי להוסיף: ${missing.join(', ')}`;
                } else {
                    helpMessage = 'לא ניתן ליצור הצעות לוק מהפריטים הקיימים. נסי להוסיף מגוון רחב יותר של קטגוריות.';
                }

                // Add message to first suggestion if it exists
                if (suggestions.length > 0 && !suggestions[0].explanation) {
                    suggestions[0].explanation = helpMessage;
                }
            }
        } // End of basic algorithm block

        // Response with weather data if available
        const response = {
            suggestions: suggestions.slice(0, 3),
            usingAI: usingAI,
            weather: weather ? {
                temperature: weather.temperature,
                feelsLike: weather.feelsLike,
                condition: weather.condition,
                description: weather.description,
                city: weather.city,
                icon: weather.icon
            } : null,
            weatherMessage: weatherRecs?.message || null
        };

        res.status(200).json(response);

    } catch (error) {
        console.error('AI Suggestion Error:', error);
        res.status(500).json({ message: 'שגיאה ביצירת המלצות לבוש.' });
    }
};


// --- 3. Add Item (Upload and Save) ---
const addItemLogic = async (req, res) => {
    const userId = req.user.id; 
    // קבלת שדות מלאים כולל שדות חדשים מהטופס
    const { name, category, color, season, occasion, notes, tagIds } = req.body; 

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

        // Parse tagIds if provided (can be string or array)
        let parsedTagIds = [];
        if (tagIds) {
            if (typeof tagIds === 'string') {
                try {
                    parsedTagIds = JSON.parse(tagIds);
                } catch {
                    parsedTagIds = tagIds.split(',').filter(id => id.trim());
                }
            } else if (Array.isArray(tagIds)) {
                parsedTagIds = tagIds;
            }
        }

        // 3. Task 12: Save item to PostgreSQL via Prisma with tags
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
                tags: parsedTagIds.length > 0 ? {
                    create: parsedTagIds.map(tagId => ({
                        tagId: tagId
                    }))
                } : undefined
            },
            include: {
                tags: {
                    include: {
                        tag: true
                    }
                }
            }
        });

        // Transform to include tags as array
        const itemWithTags = {
            ...newItem,
            tags: newItem.tags.map(ct => ct.tag)
        };

        res.status(201).json({ message: 'הבגד הועלה ונשמר בהצלחה!', item: itemWithTags });
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


// --- 4. Update/Edit Item ---
const updateItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { name, category, color, season, occasion, notes, tagIds } = req.body;

        // Verify ownership
        const item = await prisma.clothe.findUnique({ where: { id } });
        if (!item || item.userId !== userId) {
            return res.status(403).json({ message: 'לא מורשה לערוך פריט זה.' });
        }

        // Update item
        const updatedItem = await prisma.clothe.update({
            where: { id },
            data: {
                name: name || item.name,
                category: category || item.category,
                color: color || item.color,
                season: season !== undefined ? season : item.season,
                occasion: occasion !== undefined ? occasion : item.occasion,
                notes: notes !== undefined ? notes : item.notes
            },
            include: {
                tags: {
                    include: {
                        tag: true
                    }
                }
            }
        });

        // Update tags if provided
        if (tagIds && Array.isArray(tagIds)) {
            // Delete existing tag associations
            await prisma.clotheTag.deleteMany({ where: { clotheId: id } });

            // Create new tag associations
            if (tagIds.length > 0) {
                await prisma.clotheTag.createMany({
                    data: tagIds.map(tagId => ({
                        clotheId: id,
                        tagId: tagId
                    }))
                });
            }
        }

        // Fetch updated item with tags
        const itemWithTags = await prisma.clothe.findUnique({
            where: { id },
            include: {
                tags: {
                    include: {
                        tag: true
                    }
                }
            }
        });

        const formattedItem = {
            ...itemWithTags,
            tags: itemWithTags.tags.map(ct => ct.tag)
        };

        res.status(200).json({ message: 'הפריט עודכן בהצלחה!', item: formattedItem });
    } catch (error) {
        console.error('Update item error:', error);
        res.status(500).json({ message: 'שגיאה בעדכון הפריט.' });
    }
};

// --- 5. Delete Item ---
const deleteItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        // Verify ownership
        const item = await prisma.clothe.findUnique({ where: { id } });
        if (!item || item.userId !== userId) {
            return res.status(403).json({ message: 'לא מורשה למחוק פריט זה.' });
        }

        // Optional: Delete from Cloudinary
        if (item.imageUrl) {
            try {
                // Extract public_id from Cloudinary URL
                const urlParts = item.imageUrl.split('/');
                const filename = urlParts[urlParts.length - 1];
                const publicId = filename.split('.')[0];

                await cloudinary.uploader.destroy(`ootd/${publicId}`);
                console.log('Image deleted from Cloudinary:', publicId);
            } catch (cloudinaryError) {
                console.error('Cloudinary deletion failed (continuing anyway):', cloudinaryError);
            }
        }

        // Delete item (tags will cascade delete automatically)
        await prisma.clothe.delete({ where: { id } });

        res.status(200).json({ message: 'הפריט נמחק בהצלחה!' });
    } catch (error) {
        console.error('Delete item error:', error);
        res.status(500).json({ message: 'שגיאה במחיקת הפריט.' });
    }
};

// --- 6. Toggle Laundry Status ---
const toggleLaundry = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        // Verify ownership
        const item = await prisma.clothe.findUnique({ where: { id } });
        if (!item || item.userId !== userId) {
            return res.status(403).json({ message: 'לא מורשה לעדכן פריט זה.' });
        }

        // Toggle laundry status
        const updatedItem = await prisma.clothe.update({
            where: { id },
            data: { inLaundry: !item.inLaundry }
        });

        res.status(200).json({
            message: updatedItem.inLaundry ? 'הפריט עבר לכביסה' : 'הפריט חזר מהכביסה',
            item: updatedItem
        });
    } catch (error) {
        console.error('Toggle laundry error:', error);
        res.status(500).json({ message: 'שגיאה בעדכון סטטוס כביסה.' });
    }
};

// --- 6b. Toggle Favorite Status ---
const toggleFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        // Verify ownership
        const item = await prisma.clothe.findUnique({ where: { id } });
        if (!item || item.userId !== userId) {
            return res.status(403).json({ message: 'לא מורשה לעדכן פריט זה.' });
        }

        // Toggle favorite status
        const updatedItem = await prisma.clothe.update({
            where: { id },
            data: { isFavorite: !item.isFavorite }
        });

        res.status(200).json({
            message: updatedItem.isFavorite ? 'הפריט נוסף למועדפים' : 'הפריט הוסר מהמועדפים',
            item: updatedItem
        });
    } catch (error) {
        console.error('Toggle favorite error:', error);
        res.status(500).json({ message: 'שגיאה בעדכון סטטוס מועדפים.' });
    }
};

// --- 7. Backup User Data ---
const backupUserData = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch all user data
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                clothes: {
                    include: {
                        tags: {
                            include: {
                                tag: true
                            }
                        }
                    }
                },
                tags: true,
                outfits: true,
                posts: true,
                weeklyPlans: true,
                colorAnalyses: true
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'משתמש לא נמצא.' });
        }

        // Remove password from backup
        const { password, ...userWithoutPassword } = user;

        // Format backup data
        const backup = {
            exportDate: new Date().toISOString(),
            version: '1.0',
            user: userWithoutPassword
        };

        res.status(200).json(backup);
    } catch (error) {
        console.error('Backup error:', error);
        res.status(500).json({ message: 'שגיאה ביצירת גיבוי.' });
    }
};

// --- 8. Bulk Upload Items (from Excel/CSV parsed data) ---
const bulkUploadItems = async (req, res) => {
    try {
        const userId = req.user.id;
        const { items } = req.body; // Array of items from frontend

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'לא נשלחו פריטים להעלאה.' });
        }

        const createdItems = [];
        const errors = [];

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            try {
                // Validate required fields
                if (!item.name || !item.category || !item.color) {
                    errors.push({ row: i + 1, error: 'שם, קטגוריה וצבע הם שדות חובה' });
                    continue;
                }

                // Create item (without image - imageUrl will be a placeholder or empty)
                const newItem = await prisma.clothe.create({
                    data: {
                        userId,
                        name: item.name,
                        category: item.category,
                        color: item.color,
                        season: item.season || null,
                        occasion: item.occasion || null,
                        notes: item.notes || null,
                        imageUrl: item.imageUrl || 'https://via.placeholder.com/300x400?text=No+Image',
                        inLaundry: false,
                        isFavorite: false
                    }
                });

                createdItems.push(newItem);
            } catch (itemError) {
                errors.push({ row: i + 1, error: itemError.message });
            }
        }

        res.status(201).json({
            message: `${createdItems.length} פריטים נוצרו בהצלחה!`,
            created: createdItems.length,
            errors: errors.length,
            errorDetails: errors
        });
    } catch (error) {
        console.error('Bulk upload error:', error);
        res.status(500).json({ message: 'שגיאה בהעלאה מרובה.' });
    }
};

/**
 * Restore user data from JSON backup
 * POST /api/closet/restore
 */
const restoreUserData = async (req, res) => {
    const userId = req.user.id;
    const { backup, replaceExisting } = req.body;

    // Support both formats: backup.clothes (old) and backup.user.clothes (new)
    const clothes = backup?.clothes || backup?.user?.clothes;

    if (!backup || !clothes) {
        return res.status(400).json({ message: 'קובץ גיבוי לא תקין' });
    }

    try {
        let restoredCount = 0;
        const errors = [];

        // If replaceExisting is true, delete all existing data first
        if (replaceExisting) {
            await prisma.clothe.deleteMany({ where: { userId } });
        }

        // Restore clothes
        for (const clothe of clothes) {
            try {
                await prisma.clothe.create({
                    data: {
                        userId,
                        name: clothe.name,
                        category: clothe.category,
                        color: clothe.color,
                        season: clothe.season || null,
                        occasion: clothe.occasion || null,
                        notes: clothe.notes || null,
                        imageUrl: clothe.imageUrl,
                        inLaundry: clothe.inLaundry || false,
                        isFavorite: clothe.isFavorite || false
                    }
                });
                restoredCount++;
            } catch (error) {
                errors.push({ item: clothe.name, error: error.message });
            }
        }

        res.status(200).json({
            message: `${restoredCount} פריטים שוחזרו בהצלחה!`,
            restored: restoredCount,
            errors: errors.length,
            errorDetails: errors
        });
    } catch (error) {
        console.error('Restore error:', error);
        res.status(500).json({ message: 'שגיאה בשחזור הנתונים.' });
    }
};

/**
 * Get cached weather suggestion
 * GET /api/closet/cached-suggestion
 */
const getCachedSuggestion = async (req, res) => {
    const userId = req.user.id;

    try {
        const cached = await prisma.cachedWeatherSuggestion.findUnique({
            where: { userId }
        });

        if (!cached) {
            return res.status(200).json({ cached: null });
        }

        res.status(200).json({ cached });
    } catch (error) {
        console.error('Get cached suggestion error:', error);
        res.status(500).json({ message: 'שגיאה בטעינת ההמלצה השמורה.' });
    }
};

/**
 * Save cached weather suggestion (replaces existing)
 * POST /api/closet/cached-suggestion
 */
const saveCachedSuggestion = async (req, res) => {
    const userId = req.user.id;
    const { location, weatherData, suggestion } = req.body;

    if (!location || !suggestion) {
        return res.status(400).json({ message: 'חסרים נתונים לשמירה.' });
    }

    try {
        // Upsert: delete existing and create new
        const cached = await prisma.cachedWeatherSuggestion.upsert({
            where: { userId },
            update: {
                location,
                weatherData: weatherData || {},
                suggestion,
                createdAt: new Date()
            },
            create: {
                userId,
                location,
                weatherData: weatherData || {},
                suggestion
            }
        });

        res.status(200).json({ message: 'ההמלצה נשמרה בהצלחה!', cached });
    } catch (error) {
        console.error('Save cached suggestion error:', error);
        res.status(500).json({ message: 'שגיאה בשמירת ההמלצה.' });
    }
};

/**
 * Delete cached weather suggestion
 * DELETE /api/closet/cached-suggestion
 */
const deleteCachedSuggestion = async (req, res) => {
    const userId = req.user.id;

    try {
        await prisma.cachedWeatherSuggestion.deleteMany({
            where: { userId }
        });

        res.status(200).json({ message: 'ההמלצה נמחקה בהצלחה.' });
    } catch (error) {
        console.error('Delete cached suggestion error:', error);
        res.status(500).json({ message: 'שגיאה במחיקת ההמלצה.' });
    }
};

/**
 * Get wardrobe statistics
 * GET /api/closet/statistics
 */
const getWardrobeStatistics = async (req, res) => {
    const userId = req.user.id;

    try {
        // Get all user's clothes
        const clothes = await prisma.clothe.findMany({
            where: { userId },
            select: {
                category: true,
                color: true,
                season: true,
                occasion: true,
                inLaundry: true,
                isFavorite: true
            }
        });

        // Get saved outfits count
        const outfitsCount = await prisma.outfit.count({
            where: { userId }
        });

        const favoriteOutfitsCount = await prisma.outfit.count({
            where: { userId, isFavorite: true }
        });

        // Calculate statistics
        const totalItems = clothes.length;
        const inLaundryCount = clothes.filter(c => c.inLaundry).length;
        const favoriteItemsCount = clothes.filter(c => c.isFavorite).length;

        // Category breakdown
        const categoryStats = {};
        clothes.forEach(item => {
            categoryStats[item.category] = (categoryStats[item.category] || 0) + 1;
        });

        // Color breakdown
        const colorStats = {};
        clothes.forEach(item => {
            colorStats[item.color] = (colorStats[item.color] || 0) + 1;
        });

        // Season breakdown
        const seasonStats = {};
        clothes.forEach(item => {
            if (item.season) {
                seasonStats[item.season] = (seasonStats[item.season] || 0) + 1;
            }
        });

        // Occasion breakdown
        const occasionStats = {};
        clothes.forEach(item => {
            if (item.occasion) {
                occasionStats[item.occasion] = (occasionStats[item.occasion] || 0) + 1;
            }
        });

        // Sort colors by frequency
        const sortedColors = Object.entries(colorStats)
            .sort((a, b) => b[1] - a[1])
            .map(([color, count]) => ({ color, count }));

        res.status(200).json({
            totalItems,
            inLaundryCount,
            favoriteItemsCount,
            outfitsCount,
            favoriteOutfitsCount,
            categoryStats,
            colorStats: sortedColors,
            seasonStats,
            occasionStats,
            availableItems: totalItems - inLaundryCount
        });

    } catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({ message: 'שגיאה בשליפת סטטיסטיקות' });
    }
};

// ודא שכל הפונקציות מיוצאות כראוי
module.exports = {
    addItem: wrappedAddItem,
    getMyItems,
    generateOutfitSuggestions,
    updateItem,
    deleteItem,
    toggleLaundry,
    toggleFavorite,
    backupUserData,
    bulkUploadItems,
    restoreUserData,
    getWardrobeStatistics,
    getCachedSuggestion,
    saveCachedSuggestion,
    deleteCachedSuggestion
};