import React, { useState, useEffect } from 'react';
import {View, Text as RNText, ScrollView, Alert, StyleSheet, ActivityIndicator} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import {BlurContainer, Button} from '@/src/components/ui';
import { SeedPhraseDisplay } from '@/src/components/common/SeedPhraseDisplay';
import { SeedPhraseVerification } from '@/src/components/common/SeedPhraseVerification';
import { SeedPhraseInput } from '@/src/components/common/SeedPhraseInput';
import { walletService } from '@/src/services/walletService';
import { useAppStore } from '@/src/stores/appStore';
import { walletRegistrationService } from '@/src/services/walletRegistrationService';
import { registrationQueueService } from '@/src/services/registrationQueueService';
import {LogoImage} from "@/src/components/ui/LogoImage";
import {typography} from "@/src/styles/typography";
import {InnerContainer} from "@/src/components/ui/InnerContainer";
import {LinearGradient} from "expo-linear-gradient";

type WalletSetupStep =
  | 'create-generate'
  | 'create-backup'
  | 'create-verify'
  | 'import-input';

export default function WalletSetupScreen() {
  const { mode } = useLocalSearchParams<{ mode?: 'create' | 'import' }>();
  const { setOnboarded } = useAppStore();
  const [currentStep, setCurrentStep] = useState<WalletSetupStep>(
    mode === 'import' ? 'import-input' : 'create-generate'
  );
  const [seedPhrase, setSeedPhrase] = useState<string[]>([]);
  const [importedSeedPhrase, setImportedSeedPhrase] = useState<string[]>([]);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [isImportingWallet, setIsImportingWallet] = useState(false);
  const [isSeedRevealed, setIsSeedRevealed] = useState(false);

  // Auto-trigger wallet creation when mode is 'create'
  useEffect(() => {
    if (mode === 'create' && currentStep === 'create-generate' && seedPhrase.length === 0) {
      void handleCreateNewWallet(12);
    }
    // Only run on mount when mode changes - adding currentStep/seedPhrase would cause infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const handleCreateNewWallet = async (wordCount: 12 | 24 = 12) => {
    setIsCreatingWallet(true);
    setIsSeedRevealed(false);

    // Give UI time to render the loading overlay before heavy crypto operations
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      // Only generate mnemonic in memory, don't store yet
      const mnemonic = await walletService.generateMnemonicOnly(wordCount);
      setSeedPhrase(mnemonic);
      setCurrentStep('create-generate');
    } catch {
      Alert.alert('Error', 'Failed to generate seed phrase. Please try again.');
    } finally {
      setIsCreatingWallet(false);
    }
  };

  // Store wallet only after user has verified the seed phrase
  const handleStoreWalletAfterVerification = async () => {
    try {
      // Now actually create and store the wallet
      const result = await walletService.createWalletFromMnemonic(seedPhrase);

      // Register wallet with backend (with background retry on failure)
      try {
        await walletRegistrationService.registerWallet(result.address);
      } catch {
        await registrationQueueService.addToQueue(result.address);
      }

      // Mark onboarding as complete now that wallet is stored
      setOnboarded(true);

      // Navigate to portfolio
      router.replace('/(tabs)/portfolio');
    } catch {
      setIsCreatingWallet(false);
      Alert.alert('Error', 'Failed to create wallet. Please try again.');
    }
  };

  const handleImportWallet = async () => {
    setIsImportingWallet(true);
    try {
      const result = await walletService.importWallet(importedSeedPhrase);

      // Register wallet with backend (with background retry on failure)
      try {
        await walletRegistrationService.registerWallet(result.address);
      } catch {
        await registrationQueueService.addToQueue(result.address);
      }

      // Mark onboarding as complete now that wallet is imported
      setOnboarded(true);

      router.replace('/(tabs)/portfolio');
    } catch {
      Alert.alert('Error', 'Failed to import wallet. Please check your seed phrase.');
    } finally {
      setIsImportingWallet(false);
    }
  };

  const handleBackupConfirmed = () => {
    setCurrentStep('create-verify');
  };

  const handleVerificationComplete = async (success: boolean) => {
    if (success) {
      // Show loading overlay immediately
      setIsCreatingWallet(true);
      // Small delay for success message, then create wallet
      setTimeout(async () => {
        await handleStoreWalletAfterVerification();
      }, 500);
    } else {
      Alert.alert(
        'Verification Failed',
        'Please go and carefully write down your seed phrase.',
        [
          { text: 'Try Again', style: 'default' },
          { text: 'Go Back', onPress: () => setCurrentStep('create-backup'), style: 'cancel' }
        ]
      );
    }
  };

  const handleSeedPhraseInputChange = (newSeedPhrase: string[]) => {
    setImportedSeedPhrase(newSeedPhrase);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'create-generate':
        return (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>

            <View style={{ paddingHorizontal: 10, alignItems: 'center' }}>

                <LogoImage/>

                <BlurContainer style={{marginTop:-40}}>
                  <RNText style={[
                    typography.textBase,
                    typography.daysone,
                    typography.textWhite,
                    styles.title,
                    {marginBottom: 10}
                  ]}>
                    Your Recovery Seed Phrase
                  </RNText>
                  <RNText style={[typography.textSm,
                    typography.jura400,
                    typography.textWhite,styles.subtitle, {marginBottom: 10}]}>
                    Write down these {seedPhrase.length} words in the exact order shown. Keep them safe and private.
                  </RNText>

                  <SeedPhraseDisplay
                    seedPhrase={seedPhrase}
                    isBlurred={true}
                    showCopyButton={true}
                    onReveal={() => setIsSeedRevealed(true)}
                  />

                  <InnerContainer style={{width:'100%'}}>
                    <View style={styles.buttonContainer}>
                      <Button
                        variant="secondary"
                        title="I remembered my seed"
                        onPress={() => setCurrentStep('create-backup')}
                        disabled={!isSeedRevealed}
                      />
                      <Button variant='outline' title="Back" onPress={() => router.replace({ pathname: '/(auth)/onboarding', params: { fromWalletSetup: 'true' } })}/>
                    </View>

                  </InnerContainer>
                </BlurContainer>
            </View>
          </ScrollView>
        );

      case 'create-backup':
        return (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>

            <View style={{ paddingHorizontal: 10, alignItems: 'center' }}>
                <LogoImage/>
                <BlurContainer style={{marginTop:-40}}>
                  <RNText style={[
                    typography.daysone,
                    typography.textWhite,
                    styles.title,
                    {marginBottom: 10}
                    ]}>
                    CHECK YOUR SEED PHRASE
                  </RNText>
                  <RNText style={[
                    typography.jura400,
                    typography.textWhite,
                    styles.subtitle
                  ]}>
                    Please enter the words from your seed phrase in the positions indicated to confirm control of your wallet.
                  </RNText>


                  <InnerContainer style={{width:'100%', padding: 10, marginTop: 10, borderRadius: 20}}>
                    <RNText style={[
                        typography.daysone,
                        typography.textWhite,
                        typography.uppercase,
                        styles.cardTitle
                      ]}>
                      Backup Checklist
                    </RNText>
                    <RNText style={[
                      typography.jura400,
                      typography.textWhite,
                      styles.checklistItem
                    ]}>
                      Written down all {seedPhrase.length} words in correct order
                    </RNText>
                    <RNText style={[
                      typography.jura400,
                      typography.textWhite,
                      styles.checklistItem
                    ]}>
                      Stored in a safe, private location
                    </RNText>
                    <RNText style={[
                      typography.jura400,
                      typography.textWhite,
                      styles.checklistItem
                    ]}>
                      Double-checked for spelling errors
                    </RNText>
                    <RNText style={[
                      typography.jura400,
                      typography.textWhite,
                      styles.checklistItem,
                      { marginBottom: 0 }
                    ]}>
                      Not stored digitally or online
                    </RNText>
                  </InnerContainer>

                  <LinearGradient
                    colors={['#FFA600', '#F76E0C']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.43 }}
                    style={[styles.warningCard, {borderRadius: 20}]}
                  >
                    <RNText style={[
                      typography.daysone,
                      typography.textXs,
                      typography.textWhite,
                      typography.uppercase
                    ]}>
                      Important Security Notice: Your seed phrase is the only way to recover your wallet. If you lose it, your funds will be permanently inaccessible. Never share it with anyone.
                    </RNText>
                  </LinearGradient>

                  <View style={styles.buttonContainer}>
                    <Button
                      title="Ready to check"
                      onPress={handleBackupConfirmed}
                      variant="secondary"
                    />
                    <Button
                      title="BACK"
                      onPress={() => setCurrentStep('create-generate')}
                      variant="outline"
                    />
                  </View>


                </BlurContainer>

            </View>




          </ScrollView>
        );

      case 'create-verify':
        return (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <LogoImage/>
            <BlurContainer style={{marginTop:-40}}>
              <RNText style={[
                typography.daysone,
                typography.textWhite,
                styles.title
              ]}>
                Verify Your SEED PHRASE
              </RNText>
              <RNText style={[
                typography.jura400,
                typography.textWhite,
                styles.subtitle,
                {marginBottom: 10}
              ]}>
                To ensure you&apos;ve backed up correctly, please verify a few words from your seed phrase.
              </RNText>

              <SeedPhraseVerification
                originalSeedPhrase={seedPhrase}
                onVerificationComplete={handleVerificationComplete}
                onRetry={() => setCurrentStep('create-backup')}
              />

              <View style={styles.buttonContainer}>
                <Button
                  title="Back"
                  onPress={() => router.replace({ pathname: '/(auth)/onboarding', params: { fromWalletSetup: 'true' } })}
                  variant="outline"
                />
              </View>
            </BlurContainer>


          </ScrollView>
        );

      case 'import-input':
        return (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <View style={{ paddingHorizontal: 10, alignItems: 'center' }}>
              <LogoImage/>
              <BlurContainer style={{marginTop:-40}}>
                <RNText style={[
                  typography.daysone,
                  typography.textWhite,
                  styles.title
                ]}>
                  Import EXISTING Your Wallet
                </RNText>
                <RNText style={ [typography.jura400, typography.textWhite, styles.subtitle]}>
                  WRITHE DOWN THERE 12 WORDS IN EXACT ORDER SHOWN
                  KEEP THEM SAFE AND PRIVATE !!!
                </RNText>

                <SeedPhraseInput
                  onSeedPhraseChange={handleSeedPhraseInputChange}
                  expectedWordCount={12}
                />

                <InnerContainer style={{marginTop: 10}}>
                  <View style={styles.buttonContainer}>
                    <Button
                      title="Continue"
                      variant="secondary"
                      onPress={() => void handleImportWallet()}
                      disabled={importedSeedPhrase.filter(w => w.length > 0).length !== 12}
                    />
                    <Button
                      title="Back"
                      variant="outline"
                      onPress={() => router.replace({ pathname: '/(auth)/onboarding', params: { fromWalletSetup: 'true' } })}
                    />
                  </View>
                </InnerContainer>

              </BlurContainer>
            </View>


          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderStep()}

      {/* Full Screen Loading Overlay */}
      {(isCreatingWallet || isImportingWallet) && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#06EBF1" />
            <RNText style={styles.loadingText}>
              {isImportingWallet ? 'Importing your wallet...' : 'Creating your wallet...'}
            </RNText>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  title: {
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  subtitle: {
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  buttonContainer: {
    padding: 10,
    gap: 10,
    width: '100%',
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
    marginBottom: 10,
    textAlign: 'center',
  },
  checklistItem: {
    marginBottom: 10,
  },
  warningCard: {
    borderRadius: 20,
    padding: 10,
    marginTop: 10
  },
  warningTitle: {
    color: '#fbbf24',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
  },

});
