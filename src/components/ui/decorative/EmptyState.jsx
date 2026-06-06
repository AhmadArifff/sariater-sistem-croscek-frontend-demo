import React from 'react';

/**
 * EmptyState - Comprehensive empty state component with illustration
 * @param {React.ReactNode} icon - Icon component
 * @param {string} title - Empty state title
 * @param {string} description - Empty state description
 * @param {React.ReactNode} action - Optional action button/element
 * @param {string} className - Additional Tailwind classes
 */
export const EmptyState = ({ 
  icon, 
  title, 
  description,
  action,
  className = ''
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in ${className}`}
    >
      {/* Decorative background circles */}
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-2xl">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float animation-delay-2s" />
      </div>

      {/* Icon */}
      {icon && (
        <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full shadow-soft">
          <div className="text-6xl text-blue-600 animate-bounce-slow">
            {icon}
          </div>
        </div>
      )}

      {/* Title */}
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-gray-500 text-base max-w-sm mb-6">
          {description}
        </p>
      )}

      {/* Action */}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
