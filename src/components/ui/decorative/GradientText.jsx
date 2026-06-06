import React from 'react';

/**
 * GradientText - Text with animated gradient effect
 * @param {string} children - Text content
 * @param {string} variant - 'primary' | 'secondary' | 'success' | 'warning' | 'error'
 * @param {string} className - Additional Tailwind classes
 * @param {boolean} animated - Enable gradient animation
 */
export const GradientText = ({ 
  children, 
  variant = 'primary',
  className = '',
  animated = false
}) => {
  const variantStyles = {
    primary: 'from-blue-600 to-purple-600',
    secondary: 'from-purple-600 to-pink-600',
    success: 'from-green-600 to-emerald-600',
    warning: 'from-amber-600 to-orange-600',
    error: 'from-red-600 to-rose-600',
  };

  return (
    <span
      className={`bg-gradient-to-r ${variantStyles[variant]} bg-clip-text text-transparent font-bold ${
        animated ? 'animate-gradient-shift bg-200' : ''
      } ${className}`}
    >
      {children}
    </span>
  );
};

export default GradientText;
