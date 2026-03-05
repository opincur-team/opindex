import * as Notifications from 'expo-notifications';

// Default notification preferences
export const DEFAULT_NOTIFICATION_PREFERENCES = {
  transactionAlerts: true,
  priceAlerts: true,
  marketingNotifications: false,
  systemNotifications: true,
  soundEnabled: true,
  vibrationEnabled: true,
  quietHours: {
    enabled: false,
    startTime: '22:00',
    endTime: '08:00',
  },
  priceAlertThresholds: {
    enabled: true,
    upThreshold: 10, // 10% increase
    downThreshold: -10, // 10% decrease
  },
};

// Notification categories for different types
export const NOTIFICATION_CATEGORIES = {
  TRANSACTION: 'transaction',
  PRICE_ALERT: 'price_alert',
  SYSTEM: 'system',
  MARKETING: 'marketing',
} as const;

// Notification action identifiers
export const NOTIFICATION_ACTIONS = {
  VIEW_TRANSACTION: 'view_transaction',
  VIEW_TOKEN: 'view_token',
  VIEW_POOL: 'view_pool',
  OPEN_APP: 'open_app',
  DISMISS: 'dismiss',
} as const;

// Configure notification category actions
export const configureNotificationCategories = async () => {
  // Transaction category with actions
  await Notifications.setNotificationCategoryAsync('transaction', [
    {
      identifier: NOTIFICATION_ACTIONS.VIEW_TRANSACTION,
      buttonTitle: 'View Details',
      options: {
        opensAppToForeground: true,
      },
    },
    {
      identifier: NOTIFICATION_ACTIONS.DISMISS,
      buttonTitle: 'Dismiss',
      options: {
        opensAppToForeground: false,
      },
    },
  ]);

  // Price alert category with actions
  await Notifications.setNotificationCategoryAsync('price_alert', [
    {
      identifier: NOTIFICATION_ACTIONS.VIEW_TOKEN,
      buttonTitle: 'View Token',
      options: {
        opensAppToForeground: true,
      },
    },
    {
      identifier: NOTIFICATION_ACTIONS.DISMISS,
      buttonTitle: 'Dismiss',
      options: {
        opensAppToForeground: false,
      },
    },
  ]);

  // System category with action
  await Notifications.setNotificationCategoryAsync('system', [
    {
      identifier: NOTIFICATION_ACTIONS.OPEN_APP,
      buttonTitle: 'Open App',
      options: {
        opensAppToForeground: true,
      },
    },
  ]);

  // Marketing category with actions
  await Notifications.setNotificationCategoryAsync('marketing', [
    {
      identifier: NOTIFICATION_ACTIONS.OPEN_APP,
      buttonTitle: 'Learn More',
      options: {
        opensAppToForeground: true,
      },
    },
    {
      identifier: NOTIFICATION_ACTIONS.DISMISS,
      buttonTitle: 'Not Now',
      options: {
        opensAppToForeground: false,
      },
    },
  ]);
};

// Notification message templates
export const NOTIFICATION_TEMPLATES = {
  // Transaction notifications
  SWAP_COMPLETED: {
    title: 'Swap Completed',
    body: (fromToken: string, toToken: string, amount: string) => 
      `Successfully swapped ${amount} ${fromToken} to ${toToken}`,
    category: NOTIFICATION_CATEGORIES.TRANSACTION,
  },
  SWAP_FAILED: {
    title: 'Swap Failed',
    body: 'Your swap transaction failed. Please try again.',
    category: NOTIFICATION_CATEGORIES.TRANSACTION,
  },
  TOKEN_CREATED: {
    title: 'Token Created',
    body: (tokenName: string) => `Your token "${tokenName}" has been created successfully`,
    category: NOTIFICATION_CATEGORIES.TRANSACTION,
  },
  LIQUIDITY_ADDED: {
    title: 'Liquidity Added',
    body: (poolName: string) => `Successfully added liquidity to ${poolName}`,
    category: NOTIFICATION_CATEGORIES.TRANSACTION,
  },
  LIQUIDITY_REMOVED: {
    title: 'Liquidity Removed',
    body: (poolName: string) => `Successfully removed liquidity from ${poolName}`,
    category: NOTIFICATION_CATEGORIES.TRANSACTION,
  },

  // Price alert notifications
  PRICE_TARGET_HIT: {
    title: 'Price Alert',
    body: (tokenSymbol: string, targetPrice: string, condition: string) => 
      `${tokenSymbol} has ${condition === 'above' ? 'reached' : 'dropped below'} your target price of $${targetPrice}`,
    category: NOTIFICATION_CATEGORIES.PRICE_ALERT,
  },
  LARGE_PRICE_MOVEMENT: {
    title: 'Price Movement Alert',
    body: (tokenSymbol: string, percentage: string, direction: string) => 
      `${tokenSymbol} is ${direction} ${percentage}% in the last hour`,
    category: NOTIFICATION_CATEGORIES.PRICE_ALERT,
  },
  POOL_APY_CHANGE: {
    title: 'Pool APY Alert',
    body: (poolName: string, newApy: string) => 
      `Your ${poolName} pool APY has changed to ${newApy}%`,
    category: NOTIFICATION_CATEGORIES.PRICE_ALERT,
  },

  // System notifications
  MAINTENANCE_NOTICE: {
    title: 'Scheduled Maintenance',
    body: (timeUntil: string) => `Scheduled maintenance begins in ${timeUntil}`,
    category: NOTIFICATION_CATEGORIES.SYSTEM,
  },
  NEW_FEATURE: {
    title: 'New Feature Available',
    body: (featureName: string) => `Check out our new feature: ${featureName}`,
    category: NOTIFICATION_CATEGORIES.SYSTEM,
  },
  SECURITY_ALERT: {
    title: 'Security Alert',
    body: (location: string) => `New login detected from ${location}`,
    category: NOTIFICATION_CATEGORIES.SYSTEM,
  },
  VERSION_UPDATE: {
    title: 'App Update Available',
    body: 'A new version of Opindex Wallet is available. Update now for the latest features.',
    category: NOTIFICATION_CATEGORIES.SYSTEM,
  },

  // Marketing notifications
  WEEKLY_SUMMARY: {
    title: 'Weekly Portfolio Summary',
    body: (performance: string) => `Your portfolio is ${performance} this week. View details inside.`,
    category: NOTIFICATION_CATEGORIES.MARKETING,
  },
  FEATURE_TIP: {
    title: 'Pro Tip',
    body: (tip: string) => tip,
    category: NOTIFICATION_CATEGORIES.MARKETING,
  },
  COMMUNITY_UPDATE: {
    title: 'Community Update',
    body: 'Join our growing community! Check out the latest discussions.',
    category: NOTIFICATION_CATEGORIES.MARKETING,
  },
};

// Helper function to create notification content
export const createNotificationContent = (
  template: keyof typeof NOTIFICATION_TEMPLATES,
  ...args: any[]
): { title: string; body: string; categoryId: string } => {
  const notificationTemplate = NOTIFICATION_TEMPLATES[template];
  
  return {
    title: notificationTemplate.title,
    body: typeof notificationTemplate.body === 'function' 
      ? notificationTemplate.body(...args)
      : notificationTemplate.body,
    categoryId: notificationTemplate.category,
  };
};

// Notification sound configurations
export const NOTIFICATION_SOUNDS = {
  TRANSACTION: 'success.wav',
  PRICE_ALERT: 'alert.wav',
  SYSTEM: 'default',
  MARKETING: 'gentle.wav',
} as const;

// Notification priority levels
export const NOTIFICATION_PRIORITY = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
} as const;

export default {
  DEFAULT_NOTIFICATION_PREFERENCES,
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_ACTIONS,
  configureNotificationCategories,
  NOTIFICATION_TEMPLATES,
  createNotificationContent,
  NOTIFICATION_SOUNDS,
  NOTIFICATION_PRIORITY,
};