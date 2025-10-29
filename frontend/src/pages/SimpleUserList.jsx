import { useState, useEffect } from 'react';

const SimpleUserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log('Fetching users...');
      const response = await fetch('http://localhost:5002/api/admin/users', {
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZmI1OGY1MjU1Yzk4NzA2NmVhYWMwYyIsImlhdCI6MTc2MTMwMzkyNSwiZXhwIjoxNzYzODk1OTI1fQ.YyS5Xv9iqG8WcDSUhOGyiZauy4lavGvqvTGcGMAdce4'
        }
      });
      
      const data = await response.json();
      console.log('API Response:', data);
      
      if (data.success) {
        setUsers(data.data.users);
        console.log('Users set:', data.data.users.length);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading users...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Simple User List - {users.length} users</h1>
      
      <div className="space-y-4">
        {users.map((user) => (
          <div key={user._id} className="border p-4 rounded">
            <h3 className="font-bold">{user.name}</h3>
            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p>
            <p>Approved: {user.isApproved ? 'Yes' : 'No'}</p>
            <p>Created: {new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
      
      <button 
        onClick={fetchUsers}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Refresh
      </button>
    </div>
  );
};

export default SimpleUserList;
