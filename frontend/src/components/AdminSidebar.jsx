import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const { user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    fetchPendingCount();
  }, []);

  const fetchPendingCount = async () => {
    try {
      console.log('Fetching pending count...');
      const response = await fetch('http://localhost:5002/api/admin/users?isApproved=false', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MDE5ODAwZWFkNDQxOTc4OTRjOGE0ZiIsInRva2VuVmVyc2lvbiI6MCwiaWF0IjoxNzYxNzEyMTMxLCJleHAiOjE3NjQzMDQxMzF9.Q6co7OAwvkOe2uovACRGcpzwKmX1tiL3yKEcZnart7U',
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      console.log('Pending count response:', result);
      
      if (result.success) {
        const count = result.data.pagination.total;
        console.log('Setting pending count to:', count);
        setPendingCount(count);
      } else {
        console.error('Failed to fetch pending count:', result.message);
      }
    } catch (error) {
      console.error('Error fetching pending count:', error);
    }
  };

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: '📊'
    },
    {
      name: 'User Management',
      path: '/users-direct',
      icon: '👥',
      badge: pendingCount > 0 ? pendingCount : null
    },
    {
      name: 'Debug',
      path: '/admin/debug',
      icon: '🔧'
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white/80 backdrop-blur-sm shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#90e0f7' }}>
                <img 
                  src="/logo.png" 
                  alt="Profit Summary Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-black">Admin Panel</h1>
                <p className="text-sm text-black mt-1">Profit Summary</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-black">{user?.name}</p>
                <p className="text-sm text-black">Administrator</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-blue-100 text-black border-r-2 border-blue-700'
                        : 'text-black hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="space-y-2">
              <button
                onClick={fetchPendingCount}
                className="w-full flex items-center space-x-3 px-4 py-2 text-black hover:bg-blue-50 rounded-lg transition-colors"
              >
                <span className="text-lg">🔄</span>
                <span>Refresh Count ({pendingCount})</span>
              </button>
              
              <Link
                to="/"
                className="flex items-center space-x-3 px-4 py-2 text-black hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-lg">🏠</span>
                <span>Back to App</span>
              </Link>
              
              <button
                onClick={logout}
                className="w-full flex items-center space-x-3 px-4 py-2 text-black hover:bg-red-50 rounded-lg transition-colors"
              >
                <span className="text-lg">🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default AdminSidebar;
