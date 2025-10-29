import { useState, useEffect } from 'react';

const DirectTest = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testDirectAPI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Direct API call without using the api utility
      const response = await fetch('http://localhost:5002/api/admin/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZmI1OGY1MjU1Yzk4NzA2NmVhYWMwYyIsImlhdCI6MTc2MTMwMzkyNSwiZXhwIjoxNzYzODk1OTI1fQ.YyS5Xv9iqG8WcDSUhOGyiZauy4lavGvqvTGcGMAdce4',
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      console.log('Direct API Response:', result);
      setData(result);
    } catch (error) {
      console.error('Direct API Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const testPendingUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5002/api/admin/users?isApproved=false', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZmI1OGY1MjU1Yzk4NzA2NmVhYWMwYyIsImlhdCI6MTc2MTMwMzkyNSwiZXhwIjoxNzYzODk1OTI1fQ.YyS5Xv9iqG8WcDSUhOGyiZauy4lavGvqvTGcGMAdce4',
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      console.log('Pending Users Response:', result);
      setData(result);
    } catch (error) {
      console.error('Pending Users Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Direct API Test</h1>
        
        <div className="bg-white p-4 rounded shadow mb-4">
          <h2 className="text-lg font-semibold mb-2">Test Actions</h2>
          <div className="space-x-4">
            <button
              onClick={testDirectAPI}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Dashboard API'}
            </button>
            <button
              onClick={testPendingUsers}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Pending Users API'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <h3 className="font-semibold">Error</h3>
            <p>{error}</p>
          </div>
        )}

        {data && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <h3 className="font-semibold">Success</h3>
            <pre className="mt-2 text-sm overflow-auto max-h-96">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Click "Test Dashboard API" to test the admin dashboard endpoint</li>
            <li>Click "Test Pending Users API" to test the pending users endpoint</li>
            <li>Check browser console for detailed logs</li>
            <li>If this works, the issue is with the frontend authentication or routing</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default DirectTest;
