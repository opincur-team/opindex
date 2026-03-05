// Theme constants matching the web app design system

export const COLORS = {
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
  
  // State colors
  success: '#00FF88',
  warning: '#FFAA00',
  error: '#FF3333',
  info: '#3399FF',
  
  // Border colors
  border: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.2)',
    focus: '#06EBF1',
  },
} as const;

export const GRADIENTS = {
  primary: 'linear-gradient(111.31deg, #06EBF1 9.46%, #A40CFF 89.05%)',
  primarySoft: 'linear-gradient(111.31deg, rgba(6, 235, 241, 0.2) 9.46%, rgba(164, 12, 255, 0.2) 89.05%)',
} as const;

export const FONTS = {
  audiowide: 'Audiowide-Regular',
  daysone: 'Days One',
  jura: 'Jura-Regular',
  juraLight: 'Jura-Light',
  juraMedium: 'Jura-Medium',
  juraSemiBold: 'Jura-SemiBold',
  juraBold: 'Jura-Bold',
} as const;

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
} as const;

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
} as const;

export const SHADOWS = {
  glass: '4px 4px 8px rgba(0, 0, 0, 0.25)',
  card: '0px 8px 24px rgba(0, 0, 0, 0.4)',
  button: '0px 4px 12px rgba(6, 235, 241, 0.3)',
  buttonPurple: '0px 4px 12px rgba(164, 12, 255, 0.3)',
} as const;

// Component styling presets matching web app
export const COMPONENT_STYLES = {
  button: {
    height: 52,
    borderRadius: BORDER_RADIUS.xl,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.daysone,
  },
  
  card: {
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.glass.dark,
    borderColor: COLORS.border.light,
    borderWidth: 1,
  },
  
  input: {
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.dark[200],
    borderColor: COLORS.border.light,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    color: COLORS.text.primary,
  },
} as const;

// Animation durations
export const ANIMATIONS = {
  fast: 150,
  normal: 250,
  slow: 400,
} as const;

// Layout constants
export const LAYOUT = {
  tabBarHeight: 80,
  headerHeight: 60,
  screenPadding: SPACING.lg,
} as const;