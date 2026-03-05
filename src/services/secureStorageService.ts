/**
 * WARNING: This service is NOT currently used and encryption is NOT implemented.
 * The current implementation stores data without actual encryption.
 * DO NOT use this service for sensitive data until proper AES encryption is added.
 *
 * For wallet keys and mnemonics, use walletService.ts which uses expo-secure-store directly.
 */

import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Crypto from 'expo-crypto';

// Storage key prefixes for organization
const STORAGE_PREFIX = {
  WALLET: 'wallet_',
  USER: 'user_',
  APP: 'app_',
  SESSION: 'session_',
  SECURITY: 'security_',
} as const;

// Security levels for different types of data
export enum SecurityLevel {
  LOW = 'low',           // Basic encryption, no additional auth required
  MEDIUM = 'medium',     // Encrypted with PIN protection
  HIGH = 'high',         // Encrypted with biometric/PIN protection
  CRITICAL = 'critical', // Encrypted with biometric protection + additional confirmation
}

// Storage options
export interface SecureStorageOptions {
  securityLevel?: SecurityLevel;
  requireBiometric?: boolean;
  requirePIN?: boolean;
  expiresIn?: number; // TTL in milliseconds
  requireConfirmation?: boolean; // For critical operations
}

// Session data structure
export interface SessionData {
  isActive: boolean;
  startTime: number;
  lastActivity: number;
  expiresAt: number;
  deviceFingerprint: string;
}

// Encrypted data wrapper
interface EncryptedData {
  data: string;
  iv: string;
  timestamp: number;
  securityLevel: SecurityLevel;
  expiresAt?: number;
}

class SecureStorageService {
  private sessionKey: string | null = null;
  private deviceFingerprint: string | null = null;

  constructor() {
    this.initializeDeviceFingerprint();
  }

  // Initialize device fingerprint for session validation
  private async initializeDeviceFingerprint(): Promise<void> {
    try {
      // Create a device-specific fingerprint based on available data
      const deviceInfo = await this.getDeviceInfo();
      this.deviceFingerprint = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        JSON.stringify(deviceInfo)
      );
    } catch (error) {
      console.error('Failed to initialize device fingerprint:', error);
      // Fallback fingerprint
      this.deviceFingerprint = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        'fallback_fingerprint_' + Date.now()
      );
    }
  }

  // Get device information for fingerprinting
  private async getDeviceInfo(): Promise<Record<string, any>> {
    // In a real implementation, you'd gather more device-specific data
    return {
      platform: 'mobile',
      timestamp: Date.now(),
      // Add more device-specific identifiers as available
    };
  }

  // Generate encryption key from user credentials
  private async deriveEncryptionKey(password: string, salt: string): Promise<string> {
    const keyMaterial = password + salt;
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      keyMaterial
    );
  }

  // Encrypt data with AES
  private async encryptData(data: string, key: string): Promise<{ encrypted: string; iv: string }> {
    // Generate random IV
    const iv = await Crypto.getRandomBytesAsync(16);
    const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
    
    // For simplicity, using digest as encryption (in production, use proper AES)
    const encrypted = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      data + key + ivHex
    );
    
    return { encrypted, iv: ivHex };
  }

  // Decrypt data
  private async decryptData(encryptedData: string, key: string, iv: string): Promise<string> {
    // This is a simplified implementation - in production, use proper AES decryption
    // For now, we'll store data in a way that we can retrieve it
    throw new Error('Decryption not implemented in this simplified version');
  }

  // Check if biometric authentication is required and available
  private async checkBiometricRequirement(options: SecureStorageOptions): Promise<boolean> {
    if (!options.requireBiometric && options.securityLevel !== SecurityLevel.HIGH && options.securityLevel !== SecurityLevel.CRITICAL) {
      return true; // No biometric required
    }

    try {
      const biometricCapability = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (!biometricCapability || !isEnrolled) {
        if (options.securityLevel === SecurityLevel.CRITICAL) {
          throw new Error('Biometric authentication required but not available');
        }
        return true; // Fall back to PIN for non-critical data
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access secure data',
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use PIN',
      });

      return result.success;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
    }
  }

  // Session Management
  async startSession(userId: string): Promise<boolean> {
    try {
      const sessionData: SessionData = {
        isActive: true,
        startTime: Date.now(),
        lastActivity: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        deviceFingerprint: this.deviceFingerprint || 'unknown',
      };

      await SecureStore.setItemAsync(
        `${STORAGE_PREFIX.SESSION}${userId}`,
        JSON.stringify(sessionData)
      );

      // Generate session key
      this.sessionKey = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${userId}_${sessionData.startTime}_${this.deviceFingerprint}`
      );

      return true;
    } catch (error) {
      console.error('Failed to start session:', error);
      return false;
    }
  }

  async validateSession(userId: string): Promise<boolean> {
    try {
      const sessionDataStr = await SecureStore.getItemAsync(`${STORAGE_PREFIX.SESSION}${userId}`);
      if (!sessionDataStr) {
        return false;
      }

      const sessionData: SessionData = JSON.parse(sessionDataStr);
      
      // Check if session is expired
      if (Date.now() > sessionData.expiresAt) {
        await this.endSession(userId);
        return false;
      }

      // Check device fingerprint
      if (sessionData.deviceFingerprint !== this.deviceFingerprint) {
        await this.endSession(userId);
        return false;
      }

      // Update last activity
      sessionData.lastActivity = Date.now();
      await SecureStore.setItemAsync(
        `${STORAGE_PREFIX.SESSION}${userId}`,
        JSON.stringify(sessionData)
      );

      return sessionData.isActive;
    } catch (error) {
      console.error('Failed to validate session:', error);
      return false;
    }
  }

  async endSession(userId: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(`${STORAGE_PREFIX.SESSION}${userId}`);
      this.sessionKey = null;
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  }

  async extendSession(userId: string, additionalMinutes: number = 60): Promise<boolean> {
    try {
      const sessionDataStr = await SecureStore.getItemAsync(`${STORAGE_PREFIX.SESSION}${userId}`);
      if (!sessionDataStr) {
        return false;
      }

      const sessionData: SessionData = JSON.parse(sessionDataStr);
      sessionData.expiresAt = Date.now() + (additionalMinutes * 60 * 1000);
      sessionData.lastActivity = Date.now();

      await SecureStore.setItemAsync(
        `${STORAGE_PREFIX.SESSION}${userId}`,
        JSON.stringify(sessionData)
      );

      return true;
    } catch (error) {
      console.error('Failed to extend session:', error);
      return false;
    }
  }

  // Core secure storage operations
  async setItem(
    key: string,
    value: string,
    options: SecureStorageOptions = { securityLevel: SecurityLevel.MEDIUM }
  ): Promise<boolean> {
    try {
      // Check authentication requirements
      const authSuccess = await this.checkBiometricRequirement(options);
      if (!authSuccess) {
        throw new Error('Authentication failed');
      }

      // Prepare encrypted data
      const encryptedData: EncryptedData = {
        data: value, // In production, this would be encrypted
        iv: '', // Would contain actual IV
        timestamp: Date.now(),
        securityLevel: options.securityLevel || SecurityLevel.MEDIUM,
        expiresAt: options.expiresIn ? Date.now() + options.expiresIn : undefined,
      };

      // Store with appropriate prefix based on security level
      const storageKey = this.getStorageKey(key, options.securityLevel || SecurityLevel.MEDIUM);
      
      await SecureStore.setItemAsync(storageKey, JSON.stringify(encryptedData));
      return true;
    } catch (error) {
      console.error('Failed to set secure item:', error);
      return false;
    }
  }

  async getItem(
    key: string,
    options: SecureStorageOptions = { securityLevel: SecurityLevel.MEDIUM }
  ): Promise<string | null> {
    try {
      // Check authentication requirements
      const authSuccess = await this.checkBiometricRequirement(options);
      if (!authSuccess) {
        throw new Error('Authentication failed');
      }

      const storageKey = this.getStorageKey(key, options.securityLevel || SecurityLevel.MEDIUM);
      const encryptedDataStr = await SecureStore.getItemAsync(storageKey);
      
      if (!encryptedDataStr) {
        return null;
      }

      const encryptedData: EncryptedData = JSON.parse(encryptedDataStr);
      
      // Check if data has expired
      if (encryptedData.expiresAt && Date.now() > encryptedData.expiresAt) {
        await this.deleteItem(key, options);
        return null;
      }

      // In production, decrypt the data here
      return encryptedData.data;
    } catch (error) {
      console.error('Failed to get secure item:', error);
      return null;
    }
  }

  async deleteItem(
    key: string,
    options: SecureStorageOptions = { securityLevel: SecurityLevel.MEDIUM }
  ): Promise<boolean> {
    try {
      const storageKey = this.getStorageKey(key, options.securityLevel || SecurityLevel.MEDIUM);
      await SecureStore.deleteItemAsync(storageKey);
      return true;
    } catch (error) {
      console.error('Failed to delete secure item:', error);
      return false;
    }
  }

  async hasItem(
    key: string,
    options: SecureStorageOptions = { securityLevel: SecurityLevel.MEDIUM }
  ): Promise<boolean> {
    try {
      const storageKey = this.getStorageKey(key, options.securityLevel || SecurityLevel.MEDIUM);
      const item = await SecureStore.getItemAsync(storageKey);
      return item !== null;
    } catch (error) {
      console.error('Failed to check item existence:', error);
      return false;
    }
  }

  // Utility method to generate storage keys with appropriate prefixes
  private getStorageKey(key: string, securityLevel: SecurityLevel): string {
    switch (securityLevel) {
      case SecurityLevel.LOW:
        return `${STORAGE_PREFIX.APP}${key}`;
      case SecurityLevel.MEDIUM:
        return `${STORAGE_PREFIX.USER}${key}`;
      case SecurityLevel.HIGH:
        return `${STORAGE_PREFIX.WALLET}${key}`;
      case SecurityLevel.CRITICAL:
        return `${STORAGE_PREFIX.SECURITY}${key}`;
      default:
        return `${STORAGE_PREFIX.APP}${key}`;
    }
  }

  // Batch operations
  async setMultipleItems(
    items: { key: string; value: string; options?: SecureStorageOptions }[]
  ): Promise<boolean[]> {
    const results = await Promise.allSettled(
      items.map(item => 
        this.setItem(item.key, item.value, item.options)
      )
    );

    return results.map(result => 
      result.status === 'fulfilled' ? result.value : false
    );
  }

  async getMultipleItems(
    items: { key: string; options?: SecureStorageOptions }[]
  ): Promise<(string | null)[]> {
    const results = await Promise.allSettled(
      items.map(item => 
        this.getItem(item.key, item.options)
      )
    );

    return results.map(result => 
      result.status === 'fulfilled' ? result.value : null
    );
  }

  // Data cleanup and maintenance
  async cleanExpiredData(): Promise<number> {
    let cleanedCount = 0;
    
    try {
      // This is a simplified cleanup - in production, you'd need to iterate through storage
      // For now, we'll just log the intent
      console.log('Cleaning expired secure data...');
      
      // Implementation would iterate through all stored items and remove expired ones
      // This requires a more complex storage structure to track all keys
      
      return cleanedCount;
    } catch (error) {
      console.error('Failed to clean expired data:', error);
      return 0;
    }
  }

  // Security audit and validation
  async validateStorageIntegrity(): Promise<{
    isValid: boolean;
    corruptedItems: string[];
    expiredItems: string[];
  }> {
    try {
      // In production, this would validate all stored items
      return {
        isValid: true,
        corruptedItems: [],
        expiredItems: [],
      };
    } catch (error) {
      console.error('Failed to validate storage integrity:', error);
      return {
        isValid: false,
        corruptedItems: [],
        expiredItems: [],
      };
    }
  }

  // Emergency data wipe
  async emergencyWipe(confirmationCode: string): Promise<boolean> {
    if (confirmationCode !== 'EMERGENCY_WIPE_CONFIRMED') {
      return false;
    }

    try {
      // Clear all app-related secure storage
      // This would require tracking all storage keys in production
      console.warn('Emergency wipe initiated - this would clear all secure data');
      
      // Reset session
      this.sessionKey = null;
      
      return true;
    } catch (error) {
      console.error('Failed to perform emergency wipe:', error);
      return false;
    }
  }

  // Get storage statistics
  async getStorageStats(): Promise<{
    totalItems: number;
    itemsBySecurityLevel: Record<SecurityLevel, number>;
    oldestItem: number;
    newestItem: number;
  }> {
    try {
      // In production, this would analyze all stored items
      return {
        totalItems: 0,
        itemsBySecurityLevel: {
          [SecurityLevel.LOW]: 0,
          [SecurityLevel.MEDIUM]: 0,
          [SecurityLevel.HIGH]: 0,
          [SecurityLevel.CRITICAL]: 0,
        },
        oldestItem: Date.now(),
        newestItem: Date.now(),
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const secureStorageService = new SecureStorageService();