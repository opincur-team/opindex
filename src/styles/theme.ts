/**
 * Opindex Wallet Design System Theme
 * Extracted from tailwind.config.js for pure React Native styling
 */

export const theme = {
  colors: {
    // Primary gradient colors
    primary: '#06EBF1',
    secondary: '#A40CFF',

    // Dark theme backgrounds
    dark: {
      100: 'rgba(0, 0, 0, 0.3)',
      200: 'rgba(0, 0, 0, 0.4)',
      300: 'rgba(0, 0, 0, 0.6)',
      400: 'rgba(0, 0, 0, 0.8)',
      500: '#000000',
    },

    // Glassmorphism overlays
    glass: {
      light: 'rgba(255, 255, 255, 0.1)',
      medium: 'rgba(255, 255, 255, 0.2)',
      dark: 'rgba(0, 0, 0, 0.4)',
    },

    // Text colors
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
      tertiary: '#808080',
      disabled: '#404040',
    },

    // Status colors
    success: '#00FF88',
    warning: '#FFAA00',
    error: '#FF3333',
    info: '#3399FF',

    // Accent colors (for convenience)
    accent: {
      cyan: '#06EBF1',
      purple: '#A40CFF',
    },

    // Border colors
    border: {
      light: 'rgba(255, 255, 255, 0.1)',
      medium: 'rgba(255, 255, 255, 0.2)',
      focus: '#06EBF1',
    },

    // Additional utility colors
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',

    // Gray scale
    gray: {
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      800: '#1f2937',
    },

    // Status backgrounds
    green: {
      400: '#4ade80',
      500: '#22c55e',
      800: '#166534',
      900: '#14532d',
    },
    yellow: {
      400: '#facc15',
      800: '#854d0e',
    },
    red: {
      400: '#f87171',
      500: '#ef4444',
      700: '#b91c1c',
      900: '#7f1d1d',
    },
    blue: {
      400: '#60a5fa',
      500: '#3b82f6',
      900: '#1e3a8a',
    },
    orange: {
      300: '#fdba74',
      400: '#fb923c',
      500: '#f59e0b',
      900: '#7c2d12',
    },
  },

  // Spacing scale (matches Tailwind's default with custom additions)
  spacing: {
    0: 0,
    1: 4,
    2: 10,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
    18: 72,
    20: 80,
    22: 88,
    24: 96,
  },

  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 22,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
  },

  // Font families (React Native font names)
  fontFamily: {
    audiowide: 'Audiowide-Regular',
    daysone: 'Days One',
    jura: 'Jura-Regular',
    juraLight: 'Jura-Light',
    jura300: 'Jura-Light',
    jura400: 'Jura-Regular',
    juraMedium: 'Jura-Medium',
    jura500: 'Jura-Medium',
    juraSemiBold: 'Jura-SemiBold',
    jura600: 'Jura-SemiBold',
    juraBold: 'Jura-Bold',
    jura700: 'Jura-Bold',
    mono: 'Courier',
  },

  // Border radius
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    full: 9999,
  },

  // Border widths
  borderWidth: {
    hairline: 0.5,
    default: 1,
    thick: 2,
  },

  // Shadows (iOS)
  shadows: {
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
    },
    glow: {
      shadowColor: '#06EBF1',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
    },
    glowSecondary: {
      shadowColor: '#A40CFF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
    },
  },

  // Elevations (Android)
  elevation: {
    sm: 4,
    md: 8,
    lg: 16,
  },

  // Opacity values
  opacity: {
    5: 0.05,
    10: 0.1,
    20: 0.2,
    30: 0.3,
    40: 0.4,
    50: 0.5,
    60: 0.6,
    80: 0.8,
  },
} as const;

export type Theme = typeof theme;
