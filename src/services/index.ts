// Import environment configuration
import { initializeEnvironment, config, isDevelopment } from '../config/environment';

// Service instances for direct import
export { apiClient } from './api';
export { tokenService } from './tokenService';
export { launchpadService } from './launchpadService';
export { walletService } from './walletService';
// Temporarily disabled due to expo-notifications not working in Expo Go SDK 53+
// export { notificationService } from './notificationService';

// Initialize all services
export const initializeServices = async () => {
  try {
    // Initialize environment configuration first
    initializeEnvironment();

    // Temporarily disabled due to expo-notifications not working in Expo Go SDK 53+
    // Initialize notification service (if enabled)
    // if (config.features.pushNotifications) {
    //   await notificationService.initialize();
    // }
    
    // Log service initialization in development
    if (isDevelopment) {
      console.log('✅ Services initialized:', {
        apiBaseUrl: config.apiBaseUrl,
        environment: config.environment,
        features: config.features,
      });
    }
    
    console.log('✅ All services initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
    // Don't throw error to prevent app crash
  }
};