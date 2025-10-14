const express = require('express');
const router = express.Router();
const {
  getExchangeRates,
  getSupportedCurrencies,
  convertAmount
} = require('../controllers/currencyController');
const { protect } = require('../middleware/authMiddleware');

// Public routes - no authentication required
router.get('/rates', getExchangeRates);
router.get('/supported', getSupportedCurrencies);

// Protected routes - authentication required
router.post('/convert', protect, convertAmount);

module.exports = router;

