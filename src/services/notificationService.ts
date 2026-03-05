import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { apiClient } from './api';

// Detect if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Conditional Firebase import
let messaging: any = null;
if (!isExpoGo) {
  try {
    messaging = require('@react-native-firebase/messaging').default;
  } catch (error) {
    console.warn('Firebase messaging not available:', error.message);
  }
} else {
  console.warn('[DEV] Running in Expo Go - Push notifications (remote/Firebase) are disabled. Local notifications will still work. Build a development client or production app to enable full push notification support.');
}

// Types for notifications
export interface NotificationData {
  type: 'transaction' | 'price_alert' | 'system' | 'marketing';
  title: string;
  body: string;
  data?: {
    transactionId?: string;
    tokenAddress?: string;
    poolId?: string;
    url?: string;
    action?: string;
  };
}

export interface NotificationPreferences {
  transactionAlerts: boolean;
  priceAlerts: boolean;
  marketingNotifications: boolean;
  systemNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string; // "22:00"
    endTime: string;   // "08:00"
  };
  priceAlertThresholds: {
    enabled: boolean;
    upThreshold: number; // percentage
    downThreshold: number; // percentage
  };
}

export interface PriceAlert {
  id: string;
  tokenAddress: string;
  tokenSymbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
  createdAt: number;
}

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const preferences = await notificationService.getPreferences();
    
    // Check quiet hours
    if (preferences && preferences.quietHours.enabled) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      if (isInQuietHours(currentTime, preferences.quietHours)) {
        return {
          shouldShowAlert: false,
          shouldPlaySound: false,
          shouldSetBadge: true,
        };
      }
    }

    return {
      shouldShowAlert: true,
      shouldPlaySound: preferences?.soundEnabled ?? true,
      shouldSetBadge: true,
    };
  },
});

// Helper function to check quiet hours
function isInQuietHours(
  currentTime: string,
  quietHours: { startTime: string; endTime: string }
): boolean {
  const current = timeToMinutes(currentTime);
  const start = timeToMinutes(quietHours.startTime);
  const end = timeToMinutes(quietHours.endTime);

  if (start < end) {
    return current >= start && current <= end;
  } else {
    // Quiet hours span midnight
    return current >= start || current <= end;
  }
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Notification Service
class NotificationService {
  private fcmToken: string | null = null;
  private expoPushToken: string | null = null;
  private preferences: NotificationPreferences | null = null;
  private firebaseUnsubscribe: (() => void) | null = null;

  // Initialize notification service
  async initialize(): Promise<void> {
    if (Device.isDevice) {
      await this.requestPermissions();

      // Skip Firebase setup in Expo Go
      if (!isExpoGo) {
        await this.setupFirebaseMessaging();
        await this.getFCMToken();
        this.setupFirebaseListeners();
      }

      // Expo push tokens and local notifications work in Expo Go
      await this.getExpoPushToken();
      await this.loadPreferences();
      this.setupNotificationListeners();
    } else {
      console.warn('Push notifications are not supported in simulator/emulator');
    }
  }

  // Request notification permissions
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted');
        return false;
      }

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await this.setupNotificationChannels();
      }

      return true;
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      return false;
    }
  }

  // Setup Android notification channels
  private async setupNotificationChannels(): Promise<void> {
    await Notifications.setNotificationChannelAsync('transactions', {
      name: 'Transactions',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#06EBF1',
    });

    await Notifications.setNotificationChannelAsync('price-alerts', {
      name: 'Price Alerts',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#A40CFF',
    });

    await Notifications.setNotificationChannelAsync('system', {
      name: 'System',
      importance: Notifications.AndroidImportance.DEFAULT,
    });

    await Notifications.setNotificationChannelAsync('marketing', {
      name: 'Marketing',
      importance: Notifications.AndroidImportance.LOW,
    });
  }

  // Setup Firebase Messaging
  private async setupFirebaseMessaging(): Promise<void> {
    try {
      if (!messaging) {
        console.log('Firebase messaging not available, skipping setup');
        return;
      }

      // Request permission for iOS
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          console.warn('Firebase messaging permission not granted');
        }
      }
    } catch (error) {
      console.error('Failed to setup Firebase messaging:', error);
    }
  }

  // Get FCM token from Firebase
  async getFCMToken(): Promise<string | null> {
    try {
      if (!Device.isDevice || !messaging) {
        return null;
      }

      const token = await messaging().getToken();
      this.fcmToken = token;
      
      if (token) {
        await this.registerDeviceToken(token, 'fcm');
      }

      return token;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  }

  // Get Expo Push Token
  async getExpoPushToken(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        return null;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      this.expoPushToken = token;
      
      if (token) {
        await this.registerDeviceToken(token, 'expo');
      }

      return token;
    } catch (error) {
      console.error('Failed to get Expo push token:', error);
      return null;
    }
  }

  // Register device token with backend
  async registerDeviceToken(token: string, tokenType: 'fcm' | 'expo', userId?: string): Promise<void> {
    try {
      await apiClient.post('/api/notifications/register-device', {
        token,
        tokenType,
        userId,
        platform: Platform.OS,
        deviceInfo: {
          brand: Device.brand,
          modelName: Device.modelName,
          osVersion: Device.osVersion,
        },
      });
    } catch (error) {
      console.error('Failed to register device token:', error);
    }
  }

  // Unregister device token
  async unregisterDeviceToken(): Promise<void> {
    try {
      if (this.fcmToken) {
        await apiClient.post('/api/notifications/unregister-device', {
          token: this.fcmToken,
        });
      }
    } catch (error) {
      console.error('Failed to unregister device token:', error);
    }
  }

  // Setup notification listeners
  private setupNotificationListeners(): void {
    // Handle notifications received while app is in foreground
    Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
      this.handleForegroundNotification(notification);
    });

    // Handle notification taps
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification tapped:', response);
      this.handleNotificationPress(response.notification.request.content.data);
    });
  }

  // Setup Firebase messaging listeners
  private setupFirebaseListeners(): void {
    if (!messaging) {
      console.log('Firebase messaging not available, skipping listeners setup');
      return;
    }

    try {
      // Handle FCM token refresh
      messaging().onTokenRefresh(async (token) => {
        console.log('FCM token refreshed:', token);
        this.fcmToken = token;
        await this.registerDeviceToken(token, 'fcm');
      });

      // Handle background messages
      messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        console.log('Message handled in the background!', remoteMessage);
        this.handleFirebaseMessage(remoteMessage);
      });

      // Handle foreground messages
      const unsubscribe = messaging().onMessage(async (remoteMessage) => {
        console.log('A new FCM message arrived!', remoteMessage);
        
        // Display local notification when app is in foreground
        if (remoteMessage.notification) {
          await this.sendLocalNotification({
            type: (remoteMessage.data?.type as NotificationData['type']) || 'system',
            title: remoteMessage.notification.title || 'Notification',
            body: remoteMessage.notification.body || '',
            data: remoteMessage.data,
          });
        }
      });

      // Store the unsubscribe function for cleanup
      this.firebaseUnsubscribe = unsubscribe;
    } catch (error) {
      console.error('Failed to setup Firebase listeners:', error);
    }
  }

  // Handle Firebase remote messages
  private handleFirebaseMessage(remoteMessage: any): void {
    console.log('Handling Firebase message:', remoteMessage);
    
    // Process the message data
    if (remoteMessage.data) {
      this.handleNotificationPress(remoteMessage.data);
    }
  }

  // Handle foreground notifications
  private handleForegroundNotification(notification: Notifications.Notification): void {
    // Show in-app notification or update UI
    const data = notification.request.content.data as NotificationData['data'];
    
    // You can implement custom in-app notification display here
    console.log('Handling foreground notification:', data);
  }

  // Handle notification press/tap
  handleNotificationPress(data?: NotificationData['data']): void {
    if (!data) return;

    // Navigate based on notification type
    switch (data.action) {
      case 'open_transaction':
        // Navigate to transaction details
        break;
      case 'open_token':
        // Navigate to token details
        break;
      case 'open_pool':
        // Navigate to pool details
        break;
      case 'open_url':
        // Open external URL
        break;
      default:
        // Navigate to main screen
        break;
    }
  }

  // Send local notification
  async sendLocalNotification(data: NotificationData): Promise<void> {
    try {
      const channelId = this.getChannelId(data.type);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: data.title,
          body: data.body,
          data: data.data,
          sound: this.preferences?.soundEnabled ? 'default' : false,
        },
        trigger: null, // Send immediately
        identifier: Date.now().toString(),
      });
    } catch (error) {
      console.error('Failed to send local notification:', error);
    }
  }

  // Get notification preferences
  async getPreferences(): Promise<NotificationPreferences | null> {
    if (this.preferences) {
      return this.preferences;
    }

    try {
      const preferences = await apiClient.get('/api/notifications/preferences');
      this.preferences = preferences;
      return preferences;
    } catch (error) {
      console.error('Failed to get notification preferences:', error);
      return null;
    }
  }

  // Load preferences from cache
  private async loadPreferences(): Promise<void> {
    try {
      this.preferences = await this.getPreferences();
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
  }

  // Update notification preferences
  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    try {
      const updatedPreferences = await apiClient.post('/api/notifications/preferences', preferences);
      this.preferences = updatedPreferences;
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      throw error;
    }
  }

  // Create price alert
  async createPriceAlert(
    tokenAddress: string,
    tokenSymbol: string,
    targetPrice: number,
    condition: 'above' | 'below'
  ): Promise<PriceAlert> {
    try {
      return await apiClient.post('/api/notifications/price-alerts', {
        tokenAddress,
        tokenSymbol,
        targetPrice,
        condition,
      });
    } catch (error) {
      console.error('Failed to create price alert:', error);
      throw error;
    }
  }

  // Get user's price alerts
  async getPriceAlerts(): Promise<PriceAlert[]> {
    try {
      return await apiClient.get('/api/notifications/price-alerts');
    } catch (error) {
      console.error('Failed to get price alerts:', error);
      return [];
    }
  }

  // Delete price alert
  async deletePriceAlert(alertId: string): Promise<void> {
    try {
      await apiClient.delete(`/api/notifications/price-alerts/${alertId}`);
    } catch (error) {
      console.error('Failed to delete price alert:', error);
      throw error;
    }
  }

  // Toggle price alert
  async togglePriceAlert(alertId: string, isActive: boolean): Promise<void> {
    try {
      await apiClient.patch(`/api/notifications/price-alerts/${alertId}`, {
        isActive,
      });
    } catch (error) {
      console.error('Failed to toggle price alert:', error);
      throw error;
    }
  }

  // Send test notification
  async sendTestNotification(): Promise<void> {
    try {
      await apiClient.post('/api/notifications/test');
    } catch (error) {
      console.error('Failed to send test notification:', error);
      throw error;
    }
  }

  // Clear all notifications
  async clearAllNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  }

  // Get notification history
  async getNotificationHistory(limit: number = 50, offset: number = 0): Promise<{
    id: string;
    type: string;
    title: string;
    body: string;
    timestamp: number;
    read: boolean;
  }[]> {
    try {
      return await apiClient.get('/api/notifications/history', {
        params: { limit, offset },
      });
    } catch (error) {
      console.error('Failed to get notification history:', error);
      return [];
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await apiClient.patch(`/api/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  // Helper methods
  private getChannelId(type: NotificationData['type']): string {
    switch (type) {
      case 'transaction':
        return 'transactions';
      case 'price_alert':
        return 'price-alerts';
      case 'system':
        return 'system';
      case 'marketing':
        return 'marketing';
      default:
        return 'system';
    }
  }

  // Check if notifications are enabled for a specific type
  isNotificationTypeEnabled(type: NotificationData['type']): boolean {
    if (!this.preferences) return true;

    switch (type) {
      case 'transaction':
        return this.preferences.transactionAlerts;
      case 'price_alert':
        return this.preferences.priceAlerts;
      case 'marketing':
        return this.preferences.marketingNotifications;
      case 'system':
        return this.preferences.systemNotifications;
      default:
        return true;
    }
  }

  // Get current FCM token
  getCurrentFCMToken(): string | null {
    return this.fcmToken;
  }

  // Get current Expo push token
  getCurrentExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  // Check if Firebase is available
  isFirebaseAvailable(): boolean {
    try {
      return !!messaging && !!messaging().app;
    } catch (error) {
      return false;
    }
  }

  // Clean up when app is closing
  cleanup(): void {
    // Remove Firebase listeners
    if (this.firebaseUnsubscribe) {
      this.firebaseUnsubscribe();
      this.firebaseUnsubscribe = null;
    }
    
    // Clear cached data
    this.preferences = null;
    this.fcmToken = null;
    this.expoPushToken = null;
  }
}

// Create and export singleton instance
export const notificationService = new NotificationService();