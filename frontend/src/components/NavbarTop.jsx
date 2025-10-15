import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, User, Menu, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NavbarTop = ({ sidebarExpanded, setSidebarExpanded }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="relative h-16 border-b border-white/10"
    >
      {/* Glassmorphic background */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
      </div>
      
      <div className="relative z-10 h-full px-6 flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 group"
          >
            <Menu className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
          </button>
          
          <div>
            <h1 className="text-white/90 text-xl font-semibold">
              Dashboard
            </h1>
            <div className="flex items-center space-x-2 mt-1">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#90e0f7' }}></div>
              <span className="text-white/50 text-sm">System Online</span>
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 group"
          >
            <Bell className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-400 to-pink-500 rounded-full border border-white/20"
            >
              <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75"></div>
            </motion.div>
          </motion.button>

          {/* Profile */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/profile')}
            className="flex items-center space-x-3 p-2 pl-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 group"
          >
            <div className="hidden sm:block text-right">
              <p className="text-white/90 text-sm">{user?.name || 'User'}</p>
              <p className="text-white/50 text-xs">{user?.email || 'user@example.com'}</p>
            </div>
            <div className="relative">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#90e0f7' }}>
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900" style={{ backgroundColor: '#90e0f7' }}></div>
            </div>
          </motion.button>

          {/* Logout */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-all duration-300 group"
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" />
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};

export default NavbarTop;

