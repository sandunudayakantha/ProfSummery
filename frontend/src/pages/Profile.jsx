import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Edit3, 
  Save, 
  X, 
  Lock, 
  Key, 
  Shield, 
  AlertTriangle,
  Check,
  Settings,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import GlassCard from '../components/GlassCard';
import FloatingButton from '../components/FloatingButton';

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
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

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
    <div className="h-full overflow-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#90e0f7' }}></div>
            <span className="text-white/50 text-sm">Manage your account</span>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard')}
          className="px-6 py-3 text-white rounded-xl shadow-lg transition-all duration-300 flex items-center space-x-2 hover:opacity-90 bg-white/10 border border-white/20"
        >
          <Settings className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </motion.button>
      </motion.div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-xl backdrop-blur-xl border flex items-center space-x-3 ${
              message.type === 'success' 
                ? 'bg-green-500/20 border-green-400/50 text-green-200' 
                : 'bg-red-500/20 border-red-400/50 text-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard glow gradient="blue" className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(144, 224, 247, 0.2)' }}>
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Profile Information</h2>
              <p className="text-white/60 text-sm">Manage your personal details</p>
            </div>
          </div>
          
          {/* Email (Read-only) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white/90 mb-3 flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>Email Address</span>
            </label>
            <div className="relative">
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white/70 cursor-not-allowed focus:outline-none"
              />
              <div className="absolute inset-0 bg-white/5 rounded-lg"></div>
            </div>
            <p className="text-xs text-white/50 mt-2 flex items-center space-x-1">
              <Shield className="w-3 h-3" />
              <span>Email cannot be changed for security</span>
            </p>
          </div>

          {/* Name (Editable) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white/90 mb-3 flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Full Name</span>
            </label>
            {editingName ? (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                onSubmit={handleUpdateProfile}
                className="space-y-4"
              >
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:bg-white/10 transition-all"
                  onFocus={(e) => e.target.style.borderColor = 'rgba(144, 224, 247, 0.5)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                  placeholder="Enter your full name"
                  required
                />
                <div className="flex space-x-3">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    className="px-6 py-3 text-white rounded-lg font-medium shadow-lg transition-all duration-300 hover:opacity-90 flex items-center space-x-2"
                    style={{ backgroundColor: '#90e0f7' }}
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Saving...' : 'Save'}</span>
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setEditingName(false);
                      setName(user?.name || '');
                    }}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all duration-300 flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </motion.button>
                </div>
              </motion.form>
            ) : (
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#90e0f7' }}></div>
                  <span className="text-white/90 text-lg">{user?.name}</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditingName(true)}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-300 flex items-center space-x-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="text-sm">Edit</span>
                </motion.button>
              </div>
            )}
          </div>

          {/* Currency Preference */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white/90 mb-3 flex items-center space-x-2">
              <DollarSign className="w-4 h-4" />
              <span>Preferred Currency</span>
            </label>
            <div className="relative">
              <select
                value={currency}
                onChange={(e) => handleUpdateCurrency(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:bg-white/10 transition-all appearance-none cursor-pointer"
                onFocus={(e) => e.target.style.borderColor = 'rgba(144, 224, 247, 0.5)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                style={{ colorScheme: 'dark' }}
              >
                {currencies.map((curr) => (
                  <option key={curr.code} value={curr.code} className="bg-slate-800">
                    {curr.symbol} {curr.code} - {curr.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-white/50 mt-2 flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>Exchange rates update daily</span>
            </p>
          </div>

          {/* Account Created */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-white/50" />
              <span className="text-sm text-white/50">
                Account created: {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
              </span>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Change Password */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard glow gradient="emerald" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(144, 224, 247, 0.2)' }}>
                <Lock className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Security Settings</h2>
                <p className="text-white/60 text-sm">Manage your password and security</p>
              </div>
            </div>
            {!showPasswordForm && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPasswordForm(true)}
                className="px-6 py-3 text-white rounded-xl shadow-lg transition-all duration-300 flex items-center space-x-2 hover:opacity-90"
                style={{ backgroundColor: '#90e0f7' }}
              >
                <Key className="w-5 h-5" />
                <span>Change Password</span>
              </motion.button>
            )}
          </div>

          <AnimatePresence>
            {showPasswordForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleChangePassword}
                className="space-y-6"
              >
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-3 flex items-center space-x-2">
                    <Lock className="w-4 h-4" />
                    <span>Current Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:bg-white/10 transition-all pr-12"
                      onFocus={(e) => e.target.style.borderColor = 'rgba(144, 224, 247, 0.5)'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                    >
                      {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-3 flex items-center space-x-2">
                    <Key className="w-4 h-4" />
                    <span>New Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:bg-white/10 transition-all pr-12"
                      onFocus={(e) => e.target.style.borderColor = 'rgba(144, 224, 247, 0.5)'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                      placeholder="Enter new password (min 6 characters)"
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                    >
                      {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-3 flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Confirm New Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:bg-white/10 transition-all pr-12"
                      onFocus={(e) => e.target.style.borderColor = 'rgba(144, 224, 247, 0.5)'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                      placeholder="Confirm new password"
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    className="flex-1 px-6 py-3 text-white rounded-lg font-medium shadow-lg transition-all duration-300 hover:opacity-90 flex items-center justify-center space-x-2"
                    style={{ backgroundColor: '#90e0f7' }}
                  >
                    <Key className="w-5 h-5" />
                    <span>{loading ? 'Changing...' : 'Change Password'}</span>
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setShowPasswords({ current: false, new: false, confirm: false });
                    }}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all duration-300 flex items-center space-x-2"
                  >
                    <X className="w-5 h-5" />
                    <span>Cancel</span>
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {!showPasswordForm && (
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-white/50" />
                <p className="text-white/60 text-sm">
                  Keep your account secure by using a strong password
                </p>
              </div>
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Danger Zone - Delete Account */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <GlassCard className="p-6 border-2 border-red-400/50 bg-red-500/10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 rounded-xl bg-red-500/20">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-red-200">Danger Zone</h2>
              <p className="text-red-300/70 text-sm">Irreversible actions that affect your account</p>
            </div>
          </div>

          <AnimatePresence>
            {!showDeleteConfirm ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-400/30">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <p className="text-red-200 text-sm">
                      This action cannot be undone. All your data will be permanently deleted.
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-lg transition-all duration-300 flex items-center space-x-2"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Delete Account</span>
                </motion.button>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleDeleteAccount}
                className="space-y-6"
              >
                <div className="bg-red-500/20 border border-red-400/50 text-red-200 px-6 py-4 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold mb-3 text-lg">⚠️ Warning: This action cannot be undone!</p>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                          <span>Your account will be permanently deleted</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                          <span>All your businesses will be removed</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                          <span>All transactions will be lost</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                          <span>Partner access will be revoked</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                          <span>Uploaded documents will be deleted</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-red-200 mb-3 flex items-center space-x-2">
                    <Lock className="w-4 h-4" />
                    <span>Enter your password to confirm deletion</span>
                  </label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-red-400/50 rounded-lg text-white placeholder:text-red-300/50 focus:outline-none focus:bg-white/10 transition-all focus:border-red-400"
                    required
                    placeholder="Enter your password to confirm"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span>{loading ? 'Deleting...' : 'Yes, Delete My Account'}</span>
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeletePassword('');
                    }}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all duration-300 flex items-center space-x-2"
                  >
                    <X className="w-5 h-5" />
                    <span>Cancel</span>
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </GlassCard>
      </motion.div>

      {/* Floating Action Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
        className="fixed bottom-8 right-8 z-50"
      >
        <FloatingButton 
          size="lg" 
          onClick={() => navigate('/dashboard')}
          variant="primary"
        >
          <Settings className="w-6 h-6" />
        </FloatingButton>
      </motion.div>
    </div>
  );
};

export default Profile;

