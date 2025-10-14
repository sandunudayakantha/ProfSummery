const express = require('express');
const router = express.Router();
const {
  getExchangeRates,
  getSupportedCurrencies,
  convertAmount
} = require('../controllers/currencyController');
const { protect } = require('../middleware/authMiddleware');

router.get('/rates', protect, getExchangeRates);
router.get('/supported', getSupportedCurrencies);
router.post('/convert', protect, convertAmount);

module.exports = router;

