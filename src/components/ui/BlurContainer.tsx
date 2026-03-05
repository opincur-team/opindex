import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { BlurView as ExpoBlurView } from "expo-blur";
import { supportsBlur } from '@/src/utils/platform';

interface BlurContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  shadowColor?: string;
  shadowOpacity?: number;
  shadowRadius?: number;
  shadowOffset?: { width: number; height: number };
  elevation?: number;
  fallbackBackground?: string;
  borderRadius?: number;
}

export const BlurContainer: React.FC<BlurContainerProps> = ({
  children,
  style,
  shadowColor = '#000',
  shadowOpacity = 0.15,
  shadowRadius = 6,
  shadowOffset = { width: 0, height: 6 },
  elevation = 10,
  borderRadius = 30,
  fallbackBackground = 'rgba(20, 20, 30, 0.25)',
}) => {
  return (
    <View
      style={[
        styles.container,
        {
          shadowColor,
          shadowOffset,
          shadowOpacity,
          shadowRadius,
          elevation,
        },
        style,
      ]}
    >

      {/* Middle View: Border radius + overflow to clip BlurView */}
      <View style={{
        borderRadius: borderRadius,
        overflow: 'hidden',
      }}>
        {supportsBlur() ? (
          <ExpoBlurView
            intensity={30}
            tint="dark"
            style={{
              padding: style?.padding !== undefined ? style.padding : 10,
            }}
          >
            {children}
          </ExpoBlurView>
        ) : (
          <View style={{
            backgroundColor: fallbackBackground,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            padding: style?.padding !== undefined ? style.padding : 10,
          }}>
            {children}
          </View>
        )}
      </View>




    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
});
