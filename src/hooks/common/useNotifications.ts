import { useEffect, useState, useCallback } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import * as Device from 'expo-device';
import { 
  notificationService, 
  NotificationPreferences, 
  PriceAlert,
  NotificationData 
} from '../../services/notificationService';

export interface UseNotificationsResult {
  // Status
  isInitialized: boolean;
  hasPermission: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Tokens
  fcmToken: string | null;
  expoPushToken: string | null;
  
  // Preferences
  preferences: NotificationPreferences | null;
  
  // Actions
  initialize: () => Promise<void>;
  requestPermissions: () => Promise<boolean>;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
  sendTestNotification: () => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  
  // Price Alerts
  priceAlerts: PriceAlert[];
  createPriceAlert: (
    tokenAddress: string,
    tokenSymbol: string,
    targetPrice: number,
    condition: 'above' | 'below'
  ) => Promise<void>;
  deletePriceAlert: (alertId: string) => Promise<void>;
  togglePriceAlert: (alertId: string, isActive: boolean) => Promise<void>;
  refreshPriceAlerts: () => Promise<void>;
}

export function useNotifications(): UseNotificationsResult {
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);

  // Initialize notification service
  const initialize = useCallback(async () => {
    if (!Device.isDevice) {
      setError('Notifications are not supported in simulator/emulator');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await notificationService.initialize();
      
      // Get tokens
      const fcm = notificationService.getCurrentFCMToken();
      const expo = notificationService.getCurrentExpoPushToken();
      
      setFcmToken(fcm);
      setExpoPushToken(expo);
      setIsInitialized(true);
      setHasPermission(true);
      
      // Load preferences and alerts
      await loadPreferences();
      await loadPriceAlerts();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize notifications';
      setError(errorMessage);
      console.error('Failed to initialize notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Request notification permissions
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const granted = await notificationService.requestPermissions();
      setHasPermission(granted);
      
      if (granted && !isInitialized) {
        await initialize();
      }
      
      return granted;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request permissions';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [initialize, isInitialized]);

  // Load notification preferences
  const loadPreferences = useCallback(async () => {
    try {
      const prefs = await notificationService.getPreferences();
      setPreferences(prefs);
    } catch (err) {
      console.error('Failed to load notification preferences:', err);
    }
  }, []);

  // Update notification preferences
  const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>) => {
    setIsLoading(true);
    setError(null);

    try {
      await notificationService.updatePreferences(newPreferences);
      await loadPreferences(); // Reload to get updated preferences
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update preferences';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadPreferences]);

  // Send test notification
  const sendTestNotification = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await notificationService.sendTestNotification();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send test notification';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    try {
      await notificationService.clearAllNotifications();
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  }, []);

  // Load price alerts
  const loadPriceAlerts = useCallback(async () => {
    try {
      const alerts = await notificationService.getPriceAlerts();
      setPriceAlerts(alerts);
    } catch (err) {
      console.error('Failed to load price alerts:', err);
    }
  }, []);

  // Create price alert
  const createPriceAlert = useCallback(async (
    tokenAddress: string,
    tokenSymbol: string,
    targetPrice: number,
    condition: 'above' | 'below'
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      await notificationService.createPriceAlert(tokenAddress, tokenSymbol, targetPrice, condition);
      await loadPriceAlerts(); // Reload alerts
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create price alert';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadPriceAlerts]);

  // Delete price alert
  const deletePriceAlert = useCallback(async (alertId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await notificationService.deletePriceAlert(alertId);
      await loadPriceAlerts(); // Reload alerts
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete price alert';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadPriceAlerts]);

  // Toggle price alert
  const togglePriceAlert = useCallback(async (alertId: string, isActive: boolean) => {
    try {
      await notificationService.togglePriceAlert(alertId, isActive);
      await loadPriceAlerts(); // Reload alerts
    } catch (err) {
      console.error('Failed to toggle price alert:', err);
      throw err;
    }
  }, [loadPriceAlerts]);

  // Refresh price alerts
  const refreshPriceAlerts = useCallback(async () => {
    await loadPriceAlerts();
  }, [loadPriceAlerts]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && isInitialized) {
        // Refresh data when app becomes active
        loadPreferences();
        loadPriceAlerts();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
    };
  }, [isInitialized, loadPreferences, loadPriceAlerts]);

  // Auto-initialize on mount if device supports notifications
  useEffect(() => {
    if (Device.isDevice && !isInitialized && !isLoading) {
      initialize();
    }
  }, [initialize, isInitialized, isLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isInitialized) {
        notificationService.cleanup();
      }
    };
  }, [isInitialized]);

  return {
    // Status
    isInitialized,
    hasPermission,
    isLoading,
    error,
    
    // Tokens
    fcmToken,
    expoPushToken,
    
    // Preferences
    preferences,
    
    // Actions
    initialize,
    requestPermissions,
    updatePreferences,
    sendTestNotification,
    clearAllNotifications,
    
    // Price Alerts
    priceAlerts,
    createPriceAlert,
    deletePriceAlert,
    togglePriceAlert,
    refreshPriceAlerts,
  };
}

export default useNotifications;