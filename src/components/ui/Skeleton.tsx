import React, { useEffect, useRef } from 'react';
import { View, ViewStyle, Animated } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  variant?: 'text' | 'circular' | 'rectangular';
  animated?: boolean;
  style?: ViewStyle;
}


export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  variant = 'rectangular',
  animated = true,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (animated) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.7,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      
      return () => animation.stop();
    }
  }, [animated, opacity]);

  const getVariantStyles = () => {
    switch (variant) {
      case 'text':
        return { borderRadius: 6 };
      case 'circular':
        return { borderRadius: 9999 };
      case 'rectangular':
      default:
        return { borderRadius: 8 };
    }
  };

  const variantStyles = getVariantStyles();

  const getAnimatedDimension = (value: number | string): number | 'auto' | `${number}%` => {
    if (typeof value === 'string') {
      if (value === 'auto') return 'auto';
      if (value.endsWith('%')) return value as `${number}%`;
      return parseFloat(value);
    }
    return value;
  };

  return (
    <Animated.View
      style={[
        {
          width: getAnimatedDimension(width),
          height: getAnimatedDimension(height),
          opacity: animated ? opacity : 0.3,
          backgroundColor: '#2A2A2A',
        },
        variantStyles,
        style,
      ]}
    />
  );
};

// Skeleton presets for common UI elements
export const SkeletonText: React.FC<{ lines?: number }> = ({ 
  lines = 1
}) => (
  <View style={{ gap: 8 }}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        variant="text"
        height={16}
        width={index === lines - 1 ? '80%' : '100%'}
      />
    ))}
  </View>
);

export const SkeletonAvatar: React.FC<{ size?: number }> = ({ 
  size = 40
}) => (
  <Skeleton
    variant="circular"
    width={size}
    height={size}
  />
);

export const SkeletonCard: React.FC = () => (
  <View style={{
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
    gap: 12
  }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <SkeletonAvatar size={32} />
      <View style={{ flex: 1, gap: 8 }}>
        <Skeleton variant="text" height={12} width="60%" />
        <Skeleton variant="text" height={10} width="40%" />
      </View>
    </View>
    <SkeletonText lines={2} />
    <Skeleton height={32} width="30%" />
  </View>
);

export const SkeletonTokenCard: React.FC = () => (
  <View style={{
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
    gap: 12
  }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <SkeletonAvatar size={40} />
        <View style={{ gap: 4 }}>
          <Skeleton variant="text" height={16} width={80} />
          <Skeleton variant="text" height={12} width={60} />
        </View>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <Skeleton variant="text" height={16} width={70} />
        <Skeleton variant="text" height={12} width={50} />
      </View>
    </View>
  </View>
);

export const SkeletonButton: React.FC = () => (
  <Skeleton 
    height={48}
    variant="rectangular"
    style={{ borderRadius: 12 }}
  />
);

export const SkeletonList: React.FC<{ 
  items?: number; 
  renderItem?: () => React.ReactNode;
}> = ({ 
  items = 3, 
  renderItem = () => <SkeletonTokenCard />
}) => (
  <View style={{ gap: 12 }}>
    {Array.from({ length: items }).map((_, index) => (
      <React.Fragment key={index}>
        {renderItem()}
      </React.Fragment>
    ))}
  </View>
);