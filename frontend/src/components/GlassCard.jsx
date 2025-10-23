import { motion } from 'framer-motion';

const GlassCard = ({ 
  children, 
  className = '', 
  hover = true, 
  glow = false, 
  gradient = 'green',
  onClick 
}) => {
  const gradientStyles = {
    green: { backgroundColor: 'rgba(144, 224, 247, 0.15)', borderColor: 'rgba(144, 224, 247, 0.4)' },
    emerald: { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.4)' },
    lime: { backgroundColor: 'rgba(132, 204, 22, 0.15)', borderColor: 'rgba(132, 204, 22, 0.4)' },
    blue: { backgroundColor: 'rgba(59, 130, 246, 0.15)', borderColor: 'rgba(59, 130, 246, 0.4)' },
    purple: { backgroundColor: 'rgba(168, 85, 247, 0.15)', borderColor: 'rgba(168, 85, 247, 0.4)' },
    red: { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.4)' },
    orange: { backgroundColor: 'rgba(249, 115, 22, 0.15)', borderColor: 'rgba(249, 115, 22, 0.4)' }
  };

  const glowColors = {
    green: 'rgba(144, 224, 247, 0.3)',
    emerald: 'rgba(16, 185, 129, 0.3)',
    lime: 'rgba(132, 204, 22, 0.3)',
    blue: 'rgba(59, 130, 246, 0.3)',
    purple: 'rgba(168, 85, 247, 0.3)',
    red: 'rgba(239, 68, 68, 0.3)',
    orange: 'rgba(249, 115, 22, 0.3)'
  };

  const gradientStyle = gradientStyles[gradient] || gradientStyles.green;
  const glowColor = glowColors[gradient] || glowColors.green;

  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-xl border backdrop-blur-xl
        ${glow ? 'shadow-2xl' : 'shadow-lg'}
        ${className}
      `}
      style={{
        borderColor: 'rgba(255, 255, 255, 0.2)',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        ...(glow && { boxShadow: `0 25px 50px -12px ${glowColor}, 0 0 0 1px ${gradientStyle.borderColor}` })
      }}
    >
      {/* Base glass background */}
      <div className="absolute inset-0 bg-white/10">
        <div 
          className="absolute inset-0 opacity-60"
          style={{
            background: `linear-gradient(135deg, ${gradientStyle.backgroundColor}, transparent 70%)`,
            borderColor: gradientStyle.borderColor
          }}
        ></div>
      </div>
      
      {/* Animated border glow */}
      {glow && (
        <div 
          className="absolute inset-0 rounded-xl opacity-20 animate-pulse"
          style={{
            backgroundColor: gradientStyle.backgroundColor
          }}
        ></div>
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default GlassCard;

