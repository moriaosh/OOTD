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
        const allClothes = await prisma.clothe.findMany({ where: { userId } });

        if (allClothes.length < 3) {
            return res.status(200).json({
                suggestions: [],
                message: 'יש להעלות לפחות 3 פריטים כדי לקבל המלצה.'
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


// ודא שכל הפונקציות מיוצאות כראוי
module.exports = {
    addItem: wrappedAddItem,
    getMyItems,
    generateOutfitSuggestions, // <--- הפונקציה החסרה שצריך לייצא!
};