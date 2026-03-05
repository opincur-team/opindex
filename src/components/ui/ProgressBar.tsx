import React, { useEffect, useRef } from 'react';
import { View, ViewStyle, Animated } from 'react-native';
import { Text } from './Text';

interface ProgressBarProps {
  progress: number; // 0 to 100
  variant?: 'default' | 'gradient' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  style?: ViewStyle;
}


export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  variant = 'default',
  size = 'md',
  showLabel = false,
  label,
  animated = true,
  style,
}) => {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (animated) {
      Animated.timing(animatedProgress, {
        toValue: Math.max(0, Math.min(100, progress)),
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [progress, animated, animatedProgress]);

  const getVariantStyles = () => {
    switch (variant) {
      case 'gradient':
        return { backgroundColor: '#06EBF1' }; // Simplified gradient to primary color
      case 'success':
        return { backgroundColor: '#00FF88' };
      case 'warning':
        return { backgroundColor: '#FFAA00' };
      case 'error':
        return { backgroundColor: '#FF3333' };
      case 'default':
      default:
        return { backgroundColor: '#06EBF1' };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { height: 6 };
      case 'md':
        return { height: 8 };
      case 'lg':
        return { height: 12 };
      default:
        return { height: 8 };
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  return (
    <View style={style}>
      {(showLabel || label) && (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text variant="caption" color="secondary">
            {label || 'Progress'}
          </Text>
          <Text variant="caption" color="secondary">
            {Math.round(progress)}%
          </Text>
        </View>
      )}
      
      <View style={[{
        width: '100%',
        backgroundColor: '#2A2A2A',
        borderRadius: 999,
        overflow: 'hidden'
      }, sizeStyles]}>
        {animated ? (
          <Animated.View
            style={[
              {
                borderRadius: 999,
                width: animatedProgress.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
              sizeStyles,
              variantStyles
            ]}
          />
        ) : (
          <View
            style={[
              {
                borderRadius: 999,
                width: `${Math.max(0, Math.min(100, progress))}%`,
              },
              sizeStyles,
              variantStyles
            ]}
          />
        )}
      </View>
    </View>
  );
};

// Circular Progress Component
interface CircularProgressProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'gradient' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  style?: ViewStyle;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 60,
  strokeWidth = 4,
  variant = 'default',
  showLabel = false,
  style,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getStrokeColor = () => {
    switch (variant) {
      case 'success':
        return '#00FF88';
      case 'warning':
        return '#FFAA00';
      case 'error':
        return '#FF3333';
      case 'default':
      default:
        return '#06EBF1';
    }
  };

  return (
    <View 
      style={[
        { 
          width: size, 
          height: size, 
          alignItems: 'center', 
          justifyContent: 'center' 
        }, 
        style
      ]}
    >
      <View style={{ position: 'absolute' }}>
        {/* Background circle */}
        <View
          style={{
            width: size,
            height: size,
            borderWidth: strokeWidth,
            borderColor: '#3A3A3A',
            borderRadius: size / 2,
          }}
        />
        
        {/* Progress circle would need SVG for proper implementation */}
        {/* This is a simplified version using border */}
        <View
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderWidth: strokeWidth,
            borderColor: getStrokeColor(),
            borderLeftColor: 'transparent',
            borderBottomColor: 'transparent',
            borderRadius: size / 2,
            transform: [{ rotate: `${(progress / 100) * 360}deg` }],
          }}
        />
      </View>
      
      {showLabel && (
        <Text variant="caption" color="primary" style={{ fontWeight: '500' }}>
          {Math.round(progress)}%
        </Text>
      )}
    </View>
  );
};