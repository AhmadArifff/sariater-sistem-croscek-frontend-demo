import React from 'react';

/**
 * GlassCard - Glassmorphism card component
 * @param {React.ReactNode} children - Card content
 * @param {string} className - Additional Tailwind classes
 * @param {boolean} interactive - Enable interactive hover effects
 * @param {boolean} gradient - Add gradient background
 */
export const GlassCard = ({ 
  children, 
  className = '',
  interactive = true,
  gradient = false,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`glass rounded-2xl p-6 border border-white/20 shadow-soft
        ${interactive ? 'hover:shadow-lg hover:border-white/30 hover:scale-105 cursor-pointer' : ''}
        ${gradient ? 'bg-gradient-to-br from-white/20 to-white/10' : ''}
        transition-all duration-300 backdrop-blur-xl
        ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassCard;
