// Outfit Routes
// Endpoints for managing saved outfits

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { createOutfit, getUserOutfits, deleteOutfit, toggleFavorite } = require('../controllers/outfitController');

// All routes require authentication
router.use(verifyToken);

/**
 * POST /api/outfits
 * Create a new saved outfit
 */
router.post('/', createOutfit);

/**
 * GET /api/outfits
 * Get all user's saved outfits
 * Query params: ?favoritesOnly=true (optional)
 */
router.get('/', getUserOutfits);

/**
 * DELETE /api/outfits/:id
 * Delete a saved outfit
 */
router.delete('/:id', deleteOutfit);

/**
 * PATCH /api/outfits/:id/favorite
 * Toggle favorite status of an outfit
 */
router.patch('/:id/favorite', toggleFavorite);

module.exports = router;
