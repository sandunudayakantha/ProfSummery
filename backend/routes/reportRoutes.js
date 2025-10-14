const express = require('express');
const router = express.Router({ mergeParams: true }); // Merge params from parent router
const {
  generateReport,
  getStatistics
} = require('../controllers/reportController');
const { protect, checkBusinessAccess } = require('../middleware/authMiddleware');

// All routes require authentication and business access (any role can view reports)
router.use(protect);

router.get('/', checkBusinessAccess(), generateReport);
router.get('/stats', checkBusinessAccess(), getStatistics);

module.exports = router;

