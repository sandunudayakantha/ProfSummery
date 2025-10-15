import { motion } from 'framer-motion';

const FloatingButton = ({ 
  children, 
  onClick, 
  className = '', 
  size = 'md', 
  variant = 'primary',
  disabled = false 
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg'
  };

  const variantStyles = {
    primary: { 
      backgroundColor: '#90e057',
      boxShadow: '0 20px 25px -5px rgba(144, 224, 247, 0.3)',
      hoverShadow: '0 20px 25px -5px rgba(144, 224, 247, 0.5)'
    },
    secondary: { 
      backgroundColor: '#90e057',
      boxShadow: '0 20px 25px -5px rgba(144, 224, 247, 0.3)',
      hoverShadow: '0 20px 25px -5px rgba(144, 224, 247, 0.5)'
    },
    success: { 
      backgroundColor: '#90e057',
      boxShadow: '0 20px 25px -5px rgba(144, 224, 247, 0.3)',
      hoverShadow: '0 20px 25px -5px rgba(144, 224, 247, 0.5)'
    },
    danger: { 
      backgroundColor: '#ef4444',
      boxShadow: '0 20px 25px -5px rgba(239, 68, 68, 0.3)',
      hoverShadow: '0 20px 25px -5px rgba(239, 68, 68, 0.5)'
    }
  };

  const variantStyle = variantStyles[variant] || variantStyles.primary;

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className={`
        relative rounded-full flex items-center justify-center text-white 
        shadow-2xl transition-all duration-300 group
        backdrop-blur-xl border border-white/20
        ${sizeClasses[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      style={{
        backgroundColor: variantStyle.backgroundColor,
        boxShadow: variantStyle.boxShadow
      }}
      onMouseEnter={(e) => !disabled && (e.currentTarget.style.boxShadow = variantStyle.hoverShadow)}
      onMouseLeave={(e) => !disabled && (e.currentTarget.style.boxShadow = variantStyle.boxShadow)}
    >
      {/* Animated glow effect */}
      <div 
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"
        style={{ backgroundColor: variantStyle.backgroundColor }}
      ></div>
      
      {/* 3D effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-white/20"></div>
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center">
        {children}
      </div>
    </motion.button>
  );
};

export default FloatingButton;

