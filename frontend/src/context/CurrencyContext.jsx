import { createContext, useState, useEffect, useContext } from 'react';
import { fetchExchangeRates, formatCurrency as formatCurrencyUtil, CURRENCY_SYMBOLS } from '../utils/currency';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [userCurrency, setUserCurrency] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user currency from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const currency = user.currency || 'USD';
    setUserCurrency(currency);

    // Fetch exchange rates
    loadExchangeRates();
  }, []);

  const loadExchangeRates = async () => {
    try {
      const rates = await fetchExchangeRates();
      setExchangeRates(rates);
    } catch (error) {
      console.error('Error loading exchange rates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Convert amount from USD to user's currency
  const convertAmount = (amountUSD) => {
    if (!exchangeRates || !exchangeRates.rates || userCurrency === 'USD') {
      return amountUSD;
    }

    const rate = exchangeRates.rates[userCurrency];
    if (!rate) {
      return amountUSD;
    }

    return amountUSD * rate;
  };

  // Format amount with user's currency symbol
  const formatAmount = (amountUSD) => {
    const converted = convertAmount(amountUSD);
    return formatCurrencyUtil(converted, userCurrency);
  };

  // Get currency symbol
  const getCurrencySymbol = () => {
    return CURRENCY_SYMBOLS[userCurrency] || '$';
  };

  // Update user currency
  const updateUserCurrency = (newCurrency) => {
    setUserCurrency(newCurrency);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    user.currency = newCurrency;
    localStorage.setItem('user', JSON.stringify(user));
  };

  const value = {
    userCurrency,
    exchangeRates,
    loading,
    convertAmount,
    formatAmount,
    getCurrencySymbol,
    updateUserCurrency,
    refreshRates: loadExchangeRates
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export default CurrencyContext;

