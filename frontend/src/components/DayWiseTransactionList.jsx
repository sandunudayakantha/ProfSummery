import { useState } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { formatCurrency, convertFromUSD } from '../utils/currency';

const DayWiseTransactionList = ({ transactions, onEdit, onDelete, canEdit, onAddToDate, businessCurrency }) => {
  const [expandedDates, setExpandedDates] = useState(new Set());
  const { formatAmount, exchangeRates } = useCurrency();
  
  // Format amount using business currency if provided, otherwise use user's default currency
  const formatTransactionAmount = (amountUSD) => {
    if (businessCurrency) {
      // Use business currency
      if (businessCurrency === 'USD' || !exchangeRates?.rates) {
        return formatCurrency(amountUSD, 'USD');
      }
      const rate = exchangeRates.rates[businessCurrency];
      if (!rate) {
        return formatCurrency(amountUSD, 'USD');
      }
      const converted = amountUSD * rate;
      return formatCurrency(converted, businessCurrency);
    } else {
      // Use user's default currency
      return formatAmount(amountUSD);
    }
  };

  // Group transactions by date
  const groupByDate = () => {
    const grouped = {};
    
    transactions.forEach(transaction => {
      const dateKey = new Date(transaction.date).toISOString().split('T')[0];
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: dateKey,
          transactions: [],
          totalIncome: 0,
          totalExpense: 0,
          netTotal: 0
        };
      }
      
      grouped[dateKey].transactions.push(transaction);
      
      if (transaction.type === 'income') {
        grouped[dateKey].totalIncome += transaction.amount;
      } else {
        grouped[dateKey].totalExpense += transaction.amount;
      }
      
      grouped[dateKey].netTotal = grouped[dateKey].totalIncome - grouped[dateKey].totalExpense;
    });

    // Convert to array and sort by date (newest first)
    return Object.values(grouped).sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
  };

  const toggleDate = (dateKey) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(dateKey)) {
      newExpanded.delete(dateKey);
    } else {
      newExpanded.add(dateKey);
    }
    setExpandedDates(newExpanded);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const groupedData = groupByDate();

  if (groupedData.length === 0) {
    return (
      <div className="text-center py-12 text-white/60">
        <div className="text-4xl mb-4">📅</div>
        <h3 className="text-lg font-semibold text-white/90 mb-2">No transactions yet</h3>
        <p className="text-white/60">Add your first transaction to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {groupedData.map((dayData) => {
        const isExpanded = expandedDates.has(dayData.date);
        const incomeCount = dayData.transactions.filter(t => t.type === 'income').length;
        const expenseCount = dayData.transactions.filter(t => t.type === 'expense').length;

        return (
          <div key={dayData.date} className="bg-white/5 border border-white/20 rounded-lg p-6">
            {/* Date Header - Clickable to expand/collapse */}
            <div
              onClick={() => toggleDate(dayData.date)}
              className="cursor-pointer hover:bg-white/10 -m-6 p-6 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">📅</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {formatDate(dayData.date)}
                    </h3>
                    <p className="text-sm text-white/60">
                      {incomeCount} income • {expenseCount} expense
                    </p>
                  </div>
                </div>

                {/* Day Totals */}
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="text-sm text-green-400">
                      +{formatTransactionAmount(dayData.totalIncome)}
                    </div>
                    <div className="text-sm text-red-400">
                      -{formatTransactionAmount(dayData.totalExpense)}
                    </div>
                    <div className={`text-sm font-bold border-t border-white/20 mt-1 pt-1 ${
                      dayData.netTotal >= 0 ? 'text-blue-400' : 'text-red-400'
                    }`}>
                      Net: {formatTransactionAmount(dayData.netTotal)}
                    </div>
                  </div>

                  {/* Expand/Collapse Icon */}
                  <svg
                    className={`w-5 h-5 text-white/60 transition-transform ${
                      isExpanded ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Transaction Items - Show when expanded (Side by Side) */}
            {isExpanded && (
              <div className="mt-4 pt-4 border-t border-white/20">
                {/* Add More Button */}
                {canEdit && onAddToDate && (
                  <div className="mb-4 flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToDate(dayData.date);
                      }}
                      className="px-4 py-2 text-white rounded-lg font-medium shadow-lg transition-all duration-300 hover:opacity-90 text-sm"
                      style={{ backgroundColor: '#90e0f7' }}
                    >
                      + Add More to This Day
                    </button>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Income Column (Left) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-green-400 flex items-center">
                        <span className="mr-2">↑</span> Income
                      </h4>
                      <span className="text-sm font-bold text-green-400">
                        {formatTransactionAmount(dayData.totalIncome)}
                      </span>
                    </div>
                    
                    {dayData.transactions.filter(t => t.type === 'income').length === 0 ? (
                      <div className="text-center py-4 text-white/40 text-sm border-2 border-dashed border-white/20 rounded-lg">
                        No income
                      </div>
                    ) : (
                      dayData.transactions
                        .filter(t => t.type === 'income')
                        .map((transaction) => (
                          <div
                            key={transaction._id}
                            className="bg-green-500/10 border-l-4 border-green-400 p-3 rounded-r-lg"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-white text-sm">
                                  {transaction.description}
                                </div>
                                <div className="text-xs text-white/60 mt-1">
                                  {transaction.addedBy?.name}
                                </div>
                              </div>
                              <div className="text-right ml-3">
                                <div className="text-base font-bold text-green-400">
                                  +{formatTransactionAmount(transaction.amount)}
                                </div>
                                {canEdit && (
                                  <div className="flex space-x-1 mt-1">
                                    <button
                                      onClick={() => onEdit(transaction)}
                                      className="text-xs text-blue-400 hover:text-blue-300"
                                    >
                                      Edit
                                    </button>
                                    <span className="text-white/30">|</span>
                                    <button
                                      onClick={() => onDelete(transaction._id)}
                                      className="text-xs text-red-400 hover:text-red-300"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>

                  {/* Expense Column (Right) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-red-400 flex items-center">
                        <span className="mr-2">↓</span> Expenses
                      </h4>
                      <span className="text-sm font-bold text-red-400">
                        {formatTransactionAmount(dayData.totalExpense)}
                      </span>
                    </div>
                    
                    {dayData.transactions.filter(t => t.type === 'expense').length === 0 ? (
                      <div className="text-center py-4 text-white/40 text-sm border-2 border-dashed border-white/20 rounded-lg">
                        No expenses
                      </div>
                    ) : (
                      dayData.transactions
                        .filter(t => t.type === 'expense')
                        .map((transaction) => (
                          <div
                            key={transaction._id}
                            className="bg-red-500/10 border-l-4 border-red-400 p-3 rounded-r-lg"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-white text-sm">
                                  {transaction.description}
                                </div>
                                <div className="text-xs text-white/60 mt-1">
                                  {transaction.addedBy?.name}
                                </div>
                              </div>
                              <div className="text-right ml-3">
                                <div className="text-base font-bold text-red-400">
                                  -{formatTransactionAmount(transaction.amount)}
                                </div>
                                {canEdit && (
                                  <div className="flex space-x-1 mt-1">
                                    <button
                                      onClick={() => onEdit(transaction)}
                                      className="text-xs text-blue-400 hover:text-blue-300"
                                    >
                                      Edit
                                    </button>
                                    <span className="text-white/30">|</span>
                                    <button
                                      onClick={() => onDelete(transaction._id)}
                                      className="text-xs text-red-400 hover:text-red-300"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DayWiseTransactionList;

