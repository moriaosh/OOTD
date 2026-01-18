// Trips Controller - Smart Packing List Generation
// Uses Gemini AI to create personalized packing lists based on trip details and user's wardrobe

const { PrismaClient } = require('@prisma/client');
const { generatePackingList } = require('../utils/packingService');
const { getWeatherByCity } = require('../utils/weatherService');

const prisma = new PrismaClient();

/**
 * POST /api/trips/generate
 * Generate AI-powered packing list for a trip
 */
const generateTripList = async (req, res) => {
  try {
    const userId = req.user.id;
    const { destination, startDate, endDate, activities, packingStyle } = req.body;

    // Validation
    if (!destination || !startDate || !endDate || !activities || !packingStyle) {
      return res.status(400).json({
        message: 'חסרים פרטים נדרשים. נדרש: יעד, תאריכים, פעילויות וסגנון אריזה.'
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return res.status(400).json({
        message: 'תאריך הסיום חייב להיות אחרי תאריך ההתחלה.'
      });
    }

    // Calculate trip duration
    const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    console.log(`Generating packing list for ${destination}, ${duration} days`);

    // Fetch weather forecast for destination
    let weatherData = null;
    try {
      weatherData = await getWeatherByCity(destination);
      console.log(`Weather for ${destination}:`, weatherData);
    } catch (weatherError) {
      console.error('Weather fetch failed:', weatherError.message);
      // Continue without weather data - AI will work without it
    }

    // Fetch user's wardrobe
    const userWardrobe = await prisma.clothe.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        category: true,
        color: true,
        season: true,
        occasion: true
      },
      orderBy: { createdAt: 'desc' }
    });

    if (userWardrobe.length === 0) {
      return res.status(200).json({
        message: 'הארון שלך ריק. הרשימה תכלול רק המלצות כלליות.',
        packingList: null,
        hasWardrobe: false
      });
    }

    console.log(`User has ${userWardrobe.length} items in wardrobe`);

    // Generate packing list using Gemini AI
    const packingList = await generatePackingList({
      destination,
      startDate: start,
      endDate: end,
      duration,
      activities,
      packingStyle,
      weatherData,
      userWardrobe
    });

    console.log(`Generated ${packingList.categories.length} categories with items`);

    // Save trip to database
    const savedTrip = await prisma.tripPlan.create({
      data: {
        userId,
        destination,
        startDate: start,
        endDate: end,
        activities,
        packingStyle,
        weatherData: weatherData ? JSON.parse(JSON.stringify(weatherData)) : null,
        packingItems: {
          create: packingList.categories.flatMap(category =>
            category.items.map(item => ({
              category: category.name,
              name: item.name,
              quantity: item.quantity || 1,
              isOwned: item.isOwned,
              clotheId: item.itemId || null,
              suggestion: item.suggestion || null,
              isPacked: false
            }))
          )
        }
      },
      include: {
        packingItems: true
      }
    });

    console.log(`Trip saved with ID: ${savedTrip.id}`);

    res.status(200).json({
      success: true,
      trip: savedTrip,
      packingList,
      duration,
      weatherData
    });

  } catch (error) {
    console.error('Generate trip error:', error);
    res.status(500).json({
      message: 'שגיאה ביצירת רשימת האריזה.'
    });
  }
};

/**
 * GET /api/trips/my-trips
 * Get all trips for the logged-in user
 */
const getMyTrips = async (req, res) => {
  try {
    const userId = req.user.id;

    const trips = await prisma.tripPlan.findMany({
      where: { userId },
      include: {
        packingItems: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(trips);
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({
      message: 'שגיאה בטעינת הטיולים.'
    });
  }
};

/**
 * GET /api/trips/:tripId
 * Get a specific trip with packing list
 */
const getTripById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tripId } = req.params;

    const trip = await prisma.tripPlan.findFirst({
      where: {
        id: tripId,
        userId
      },
      include: {
        packingItems: true
      }
    });

    if (!trip) {
      return res.status(404).json({
        message: 'הטיול לא נמצא.'
      });
    }

    res.status(200).json(trip);
  } catch (error) {
    console.error('Get trip error:', error);
    res.status(500).json({
      message: 'שגיאה בטעינת הטיול.'
    });
  }
};

/**
 * PATCH /api/trips/:tripId/items/:itemId
 * Update packing item (mark as packed, change quantity, etc.)
 */
const updatePackingItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tripId, itemId } = req.params;
    const { isPacked, quantity } = req.body;

    // Verify trip belongs to user
    const trip = await prisma.tripPlan.findFirst({
      where: {
        id: tripId,
        userId
      }
    });

    if (!trip) {
      return res.status(404).json({
        message: 'הטיול לא נמצא.'
      });
    }

    // Update item
    const updatedItem = await prisma.packingListItem.update({
      where: { id: itemId },
      data: {
        ...(isPacked !== undefined && { isPacked }),
        ...(quantity !== undefined && { quantity })
      }
    });

    res.status(200).json(updatedItem);
  } catch (error) {
    console.error('Update packing item error:', error);
    res.status(500).json({
      message: 'שגיאה בעדכון הפריט.'
    });
  }
};

/**
 * DELETE /api/trips/:tripId
 * Delete a trip and its packing list
 */
const deleteTrip = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tripId } = req.params;

    // Verify trip belongs to user
    const trip = await prisma.tripPlan.findFirst({
      where: {
        id: tripId,
        userId
      }
    });

    if (!trip) {
      return res.status(404).json({
        message: 'הטיול לא נמצא.'
      });
    }

    // Delete trip (cascade will delete packing items)
    await prisma.tripPlan.delete({
      where: { id: tripId }
    });

    res.status(200).json({
      message: 'הטיול נמחק בהצלחה.'
    });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({
      message: 'שגיאה במחיקת הטיול.'
    });
  }
};

/**
 * GET /api/trips/cached-packing
 * Get cached trip packing list for the user
 */
const getCachedPacking = async (req, res) => {
  try {
    const userId = req.user.id;

    const cached = await prisma.cachedTripPacking.findUnique({
      where: { userId }
    });

    if (!cached) {
      return res.status(200).json({ cached: null });
    }

    res.status(200).json({ cached });
  } catch (error) {
    console.error('Get cached packing error:', error);
    res.status(500).json({ message: 'שגיאה בטעינת רשימת האריזה השמורה.' });
  }
};

/**
 * POST /api/trips/cached-packing
 * Save cached trip packing list (replaces existing)
 */
const saveCachedPacking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { destination, startDate, endDate, activities, tripType, packingList, tripData } = req.body;

    if (!destination || !packingList) {
      return res.status(400).json({ message: 'חסרים נתונים לשמירה.' });
    }

    // Upsert: update if exists, create if not
    const cached = await prisma.cachedTripPacking.upsert({
      where: { userId },
      update: {
        destination,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        activities: activities || [],
        tripType: tripType || 'vacation',
        packingList,
        tripData: tripData || {},
        createdAt: new Date()
      },
      create: {
        userId,
        destination,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        activities: activities || [],
        tripType: tripType || 'vacation',
        packingList,
        tripData: tripData || {}
      }
    });

    res.status(200).json({ message: 'רשימת האריזה נשמרה בהצלחה!', cached });
  } catch (error) {
    console.error('Save cached packing error:', error);
    res.status(500).json({ message: 'שגיאה בשמירת רשימת האריזה.' });
  }
};

/**
 * DELETE /api/trips/cached-packing
 * Delete cached trip packing list
 */
const deleteCachedPacking = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.cachedTripPacking.deleteMany({
      where: { userId }
    });

    res.status(200).json({ message: 'רשימת האריזה נמחקה בהצלחה.' });
  } catch (error) {
    console.error('Delete cached packing error:', error);
    res.status(500).json({ message: 'שגיאה במחיקת רשימת האריזה.' });
  }
};

module.exports = {
  generateTripList,
  getMyTrips,
  getTripById,
  updatePackingItem,
  deleteTrip,
  getCachedPacking,
  saveCachedPacking,
  deleteCachedPacking
};
