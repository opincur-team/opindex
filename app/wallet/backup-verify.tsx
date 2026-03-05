import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, StyleSheet, Text as RNText, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/src/components/ui';
import { SeedPhraseVerification } from '@/src/components/common';
import { walletService } from '@/src/services/walletService';
import * as Haptics from 'expo-haptics';

interface BackupStatus {
  hasBackup: boolean;
  lastBackupVerified?: Date;
  seedPhraseWordCount: number;
}

export default function WalletBackupVerificationScreen() {
  const [backupStatus, setBackupStatus] = useState<BackupStatus | null>(null);
  const [verificationStep, setVerificationStep] = useState<'status' | 'verify' | 'complete'>('status');
  const [seedPhrase, setSeedPhrase] = useState<string[]>([]);
  const [verificationWords, setVerificationWords] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBackupStatus();
  }, []);

  const loadBackupStatus = async () => {
    try {
      setLoading(true);
      const status = await walletService.getWalletBackupStatus();
      setBackupStatus(status);
    } catch (error) {
      console.error('Failed to load backup status:', error);
      Alert.alert('Error', 'Failed to load backup status');
    } finally {
      setLoading(false);
    }
  };

  const startVerification = async () => {
    try {
      setLoading(true);
      
      // First authenticate user
      const isUnlocked = await walletService.unlockWallet();
      if (!isUnlocked) {
        Alert.alert('Authentication Required', 'Please unlock your wallet to verify backup');
        return;
      }
      
      // Load seed phrase
      const exportedPhrase = await walletService.exportWallet();
      setSeedPhrase(exportedPhrase);
      
      // Generate random word positions for verification (4 random positions)
      const wordPositions: number[] = [];
      while (wordPositions.length < 4) {
        const randomPos = Math.floor(Math.random() * exportedPhrase.length);
        if (!wordPositions.includes(randomPos)) {
          wordPositions.push(randomPos);
        }
      }
      setVerificationWords(wordPositions.sort((a, b) => a - b));
      
      setVerificationStep('verify');
    } catch (error) {
      console.error('Failed to start verification:', error);
      Alert.alert('Error', 'Failed to start backup verification');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSuccess = async () => {
    try {
      await walletService.markBackupVerified();
      setVerificationStep('complete');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Reload backup status
      await loadBackupStatus();
    } catch (error) {
      console.error('Failed to mark backup as verified:', error);
      Alert.alert('Error', 'Failed to save verification status');
    }
  };

  const getDaysUntilReminder = (): number | null => {
    if (!backupStatus?.lastBackupVerified) return null;
    
    const daysSinceVerification = (Date.now() - backupStatus.lastBackupVerified.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, 30 - daysSinceVerification);
  };

  const getBackupStatusColor = () => {
    const daysUntilReminder = getDaysUntilReminder();
    
    if (!backupStatus?.hasBackup) return 'red';
    if (daysUntilReminder === null || daysUntilReminder < 7) return 'red';
    if (daysUntilReminder < 14) return 'yellow';
    return 'green';
  };

  const getBackupStatusText = () => {
    const daysUntilReminder = getDaysUntilReminder();
    
    if (!backupStatus?.hasBackup) return 'No Backup Found';
    if (daysUntilReminder === null) return 'Never Verified';
    if (daysUntilReminder < 1) return 'Verification Overdue';
    if (daysUntilReminder < 7) return 'Verification Due Soon';
    if (daysUntilReminder < 14) return 'Verification Recommended';
    return 'Backup Verified';
  };

  const renderBackupStatus = () => (
    <View style={styles.sectionContainer}>
      <RNText style={styles.sectionTitle}>
        Backup Status
      </RNText>
      <RNText style={styles.sectionSubtitle}>
        Check and verify your wallet backup
      </RNText>

      {loading ? (
        <View style={styles.loadingContainer}>
          <RNText style={styles.loadingText}>Loading backup status...</RNText>
        </View>
      ) : (
        <>
          {/* Status Card */}
          <View style={[
            styles.statusCard,
            getBackupStatusColor() === 'green' 
              ? styles.statusCardGreen
              : getBackupStatusColor() === 'yellow'
              ? styles.statusCardYellow
              : styles.statusCardRed
          ]}>
            <View style={styles.statusHeader}>
              <Ionicons 
                name={
                  getBackupStatusColor() === 'green' 
                    ? 'shield-checkmark'
                    : getBackupStatusColor() === 'yellow'
                    ? 'warning'
                    : 'alert-circle'
                } 
                size={24} 
                color={
                  getBackupStatusColor() === 'green' 
                    ? '#22c55e'
                    : getBackupStatusColor() === 'yellow'
                    ? '#f59e0b'
                    : '#ef4444'
                } 
              />
              <RNText style={[
                styles.statusTitle,
                getBackupStatusColor() === 'green' 
                  ? styles.statusTitleGreen
                  : getBackupStatusColor() === 'yellow'
                  ? styles.statusTitleYellow
                  : styles.statusTitleRed
              ]}>
                {getBackupStatusText()}
              </RNText>
            </View>
            
            <View style={styles.statusDetails}>
              <View style={styles.statusRow}>
                <RNText style={styles.statusLabel}>Backup Available</RNText>
                <RNText style={[
                  styles.statusValue,
                  backupStatus?.hasBackup ? styles.statusValueGreen : styles.statusValueRed
                ]}>
                  {backupStatus?.hasBackup ? 'Yes' : 'No'}
                </RNText>
              </View>
              
              {backupStatus?.hasBackup && (
                <View style={styles.statusRow}>
                  <RNText style={styles.statusLabel}>Seed Phrase Length</RNText>
                  <RNText style={styles.statusValue}>
                    {backupStatus.seedPhraseWordCount} words
                  </RNText>
                </View>
              )}
              
              <View style={styles.statusRow}>
                <RNText style={styles.statusLabel}>Last Verified</RNText>
                <RNText style={styles.statusValue}>
                  {backupStatus?.lastBackupVerified 
                    ? backupStatus.lastBackupVerified.toLocaleDateString()
                    : 'Never'
                  }
                </RNText>
              </View>
              
              {getDaysUntilReminder() !== null && (
                <View style={styles.statusRow}>
                  <RNText style={styles.statusLabel}>Next Reminder</RNText>
                  <RNText style={[
                    styles.statusValue,
                    getDaysUntilReminder()! < 7 ? styles.statusValueRed : 
                    getDaysUntilReminder()! < 14 ? styles.statusValueYellow : styles.statusValueGreen
                  ]}>
                    {getDaysUntilReminder()! < 1 
                      ? 'Overdue'
                      : `${Math.ceil(getDaysUntilReminder()!)} days`
                    }
                  </RNText>
                </View>
              )}
            </View>
          </View>

          {/* Information Cards */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="information-circle" size={20} color="#3b82f6" style={styles.infoIcon} />
              <View style={styles.infoTextContainer}>
                <RNText style={styles.infoTitle}>
                  Why Verify Your Backup?
                </RNText>
                <RNText style={styles.infoText}>
                  Regular backup verification ensures you can recover your wallet if needed. We recommend verifying every 30 days to maintain security.
                </RNText>
              </View>
            </View>
          </View>

          {!backupStatus?.hasBackup && (
            <View style={styles.warningCard}>
              <View style={styles.infoRow}>
                <Ionicons name="warning" size={20} color="#ef4444" style={styles.infoIcon} />
                <View style={styles.infoTextContainer}>
                  <RNText style={styles.warningTitle}>
                    No Backup Found
                  </RNText>
                  <RNText style={styles.warningText}>
                    Your wallet doesn&apos;t have a backup yet. This is extremely dangerous - you could lose all your funds if something happens to your device.
                  </RNText>
                  <Button
                    title="Create Backup Now"
                    onPress={() => router.push('/wallet/seed-export')}
                    variant="outline"
                    style={styles.warningButton}
                  />
                </View>
              </View>
            </View>
          )}

          {backupStatus?.hasBackup && (
            <View style={styles.actionButtons}>
              <Button
                title="Verify Backup Now"
                onPress={startVerification}
                loading={loading}
                style={styles.primaryButton}
              />
              
              <Button
                title="View Seed Phrase"
                onPress={() => router.push('/wallet/seed-export')}
                variant="outline"
                style={styles.secondaryButton}
              />
            </View>
          )}
        </>
      )}
    </View>
  );

  const renderVerification = () => (
    <View style={styles.sectionContainer}>
      <RNText style={styles.sectionTitle}>
        Verify Your Backup
      </RNText>
      <RNText style={styles.sectionSubtitle}>
        Enter the requested words from your seed phrase
      </RNText>

      <View style={styles.verificationContainer}>
        {verificationWords.length > 0 && seedPhrase.length > 0 && (
          <SeedPhraseVerification
            seedPhrase={seedPhrase}
            requiredWords={verificationWords}
            onVerificationComplete={handleVerificationSuccess}
          />
        )}
      </View>
    </View>
  );

  const renderComplete = () => (
    <View style={styles.completeContainer}>
      <View style={styles.completeHeader}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={40} color="#22c55e" />
        </View>
        <RNText style={styles.completeTitle}>
          Backup Verified!
        </RNText>
        <RNText style={styles.completeSubtitle}>
          Your backup has been successfully verified
        </RNText>
      </View>

      <View style={styles.successCard}>
        <View style={styles.infoRow}>
          <Ionicons name="shield-checkmark" size={20} color="#22c55e" style={styles.infoIcon} />
          <View style={styles.infoTextContainer}>
            <RNText style={styles.successTitle}>
              Verification Complete
            </RNText>
            <RNText style={styles.successText}>
              Your wallet backup is working correctly. We&apos;ll remind you to verify again in 30 days.
            </RNText>
          </View>
        </View>
      </View>

      <Button
        title="Done"
        onPress={() => router.back()}
        style={styles.doneButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: verificationStep === 'status' ? 'Backup Status' :
                 verificationStep === 'verify' ? 'Verify Backup' : 'Verification Complete',
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
        {verificationStep === 'status' && renderBackupStatus()}
        {verificationStep === 'verify' && renderVerification()}
        {verificationStep === 'complete' && renderComplete()}
      </ScrollView>
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
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  sectionContainer: {
    flex: 1,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: '#a0a0a0',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#a0a0a0',
    fontSize: 16,
  },
  statusCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  statusCardGreen: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  statusCardYellow: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  statusCardRed: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    marginLeft: 12,
    fontSize: 18,
    fontWeight: '600',
  },
  statusTitleGreen: {
    color: '#22c55e',
  },
  statusTitleYellow: {
    color: '#f59e0b',
  },
  statusTitleRed: {
    color: '#ef4444',
  },
  statusDetails: {
    gap: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    color: '#a0a0a0',
    fontSize: 14,
  },
  statusValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  statusValueGreen: {
    color: '#22c55e',
  },
  statusValueYellow: {
    color: '#f59e0b',
  },
  statusValueRed: {
    color: '#ef4444',
  },
  infoCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  warningCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  successCard: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginTop: 2,
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    color: '#60a5fa',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  infoText: {
    color: '#93c5fd',
    fontSize: 14,
    lineHeight: 18,
  },
  warningTitle: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  warningText: {
    color: '#fca5a5',
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 12,
  },
  warningButton: {
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  successTitle: {
    color: '#22c55e',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  successText: {
    color: '#86efac',
    fontSize: 14,
    lineHeight: 18,
  },
  actionButtons: {
    marginTop: 'auto',
    gap: 12,
  },
  primaryButton: {
    width: '100%',
  },
  secondaryButton: {
    width: '100%',
  },
  verificationContainer: {
    flex: 1,
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  completeHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successIcon: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  completeTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  completeSubtitle: {
    color: '#a0a0a0',
    fontSize: 14,
    textAlign: 'center',
  },
  doneButton: {
    width: '100%',
  },
});