import React from 'react';
import { View, ViewStyle, StyleSheet, StyleProp } from 'react-native';
import { theme } from '@/src/styles/theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'solid';
  padding?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  style,
}) => {
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'glass':
        return styles.glassVariant;
      case 'solid':
        return styles.solidVariant;
      case 'default':
      default:
        return styles.defaultVariant;
    }
  };

  const getPaddingStyles = (): ViewStyle => {
    switch (padding) {
      case 'sm':
        return styles.paddingSm;
      case 'md':
        return styles.paddingMd;
      case 'lg':
        return styles.paddingLg;
      default:
        return {};
    }
  };

  const variantStyles = getVariantStyles();
  const paddingStyles = getPaddingStyles();

  return (
    <View style={[styles.base, variantStyles, paddingStyles, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius['2xl'],
  },
  defaultVariant: {
    backgroundColor: theme.colors.dark[200],
    borderWidth: theme.borderWidth.default,
    borderColor: theme.colors.border.light,
    ...theme.shadows.md,
    elevation: theme.elevation.md,
  },
  glassVariant: {
    backgroundColor: theme.colors.glass.light,
    borderWidth: theme.borderWidth.default,
    borderColor: theme.colors.border.light,
  },
  solidVariant: {
    backgroundColor: '#2A2A2A',
  },
  paddingSm: {
    padding: theme.spacing[3],
  },
  paddingMd: {
    padding: theme.spacing[4],
  },
  paddingLg: {
    padding: theme.spacing[6],
  },
});