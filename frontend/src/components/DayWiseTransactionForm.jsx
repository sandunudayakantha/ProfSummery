import { useState } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import api from '../utils/api';

const DayWiseTransactionForm = ({ onSubmit, onCancel, preSelectedDate = null }) => {
  const { formatAmount, userCurrency, getCurrencySymbol } = useCurrency();
  const [date, setDate] = useState(preSelectedDate || new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState([
    { type: 'income', amount: '', description: '' }
  ]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const addItem = (type) => {
    setItems([...items, { type, amount: '', description: '' }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
    
    // Clear error for this item
    if (errors[`item${index}`]) {
      const newErrors = { ...errors };
      delete newErrors[`item${index}`];
      setErrors(newErrors);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!date) {
      newErrors.date = 'Please select a date';
    } else {
      // Check if date is in the future
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate > today) {
        newErrors.date = 'Cannot add transactions for future dates';
      }
    }

    items.forEach((item, index) => {
      if (!item.description.trim()) {
        newErrors[`item${index}`] = 'Please enter a description';
      }
      if (!item.amount || item.amount <= 0) {
        newErrors[`item${index}`] = 'Please enter a valid amount';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setLoading(true);
    try {
      // Convert amounts from user currency to USD before sending to backend
      const convertedItems = await Promise.all(
        items.map(async (item) => {
          if (userCurrency === 'USD') {
            return item;
          }
          
          // Convert from user currency to USD
          try {
            const response = await api.post('/currency/convert', {
              amount: parseFloat(item.amount),
              from: userCurrency,
              to: 'USD'
            });
            
            return {
              ...item,
              amount: response.data.data.convertedAmount
            };
          } catch (error) {
            console.error('Conversion error:', error);
            return item; // Fallback to original if conversion fails
          }
        })
      );
      
      await onSubmit({ date, items: convertedItems });
      
      // Reset form
      setDate(preSelectedDate || new Date().toISOString().split('T')[0]);
      setItems([{ type: 'income', amount: '', description: '' }]);
      setErrors({});
    } catch (error) {
      console.error('Error submitting transactions:', error);
      setErrors({ submit: 'Failed to add transactions' });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const totalIncome = items
      .filter(item => item.type === 'income' && item.amount)
      .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    
    const totalExpense = items
      .filter(item => item.type === 'expense' && item.amount)
      .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    
    return { totalIncome, totalExpense, netTotal: totalIncome - totalExpense };
  };

  const totals = calculateTotals();

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto">
      {errors.submit && (
        <div className="bg-red-500/20 border border-red-400/50 text-red-200 px-4 py-3 rounded-lg">
          {errors.submit}
        </div>
      )}

      {/* Date Selection */}
      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">
          Transaction Date *
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          disabled={preSelectedDate !== null}
          className={`w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:bg-white/10 transition-all ${errors.date ? 'border-red-400' : ''} ${preSelectedDate ? 'bg-white/10 cursor-not-allowed' : ''}`}
          onFocus={(e) => e.target.style.borderColor = 'rgba(144, 224, 247, 0.5)'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
          required
        />
        {errors.date && (
          <p className="text-red-400 text-sm mt-1">{errors.date}</p>
        )}
        {preSelectedDate ? (
          <p className="text-xs text-blue-400 mt-1">
            Adding to existing date: {new Date(preSelectedDate).toLocaleDateString()}
          </p>
        ) : (
          <p className="text-xs text-white/50 mt-1">
            Future dates are not allowed
          </p>
        )}
      </div>

      {/* Transaction Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-white/90">Transactions for this day</h3>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => addItem('income')}
              className="text-xs px-3 py-1 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 border border-green-400/30 transition-all duration-300"
            >
              + Income
            </button>
            <button
              type="button"
              onClick={() => addItem('expense')}
              className="text-xs px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 border border-red-400/30 transition-all duration-300"
            >
              + Expense
            </button>
          </div>
        </div>

        {items.map((item, index) => (
          <div
            key={index}
            className={`p-3 border-2 rounded-lg ${
              item.type === 'income' ? 'border-green-400/30 bg-green-500/10' : 'border-red-400/30 bg-red-500/10'
            }`}
          >
            <div className="flex items-start space-x-3">
              {/* Type Badge */}
              <div className="flex-shrink-0 mt-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  item.type === 'income' 
                    ? 'bg-green-500/20 text-green-400 border border-green-400/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-400/30'
                }`}>
                  {item.type === 'income' ? '↑ Income' : '↓ Expense'}
                </span>
              </div>

              {/* Form Fields */}
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  placeholder="Description (e.g., Client payment, Office rent)"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:bg-white/10 transition-all text-sm"
                  onFocus={(e) => e.target.style.borderColor = 'rgba(144, 224, 247, 0.5)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                  required
                />
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 font-semibold">
                    {getCurrencySymbol()}
                  </span>
                  <input
                    type="number"
                    value={item.amount}
                    onChange={(e) => updateItem(index, 'amount', e.target.value)}
                    placeholder={`Amount in ${userCurrency}`}
                    step={userCurrency === 'JPY' ? '1' : '0.01'}
                    min="0"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:bg-white/10 transition-all text-sm pl-8"
                    onFocus={(e) => e.target.style.borderColor = 'rgba(144, 224, 247, 0.5)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                    required
                  />
                </div>
              </div>

              {/* Remove Button */}
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="flex-shrink-0 text-white/40 hover:text-red-400 mt-2 transition-colors duration-300"
                  title="Remove item"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            {errors[`item${index}`] && (
              <p className="text-red-400 text-xs mt-1 ml-16">{errors[`item${index}`]}</p>
            )}
          </div>
        ))}
      </div>

      {/* Totals Summary */}
      <div className="bg-white/5 p-4 rounded-lg border border-white/20">
        <h4 className="text-sm font-medium text-white/90 mb-2">Day Summary (in {userCurrency})</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-white/60">Total Income:</span>
            <p className="font-bold text-green-400 break-words">{formatAmount(totals.totalIncome)}</p>
          </div>
          <div>
            <span className="text-white/60">Total Expenses:</span>
            <p className="font-bold text-red-400 break-words">{formatAmount(totals.totalExpense)}</p>
          </div>
          <div>
            <span className="text-white/60">Net:</span>
            <p className={`font-bold break-words ${totals.netTotal >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
              {formatAmount(totals.netTotal)}
            </p>
          </div>
        </div>
        <p className="text-xs text-white/50 mt-3">
          💡 Amounts will be automatically converted to USD for storage
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4 border-t border-white/20">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 text-white rounded-lg font-medium shadow-lg transition-all duration-300 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#90e0f7' }}
        >
          {loading ? '💱 Converting & Saving...' : `💾 Save ${items.length} Transaction${items.length > 1 ? 's' : ''}`}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all duration-300"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default DayWiseTransactionForm;

