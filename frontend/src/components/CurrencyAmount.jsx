import { useState, useEffect } from 'react';
import { convertFromUSD, formatCurrency, getUserCurrency } from '../utils/currency';

const CurrencyAmount = ({ 
  amount, 
  className = '', 
  showOriginal = false,
  originalCurrency = 'USD'
}) => {
  const [converted, setConverted] = useState(null);
  const [userCurrency, setUserCurrency] = useState('USD');

  useEffect(() => {
    const currency = getUserCurrency();
    setUserCurrency(currency);
    
    const convert = async () => {
      try {
        const convertedAmount = await convertFromUSD(amount, currency);
        setConverted(convertedAmount);
      } catch (error) {
        console.error('Currency conversion error:', error);
        setConverted(amount);
      }
    };

    convert();
  }, [amount, originalCurrency]);

  if (converted === null) {
    return <span className={className}>Loading...</span>;
  }

  const formattedAmount = formatCurrency(converted, userCurrency);

  return (
    <span className={className}>
      {formattedAmount}
      {showOriginal && userCurrency !== originalCurrency && (
        <span className="text-xs text-gray-500 ml-1">
          ({formatCurrency(amount, originalCurrency)})
        </span>
      )}
    </span>
  );
};

export default CurrencyAmount;

