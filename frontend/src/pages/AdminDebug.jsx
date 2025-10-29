import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const AdminDebug = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching admin data...');
      
      // Test dashboard API
      const dashboardResponse = await api.get('/admin/dashboard');
      console.log('Dashboard response:', dashboardResponse.data);
      setDashboardData(dashboardResponse.data);
      
      // Test pending users API
      const pendingResponse = await api.get('/admin/users?isApproved=false');
      console.log('Pending users response:', pendingResponse.data);
      setPendingUsers(pendingResponse.data.data.users);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4 text-black">Admin Debug - Loading...</h1>
          <div className="bg-white p-4 rounded shadow">
            <p>Fetching admin data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4 text-black">Admin Debug - Error</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p><strong>Error:</strong> {error}</p>
            <button 
              onClick={fetchData}
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
        <h1 className="text-2xl font-bold mb-4 text-black">Admin Debug - Data Retrieved</h1>
        
        {/* User Info */}
        <div className="bg-white p-4 rounded shadow mb-4">
          <h2 className="text-lg font-semibold mb-2 text-black">Current User</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        {/* Dashboard Data */}
        <div className="bg-white p-4 rounded shadow mb-4">
          <h2 className="text-lg font-semibold mb-2 text-black">Dashboard Data</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
            {JSON.stringify(dashboardData, null, 2)}
          </pre>
        </div>

        {/* Pending Users */}
        <div className="bg-white p-4 rounded shadow mb-4">
          <h2 className="text-lg font-semibold mb-2 text-black">Pending Users ({pendingUsers.length})</h2>
          {pendingUsers.length > 0 ? (
            <div className="space-y-2">
              {pendingUsers.map((user, index) => (
                <div key={user._id || index} className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                  <p><strong>Name:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Role:</strong> {user.role}</p>
                  <p><strong>Approved:</strong> {user.isApproved ? 'Yes' : 'No'}</p>
                  <p><strong>Created:</strong> {new Date(user.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-black">No pending users found</p>
          )}
        </div>

        {/* Raw Data */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2 text-black">Raw Pending Users Data</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
            {JSON.stringify(pendingUsers, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default AdminDebug;
