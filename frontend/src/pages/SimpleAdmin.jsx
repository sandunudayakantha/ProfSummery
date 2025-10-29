import { useState, useEffect } from 'react';
import api from '../utils/api';

const SimpleAdmin = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching pending users...');
      
      const response = await api.get('/admin/users?isApproved=false');
      console.log('Response:', response.data);
      
      setPendingUsers(response.data.data.users);
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/approve`);
      setPendingUsers(prev => prev.filter(user => user._id !== userId));
      alert('User approved successfully!');
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Failed to approve user');
    }
  };

  const rejectUser = async (userId) => {
    if (!confirm('Are you sure you want to reject this user?')) return;
    
    try {
      await api.put(`/admin/users/${userId}/reject`);
      setPendingUsers(prev => prev.filter(user => user._id !== userId));
      alert('User rejected successfully!');
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('Failed to reject user');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Simple Admin Panel</h1>
          <div className="bg-white p-8 rounded shadow text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4">Loading pending users...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Simple Admin Panel</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <h3 className="font-semibold">Error</h3>
            <p>{error}</p>
            <button
              onClick={fetchPendingUsers}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Simple Admin Panel</h1>
        
        <div className="bg-white p-4 rounded shadow mb-4">
          <h2 className="text-lg font-semibold mb-2">Pending Users ({pendingUsers.length})</h2>
          <button
            onClick={fetchPendingUsers}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>

        {pendingUsers.length === 0 ? (
          <div className="bg-white p-8 rounded shadow text-center">
            <p className="text-gray-500">No pending users found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingUsers.map((user) => (
              <div key={user._id} className="bg-white p-4 rounded shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{user.name}</h3>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-500">
                      Registered: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => approveUser(user._id)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectUser(user._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleAdmin;
