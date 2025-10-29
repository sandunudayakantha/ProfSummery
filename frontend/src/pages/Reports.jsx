import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import {
  ArrowLeft,
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Filter,
  BarChart3,
  FileSpreadsheet,
  Activity
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../utils/api';
import GlassCard from '../components/GlassCard';
import FloatingButton from '../components/FloatingButton';
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

  // Helper function to get yesterday's date (max selectable date)
  const getYesterdayDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  };

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
        // Validate dates are not today or in the future
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const start = new Date(filters.startDate);
        const end = new Date(filters.endDate);
        
        if (start >= today || end >= today) {
          alert('Cannot select today or future dates for reports');
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
      doc.text(`Period: ${reportData.startDateFormatted || new Date(reportData.startDate).toLocaleDateString()} - ${reportData.endDateFormatted || new Date(reportData.endDate).toLocaleDateString()}`, 14, 37);
      
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
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 mx-auto" style={{ borderColor: '#90e0f7' }}></div>
          <p className="mt-4 text-white/70 text-lg">Loading report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.history.back()}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </motion.button>
            <div>
              <h1 className="text-3xl font-bold text-white">Financial Reports</h1>
              <p className="text-white/60 mt-1">{business?.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#90e0f7' }}></div>
            <span className="text-white/50 text-sm">Analysis & Insights</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={downloadPDF}
            className="px-6 py-3 text-white rounded-xl shadow-lg transition-all duration-300 flex items-center space-x-2 hover:opacity-90"
            style={{ backgroundColor: '#90e0f7' }}
          >
            <FileText className="w-5 h-5" />
            <span>Download PDF</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={downloadCSV}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl transition-all duration-300 flex items-center space-x-2"
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span>Download CSV</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(144, 224, 247, 0.2)' }}>
              <Filter className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Report Filters</h2>
              <p className="text-white/60 text-sm">Customize your report period</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-3 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Period</span>
              </label>
              <select
                value={filters.period}
                onChange={(e) => setFilters({ ...filters, period: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:bg-white/10 transition-all appearance-none cursor-pointer"
                onFocus={(e) => e.target.style.borderColor = 'rgba(144, 224, 247, 0.5)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                style={{ colorScheme: 'dark' }}
              >
                <option value="daily" className="bg-slate-800">Today</option>
                <option value="monthly" className="bg-slate-800">This Month</option>
                <option value="yearly" className="bg-slate-800">This Year</option>
                <option value="custom" className="bg-slate-800">Custom Range</option>
              </select>
            </div>

            {filters.period === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-3 flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Start Date</span>
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    max={getYesterdayDate()}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:bg-white/10 transition-all"
                    onFocus={(e) => e.target.style.borderColor = 'rgba(144, 224, 247, 0.5)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                    style={{ colorScheme: 'dark' }}
                  />
                  <p className="text-xs text-white/50 mt-2">Today and future dates are not allowed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-3 flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>End Date</span>
                  </label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    min={filters.startDate}
                    max={getYesterdayDate()}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:bg-white/10 transition-all"
                    onFocus={(e) => e.target.style.borderColor = 'rgba(144, 224, 247, 0.5)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                    style={{ colorScheme: 'dark' }}
                  />
                  <p className="text-xs text-white/50 mt-2">
                    {filters.startDate 
                      ? 'Must be after start date and not today or future' 
                      : 'Today and future dates are not allowed'}
                  </p>
                </div>
              </>
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Income */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard glow gradient="emerald" className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-white/60 text-sm mb-1">Total Income</p>
                <h3 className="text-white text-2xl font-bold mb-2 break-words">
                  {formatAmount(reportData.summary.totalIncome)}
                </h3>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" style={{ color: '#90e0f7' }} />
                  <span className="text-sm" style={{ color: '#90e0f7' }}>
                    {reportData.summary.incomeCount} transactions
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(144, 224, 247, 0.2)' }}>
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Total Expenses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard glow gradient="red" className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-white/60 text-sm mb-1">Total Expenses</p>
                <h3 className="text-white text-2xl font-bold mb-2 break-words">
                  {formatAmount(reportData.summary.totalExpense)}
                </h3>
                <div className="flex items-center space-x-2">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 text-sm">
                    {reportData.summary.expenseCount} transactions
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-red-500/20 to-orange-500/20">
                <TrendingDown className="w-8 h-8 text-white" />
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Net Profit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard 
            glow 
            gradient={reportData.summary.profit >= 0 ? 'blue' : 'orange'} 
            className="p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-white/60 text-sm mb-1">Net Profit</p>
                <h3 className={`text-2xl font-bold mb-2 break-words ${
                  reportData.summary.profit >= 0 ? 'text-blue-400' : 'text-orange-400'
                }`}>
                  {formatAmount(reportData.summary.profit)}
                </h3>
                <div className="flex items-center space-x-2">
                  <DollarSign className={`w-4 h-4 ${
                    reportData.summary.profit >= 0 ? 'text-blue-400' : 'text-orange-400'
                  }`} />
                  <span className={`text-sm ${
                    reportData.summary.profit >= 0 ? 'text-blue-400' : 'text-orange-400'
                  }`}>
                    {reportData.summary.profit >= 0 ? 'Profitable' : 'In Loss'}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-xl ${
                reportData.summary.profit >= 0 
                  ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20'
                  : 'bg-gradient-to-r from-orange-500/20 to-yellow-500/20'
              }`}>
                <DollarSign className="w-8 h-8 text-white" />
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Total Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard glow gradient="purple" className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-white/60 text-sm mb-1">Total Transactions</p>
                <h3 className="text-white text-2xl font-bold mb-2">
                  {reportData.summary.transactionCount}
                </h3>
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400 text-sm">
                    {reportData.startDateFormatted || new Date(reportData.startDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20">
                <Activity className="w-8 h-8 text-white" />
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Charts */}
      {reportData.monthlySummary.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(144, 224, 247, 0.2)' }}>
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Trend Analysis</h3>
                  <p className="text-white/60 text-sm">Performance over time</p>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={reportData.monthlySummary}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="month" 
                      stroke="rgba(255,255,255,0.6)"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.6)"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        backdropFilter: 'blur(10px)',
                        color: '#fff'
                      }}
                      formatter={(value) => formatAmount(value)}
                    />
                    <Legend 
                      wrapperStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="income" stroke="#90e0f7" strokeWidth={2} name="Income" />
                    <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} name="Expense" />
                    <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} name="Profit" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </motion.div>

          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(144, 224, 247, 0.2)' }}>
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Income vs Expenses</h3>
                  <p className="text-white/60 text-sm">Comparative analysis</p>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.monthlySummary}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="month"
                      stroke="rgba(255,255,255,0.6)"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.6)"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        backdropFilter: 'blur(10px)',
                        color: '#fff'
                      }}
                      formatter={(value) => formatAmount(value)}
                    />
                    <Legend 
                      wrapperStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="income" fill="#90e0f7" name="Income" />
                    <Bar dataKey="expense" fill="#ef4444" name="Expense" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}

      {/* Transaction Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(144, 224, 247, 0.2)' }}>
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Transaction Details</h3>
                <p className="text-white/60 text-sm">{reportData.transactions.all.length} transactions</p>
              </div>
            </div>
          </div>

          {reportData.transactions.all.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-white mb-2">No transactions found</h3>
              <p className="text-white/60">No transactions found for the selected period</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Added By
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {reportData.transactions.all.map((transaction, index) => (
                    <motion.tr
                      key={transaction._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + index * 0.05 }}
                      className="hover:bg-white/5 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/90">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          transaction.type === 'income' 
                            ? 'bg-green-500/20 text-green-300 border border-green-400/30'
                            : 'bg-red-500/20 text-red-300 border border-red-400/30'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-white/90">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                        <span className={transaction.type === 'income' ? 'text-green-400' : 'text-red-400'} style={transaction.type === 'income' ? { color: '#90e0f7' } : {}}>
                          {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">
                        {transaction.addedBy.name}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col space-y-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: "spring" }}
        >
          <FloatingButton 
            size="lg" 
            onClick={downloadPDF}
            variant="primary"
          >
            <FileText className="w-6 h-6" />
          </FloatingButton>
        </motion.div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.1, type: "spring" }}
        >
          <FloatingButton 
            size="lg" 
            onClick={downloadCSV}
            variant="secondary"
          >
            <FileSpreadsheet className="w-6 h-6" />
          </FloatingButton>
        </motion.div>
      </div>
    </div>
  );
};

export default Reports;

