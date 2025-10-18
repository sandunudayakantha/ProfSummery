import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import Sidebar from './components/Sidebar';
import NavbarTop from './components/NavbarTop';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BusinessDetails from './pages/BusinessDetails';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Layout component for authenticated pages
const AuthenticatedLayout = ({ children }) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden relative">
      {/* Subtle animated gradient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient overlay */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: 'linear-gradient(45deg, rgba(144, 224, 247, 0.1) 0%, transparent 50%, rgba(144, 224, 247, 0.1) 100%)',
            backgroundSize: '400% 400%',
            animation: 'gradientShift 15s ease infinite'
          }}
        ></div>

        {/* Floating grid pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(144, 224, 247, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(144, 224, 247, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'gridFloat 20s linear infinite'
          }}
        ></div>

        {/* Subtle floating particles */}
        <div className="absolute top-20 left-20 w-2 h-2 rounded-full bg-blue-400 opacity-40 animate-float"></div>
        <div className="absolute top-40 right-40 w-1.5 h-1.5 rounded-full bg-blue-300 opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 left-60 w-2 h-2 rounded-full bg-blue-400 opacity-40 animate-float" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-20 right-20 w-1.5 h-1.5 rounded-full bg-blue-300 opacity-30 animate-float" style={{ animationDelay: '6s' }}></div>
        <div className="absolute top-1/2 right-60 w-1 h-1 rounded-full bg-blue-400 opacity-30 animate-float" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-1/3 left-1/3 w-1.5 h-1.5 rounded-full bg-blue-300 opacity-40 animate-float" style={{ animationDelay: '5s' }}></div>
      </div>

      <div className="flex h-screen relative z-10">
        <Sidebar 
          expanded={sidebarExpanded}
          setExpanded={setSidebarExpanded}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <NavbarTop 
            sidebarExpanded={sidebarExpanded}
            setSidebarExpanded={setSidebarExpanded}
          />
          
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

// Layout wrapper that decides which layout to use
const LayoutWrapper = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Public routes that don't need the sidebar
  const publicRoutes = ['/login', '/register'];
  const isPublicRoute = publicRoutes.includes(location.pathname);
  
  if (isPublicRoute || !isAuthenticated) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }
  
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
};

function AppContent() {
  return (
    <LayoutWrapper>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/:id"
          element={
            <ProtectedRoute>
              <BusinessDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/:id/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </LayoutWrapper>
  );
}

function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <Router>
          <AppContent />
        </Router>
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;

