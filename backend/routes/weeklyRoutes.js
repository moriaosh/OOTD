const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const weeklyController = require('../controllers/weeklyController');

router.post('/save', verifyToken, weeklyController.saveWeeklyPlan);
router.get('/', verifyToken, weeklyController.getWeeklyPlan);

module.exports = router;