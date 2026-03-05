import { Platform } from 'react-native';

/**
 * Checks if the current device supports native blur effects
 * - iOS: Always supports blur
 * - Android 12+ (API 31+): Supports blur
 * - Android 11 and below: Does not support blur
 * @returns true if blur is supported, false otherwise
 */
export const supportsBlur = (): boolean => {
  if (Platform.OS === 'ios') {
    return true; // iOS always supports blur
  }

  if (Platform.OS === 'android') {
    // Android 12 (API 31) and above support blur reliably
    return Platform.Version >= 31;
  }

  return false; // Web or other platforms
};

/**
 * Gets the current Android API level
 * @returns API level number on Android, null on other platforms
 */
export const getAndroidApiLevel = (): number | null => {
  if (Platform.OS === 'android' && typeof Platform.Version === 'number') {
    return Platform.Version;
  }
  return null;
};

/**
 * Platform constants for convenience
 */
export const PlatformConstants = {
  ANDROID_API_BLUR_SUPPORTED: 31, // Android 12
  isAndroid: Platform.OS === 'android',
  isIOS: Platform.OS === 'ios',
  isWeb: Platform.OS === 'web',
};
