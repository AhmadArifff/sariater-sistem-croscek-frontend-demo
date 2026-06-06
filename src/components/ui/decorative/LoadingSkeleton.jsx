import React from 'react';

/**
 * LoadingSkeleton - Animated loading skeleton component
 * @param {string} type - 'card' | 'line' | 'circle' | 'table' | 'chart'
 * @param {number} count - Number of skeleton items to display
 * @param {string} className - Additional Tailwind classes
 */
export const LoadingSkeleton = ({ 
  type = 'card', 
  count = 1,
  className = ''
}) => {
  const SkeletonLine = () => (
    <div className="w-full h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full animate-shimmer bg-200 motion-safe:animate-pulse mb-3" />
  );

  const SkeletonCard = () => (
    <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-soft">
      <div className="space-y-4">
        <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-shimmer w-2/3" />
        <div className="space-y-3">
          <SkeletonLine />
          <SkeletonLine />
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full w-4/5 animate-shimmer" />
        </div>
      </div>
    </div>
  );

  const SkeletonCircle = () => (
    <div className="flex flex-col items-center gap-3">
      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full w-20 animate-shimmer" />
    </div>
  );

  const SkeletonChart = () => (
    <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-soft space-y-4">
      <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg w-2/5 animate-shimmer" />
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-end gap-2 h-20">
            {[...Array(8)].map((_, j) => (
              <div
                key={j}
                className="flex-1 bg-gradient-to-t from-gray-200 via-gray-100 to-gray-200 rounded-t animate-shimmer"
                style={{ height: `${Math.random() * 100}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  const SkeletonTable = () => (
    <div className="bg-white rounded-lg border border-gray-100 shadow-soft overflow-hidden">
      <div className="grid grid-cols-4 gap-4 p-6 border-b bg-gray-50">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer" />
        ))}
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="grid grid-cols-4 gap-4 p-6 border-b">
          {[...Array(4)].map((_, j) => (
            <div key={j} className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer" />
          ))}
        </div>
      ))}
    </div>
  );

  const getSkeletonComponent = () => {
    switch (type) {
      case 'line':
        return <SkeletonLine />;
      case 'card':
        return <SkeletonCard />;
      case 'circle':
        return <SkeletonCircle />;
      case 'chart':
        return <SkeletonChart />;
      case 'table':
        return <SkeletonTable />;
      default:
        return <SkeletonCard />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <div key={i}>
          {getSkeletonComponent()}
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
