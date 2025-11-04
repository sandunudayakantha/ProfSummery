import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Briefcase, 
  User, 
  FileText,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Shield
} from 'lucide-react';

const Sidebar = ({ expanded, setExpanded, mobileOpen, setMobileOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Panel', icon: Shield, path: '/admin' }] : []),
  ];

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    if (path === '/admin') {
      return location.pathname.startsWith('/admin');
    }
    return location.pathname.startsWith(path);
  };

  const handleItemClick = (path) => {
    // If navigating to profile, pass current location in state
    if (path === '/profile') {
      navigate(path, { state: { from: location.pathname } });
    } else {
      navigate(path);
    }
    setMobileOpen(false); // Close mobile menu when item is clicked
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Mobile Sidebar */}
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: mobileOpen ? 0 : -280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed left-0 top-0 h-full w-80 bg-white/5 backdrop-blur-xl border-r border-white/10 z-50 lg:hidden"
      >
        <div className="h-full flex flex-col">
          {/* Mobile Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#90e0f7' }}>
                <img 
                  src="/logo.png" 
                  alt="Profit Summary Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h2 className="text-white/90 text-base sm:text-lg font-semibold">Profit Summary</h2>
                <p className="text-white/50 text-xs">Business Tracker</p>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleItemClick(item.path)}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full group relative overflow-hidden rounded-xl transition-all duration-300 ${
                    active 
                      ? 'border' 
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                  style={active ? { 
                    backgroundColor: 'rgba(144, 224, 247, 0.2)', 
                    borderColor: 'rgba(144, 224, 247, 0.3)' 
                  } : {}}
                >
                  {/* Glowing effect for active item */}
                  {active && (
                    <motion.div
                      layoutId="mobileActiveBackground"
                      className="absolute inset-0"
                      style={{ backgroundColor: 'rgba(144, 224, 247, 0.1)' }}
                      transition={{ type: "spring", duration: 0.5 }}
                    />
                  )}
                  
                  <div className="relative z-10 flex items-center p-3 justify-start">
                    <Icon className={`w-5 h-5 transition-colors duration-300 ${
                      active ? '' : 'text-white/70 group-hover:text-white'
                    }`} 
                    style={active ? { color: '#90e0f7' } : {}} />
                    
                    <span className={`ml-3 transition-colors duration-300 ${
                      active ? 'text-white' : 'text-white/70 group-hover:text-white'
                    }`}>
                      {item.label}
                    </span>
                  </div>

                  {/* Active indicator */}
                  {active && (
                    <motion.div
                      layoutId="mobileActiveIndicator"
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 rounded-l-full"
                      style={{ backgroundColor: '#90e0f7' }}
                      transition={{ type: "spring", duration: 0.5 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </nav>
        </div>
      </motion.div>

      {/* Desktop Sidebar */}
      <motion.div
        initial={{ x: -100 }}
        animate={{ 
          x: 0,
          width: expanded ? 280 : 80 
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative h-full hidden lg:block"
      >
      {/* Glassmorphic background */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-xl border-r border-white/10">
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
      </div>
      
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <motion.div
            animate={{ opacity: expanded ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center space-x-3"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#90e0f7' }}>
              <img 
                src="/logo.png" 
                alt="Profit Summary Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-white/90 text-base sm:text-lg font-semibold">Profit Summary</h2>
                <p className="text-white/50 text-xs">Business Tracker</p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <motion.button
                key={item.id}
                onClick={() => navigate(item.path)}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full group relative overflow-hidden rounded-xl transition-all duration-300 ${
                  active 
                    ? 'border' 
                    : 'hover:bg-white/5 border border-transparent'
                }`}
                style={active ? { 
                  backgroundColor: 'rgba(144, 224, 247, 0.2)', 
                  borderColor: 'rgba(144, 224, 247, 0.3)' 
                } : {}}
              >
                {/* Glowing effect for active item */}
                {active && (
                  <motion.div
                    layoutId="activeBackground"
                    className="absolute inset-0"
                    style={{ backgroundColor: 'rgba(144, 224, 247, 0.1)' }}
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
                
                <div className={`relative z-10 flex items-center p-3 ${expanded ? 'justify-start' : 'justify-center'}`}>
                  <Icon className={`w-5 h-5 transition-colors duration-300 ${
                    active ? '' : 'text-white/70 group-hover:text-white'
                  }`} 
                  style={active ? { color: '#90e0f7' } : {}} />
                  
                  {expanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className={`ml-3 transition-colors duration-300 ${
                        active ? 'text-white' : 'text-white/70 group-hover:text-white'
                      }`}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </div>

                {/* Active indicator */}
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 rounded-l-full"
                    style={{ backgroundColor: '#90e0f7' }}
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Toggle button */}
        <div className="p-4 border-t border-white/10">
          <motion.button
            onClick={() => setExpanded(!expanded)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 group"
          >
            <div className={`flex items-center ${expanded ? 'justify-between' : 'justify-center'}`}>
              {expanded && (
                <span className="text-white/70 text-sm">Collapse</span>
              )}
              {expanded ? (
                <ChevronLeft className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
              ) : (
                <ChevronRight className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
              )}
            </div>
          </motion.button>
        </div>
      </div>
      </motion.div>
    </>
  );
};

export default Sidebar;

