const express = require('express');
const router = express.Router();
const { getCalendarRecommendation } = require('../controllers/calendarController');
const { verifyToken } = require('../middleware/auth');

// Protected route - requires authentication
router.post('/recommend', verifyToken, getCalendarRecommendation);

module.exports = router;
