import { Tabs } from 'expo-router';
import React from 'react';
import {Image, StyleSheet, Platform, View} from 'react-native';
import { BlurView as ExpoBlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supportsBlur } from '@/src/utils/platform';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';

const swapIcon = require('../../assets/images/icons/swap.png');
const walletIcon = require('../../assets/images/icons/wallet.png');

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#fff',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          position: 'absolute',
          borderRadius: 30,
          paddingBottom: 0,
          marginHorizontal: 16,
          marginBottom: 16 + Platform.OS === 'android' ?  insets.bottom : 16,
          overflow: 'hidden',
          height: Platform.OS === 'android' ? 90: 74,
          ...Platform.select({
            ios: {
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            },
            android: {
              elevation: 8,
            },
          }),
        },
        tabBarLabelStyle: {
          fontFamily: 'Days One',
          fontSize: 10,
          marginTop: 4,
          marginBottom: 4,
        },
        tabBarBackground: () => (
          supportsBlur() ? (
            <ExpoBlurView
              intensity={50}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(20, 20, 20, 0.65)' }]} />
          )
        ),
      }}>
      <Tabs.Screen
        name="portfolio"
        options={{
          title: 'WALLET',
          tabBarIcon: ({ color }) => <Image source={walletIcon} style={{width: 18, height: 18}}/> ,
        }}
      />
      <Tabs.Screen
        name="swap"
        options={{
          title: 'SWAP',
          tabBarIcon: ({ color }) => <Image source={swapIcon} style={{width: 18, height: 18}}/>,
        }}
      />
      <Tabs.Screen
        name="launchpad"
        options={{
          title: 'Launchpad',
          href: null, // Hidden for now - will be implemented later
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="plus.circle" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          href: null, // Hidden for now - will be implemented later
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear" color={color} />,
        }}
      />
    </Tabs>
  );
}
