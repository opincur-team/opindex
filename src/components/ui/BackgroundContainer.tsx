import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

interface BackgroundContainerProps {
  children: React.ReactNode;
}

/**
 * Global background container that displays the fixed bg.jpg image
 * behind all app content with a dark overlay for readability.
 */
export const BackgroundContainer: React.FC<BackgroundContainerProps> = ({ children }) => {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('@/assets/images/bg.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
      </ImageBackground>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    //backgroundColor: 'rgba(0, 0, 0, 0.35)', // 35% overlay for prominent background visibility
  },
  content: {
    flex: 1,
  },
});
