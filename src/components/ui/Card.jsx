import React from "react";
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS } from "../../constants/design";

/**
 * Card Component - Reusable container for content
 * @param {string} variant - 'default', 'elevated', 'outlined'
 * @param {boolean} hoverable - Add hover effect
 * @param {React.ReactNode} children - Card content
 * @param {string} className - Additional Tailwind classes
 */
export function Card({ 
  variant = "default", 
  hoverable = false, 
  children, 
  className = "",
  ...props 
}) {
  const variants = {
    default: "bg-white border border-gray-200",
    elevated: "bg-white shadow-lg",
    outlined: "bg-gray-50 border-2 border-gray-300",
  };

  const baseClasses = `
    rounded-lg p-4 md:p-6
    ${variants[variant]}
    ${hoverable ? "transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer" : ""}
    ${className}
  `;

  return (
    <div className={baseClasses.replace(/\s+/g, " ").trim()} {...props}>
      {children}
    </div>
  );
}

/**
 * CardHeader - Header section of card
 */
export function CardHeader({ title, subtitle, icon, className = "", ...props }) {
  return (
    <div className={`mb-4 ${className}`} {...props}>
      <div className="flex items-center gap-3">
        {icon && <span className="text-2xl">{icon}</span>}
        <div>
          {title && (
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          )}
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * CardBody - Body section of card
 */
export function CardBody({ children, className = "", ...props }) {
  return (
    <div className={`${className}`} {...props}>
      {children}
    </div>
  );
}

/**
 * CardFooter - Footer section of card
 */
export function CardFooter({ children, className = "", ...props }) {
  return (
    <div className={`mt-6 pt-4 border-t border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  );
}

/**
 * KPICard - Special card for displaying KPI metrics
 */
export function KPICard({ 
  label, 
  value, 
  icon, 
  color = "blue", 
  trend, 
  className = "",
  ...props 
}) {
  const colorVariants = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    yellow: "bg-yellow-50 text-yellow-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <Card className={`${className}`} {...props}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${
              trend.direction === 'up' 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-lg ${colorVariants[color]}`}>
            <span className="text-2xl">{icon}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
