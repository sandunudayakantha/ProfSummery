import React from 'react';
import { motion } from 'motion/react';
import { cn } from './utils';

interface FloatingButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  disabled?: boolean;
}

export function FloatingButton({ 
  children, 
  onClick, 
  className, 
  size = 'md', 
  variant = 'primary',
  disabled = false 
}: FloatingButtonProps) {
  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg'
  };

  const variantClasses = {
    primary: 'from-cyan-500 to-blue-600 shadow-cyan-500/30 hover:shadow-cyan-500/50',
    secondary: 'from-purple-500 to-pink-600 shadow-purple-500/30 hover:shadow-purple-500/50',
    success: 'from-green-500 to-emerald-600 shadow-green-500/30 hover:shadow-green-500/50',
    danger: 'from-red-500 to-orange-600 shadow-red-500/30 hover:shadow-red-500/50'
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 group",
        "bg-gradient-to-r backdrop-blur-xl border border-white/20",
        sizeClasses[size],
        variantClasses[variant],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {/* Animated glow effect */}
      <div className={cn(
        "absolute inset-0 rounded-full bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse",
        variantClasses[variant]
      )}></div>
      
      {/* 3D effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-white/20"></div>
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center">
        {children}
      </div>
      
      {/* Ripple effect on click */}
      <motion.div
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 4, opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute inset-0 rounded-full bg-white/20"
      />
    </motion.button>
  );
}