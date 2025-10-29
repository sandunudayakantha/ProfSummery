import { useState } from 'react';
import api from '../utils/api';

const APITest = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing API connection...');
      console.log('Base URL:', api.defaults.baseURL);
      console.log('Token:', localStorage.getItem('token'));
      
      const response = await api.get('/admin/dashboard');
      console.log('API Response:', response.data);
      setResult(response.data);
    } catch (error) {
      console.error('API Error:', error);
      setError({
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing login...');
      const response = await api.post('/auth/login', {
        email: 'sandunudayakantha.eg@gmail.com',
        password: 'Admin123!'
      });
      console.log('Login Response:', response.data);
      
      // Store token
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
      
      setResult(response.data);
    } catch (error) {
      console.error('Login Error:', error);
      setError({
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">API Connection Test</h1>
        
        <div className="bg-white p-4 rounded shadow mb-4">
          <h2 className="text-lg font-semibold mb-2">API Configuration</h2>
          <p><strong>Base URL:</strong> {api.defaults.baseURL}</p>
          <p><strong>Token:</strong> {localStorage.getItem('token') ? 'Present' : 'Missing'}</p>
          <p><strong>User:</strong> {localStorage.getItem('user') ? 'Present' : 'Missing'}</p>
        </div>

        <div className="bg-white p-4 rounded shadow mb-4">
          <h2 className="text-lg font-semibold mb-2">Test Actions</h2>
          <div className="space-x-4">
            <button
              onClick={testLogin}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Login'}
            </button>
            <button
              onClick={testAPI}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Admin API'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <h3 className="font-semibold">Error</h3>
            <p><strong>Message:</strong> {error.message}</p>
            <p><strong>Status:</strong> {error.status}</p>
            <pre className="mt-2 text-sm overflow-auto">
              {JSON.stringify(error.data, null, 2)}
            </pre>
          </div>
        )}

        {result && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <h3 className="font-semibold">Success</h3>
            <pre className="mt-2 text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Click "Test Login" to authenticate as admin</li>
            <li>Click "Test Admin API" to test the admin dashboard endpoint</li>
            <li>Check browser console for detailed logs</li>
            <li>If successful, go to <a href="/admin" className="text-blue-600 underline">/admin</a></li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default APITest;
