// Purchase Advisor Controller
// Analyzes whether a potential purchase matches user's existing wardrobe

const { PrismaClient } = require('@prisma/client');
const { analyzePurchaseCompatibility } = require('../utils/geminiService');

const prisma = new PrismaClient();

/**
 * Analyze purchase compatibility
 * POST /api/purchase/analyze
 *
 * Body:
 * {
 *   "imageUrl": "https://example.com/shirt.jpg",
 *   "itemName": "Blue Shirt",
 *   "itemType": "חולצה"
 * }
 */
const analyzePurchase = async (req, res) => {
  const userId = req.user.id;
  const { imageUrl, itemName, itemType } = req.body;

  // Validation
  if (!imageUrl) {
    return res.status(400).json({ message: 'חסר קישור לתמונה (imageUrl)' });
  }

  if (!itemName) {
    return res.status(400).json({ message: 'חסר שם הפריט (itemName)' });
  }

  if (!itemType) {
    return res.status(400).json({ message: 'חסר סוג הפריט (itemType)' });
  }

  try {
    console.log(`\n=== Purchase Analysis Request ===`);
    console.log(`User ID: ${userId}`);
    console.log(`Item: ${itemName} (${itemType})`);
    console.log(`Image URL: ${imageUrl}`);

    // Fetch user's closet
    const userCloset = await prisma.clothe.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        category: true,
        color: true,
        season: true,
        occasion: true
      }
    });

    console.log(`User has ${userCloset.length} items in closet`);

    if (userCloset.length === 0) {
      return res.status(200).json({
        score: 7,
        explanation: 'הארון שלך ריק כרגע, אז קשה להעריך התאמה. הפריט נראה יפה!',
        recommendations: 'זה יהיה הפריט הראשון בארון שלך - התחלה טובה!',
        warnings: null,
        closetSize: 0
      });
    }

    // Call Gemini Vision API
    const analysis = await analyzePurchaseCompatibility(
      imageUrl,
      userCloset,
      itemName,
      itemType
    );

    console.log(`Analysis complete: Score ${analysis.score}/10`);
    console.log('=================================\n');

    // Return analysis result
    res.status(200).json({
      ...analysis,
      closetSize: userCloset.length
    });

  } catch (error) {
    console.error('Purchase analysis error:', error);

    // Handle specific errors with user-friendly messages
    if (error.message.includes('403 Forbidden') || error.message.includes('blocked by website')) {
      return res.status(400).json({
        message: 'האתר חוסם גישה לתמונה. נסי להעתיק את התמונה ולהעלות לשירות כמו Imgur.'
      });
    }

    if (error.message.includes('404') || error.message.includes('not found')) {
      return res.status(400).json({
        message: 'התמונה לא נמצאה. ודאי שהקישור תקין.'
      });
    }

    if (error.message.includes('timed out')) {
      return res.status(400).json({
        message: 'הורדת התמונה נכשלה (timeout). נסי קישור אחר או העלאה ישירה.'
      });
    }

    if (error.message.includes('Failed to fetch image')) {
      return res.status(400).json({
        message: 'לא ניתן לטעון את התמונה. ודאי שהקישור תקין ונגיש.'
      });
    }

    if (error.message.includes('not a valid image') || error.message.includes('Invalid base64')) {
      return res.status(400).json({
        message: 'הקישור אינו מצביע על תמונה תקינה.'
      });
    }

    if (error.message.includes('Gemini API key not configured')) {
      return res.status(503).json({
        message: 'שירות ניתוח הקניות אינו זמין כרגע.'
      });
    }

    if (error.message.includes('invalid response format') || error.message.includes('Failed to parse')) {
      return res.status(500).json({
        message: 'הבינה המלאכותית החזירה תשובה לא תקינה. נסי שוב.'
      });
    }

    // Log the actual error for debugging
    console.error('Unhandled purchase error:', error.message);

    res.status(500).json({
      message: 'שגיאה בניתוח הקנייה. נסי שוב.'
    });
  }
};

module.exports = {
  analyzePurchase
};
