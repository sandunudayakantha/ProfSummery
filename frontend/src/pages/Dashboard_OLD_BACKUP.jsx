import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import BusinessCard from '../components/BusinessCard';
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
      fetchDashboardData(); // Refresh stats
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create business');
    }
  };

  const handleDeleteBusiness = async (businessId) => {
    try {
      await api.delete(`/business/${businessId}`);
      setBusinesses(businesses.filter(b => b._id !== businessId));
      fetchDashboardData(); // Refresh stats
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete business');
    }
  };

  const ownedBusinesses = businesses.filter(b => 
    b.partners?.some(p => p.role === 'owner' && p.user?._id === JSON.parse(localStorage.getItem('user'))?._id)
  );

  const partnerBusinesses = businesses.filter(b => 
    b.partners?.some(p => p.role !== 'owner' && p.user?._id === JSON.parse(localStorage.getItem('user'))?._id)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your businesses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Businesses</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          + Create Business
        </button>
      </div>

      {/* Overall Statistics Summary */}
      {overallStats && businesses.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Portfolio Overview</h2>
          
          {/* Main Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Total Income */}
            <div className="card bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-800">Total Income</span>
                <span className="text-2xl">💰</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-green-700 break-words">
                {formatAmount(overallStats.totalIncome)}
              </div>
              <div className="text-xs text-green-600 mt-2">
                Across {overallStats.totalBusinesses} business{overallStats.totalBusinesses !== 1 ? 'es' : ''}
              </div>
            </div>

            {/* Total Expenses */}
            <div className="card bg-gradient-to-br from-red-50 to-red-100 border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-red-800">Total Expenses</span>
                <span className="text-2xl">💸</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-red-700 break-words">
                {formatAmount(overallStats.totalExpense)}
              </div>
              <div className="text-xs text-red-600 mt-2">
                {overallStats.totalTransactions} total transactions
              </div>
            </div>

            {/* Net Profit */}
            <div className={`card bg-gradient-to-br border ${
              overallStats.netProfit >= 0 
                ? 'from-blue-50 to-blue-100 border-blue-200' 
                : 'from-orange-50 to-orange-100 border-orange-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${
                  overallStats.netProfit >= 0 ? 'text-blue-800' : 'text-orange-800'
                }`}>
                  Net Profit
                </span>
                <span className="text-2xl">{overallStats.netProfit >= 0 ? '📈' : '📉'}</span>
              </div>
              <div className={`text-2xl sm:text-3xl font-bold break-words ${
                overallStats.netProfit >= 0 ? 'text-blue-700' : 'text-orange-700'
              }`}>
                {formatAmount(Math.abs(overallStats.netProfit))}
              </div>
              <div className={`text-xs mt-2 ${
                overallStats.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'
              }`}>
                {overallStats.netProfit >= 0 ? 'Profitable' : 'In Loss'}
              </div>
            </div>

            {/* This Month */}
            <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-800">This Month</span>
                <span className="text-2xl">📅</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-purple-700 break-words">
                {overallStats.thisMonthProfit >= 0 ? '+' : '-'}
                {formatAmount(Math.abs(overallStats.thisMonthProfit))}
              </div>
              <div className="text-xs text-purple-600 mt-2 break-words">
                {formatAmount(overallStats.thisMonthIncome)} in - {formatAmount(overallStats.thisMonthExpense)} out
              </div>
            </div>
          </div>

          {/* Business Performance Breakdown */}
          {overallStats.businessBreakdown && overallStats.businessBreakdown.length > 0 && (
            <div className="card">
              <h3 className="text-md font-semibold text-gray-800 mb-3">Business Performance</h3>
              <div className="space-y-3">
                {overallStats.businessBreakdown.map((biz) => (
                  <div 
                    key={biz._id} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => navigate(`/business/${biz._id}`)}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`badge badge-${biz.role}`}>{biz.role}</span>
                      <span className="font-medium text-gray-900">{biz.name}</span>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-green-600">
                        +{formatAmount(biz.income)}
                      </div>
                      <div className="text-red-600">
                        -{formatAmount(biz.expense)}
                      </div>
                      <div className={`font-bold ${biz.profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        {biz.profit >= 0 ? '+' : '-'}{formatAmount(Math.abs(biz.profit))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {businesses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No businesses yet</h3>
          <p className="text-gray-500 mb-6">Create your first business to start tracking profit and expenses</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            Create Your First Business
          </button>
        </div>
      ) : (
        <>
          {/* Owned Businesses */}
          {ownedBusinesses.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Owned Businesses ({ownedBusinesses.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ownedBusinesses.map((business) => (
                  <BusinessCard 
                    key={business._id} 
                    business={business}
                    onDelete={handleDeleteBusiness}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Partner Businesses */}
          {partnerBusinesses.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Partner Businesses ({partnerBusinesses.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {partnerBusinesses.map((business) => (
                  <BusinessCard 
                    key={business._id} 
                    business={business}
                    onDelete={handleDeleteBusiness}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Business Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Business</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateBusiness}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="My Business"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows="3"
                  placeholder="Brief description of your business"
                />
              </div>

              <div className="flex space-x-3">
                <button type="submit" className="btn btn-primary flex-1">
                  Create Business
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ name: '', description: '' });
                    setError('');
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

