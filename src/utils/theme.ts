import { COLORS, GRADIENTS, FONTS, SHADOWS } from './constants';

// Theme utility functions for consistent styling across components

export const getGradientStyle = (gradient: keyof typeof GRADIENTS) => {
  return GRADIENTS[gradient];
};

export const getTextColor = (variant: keyof typeof COLORS.text) => {
  return COLORS.text[variant];
};

export const getDarkColor = (variant: keyof typeof COLORS.dark) => {
  return COLORS.dark[variant];
};

export const getBorderColor = (variant: keyof typeof COLORS.border) => {
  return COLORS.border[variant];
};

export const getGlassColor = (variant: keyof typeof COLORS.glass) => {
  return COLORS.glass[variant];
};

// Common style combinations
export const glassmorphicStyle = {
  backgroundColor: COLORS.glass.dark,
  borderColor: COLORS.border.light,
  borderWidth: 1,
};

export const primaryGradientStyle = {
  background: GRADIENTS.primary,
};

export const cardStyle = {
  ...glassmorphicStyle,
  borderRadius: 16,
  padding: 16,
};

export const buttonStyle = {
  height: 52,
  borderRadius: 20,
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
};

export const primaryButtonStyle = {
  ...buttonStyle,
  ...primaryGradientStyle,
};

export const inputStyle = {
  height: 48,
  borderRadius: 12,
  backgroundColor: COLORS.dark[200],
  borderColor: COLORS.border.light,
  borderWidth: 1,
  paddingHorizontal: 12,
  color: COLORS.text.primary,
};

// Text style helpers
export const getTextStyle = (
  size: number,
  color: string,
  fontFamily?: string
) => ({
  fontSize: size,
  color,
  fontFamily: fontFamily || FONTS.jura,
});

export const headingStyle = (size: number) => getTextStyle(
  size,
  COLORS.text.primary,
  FONTS.audiowide
);

export const buttonTextStyle = getTextStyle(
  14,
  COLORS.text.primary,
  FONTS.daysone
);

export const bodyTextStyle = getTextStyle(
  16,
  COLORS.text.secondary,
  FONTS.jura
);