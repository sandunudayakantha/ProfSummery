import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import GlassCard from '../components/GlassCard';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Fetching dashboard data...');
      
      // Use direct fetch instead of api utility
      const dashboardResponse = await fetch('http://localhost:5002/api/admin/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MDE5ODAwZWFkNDQxOTc4OTRjOGE0ZiIsInRva2VuVmVyc2lvbiI6MCwiaWF0IjoxNzYxNzEyMTMxLCJleHAiOjE3NjQzMDQxMzF9.Q6co7OAwvkOe2uovACRGcpzwKmX1tiL3yKEcZnart7U',
          'Content-Type': 'application/json'
        }
      });
      
      const dashboardData = await dashboardResponse.json();
      console.log('Dashboard response:', dashboardData);
      
      if (dashboardData.success) {
        setStats(dashboardData.data.stats);
        setRecentUsers(dashboardData.data.recentUsers);
      } else {
        throw new Error(dashboardData.message);
      }
      
      // Fetch pending users specifically
      console.log('Fetching pending users...');
      const pendingResponse = await fetch('http://localhost:5002/api/admin/users?isApproved=false', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MDE5ODAwZWFkNDQxOTc4OTRjOGE0ZiIsInRva2VuVmVyc2lvbiI6MCwiaWF0IjoxNzYxNzEyMTMxLCJleHAiOjE3NjQzMDQxMzF9.Q6co7OAwvkOe2uovACRGcpzwKmX1tiL3yKEcZnart7U',
          'Content-Type': 'application/json'
        }
      });
      
      const pendingData = await pendingResponse.json();
      console.log('Pending users response:', pendingData);
      
      if (pendingData.success) {
        setPendingUsers(pendingData.data.users);
      } else {
        throw new Error(pendingData.message);
      }
      
    } catch (error) {
      setError('Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: 'approve' }));
      
      const response = await fetch(`http://localhost:5002/api/admin/users/${userId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MDE5ODAwZWFkNDQxOTc4OTRjOGE0ZiIsInRva2VuVmVyc2lvbiI6MCwiaWF0IjoxNzYxNzEyMTMxLCJleHAiOjE3NjQzMDQxMzF9.Q6co7OAwvkOe2uovACRGcpzwKmX1tiL3yKEcZnart7U',
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      if (result.success) {
        // Update local state
        setPendingUsers(prev => prev.filter(user => user._id !== userId));
        setStats(prev => ({
          ...prev,
          pendingUsers: prev.pendingUsers - 1,
          approvedUsers: prev.approvedUsers + 1
        }));
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Failed to approve user');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: null }));
    }
  };

  const handleReject = async (userId) => {
    if (!confirm('Are you sure you want to reject this user? This will delete their account permanently.')) {
      return;
    }
    
    try {
      setActionLoading(prev => ({ ...prev, [userId]: 'reject' }));
      
      const response = await fetch(`http://localhost:5002/api/admin/users/${userId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MDE5ODAwZWFkNDQxOTc4OTRjOGE0ZiIsInRva2VuVmVyc2lvbiI6MCwiaWF0IjoxNzYxNzEyMTMxLCJleHAiOjE3NjQzMDQxMzF9.Q6co7OAwvkOe2uovACRGcpzwKmX1tiL3yKEcZnart7U',
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      if (result.success) {
        // Update local state
        setPendingUsers(prev => prev.filter(user => user._id !== userId));
        setStats(prev => ({
          ...prev,
          pendingUsers: prev.pendingUsers - 1,
          totalUsers: prev.totalUsers - 1
        }));
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('Failed to reject user');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: null }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-black">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-black mb-2">Error</h2>
          <p className="text-black">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Admin Dashboard</h1>
          <p className="text-black">Welcome back, {user?.name}</p>
          
          {/* Pending Count Display */}
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <div className="text-yellow-600 text-xl mr-3">⚠️</div>
              <div>
                <h3 className="text-black font-semibold">
                  {pendingUsers.length} user{pendingUsers.length !== 1 ? 's' : ''} waiting for approval
                </h3>
                <p className="text-black text-sm">
                  Review and approve user accounts to grant them access to the system.
                </p>
              </div>
            </div>
          </div>
          
          {/* Pending Users Alert */}
          {stats?.pendingUsers > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <div className="text-yellow-600 text-xl mr-3">⚠️</div>
                <div>
                  <h3 className="text-black font-semibold">
                    {stats.pendingUsers} user{stats.pendingUsers > 1 ? 's' : ''} waiting for approval
                  </h3>
                  <p className="text-black text-sm">
                    Review and approve user accounts below to grant them access to the system.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <GlassCard className="p-6 text-center">
            <div className="text-2xl font-bold text-black mb-2">{stats?.totalUsers || 0}</div>
            <div className="text-sm text-black">Total Users</div>
          </GlassCard>
          
          <GlassCard className="p-6 text-center">
            <div className="text-2xl font-bold text-black mb-2">{stats?.approvedUsers || 0}</div>
            <div className="text-sm text-black">Approved Users</div>
          </GlassCard>
          
          <GlassCard className="p-6 text-center">
            <div className="text-2xl font-bold text-black mb-2">{stats?.pendingUsers || 0}</div>
            <div className="text-sm text-black">Pending Approval</div>
          </GlassCard>
          
          <GlassCard className="p-6 text-center">
            <div className="text-2xl font-bold text-black mb-2">{stats?.totalAdmins || 0}</div>
            <div className="text-sm text-black">Admins</div>
          </GlassCard>
          
          <GlassCard className="p-6 text-center">
            <div className="text-2xl font-bold text-black mb-2">{stats?.totalBusinesses || 0}</div>
            <div className="text-sm text-black">Businesses</div>
          </GlassCard>
          
          <GlassCard className="p-6 text-center">
            <div className="text-2xl font-bold text-black mb-2">{stats?.totalTransactions || 0}</div>
            <div className="text-sm text-black">Transactions</div>
          </GlassCard>
        </div>

        {/* Pending User Approvals */}
        {pendingUsers.length > 0 ? (
          <GlassCard className="p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-black">
                Pending User Approvals ({pendingUsers.length})
              </h2>
              <div className="text-sm text-black">
                Review and approve new user registrations
              </div>
            </div>
            
            <div className="space-y-4">
              {pendingUsers.map((pendingUser) => (
                <div key={pendingUser._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {pendingUser.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-black">{pendingUser.name}</h3>
                        <p className="text-black text-sm">{pendingUser.email}</p>
                        <p className="text-black text-xs">
                          Registered: {new Date(pendingUser.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleApprove(pendingUser._id)}
                        disabled={actionLoading[pendingUser._id]}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                      >
                        {actionLoading[pendingUser._id] === 'approve' ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Approving...</span>
                          </>
                        ) : (
                          <>
                            <span>✓</span>
                            <span>Approve</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleReject(pendingUser._id)}
                        disabled={actionLoading[pendingUser._id]}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                      >
                        {actionLoading[pendingUser._id] === 'reject' ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Rejecting...</span>
                          </>
                        ) : (
                          <>
                            <span>✗</span>
                            <span>Reject</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {pendingUsers.length >= 10 && (
              <div className="mt-4 text-center">
                <a
                  href="/admin/users?isApproved=false"
                  className="text-black hover:text-gray-800 text-sm font-medium"
                >
                  View all pending users →
                </a>
              </div>
            )}
          </GlassCard>
        ) : (
          <GlassCard className="p-6 mb-8">
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-xl font-semibold text-black mb-2">No Pending Approvals</h2>
              <p className="text-black mb-4">All user accounts have been reviewed and approved.</p>
              <a
                href="/admin/users"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View All Users
              </a>
            </div>
          </GlassCard>
        )}

        {/* Recent Users */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-semibold text-black mb-4">Recent Users</h2>
          {recentUsers.length === 0 ? (
            <p className="text-black text-center py-4">No users found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-black">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-black">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-black">Role</th>
                    <th className="text-left py-3 px-4 font-medium text-black">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-black">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user) => (
                    <tr key={user._id} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-black">{user.name}</td>
                      <td className="py-3 px-4 text-black">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.isApproved 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-black">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

export default AdminDashboard;
