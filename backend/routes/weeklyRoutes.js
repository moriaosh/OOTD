const express = require('express');
const router = express.Router();
const weeklyController = require('../controllers/weeklyController');

router.post('/save', weeklyController.saveWeeklyPlan);
router.get('/', weeklyController.getWeeklyPlan);

module.exports = router;