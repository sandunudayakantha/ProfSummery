import React from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Settings, 
  Car, 
  ShoppingCart, 
  Package, 
  MapPin,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'spare-parts', label: 'Spare Parts', icon: Settings },
  { id: 'rentals', label: 'Rentals', icon: Car },
  { id: 'sales', label: 'Sales', icon: ShoppingCart },
  { id: 'yard-inventory', label: 'Yard Inventory', icon: MapPin },
];

export function Sidebar({ currentPage, setCurrentPage, expanded, setExpanded }: SidebarProps) {
  return (
    <motion.div
      initial={{ x: -100 }}
      animate={{ 
        x: 0,
        width: expanded ? 280 : 80 
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative h-full"
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
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-white/90 text-lg">SPA Global</h2>
                <p className="text-white/50 text-xs">Vehicle Management</p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full group relative overflow-hidden rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30' 
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                {/* Glowing effect for active item */}
                {isActive && (
                  <motion.div
                    layoutId="activeBackground"
                    className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
                
                <div className={`relative z-10 flex items-center p-3 ${expanded ? 'justify-start' : 'justify-center'}`}>
                  <Icon className={`w-5 h-5 transition-colors duration-300 ${
                    isActive ? 'text-green-400' : 'text-white/70 group-hover:text-white'
                  }`} />
                  
                  {expanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className={`ml-3 transition-colors duration-300 ${
                        isActive ? 'text-white' : 'text-white/70 group-hover:text-white'
                      }`}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </div>

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-green-400 to-emerald-500 rounded-l-full"
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
  );
}