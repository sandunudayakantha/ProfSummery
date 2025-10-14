import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../utils/api';
import { useCurrency } from '../context/CurrencyContext';

const Reports = () => {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    period: 'monthly',
    startDate: '',
    endDate: ''
  });
  const { formatAmount, userCurrency, getCurrencySymbol } = useCurrency();

  useEffect(() => {
    fetchBusiness();
  }, [id]);

  useEffect(() => {
    if (business) {
      fetchReport();
    }
  }, [filters, business]);

  const fetchBusiness = async () => {
    try {
      const response = await api.get(`/business/${id}`);
      setBusiness(response.data.data);
    } catch (error) {
      console.error('Error fetching business:', error);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (filters.period !== 'custom') {
        params.append('period', filters.period);
      } else if (filters.startDate && filters.endDate) {
        // Validate dates are not in the future
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = new Date(filters.startDate);
        const end = new Date(filters.endDate);
        
        if (start > today || end > today) {
          alert('Cannot select future dates for reports');
          setLoading(false);
          return;
        }
        
        if (start > end) {
          alert('Start date cannot be after end date');
          setLoading(false);
          return;
        }
        
        params.append('startDate', filters.startDate);
        params.append('endDate', filters.endDate);
      }

      const response = await api.get(`/business/${id}/reports?${params.toString()}`);
      setReportData(response.data.data);
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(20);
      doc.text(business.name, 14, 20);
      
      doc.setFontSize(12);
      doc.text(`Financial Report`, 14, 30);
      doc.text(`Period: ${new Date(reportData.startDate).toLocaleDateString()} - ${new Date(reportData.endDate).toLocaleDateString()}`, 14, 37);
      
      // Summary
      doc.setFontSize(14);
      doc.text('Summary', 14, 50);
      
      autoTable(doc, {
        startY: 55,
        head: [['Metric', 'Amount']],
        body: [
          ['Total Income', formatAmount(reportData.summary.totalIncome)],
          ['Total Expenses', formatAmount(reportData.summary.totalExpense)],
          ['Net Profit', formatAmount(reportData.summary.profit)],
          ['Total Transactions', reportData.summary.transactionCount.toString()],
          ['Currency', userCurrency]
        ],
      });
      
      // Transactions
      doc.setFontSize(14);
      const finalY = doc.lastAutoTable?.finalY || 100;
      doc.text('Transactions', 14, finalY + 15);
      
      const transactionData = reportData.transactions.all.map(t => [
        new Date(t.date).toLocaleDateString(),
        t.type,
        t.description,
        formatAmount(t.amount),
        t.addedBy.name
      ]);
      
      autoTable(doc, {
        startY: finalY + 20,
        head: [['Date', 'Type', 'Description', 'Amount', 'Added By']],
        body: transactionData,
      });
      
      doc.save(`${business.name}-report-${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const downloadCSV = () => {
    const headers = ['Date', 'Type', 'Description', `Amount (${userCurrency})`, 'Added By'];
    const rows = reportData.transactions.all.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.type,
      t.description,
      formatAmount(t.amount),
      t.addedBy.name
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${business.name}-report-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading || !reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Reports</h1>
        <p className="text-gray-600">{business?.name}</p>
        <Link to={`/business/${id}`} className="text-primary-600 hover:text-primary-700 text-sm">
          ← Back to Business
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
            <select
              value={filters.period}
              onChange={(e) => setFilters({ ...filters, period: e.target.value })}
              className="input"
            >
              <option value="daily">Today</option>
              <option value="monthly">This Month</option>
              <option value="yearly">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {filters.period === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  className="input"
                />
                <p className="text-xs text-gray-500 mt-1">Future dates are not allowed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  min={filters.startDate}
                  max={new Date().toISOString().split('T')[0]}
                  className="input"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {filters.startDate 
                    ? 'Must be after start date and not in future' 
                    : 'Future dates are not allowed'}
                </p>
              </div>
            </>
          )}

          <div className="flex items-end space-x-2">
            <button onClick={downloadPDF} className="btn btn-primary">
              📄 Download PDF
            </button>
            <button onClick={downloadCSV} className="btn btn-secondary">
              📊 Download CSV
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card bg-green-50">
          <div className="text-sm font-medium text-green-800">Total Income</div>
          <div className="text-xl sm:text-2xl font-bold text-green-600 mt-2 break-words">
            {formatAmount(reportData.summary.totalIncome)}
          </div>
          <div className="text-sm text-green-700 mt-1">
            {reportData.summary.incomeCount} transactions
          </div>
        </div>

        <div className="card bg-red-50">
          <div className="text-sm font-medium text-red-800">Total Expenses</div>
          <div className="text-xl sm:text-2xl font-bold text-red-600 mt-2 break-words">
            {formatAmount(reportData.summary.totalExpense)}
          </div>
          <div className="text-sm text-red-700 mt-1">
            {reportData.summary.expenseCount} transactions
          </div>
        </div>

        <div className="card bg-blue-50">
          <div className="text-sm font-medium text-blue-800">Net Profit</div>
          <div className={`text-xl sm:text-2xl font-bold mt-2 break-words ${
            reportData.summary.profit >= 0 ? 'text-blue-600' : 'text-red-600'
          }`}>
            {formatAmount(reportData.summary.profit)}
          </div>
          <div className="text-sm text-blue-700 mt-1">
            {reportData.summary.profit >= 0 ? 'Profitable' : 'In Loss'}
          </div>
        </div>

        <div className="card bg-purple-50">
          <div className="text-sm font-medium text-purple-800">Total Transactions</div>
          <div className="text-2xl font-bold text-purple-600 mt-2">
            {reportData.summary.transactionCount}
          </div>
          <div className="text-sm text-purple-700 mt-1">
            {new Date(reportData.startDate).toLocaleDateString()} - {new Date(reportData.endDate).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Charts */}
      {reportData.monthlySummary.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Line Chart */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData.monthlySummary}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Income" />
                <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} name="Expense" />
                <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Income vs Expenses</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.monthlySummary}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" fill="#10b981" name="Income" />
                <Bar dataKey="expense" fill="#ef4444" name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Transaction Details */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Transaction Details</h3>
          <span className="text-sm text-gray-500">
            {reportData.transactions.all.length} transactions
          </span>
        </div>

        {reportData.transactions.all.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No transactions found for the selected period
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Added By
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.transactions.all.map((transaction) => (
                  <tr key={transaction._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge badge-${transaction.type}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                      <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                        {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.addedBy.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;

