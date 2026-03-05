import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView as ExpoBlurView } from 'expo-blur';
import { supportsBlur } from '@/src/utils/platform';

interface BlurOverlayProps {
  children: React.ReactNode;
  intensity?: number;
  style?: ViewStyle;
}

export const BlurOverlay: React.FC<BlurOverlayProps> = ({
  children,
  intensity = 60,
  style,
}) => {
  if (supportsBlur()) {
    return (
      <ExpoBlurView intensity={intensity} tint="light" style={[styles.overlay, style]}>
        {children}
      </ExpoBlurView>
    );
  }

  return (
    <View style={[styles.overlay, styles.androidOverlay, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  androidOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
});
