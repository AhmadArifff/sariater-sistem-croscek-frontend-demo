import React, { useState } from 'react';
import { TrendingUp, TrendingDown, ArrowUp, ArrowDown } from 'lucide-react';
import { AnimatedCounter } from './ui/decorative';

const colorStyles = {
  blue: {
    bg: 'from-blue-50 to-blue-50/50',
    gradient: 'from-blue-500 to-blue-600',
    border: 'border-blue-200/50',
    text: 'text-blue-600',
    icon: 'text-blue-500',
    badge: 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border border-blue-200',
    glow: 'shadow-glow-blue'
  },
  green: {
    bg: 'from-green-50 to-green-50/50',
    gradient: 'from-green-500 to-green-600',
    border: 'border-green-200/50',
    text: 'text-green-600',
    icon: 'text-green-500',
    badge: 'bg-gradient-to-r from-green-100 to-green-50 text-green-700 border border-green-200',
    glow: 'shadow-glow-blue'
  },
  red: {
    bg: 'from-red-50 to-red-50/50',
    gradient: 'from-red-500 to-red-600',
    border: 'border-red-200/50',
    text: 'text-red-600',
    icon: 'text-red-500',
    badge: 'bg-gradient-to-r from-red-100 to-red-50 text-red-700 border border-red-200',
    glow: 'shadow-glow-pink'
  },
  yellow: {
    bg: 'from-yellow-50 to-yellow-50/50',
    gradient: 'from-yellow-500 to-yellow-600',
    border: 'border-yellow-200/50',
    text: 'text-yellow-600',
    icon: 'text-yellow-500',
    badge: 'bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-700 border border-yellow-200',
    glow: 'shadow-glow-blue'
  },
  purple: {
    bg: 'from-purple-50 to-purple-50/50',
    gradient: 'from-purple-500 to-purple-600',
    border: 'border-purple-200/50',
    text: 'text-purple-600',
    icon: 'text-purple-500',
    badge: 'bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 border border-purple-200',
    glow: 'shadow-glow-purple'
  },
  orange: {
    bg: 'from-orange-50 to-orange-50/50',
    gradient: 'from-orange-500 to-orange-600',
    border: 'border-orange-200/50',
    text: 'text-orange-600',
    icon: 'text-orange-500',
    badge: 'bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 border border-orange-200',
    glow: 'shadow-glow-blue'
  }
};

export function KPICard({ value, label, icon: Icon, color = 'blue', trend = null, isAnimated = true }) {
  const styles = colorStyles[color] || colorStyles.blue;
  const [isHovered, setIsHovered] = useState(false);
  
  // Parse trend: "+5", "-2", "0" format or just number
  const trendStr = typeof trend === 'string' ? trend : (trend ? (trend > 0 ? `+${trend}` : `${trend}`) : '0');
  const isTrendPositive = parseFloat(trendStr) >= 0;
  const TrendIcon = isTrendPositive ? ArrowUp : ArrowDown;
  
  // Extract numeric value for animation
  const numericValue = typeof value === 'string' ? parseInt(value.replace(/\D/g, '')) : value;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden bg-gradient-to-br ${styles.bg} border ${styles.border} rounded-2xl p-6 md:p-8 
        shadow-soft hover:shadow-lg transition-all duration-300 transform hover:scale-105 
        hover:-translate-y-2 animate-fade-in cursor-pointer group backdrop-blur-sm`}
    >
      {/* Decorative gradient background animation */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br ${styles.gradient}`}
      />

      {/* Corner accent */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        {/* Header: Icon + Trend */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            {/* PERTAHANKAN hanya yang ini: */}
            {trend !== null && trend !== 0 && (
              <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-semibold text-xs md:text-sm transition-all duration-300 ${
                isTrendPositive
                  ? 'bg-gradient-to-r from-green-100 to-green-50 text-green-700 border border-green-200'
                  : 'bg-gradient-to-r from-red-100 to-red-50 text-red-700 border border-red-200'
              }`}>
                <TrendIcon className={`w-4 h-4 ${isTrendPositive ? 'text-green-600' : 'text-red-600'}`} />
                <span>{trendStr}%</span>
              </div>
            )}
            {Icon && (
              <div className={`${styles.icon} p-2.5 rounded-lg bg-white/60 shadow-soft transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                <Icon className="w-5 md:w-6 h-5 md:h-6" />
              </div>
            )}
          </div>
        </div>

        {/* Value with animated counter */}
        <div className="mb-3">
          <h3 className={`text-3xl md:text-4xl font-bold text-gray-900 transition-all duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}>
            {isAnimated ? (
              <AnimatedCounter
                from={0}
                to={numericValue}
                duration={2000}
                className={styles.text}
              />
            ) : (
              value
            )}
          </h3>
        </div>

        {/* Label */}
        <div className="mb-2">
          <p className="text-xs md:text-sm text-gray-600 font-medium transition-colors duration-300 group-hover:text-gray-700">
            {label}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1.5 bg-white/40 rounded-full overflow-hidden backdrop-blur-sm">
          <div
            className={`h-full bg-gradient-to-r ${styles.gradient} rounded-full transition-all duration-700 ${isHovered ? 'w-3/4' : 'w-1/2'}`}
            style={{ boxShadow: `0 0 10px ${color === 'blue' ? 'rgb(59, 130, 246)' : 'rgb(34, 197, 94)'}` }}
          />
        </div>
      </div>
    </div>
  );
}
