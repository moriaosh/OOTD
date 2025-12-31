const { PrismaClient } = require('@prisma/client');
const { analyzeCalendarOutfit } = require('../utils/geminiService');

const prisma = new PrismaClient();

const getCalendarRecommendation = async (req, res) => {
  try {
    const userId = req.user?.id || 1; // ← חשוב!!
    const { date, event, location, weather } = req.body;

    if (!date || !event) {
      return res.status(400).json({ message: 'חסר תאריך או אירוע' });
    }

    const userCloset = await prisma.clothe.findMany({
      where: { userId }
    });

    if (userCloset.length === 0) {
      return res.json({
        outfit: 'אין פריטים בארון',
        explanation: 'כדי להמליץ צריך בגדים',
        confidence: 5,
        warnings: null
      });
    }

    const result = await analyzeCalendarOutfit(userCloset, {
      date,
      event,
      location,
      weather
    });

    res.json({
      ...result,
      closetSize: userCloset.length
    });

  } catch (error) {
    console.error('Calendar recommendation error:', error);
    res.status(500).json({ message: 'שגיאה בהמלצת לוק לפי לוח שנה' });
  }
};

module.exports = { getCalendarRecommendation };
