import React from 'react';

/**
 * AnimatedBadge - Premium animated badge component
 * @param {string} variant - 'success' | 'warning' | 'error' | 'info' | 'primary'
 * @param {React.ReactNode} icon - Optional icon component
 * @param {string} label - Badge label text
 * @param {string} className - Additional Tailwind classes
 * @param {boolean} pulse - Enable pulse animation
 */
export const AnimatedBadge = ({ 
  variant = 'primary', 
  icon, 
  label, 
  className = '',
  pulse = false 
}) => {
  const variantStyles = {
    success: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200 shadow-glow-blue',
    warning: 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border-amber-200',
    error: 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-red-200',
    info: 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-blue-200',
    primary: 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-purple-200',
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm border backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:scale-105 ${
        variantStyles[variant]
      } ${pulse ? 'animate-pulse' : ''} ${className}`}
    >
      {icon && <span className="text-base">{icon}</span>}
      <span className="font-semibold">{label}</span>
    </div>
  );
};

export default AnimatedBadge;
