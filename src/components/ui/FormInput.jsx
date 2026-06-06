import React from "react";
import { X } from "lucide-react";

/**
 * Modal Component - Dialog overlay
 */
export function Modal({
  isOpen = false,
  onClose = () => {},
  title = "",
  children,
  size = "md",
  showCloseButton = true,
}) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={`relative bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full mx-4 max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/**
 * FormInput Component - Reusable form field
 */
export function FormInput({
  label = "",
  name = "",
  type = "text",
  value = "",
  onChange = () => {},
  placeholder = "",
  error = "",
  required = false,
  disabled = false,
  hint = "",
  options = [],
  multiline = false,
  rows = 3,
  className = "",
  ...props
}) {
  const baseClass =
    "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

  const errorClass = error ? "border-red-500 focus:ring-red-500" : "";
  const disabledClass = disabled ? "bg-gray-100 cursor-not-allowed" : "";

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {type === "select" ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`${baseClass} ${errorClass} ${disabledClass}`}
          {...props}
        >
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : multiline ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={`${baseClass} ${errorClass} ${disabledClass} resize-none`}
          {...props}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`${baseClass} ${errorClass} ${disabledClass}`}
          {...props}
        />
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {hint && !error && <p className="text-gray-500 text-xs mt-1">{hint}</p>}
    </div>
  );
}

/**
 * Button Component
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon = null,
  fullWidth = false,
  onClick = () => {},
  className = "",
  type = "button",
  ...props
}) {
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
    success: "bg-green-600 text-white hover:bg-green-700",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
  };

  const sizeClasses = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const baseClass =
    "font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClass} ${variantClasses[variant]} ${sizeClasses[size]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      {...props}
    >
      {loading && (
        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {icon && !loading && icon}
      {children}
    </button>
  );
}

/**
 * Badge Component
 */
export function Badge({ children, variant = "default", className = "" }) {
  const variantClasses = {
    default: "bg-gray-100 text-gray-800",
    primary: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-cyan-100 text-cyan-800",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

/**
 * Alert Component
 */
export function Alert({ children, variant = "info", className = "" }) {
  const variantClasses = {
    info: "bg-blue-50 text-blue-800 border-blue-200",
    success: "bg-green-50 text-green-800 border-green-200",
    warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
    danger: "bg-red-50 text-red-800 border-red-200",
  };

  return (
    <div
      className={`p-4 rounded-lg border ${variantClasses[variant]} text-sm ${className}`}
    >
      {children}
    </div>
  );
}
