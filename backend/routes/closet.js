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
    backupUserData,
    bulkUploadItems,
    restoreUserData,
    getWardrobeStatistics
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

// GET /api/closet/backup - Download user data backup
router.get('/backup', verifyToken, backupUserData);

// POST /api/closet/bulk-upload - Upload multiple items from Excel/CSV
router.post('/bulk-upload', verifyToken, bulkUploadItems);

// POST /api/closet/restore - Restore user data from JSON backup
router.post('/restore', verifyToken, restoreUserData);

// GET /api/closet/statistics - Get wardrobe statistics
router.get('/statistics', verifyToken, getWardrobeStatistics);

module.exports = router;