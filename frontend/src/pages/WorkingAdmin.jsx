import { useState, useEffect } from 'react';

const WorkingAdmin = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5002/api/admin/users?isApproved=false', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MDE5ODAwZWFkNDQxOTc4OTRjOGE0ZiIsInRva2VuVmVyc2lvbiI6MCwiaWF0IjoxNzYxNzEyMTMxLCJleHAiOjE3NjQzMDQxMzF9.Q6co7OAwvkOe2uovACRGcpzwKmX1tiL3yKEcZnart7U',
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      if (result.success) {
        setPendingUsers(result.data.users);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to approve ${userName}?`)) return;
    
    try {
      const response = await fetch(`http://localhost:5002/api/admin/users/${userId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MDE5ODAwZWFkNDQxOTc4OTRjOGE0ZiIsInRva2VuVmVyc2lvbiI6MCwiaWF0IjoxNzYxNzEyMTMxLCJleHAiOjE3NjQzMDQxMzF9.Q6co7OAwvkOe2uovACRGcpzwKmX1tiL3yKEcZnart7U',
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      if (result.success) {
        alert(`${userName} has been approved successfully!`);
        fetchPendingUsers(); // Refresh the list
      } else {
        alert(`Failed to approve ${userName}: ${result.message}`);
      }
    } catch (error) {
      alert(`Error approving ${userName}: ${error.message}`);
    }
  };

  const rejectUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to reject ${userName}? This will permanently delete their account.`)) return;
    
    try {
      const response = await fetch(`http://localhost:5002/api/admin/users/${userId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MDE5ODAwZWFkNDQxOTc4OTRjOGE0ZiIsInRva2VuVmVyc2lvbiI6MCwiaWF0IjoxNzYxNzEyMTMxLCJleHAiOjE3NjQzMDQxMzF9.Q6co7OAwvkOe2uovACRGcpzwKmX1tiL3yKEcZnart7U',
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      if (result.success) {
        alert(`${userName} has been rejected and their account deleted.`);
        fetchPendingUsers(); // Refresh the list
      } else {
        alert(`Failed to reject ${userName}: ${result.message}`);
      }
    } catch (error) {
      alert(`Error rejecting ${userName}: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-black">Loading pending users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="max-w-md w-full p-6">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Admin Panel - User Requests</h1>
          <p className="text-black">Manage pending user approvals</p>
          
          {/* Alert for pending users */}
          {pendingUsers.length > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <div className="text-yellow-600 text-xl mr-3">⚠️</div>
                <div>
                  <h3 className="text-black font-semibold">
                    {pendingUsers.length} user{pendingUsers.length > 1 ? 's' : ''} waiting for approval
                  </h3>
                  <p className="text-black text-sm">
                    Review and approve user accounts below to grant them access to the system.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pending Users */}
        {pendingUsers.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-xl font-semibold text-black mb-2">No Pending Approvals</h2>
            <p className="text-black">All user accounts have been reviewed and approved.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingUsers.map((user) => (
              <div key={user._id} className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-black text-lg">{user.name}</h3>
                      <p className="text-black">{user.email}</p>
                      <p className="text-black text-sm">
                        Registered: {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => approveUser(user._id, user.name)}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <span>✓</span>
                      <span>Approve</span>
                    </button>
                    
                    <button
                      onClick={() => rejectUser(user._id, user.name)}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                    >
                      <span>✗</span>
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={fetchPendingUsers}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh List
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkingAdmin;
