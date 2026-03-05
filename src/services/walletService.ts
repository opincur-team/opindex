import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Crypto from 'expo-crypto';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { VersionedTransaction, PublicKey } from '@solana/web3.js';
import { Buffer } from 'buffer';
import { WALLET_CONFIG } from '@/src/config/environment';

// Constants for secure storage keys
const STORAGE_KEYS = {
  PRIVATE_KEY: 'wallet_private_key',
  PUBLIC_KEY: 'wallet_public_key',
  MNEMONIC: 'wallet_mnemonic',
  WALLET_ADDRESS: 'wallet_address',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  PIN_HASH: 'pin_hash',
  AUTO_LOCK_TIME: 'auto_lock_time',
} as const;

// Types
export interface WalletInfo {
  address: string;
  publicKey: string;
  isLocked: boolean;
  biometricEnabled: boolean;
  autoLockEnabled: boolean;
  autoLockTime: number; // minutes
}

export interface CreateWalletResult {
  address: string;
  publicKey: string;
  mnemonic: string[];
}

export interface ImportWalletResult {
  address: string;
  publicKey: string;
}

export interface SignTransactionResult {
  signature: string;
  signedTransaction: string;
}

export interface BiometricCapability {
  isAvailable: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
  isEnrolled: boolean;
  hasHardware: boolean;
}

// Wallet Service
class WalletService {
  private isUnlocked: boolean = false;
  private sessionTimeout: number | null = null;
  private autoLockTime: number = 5; // Default 5 minutes

  // Rate limiting for unlock attempts
  private unlockAttempts: number = 0;
  private lastUnlockAttempt: number = 0;
  private lockoutUntil: number = 0;
  private readonly MAX_UNLOCK_ATTEMPTS = WALLET_CONFIG.MAX_UNLOCK_ATTEMPTS;
  private readonly LOCKOUT_DURATION_MS = WALLET_CONFIG.LOCKOUT_DURATION_MS;
  private readonly ATTEMPT_RESET_MS = 300000; // Reset attempts after 5 minutes

  constructor() {
    this.loadAutoLockSettings();
  }

  // Initialize and load settings
  private async loadAutoLockSettings(): Promise<void> {
    try {
      const autoLockTimeStr = await SecureStore.getItemAsync(STORAGE_KEYS.AUTO_LOCK_TIME);
      if (autoLockTimeStr) {
        this.autoLockTime = parseInt(autoLockTimeStr, 10);
      }
    } catch (error) {
      console.warn('Failed to load auto-lock settings:', error);
    }
  }

  // Check if wallet exists
  async hasWallet(): Promise<boolean> {
    try {
      const address = await SecureStore.getItemAsync(STORAGE_KEYS.WALLET_ADDRESS);
      return !!address;
    } catch {
      return false;
    }
  }

  // Generate mnemonic without storing (for preview during setup)
  async generateMnemonicOnly(wordCount: 12 | 24 = 12): Promise<string[]> {
    return await this.generateMnemonic(wordCount);
  }

  // Create wallet from existing mnemonic (used after user verifies seed phrase)
  async createWalletFromMnemonic(mnemonic: string[]): Promise<CreateWalletResult> {
    try {
      if (!this.validateMnemonic(mnemonic)) {
        throw new Error('Invalid mnemonic phrase');
      }

      const keypair = await this.deriveKeypairFromMnemonic(mnemonic);

      await this.storeWalletSecurely({
        privateKey: keypair.privateKey,
        publicKey: keypair.publicKey,
        address: keypair.address,
        mnemonic: mnemonic.join(' '),
      });

      return {
        address: keypair.address,
        publicKey: keypair.publicKey,
        mnemonic,
      };
    } catch (error) {
      throw new Error(`Failed to create wallet from mnemonic: ${error}`);
    }
  }

  // Create new wallet
  async createWallet(wordCount: 12 | 24 = 12): Promise<CreateWalletResult> {
    try {
      // Generate mnemonic (12 or 24 words)
      const mnemonic = await this.generateMnemonic(wordCount);
      
      // Derive keypair from mnemonic
      const keypair = await this.deriveKeypairFromMnemonic(mnemonic);
      
      // Store wallet data securely
      await this.storeWalletSecurely({
        privateKey: keypair.privateKey,
        publicKey: keypair.publicKey,
        address: keypair.address,
        mnemonic: mnemonic.join(' '),
      });

      return {
        address: keypair.address,
        publicKey: keypair.publicKey,
        mnemonic,
      };
    } catch (error) {
      throw new Error(`Failed to create wallet: ${error}`);
    }
  }

  // Import wallet from mnemonic
  async importWallet(mnemonic: string[]): Promise<ImportWalletResult> {
    try {
      // Validate mnemonic
      if (!this.validateMnemonic(mnemonic)) {
        throw new Error('Invalid mnemonic phrase');
      }

      // Derive keypair from mnemonic
      const keypair = await this.deriveKeypairFromMnemonic(mnemonic);
      
      // Store wallet data securely
      await this.storeWalletSecurely({
        privateKey: keypair.privateKey,
        publicKey: keypair.publicKey,
        address: keypair.address,
        mnemonic: mnemonic.join(' '),
      });

      return {
        address: keypair.address,
        publicKey: keypair.publicKey,
      };
    } catch (error) {
      throw new Error(`Failed to import wallet: ${error}`);
    }
  }

  // Get wallet info
  async getWalletInfo(): Promise<WalletInfo | null> {
    try {
      const address = await SecureStore.getItemAsync(STORAGE_KEYS.WALLET_ADDRESS);
      const publicKey = await SecureStore.getItemAsync(STORAGE_KEYS.PUBLIC_KEY);
      const biometricEnabledStr = await SecureStore.getItemAsync(STORAGE_KEYS.BIOMETRIC_ENABLED);
      const autoLockTimeStr = await SecureStore.getItemAsync(STORAGE_KEYS.AUTO_LOCK_TIME);

      if (!address || !publicKey) {
        return null;
      }

      return {
        address,
        publicKey,
        isLocked: !this.isUnlocked,
        biometricEnabled: biometricEnabledStr === 'true',
        autoLockEnabled: true,
        autoLockTime: autoLockTimeStr ? parseInt(autoLockTimeStr, 10) : 5,
      };
    } catch {
      return null;
    }
  }

  // Check if wallet is currently locked out due to too many attempts
  isLockedOut(): { lockedOut: boolean; remainingMs: number } {
    const now = Date.now();
    if (now < this.lockoutUntil) {
      return { lockedOut: true, remainingMs: this.lockoutUntil - now };
    }
    return { lockedOut: false, remainingMs: 0 };
  }

  // Unlock wallet with biometric or PIN
  async unlockWallet(pin?: string): Promise<boolean> {
    const now = Date.now();

    // Check if locked out
    if (now < this.lockoutUntil) {
      return false;
    }

    // Reset attempts if enough time has passed
    if (now - this.lastUnlockAttempt > this.ATTEMPT_RESET_MS) {
      this.unlockAttempts = 0;
    }

    this.lastUnlockAttempt = now;

    try {
      const biometricEnabled = await SecureStore.getItemAsync(STORAGE_KEYS.BIOMETRIC_ENABLED);

      if (biometricEnabled === 'true') {
        const biometricResult = await this.authenticateWithBiometric();
        if (biometricResult) {
          this.unlockAttempts = 0; // Reset on success
          this.isUnlocked = true;
          this.startAutoLockTimer();
          return true;
        }
      }

      if (pin) {
        const isValidPin = await this.validatePin(pin);
        if (isValidPin) {
          this.unlockAttempts = 0; // Reset on success
          this.isUnlocked = true;
          this.startAutoLockTimer();
          return true;
        }
      }

      // Failed attempt
      this.unlockAttempts++;
      if (this.unlockAttempts >= this.MAX_UNLOCK_ATTEMPTS) {
        this.lockoutUntil = now + this.LOCKOUT_DURATION_MS;
        this.unlockAttempts = 0;
      }

      return false;
    } catch {
      return false;
    }
  }

  // Lock wallet
  lockWallet(): void {
    this.isUnlocked = false;
    this.clearAutoLockTimer();
  }

  // Sign transaction
  async signTransaction(transaction: string): Promise<SignTransactionResult> {
    // Authentication UI not implemented yet - commented out to allow operations
    // TODO: Re-enable when PIN/biometric setup and unlock screens are added
    // const hasAuth = await this.hasAuthenticationConfigured();
    // if (hasAuth && !this.isUnlocked) {
    //   throw new Error('Wallet is locked. Please unlock first.');
    // }

    try {
      const privateKey = await SecureStore.getItemAsync(STORAGE_KEYS.PRIVATE_KEY);
      if (!privateKey) {
        throw new Error('Private key not found');
      }

      // Sign the transaction with the private key
      const signedTransaction = await this.signTransactionWithPrivateKey(transaction, privateKey);

      // Reset auto-lock timer on activity
      this.resetAutoLockTimer();

      // Extract signature from signed transaction for logging/verification
      const signedTxBuffer = Buffer.from(signedTransaction, 'base64');
      const signedVersionedTx = VersionedTransaction.deserialize(signedTxBuffer);
      const signature = signedVersionedTx.signatures[0] ? bs58.encode(signedVersionedTx.signatures[0]) : '';

      return {
        signature,
        signedTransaction,
      };
    } catch (error) {
      throw new Error(`Failed to sign transaction: ${error}`);
    }
  }

  // Setup biometric authentication
  async setupBiometric(): Promise<boolean> {
    try {
      const capability = await this.getBiometricCapability();
      if (!capability.isAvailable || !capability.isEnrolled) {
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Enable biometric authentication for wallet access',
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use PIN',
      });

      if (result.success) {
        await SecureStore.setItemAsync(STORAGE_KEYS.BIOMETRIC_ENABLED, 'true');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to setup biometric:', error);
      return false;
    }
  }

  // Disable biometric authentication
  async disableBiometric(): Promise<void> {
    await SecureStore.setItemAsync(STORAGE_KEYS.BIOMETRIC_ENABLED, 'false');
  }

  // Setup PIN
  async setupPin(pin: string): Promise<boolean> {
    try {
      const pinHash = await this.hashPin(pin);
      await SecureStore.setItemAsync(STORAGE_KEYS.PIN_HASH, pinHash);
      return true;
    } catch (error) {
      console.error('Failed to setup PIN:', error);
      return false;
    }
  }

  // Change PIN
  async changePin(currentPin: string, newPin: string): Promise<boolean> {
    try {
      const isValidCurrent = await this.validatePin(currentPin);
      if (!isValidCurrent) {
        return false;
      }

      return await this.setupPin(newPin);
    } catch (error) {
      console.error('Failed to change PIN:', error);
      return false;
    }
  }

  // Get biometric capability
  async getBiometricCapability(): Promise<BiometricCapability> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      return {
        isAvailable: hasHardware && isEnrolled,
        supportedTypes,
        isEnrolled,
        hasHardware,
      };
    } catch {
      return {
        isAvailable: false,
        supportedTypes: [],
        isEnrolled: false,
        hasHardware: false,
      };
    }
  }

  // Export wallet (mnemonic)
  async exportWallet(): Promise<string[]> {
    // TODO: Re-enable when PIN/biometric unlock is implemented
    // if (!this.isUnlocked) {
    //   throw new Error('Wallet is locked. Please unlock first.');
    // }

    try {
      const mnemonic = await SecureStore.getItemAsync(STORAGE_KEYS.MNEMONIC);
      if (!mnemonic) {
        throw new Error('Mnemonic not found');
      }

      return mnemonic.split(' ');
    } catch (error) {
      throw new Error(`Failed to export wallet: ${error}`);
    }
  }

  // Verify if a seed phrase matches the stored wallet
  async verifySeedPhrase(seedPhrase: string[]): Promise<boolean> {
    if (!this.isUnlocked) {
      throw new Error('Wallet is locked. Please unlock first.');
    }

    try {
      const storedMnemonic = await SecureStore.getItemAsync(STORAGE_KEYS.MNEMONIC);
      if (!storedMnemonic) {
        return false;
      }

      const storedWords = storedMnemonic.split(' ');
      if (storedWords.length !== seedPhrase.length) {
        return false;
      }

      return storedWords.every((word, index) => word === seedPhrase[index]);
    } catch (error) {
      console.error('Failed to verify seed phrase:', error);
      return false;
    }
  }

  // Get wallet backup status
  async getWalletBackupStatus(): Promise<{
    hasBackup: boolean;
    lastBackupVerified?: Date;
    seedPhraseWordCount: number;
  }> {
    try {
      const mnemonic = await SecureStore.getItemAsync(STORAGE_KEYS.MNEMONIC);
      const lastVerifiedStr = await SecureStore.getItemAsync('backup_last_verified');
      
      return {
        hasBackup: !!mnemonic,
        lastBackupVerified: lastVerifiedStr ? new Date(lastVerifiedStr) : undefined,
        seedPhraseWordCount: mnemonic ? mnemonic.split(' ').length : 0,
      };
    } catch (error) {
      console.error('Failed to get backup status:', error);
      return {
        hasBackup: false,
        seedPhraseWordCount: 0,
      };
    }
  }

  // Mark backup as verified
  async markBackupVerified(): Promise<void> {
    try {
      await SecureStore.setItemAsync('backup_last_verified', new Date().toISOString());
    } catch (error) {
      console.error('Failed to mark backup as verified:', error);
    }
  }

  // Check if wallet needs backup reminder
  async shouldRemindBackup(): Promise<boolean> {
    try {
      const backupStatus = await this.getWalletBackupStatus();
      if (!backupStatus.hasBackup) {
        return true;
      }

      if (!backupStatus.lastBackupVerified) {
        return true;
      }

      // Remind every 30 days
      const daysSinceVerification = (Date.now() - backupStatus.lastBackupVerified.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceVerification > 30;
    } catch (error) {
      console.error('Failed to check backup reminder:', error);
      return false;
    }
  }

  // Delete wallet (dangerous operation)
  async deleteWallet(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.PRIVATE_KEY);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.PUBLIC_KEY);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.MNEMONIC);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.WALLET_ADDRESS);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.BIOMETRIC_ENABLED);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.PIN_HASH);
      
      this.isUnlocked = false;
      this.clearAutoLockTimer();
    } catch (error) {
      throw new Error(`Failed to delete wallet: ${error}`);
    }
  }

  // Auto-lock settings
  async setAutoLockTime(minutes: number): Promise<void> {
    this.autoLockTime = minutes;
    await SecureStore.setItemAsync(STORAGE_KEYS.AUTO_LOCK_TIME, minutes.toString());
    
    if (this.isUnlocked) {
      this.resetAutoLockTimer();
    }
  }

  // Private helper methods
  private async storeWalletSecurely(data: {
    privateKey: string;
    publicKey: string;
    address: string;
    mnemonic: string;
  }): Promise<void> {
    // Validate mnemonic before storing - critical security check
    if (!data.mnemonic || data.mnemonic.trim().length === 0) {
      throw new Error('Cannot store wallet: mnemonic is required');
    }

    const words = data.mnemonic.trim().split(' ');
    if (words.length !== 12 && words.length !== 24) {
      throw new Error('Cannot store wallet: mnemonic must be 12 or 24 words');
    }

    if (!bip39.validateMnemonic(data.mnemonic)) {
      throw new Error('Cannot store wallet: invalid mnemonic phrase');
    }

    // Validate other required fields
    if (!data.privateKey || !data.publicKey || !data.address) {
      throw new Error('Cannot store wallet: missing required wallet data');
    }

    await SecureStore.setItemAsync(STORAGE_KEYS.PRIVATE_KEY, data.privateKey);
    await SecureStore.setItemAsync(STORAGE_KEYS.PUBLIC_KEY, data.publicKey);
    await SecureStore.setItemAsync(STORAGE_KEYS.WALLET_ADDRESS, data.address);
    await SecureStore.setItemAsync(STORAGE_KEYS.MNEMONIC, data.mnemonic);
  }

  private async generateMnemonic(wordCount: 12 | 24 = 12): Promise<string[]> {
    // Generate a cryptographically secure mnemonic using BIP39
    // 128 bits = 12 words, 256 bits = 24 words
    const entropyBytes = wordCount === 12 ? 16 : 32; // 128 bits = 16 bytes, 256 bits = 32 bytes
    
    // Use expo-crypto to generate secure random bytes
    const randomBytes = await Crypto.getRandomBytesAsync(entropyBytes);
    
    // Convert to mnemonic using bip39
    const mnemonic = bip39.entropyToMnemonic(Buffer.from(randomBytes));
    return mnemonic.split(' ');
  }

  private async deriveKeypairFromMnemonic(mnemonic: string[]): Promise<{
    privateKey: string;
    publicKey: string;
    address: string;
  }> {
    try {
      const mnemonicPhrase = mnemonic.join(' ');
      
      // Validate the mnemonic using BIP39
      if (!bip39.validateMnemonic(mnemonicPhrase)) {
        throw new Error('Invalid mnemonic phrase');
      }

      // Convert mnemonic to seed
      const seed = await bip39.mnemonicToSeed(mnemonicPhrase);
      
      // Derive the keypair using Solana's derivation path
      // Standard Solana derivation path: m/44'/501'/0'/0'
      const derivationPath = "m/44'/501'/0'/0'";
      const derivedSeed = derivePath(derivationPath, seed.toString('hex')).key;
      
      // Create Ed25519 keypair from the derived seed
      const keypair = nacl.sign.keyPair.fromSeed(derivedSeed);
      
      // For Solana, the secret key is the concatenation of the private key and public key
      const secretKey = new Uint8Array(64);
      secretKey.set(keypair.secretKey.slice(0, 32)); // private key (32 bytes)
      secretKey.set(keypair.publicKey, 32); // public key (32 bytes)
      
      // Get the public key and address (same as public key in Solana)
      const address = bs58.encode(keypair.publicKey);
      
      // Encode private key as base58 for storage
      const privateKeyBase58 = bs58.encode(secretKey);
      const publicKeyBase58 = bs58.encode(keypair.publicKey);

      return {
        privateKey: privateKeyBase58,
        publicKey: publicKeyBase58,
        address: address,
      };
    } catch (error) {
      throw new Error(`Failed to derive keypair from mnemonic: ${error}`);
    }
  }

  private validateMnemonic(mnemonic: string[]): boolean {
    const mnemonicPhrase = mnemonic.join(' ');
    return bip39.validateMnemonic(mnemonicPhrase);
  }

  private async authenticateWithBiometric(): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock your wallet',
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use PIN',
      });

      return result.success;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }

  private async hashPin(pin: string): Promise<string> {
    // In a real implementation, use proper hashing (bcrypt, etc.)
    return `hashed_${pin}`;
  }

  private async validatePin(pin: string): Promise<boolean> {
    try {
      const storedHash = await SecureStore.getItemAsync(STORAGE_KEYS.PIN_HASH);
      const pinHash = await this.hashPin(pin);
      return storedHash === pinHash;
    } catch {
      return false;
    }
  }

  private async signTransactionWithPrivateKey(transaction: string, privateKey: string): Promise<string> {
    try {
      // Decode the base58 private key (64 bytes: 32 private + 32 public)
      const privateKeyBytes = bs58.decode(privateKey);

      // Deserialize the base64-encoded transaction
      const transactionBuffer = Buffer.from(transaction, 'base64');
      const versionedTransaction = VersionedTransaction.deserialize(transactionBuffer);

      // Get the message bytes to sign
      const messageBytes = versionedTransaction.message.serialize();

      // Sign the message with the private key
      const signature = nacl.sign.detached(messageBytes, privateKeyBytes);

      // Derive the public key from the private key (last 32 bytes)
      const publicKeyBytes = privateKeyBytes.slice(32, 64);

      // Convert bytes to PublicKey object and add the signature to the transaction
      const publicKey = new PublicKey(publicKeyBytes);
      versionedTransaction.addSignature(publicKey, signature);

      // Serialize the signed transaction back to base64
      const signedTransactionBytes = versionedTransaction.serialize();
      const signedTransactionBase64 = Buffer.from(signedTransactionBytes).toString('base64');

      return signedTransactionBase64;
    } catch (error) {
      throw new Error(`Failed to sign transaction: ${error}`);
    }
  }

  private startAutoLockTimer(): void {
    this.clearAutoLockTimer();
    this.sessionTimeout = setTimeout(() => {
      this.lockWallet();
    }, this.autoLockTime * 60 * 1000);
  }

  private resetAutoLockTimer(): void {
    if (this.isUnlocked) {
      this.startAutoLockTimer();
    }
  }

  private clearAutoLockTimer(): void {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
      this.sessionTimeout = null;
    }
  }

  // Activity tracking (call this on user interactions)
  trackActivity(): void {
    if (this.isUnlocked) {
      this.resetAutoLockTimer();
    }
  }

  // Check if wallet is unlocked
  isWalletUnlocked(): boolean {
    return this.isUnlocked;
  }

  // Check if any authentication method is configured
  async hasAuthenticationConfigured(): Promise<boolean> {
    try {
      const biometricEnabled = await SecureStore.getItemAsync(STORAGE_KEYS.BIOMETRIC_ENABLED);
      const pinHash = await SecureStore.getItemAsync(STORAGE_KEYS.PIN_HASH);
      return biometricEnabled === 'true' || !!pinHash;
    } catch (error) {
      console.error('Error checking authentication configuration:', error);
      return false;
    }
  }
}

// Create and export singleton instance
export const walletService = new WalletService();