// Polyfills for Node.js APIs in React Native
import 'react-native-get-random-values'; // Must be imported first

// Buffer and Process polyfills - MUST set globals BEFORE any other imports
import { Buffer } from 'buffer';
import process from 'process';
global.Buffer = Buffer;
global.process = process;

// Now safe to import everything else
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppState, AppStateStatus } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import 'react-native-reanimated';

import { QueryProvider } from '@/src/providers/QueryProvider';
// import { NotificationProvider } from '@/src/providers/NotificationProvider';
import { useCustomFonts } from '@/src/hooks/common';
import { LoadingScreen, BackgroundContainer } from '@/src/components/ui';
import { ThemeProvider, useTheme } from '@/src/context/ThemeContext';
import { initializeServices } from '@/src/services';
import { registrationQueueService } from '@/src/services/registrationQueueService';
import { walletService } from '@/src/services/walletService';
import { ErrorBoundary } from '@/src/components/common/ErrorBoundary';

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

// Custom navigation themes with transparent backgrounds for BackgroundContainer
const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: 'transparent',
    card: 'transparent',
  },
};

const CustomDefaultTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
    card: 'transparent',
  },
};

// Inner component that can use the theme context
function AppContent() {
  const { isDark } = useTheme();

  return (
    <BackgroundContainer>
      <NavigationThemeProvider value={isDark ? CustomDarkTheme : CustomDefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="wallet" options={{ headerShown: false }} />
          <Stack.Screen name="token/[id]" options={{ title: 'Token Details', headerBackTitle: 'Back' }} />
          <Stack.Screen name="token/create" options={{ title: 'Create Token', headerBackTitle: 'Back' }} />
          <Stack.Screen name="pool/[id]" options={{ title: 'Pool Details', headerBackTitle: 'Back' }} />
          <Stack.Screen name="pool/create" options={{ title: 'Create Pool', headerBackTitle: 'Back' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style={isDark ? "light" : "dark"} />
      </NavigationThemeProvider>
    </BackgroundContainer>
  );
}

export default function RootLayout() {
  const fontsLoaded = useCustomFonts();
  const [servicesInitialized, setServicesInitialized] = React.useState(false);

  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  React.useEffect(() => {
    // Initialize services on app start
    const initServices = async () => {
      try {
        await initializeServices();
      } catch {
        // Allow app to continue even if services fail to initialize
      }
      setServicesInitialized(true);
    };

    initServices();
  }, []);

  // Handle app state changes - lock wallet on background, process queue on foreground
  React.useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App came to foreground - process registration queue
        registrationQueueService.processQueue().catch(() => {
          // Silently handle queue processing errors
        });
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App went to background - lock wallet for security
        walletService.lockWallet();
      }
    };

    // Process queue on initial app launch
    registrationQueueService.processQueue().catch(() => {
      // Silently handle queue processing errors
    });

    // Listen for app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  if (!fontsLoaded || !servicesInitialized) {
    return <LoadingScreen message={!fontsLoaded ? "Loading fonts..." : "Initializing services..."} />;
  }

  return (
    <ErrorBoundary>
      <QueryProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}
