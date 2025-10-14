import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import TransactionForm from '../components/TransactionForm';
import DayWiseTransactionForm from '../components/DayWiseTransactionForm';
import DayWiseTransactionList from '../components/DayWiseTransactionList';
import DocumentUpload from '../components/DocumentUpload';
import DocumentList from '../components/DocumentList';
import LogoUpload from '../components/LogoUpload';
import { useCurrency } from '../context/CurrencyContext';

const BusinessDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatAmount } = useCurrency();
  
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

  useEffect(() => {
    fetchBusinessData();
  }, [id]);

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

  const canEdit = business?.userRole === 'owner' || business?.userRole === 'editor';
  const isOwner = business?.userRole === 'owner';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading business details...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Business not found</h2>
          <Link to="/dashboard" className="btn btn-primary mt-4">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{business.name}</h1>
            {business.description && (
              <p className="text-gray-600 mt-1">{business.description}</p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <span className={`badge badge-${business.userRole}`}>
              {business.userRole}
            </span>
            {isOwner && (
              <button
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
                className="btn btn-danger text-sm"
                title="Delete Business"
              >
                🗑️ Delete Business
              </button>
            )}
          </div>
        </div>
        <Link to="/dashboard" className="text-primary-600 hover:text-primary-700">
          ← Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-green-50">
            <div className="text-sm font-medium text-green-800">Total Income</div>
            <div className="text-2xl sm:text-3xl font-bold text-green-600 mt-2 break-words">
              {formatAmount(stats.overall.totalIncome)}
            </div>
          </div>
          <div className="card bg-red-50">
            <div className="text-sm font-medium text-red-800">Total Expenses</div>
            <div className="text-2xl sm:text-3xl font-bold text-red-600 mt-2 break-words">
              {formatAmount(stats.overall.totalExpense)}
            </div>
          </div>
          <div className="card bg-blue-50">
            <div className="text-sm font-medium text-blue-800">Net Profit</div>
            <div className={`text-2xl sm:text-3xl font-bold mt-2 break-words ${stats.overall.profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatAmount(stats.overall.profit)}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'transactions'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('partners')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'partners'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Partners
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'documents'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Documents
          </button>
          <button
            onClick={() => navigate(`/business/${id}/reports`)}
            className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm"
          >
            Reports →
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            {canEdit && (
              <button
                onClick={() => setShowAddTransaction(true)}
                className="btn btn-primary"
              >
                + Add Day's Transactions
              </button>
            )}
          </div>

          {stats?.recentTransactions.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No transactions yet</h3>
              <p className="text-gray-500 mb-4">Start tracking your daily income and expenses</p>
              {canEdit && (
                <button
                  onClick={() => setShowAddTransaction(true)}
                  className="btn btn-primary"
                >
                  Add First Day's Transactions
                </button>
              )}
            </div>
          ) : (
            <DayWiseTransactionList
              transactions={stats?.recentTransactions || []}
              onEdit={(transaction) => setEditingTransaction(transaction)}
              onDelete={handleDeleteTransaction}
              onAddToDate={handleAddToDate}
              canEdit={canEdit}
            />
          )}
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Day-Wise Transactions</h2>
            {canEdit && (
              <button
                onClick={() => setShowAddTransaction(true)}
                className="btn btn-primary"
              >
                + Add Day's Transactions
              </button>
            )}
          </div>

          {transactions.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No transactions yet</h3>
              <p className="text-gray-500 mb-4">Start tracking your daily income and expenses</p>
              {canEdit && (
                <button
                  onClick={() => setShowAddTransaction(true)}
                  className="btn btn-primary"
                >
                  Add First Day's Transactions
                </button>
              )}
            </div>
          ) : (
            <DayWiseTransactionList
              transactions={transactions}
              onEdit={(transaction) => setEditingTransaction(transaction)}
              onDelete={handleDeleteTransaction}
              onAddToDate={handleAddToDate}
              canEdit={canEdit}
            />
          )}
        </div>
      )}

      {activeTab === 'partners' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Partners</h2>
            {isOwner && (
              <button
                onClick={() => setShowAddPartner(true)}
                className="btn btn-primary"
              >
                + Add Partner
              </button>
            )}
          </div>

          <div className="card">
            <div className="space-y-4">
              {business.partners.map((partner) => (
                <div
                  key={partner._id}
                  className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0"
                >
                  <div>
                    <div className="font-medium text-gray-900">{partner.user?.name}</div>
                    <div className="text-sm text-gray-500">{partner.user?.email}</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`badge badge-${partner.role}`}>
                      {partner.role}
                    </span>
                    {isOwner && partner.role !== 'owner' && (
                      <button
                        onClick={() => handleRemovePartner(partner._id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="space-y-6">
          {/* Logo Section - Owner Only */}
          {isOwner && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Logo</h3>
              <LogoUpload
                businessId={id}
                currentLogo={business.logo}
                onUploadSuccess={(logo) => {
                  setBusiness({ ...business, logo });
                }}
              />
            </div>
          )}

          {/* Documents Section */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Documents</h2>
            {canEdit && (
              <button
                onClick={() => setShowAddDocument(true)}
                className="btn btn-primary"
              >
                + Upload Document
              </button>
            )}
          </div>

          <div className="card">
            <DocumentList
              documents={documents}
              businessId={id}
              userRole={business.userRole}
              onDelete={(documentId) => {
                setDocuments(documents.filter(d => d._id !== documentId));
              }}
            />
          </div>
        </div>
      )}

      {/* Add Day's Transactions Modal */}
      {showAddTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {selectedDate ? 'Add More Transactions' : "Add Day's Transactions"}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {selectedDate 
                ? `Adding more transactions to ${new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`
                : 'Select a date and add all income and expenses for that day. You can add multiple items at once.'
              }
            </p>
            <div className="flex-1 overflow-y-auto">
              <DayWiseTransactionForm
                onSubmit={handleAddTransaction}
                onCancel={() => {
                  setShowAddTransaction(false);
                  setSelectedDate(null);
                }}
                preSelectedDate={selectedDate}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Transaction</h2>
            <TransactionForm
              initialData={editingTransaction}
              onSubmit={handleUpdateTransaction}
              onCancel={() => setEditingTransaction(null)}
            />
          </div>
        </div>
      )}

      {/* Add Partner Modal */}
      {showAddPartner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Partner</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleAddPartner}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Partner Email *
                </label>
                <input
                  type="email"
                  value={partnerEmail}
                  onChange={(e) => setPartnerEmail(e.target.value)}
                  className="input"
                  placeholder="partner@example.com"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  User must be registered on the platform
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  value={partnerRole}
                  onChange={(e) => setPartnerRole(e.target.value)}
                  className="input"
                >
                  <option value="viewer">Viewer (Read-only access)</option>
                  <option value="editor">Editor (Can add transactions)</option>
                </select>
              </div>

              <div className="flex space-x-3">
                <button type="submit" className="btn btn-primary flex-1">
                  Add Partner
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddPartner(false);
                    setPartnerEmail('');
                    setPartnerRole('viewer');
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

      {/* Add Document Modal */}
      {showAddDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload Document</h2>
            <DocumentUpload
              businessId={id}
              onUploadSuccess={(newDocument) => {
                setDocuments([...documents, newDocument]);
                setShowAddDocument(false);
              }}
            />
            <button
              onClick={() => setShowAddDocument(false)}
              className="btn btn-secondary w-full mt-4"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessDetails;

