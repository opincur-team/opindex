import React from 'react';
import { Text as RNText, TextStyle, StyleSheet } from 'react-native';
import { typography } from '@/src/styles/typography';

interface TextProps {
  children: React.ReactNode;
  variant?: 'heading' | 'subheading' | 'body' | 'caption' | 'button';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  color?: 'primary' | 'secondary' | 'tertiary' | 'disabled' | 'white' | 'gradient';
  font?: 'audiowide' | 'daysone' | 'jura';
  align?: 'left' | 'center' | 'right';
  style?: TextStyle;
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  size,
  color = 'primary',
  font,
  align = 'left',
  style,
}) => {
  // Get base styles from variant (includes default font, size, color)
  const getVariantStyles = (): TextStyle[] => {
    switch (variant) {
      case 'heading':
        return [typography.h2, typography.audiowide, typography.textPrimary];
      case 'subheading':
        return [typography.textLg, typography.audiowide, typography.textPrimary];
      case 'body':
        return [typography.bodyBase, typography.textSecondary];
      case 'caption':
        return [typography.textSm, typography.jura400, typography.textTertiary];
      case 'button':
        return [typography.textSm, typography.daysone, typography.textPrimary, styles.uppercase];
      default:
        return [typography.bodyBase, typography.textSecondary];
    }
  };

  // Size override (if provided, overrides variant's default size)
  const getSizeStyles = (): TextStyle | undefined => {
    if (!size) return undefined;
    switch (size) {
      case 'xs': return typography.textXs;
      case 'sm': return typography.textSm;
      case 'base': return typography.textBase;
      case 'lg': return typography.textLg;
      case 'xl': return typography.textXl;
      case '2xl': return typography.text2xl;
      case '3xl': return typography.text3xl;
      case '4xl': return typography.text4xl;
    }
  };

  // Color override (if provided or if size override changes default)
  const getColorStyles = (): TextStyle | undefined => {
    // Only apply color if explicitly set or if size was overridden
    if (!size && color === 'primary') return undefined;

    switch (color) {
      case 'primary': return typography.textPrimary;
      case 'secondary': return typography.textSecondary;
      case 'tertiary': return typography.textTertiary;
      case 'disabled': return typography.textDisabled;
      case 'white': return typography.textWhite;
      case 'gradient': return undefined; // gradient not in typography
      default: return typography.textPrimary;
    }
  };

  // Font override (if provided, overrides variant's default font)
  const getFontStyles = (): TextStyle | undefined => {
    if (!font) return undefined;
    switch (font) {
      case 'audiowide': return typography.audiowide;
      case 'daysone': return typography.daysone;
      case 'jura': return typography.jura400;
    }
  };

  // Alignment
  const getAlignmentStyles = (): TextStyle => {
    switch (align) {
      case 'center': return styles.textCenter;
      case 'right': return styles.textRight;
      case 'left':
      default: return styles.textLeft;
    }
  };

  return (
    <RNText
      style={[
        ...getVariantStyles(),
        getSizeStyles(),
        getColorStyles(),
        getFontStyles(),
        getAlignmentStyles(),
        style,
      ]}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  // Text alignment
  textLeft: {
    textAlign: 'left',
  },
  textCenter: {
    textAlign: 'center',
  },
  textRight: {
    textAlign: 'right',
  },

  // Text transform
  uppercase: {
    textTransform: 'uppercase',
  },
});