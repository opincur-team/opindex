import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Text } from './Text';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default' | 'verified' | 'gradient';
  size?: 'xs' | 'sm' | 'md';
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  icon,
  style,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return { backgroundColor: 'rgba(0, 255, 136, 0.2)', borderColor: 'rgba(0, 255, 136, 0.3)' };
      case 'warning':
        return { backgroundColor: 'rgba(255, 170, 0, 0.2)', borderColor: 'rgba(255, 170, 0, 0.3)' };
      case 'error':
        return { backgroundColor: 'rgba(255, 51, 51, 0.2)', borderColor: 'rgba(255, 51, 51, 0.3)' };
      case 'info':
        return { backgroundColor: 'rgba(51, 153, 255, 0.2)', borderColor: 'rgba(51, 153, 255, 0.3)' };
      case 'verified':
        return { backgroundColor: 'rgba(6, 235, 241, 0.2)', borderColor: 'rgba(6, 235, 241, 0.3)' };
      case 'gradient':
        return { backgroundColor: 'rgba(6, 235, 241, 0.2)', borderColor: 'rgba(6, 235, 241, 0.3)' };
      case 'default':
      default:
        return { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.2)' };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'xs':
        return { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 };
      case 'sm':
        return { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 };
      case 'md':
        return { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 };
      default:
        return { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'xs':
        return 'xs';
      case 'sm':
        return 'sm';
      case 'md':
        return 'base';
      default:
        return 'sm';
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'success':
        return '#00FF88';
      case 'warning':
        return '#FFAA00';
      case 'error':
        return '#FF3333';
      case 'info':
        return '#3399FF';
      case 'verified':
      case 'gradient':
        return '#FFFFFF';
      case 'default':
      default:
        return '#FFFFFF';
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <View style={[
      {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
      },
      variantStyles,
      sizeStyles,
      style
    ]}>
      {icon && (
        <View style={{ marginRight: 6 }}>
          {icon}
        </View>
      )}
      <Text 
        size={getTextSize() as any}
        style={{ color: getTextColor(), fontWeight: '500' }}
      >
        {children}
      </Text>
    </View>
  );
};