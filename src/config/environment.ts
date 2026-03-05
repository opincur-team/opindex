import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { configureApiForEnvironment } from '../services/api';

// Environment types
export type Environment = 'development' | 'staging' | 'production';

/**
 * Wallet configuration constants
 * Centralized location for all hardcoded wallet-related values
 */
export const WALLET_CONFIG = {
  /** SOL reserved for transaction fees when using MAX button */
  SOL_FEE_RESERVE: 0.005,
  /** Default slippage tolerance for swaps (in basis points, 50 = 0.5%) */
  DEFAULT_SLIPPAGE_BPS: 50,
  /** Maximum slippage tolerance allowed */
  MAX_SLIPPAGE_BPS: 1000,
  /** Auto-lock timeout in minutes */
  DEFAULT_AUTO_LOCK_MINUTES: 5,
  /** Maximum failed unlock attempts before lockout */
  MAX_UNLOCK_ATTEMPTS: 5,
  /** Lockout duration in milliseconds (1 minute) */
  LOCKOUT_DURATION_MS: 60000,
} as const;

// Configuration interface
export interface AppConfig {
  environment: Environment;
  apiBaseUrl: string;
  websocketUrl: string;
  enableLogging: boolean;
  enableCrashReporting: boolean;
  maxRetryAttempts: number;
  requestTimeout: number;
  features: {
    biometricAuth: boolean;
    pushNotifications: boolean;
    analytics: boolean;
    betaFeatures: boolean;
  };
  endpoints: {
    tokenData: string;
    launchpad: string;
    market: string;
    notifications: string;
    analytics: string;
    pools: string;
  };
}

// Environment configurations
const environments: Record<Environment, AppConfig> = {
  development: {
    environment: 'development',
    apiBaseUrl: 'https://api.opindex.io',
    //apiBaseUrl: 'http://192.168.212.129:3010',
    websocketUrl: 'wss://ws-dev.opindex.com',
    enableLogging: true,
    enableCrashReporting: false,
    maxRetryAttempts: 3,
    requestTimeout: 30000,
    features: {
      biometricAuth: true,
      pushNotifications: false,
      analytics: false,
      betaFeatures: true,
    },
    endpoints: {
      tokenData: '/api/token-data',
      launchpad: '/api/launchpad',
      market: '/api/market',
      notifications: '/api/notifications',
      analytics: '/api/analytics',
      pools: '/api/pools',
    },
  },
  staging: {
    environment: 'staging',
    apiBaseUrl: 'https://api-staging.opindex.com',
    websocketUrl: 'wss://ws-staging.opindex.com',
    enableLogging: true,
    enableCrashReporting: true,
    maxRetryAttempts: 3,
    requestTimeout: 30000,
    features: {
      biometricAuth: true,
      pushNotifications: false,
      analytics: true,
      betaFeatures: true,
    },
    endpoints: {
      tokenData: '/api/token-data',
      launchpad: '/api/launchpad',
      market: '/api/market',
      notifications: '/api/notifications',
      analytics: '/api/analytics',
      pools: '/api/pools',
    },
  },
  production: {
    environment: 'production',
    apiBaseUrl: 'https://api.opindex.io',
    websocketUrl: 'wss://ws.opindex.com',
    enableLogging: false,
    enableCrashReporting: true,
    maxRetryAttempts: 3,
    requestTimeout: 30000,
    features: {
      biometricAuth: true,
      pushNotifications: false,
      analytics: true,
      betaFeatures: false,
    },
    endpoints: {
      tokenData: '/api/token-data',
      launchpad: '/api/launchpad',
      market: '/api/market',
      notifications: '/api/notifications',
      analytics: '/api/analytics',
      pools: '/api/pools',
    },
  },
};

// Get current environment
function getCurrentEnvironment(): Environment {
  console.log('🔍 Environment Detection Debug:');
  console.log('  __DEV__:', __DEV__);
  console.log('  Release channel:', Constants.expoConfig?.extra?.releaseChannel);
  console.log('  Env variable:', Constants.expoConfig?.extra?.environment);

  // Check for expo release channel first
  const releaseChannel = Constants.expoConfig?.extra?.releaseChannel;

  if (releaseChannel) {
    console.log('  ✓ Using release channel:', releaseChannel);
    switch (releaseChannel) {
      case 'production':
        return 'production';
      case 'staging':
        return 'staging';
      default:
        return 'development';
    }
  }

  // Check for environment variable
  const envVar = Constants.expoConfig?.extra?.environment;
  if (envVar && environments[envVar as Environment]) {
    console.log('  ✓ Using environment variable:', envVar);
    return envVar as Environment;
  }

  // Default to development in dev mode, production otherwise
  const detectedEnv = __DEV__ ? 'development' : 'production';
  console.log('  ✓ Using default based on __DEV__:', detectedEnv);
  return detectedEnv;
}

// Current configuration
export const currentEnvironment = getCurrentEnvironment();
console.log('🎯 Final detected environment:', currentEnvironment);
export const config = environments[currentEnvironment];

// Initialize environment configuration
export const initializeEnvironment = () => {
  console.log(`🌍 Environment: ${currentEnvironment}`);
  console.log(`🚀 API URL: ${config.apiBaseUrl}`);

  // Configure API client with environment-specific settings
  // Pass the apiBaseUrl from this config (single source of truth)
  configureApiForEnvironment(config.apiBaseUrl);

  // Disable all console logging in production to prevent information leakage
  if (!config.enableLogging) {
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
    console.info = () => {};
    console.debug = () => {};
  }

  return config;
};

// Environment-specific utilities
export const isDevelopment = currentEnvironment === 'development';
export const isStaging = currentEnvironment === 'staging';
export const isProduction = currentEnvironment === 'production';

// Feature flags
export const isFeatureEnabled = (feature: keyof AppConfig['features']): boolean => {
  return config.features[feature];
};

// Get full API endpoint URL
export const getApiEndpoint = (endpoint: keyof AppConfig['endpoints']): string => {
  return `${config.apiBaseUrl}${config.endpoints[endpoint]}`;
};

// Platform-specific configurations
export const platformConfig = {
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  isWeb: Platform.OS === 'web',
  version: Constants.expoConfig?.version || '1.0.0',
  buildNumber: Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || '1',
  deviceInfo: {
    platform: Platform.OS,
    version: Platform.Version,
  },
};

// Debug information (development only)
export const debugInfo = isDevelopment ? {
  environment: currentEnvironment,
  config: config,
  constants: Constants,
  platform: platformConfig,
} : null;

// Export current config as default
export default config;
