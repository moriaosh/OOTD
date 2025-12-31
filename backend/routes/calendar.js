const express = require('express');
const router = express.Router();
const { getCalendarRecommendation } = require('../controllers/calendarController');

// בלי authMiddleware בשלב הזה
router.post('/recommend', getCalendarRecommendation);

module.exports = router;
