import React from 'react';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import { ViewStyle } from 'react-native';

interface LinearGradientProps {
  children?: React.ReactNode;
  colors?: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  locations?: number[];
  style?: ViewStyle;
  variant?: 'primary' | 'secondary' | 'dark' | 'custom';
}

export const LinearGradient: React.FC<LinearGradientProps> = ({
  children,
  colors,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  locations,
  style,
  variant = 'primary',
}) => {
  const getVariantColors = () => {
    switch (variant) {
      case 'primary':
        return ['#06EBF1', '#A40CFF']; // Primary gradient from web app
      case 'secondary':
        return ['#00FF99', '#2EDE1A']; // Green gradient
      case 'dark':
        return ['rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.4)']; // Dark overlay
      case 'custom':
      default:
        return colors || ['#06EBF1', '#A40CFF'];
    }
  };

  const gradientColors = colors || getVariantColors();
  
  // Ensure we have at least 2 colors for ExpoLinearGradient
  const validColors = gradientColors.length >= 2 ? gradientColors : ['#06EBF1', '#A40CFF'];

  return (
    <ExpoLinearGradient
      colors={validColors as [string, string, ...string[]]}
      start={start}
      end={end}
      locations={locations}
      style={style}
    >
      {children}
    </ExpoLinearGradient>
  );
};

// Utility component for primary gradient buttons
export const GradientButton: React.FC<{
  children: React.ReactNode;
  style?: ViewStyle;
}> = ({ children, style }) => (
  <LinearGradient
    variant="primary"
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={{
      borderRadius: 12,
      shadowColor: '#06EBF1',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 8,
      ...(style || {}),
    }}
  >
    {children}
  </LinearGradient>
);

// Utility component for card backgrounds with glassmorphism
export const GlassCard: React.FC<{
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: 'light' | 'medium' | 'strong';
}> = ({ children, style, intensity = 'medium' }) => {
  const getIntensityStyle = () => {
    switch (intensity) {
      case 'light':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          shadowColor: 'rgba(0, 0, 0, 0.2)',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 4,
          elevation: 4,
        };
      case 'strong':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.3)',
          shadowColor: 'rgba(0, 0, 0, 0.4)',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 1,
          shadowRadius: 16,
          elevation: 16,
        };
      case 'medium':
      default:
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
          shadowColor: 'rgba(0, 0, 0, 0.25)',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 1,
          shadowRadius: 8,
          elevation: 8,
        };
    }
  };

  return (
    <LinearGradient
      variant="dark"
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        ...getIntensityStyle(),
        ...(style || {}),
      }}
    >
      {children}
    </LinearGradient>
  );
};