const { 
  getExchangeRates, 
  getSupportedCurrencies, 
  convertCurrency 
} = require('../services/currencyService');

// @desc    Get current exchange rates
// @route   GET /api/currency/rates
// @access  Private
exports.getExchangeRates = async (req, res) => {
  try {
    const ratesData = await getExchangeRates();
    
    res.status(200).json({
      success: true,
      data: ratesData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching exchange rates',
      error: error.message
    });
  }
};

// @desc    Get supported currencies
// @route   GET /api/currency/supported
// @access  Public
exports.getSupportedCurrencies = async (req, res) => {
  try {
    const currencies = getSupportedCurrencies();
    
    res.status(200).json({
      success: true,
      data: currencies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching supported currencies',
      error: error.message
    });
  }
};

// @desc    Convert amount between currencies
// @route   POST /api/currency/convert
// @access  Private
exports.convertAmount = async (req, res) => {
  try {
    const { amount, from, to } = req.body;

    if (!amount || !from || !to) {
      return res.status(400).json({
        success: false,
        message: 'Please provide amount, from currency, and to currency'
      });
    }

    const convertedAmount = await convertCurrency(amount, from, to);

    res.status(200).json({
      success: true,
      data: {
        originalAmount: amount,
        originalCurrency: from,
        convertedAmount: convertedAmount,
        targetCurrency: to,
        rate: convertedAmount / amount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error converting currency',
      error: error.message
    });
  }
};

