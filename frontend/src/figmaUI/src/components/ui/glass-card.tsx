import React from 'react';
import { motion } from 'motion/react';
import { cn } from './utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  gradient?: 'green' | 'emerald' | 'lime' | 'dark-green' | 'red';
}

export function GlassCard({ 
  children, 
  className, 
  hover = true, 
  glow = false, 
  gradient = 'green' 
}: GlassCardProps) {
  const gradientClasses = {
    green: 'from-green-500/20 to-emerald-500/20 border-green-400/30',
    emerald: 'from-emerald-500/20 to-teal-500/20 border-emerald-400/30',
    lime: 'from-lime-500/20 to-green-500/20 border-lime-400/30',
    'dark-green': 'from-green-700/20 to-green-900/20 border-green-600/30',
    red: 'from-red-500/20 to-orange-500/20 border-red-400/30'
  };

  const glowClasses = {
    green: 'shadow-green-500/20',
    emerald: 'shadow-emerald-500/20',
    lime: 'shadow-lime-500/20',
    'dark-green': 'shadow-green-700/20',
    red: 'shadow-red-500/20'
  };

  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "relative overflow-hidden rounded-xl border border-white/10 backdrop-blur-xl",
        glow && `shadow-2xl ${glowClasses[gradient]}`,
        className
      )}
    >
      {/* Base glass background */}
      <div className="absolute inset-0 bg-white/5">
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-50",
          gradientClasses[gradient]
        )}></div>
      </div>
      
      {/* Animated border glow */}
      {glow && (
        <div className={cn(
          "absolute inset-0 rounded-xl bg-gradient-to-r opacity-20 animate-pulse",
          gradientClasses[gradient]
        )}></div>
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}