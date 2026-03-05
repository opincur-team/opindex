import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import { useAppStore } from '@/src/stores/appStore';
import { walletService } from '@/src/services/walletService';
import {typography} from "@/src/styles/typography";

export default function AppSplashScreen() {
  const { isOnboarded, wallet, setWallet } = useAppStore();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Start fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Navigation logic after a short delay to show splash
    const timer = setTimeout(() => {
      navigateToNextScreen();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const navigateToNextScreen = async () => {
    if (isNavigating) return;
    setIsNavigating(true);

    try {
      // Check if user has completed onboarding
      if (!isOnboarded) {
        router.replace('/(auth)/onboarding');
        return;
      }

      // Check if user has a wallet
      const hasWallet = await walletService.hasWallet();
      if (!hasWallet) {
        router.replace('/(auth)/wallet-setup');
        return;
      }

      // Load wallet info if available
      const walletInfo = await walletService.getWalletInfo();
      if (walletInfo) {
        setWallet({
          address: walletInfo.address,
          publicKey: walletInfo.publicKey,
          isConnected: true,
        });
      }

      // Navigate to main app
      router.replace('/portfolio');
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to onboarding on error
      router.replace('/(auth)/onboarding');
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={[typography.daysone, styles.title]}>Opindex Wallet</Text>
        <Text style={styles.subtitle}>TRADE AND HODL YOUR WAY, TOGETHER.</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
          <View style={styles.loadingDots}>
            <Animated.View 
              style={[
                styles.dot,
                {
                  opacity: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 1],
                  }),
                },
              ]} 
            />
            <Animated.View 
              style={[
                styles.dot,
                {
                  opacity: fadeAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.3, 1, 0.3],
                  }),
                },
              ]} 
            />
            <Animated.View 
              style={[
                styles.dot,
                {
                  opacity: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0.3],
                  }),
                },
              ]} 
            />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#06EBF1',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 40,
    fontFamily: 'jura',
    textTransform: 'uppercase',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 16,
    fontFamily: 'jura',
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#06EBF1',
  },
});
