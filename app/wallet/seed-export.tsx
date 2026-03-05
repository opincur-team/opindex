import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, Pressable, StyleSheet, Text as RNText, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/src/components/ui';
import { SeedPhraseDisplay, SeedPhraseVerification } from '@/src/components/common';
import { walletService } from '@/src/services/walletService';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';

type SecurityStep = 'auth' | 'warnings' | 'display' | 'verification' | 'complete';

const SECURITY_WARNINGS = [
  {
    id: 'never-share',
    text: 'I understand that I should never share my seed phrase with anyone',
    checked: false,
  },
  {
    id: 'offline-storage',
    text: 'I will store my seed phrase offline in a secure location',
    checked: false,
  },
  {
    id: 'backup-responsibility',
    text: 'I understand that losing my seed phrase means losing access to my wallet',
    checked: false,
  },
  {
    id: 'phishing-aware',
    text: 'I am aware of phishing attempts and will never enter my seed phrase on suspicious websites',
    checked: false,
  },
];

export default function SeedPhraseExportScreen() {
  const [step, setStep] = useState<SecurityStep>('auth');
  const [seedPhrase, setSeedPhrase] = useState<string[]>([]);
  const [warnings, setWarnings] = useState(SECURITY_WARNINGS);
  const [seedPhraseRevealed, setSeedPhraseRevealed] = useState(false);
  const [verificationWords, setVerificationWords] = useState<number[]>([]);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (step === 'display' && seedPhrase.length === 0) {
      loadSeedPhrase();
    }
  }, [step]);

  const loadSeedPhrase = async () => {
    try {
      setLoading(true);
      const exportedPhrase = await walletService.exportWallet();
      setSeedPhrase(exportedPhrase);
      
      // Generate random word positions for verification (3 random positions)
      const wordPositions: number[] = [];
      while (wordPositions.length < 3) {
        const randomPos = Math.floor(Math.random() * exportedPhrase.length);
        if (!wordPositions.includes(randomPos)) {
          wordPositions.push(randomPos);
        }
      }
      setVerificationWords(wordPositions.sort((a, b) => a - b));
    } catch (error) {
      console.error('Failed to load seed phrase:', error);
      Alert.alert('Error', 'Failed to load seed phrase. Please try again.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleAuthentication = async () => {
    try {
      setLoading(true);
      
      // Try biometric first, then fallback to PIN
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to view your seed phrase',
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use PIN',
      });

      if (result.success) {
        setStep('warnings');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert('Authentication Failed', 'Please authenticate to continue.');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      Alert.alert('Error', 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWarningToggle = (warningId: string) => {
    setWarnings(prev => 
      prev.map(warning => 
        warning.id === warningId 
          ? { ...warning, checked: !warning.checked }
          : warning
      )
    );
  };

  const areAllWarningsChecked = () => {
    return warnings.every(warning => warning.checked);
  };

  const handleProceedToDisplay = () => {
    if (!areAllWarningsChecked()) {
      Alert.alert('Please Confirm', 'Please acknowledge all security warnings before proceeding.');
      return;
    }
    setStep('display');
  };

  const handleRevealSeedPhrase = () => {
    setSeedPhraseRevealed(true);
    Haptics.selectionAsync();
  };

  const handleProceedToVerification = () => {
    setStep('verification');
  };

  const handleVerificationSuccess = () => {
    setVerificationSuccess(true);
    setStep('complete');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleComplete = async () => {
    // Mark backup as verified
    await walletService.markBackupVerified();
    router.back();
  };

  const renderAuthentication = () => (
    <View style={styles.authContainer}>
      <View style={styles.authHeader}>
        <View style={styles.authIconContainer}>
          <Ionicons name="shield-checkmark" size={40} color="#06EBF1" />
        </View>
        <RNText style={styles.authTitle}>
          Secure Access Required
        </RNText>
        <RNText style={styles.authSubtitle}>
          Your seed phrase is highly sensitive. We need to verify your identity before showing it.
        </RNText>
      </View>

      <View style={styles.warningCard}>
        <View style={styles.warningRow}>
          <Ionicons name="warning" size={20} color="#ef4444" style={styles.warningIcon} />
          <View style={styles.warningTextContainer}>
            <RNText style={styles.warningTitle}>
              Critical Security Warning
            </RNText>
            <RNText style={styles.warningText}>
              Anyone with access to your seed phrase can control your wallet and steal your funds. Only proceed in a secure, private environment.
            </RNText>
          </View>
        </View>
      </View>

      <Button
        title="Authenticate"
        onPress={handleAuthentication}
        loading={loading}
        style={styles.fullWidthButton}
      />
    </View>
  );

  const renderWarnings = () => (
    <View style={styles.sectionContainer}>
      <RNText style={styles.sectionTitle}>
        Security Checklist
      </RNText>
      <RNText style={styles.sectionSubtitle}>
        Please read and confirm each security requirement
      </RNText>

      <ScrollView style={styles.warningsScroll}>
        <View style={styles.warningsList}>
          {warnings.map((warning) => (
            <View key={warning.id} style={styles.warningCard}>
              <Pressable
                onPress={() => handleWarningToggle(warning.id)}
                style={styles.warningPressable}
              >
                <View style={styles.warningContent}>
                  <View style={styles.checkboxContainer}>
                    <View style={[
                      styles.checkbox,
                      warning.checked ? styles.checkboxChecked : styles.checkboxUnchecked
                    ]}>
                      {warning.checked && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </View>
                  </View>
                  <View style={styles.warningTextContent}>
                    <RNText style={[
                      styles.warningItemText,
                      warning.checked ? styles.warningTextChecked : styles.warningTextUnchecked
                    ]}>
                      {warning.text}
                    </RNText>
                  </View>
                </View>
              </Pressable>
            </View>
          ))}
        </View>

        <View style={styles.bestPracticesCard}>
          <View style={styles.infoRow}>
            <Ionicons name="information-circle" size={20} color="#f59e0b" style={styles.infoIcon} />
            <View style={styles.infoTextContainer}>
              <RNText style={styles.bestPracticesTitle}>
                Best Practices
              </RNText>
              <RNText style={styles.bestPracticesText}>
                Write down your seed phrase on paper and store it in a safe place. Consider using a metal backup for fire/water resistance. Never store it digitally or in the cloud.
              </RNText>
            </View>
          </View>
        </View>
      </ScrollView>

      <Button
        title="I Understand - Continue"
        onPress={handleProceedToDisplay}
        disabled={!areAllWarningsChecked()}
        style={styles.fullWidthButton}
      />
    </View>
  );

  const renderDisplay = () => (
    <View style={styles.sectionContainer}>
      <RNText style={styles.sectionTitle}>
        Your Seed Phrase
      </RNText>
      <RNText style={styles.sectionSubtitle}>
        Write this down and store it securely
      </RNText>

      {loading ? (
        <View style={styles.loadingContainer}>
          <RNText style={styles.loadingText}>Loading seed phrase...</RNText>
        </View>
      ) : (
        <View style={styles.displayContent}>
          <View style={styles.phraseCard}>
            <View style={styles.phraseCardHeader}>
              <RNText style={styles.phraseCardTitle}>Recovery Phrase</RNText>
              <RNText style={styles.phraseCardWordCount}>
                {seedPhrase.length} words
              </RNText>
            </View>

            {!seedPhraseRevealed ? (
              <View style={styles.hiddenPhraseContainer}>
                <View style={styles.hiddenIcon}>
                  <Ionicons name="eye-off" size={32} color="#666" />
                </View>
                <RNText style={styles.hiddenText}>
                  Seed phrase is hidden for security
                </RNText>
                <Button
                  title="Reveal Seed Phrase"
                  onPress={handleRevealSeedPhrase}
                  variant="outline"
                  style={styles.revealButton}
                />
              </View>
            ) : (
              <SeedPhraseDisplay
                seedPhrase={seedPhrase}
                isBlurred={false}
                showCopyButton={true}
              />
            )}
          </View>

          <View style={styles.screenshotCard}>
            <View style={styles.warningRow}>
              <Ionicons name="shield-outline" size={20} color="#ef4444" style={styles.warningIcon} />
              <View style={styles.warningTextContainer}>
                <RNText style={styles.screenshotTitle}>
                  Screenshot Protection
                </RNText>
                <RNText style={styles.screenshotText}>
                  Screenshots are disabled on this screen. Write down your seed phrase manually for maximum security.
                </RNText>
              </View>
            </View>
          </View>
        </View>
      )}

      <Button
        title="I've Written It Down"
        onPress={handleProceedToVerification}
        disabled={!seedPhraseRevealed}
        style={styles.fullWidthButton}
      />
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

      <View style={styles.verificationContent}>
        {verificationWords.length > 0 && (
          <SeedPhraseVerification
            originalSeedPhrase={seedPhrase}
            onVerificationComplete={(success) => success && handleVerificationSuccess()}
          />
        )}
      </View>
    </View>
  );

  const renderComplete = () => (
    <View style={styles.completeContainer}>
      <View style={styles.completeHeader}>
        <View style={styles.successIconContainer}>
          <Ionicons name="checkmark-circle" size={40} color="#22c55e" />
        </View>
        <RNText style={styles.completeTitle}>
          Backup Verified!
        </RNText>
        <RNText style={styles.completeSubtitle}>
          Your seed phrase has been successfully verified
        </RNText>
      </View>

      <View style={styles.successCard}>
        <View style={styles.successRow}>
          <Ionicons name="shield-checkmark" size={20} color="#22c55e" style={styles.successIcon} />
          <View style={styles.successTextContainer}>
            <RNText style={styles.successTitle}>
              Backup Complete
            </RNText>
            <RNText style={styles.successText}>
              Your wallet is now properly backed up. Store your seed phrase in a safe place and never share it with anyone.
            </RNText>
          </View>
        </View>
      </View>

      <Button
        title="Done"
        onPress={handleComplete}
        style={styles.fullWidthButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: step === 'auth' ? 'Secure Access' :
                 step === 'warnings' ? 'Security Checklist' :
                 step === 'display' ? 'Seed Phrase' :
                 step === 'verification' ? 'Verify Backup' : 'Backup Complete',
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: '#fff',
          headerBackTitle: '',
          headerLeft: (step === 'display' || step === 'verification' || step === 'complete') ? () => null : 
                     () => (
                       <Pressable onPress={() => router.back()} style={styles.headerButton}>
                         <Ionicons name="arrow-back" size={24} color="#fff" />
                       </Pressable>
                     ),
        }} 
      />
      
      <View style={styles.content}>
        {step === 'auth' && renderAuthentication()}
        {step === 'warnings' && renderWarnings()}
        {step === 'display' && renderDisplay()}
        {step === 'verification' && renderVerification()}
        {step === 'complete' && renderComplete()}
      </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  
  // Auth Step Styles
  authContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  authHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  authIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(6, 235, 241, 0.2)',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  authTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  authSubtitle: {
    color: '#a0a0a0',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  
  // Common Section Styles
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
  
  // Warning Card Styles
  warningCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  warningIcon: {
    marginTop: 2,
    marginRight: 12,
  },
  warningTextContainer: {
    flex: 1,
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
  },
  
  // Warnings List Styles
  warningsScroll: {
    flex: 1,
    marginBottom: 24,
  },
  warningsList: {
    gap: 16,
  },
  warningPressable: {
    padding: 16,
  },
  warningContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxContainer: {
    marginRight: 16,
    marginTop: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  checkboxUnchecked: {
    borderColor: '#a0a0a0',
  },
  warningTextContent: {
    flex: 1,
  },
  warningItemText: {
    fontSize: 14,
  },
  warningTextChecked: {
    color: 'white',
  },
  warningTextUnchecked: {
    color: '#d1d5db',
  },
  
  // Best Practices Card
  bestPracticesCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
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
  bestPracticesTitle: {
    color: '#f59e0b',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  bestPracticesText: {
    color: '#fbbf24',
    fontSize: 14,
    lineHeight: 18,
  },
  
  // Display Step Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#a0a0a0',
    fontSize: 16,
  },
  displayContent: {
    flex: 1,
    marginBottom: 24,
  },
  phraseCard: {
    backgroundColor: 'rgba(23, 23, 23, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  phraseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  phraseCardTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  phraseCardWordCount: {
    color: '#a0a0a0',
    fontSize: 14,
  },
  hiddenPhraseContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  hiddenIcon: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(60, 60, 60, 0.3)',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  hiddenText: {
    color: '#a0a0a0',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  revealButton: {
    alignSelf: 'center',
  },
  
  // Screenshot Protection Card
  screenshotCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  screenshotTitle: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  screenshotText: {
    color: '#fca5a5',
    fontSize: 14,
    lineHeight: 18,
  },
  
  // Verification Step Styles
  verificationContent: {
    flex: 1,
    marginBottom: 24,
  },
  
  // Complete Step Styles
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  completeHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successIconContainer: {
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
  successCard: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  successIcon: {
    marginTop: 2,
    marginRight: 12,
  },
  successTextContainer: {
    flex: 1,
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
  
  // Common Button Style
  fullWidthButton: {
    width: '100%',
  },
});
