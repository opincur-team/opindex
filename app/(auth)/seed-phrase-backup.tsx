import React, { useState, useEffect } from 'react';
import { View, Text as RNText, ScrollView, Alert, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/src/components/ui';
import { SeedPhraseDisplay } from '@/src/components/common/SeedPhraseDisplay';
import { SeedPhraseVerification } from '@/src/components/common/SeedPhraseVerification';
import { walletService } from '@/src/services/walletService';

type BackupStep = 'unlock' | 'display' | 'verify' | 'complete';

export default function SeedPhraseBackupScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<BackupStep>('unlock');
  const [seedPhrase, setSeedPhrase] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [backupStatus, setBackupStatus] = useState<any>(null);

  useEffect(() => {
    loadBackupStatus();
  }, []);

  const loadBackupStatus = async () => {
    try {
      const status = await walletService.getWalletBackupStatus();
      setBackupStatus(status);
    } catch (error) {
      console.error('Failed to load backup status:', error);
    }
  };

  const handleUnlockAndReveal = async () => {
    setIsLoading(true);
    try {
      // First check if wallet is unlocked
      if (!walletService.isWalletUnlocked()) {
        Alert.alert(
          'Wallet Locked', 
          'Please unlock your wallet first to view the seed phrase.',
          [{ text: 'OK' }]
        );
        return;
      }

      const exportedSeedPhrase = await walletService.exportWallet();
      setSeedPhrase(exportedSeedPhrase);
      setCurrentStep('display');
    } catch (error) {
      Alert.alert('Error', 'Failed to access seed phrase. Please try again.');
      console.error('Export wallet error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationComplete = async (success: boolean) => {
    if (success) {
      try {
        await walletService.markBackupVerified();
        setCurrentStep('complete');
      } catch (error) {
        console.error('Failed to mark backup as verified:', error);
      }
    } else {
      Alert.alert(
        'Verification Failed',
        'Please carefully review your seed phrase backup.',
        [
          { text: 'Try Again', style: 'default' },
          { text: 'Review Phrase', onPress: () => setCurrentStep('display'), style: 'cancel' }
        ]
      );
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'unlock':
        return (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <RNText style={styles.title}>
              Backup Seed Phrase
            </RNText>
            <RNText style={styles.subtitle}>
              Access and verify your wallet&apos;s recovery seed phrase
            </RNText>

            <View style={styles.card}>
              <RNText style={styles.cardTitle}>
                📋 Backup Information
              </RNText>
              {backupStatus && (
                <>
                  <RNText style={styles.infoItem}>
                    • Seed phrase length: {backupStatus.seedPhraseWordCount} words
                  </RNText>
                  <RNText style={styles.infoItem}>
                    • Backup status: {backupStatus.hasBackup ? '✅ Available' : '❌ Not found'}
                  </RNText>
                  {backupStatus.lastBackupVerified && (
                    <RNText style={[styles.infoItem, { marginBottom: 0 }]}>
                      • Last verified: {backupStatus.lastBackupVerified.toLocaleDateString()}
                    </RNText>
                  )}
                </>
              )}
            </View>

            <View style={styles.warningCard}>
              <RNText style={styles.warningTitle}>
                ⚠️ Security Warning
              </RNText>
              <RNText style={styles.warningText}>
                Your seed phrase provides full access to your wallet. Only view it in a private, secure location. Never share it or store it digitally.
              </RNText>
            </View>

            <View style={styles.buttonContainer}>
              <Button 
                title={isLoading ? 'Accessing...' : 'Reveal Seed Phrase'}
                onPress={handleUnlockAndReveal}
                disabled={isLoading}
              />
              <Button 
                title="Cancel"
                onPress={() => router.back()}
                variant="outline"
              />
            </View>
          </ScrollView>
        );

      case 'display':
        return (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <RNText style={styles.title}>
              Your Recovery Seed Phrase
            </RNText>
            <RNText style={styles.subtitle}>
              Write down these {seedPhrase.length} words in order and store them safely.
            </RNText>

            <SeedPhraseDisplay
              seedPhrase={seedPhrase}
              isBlurred={false}
              showCopyButton={true}
            />

            <View style={styles.buttonContainer}>
              <Button 
                title="I've Backed It Up"
                onPress={() => setCurrentStep('verify')}
              />
              <Button 
                title="Close"
                onPress={() => router.back()}
                variant="outline"
              />
            </View>
          </ScrollView>
        );

      case 'verify':
        return (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <RNText style={styles.title}>
              Verify Your Backup
            </RNText>
            <RNText style={styles.subtitle}>
              Please verify a few words to confirm your backup is correct.
            </RNText>

            <SeedPhraseVerification
              originalSeedPhrase={seedPhrase}
              onVerificationComplete={handleVerificationComplete}
              onRetry={() => setCurrentStep('display')}
            />

            <View style={styles.buttonContainer}>
              <Button 
                title="Back to Seed Phrase"
                onPress={() => setCurrentStep('display')}
                variant="outline"
              />
            </View>
          </ScrollView>
        );

      case 'complete':
        return (
          <View style={styles.completeContainer}>
            <View style={styles.completeCard}>
              <View style={styles.completeContent}>
                <RNText style={styles.completeEmoji}>✅</RNText>
                <RNText style={styles.completeTitle}>
                  Backup Verified!
                </RNText>
                <RNText style={styles.completeSubtitle}>
                  Your seed phrase backup has been successfully verified. Keep it safe and secure.
                </RNText>
                
                <Button 
                  title="Done"
                  onPress={() => router.back()}
                />
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const getScreenTitle = () => {
    switch (currentStep) {
      case 'unlock': return 'Backup Seed Phrase';
      case 'display': return 'Recovery Phrase';
      case 'verify': return 'Verify Backup';
      case 'complete': return 'Backup Complete';
      default: return 'Seed Phrase Backup';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: getScreenTitle(),
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
      {renderStep()}
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
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    color: '#a0a0a0',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  card: {
    backgroundColor: 'rgba(23, 23, 23, 0.8)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoItem: {
    color: '#a0a0a0',
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 18,
  },
  warningCard: {
    backgroundColor: 'rgba(113, 63, 18, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(180, 83, 9, 1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  warningTitle: {
    color: '#fbbf24',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  warningText: {
    color: '#fbbf24',
    fontSize: 12,
    lineHeight: 16,
  },
  buttonContainer: {
    marginTop: 24,
    gap: 12,
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  completeCard: {
    backgroundColor: 'rgba(23, 23, 23, 0.8)',
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  completeContent: {
    alignItems: 'center',
  },
  completeEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  completeTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  completeSubtitle: {
    color: '#a0a0a0',
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 14,
    lineHeight: 20,
  },
});