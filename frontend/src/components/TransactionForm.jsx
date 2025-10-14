import { useState, useEffect } from 'react';
import { useCurrency } from '../context/CurrencyContext';

const TransactionForm = ({ onSubmit, initialData = null, onCancel }) => {
  const { userCurrency, getCurrencySymbol, convertAmount } = useCurrency();
  const [formData, setFormData] = useState({
    type: initialData?.type || 'income',
    amount: '', // Will be set in useEffect after conversion
    description: initialData?.description || '',
    date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Convert initial amount from USD to user currency when editing
  useEffect(() => {
    if (initialData?.amount) {
      const convertedAmount = convertAmount(initialData.amount);
      setFormData(prev => ({ ...prev, amount: convertedAmount }));
    }
  }, [initialData]);

  const validate = () => {
    const newErrors = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Please enter a description';
    }

    if (!formData.date) {
      newErrors.date = 'Please select a date';
    } else {
      // Check if date is in the future
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate > today) {
        newErrors.date = 'Cannot add transactions for future dates';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setLoading(true);
    try {
      // Convert amount from user currency to USD before sending
      let submissionData = { ...formData };
      
      if (userCurrency !== 'USD') {
        const api = (await import('../utils/api')).default;
        try {
          const response = await api.post('/currency/convert', {
            amount: parseFloat(formData.amount),
            from: userCurrency,
            to: 'USD'
          });
          submissionData.amount = response.data.data.convertedAmount;
        } catch (error) {
          console.error('Currency conversion error:', error);
        }
      }
      
      await onSubmit(submissionData);
      
      // Reset form if not editing
      if (!initialData) {
        setFormData({
          type: 'income',
          amount: '',
          description: '',
          date: new Date().toISOString().split('T')[0]
        });
      }
    } catch (error) {
      console.error('Error submitting transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Transaction Type
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="type"
              value="income"
              checked={formData.type === 'income'}
              onChange={handleChange}
              className="mr-2"
            />
            <span className="text-green-600 font-medium">Income</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="type"
              value="expense"
              checked={formData.type === 'expense'}
              onChange={handleChange}
              className="mr-2"
            />
            <span className="text-red-600 font-medium">Expense</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amount (in {userCurrency})
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold text-lg">
            {getCurrencySymbol()}
          </span>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            step={userCurrency === 'JPY' ? '1' : '0.01'}
            min="0"
            placeholder={userCurrency === 'JPY' ? '150000' : '0.00'}
            className={`input pl-10 ${errors.amount ? 'border-red-500' : ''}`}
          />
        </div>
        {errors.amount && (
          <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Amount will be converted to USD for storage
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter transaction description"
          className={`input ${errors.description ? 'border-red-500' : ''}`}
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date
        </label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          max={new Date().toISOString().split('T')[0]}
          className={`input ${errors.date ? 'border-red-500' : ''}`}
        />
        {errors.date && (
          <p className="text-red-500 text-sm mt-1">{errors.date}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Future dates are not allowed
        </p>
      </div>

      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary flex-1"
        >
          {loading ? 'Saving...' : initialData ? 'Update Transaction' : 'Add Transaction'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default TransactionForm;

