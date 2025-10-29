import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const UserManagement = () => {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, admins

  useEffect(() => {
    console.log('UserManagement component mounted!');
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching all users...');
      
      const response = await fetch('http://localhost:5002/api/admin/users', {
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MDE5ODAwZWFkNDQxOTc4OTRjOGE0ZiIsInRva2VuVmVyc2lvbiI6MCwiaWF0IjoxNzYxNzEyMTMxLCJleHAiOjE3NjQzMDQxMzF9.Q6co7OAwvkOe2uovACRGcpzwKmX1tiL3yKEcZnart7U'
        }
      });
      
      const data = await response.json();
      console.log('All users API response:', data);
      
      if (data.success) {
        setUsers(data.data.users);
        console.log('All users loaded:', data.data.users.length);
      }
    } catch (error) {
      console.error('UserManagement fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId, userName) => {
    if (!confirm(`Approve ${userName}?`)) return;
    
    try {
      const response = await fetch(`http://localhost:5002/api/admin/users/${userId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MDE5ODAwZWFkNDQxOTc4OTRjOGE0ZiIsInRva2VuVmVyc2lvbiI6MCwiaWF0IjoxNzYxNzEyMTMxLCJleHAiOjE3NjQzMDQxMzF9.Q6co7OAwvkOe2uovACRGcpzwKmX1tiL3yKEcZnart7U'
        }
      });
      
      const result = await response.json();
      if (result.success) {
        alert(`${userName} approved!`);
        fetchAllUsers();
      } else {
        alert(`Failed: ${result.message}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const disapproveUser = async (userId, userName) => {
    if (!confirm(`Disapprove ${userName}? This will revoke their access to the system.`)) return;
    
    try {
      const response = await fetch(`http://localhost:5002/api/admin/users/${userId}/disapprove`, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MDE5ODAwZWFkNDQxOTc4OTRjOGE0ZiIsInRva2VuVmVyc2lvbiI6MCwiaWF0IjoxNzYxNzEyMTMxLCJleHAiOjE3NjQzMDQxMzF9.Q6co7OAwvkOe2uovACRGcpzwKmX1tiL3yKEcZnart7U'
        }
      });
      
      const result = await response.json();
      if (result.success) {
        alert(`${userName} has been disapproved and will be automatically logged out from all devices!`);
        fetchAllUsers();
      } else {
        alert(`Failed: ${result.message}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const rejectUser = async (userId, userName) => {
    if (!confirm(`Reject ${userName}? This will permanently delete their account.`)) return;
    
    try {
      const response = await fetch(`http://localhost:5002/api/admin/users/${userId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MDE5ODAwZWFkNDQxOTc4OTRjOGE0ZiIsInRva2VuVmVyc2lvbiI6MCwiaWF0IjoxNzYxNzEyMTMxLCJleHAiOjE3NjQzMDQxMzF9.Q6co7OAwvkOe2uovACRGcpzwKmX1tiL3yKEcZnart7U'
        }
      });
      
      const result = await response.json();
      if (result.success) {
        alert(`${userName} rejected and deleted!`);
        fetchAllUsers();
      } else {
        alert(`Failed: ${result.message}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const calculateDaysSinceRegistration = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getFilteredUsers = () => {
    switch (filter) {
      case 'pending':
        return users.filter(u => !u.isApproved);
      case 'approved':
        return users.filter(u => u.isApproved);
      case 'admins':
        return users.filter(u => u.role === 'admin');
      default:
        return users;
    }
  };

  const filteredUsers = getFilteredUsers();

  console.log('UserManagement render - loading:', loading, 'users:', users.length, 'isAdmin:', isAdmin);

  // Check if user is admin
  if (!isAdmin) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh', textAlign: 'center' }}>
        <h1 style={{ color: 'red', fontSize: '24px', marginBottom: '20px' }}>
          ACCESS DENIED
        </h1>
        <div style={{ backgroundColor: 'red', padding: '20px', color: 'white', borderRadius: '10px' }}>
          <h2>Admin Access Required</h2>
          <p>You must be an administrator to access this page.</p>
          <p>Current user: {user?.name || 'Not logged in'}</p>
          <p>Admin status: {isAdmin ? 'Yes' : 'No'}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh', maxHeight: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ color: 'black', fontSize: '24px', marginBottom: '20px', flexShrink: 0 }}>
        ADMIN USER MANAGEMENT - {users.length} TOTAL USERS
      </h1>
      
      <div style={{ backgroundColor: 'yellow', padding: '10px', marginBottom: '20px', flexShrink: 0 }}>
        <p style={{ color: 'black' }}>Loading: {loading ? 'YES' : 'NO'}</p>
        <p style={{ color: 'black' }}>Total users: {users.length}</p>
        <p style={{ color: 'black' }}>Filtered users: {filteredUsers.length}</p>
        <p style={{ color: 'black' }}>Component loaded: YES</p>
        <p style={{ color: 'black' }}>Admin access: {isAdmin ? 'YES' : 'NO'}</p>
        <p style={{ color: 'black' }}>Current user: {user?.name || 'Unknown'}</p>
      </div>

      {/* Filter Buttons */}
      <div style={{ marginBottom: '20px', flexShrink: 0 }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '8px 16px',
            backgroundColor: filter === 'all' ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            marginRight: '10px'
          }}
        >
          All Users ({users.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          style={{
            padding: '8px 16px',
            backgroundColor: filter === 'pending' ? '#ffc107' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            marginRight: '10px'
          }}
        >
          Pending ({users.filter(u => !u.isApproved).length})
        </button>
        <button
          onClick={() => setFilter('approved')}
          style={{
            padding: '8px 16px',
            backgroundColor: filter === 'approved' ? '#28a745' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            marginRight: '10px'
          }}
        >
          Approved ({users.filter(u => u.isApproved).length})
        </button>
        <button
          onClick={() => setFilter('admins')}
          style={{
            padding: '8px 16px',
            backgroundColor: filter === 'admins' ? '#6f42c1' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '3px'
          }}
        >
          Admins ({users.filter(u => u.role === 'admin').length})
        </button>
      </div>
      
      <button 
        onClick={fetchAllUsers}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: 'blue', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          marginBottom: '20px',
          flexShrink: 0
        }}
      >
        REFRESH ALL USERS
      </button>
      
      <div style={{ 
        flex: 1, 
        overflow: 'auto', 
        minHeight: 0, 
        paddingRight: '10px',
        scrollbarWidth: 'thin',
        scrollbarColor: '#888 #f1f1f1'
      }}>
        {loading ? (
          <p style={{ color: 'black' }}>Loading users...</p>
        ) : filteredUsers.length === 0 ? (
          <p style={{ color: 'black' }}>No users found for the selected filter.</p>
        ) : (
          <div>
            {filteredUsers.map((userData) => {
            const daysSinceRegistration = calculateDaysSinceRegistration(userData.createdAt);
            const isCurrentUser = userData._id === user?._id;
            
            return (
              <div 
                key={userData._id} 
                style={{ 
                  border: '2px solid black', 
                  padding: '15px', 
                  margin: '10px 0', 
                  borderRadius: '5px',
                  backgroundColor: isCurrentUser ? '#e3f2fd' : 'white',
                  color: 'black'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ color: 'black', fontSize: '18px', margin: '0 0 5px 0' }}>
                      {userData.name} {isCurrentUser && '(You)'}
                    </h3>
                    <p style={{ margin: '2px 0', color: 'black' }}>Email: {userData.email}</p>
                    <p style={{ margin: '2px 0', color: 'black' }}>Role: {userData.role}</p>
                    <p style={{ margin: '2px 0', color: 'black' }}>
                      Status: {userData.isApproved ? 
                        <span style={{ color: 'green', fontWeight: 'bold' }}>APPROVED</span> : 
                        <span style={{ color: 'orange', fontWeight: 'bold' }}>PENDING</span>
                      }
                    </p>
                    <p style={{ margin: '2px 0', color: 'black' }}>
                      Registered: {new Date(userData.createdAt).toLocaleDateString()} 
                      <span style={{ color: 'blue', fontWeight: 'bold' }}> ({daysSinceRegistration} days ago)</span>
                    </p>
                    {userData.approvedAt && (
                      <p style={{ margin: '2px 0', color: 'green' }}>
                        Approved: {new Date(userData.approvedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {!userData.isApproved && (
                      <button
                        onClick={() => approveUser(userData._id, userData.name)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: 'green',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          fontSize: '12px'
                        }}
                      >
                        APPROVE
                      </button>
                    )}
                    
                    {userData.isApproved && userData.role !== 'admin' && !isCurrentUser && (
                      <button
                        onClick={() => disapproveUser(userData._id, userData.name)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: 'orange',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          fontSize: '12px'
                        }}
                      >
                        DISAPPROVE
                      </button>
                    )}
                    
                    {!isCurrentUser && (
                      <button
                        onClick={() => rejectUser(userData._id, userData.name)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: 'red',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          fontSize: '12px'
                        }}
                      >
                        DELETE
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;