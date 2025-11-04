import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit3, 
  Users, 
  FileText, 
  BarChart3,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertTriangle,
  X,
  Eye,
  Settings,
  Upload
} from 'lucide-react';
import api from '../utils/api';
import TransactionForm from '../components/TransactionForm';
import DayWiseTransactionForm from '../components/DayWiseTransactionForm';
import DayWiseTransactionList from '../components/DayWiseTransactionList';
import DocumentUpload from '../components/DocumentUpload';
import DocumentList from '../components/DocumentList';
import LogoUpload from '../components/LogoUpload';
import GlassCard from '../components/GlassCard';
import FloatingButton from '../components/FloatingButton';
import { useCurrency } from '../context/CurrencyContext';
import { formatCurrency, convertFromUSD } from '../utils/currency';

const BusinessDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatAmount, exchangeRates } = useCurrency();
  
  // Format amount using business currency
  const formatBusinessAmount = (amountUSD) => {
    const businessCurrencyCode = business?.currency || 'USD';
    if (businessCurrencyCode === 'USD' || !exchangeRates?.rates) {
      return formatCurrency(amountUSD, 'USD');
    }
    const rate = exchangeRates.rates[businessCurrencyCode];
    if (!rate) {
      return formatCurrency(amountUSD, 'USD');
    }
    const converted = amountUSD * rate;
    return formatCurrency(converted, businessCurrencyCode);
  };
  
  const [business, setBusiness] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Modals
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showAddPartner, setShowAddPartner] = useState(false);
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null); // For adding to specific date
  
  // Form states
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerRole, setPartnerRole] = useState('viewer');
  const [error, setError] = useState('');
  const [currencies, setCurrencies] = useState([]);
  const [updatingCurrency, setUpdatingCurrency] = useState(false);

  useEffect(() => {
    fetchBusinessData();
    fetchCurrencies();
  }, [id]);

  const fetchCurrencies = async () => {
    try {
      const response = await api.get('/currency/supported');
      setCurrencies(response.data.data);
    } catch (error) {
      console.error('Error fetching currencies:', error);
    }
  };

  const handleUpdateCurrency = async (newCurrency) => {
    if (business?.userRole !== 'owner') return;
    
    setUpdatingCurrency(true);
    try {
      const response = await api.put(`/business/${id}/currency`, { currency: newCurrency });
      setBusiness(response.data.data);
      setError('');
      // Show success message
      alert('Currency updated successfully!');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update currency');
    } finally {
      setUpdatingCurrency(false);
    }
  };

  const fetchBusinessData = async () => {
    try {
      const [businessRes, transactionsRes, statsRes] = await Promise.all([
        api.get(`/business/${id}`),
        api.get(`/business/${id}/transactions`),
        api.get(`/business/${id}/reports/stats`)
      ]);

      setBusiness(businessRes.data.data);
      setTransactions(transactionsRes.data.data);
      setStats(statsRes.data.data);

      // Fetch documents separately (optional - won't break if it fails)
      try {
        const documentsRes = await api.get(`/business/${id}/documents`);
        setDocuments(documentsRes.data.data);
      } catch (docError) {
        console.log('Documents feature not available or failed to load');
        setDocuments([]);
      }
    } catch (error) {
      console.error('Error fetching business data:', error);
      setError('Failed to load business data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (formData) => {
    try {
      // Use batch endpoint for day-wise transactions
      const response = await api.post(`/business/${id}/transactions/batch`, formData);
      // Add all new transactions to the list
      const newTransactions = response.data.data;
      setTransactions([...newTransactions, ...transactions]);
      setShowAddTransaction(false);
      setSelectedDate(null); // Clear selected date
      fetchBusinessData(); // Refresh stats
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add transactions');
      throw error; // Re-throw so form can handle it
    }
  };

  const handleAddToDate = (dateString) => {
    setSelectedDate(dateString);
    setShowAddTransaction(true);
  };

  const handleUpdateTransaction = async (formData) => {
    try {
      const response = await api.put(
        `/business/${id}/transactions/${editingTransaction._id}`,
        formData
      );
      setTransactions(transactions.map(t => 
        t._id === editingTransaction._id ? response.data.data : t
      ));
      setEditingTransaction(null);
      fetchBusinessData(); // Refresh stats
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update transaction');
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;

    try {
      await api.delete(`/business/${id}/transactions/${transactionId}`);
      setTransactions(transactions.filter(t => t._id !== transactionId));
      fetchBusinessData(); // Refresh stats
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete transaction');
    }
  };

  const handleAddPartner = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await api.post(`/business/${id}/partners`, {
        email: partnerEmail,
        role: partnerRole
      });
      setPartnerEmail('');
      setPartnerRole('viewer');
      setShowAddPartner(false);
      fetchBusinessData();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add partner');
    }
  };

  const handleRemovePartner = async (partnerId) => {
    if (!window.confirm('Are you sure you want to remove this partner?')) return;

    try {
      await api.delete(`/business/${id}/partners/${partnerId}`);
      fetchBusinessData();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to remove partner');
    }
  };

  const handleUpdatePartnerRole = async (partnerId, newRole) => {
    try {
      await api.put(`/business/${id}/partners/${partnerId}`, {
        role: newRole
      });
      fetchBusinessData();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update partner role');
    }
  };

  const canEdit = business?.userRole === 'owner' || business?.userRole === 'editor';
  const isOwner = business?.userRole === 'owner';

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 mx-auto" style={{ borderColor: '#90e0f7' }}></div>
          <p className="mt-4 text-white/70 text-lg">Loading business details...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <GlassCard className="p-12 text-center max-w-2xl">
          <div className="text-6xl mb-4">🏢</div>
          <h2 className="text-2xl font-bold text-white mb-4">Business not found</h2>
          <p className="text-white/60 mb-8">The business you're looking for doesn't exist or you don't have access to it.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            className="px-8 py-4 text-white rounded-xl shadow-lg transition-all duration-300 inline-flex items-center space-x-2 hover:opacity-90"
            style={{ backgroundColor: '#90e0f7' }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </motion.button>
        </GlassCard>
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
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </motion.button>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-white">{business.name}</h1>
              {business.description && (
                <p className="text-white/60 mt-1">{business.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#90e0f7' }}></div>
            <span className="text-white/50 text-sm">Business Dashboard</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/20">
            <span className="text-white/90 text-sm font-medium capitalize">{business.userRole}</span>
          </div>
          {isOwner && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={async () => {
                if (window.confirm(`Are you sure you want to delete "${business.name}"? This will permanently delete the business, all transactions, and documents. This action cannot be undone.`)) {
                  try {
                    await api.delete(`/business/${id}`);
                    navigate('/dashboard');
                  } catch (err) {
                    setError(err.response?.data?.message || 'Failed to delete business');
                  }
                }
              }}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-200 rounded-xl transition-all duration-300 flex items-center space-x-2"
              title="Delete Business"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm">Delete</span>
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl backdrop-blur-xl border border-red-400/50 bg-red-500/20 flex items-center space-x-3"
          >
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-red-200">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Income */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard glow gradient="emerald" className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-white/60 text-sm mb-1">Total Income</p>
                  <h3 className="text-white text-lg sm:text-3xl font-bold mb-2 break-words">
                    {formatBusinessAmount(stats.overall.totalIncome)}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4" style={{ color: '#90e0f7' }} />
                    <span className="text-sm" style={{ color: '#90e0f7' }}>Revenue Stream</span>
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
            transition={{ delay: 0.2 }}
          >
            <GlassCard glow gradient="red" className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-white/60 text-sm mb-1">Total Expenses</p>
                  <h3 className="text-white text-lg sm:text-3xl font-bold mb-2 break-words">
                    {formatBusinessAmount(stats.overall.totalExpense)}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 text-sm">Cost Management</span>
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
            transition={{ delay: 0.3 }}
          >
            <GlassCard 
              glow 
              gradient={stats.overall.profit >= 0 ? 'blue' : 'orange'} 
              className="p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-white/60 text-sm mb-1">Net Profit</p>
                  <h3 className={`text-lg sm:text-3xl font-bold mb-2 break-words ${
                    stats.overall.profit >= 0 ? 'text-blue-400' : 'text-orange-400'
                  }`}>
                    {formatBusinessAmount(stats.overall.profit)}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <DollarSign className={`w-4 h-4 ${
                      stats.overall.profit >= 0 ? 'text-blue-400' : 'text-orange-400'
                    }`} />
                    <span className={`text-sm ${
                      stats.overall.profit >= 0 ? 'text-blue-400' : 'text-orange-400'
                    }`}>
                      {stats.overall.profit >= 0 ? 'Profitable' : 'In Loss'}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${
                  stats.overall.profit >= 0 
                    ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20'
                    : 'bg-gradient-to-r from-orange-500/20 to-yellow-500/20'
                }`}>
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}

      {/* Business Currency Settings - Dashboard Section - Owner Only */}
      {isOwner && stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(144, 224, 247, 0.2)' }}>
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Business Currency</h2>
                  <p className="text-white/60 text-sm">Set the currency for this business</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {error && (
                  <div className="px-3 py-2 bg-red-500/20 border border-red-400/50 text-red-200 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                <div className="relative">
                  <select
                    value={business?.currency || 'USD'}
                    onChange={(e) => handleUpdateCurrency(e.target.value)}
                    disabled={updatingCurrency}
                    className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:bg-white/10 transition-all appearance-none cursor-pointer text-sm"
                    onFocus={(e) => e.target.style.borderColor = 'rgba(144, 224, 247, 0.5)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                    style={{ colorScheme: 'dark', minWidth: '200px' }}
                  >
                    {currencies.map((curr) => (
                      <option key={curr.code} value={curr.code} className="bg-slate-800">
                        {curr.symbol} {curr.code} - {curr.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <p className="text-xs text-white/50 mt-3">
              Changing the currency will affect how amounts are displayed for this business. All amounts are stored in USD and converted for display.
            </p>
          </GlassCard>
        </motion.div>
      )}

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <GlassCard className="p-2">
          <nav className="flex space-x-1">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'transactions', label: 'Transactions', icon: Calendar },
              { id: 'partners', label: 'Partners', icon: Users },
              { id: 'documents', label: 'Documents', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300 ${
                    isActive
                      ? 'text-white'
                      : 'text-white/60 hover:text-white/90'
                  }`}
                  style={isActive ? {
                    backgroundColor: 'rgba(144, 224, 247, 0.2)',
                    borderColor: 'rgba(144, 224, 247, 0.3)'
                  } : {}}
                >
                  <Icon className="w-4 h-4" style={isActive ? { color: '#90e0f7' } : {}} />
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-lg"
                      style={{ backgroundColor: 'rgba(144, 224, 247, 0.1)' }}
                      transition={{ type: "spring", duration: 0.5 }}
                    />
                  )}
                </motion.button>
              );
            })}
            <motion.button
              onClick={() => navigate(`/business/${id}/reports`)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center space-x-2 px-4 py-3 rounded-lg font-medium text-sm text-white/60 hover:text-white/90 transition-all duration-300"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Reports</span>
            </motion.button>
          </nav>
        </GlassCard>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(144, 224, 247, 0.2)' }}>
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
                  <p className="text-white/60 text-sm">Latest transactions and updates</p>
                </div>
              </div>
              {canEdit && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddTransaction(true)}
                  className="px-6 py-3 text-white rounded-xl shadow-lg transition-all duration-300 flex items-center space-x-2 hover:opacity-90"
                  style={{ backgroundColor: '#90e0f7' }}
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Day's Transactions</span>
                </motion.button>
              )}
            </div>

            <GlassCard className="p-6">
              {stats?.recentTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-lg font-semibold text-white mb-2">No transactions yet</h3>
                  <p className="text-white/60 mb-6">Start tracking your daily income and expenses</p>
                  {canEdit && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowAddTransaction(true)}
                      className="px-8 py-4 text-white rounded-xl shadow-lg transition-all duration-300 inline-flex items-center space-x-2 hover:opacity-90"
                      style={{ backgroundColor: '#90e0f7' }}
                    >
                      <Plus className="w-5 h-5" />
                      <span>Add First Day's Transactions</span>
                    </motion.button>
                  )}
                </div>
              ) : (
                <DayWiseTransactionList
                  transactions={stats?.recentTransactions || []}
                  onEdit={(transaction) => setEditingTransaction(transaction)}
                  onDelete={handleDeleteTransaction}
                  onAddToDate={handleAddToDate}
                  canEdit={canEdit}
                  businessCurrency={business?.currency}
                />
              )}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {activeTab === 'transactions' && (
        <motion.div
          key="transactions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(144, 224, 247, 0.2)' }}>
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Day-Wise Transactions</h2>
                <p className="text-white/60 text-sm">All your daily transaction records</p>
              </div>
            </div>
            {canEdit && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddTransaction(true)}
                className="px-6 py-3 text-white rounded-xl shadow-lg transition-all duration-300 flex items-center space-x-2 hover:opacity-90"
                style={{ backgroundColor: '#90e0f7' }}
              >
                <Plus className="w-5 h-5" />
                <span>Add Day's Transactions</span>
              </motion.button>
            )}
          </div>

          <GlassCard className="p-6">
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-lg font-semibold text-white mb-2">No transactions yet</h3>
                <p className="text-white/60 mb-6">Start tracking your daily income and expenses</p>
                {canEdit && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddTransaction(true)}
                    className="px-8 py-4 text-white rounded-xl shadow-lg transition-all duration-300 inline-flex items-center space-x-2 hover:opacity-90"
                    style={{ backgroundColor: '#90e0f7' }}
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add First Day's Transactions</span>
                  </motion.button>
                )}
              </div>
            ) : (
              <DayWiseTransactionList
                transactions={transactions}
                onEdit={(transaction) => setEditingTransaction(transaction)}
                onDelete={handleDeleteTransaction}
                onAddToDate={handleAddToDate}
                canEdit={canEdit}
                businessCurrency={business?.currency}
              />
            )}
          </GlassCard>
        </motion.div>
      )}

      {activeTab === 'partners' && (
        <motion.div
          key="partners"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(144, 224, 247, 0.2)' }}>
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Partners</h2>
                <p className="text-white/60 text-sm">Manage team members and permissions</p>
              </div>
            </div>
            {isOwner && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddPartner(true)}
                className="px-6 py-3 text-white rounded-xl shadow-lg transition-all duration-300 flex items-center space-x-2 hover:opacity-90"
                style={{ backgroundColor: '#90e0f7' }}
              >
                <Plus className="w-5 h-5" />
                <span>Add Partner</span>
              </motion.button>
            )}
          </div>

          <GlassCard className="p-6">
            <div className="space-y-4">
              {business.partners.map((partner, index) => (
                <motion.div
                  key={partner._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(144, 224, 247, 0.2)' }}>
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-white">{partner.user?.name}</div>
                      <div className="text-sm text-white/60">{partner.user?.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {isOwner && partner.role !== 'owner' ? (
                      <select
                        value={partner.role}
                        onChange={(e) => handleUpdatePartnerRole(partner._id, e.target.value)}
                        className="px-3 py-1 rounded-lg bg-white/10 border border-white/20 text-white/90 text-sm font-medium focus:outline-none focus:border-blue-400 transition-all duration-300 appearance-none cursor-pointer"
                        style={{ colorScheme: 'dark' }}
                      >
                        <option value="viewer" className="bg-slate-800">Viewer</option>
                        <option value="editor" className="bg-slate-800">Editor</option>
                      </select>
                    ) : (
                      <div className="px-3 py-1 rounded-full bg-white/10 border border-white/20">
                        <span className="text-white/90 text-sm font-medium capitalize">{partner.role}</span>
                      </div>
                    )}
                    {isOwner && partner.role !== 'owner' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRemovePartner(partner._id)}
                        className="px-3 py-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-300 text-sm"
                      >
                        Remove
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {activeTab === 'documents' && (
        <motion.div
          key="documents"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Logo Section - Owner Only */}
          {isOwner && (
            <GlassCard className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(144, 224, 247, 0.2)' }}>
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Business Logo</h3>
                  <p className="text-white/60 text-sm">Upload your business branding</p>
                </div>
              </div>
              <LogoUpload
                businessId={id}
                currentLogo={business.logo}
                onUploadSuccess={(logo) => {
                  setBusiness({ ...business, logo });
                }}
              />
            </GlassCard>
          )}

          {/* Documents Section */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(144, 224, 247, 0.2)' }}>
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Documents</h2>
                <p className="text-white/60 text-sm">Manage your business files and documents</p>
              </div>
            </div>
            {canEdit && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddDocument(true)}
                className="px-6 py-3 text-white rounded-xl shadow-lg transition-all duration-300 flex items-center space-x-2 hover:opacity-90"
                style={{ backgroundColor: '#90e0f7' }}
              >
                <Upload className="w-5 h-5" />
                <span>Upload Document</span>
              </motion.button>
            )}
          </div>

          <GlassCard className="p-6">
            <DocumentList
              documents={documents}
              businessId={id}
              userRole={business.userRole}
              onDelete={(documentId) => {
                setDocuments(documents.filter(d => d._id !== documentId));
              }}
            />
          </GlassCard>
        </motion.div>
      )}

      {/* Add Day's Transactions Modal */}
      <AnimatePresence>
        {showAddTransaction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowAddTransaction(false);
              setSelectedDate(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <GlassCard className="p-8 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(144, 224, 247, 0.2)' }}>
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {selectedDate ? 'Add More Transactions' : "Add Day's Transactions"}
                      </h2>
                      <p className="text-white/60 text-sm">
                        {selectedDate 
                          ? `Adding more transactions to ${new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`
                          : 'Select a date and add all income and expenses for that day'
                        }
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowAddTransaction(false);
                      setSelectedDate(null);
                    }}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 text-white/70" />
                  </motion.button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <DayWiseTransactionForm
                    onSubmit={handleAddTransaction}
                    onCancel={() => {
                      setShowAddTransaction(false);
                      setSelectedDate(null);
                    }}
                    preSelectedDate={selectedDate}
                    businessCurrency={business?.currency}
                  />
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Transaction Modal */}
      <AnimatePresence>
        {editingTransaction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setEditingTransaction(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <GlassCard className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(144, 224, 247, 0.2)' }}>
                      <Edit3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Edit Transaction</h2>
                      <p className="text-white/60 text-sm">Update transaction details</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEditingTransaction(null)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 text-white/70" />
                  </motion.button>
                </div>
                <TransactionForm
                  initialData={editingTransaction}
                  onSubmit={handleUpdateTransaction}
                  onCancel={() => setEditingTransaction(null)}
                />
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Partner Modal */}
      <AnimatePresence>
        {showAddPartner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowAddPartner(false);
              setPartnerEmail('');
              setPartnerRole('viewer');
              setError('');
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <GlassCard className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(144, 224, 247, 0.2)' }}>
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Add Partner</h2>
                      <p className="text-white/60 text-sm">Invite team members to collaborate</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowAddPartner(false);
                      setPartnerEmail('');
                      setPartnerRole('viewer');
                      setError('');
                    }}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 text-white/70" />
                  </motion.button>
                </div>
                
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/20 border border-red-400/50 text-red-200 px-4 py-3 rounded-lg mb-4 flex items-center space-x-2"
                  >
                    <AlertTriangle className="w-5 h-5" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <form onSubmit={handleAddPartner} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-3 flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>Partner Email</span>
                    </label>
                    <input
                      type="email"
                      value={partnerEmail}
                      onChange={(e) => setPartnerEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:bg-white/10 transition-all"
                      onFocus={(e) => e.target.style.borderColor = 'rgba(144, 224, 247, 0.5)'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                      placeholder="partner@example.com"
                      required
                    />
                    <p className="text-sm text-white/50 mt-2 flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>User must be registered on the platform</span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-3 flex items-center space-x-2">
                      <Settings className="w-4 h-4" />
                      <span>Role</span>
                    </label>
                    <select
                      value={partnerRole}
                      onChange={(e) => setPartnerRole(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:bg-white/10 transition-all appearance-none cursor-pointer"
                      onFocus={(e) => e.target.style.borderColor = 'rgba(144, 224, 247, 0.5)'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                      style={{ colorScheme: 'dark' }}
                    >
                      <option value="viewer" className="bg-slate-800">Viewer (Read-only access)</option>
                      <option value="editor" className="bg-slate-800">Editor (Can add transactions)</option>
                    </select>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-6 py-3 text-white rounded-lg font-medium shadow-lg transition-all duration-300 hover:opacity-90 flex items-center justify-center space-x-2"
                      style={{ backgroundColor: '#90e0f7' }}
                    >
                      <Users className="w-5 h-5" />
                      <span>Add Partner</span>
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowAddPartner(false);
                        setPartnerEmail('');
                        setPartnerRole('viewer');
                        setError('');
                      }}
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all duration-300 flex items-center space-x-2"
                    >
                      <X className="w-5 h-5" />
                      <span>Cancel</span>
                    </motion.button>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Document Modal */}
      <AnimatePresence>
        {showAddDocument && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddDocument(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <GlassCard className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(144, 224, 247, 0.2)' }}>
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Upload Document</h2>
                      <p className="text-white/60 text-sm">Add files to your business</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddDocument(false)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 text-white/70" />
                  </motion.button>
                </div>
                <DocumentUpload
                  businessId={id}
                  onUploadSuccess={(newDocument) => {
                    setDocuments([...documents, newDocument]);
                    setShowAddDocument(false);
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAddDocument(false)}
                  className="w-full mt-6 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <X className="w-5 h-5" />
                  <span>Cancel</span>
                </motion.button>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      {canEdit && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6, type: "spring" }}
          className="fixed bottom-8 right-8 z-50"
        >
          <FloatingButton 
            size="lg" 
            onClick={() => setShowAddTransaction(true)}
            variant="primary"
          >
            <Plus className="w-6 h-6" />
          </FloatingButton>
        </motion.div>
      )}
    </div>
  );
};

export default BusinessDetails;

