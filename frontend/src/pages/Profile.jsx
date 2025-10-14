import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Profile update state
  const [name, setName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [currencies, setCurrencies] = useState([]);

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Delete account state
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setName(user.name);
      setCurrency(user.currency || 'USD');
    }
    fetchCurrencies();
  }, [user]);

  const fetchCurrencies = async () => {
    try {
      const response = await api.get('/currency/supported');
      setCurrencies(response.data.data);
    } catch (error) {
      console.error('Error fetching currencies:', error);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Update Profile Name
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put('/auth/profile', { name });
      
      // Update local storage
      const updatedUser = { ...user, name: response.data.data.name };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update context (refresh page to reflect changes)
      window.location.reload();
      
      showMessage('success', 'Profile updated successfully!');
      setEditingName(false);
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Update Currency
  const handleUpdateCurrency = async (newCurrency) => {
    setLoading(true);

    try {
      const response = await api.put('/auth/profile', { currency: newCurrency });
      
      // Update local storage
      const updatedUser = { ...user, currency: response.data.data.currency };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update state
      setCurrency(newCurrency);
      
      showMessage('success', 'Currency updated! Page will reload to show new currency.');
      
      // Reload to update all amounts
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to update currency');
      setLoading(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('error', 'New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showMessage('error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await api.put('/auth/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      showMessage('success', 'Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  // Delete Account
  const handleDeleteAccount = async (e) => {
    e.preventDefault();

    if (!window.confirm('Are you ABSOLUTELY sure? This action cannot be undone. All your businesses and data will be permanently deleted.')) {
      return;
    }

    setLoading(true);

    try {
      await api.delete('/auth/account', {
        data: { password: deletePassword }
      });

      showMessage('success', 'Account deleted successfully');
      
      // Logout and redirect
      setTimeout(() => {
        logout();
        navigate('/register');
      }, 2000);
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to delete account');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>

      {/* Success/Error Messages */}
      {message.text && (
        <div className={`mb-6 px-4 py-3 rounded ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-400 text-green-700' 
            : 'bg-red-50 border border-red-400 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Profile Information */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
        
        {/* Email (Read-only) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="input bg-gray-100 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
        </div>

        {/* Name (Editable) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          {editingName ? (
            <form onSubmit={handleUpdateProfile} className="flex space-x-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input flex-1"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingName(false);
                  setName(user?.name || '');
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-gray-900">{user?.name}</span>
              <button
                onClick={() => setEditingName(true)}
                className="text-primary-600 hover:text-primary-700 text-sm"
              >
                Edit Name
              </button>
            </div>
          )}
        </div>

        {/* Currency Preference */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Currency
          </label>
          <select
            value={currency}
            onChange={(e) => handleUpdateCurrency(e.target.value)}
            disabled={loading}
            className="input"
          >
            {currencies.map((curr) => (
              <option key={curr.code} value={curr.code}>
                {curr.symbol} {curr.code} - {curr.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            All amounts will be converted to your preferred currency. Exchange rates update daily.
          </p>
        </div>

        {/* Account Created */}
        <div className="pt-4 border-t">
          <span className="text-sm text-gray-500">
            Account created: {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Change Password */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
          {!showPasswordForm && (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="btn btn-secondary text-sm"
            >
              Change Password
            </button>
          )}
        </div>

        {showPasswordForm && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password *
              </label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="input"
                required
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password * (min 6 characters)
              </label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="input"
                required
                placeholder="Enter new password"
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password *
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="input"
                required
                placeholder="Confirm new password"
                minLength={6}
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {!showPasswordForm && (
          <p className="text-sm text-gray-500">
            Keep your account secure by using a strong password
          </p>
        )}
      </div>

      {/* Danger Zone - Delete Account */}
      <div className="card border-2 border-red-200 bg-red-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-red-900">Danger Zone</h2>
            <p className="text-sm text-red-700 mt-1">
              Irreversible actions that affect your account
            </p>
          </div>
        </div>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="btn btn-danger"
          >
            Delete Account
          </button>
        ) : (
          <form onSubmit={handleDeleteAccount} className="space-y-4">
            <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded">
              <p className="font-semibold mb-2">⚠️ Warning: This action cannot be undone!</p>
              <ul className="text-sm list-disc ml-5 space-y-1">
                <li>Your account will be permanently deleted</li>
                <li>All your businesses will be removed</li>
                <li>All transactions will be lost</li>
                <li>Partner access will be revoked</li>
                <li>Uploaded documents will be deleted</li>
              </ul>
            </div>

            <div>
              <label className="block text-sm font-medium text-red-900 mb-2">
                Enter your password to confirm deletion *
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="input border-red-300 focus:ring-red-500"
                required
                placeholder="Enter your password"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-danger"
              >
                {loading ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletePassword('');
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;

