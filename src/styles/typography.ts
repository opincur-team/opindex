/**
 * Typography presets
 * Pre-configured text styles with font families, sizes, and colors
 */

import { StyleSheet, TextStyle } from 'react-native';
import { theme } from './theme';

// Font size + color combinations
export const typography = StyleSheet.create({
  // Headings
  h1: {
    fontSize: theme.fontSize['4xl'],
    fontFamily: theme.fontFamily.audiowide,
    color: theme.colors.text.primary,
  },
  h2: {
    fontSize: theme.fontSize['3xl'],
    fontFamily: theme.fontFamily.audiowide,
    color: theme.colors.text.primary,
  },
  h3: {
    fontSize: theme.fontSize['2xl'],
    fontFamily: theme.fontFamily.audiowide,
    color: theme.colors.text.primary,
  },
  h4: {
    fontSize: theme.fontSize.xl,
    fontFamily: theme.fontFamily.daysone,
    color: theme.colors.text.primary,
  },

  // Body text (Jura font family)
  bodyLarge: {
    fontSize: theme.fontSize.lg,
    fontFamily: theme.fontFamily.jura,
    color: theme.colors.text.primary,
  },
  bodyBase: {
    fontSize: theme.fontSize.base,
    fontFamily: theme.fontFamily.jura,
    color: theme.colors.text.primary,
  },
  bodySmall: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.jura,
    color: theme.colors.text.primary,
  },
  bodyXSmall: {
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.jura,
    color: theme.colors.text.primary,
  },

  // Jura font weights
  juraLight: {
    fontFamily: theme.fontFamily.juraLight,
  },
  jura300: {
    fontFamily: theme.fontFamily.jura300,
  },
  jura400: {
    fontFamily: theme.fontFamily.jura400,
  },
  juraMedium: {
    fontFamily: theme.fontFamily.juraMedium,
  },
  jura500: {
    fontFamily: theme.fontFamily.jura500,
  },
  juraSemiBold: {
    fontFamily: theme.fontFamily.juraSemiBold,
  },
  jura600: {
    fontFamily: theme.fontFamily.jura600,
  },
  juraBold: {
    fontFamily: theme.fontFamily.juraBold,
  },
  jura700: {
    fontFamily: theme.fontFamily.jura700,
  },

  // Special fonts
  audiowide: {
    fontFamily: theme.fontFamily.audiowide,
  },
  daysone: {
    fontFamily: theme.fontFamily.daysone,
  },
  mono: {
    fontFamily: theme.fontFamily.mono,
  },

  // Font sizes only
  textXs: {
    fontSize: theme.fontSize.xs,
  },
  textSm: {
    fontSize: theme.fontSize.sm,
  },
  textBase: {
    fontSize: theme.fontSize.base,
  },
  textLg: {
    fontSize: theme.fontSize.lg,
  },
  textXl: {
    fontSize: theme.fontSize.xl,
  },
  text2xl: {
    fontSize: theme.fontSize['2xl'],
  },
  text3xl: {
    fontSize: theme.fontSize['3xl'],
  },
  text4xl: {
    fontSize: theme.fontSize['4xl'],
  },

  // Text colors
  textWhite: {
    color: theme.colors.white,
  },
  textPrimary: {
    color: theme.colors.text.primary,
  },
  textSecondary: {
    color: theme.colors.text.secondary,
  },
  textTertiary: {
    color: theme.colors.text.tertiary,
  },
  textDisabled: {
    color: theme.colors.text.disabled,
  },
  textColorPrimary: {
    color: theme.colors.primary,
  },
  textColorSecondary: {
    color: theme.colors.secondary,
  },
  textSuccess: {
    color: theme.colors.success,
  },
  textWarning: {
    color: theme.colors.warning,
  },
  textError: {
    color: theme.colors.error,
  },

  // Gray shades
  textGray300: {
    color: theme.colors.gray[300],
  },
  textGray400: {
    color: theme.colors.gray[400],
  },
  textGray500: {
    color: theme.colors.gray[500],
  },

  // Status colors
  textGreen400: {
    color: theme.colors.green[400],
  },
  textYellow400: {
    color: theme.colors.yellow[400],
  },
  textRed400: {
    color: theme.colors.red[400],
  },
  textBlue400: {
    color: theme.colors.blue[400],
  },
  textOrange300: {
    color: theme.colors.orange[300],
  },
  textOrange400: {
    color: theme.colors.orange[400],
  },
  uppercase: {
    textTransform: 'uppercase',
  },
});

// Helper function to create custom text styles
export const createTextStyle = (overrides: Partial<TextStyle>): TextStyle => ({
  fontFamily: theme.fontFamily.jura,
  fontSize: theme.fontSize.base,
  color: theme.colors.text.primary,
  ...overrides,
});

// Common text style combinations
export const textCombinations = {
  // Heading with Audiowide
  headingLarge: [typography.h1, typography.audiowide],
  headingMedium: [typography.h2, typography.audiowide],
  headingSmall: [typography.h3, typography.audiowide],

  // Body with different weights
  bodyRegular: [typography.bodyBase, typography.jura400],
  bodyMedium: [typography.bodyBase, typography.jura500],
  bodySemiBold: [typography.bodyBase, typography.jura600],
  bodyBold: [typography.bodyBase, typography.jura700],

  // Caption text
  caption: [typography.textSm, typography.jura400, typography.textSecondary],
  captionBold: [typography.textSm, typography.jura600, typography.textSecondary],

  // Labels
  label: [typography.textSm, typography.jura500, typography.textWhite],
  labelSecondary: [typography.textSm, typography.jura400, typography.textSecondary],

  // Monospace (for addresses, keys)
  monoSmall: [typography.textSm, typography.mono, typography.textWhite],
  monoBase: [typography.textBase, typography.mono, typography.textWhite],
};
