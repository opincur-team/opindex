import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { Linking } from 'react-native';

/**
 * Opens a URL in an in-app browser (native) or external browser (web)
 * @param url - The URL to open
 */
export const openUrl = async (url: string) => {
  try {
    if (process.env.EXPO_OS !== 'web') {
      // Use in-app browser on native (iOS/Android)
      await openBrowserAsync(url, {
        presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
      });
    } else {
      // Use external browser on web
      await Linking.openURL(url);
    }
  } catch (error) {
    console.error('Failed to open URL:', error);
    // Fallback to Linking
    try {
      await Linking.openURL(url);
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
    }
  }
};

/**
 * Opens a Solscan token page in an in-app browser (native) or external browser (web)
 * @param mintAddress - The Solana token mint address
 */
export const openSolscanToken = async (mintAddress: string) => {
  const url = `https://solscan.io/token/${mintAddress}`;

  try {
    if (process.env.EXPO_OS !== 'web') {
      // Use in-app browser on native (iOS/Android)
      await openBrowserAsync(url, {
        presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
      });
    } else {
      // Use external browser on web
      await Linking.openURL(url);
    }
  } catch (error) {
    console.error('Failed to open Solscan:', error);
    // Fallback to Linking
    try {
      await Linking.openURL(url);
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
    }
  }
};
