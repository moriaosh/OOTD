// Outfit Controller
// Manages user's saved outfits

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Create/Save a new outfit
 * POST /api/outfits
 */
const createOutfit = async (req, res) => {
  const userId = req.user.id;
  const { name, clotheIds, isFavorite } = req.body;

  if (!name || !clotheIds || !Array.isArray(clotheIds) || clotheIds.length === 0) {
    return res.status(400).json({ message: 'שם ופריטי לבוש הם שדות חובה' });
  }

  try {
    const outfit = await prisma.outfit.create({
      data: {
        userId,
        name,
        clotheIds,
        isFavorite: isFavorite || false
      }
    });

    res.status(201).json(outfit);
  } catch (error) {
    console.error('Create outfit error:', error);
    res.status(500).json({ message: 'שגיאה ביצירת הלוק' });
  }
};

/**
 * Get all user's outfits
 * GET /api/outfits
 */
const getUserOutfits = async (req, res) => {
  const userId = req.user.id;
  const { favoritesOnly } = req.query;

  try {
    const whereClause = { userId };
    if (favoritesOnly === 'true') {
      whereClause.isFavorite = true;
    }

    const outfits = await prisma.outfit.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    // For each outfit, fetch the actual clothe items
    const outfitsWithClothes = await Promise.all(
      outfits.map(async (outfit) => {
        const clothes = await prisma.clothe.findMany({
          where: {
            id: { in: outfit.clotheIds }
          }
        });
        return {
          ...outfit,
          items: clothes
        };
      })
    );

    res.status(200).json(outfitsWithClothes);
  } catch (error) {
    console.error('Get outfits error:', error);
    res.status(500).json({ message: 'שגיאה בשליפת הלוקים' });
  }
};

/**
 * Delete an outfit
 * DELETE /api/outfits/:id
 */
const deleteOutfit = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    // Check if outfit belongs to user
    const outfit = await prisma.outfit.findUnique({
      where: { id }
    });

    if (!outfit) {
      return res.status(404).json({ message: 'הלוק לא נמצא' });
    }

    if (outfit.userId !== userId) {
      return res.status(403).json({ message: 'אין לך הרשאה למחוק לוק זה' });
    }

    await prisma.outfit.delete({
      where: { id }
    });

    res.status(200).json({ message: 'הלוק נמחק בהצלחה' });
  } catch (error) {
    console.error('Delete outfit error:', error);
    res.status(500).json({ message: 'שגיאה במחיקת הלוק' });
  }
};

/**
 * Toggle outfit favorite status
 * PATCH /api/outfits/:id/favorite
 */
const toggleFavorite = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    // Check if outfit belongs to user
    const outfit = await prisma.outfit.findUnique({
      where: { id }
    });

    if (!outfit) {
      return res.status(404).json({ message: 'הלוק לא נמצא' });
    }

    if (outfit.userId !== userId) {
      return res.status(403).json({ message: 'אין לך הרשאה לערוך לוק זה' });
    }

    // Toggle favorite status
    const updatedOutfit = await prisma.outfit.update({
      where: { id },
      data: { isFavorite: !outfit.isFavorite }
    });

    res.status(200).json(updatedOutfit);
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ message: 'שגיאה בעדכון המועדפים' });
  }
};

module.exports = {
  createOutfit,
  getUserOutfits,
  deleteOutfit,
  toggleFavorite
};
