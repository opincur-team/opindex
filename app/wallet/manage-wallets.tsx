import React, { useEffect, useState } from 'react';
import { View, ScrollView, Alert, Pressable, StyleSheet, Text as RNText } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/src/components/ui';
import { walletService, type WalletInfo } from '@/src/services/walletService';
import { useAppStore } from '@/src/stores/appStore';
import { formatAddress, copyToClipboard, formatCurrency } from '@/src/utils/formatting';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

export default function WalletManageScreen() {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [portfolioValue, setPortfolioValue] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { wallet: connectedWallet } = useAppStore();

  useEffect(() => {
    loadWalletInfo();
  }, []);

  const loadWalletInfo = async () => {
    try {
      setLoading(true);
      const info = await walletService.getWalletInfo();
      setWalletInfo(info);
      
      // TODO: Fetch portfolio value from API
      setPortfolioValue(0);
    } catch (error) {
      console.error('Failed to load wallet info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAddress = async () => {
    if (walletInfo?.address) {
      await Clipboard.setStringAsync(walletInfo.address);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleReceive = () => {
    router.push('/wallet/receive');
  };

  const handleSend = () => {
    // TODO: Implement send functionality
    Alert.alert('Send Tokens', 'Send functionality will be implemented soon');
  };

  const handleViewSeedPhrase = async () => {
    if (!walletInfo) return;

    if (walletInfo.isLocked) {
      const unlocked = await walletService.unlockWallet();
      if (!unlocked) {
        Alert.alert('Authentication Required', 'Please unlock your wallet to view seed phrase');
        return;
      }
    }
    
    router.push('/wallet/seed-export');
  };

  const handleAddWallet = () => {
    router.push('/wallet/create');
  };

  const handleImportWallet = () => {
    router.push('/wallet/import');
  };

  const handleWalletDetails = () => {
    router.push('/wallet/details/current');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{ 
            title: 'Wallet Management',
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
          <RNText style={styles.loadingText}>Loading wallet information...</RNText>
        </View>
      </SafeAreaView>
    );
  }

  if (!walletInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{ 
            title: 'Wallet Management',
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
          <RNText style={styles.noWalletText}>No wallet found</RNText>
          <Button 
            title="Create Wallet" 
            onPress={() => router.push('/(auth)/wallet-setup')}
            style={styles.createWalletButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Wallet Management',
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
        {/* Current Wallet Overview Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <RNText style={styles.cardTitle}>Current Wallet</RNText>
            <View style={styles.headerActions}>
              {walletInfo.isLocked && (
                <Ionicons name="lock-closed" size={20} color="#ef4444" style={styles.lockIcon} />
              )}
              <Pressable onPress={handleWalletDetails}>
                <Ionicons name="settings-outline" size={20} color="#ffffff" />
              </Pressable>
            </View>
          </View>

          {/* Wallet Address */}
          <View style={styles.section}>
            <RNText style={styles.sectionLabel}>Wallet Address</RNText>
            <Pressable 
              onPress={handleCopyAddress}
              style={styles.addressContainer}
            >
              <RNText style={styles.addressText}>
                {formatAddress(walletInfo.address)}
              </RNText>
              <Ionicons name="copy-outline" size={18} color="#06EBF1" />
            </Pressable>
          </View>

          {/* Portfolio Value */}
          <View style={styles.portfolioSection}>
            <RNText style={styles.sectionLabel}>Total Portfolio Value</RNText>
            <RNText style={styles.portfolioValue}>
              {formatCurrency(portfolioValue)}
            </RNText>
          </View>

          {/* Quick Actions Row */}
          <View style={styles.quickActionsContainer}>
            <View style={styles.quickActionsRow}>
              <Button
                title="Receive"
                onPress={handleReceive}
                variant="outline"
                style={styles.quickActionButton}
              />
              <Button
                title="Send"
                onPress={handleSend}
                variant="outline"
                style={styles.quickActionButton}
              />
            </View>
            <Button
              title="Backup Seed"
              onPress={handleViewSeedPhrase}
              variant="outline"
              style={styles.backupButton}
            />
          </View>
        </View>

        {/* Wallet Management Actions */}
        <View style={styles.card}>
          <RNText style={styles.cardTitle}>Wallet Management</RNText>
          
          <View style={styles.actionsList}>
            <Pressable
              onPress={handleAddWallet}
              style={styles.actionItem}
            >
              <View style={styles.actionItemContent}>
                <View style={[styles.actionIcon, styles.primaryActionIcon]}>
                  <Ionicons name="add" size={20} color="#06EBF1" />
                </View>
                <View style={styles.actionTextContainer}>
                  <RNText style={styles.actionTitle}>Create Additional Wallet</RNText>
                  <RNText style={styles.actionSubtitle}>
                    Generate new account from same seed
                  </RNText>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </Pressable>

            <Pressable
              onPress={handleImportWallet}
              style={styles.actionItem}
            >
              <View style={styles.actionItemContent}>
                <View style={[styles.actionIcon, styles.secondaryActionIcon]}>
                  <Ionicons name="download-outline" size={20} color="#A40CFF" />
                </View>
                <View style={styles.actionTextContainer}>
                  <RNText style={styles.actionTitle}>Import Wallet</RNText>
                  <RNText style={styles.actionSubtitle}>
                    Import from seed phrase or private key
                  </RNText>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </Pressable>

            <Pressable
              onPress={handleWalletDetails}
              style={styles.actionItem}
            >
              <View style={styles.actionItemContent}>
                <View style={[styles.actionIcon, styles.warningActionIcon]}>
                  <Ionicons name="information-circle-outline" size={20} color="#eab308" />
                </View>
                <View style={styles.actionTextContainer}>
                  <RNText style={styles.actionTitle}>Wallet Details</RNText>
                  <RNText style={styles.actionSubtitle}>
                    View details and security settings
                  </RNText>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </Pressable>
          </View>
        </View>

        {/* Security Status */}
        <View style={styles.card}>
          <RNText style={styles.cardTitle}>Security Status</RNText>
          
          <View style={styles.securityList}>
            <View style={styles.securityItem}>
              <View style={styles.securityItemLeft}>
                <Ionicons 
                  name={walletInfo.biometricEnabled ? "checkmark-circle" : "alert-circle"} 
                  size={20} 
                  color={walletInfo.biometricEnabled ? "#22c55e" : "#ef4444"} 
                />
                <RNText style={styles.securityItemText}>Biometric Authentication</RNText>
              </View>
              <RNText style={styles.securityItemStatus}>
                {walletInfo.biometricEnabled ? 'Enabled' : 'Disabled'}
              </RNText>
            </View>

            <View style={styles.securityItem}>
              <View style={styles.securityItemLeft}>
                <Ionicons 
                  name={walletInfo.autoLockEnabled ? "checkmark-circle" : "alert-circle"} 
                  size={20} 
                  color={walletInfo.autoLockEnabled ? "#22c55e" : "#ef4444"} 
                />
                <RNText style={styles.securityItemText}>Auto-Lock</RNText>
              </View>
              <RNText style={styles.securityItemStatus}>
                {walletInfo.autoLockEnabled ? `${walletInfo.autoLockTime}m` : 'Disabled'}
              </RNText>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 16,
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
    paddingHorizontal: 24,
  },
  noWalletText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  createWalletButton: {
    width: '100%',
  },
  card: {
    backgroundColor: 'rgba(23, 23, 23, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockIcon: {
    marginRight: 8,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    color: '#a0a0a0',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  addressText: {
    color: 'white',
    fontFamily: 'monospace',
    fontSize: 14,
    flex: 1,
  },
  portfolioSection: {
    marginBottom: 24,
  },
  portfolioValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
  },
  quickActionsContainer: {
    gap: 12,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
  },
  backupButton: {
    width: '100%',
  },
  actionsList: {
    marginTop: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 12,
  },
  actionItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  primaryActionIcon: {
    backgroundColor: 'rgba(6, 235, 241, 0.2)',
  },
  secondaryActionIcon: {
    backgroundColor: 'rgba(164, 12, 255, 0.2)',
  },
  warningActionIcon: {
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  actionSubtitle: {
    color: '#a0a0a0',
    fontSize: 12,
  },
  securityList: {
    marginTop: 16,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  securityItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityItemText: {
    color: 'white',
    marginLeft: 12,
    fontSize: 14,
  },
  securityItemStatus: {
    color: '#a0a0a0',
    fontSize: 14,
  },
});
