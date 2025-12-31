// Purchase Advisor Routes
// Endpoints for analyzing purchase compatibility with existing wardrobe

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { analyzePurchase } = require('../controllers/purchaseController');

// All routes require authentication
router.use(verifyToken);

/**
 * POST /api/purchase/analyze
 * Analyze if a potential purchase matches user's wardrobe
 *
 * Body:
 * {
 *   "imageUrl": "https://example.com/shirt.jpg",
 *   "itemName": "Blue Shirt",
 *   "itemType": "חולצה"
 * }
 *
 * Response:
 * {
 *   "score": 8,
 *   "explanation": "החולצה הכחולה...",
 *   "recommendations": "תלבשי עם...",
 *   "warnings": null,
 *   "closetSize": 15
 * }
 */
router.post('/analyze', analyzePurchase);

module.exports = router;
