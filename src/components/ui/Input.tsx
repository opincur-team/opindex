import React from 'react';
import { TextInput, View, TextInputProps, ViewStyle, TextStyle, StyleSheet } from 'react-native';
import { Text } from './Text';
import { theme } from '@/src/styles/theme';
import { commonStyles } from '@/src/styles/common';
import { typography } from '@/src/styles/typography';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'ghost' | 'solid';
  size?: 'sm' | 'md' | 'lg';
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  style?: TextStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  variant = 'default',
  size = 'md',
  containerStyle,
  inputStyle,
  style,
  ...textInputProps
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'ghost':
        return styles.variantGhost;
      case 'solid':
        return styles.variantSolid;
      case 'default':
      default:
        return styles.variantDefault;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return styles.sizeSm;
      case 'md':
        return styles.sizeMd;
      case 'lg':
        return styles.sizeLg;
      default:
        return styles.sizeMd;
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  const borderStyle =  variant === 'ghost' ? styles.borderNone :  error ? styles.borderError : styles.borderNormal;

  return (
    <View style={containerStyle}>
      {label && (
        <Text
          variant="caption"
          style={[commonStyles.mb2, typography.textSecondary]}
        >
          {label}
        </Text>
      )}

      <View style={styles.inputContainer}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}

        <TextInput
          placeholderTextColor={theme.colors.text.tertiary}
          style={[
            styles.baseInput,
            variantStyles,
            sizeStyles,
            borderStyle,
            leftIcon ? styles.inputWithLeftIcon : undefined,
            rightIcon ? styles.inputWithRightIcon : undefined,
            inputStyle,
            style,
          ]}
          {...textInputProps}
        />

        {rightIcon && (
          <View style={styles.rightIconContainer}>
            {rightIcon}
          </View>
        )}
      </View>

      {error && (
        <Text
          variant="caption"
          style={[commonStyles.mt1, { color: theme.colors.error }]}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Input container
  inputContainer: {
    position: 'relative',
  },

  // Base input styles
  baseInput: {
    borderRadius: theme.borderRadius.md,
    borderWidth: theme.borderWidth.default,
    color: theme.colors.text.primary,
    fontFamily: theme.fontFamily.jura,
  },

  // Variant styles
  variantDefault: {
    backgroundColor: theme.colors.dark[200],
    borderColor: theme.colors.border.light,
  },
  variantGhost: {
    backgroundColor: theme.colors.transparent,
    borderColor: theme.colors.transparent,
  },
  variantSolid: {
    backgroundColor: theme.colors.dark[300],
    borderColor: theme.colors.dark[400],
  },

  // Size styles
  sizeSm: {
    height: 40,
    paddingHorizontal: theme.spacing[3],
    fontSize: theme.fontSize.sm,
  },
  sizeMd: {
    height: 48,
    paddingHorizontal: theme.spacing[4],
    fontSize: theme.fontSize.base,
  },
  sizeLg: {
    height: 56,
    paddingHorizontal: theme.spacing[5],
    fontSize: theme.fontSize.lg,
  },

  // Border states
  borderNormal: {
    borderColor: theme.colors.border.light,
  },
  borderError: {
    borderColor: theme.colors.error,
  },
  borderNone: {
    borderColor: theme.colors.transparent,
  },

  // Icon positioning
  leftIconContainer: {
    position: 'absolute',
    left: 12,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  rightIconContainer: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  // Input padding when icons present
  inputWithLeftIcon: {
    paddingLeft: 40,
  },
  inputWithRightIcon: {
    paddingRight: 40,
  },
});
