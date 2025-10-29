import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

// Enhanced Sakura Petal Component with realistic physics
const SakuraPetal = ({ delay = 0, duration = 8, x = 0, size = 1, sway = 0 }) => {
  const petalSize = 8 + size * 4;
  
  return (
    <motion.div
      className="absolute pointer-events-none"
      initial={{ 
        x: x,
        y: -50,
        rotate: 0,
        opacity: 0.8,
        scale: 0.8
      }}
      animate={{ 
        y: window.innerHeight + 50,
        x: x + sway,
        rotate: [0, 180, 360],
        opacity: [0.8, 0.6, 0.2, 0],
        scale: [0.8, 1, 0.9, 0.7]
      }}
      transition={{
        duration: duration,
        delay: delay,
        ease: "easeInOut",
        repeat: Infinity,
        repeatDelay: Math.random() * 4 + 2,
        times: [0, 0.3, 0.7, 1]
      }}
      style={{
        width: `${petalSize}px`,
        height: `${petalSize}px`,
        left: `${x}px`,
      }}
    >
      <motion.div 
        className="w-full h-full"
        animate={{
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          background: `radial-gradient(circle, #ffb3d1 0%, #ff69b4 50%, #ff1493 100%)`,
          borderRadius: '50% 0 50% 0',
          transform: 'rotate(45deg)',
          boxShadow: '0 0 8px rgba(255, 105, 180, 0.4), 0 0 16px rgba(255, 105, 180, 0.2)',
          filter: 'blur(0.3px)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      />
    </motion.div>
  );
};

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [petals, setPetals] = useState([]);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Generate Sakura petals with enhanced physics
  useEffect(() => {
    const generatePetals = () => {
      const newPetals = [];
      const petalCount = window.innerWidth > 768 ? 20 : 12; // More petals on larger screens
      
      for (let i = 0; i < petalCount; i++) {
        newPetals.push({
          id: `${Date.now()}-${i}`,
          x: Math.random() * window.innerWidth,
          delay: Math.random() * 6,
          duration: 8 + Math.random() * 6,
          size: Math.random() * 2.5,
          sway: (Math.random() - 0.5) * 100 // Horizontal sway effect
        });
      }
      setPetals(newPetals);
    };

    generatePetals();
    
    // Regenerate petals periodically for continuous effect
    const interval = setInterval(generatePetals, 12000);
    
    // Handle window resize
    const handleResize = () => {
      generatePetals();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login with:', formData.email);
      const result = await login(formData.email, formData.password);
      console.log('Login result:', result);
      
      if (result.success) {
        console.log('Login successful, navigating to dashboard...');
        navigate('/dashboard');
      } else {
        console.error('Login failed:', result.message);
        setError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ backgroundColor: '#0f172a', color: 'white' }}>
      {/* Sakura Petals Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {petals.map((petal) => (
          <SakuraPetal
            key={petal.id}
            delay={petal.delay}
            duration={petal.duration}
            x={petal.x}
            size={petal.size}
            sway={petal.sway}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8 relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white" style={{ color: 'white' }}>
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-white/60" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Or{' '}
              <Link to="/register" className="font-medium text-blue-400 hover:text-blue-300 transition-colors" style={{ color: '#60a5fa' }}>
                create a new account
              </Link>
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="mt-8 space-y-6"
            onSubmit={handleSubmit}
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-400/50 text-red-200 px-4 py-3 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-1" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:bg-white/10 transition-all"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                    borderColor: 'rgba(255, 255, 255, 0.2)', 
                    color: 'white' 
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(144, 224, 247, 0.5)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                  placeholder="you@example.com"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-white/90" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Password
                  </label>
                  <Link 
                    to="/forgot-password" 
                    className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                    style={{ color: '#60a5fa' }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:bg-white/10 transition-all"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                    borderColor: 'rgba(255, 255, 255, 0.2)', 
                    color: 'white' 
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(144, 224, 247, 0.5)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                  placeholder="••••••••"
                />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 text-white rounded-lg font-medium shadow-lg transition-all duration-300 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                style={{ backgroundColor: '#90e0f7' }}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </motion.button>
            </motion.div>
          </motion.form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;

