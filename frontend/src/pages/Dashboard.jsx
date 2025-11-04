import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Plus,
  AlertTriangle,
  X
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import api from '../utils/api';
import GlassCard from '../components/GlassCard';
import FloatingButton from '../components/FloatingButton';
import BusinessLogo from '../components/BusinessLogo';
import { useCurrency } from '../context/CurrencyContext';

const Dashboard = () => {
  const [businesses, setBusinesses] = useState([]);
  const [overallStats, setOverallStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { formatAmount } = useCurrency();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [businessRes, statsRes] = await Promise.all([
        api.get('/business'),
        api.get('/dashboard/stats')
      ]);
      
      setBusinesses(businessRes.data.data);
      setOverallStats(statsRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBusiness = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Business name is required');
      return;
    }

    try {
      const response = await api.post('/business', formData);
      setBusinesses([response.data.data, ...businesses]);
      setShowCreateModal(false);
      setFormData({ name: '', description: '' });
      fetchDashboardData();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create business');
    }
  };

  const handleDeleteBusiness = async (businessId) => {
    try {
      await api.delete(`/business/${businessId}`);
      setBusinesses(businesses.filter(b => b._id !== businessId));
      fetchDashboardData();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete business');
    }
  };

  // Prepare chart data
  const prepareChartData = () => {
    if (!overallStats?.businessBreakdown) return [];
    
    return overallStats.businessBreakdown.map(biz => ({
      name: biz.name.length > 15 ? biz.name.substring(0, 15) + '...' : biz.name,
      income: biz.income || 0,
      expense: biz.expense || 0,
      profit: biz.profit || 0
    }));
  };

  // Prepare pie chart data
  const preparePieData = () => {
    if (!overallStats) return [];
    
    const totalIncome = overallStats.totalIncome || 0;
    const totalExpense = overallStats.totalExpense || 0;
    const netProfit = overallStats.netProfit || 0;
    
    return [
      { name: 'Income', value: totalIncome, color: '#90e0f7' },
      { name: 'Expenses', value: totalExpense, color: '#ef4444' },
      { name: 'Net Profit', value: Math.abs(netProfit), color: netProfit >= 0 ? '#3b82f6' : '#f97316' }
    ].filter(item => item.value > 0);
  };

  const ownedBusinesses = businesses.filter(b => 
    b.partners?.some(p => p.role === 'owner' && p.user?._id === JSON.parse(localStorage.getItem('user'))?._id)
  );

  const partnerBusinesses = businesses.filter(b => 
    b.partners?.some(p => p.role !== 'owner' && p.user?._id === JSON.parse(localStorage.getItem('user'))?._id)
  );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 mx-auto" style={{ borderColor: '#90e0f7' }}></div>
          <p className="mt-4 text-white/70 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full overflow-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#90e0f7' }}></div>
              <span className="text-white/50 text-sm">System Online</span>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="px-4 sm:px-6 py-2 sm:py-3 text-white rounded-xl shadow-lg transition-all duration-300 flex items-center space-x-2 hover:opacity-90 text-sm sm:text-base"
            style={{ backgroundColor: '#90e0f7' }}
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Create Business</span>
            <span className="sm:hidden">Create</span>
          </motion.button>
        </motion.div>

        {/* KPI Cards */}
        {overallStats && businesses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Total Businesses */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
            >
              <GlassCard glow gradient="green" className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-white/80 text-xs sm:text-sm font-medium mb-2">Total Businesses</p>
                    <h3 className="text-white text-lg sm:text-4xl font-bold mb-3 tracking-tight">{overallStats.totalBusinesses || 0}</h3>
                    <div className="flex items-center space-x-2">
                      <Briefcase className="w-4 h-4" style={{ color: '#90e0f7' }} />
                      <span className="text-sm font-medium" style={{ color: '#90e0f7' }}>Active Portfolio</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(144, 224, 247, 0.25)' }}>
                    <Briefcase className="w-8 h-8 text-white" />
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Total Income */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <GlassCard glow gradient="emerald" className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-white/80 text-xs sm:text-sm font-medium mb-2">Total Income</p>
                    <h3 className="text-white text-base sm:text-2xl font-bold mb-3 tracking-tight">{formatAmount(overallStats.totalIncome || 0)}</h3>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4" style={{ color: '#10b981' }} />
                      <span className="text-sm font-medium" style={{ color: '#10b981' }}>Revenue Stream</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(16, 185, 129, 0.25)' }}>
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
                    <p className="text-white/80 text-xs sm:text-sm font-medium mb-2">Total Expenses</p>
                    <h3 className="text-white text-base sm:text-2xl font-bold mb-3 tracking-tight">{formatAmount(overallStats.totalExpense || 0)}</h3>
                    <div className="flex items-center space-x-2">
                      <TrendingDown className="w-4 h-4 text-red-400" />
                      <span className="text-red-400 text-sm font-medium">{overallStats.totalTransactions || 0} Transactions</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-r from-red-500/25 to-orange-500/25">
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
                gradient={overallStats.netProfit >= 0 ? 'blue' : 'orange'} 
                className="p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-white/80 text-xs sm:text-sm font-medium mb-2">Net Profit</p>
                    <h3 className={`text-base sm:text-2xl font-bold mb-3 tracking-tight ${
                      overallStats.netProfit >= 0 ? 'text-blue-400' : 'text-orange-400'
                    }`}>
                      {overallStats.netProfit >= 0 ? '+' : '-'}{formatAmount(Math.abs(overallStats.netProfit || 0))}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <DollarSign className={`w-4 h-4 ${
                        overallStats.netProfit >= 0 ? 'text-blue-400' : 'text-orange-400'
                      }`} />
                      <span className={`text-sm font-medium ${
                        overallStats.netProfit >= 0 ? 'text-blue-400' : 'text-orange-400'
                      }`}>
                        {overallStats.netProfit >= 0 ? 'Profitable' : 'In Loss'}
                      </span>
                    </div>
                  </div>
                  <div className={`p-4 rounded-xl ${
                    overallStats.netProfit >= 0 
                      ? 'bg-gradient-to-r from-blue-500/25 to-cyan-500/25'
                      : 'bg-gradient-to-r from-orange-500/25 to-yellow-500/25'
                  }`}>
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}

        {/* Charts Section */}
        {overallStats && businesses.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Business Performance Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white text-base sm:text-lg font-semibold">Business Performance</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#90e0f7' }}></div>
                      <span className="text-white/60 text-sm">Income</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <span className="text-white/60 text-sm">Expenses</span>
                    </div>
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={prepareChartData()}>
                      <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#90e0f7" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#90e0f7" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        dataKey="name" 
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
                      <Area 
                        type="monotone" 
                        dataKey="income" 
                        stroke="#90e0f7" 
                        fillOpacity={1}
                        fill="url(#colorIncome)" 
                        strokeWidth={2}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="expense" 
                        stroke="#ef4444" 
                        fillOpacity={1}
                        fill="url(#colorExpense)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </motion.div>

            {/* Financial Breakdown Pie Chart */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <GlassCard className="p-6">
                <h3 className="text-white text-base sm:text-lg font-semibold mb-4 sm:mb-6">Financial Breakdown</h3>
                <div className="h-80 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={preparePieData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {preparePieData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(0,0,0,0.8)', 
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                        formatter={(value) => formatAmount(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center space-x-6 mt-4">
                  {preparePieData().map((item) => (
                    <div key={item.name} className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-white/70 text-sm">{item.name}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}

        {/* Business Performance List */}
        {overallStats?.businessBreakdown && overallStats.businessBreakdown.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white text-base sm:text-lg font-semibold">Business Performance</h3>
                <button 
                  onClick={() => navigate('/businesses')}
                  className="text-sm transition-colors hover:opacity-80"
                  style={{ color: '#90e0f7' }}
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {overallStats.businessBreakdown.map((biz, index) => (
                  <motion.div
                    key={biz._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.05 }}
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-white/5 transition-all duration-200 cursor-pointer"
                    onClick={() => navigate(`/business/${biz._id}`)}
                  >
                    <div className="flex items-center space-x-3">
                      {/* Business Logo */}
                      <BusinessLogo 
                        logo={biz.logo}
                        businessName={biz.name}
                        size="md"
                        showBorder={true}
                      />
                      <div>
                        <p className="text-white/90 font-medium">{biz.name}</p>
                        <p className="text-white/50 text-sm">{biz.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-right">
                        <p style={{ color: '#90e0f7' }}>+{formatAmount(biz.income || 0)}</p>
                        <p className="text-white/40 text-xs">Income</p>
                      </div>
                      <div className="text-right">
                        <p className="text-red-400">-{formatAmount(biz.expense || 0)}</p>
                        <p className="text-white/40 text-xs">Expenses</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${biz.profit >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                          {biz.profit >= 0 ? '+' : '-'}{formatAmount(Math.abs(biz.profit || 0))}
                        </p>
                        <p className="text-white/40 text-xs">Profit</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Empty State */}
        {businesses.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <GlassCard className="p-12 max-w-2xl mx-auto">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-2xl font-semibold text-white mb-2">No Businesses Yet</h3>
              <p className="text-white/60 mb-8">Create your first business to start tracking profit and expenses</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="px-8 py-4 text-white rounded-xl shadow-lg transition-all duration-300 inline-flex items-center space-x-2 hover:opacity-90"
                style={{ backgroundColor: '#90e0f7' }}
              >
                <Plus className="w-5 h-5" />
                <span>Create Your First Business</span>
              </motion.button>
            </GlassCard>
          </motion.div>
        )}

        {/* Floating Action Button */}
        {businesses.length > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8, type: "spring" }}
            className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50"
          >
            <FloatingButton 
              size="lg" 
              onClick={() => setShowCreateModal(true)}
              variant="primary"
            >
              <Plus className="w-6 h-6" />
            </FloatingButton>
          </motion.div>
        )}
      </div>

      {/* Create Business Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm sm:max-w-md"
            >
              <GlassCard className="p-4 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Create New Business</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 text-white/70" />
                  </button>
                </div>
                
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-4 flex items-center space-x-2"
                  >
                    <AlertTriangle className="w-5 h-5" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <form onSubmit={handleCreateBusiness} className="space-y-4">
                  <div>
                    <label className="block text-white/90 text-sm font-medium mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:bg-white/10 transition-all"
                      style={{ 
                        '--focus-border-color': 'rgba(144, 224, 247, 0.5)'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'rgba(144, 224, 247, 0.5)'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                      placeholder="Enter business name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white/90 text-sm font-medium mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:bg-white/10 transition-all resize-none"
                      onFocus={(e) => e.target.style.borderColor = 'rgba(144, 224, 247, 0.5)'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                      rows="3"
                      placeholder="Brief description of your business"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-6 py-3 text-white rounded-lg font-medium shadow-lg transition-all duration-300 hover:opacity-90"
                      style={{ backgroundColor: '#90e0f7' }}
                    >
                      Create Business
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowCreateModal(false);
                        setFormData({ name: '', description: '' });
                        setError('');
                      }}
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all duration-300"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Dashboard;

