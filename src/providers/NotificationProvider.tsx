import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Device from 'expo-device';
import { notificationService } from '../services/notificationService';
import { configureNotificationCategories } from '../config/notifications';
import { useNotifications, UseNotificationsResult } from '../hooks/common/useNotifications';

interface NotificationContextType extends UseNotificationsResult {
  isReady: boolean;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const notificationHook = useNotifications();

  // Initialize notifications when component mounts
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // Only initialize on physical devices
        if (!Device.isDevice) {
          console.log('Skipping notification setup on simulator/emulator');
          setIsReady(true);
          return;
        }

        // Configure notification categories
        await configureNotificationCategories();
        
        // Initialize the notification service
        await notificationHook.initialize();
        
        setIsReady(true);
        console.log('Notifications initialized successfully');
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
        setIsReady(true); // Set ready to true even on error to not block the app
      }
    };

    initializeNotifications();
  }, []);

  // Handle app state changes for notification refresh
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && notificationHook.isInitialized) {
        // App has come to foreground, refresh notification data
        notificationHook.refreshPriceAlerts();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
    };
  }, [notificationHook.isInitialized, notificationHook.refreshPriceAlerts]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (notificationHook.isInitialized) {
        notificationService.cleanup();
      }
    };
  }, [notificationHook.isInitialized]);

  const contextValue: NotificationContextType = {
    ...notificationHook,
    isReady,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

// Hook to use the notification context
export function useNotificationContext(): NotificationContextType {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  
  return context;
}

export default NotificationProvider;