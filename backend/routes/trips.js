// Trips Routes - Smart Packing List Endpoints

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
  generateTripList,
  getMyTrips,
  getTripById,
  updatePackingItem,
  deleteTrip
} = require('../controllers/tripsController');

// All routes require authentication
router.use(verifyToken);

/**
 * POST /api/trips/generate
 * Generate AI-powered packing list for a new trip
 *
 * Body:
 * {
 *   "destination": "Paris",
 *   "startDate": "2024-06-01",
 *   "endDate": "2024-06-07",
 *   "activities": ["Hiking", "Night Out", "Casual"],
 *   "packingStyle": "Standard"
 * }
 */
router.post('/generate', generateTripList);

/**
 * GET /api/trips/my-trips
 * Get all trips for the logged-in user
 */
router.get('/my-trips', getMyTrips);

/**
 * GET /api/trips/:tripId
 * Get a specific trip with packing list
 */
router.get('/:tripId', getTripById);

/**
 * PATCH /api/trips/:tripId/items/:itemId
 * Update packing item (mark as packed, change quantity)
 *
 * Body:
 * {
 *   "isPacked": true,
 *   "quantity": 2
 * }
 */
router.patch('/:tripId/items/:itemId', updatePackingItem);

/**
 * DELETE /api/trips/:tripId
 * Delete a trip and its packing list
 */
router.delete('/:tripId', deleteTrip);

module.exports = router;
