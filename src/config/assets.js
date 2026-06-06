// Asset Management Configuration
// Location: src/config/assets.js
// Purpose: Centralized configuration untuk asset imports dan lazy loading

export const ASSET_PATHS = {
  illustrations: {
    emptyStates: {
      noData: '/src/assets/illustrations/empty-states/no-data.svg',
      noResults: '/src/assets/illustrations/empty-states/no-results.svg',
      serverError: '/src/assets/illustrations/empty-states/server-error.svg',
    },
    onboarding: {
      welcome: '/src/assets/illustrations/onboarding/welcome.svg',
      setup: '/src/assets/illustrations/onboarding/setup.svg',
    },
    decorative: {
      blob1: '/src/assets/decorative/blob-1.svg',
      blob2: '/src/assets/decorative/blob-2.svg',
      patterns: '/src/assets/decorative/patterns/',
    }
  }
};

// Animation configurations
export const ANIMATION_CONFIG = {
  // Standard animation durations
  FAST: 200,      // ms - quick interactions
  NORMAL: 300,    // ms - standard transitions
  SLOW: 500,      // ms - page transitions
  DELAYED: 1000,  // ms - entrance animations

  // Animation easing functions
  EASING: {
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  }
};

// Component animation presets
export const ANIMATION_PRESETS = {
  CARD_ENTER: {
    animation: 'fade-in',
    delay: 0,
  },
  CARD_HOVER: {
    scale: 1.05,
    transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  BUTTON_PRESS: {
    scale: 0.98,
    transition: 'all 150ms ease-out',
  },
  FLOAT: {
    animation: 'float 3s ease-in-out infinite',
  }
};

// Color scheme configuration
export const COLOR_SCHEME = {
  primary: {
    light: '#2563eb',
    main: '#1d4ed8',
    dark: '#1e40af',
  },
  secondary: {
    light: '#8b5cf6',
    main: '#7c3aed',
    dark: '#6d28d9',
  },
  status: {
    success: '#16a34a',
    warning: '#ea580c',
    error: '#dc2626',
    info: '#0284c7',
  },
  background: {
    light: '#f0f9ff',
    main: '#f1f5f9',
    dark: '#e2e8f0',
  }
};

// Responsive breakpoints
export const BREAKPOINTS = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// Component sizing
export const SIZES = {
  ICON_SM: 16,
  ICON_MD: 24,
  ICON_LG: 32,
  CARD_MIN_WIDTH: 280,
  CARD_MAX_WIDTH: 400,
};

export default {
  ASSET_PATHS,
  ANIMATION_CONFIG,
  ANIMATION_PRESETS,
  COLOR_SCHEME,
  BREAKPOINTS,
  SIZES,
};
