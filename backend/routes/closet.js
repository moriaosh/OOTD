const express = require('express');
const router = express.Router();
// ודאי שהנתיב ל-middleware הוא רק תיקייה אחת אחורה!
const { verifyToken } = require('../middleware/auth'); 
// ודאי שאת מייבאת את כל שלוש הפונקציות מתוך האובייקט המיוצא.
const { addItem, getMyItems, generateOutfitSuggestions } = require('../controllers/closetController'); 

// POST /api/closet/add-item
router.post('/add-item', verifyToken, addItem);

// GET /api/closet/my-items
router.get('/my-items', verifyToken, getMyItems);

// GET /api/closet/suggestions (Task 95 - New AI MVP Route)
router.get('/suggestions', verifyToken, generateOutfitSuggestions);

module.exports = router;