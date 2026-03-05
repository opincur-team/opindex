import React from 'react';
import { TouchableOpacity, ViewStyle, ActivityIndicator } from 'react-native';

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}


export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  variant = 'default',
  size = 'md',
  disabled = false,
  loading = false,
  style,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: '#06EBF1',
          shadowColor: '#06EBF1',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 8,
          elevation: 8
        };
      case 'secondary':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.25)'
        };
      case 'ghost':
        return { backgroundColor: 'transparent' };
      case 'danger':
        return {
          backgroundColor: 'rgba(255, 51, 51, 0.2)',
          borderWidth: 1,
          borderColor: 'rgba(255, 51, 51, 0.3)'
        };
      case 'default':
      default:
        return {
          backgroundColor: '#2A2A2A',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)'
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'xs':
        return { width: 32, height: 32 };
      case 'sm':
        return { width: 40, height: 40 };
      case 'md':
        return { width: 48, height: 48 };
      case 'lg':
        return { width: 56, height: 56 };
      default:
        return { width: 48, height: 48 };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        {
          borderRadius: 8,
          justifyContent: 'center',
          alignItems: 'center',
          opacity: disabled ? 0.5 : 1
        },
        variantStyles,
        sizeStyles,
        style
      ]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? '#FFFFFF' : '#06EBF1'} 
          size="small" 
        />
      ) : (
        icon
      )}
    </TouchableOpacity>
  );
};