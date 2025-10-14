import api from './api';

// Cache for exchange rates
let exchangeRatesCache = {
  rates: null,
  lastUpdate: null,
  baseCurrency: 'USD'
};

// Currency symbols
export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  LKR: 'Rs',
  INR: '₹',
  AUD: 'A$',
  CAD: 'C$',
  SGD: 'S$',
  CNY: '¥'
};

/**
 * Fetch exchange rates from backend
 */
export const fetchExchangeRates = async () => {
  try {
    const response = await api.get('/currency/rates');
    exchangeRatesCache = {
      rates: response.data.data.rates,
      lastUpdate: new Date().toISOString(),
      baseCurrency: response.data.data.base || 'USD'
    };
    return exchangeRatesCache;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return exchangeRatesCache;
  }
};

/**
 * Get cached exchange rates (fetch if needed)
 */
export const getExchangeRates = async () => {
  const now = new Date();
  const cacheAge = exchangeRatesCache.lastUpdate 
    ? (now - new Date(exchangeRatesCache.lastUpdate)) / 1000 / 60 / 60 // hours
    : 24;

  // Update cache if older than 24 hours or empty
  if (!exchangeRatesCache.rates || cacheAge >= 24) {
    await fetchExchangeRates();
  }

  return exchangeRatesCache;
};

/**
 * Convert amount from USD to target currency
 */
export const convertFromUSD = async (amountUSD, targetCurrency) => {
  if (targetCurrency === 'USD' || !targetCurrency) {
    return amountUSD;
  }

  const { rates } = await getExchangeRates();
  
  if (!rates || !rates[targetCurrency]) {
    console.warn(`Exchange rate for ${targetCurrency} not found`);
    return amountUSD;
  }

  return amountUSD * rates[targetCurrency];
};

/**
 * Format amount with currency symbol
 */
export const formatCurrency = (amount, currencyCode = 'USD') => {
  const symbol = CURRENCY_SYMBOLS[currencyCode] || '$';
  
  // Special formatting for JPY (no decimal places)
  if (currencyCode === 'JPY') {
    return `${symbol}${Math.round(amount).toLocaleString()}`;
  }
  
  return `${symbol}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

/**
 * Get user's preferred currency from localStorage
 */
export const getUserCurrency = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.currency || 'USD';
};

/**
 * Convert and format amount for display
 * Assumes all amounts in DB are stored in USD
 */
export const displayAmount = async (amountUSD, userCurrency = null) => {
  const currency = userCurrency || getUserCurrency();
  const converted = await convertFromUSD(amountUSD, currency);
  return formatCurrency(converted, currency);
};

/**
 * Get currency info with conversion
 */
export const getAmountWithConversion = async (amountUSD, userCurrency = null) => {
  const currency = userCurrency || getUserCurrency();
  const convertedAmount = await convertFromUSD(amountUSD, currency);
  
  return {
    original: amountUSD,
    originalCurrency: 'USD',
    converted: convertedAmount,
    userCurrency: currency,
    formatted: formatCurrency(convertedAmount, currency)
  };
};

/**
 * Batch convert multiple amounts
 */
export const convertMultipleAmounts = async (amounts, targetCurrency = null) => {
  const currency = targetCurrency || getUserCurrency();
  const { rates } = await getExchangeRates();
  
  if (!rates || !rates[currency] || currency === 'USD') {
    return amounts;
  }

  const rate = rates[currency];
  return amounts.map(amount => amount * rate);
};

