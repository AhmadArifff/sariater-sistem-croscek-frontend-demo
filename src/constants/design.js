// ============================================
// Design System & Tokens
// ============================================

export const COLORS = {
  // Primary - Blue gradient (existing brand)
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
  },

  // Secondary - Purple (complementary)
  secondary: {
    50: "#faf5ff",
    100: "#f3e8ff",
    200: "#e9d5ff",
    300: "#d8b4fe",
    400: "#c084fc",
    500: "#a855f7",
    600: "#9333ea",
    700: "#7e22ce",
    800: "#6b21a8",
    900: "#581c87",
  },

  // Status Colors
  status: {
    success: "#10b981",
    successLight: "#d1fae5",
    warning: "#f59e0b",
    warningLight: "#fef3c7",
    error: "#ef4444",
    errorLight: "#fee2e2",
    info: "#0ea5e9",
    infoLight: "#cffafe",
  },

  // Attendance Status
  attendance: {
    present: "#10b981",
    absent: "#ef4444",
    late: "#f59e0b",
    excused: "#8b5cf6",
    pending: "#6b7280",
  },

  // Neutral
  neutral: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },

  // Semantic
  text: {
    primary: "#111827",
    secondary: "#4b5563",
    tertiary: "#6b7280",
    inverse: "#ffffff",
  },

  background: {
    primary: "#ffffff",
    secondary: "#f9fafb",
    tertiary: "#f3f4f6",
  },

  border: {
    light: "#e5e7eb",
    default: "#d1d5db",
    dark: "#9ca3af",
  },
};

export const SPACING = {
  xs: "0.25rem", // 4px
  sm: "0.5rem", // 8px
  md: "1rem", // 16px
  lg: "1.5rem", // 24px
  xl: "2rem", // 32px
  "2xl": "2.5rem", // 40px
  "3xl": "3rem", // 48px
};

export const BORDER_RADIUS = {
  none: "0",
  sm: "0.375rem",
  default: "0.5rem",
  md: "0.75rem",
  lg: "1rem",
  xl: "1.5rem",
  full: "9999px",
};

export const SHADOWS = {
  none: "none",
  xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  base: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  md: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  lg: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  xl: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
};

export const FONT_SIZES = {
  xs: "0.75rem", // 12px
  sm: "0.875rem", // 14px
  base: "1rem", // 16px
  lg: "1.125rem", // 18px
  xl: "1.25rem", // 20px
  "2xl": "1.5rem", // 24px
  "3xl": "1.875rem", // 30px
  "4xl": "2.25rem", // 36px
};

export const FONT_WEIGHTS = {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
};

export const Z_INDEX = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
};

export const TRANSITIONS = {
  fast: "150ms ease-in-out",
  base: "250ms ease-in-out",
  slow: "350ms ease-in-out",
};

// ============================================
// Component Variants
// ============================================

export const BUTTON_VARIANTS = {
  primary: {
    bg: COLORS.primary[600],
    bgHover: COLORS.primary[700],
    text: "#ffffff",
  },
  secondary: {
    bg: COLORS.neutral[200],
    bgHover: COLORS.neutral[300],
    text: COLORS.text.primary,
  },
  danger: {
    bg: COLORS.status.error,
    bgHover: "#dc2626",
    text: "#ffffff",
  },
  success: {
    bg: COLORS.status.success,
    bgHover: "#059669",
    text: "#ffffff",
  },
  ghost: {
    bg: "transparent",
    bgHover: COLORS.neutral[100],
    text: COLORS.text.primary,
  },
};

export const BADGE_VARIANTS = {
  default: {
    bg: COLORS.neutral[200],
    text: COLORS.text.primary,
  },
  primary: {
    bg: COLORS.primary[100],
    text: COLORS.primary[700],
  },
  success: {
    bg: COLORS.status.successLight,
    text: "#047857",
  },
  warning: {
    bg: COLORS.status.warningLight,
    text: "#92400e",
  },
  error: {
    bg: COLORS.status.errorLight,
    text: "#991b1b",
  },
};

export const TABLE_VARIANTS = {
  header: {
    bg: COLORS.neutral[50],
    text: COLORS.text.secondary,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  row: {
    bgOdd: "#ffffff",
    bgEven: COLORS.neutral[50],
    bgHover: COLORS.neutral[100],
  },
};

// ============================================
// Responsive Breakpoints
// ============================================

export const BREAKPOINTS = {
  xs: "480px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

// ============================================
// Animation Presets
// ============================================

export const ANIMATIONS = {
  fadeIn: "fadeIn 0.3s ease-in",
  slideIn: "slideIn 0.3s ease-out",
  bounce: "bounce 0.5s ease-in-out",
  pulse: "pulse 2s infinite",
};
