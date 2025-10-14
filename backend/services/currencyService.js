const axios = require('axios');

// Cache for exchange rates (updated every 24 hours)
let exchangeRatesCache = {
  rates: null,
  lastUpdate: null,
  baseCurrency: 'USD'
};

// Supported currencies with symbols
const SUPPORTED_CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
  GBP: { symbol: '£', name: 'British Pound' },
  JPY: { symbol: '¥', name: 'Japanese Yen' },
  LKR: { symbol: 'Rs', name: 'Sri Lankan Rupee' },
  INR: { symbol: '₹', name: 'Indian Rupee' },
  AUD: { symbol: 'A$', name: 'Australian Dollar' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar' },
  CNY: { symbol: '¥', name: 'Chinese Yuan' }
};

/**
 * Fetch exchange rates from API
 * Using exchangerate.host free API (no key required, unlimited requests)
 */
const fetchExchangeRates = async () => {
  try {
    // Using exchangerate.host free API - no key required
    // Alternative: https://api.exchangerate.host/latest?base=USD
    const response = await axios.get('https://api.exchangerate.host/latest', {
      params: {
        base: 'USD',
        places: 6
      },
      timeout: 5000
    });
    
    if (response.data && response.data.rates) {
      return {
        rates: response.data.rates,
        base: response.data.base || 'USD',
        date: response.data.date || new Date().toISOString().split('T')[0]
      };
    }
    
    // If no rates in response, throw error to trigger fallback
    throw new Error('Invalid API response');
  } catch (error) {
    console.error('Error fetching exchange rates from API:', error.message);
    
    // Return cached rates if API fails
    if (exchangeRatesCache.rates) {
      console.log('Using cached exchange rates');
      return {
        rates: exchangeRatesCache.rates,
        base: exchangeRatesCache.baseCurrency,
        date: exchangeRatesCache.lastUpdate
      };
    }
    
    // If no cache available, use fallback rates
    console.log('Using fallback exchange rates');
    return {
      rates: getFallbackRates(),
      base: 'USD',
      date: new Date().toISOString().split('T')[0]
    };
  }
};

/**
 * Fallback exchange rates (approximate, updated periodically)
 * Used when API is unavailable and no cache exists
 */
const getFallbackRates = () => {
  return {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 149.50,
    LKR: 325.00,
    INR: 83.20,
    AUD: 1.52,
    CAD: 1.36,
    SGD: 1.34,
    CNY: 7.24
  };
};

/**
 * Get current exchange rates (with caching)
 */
const getExchangeRates = async () => {
  const now = new Date();
  const cacheAge = exchangeRatesCache.lastUpdate 
    ? (now - new Date(exchangeRatesCache.lastUpdate)) / 1000 / 60 / 60 // hours
    : 24; // Force update if no cache

  // Update cache if older than 24 hours or empty
  if (!exchangeRatesCache.rates || cacheAge >= 24) {
    try {
      const data = await fetchExchangeRates();
      exchangeRatesCache = {
        rates: data.rates,
        lastUpdate: now.toISOString(),
        baseCurrency: data.base
      };
      console.log('Exchange rates updated successfully');
    } catch (error) {
      console.error('Failed to update exchange rates:', error.message);
    }
  }

  return {
    ...exchangeRatesCache,
    cacheAge: cacheAge.toFixed(2)
  };
};

/**
 * Convert amount from one currency to another
 */
const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const { rates } = await getExchangeRates();

  if (!rates) {
    throw new Error('Exchange rates not available');
  }

  // Convert from source currency to USD first
  const amountInUSD = fromCurrency === 'USD' 
    ? amount 
    : amount / rates[fromCurrency];

  // Then convert from USD to target currency
  const convertedAmount = toCurrency === 'USD' 
    ? amountInUSD 
    : amountInUSD * rates[toCurrency];

  return convertedAmount;
};

/**
 * Get list of supported currencies
 */
const getSupportedCurrencies = () => {
  return Object.keys(SUPPORTED_CURRENCIES).map(code => ({
    code,
    symbol: SUPPORTED_CURRENCIES[code].symbol,
    name: SUPPORTED_CURRENCIES[code].name
  }));
};

/**
 * Get currency symbol
 */
const getCurrencySymbol = (currencyCode) => {
  return SUPPORTED_CURRENCIES[currencyCode]?.symbol || '$';
};

/**
 * Format amount with currency symbol
 */
const formatCurrency = (amount, currencyCode) => {
  const symbol = getCurrencySymbol(currencyCode);
  
  // Special formatting for JPY (no decimal places)
  if (currencyCode === 'JPY') {
    return `${symbol}${Math.round(amount).toLocaleString()}`;
  }
  
  return `${symbol}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

module.exports = {
  getExchangeRates,
  convertCurrency,
  getSupportedCurrencies,
  getCurrencySymbol,
  formatCurrency,
  SUPPORTED_CURRENCIES
};

