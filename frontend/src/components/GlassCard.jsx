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
    green: { backgroundColor: 'rgba(144, 224, 247, 0.2)', borderColor: 'rgba(144, 224, 247, 0.3)' },
    emerald: { backgroundColor: 'rgba(144, 224, 247, 0.2)', borderColor: 'rgba(144, 224, 247, 0.3)' },
    lime: { backgroundColor: 'rgba(144, 224, 247, 0.2)', borderColor: 'rgba(144, 224, 247, 0.3)' },
    blue: { backgroundColor: 'rgba(59, 130, 246, 0.2)', borderColor: 'rgba(59, 130, 246, 0.3)' },
    purple: { backgroundColor: 'rgba(168, 85, 247, 0.2)', borderColor: 'rgba(168, 85, 247, 0.3)' },
    red: { backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.3)' },
    orange: { backgroundColor: 'rgba(249, 115, 22, 0.2)', borderColor: 'rgba(249, 115, 22, 0.3)' }
  };

  const glowColors = {
    green: 'rgba(144, 224, 247, 0.2)',
    emerald: 'rgba(144, 224, 247, 0.2)',
    lime: 'rgba(144, 224, 247, 0.2)',
    blue: 'rgba(59, 130, 246, 0.2)',
    purple: 'rgba(168, 85, 247, 0.2)',
    red: 'rgba(239, 68, 68, 0.2)',
    orange: 'rgba(249, 115, 22, 0.2)'
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
        ${glow ? 'shadow-2xl' : ''}
        ${className}
      `}
      style={{
        borderColor: 'rgba(255, 255, 255, 0.1)',
        ...(glow && { boxShadow: `0 25px 50px -12px ${glowColor}` })
      }}
    >
      {/* Base glass background */}
      <div className="absolute inset-0 bg-white/5">
        <div 
          className="absolute inset-0 opacity-50"
          style={{
            background: `linear-gradient(to bottom right, ${gradientStyle.backgroundColor}, transparent)`,
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

