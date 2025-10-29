const express = require('express');
const router = express.Router();
const { getOverallStats } = require('../controllers/dashboardController');
const { protect, isApproved } = require('../middleware/authMiddleware');

router.get('/stats', protect, isApproved, getOverallStats);

module.exports = router;

