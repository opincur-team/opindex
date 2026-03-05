import React, { useEffect, useState } from 'react';
import { View, ScrollView, Alert, Pressable, StyleSheet, Text as RNText, Switch, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/src/components/ui';
import { walletService, type WalletInfo, type BiometricCapability } from '@/src/services/walletService';
import { formatAddress, copyToClipboard } from '@/src/utils/formatting';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';

export default function WalletDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [biometricCapability, setBiometricCapability] = useState<BiometricCapability | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDisableBiometricConfirm, setShowDisableBiometricConfirm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWalletDetails();
    checkBiometricCapability();
  }, []);

  const loadWalletDetails = async () => {
    try {
      setLoading(true);
      const info = await walletService.getWalletInfo();
      setWalletInfo(info);
    } catch (error) {
      console.error('Failed to load wallet details:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkBiometricCapability = async () => {
    try {
      const capability = await walletService.getBiometricCapability();
      setBiometricCapability(capability);
    } catch (error) {
      console.error('Failed to check biometric capability:', error);
    }
  };

  const handleCopyAddress = async () => {
    if (walletInfo?.address) {
      await copyToClipboard(walletInfo.address, 'Address copied to clipboard');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleCopyPublicKey = async () => {
    if (walletInfo?.publicKey) {
      await copyToClipboard(walletInfo.publicKey, 'Public key copied to clipboard');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleViewSeedPhrase = async () => {
    try {
      if (walletInfo?.isLocked) {
        const unlocked = await walletService.unlockWallet();
        if (!unlocked) {
          Alert.alert('Authentication Required', 'Please unlock your wallet to view seed phrase');
          return;
        }
      }
      
      router.push('/wallet/seed-export');
    } catch (error) {
      Alert.alert('Error', 'Failed to unlock wallet');
    }
  };

  const handleExportPrivateKey = async () => {
    Alert.alert(
      'Export Private Key',
      'This feature will be available in a future update. For now, use the seed phrase backup.',
      [{ text: 'OK' }]
    );
  };

  const handleToggleBiometric = async (enabled: boolean) => {
    if (enabled) {
      // Enable biometric
      if (!biometricCapability?.isAvailable) {
        Alert.alert(
          'Biometric Not Available',
          'Biometric authentication is not available on this device or not set up.',
          [{ text: 'OK' }]
        );
        return;
      }

      try {
        const success = await walletService.setupBiometric();
        if (success) {
          setWalletInfo(prev => prev ? { ...prev, biometricEnabled: true } : null);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Alert.alert('Failed', 'Failed to enable biometric authentication');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to setup biometric authentication');
      }
    } else {
      // Disable biometric - show confirmation
      setShowDisableBiometricConfirm(true);
    }
  };

  const handleDisableBiometric = async () => {
    try {
      await walletService.disableBiometric();
      setWalletInfo(prev => prev ? { ...prev, biometricEnabled: false } : null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert('Error', 'Failed to disable biometric authentication');
    }
  };

  const handleChangePIN = async () => {
    // This would typically show a PIN change modal
    Alert.alert('Change PIN', 'PIN change functionality will be implemented soon');
  };

  const handleAutoLockSettings = async () => {
    // This would show auto-lock configuration
    Alert.alert('Auto-Lock Settings', 'Auto-lock configuration will be implemented soon');
  };

  const handleDeleteWallet = async () => {
    try {
      await walletService.deleteWallet();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Navigate back to onboarding
      router.replace('/(auth)/onboarding');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete wallet. Please try again.');
    }
  };

  const handleBackupVerification = () => {
    router.push('/wallet/backup-verify');
  };

  const getBiometricTypeName = () => {
    if (!biometricCapability?.supportedTypes.length) return 'Biometric';
    
    const types = biometricCapability.supportedTypes;
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'Face ID';
    } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Touch ID';
    }
    return 'Biometric';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{ 
            title: 'Wallet Details',
            headerStyle: { backgroundColor: '#000' },
            headerTintColor: '#fff',
            headerBackTitle: '',
            headerLeft: () => (
              <Pressable onPress={() => router.back()} style={styles.headerButton}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </Pressable>
            )
          }} 
        />
        <View style={styles.loadingContainer}>
          <RNText style={styles.loadingText}>Loading wallet details...</RNText>
        </View>
      </SafeAreaView>
    );
  }

  if (!walletInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{ 
            title: 'Wallet Details',
            headerStyle: { backgroundColor: '#000' },
            headerTintColor: '#fff',
            headerBackTitle: '',
            headerLeft: () => (
              <Pressable onPress={() => router.back()} style={styles.headerButton}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </Pressable>
            )
          }} 
        />
        <View style={styles.noWalletContainer}>
          <RNText style={styles.noWalletText}>Wallet not found</RNText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Wallet Details',
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: '#fff',
          headerBackTitle: '',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
          )
        }} 
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Wallet Information */}
        <View style={styles.card}>
          <RNText style={styles.cardTitle}>Wallet Information</RNText>
          
          {/* Public Address */}
          <View style={styles.infoSection}>
            <RNText style={styles.infoLabel}>Public Address</RNText>
            <Pressable 
              onPress={handleCopyAddress}
              style={styles.copyableField}
            >
              <RNText style={styles.fieldText}>
                {formatAddress(walletInfo.address, 12)}
              </RNText>
              <Ionicons name="copy-outline" size={18} color="#06EBF1" />
            </Pressable>
          </View>

          {/* Public Key */}
          <View style={styles.infoSection}>
            <RNText style={styles.infoLabel}>Public Key</RNText>
            <Pressable 
              onPress={handleCopyPublicKey}
              style={styles.copyableField}
            >
              <RNText style={styles.fieldText}>
                {formatAddress(walletInfo.publicKey, 12)}
              </RNText>
              <Ionicons name="copy-outline" size={18} color="#06EBF1" />
            </Pressable>
          </View>

          {/* Derivation Path */}
          <View style={styles.infoSection}>
            <RNText style={styles.infoLabel}>Derivation Path</RNText>
            <View style={styles.readOnlyField}>
              <RNText style={styles.fieldText}>
                m/44&apos;/501&apos;/0&apos;/0&apos;
              </RNText>
            </View>
          </View>

          {/* Status */}
          <View style={styles.infoSection}>
            <RNText style={styles.infoLabel}>Status</RNText>
            <View style={styles.statusContainer}>
              <Ionicons 
                name={walletInfo.isLocked ? "lock-closed" : "lock-open"} 
                size={16} 
                color={walletInfo.isLocked ? "#ef4444" : "#22c55e"} 
              />
              <RNText style={styles.statusText}>
                {walletInfo.isLocked ? 'Locked' : 'Unlocked'}
              </RNText>
            </View>
          </View>
        </View>

        {/* Security Settings */}
        <View style={styles.card}>
          <RNText style={styles.cardTitle}>Security Settings</RNText>
          
          {/* Biometric Authentication */}
          <View style={[styles.settingItem, styles.settingItemWithBorder]}>
            <View style={styles.settingLeft}>
              <RNText style={styles.settingTitle}>{getBiometricTypeName()}</RNText>
              <RNText style={styles.settingSubtitle}>
                {biometricCapability?.isAvailable 
                  ? 'Use biometric authentication to unlock wallet' 
                  : 'Biometric authentication not available'
                }
              </RNText>
            </View>
            <Switch
              value={walletInfo.biometricEnabled}
              onValueChange={handleToggleBiometric}
              disabled={!biometricCapability?.isAvailable}
              trackColor={{ false: '#767577', true: '#06EBF1' }}
              thumbColor={walletInfo.biometricEnabled ? '#ffffff' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>

          {/* Auto-Lock */}
          <Pressable 
            onPress={handleAutoLockSettings}
            style={[styles.settingItem, styles.settingItemWithBorder]}
          >
            <View style={styles.settingLeft}>
              <RNText style={styles.settingTitle}>Auto-Lock</RNText>
              <RNText style={styles.settingSubtitle}>
                Currently: {walletInfo.autoLockTime} minutes
              </RNText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </Pressable>

          {/* Change PIN */}
          <Pressable 
            onPress={handleChangePIN}
            style={styles.settingItem}
          >
            <View style={styles.settingLeft}>
              <RNText style={styles.settingTitle}>Change PIN</RNText>
              <RNText style={styles.settingSubtitle}>
                Update your backup PIN code
              </RNText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </Pressable>
        </View>

        {/* Backup & Recovery */}
        <View style={styles.card}>
          <RNText style={styles.cardTitle}>Backup & Recovery</RNText>
          
          <View style={styles.buttonGroup}>
            <Button
              title="View Seed Phrase"
              onPress={handleViewSeedPhrase}
              variant="outline"
              style={styles.backupButton}
            />
            
            <Button
              title="Verify Backup"
              onPress={handleBackupVerification}
              variant="outline"
              style={styles.backupButton}
            />
            
            <Button
              title="Export Private Key"
              onPress={handleExportPrivateKey}
              variant="outline"
              style={styles.backupButton}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerCard}>
          <RNText style={styles.dangerCardTitle}>Danger Zone</RNText>
          
          <Button
            title="Delete Wallet"
            onPress={() => setShowDeleteConfirm(true)}
            variant="outline"
            style={styles.deleteButton}
          />
          
          <RNText style={styles.dangerWarning}>
            ⚠️ This action cannot be undone. Make sure you have backed up your seed phrase.
          </RNText>
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <RNText style={styles.modalTitle}>Delete Wallet</RNText>
            <RNText style={styles.modalMessage}>
              Are you sure you want to delete this wallet? This action cannot be undone. Make sure you have backed up your seed phrase.
            </RNText>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <RNText style={styles.cancelButtonText}>Cancel</RNText>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.deleteConfirmButton]}
                onPress={handleDeleteWallet}
              >
                <RNText style={styles.deleteButtonText}>Delete</RNText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Disable Biometric Confirmation Modal */}
      <Modal
        visible={showDisableBiometricConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDisableBiometricConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <RNText style={styles.modalTitle}>Disable Biometric Authentication</RNText>
            <RNText style={styles.modalMessage}>
              Are you sure you want to disable biometric authentication? You will need to use your PIN to unlock the wallet.
            </RNText>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDisableBiometricConfirm(false)}
              >
                <RNText style={styles.cancelButtonText}>Cancel</RNText>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleDisableBiometric}
              >
                <RNText style={styles.confirmButtonText}>Disable</RNText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  headerButton: {
    marginLeft: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
  },
  noWalletContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noWalletText: {
    color: 'white',
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: 'rgba(23, 23, 23, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoSection: {
    marginBottom: 16,
  },
  infoLabel: {
    color: '#a0a0a0',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  copyableField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  readOnlyField: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  fieldText: {
    color: 'white',
    fontFamily: 'monospace',
    fontSize: 14,
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingItemWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingLeft: {
    flex: 1,
  },
  settingTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    color: '#a0a0a0',
    fontSize: 12,
  },
  buttonGroup: {
    gap: 12,
  },
  backupButton: {
    width: '100%',
  },
  dangerCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  dangerCardTitle: {
    color: '#ef4444',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  deleteButton: {
    width: '100%',
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  dangerWarning: {
    color: '#a0a0a0',
    fontSize: 12,
    marginTop: 12,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: 'rgba(23, 23, 23, 0.95)',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    color: '#a0a0a0',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(60, 60, 60, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  confirmButton: {
    backgroundColor: 'rgba(6, 235, 241, 0.2)',
    borderWidth: 1,
    borderColor: '#06EBF1',
  },
  deleteConfirmButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButtonText: {
    color: '#06EBF1',
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '500',
  },
});