const express = require('express');
const router = express.Router();
// ודאי שהנתיב ל-middleware הוא רק תיקייה אחת אחורה!
const { verifyToken } = require('../middleware/auth');
// ודאי שאת מייבאת את כל הפונקציות מתוך האובייקט המיוצא.
const {
    addItem,
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
} = require('../controllers/closetController');

// POST /api/closet/add-item
router.post('/add-item', verifyToken, addItem);

// GET /api/closet/my-items
router.get('/my-items', verifyToken, getMyItems);

// GET /api/closet/suggestions (Task 95 - New AI MVP Route)
router.get('/suggestions', verifyToken, generateOutfitSuggestions);

// PUT /api/closet/:id - Update item
router.put('/:id', verifyToken, updateItem);

// DELETE /api/closet/:id - Delete item
router.delete('/:id', verifyToken, deleteItem);

// PATCH /api/closet/:id/laundry - Toggle laundry status
router.patch('/:id/laundry', verifyToken, toggleLaundry);

// PATCH /api/closet/:id/favorite - Toggle favorite status
router.patch('/:id/favorite', verifyToken, toggleFavorite);

// GET /api/closet/backup - Download user data backup
router.get('/backup', verifyToken, backupUserData);

// POST /api/closet/bulk-upload - Upload multiple items from Excel/CSV
router.post('/bulk-upload', verifyToken, bulkUploadItems);

// POST /api/closet/restore - Restore user data from JSON backup
router.post('/restore', verifyToken, restoreUserData);

// GET /api/closet/statistics - Get wardrobe statistics
router.get('/statistics', verifyToken, getWardrobeStatistics);

// Cached AI Suggestion routes
// GET /api/closet/cached-suggestion - Get cached weather suggestion
router.get('/cached-suggestion', verifyToken, getCachedSuggestion);

// POST /api/closet/cached-suggestion - Save cached weather suggestion
router.post('/cached-suggestion', verifyToken, saveCachedSuggestion);

// DELETE /api/closet/cached-suggestion - Delete cached weather suggestion
router.delete('/cached-suggestion', verifyToken, deleteCachedSuggestion);

module.exports = router;