import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { Dashboard } from './components/pages/Dashboard';
import { SpareParts } from './components/pages/SpareParts';
import { Rentals } from './components/pages/Rentals';
import { Sales } from './components/pages/Sales';
import { YardInventory } from './components/pages/YardInventory';
import { motion, AnimatePresence } from 'motion/react';

type Page = 'dashboard' | 'spare-parts' | 'rentals' | 'sales' | 'yard-inventory';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'spare-parts':
        return <SpareParts />;
      case 'rentals':
        return <Rentals />;
      case 'sales':
        return <Sales />;
      case 'yard-inventory':
        return <YardInventory />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-lime-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="flex h-screen relative z-10">
        <Sidebar 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage}
          expanded={sidebarExpanded}
          setExpanded={setSidebarExpanded}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar 
            currentPage={currentPage}
            sidebarExpanded={sidebarExpanded}
            setSidebarExpanded={setSidebarExpanded}
          />
          
          <main className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="h-full"
              >
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}