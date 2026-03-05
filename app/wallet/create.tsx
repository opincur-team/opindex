import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, Pressable, StyleSheet, Text as RNText } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {  Card, Button, Input } from '@/src/components/ui';
import * as Haptics from 'expo-haptics';
import { theme } from '@/src/styles/theme';
import { commonStyles } from '@/src/styles/common';
import { typography } from '@/src/styles/typography';
import { walletRegistrationService } from '@/src/services/walletRegistrationService';
import { registrationQueueService } from '@/src/services/registrationQueueService';

interface DerivationOption {
  path: string;
  index: number;
  label: string;
  description: string;
}

const DERIVATION_OPTIONS: DerivationOption[] = [
  {
    path: "m/44'/501'/0'/0'",
    index: 0,
    label: 'Account 0 (Default)',
    description: 'Main account from your seed phrase'
  },
  {
    path: "m/44'/501'/1'/0'",
    index: 1,
    label: 'Account 1',
    description: 'Second account from your seed phrase'
  },
  {
    path: "m/44'/501'/2'/0'",
    index: 2,
    label: 'Account 2',
    description: 'Third account from your seed phrase'
  },
  {
    path: "m/44'/501'/3'/0'",
    index: 3,
    label: 'Account 3',
    description: 'Fourth account from your seed phrase'
  },
  {
    path: "m/44'/501'/4'/0'",
    index: 4,
    label: 'Account 4',
    description: 'Fifth account from your seed phrase'
  },
];

export default function CreateAdditionalWalletScreen() {
  const [step, setStep] = useState<'method' | 'derivation' | 'naming' | 'confirmation'>('method');
  const [creationType, setCreationType] = useState<'derive' | 'import' | null>(null);
  const [selectedDerivation, setSelectedDerivation] = useState<DerivationOption>(DERIVATION_OPTIONS[1]);
  const [customPath, setCustomPath] = useState('');
  const [useCustomPath, setUseCustomPath] = useState(false);
  const [walletName, setWalletName] = useState('');
  const [loading, setLoading] = useState(false);
  const [newWalletInfo, setNewWalletInfo] = useState<any>(null);

  useEffect(() => {
    // Auto-generate wallet name based on derivation
    if (selectedDerivation && !walletName) {
      setWalletName(`Account ${selectedDerivation.index}`);
    }
  }, [selectedDerivation]);

  const handleMethodSelection = (type: 'derive' | 'import') => {
    setCreationType(type);
    if (type === 'import') {
      // Navigate to import screen
      router.push('/wallet/import');
    } else {
      setStep('derivation');
    }
  };

  const handleDerivationSelection = (option: DerivationOption) => {
    setSelectedDerivation(option);
    setUseCustomPath(false);
    setCustomPath('');
  };

  const handleCustomPathToggle = (enabled: boolean) => {
    setUseCustomPath(enabled);
    if (enabled) {
      setCustomPath("m/44'/501'/0'/0'");
    } else {
      setCustomPath('');
    }
  };

  const handleProceedToNaming = () => {
    if (useCustomPath) {
      // Validate custom path
      const pathRegex = /^m\/44'\/501'\/\d+'\/0'$/;
      if (!pathRegex.test(customPath)) {
        Alert.alert('Invalid Path', 'Please enter a valid derivation path in the format m/44\'/501\'/n\'/0\' where n is a number.');
        return;
      }
    }
    setStep('naming');
  };

  const handleCreateWallet = async () => {
    if (!walletName.trim()) {
      Alert.alert('Name Required', 'Please enter a name for your wallet.');
      return;
    }

    try {
      setLoading(true);

      // In a real implementation, this would:
      // 1. Get the existing seed phrase from secure storage
      // 2. Derive a new keypair using the selected derivation path
      // 3. Store the new wallet with the given name
      
      // Mock implementation
      const derivationPath = useCustomPath ? customPath : selectedDerivation.path;
      
      // Simulate wallet creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockWalletInfo = {
        address: 'New' + Math.random().toString(36).substring(7),
        publicKey: 'pub' + Math.random().toString(36).substring(7),
        name: walletName,
        derivationPath,
      };

      // Register additional wallet with backend (with background retry on failure)
      try {
        await walletRegistrationService.registerWallet(mockWalletInfo.address);
        console.log('✅ Additional wallet registered successfully');
      } catch (registrationError) {
        console.warn('⚠️ Additional wallet registration failed, adding to queue:', registrationError);
        await registrationQueueService.addToQueue(mockWalletInfo.address);
      }

      setNewWalletInfo(mockWalletInfo);
      setStep('confirmation');

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Failed to create wallet:', error);
      Alert.alert('Error', 'Failed to create wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    router.back();
  };

  const renderMethodSelection = () => (
    <View style={commonStyles.flex1}>
      <RNText style={[typography.text2xl, typography.audiowide, typography.textWhite, commonStyles.mb2, commonStyles.textCenter]}>
        Add New Wallet
      </RNText>
      <RNText style={[typography.textSm, typography.textGray400, commonStyles.textCenter, commonStyles.mb8, typography.jura400]}>
        Choose how you want to add a new wallet
      </RNText>

      <View>
        <Card style={[styles.card, commonStyles.mb4]}>
          <Pressable
            onPress={() => handleMethodSelection('derive')}
            style={commonStyles.p6}
          >
            <View style={[commonStyles.flexRow, commonStyles.itemsCenter, commonStyles.mb3]}>
              <View style={[styles.iconContainerPrimary, commonStyles.mr4]}>
                <Ionicons name="key-outline" size={24} color="#06EBF1" />
              </View>
              <View style={commonStyles.flex1}>
                <RNText style={[typography.textLg, typography.textWhite, typography.jura600]}>
                  Generate from Seed
                </RNText>
                <RNText style={[typography.textSm, typography.textColorPrimary, typography.jura400]}>
                  Recommended
                </RNText>
              </View>

            </View>
            <RNText style={[typography.textSm, typography.textGray300, typography.jura400, commonStyles.mb4]}>
              Create a new account from your existing seed phrase. This generates a new wallet address while keeping the same backup.
            </RNText>
            <View style={styles.successBadge}>
              <RNText style={[typography.textXs, typography.textGreen400, typography.jura400]}>
                ✓ Same seed phrase backup ✓ Secure ✓ Easy to manage
              </RNText>
            </View>
          </Pressable>
        </Card>

        <Card style={styles.card}>
          <Pressable
            onPress={() => handleMethodSelection('import')}
            style={commonStyles.p6}
          >
            <View style={[commonStyles.flexRow, commonStyles.itemsCenter, commonStyles.mb3]}>
              <View style={[styles.iconContainerSecondary, commonStyles.mr4]}>
                <Ionicons name="download-outline" size={24} color="#A40CFF" />
              </View>
              <View style={commonStyles.flex1}>
                <RNText style={[typography.textLg, typography.textWhite, typography.jura600]}>
                  Import Wallet
                </RNText>
                <RNText style={[typography.textSm, typography.textGray400, typography.jura400]}>
                  Advanced
                </RNText>
              </View>
            </View>
            <RNText style={[typography.textSm, typography.textGray300, typography.jura400, commonStyles.mb4]}>
              Import a completely different wallet using a different seed phrase or private key.
            </RNText>
            <View style={styles.warningBadge}>
              <RNText style={[typography.textXs, typography.textOrange400, typography.jura400]}>
                ⚠️ Requires separate backup ⚠️ More complex to manage
              </RNText>
            </View>
          </Pressable>
        </Card>
      </View>
    </View>
  );

  const renderDerivationSelection = () => (
    <View style={commonStyles.flex1}>
      <RNText style={[typography.text2xl, typography.audiowide, typography.textWhite, commonStyles.mb2, commonStyles.textCenter]}>
        Account Selection
      </RNText>
      <RNText style={[typography.textSm, typography.textGray400, commonStyles.textCenter, commonStyles.mb8, typography.jura400]}>
        Choose which account to generate from your seed phrase
      </RNText>

      <ScrollView style={[commonStyles.flex1, commonStyles.mb6]}>
        <View>
          {DERIVATION_OPTIONS.map((option) => (
            <Card
              key={option.path}
              style={[
                styles.card,
                commonStyles.mb3,
                selectedDerivation.path === option.path && !useCustomPath
                  ? styles.cardSelected
                  : styles.cardInactive
              ]}
            >
              <Pressable
                onPress={() => handleDerivationSelection(option)}
                style={commonStyles.p4}
              >
                <View style={[commonStyles.flexRow, commonStyles.itemsCenter, commonStyles.justifyBetween, commonStyles.mb2]}>
                  <RNText style={[typography.textWhite, typography.jura600]}>
                    {option.label}
                  </RNText>
                  {selectedDerivation.path === option.path && !useCustomPath && (
                    <Ionicons name="checkmark-circle" size={20} color="#06EBF1" />
                  )}
                </View>
                <RNText style={[typography.textSm, typography.textGray400, typography.jura400, commonStyles.mb2]}>
                  {option.description}
                </RNText>
                <RNText style={[typography.textXs, typography.textGray500, typography.mono]}>
                  {option.path}
                </RNText>
              </Pressable>
            </Card>
          ))}

          {/* Custom Path Option */}
          <Card style={[
            styles.card,
            useCustomPath ? styles.cardSelected : styles.cardInactive
          ]}>
            <View style={commonStyles.p4}>
              <Pressable
                onPress={() => handleCustomPathToggle(!useCustomPath)}
                style={[commonStyles.flexRow, commonStyles.itemsCenter, commonStyles.justifyBetween, commonStyles.mb3]}
              >
                <RNText style={[typography.textWhite, typography.jura600]}>
                  Custom Derivation Path
                </RNText>
                {useCustomPath && (
                  <Ionicons name="checkmark-circle" size={20} color="#06EBF1" />
                )}
              </Pressable>

              {useCustomPath && (
                <Input
                  placeholder="m/44'/501'/0'/0'"
                  value={customPath}
                  onChangeText={setCustomPath}
                  style={commonStyles.mt3}
                />
              )}

              <RNText style={[typography.textSm, typography.textGray400, typography.jura400, commonStyles.mt2]}>
                Advanced: Enter a custom derivation path
              </RNText>
            </View>
          </Card>
        </View>
      </ScrollView>

      <Button
        title="Continue"
        onPress={handleProceedToNaming}
        style={commonStyles.wFull}
      />
    </View>
  );

  const renderNaming = () => (
    <View style={commonStyles.flex1}>
      <RNText style={[typography.text2xl, typography.audiowide, typography.textWhite, commonStyles.mb2, commonStyles.textCenter]}>
        Name Your Wallet
      </RNText>
      <RNText style={[typography.textSm, typography.textGray400, commonStyles.textCenter, commonStyles.mb8, typography.jura400]}>
        Give your new wallet a memorable name
      </RNText>

      <View style={commonStyles.flex1}>
        <Card style={[commonStyles.mb6, styles.card]}>
          <View style={commonStyles.p4}>
            <RNText style={[typography.textWhite, typography.jura600, commonStyles.mb4]}>Wallet Details</RNText>

            <View>
              <View style={commonStyles.mb4}>
                <RNText style={[typography.textSm, typography.textGray400, commonStyles.mb2, typography.jura400]}>Derivation Path</RNText>
                <RNText style={[typography.textSm, typography.textWhite, typography.mono]}>
                  {useCustomPath ? customPath : selectedDerivation.path}
                </RNText>
              </View>

              <Input
                label="Wallet Name"
                placeholder="Enter wallet name"
                value={walletName}
                onChangeText={setWalletName}
                maxLength={32}
              />
            </View>
          </View>
        </Card>

        <View style={[styles.infoBadge, commonStyles.mb6]}>
          <View style={[commonStyles.flexRow, commonStyles.itemsStart]}>
            <Ionicons name="information-circle" size={20} color="#3b82f6" style={styles.infoIcon} />
            <View style={commonStyles.flex1}>
              <RNText style={[typography.textSm, typography.textBlue400, typography.jura500, commonStyles.mb1]}>
                Same Seed Phrase
              </RNText>
              <RNText style={[typography.textSm, styles.textBlue300, typography.jura400]}>
                This wallet uses the same seed phrase as your main wallet. You don&apos;t need a separate backup.
              </RNText>
            </View>
          </View>
        </View>
      </View>

      <Button
        title="Create Wallet"
        onPress={handleCreateWallet}
        loading={loading}
        disabled={!walletName.trim()}
        style={commonStyles.wFull}
      />
    </View>
  );

  const renderConfirmation = () => (
    <View style={[commonStyles.flex1, commonStyles.justifyCenter]}>
      <View style={[commonStyles.itemsCenter, commonStyles.mb8]}>
        <View style={[styles.successIconContainer, commonStyles.mb4]}>
          <Ionicons name="checkmark" size={40} color="#22c55e" />
        </View>
        <RNText style={[typography.text2xl, typography.audiowide, typography.textWhite, commonStyles.mb2, commonStyles.textCenter]}>
          Wallet Created!
        </RNText>
        <RNText style={[typography.textGray400, commonStyles.textCenter, typography.jura400]}>
          Your new wallet has been successfully created
        </RNText>
      </View>

      {newWalletInfo && (
        <Card style={[commonStyles.mb8, styles.card]}>
          <View style={commonStyles.p4}>
            <RNText style={[typography.textWhite, typography.jura600, commonStyles.mb4]}>New Wallet Details</RNText>

            <View>
              <View style={commonStyles.mb3}>
                <RNText style={[typography.textSm, typography.textGray400, commonStyles.mb1, typography.jura400]}>Name</RNText>
                <RNText style={[typography.textWhite, typography.jura500]}>{newWalletInfo.name}</RNText>
              </View>

              <View style={commonStyles.mb3}>
                <RNText style={[typography.textSm, typography.textGray400, commonStyles.mb1, typography.jura400]}>Address</RNText>
                <RNText style={[typography.textSm, typography.textWhite, typography.mono]}>{newWalletInfo.address}</RNText>
              </View>

              <View>
                <RNText style={[typography.textSm, typography.textGray400, commonStyles.mb1, typography.jura400]}>Derivation Path</RNText>
                <RNText style={[typography.textSm, typography.textWhite, typography.mono]}>{newWalletInfo.derivationPath}</RNText>
              </View>
            </View>
          </View>
        </Card>
      )}

      <Button
        title="Done"
        onPress={handleFinish}
        style={commonStyles.wFull}
      />
    </View>
  );

  return (
    <View style={[commonStyles.flex1, commonStyles.bgBlack]}>
      <View style={[commonStyles.flex1, commonStyles.px4, styles.containerPadding]}>
        {step === 'method' && renderMethodSelection()}
        {step === 'derivation' && renderDerivationSelection()}
        {step === 'naming' && renderNaming()}
        {step === 'confirmation' && renderConfirmation()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Card styles
  card: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: theme.borderWidth.default,
    borderColor: theme.colors.border.light,
  },
  cardSelected: {
    borderColor: 'rgba(6, 235, 241, 0.5)',
    backgroundColor: 'rgba(6, 235, 241, 0.1)',
  },
  cardInactive: {
    borderColor: theme.colors.border.light,
  },

  // Icon containers
  iconContainerPrimary: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(6, 235, 241, 0.2)',
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerSecondary: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(164, 12, 255, 0.2)',
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Badge styles
  successBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.lg,
    borderWidth: theme.borderWidth.default,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  warningBadge: {
    backgroundColor: 'rgba(124, 45, 18, 0.2)',
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.lg,
    borderWidth: theme.borderWidth.default,
    borderColor: 'rgba(249, 115, 22, 0.3)',
  },
  infoBadge: {
    backgroundColor: 'rgba(30, 58, 138, 0.2)',
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.xl,
    borderWidth: theme.borderWidth.default,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },

  // Success icon
  successIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Info icon
  infoIcon: {
    marginTop: 2,
    marginRight: 12,
  },

  // Text colors
  textBlue300: {
    color: '#93c5fd',
  },

  // Container padding
  containerPadding: {
    paddingVertical: theme.spacing[6],
  },
});
