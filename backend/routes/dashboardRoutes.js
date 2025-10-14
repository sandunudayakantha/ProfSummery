const express = require('express');
const router = express.Router();
const { getOverallStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', protect, getOverallStats);

module.exports = router;

