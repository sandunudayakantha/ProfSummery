import React from 'react';
import { motion } from 'motion/react';
import { Search, Bell, User, Menu } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface NavbarProps {
  currentPage: string;
  sidebarExpanded: boolean;
  setSidebarExpanded: (expanded: boolean) => void;
}

const pageLabels: Record<string, string> = {
  'dashboard': 'Dashboard Overview',
  'spare-parts': 'Spare Parts Management',
  'rentals': 'Vehicle Rentals',
  'sales': 'Vehicle Sales',
  'yard-inventory': 'Yard Inventory'
};

export function Navbar({ currentPage, sidebarExpanded, setSidebarExpanded }: NavbarProps) {
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="lg:hidden text-white/70 hover:text-white hover:bg-white/10"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-white/90 text-xl">
              {pageLabels[currentPage] || 'Dashboard'}
            </h1>
            <div className="flex items-center space-x-2 mt-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white/50 text-sm">System Online</span>
            </div>
          </motion.div>
        </div>

        {/* Center - Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-cyan-400 transition-colors" />
            <Input
              placeholder="Search vehicles, parts, customers..."
              className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-cyan-400/50 focus:bg-white/10 transition-all duration-300"
            />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/0 to-purple-500/0 group-focus-within:from-cyan-500/10 group-focus-within:to-purple-500/10 transition-all duration-300 pointer-events-none"></div>
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
            className="flex items-center space-x-3 p-2 pl-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 group"
          >
            <div className="hidden sm:block text-right">
              <p className="text-white/90 text-sm">Admin User</p>
              <p className="text-white/50 text-xs">System Administrator</p>
            </div>
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900"></div>
            </div>
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}