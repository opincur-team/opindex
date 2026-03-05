import React, { useState } from 'react';
import { View, ScrollView, Alert, Pressable, StyleSheet, Text as RNText } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card, Button, Input } from '@/src/components/ui';
import { SeedPhraseInput } from '@/src/components/common';
import { walletService } from '@/src/services/walletService';
import { walletRegistrationService } from '@/src/services/walletRegistrationService';
import { registrationQueueService } from '@/src/services/registrationQueueService';
import { isValidAddress } from '@/src/utils/formatting';
import * as Haptics from 'expo-haptics';
import { theme } from '@/src/styles/theme';
import { commonStyles } from '@/src/styles/common';
import { typography } from '@/src/styles/typography';

type ImportMethod = 'seed' | 'privateKey' | null;
type ImportStep = 'method' | 'input' | 'validation' | 'naming' | 'confirmation';

interface WalletPreview {
  address: string;
  publicKey: string;
  balance?: number;
}

export default function ImportWalletScreen() {
  const [step, setStep] = useState<ImportStep>('method');
  const [importMethod, setImportMethod] = useState<ImportMethod>(null);
  const [seedPhrase, setSeedPhrase] = useState<string[]>([]);
  const [privateKey, setPrivateKey] = useState('');
  const [walletName, setWalletName] = useState('');
  const [walletPreview, setWalletPreview] = useState<WalletPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleMethodSelection = (method: ImportMethod) => {
    setImportMethod(method);
    setStep('input');
    setValidationError(null);
  };

  const validateAndPreview = async () => {
    setValidationError(null);
    setLoading(true);

    try {
      if (importMethod === 'seed') {
        // Validate seed phrase
        if (seedPhrase.length < 12 || seedPhrase.some(word => !word.trim())) {
          setValidationError('Please enter a complete seed phrase (12 or 24 words)');
          return;
        }

        // Validate mnemonic format
        const mnemonicString = seedPhrase.join(' ');
        // In a real implementation, validate with bip39
        if (!mnemonicString) {
          setValidationError('Invalid seed phrase format');
          return;
        }

        // Preview wallet
        const mockPreview: WalletPreview = {
          address: 'Import' + Math.random().toString(36).substring(7),
          publicKey: 'pub' + Math.random().toString(36).substring(7),
          balance: 0,
        };
        
        setWalletPreview(mockPreview);
        setWalletName('Imported Wallet');

      } else if (importMethod === 'privateKey') {
        // Validate private key
        if (!privateKey.trim()) {
          setValidationError('Please enter a private key');
          return;
        }

        if (privateKey.length < 32) {
          setValidationError('Invalid private key format');
          return;
        }

        // Preview wallet
        const mockPreview: WalletPreview = {
          address: 'PrivKey' + Math.random().toString(36).substring(7),
          publicKey: 'pub' + Math.random().toString(36).substring(7),
          balance: 0,
        };
        
        setWalletPreview(mockPreview);
        setWalletName('Imported Wallet');
      }

      setStep('validation');
    } catch (error) {
      setValidationError('Failed to validate wallet data');
      console.error('Validation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImportWallet = async () => {
    if (!walletName.trim()) {
      Alert.alert('Name Required', 'Please enter a name for your wallet.');
      return;
    }

    try {
      setLoading(true);

      let result;
      if (importMethod === 'seed') {
        result = await walletService.importWallet(seedPhrase);
      } else {
        // Private key import would be implemented here
        throw new Error('Private key import not yet implemented');
      }

      // Register imported additional wallet with backend (with background retry on failure)
      if (result?.address) {
        try {
          await walletRegistrationService.registerWallet(result.address);
          console.log('✅ Imported wallet registered successfully');
        } catch (registrationError) {
          console.warn('⚠️ Imported wallet registration failed, adding to queue:', registrationError);
          await registrationQueueService.addToQueue(result.address);
        }
      }

      setStep('confirmation');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Import error:', error);
      Alert.alert('Import Failed', 'Failed to import wallet. Please check your input and try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderMethodSelection = () => (
    <ScrollView
      style={commonStyles.flex1}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <RNText style={[typography.h2, typography.audiowide, typography.textWhite, commonStyles.mb2, commonStyles.textCenter]}>
        Import Wallet
      </RNText>
      <RNText style={[typography.textBase, typography.jura400, typography.textGray400, commonStyles.textCenter, commonStyles.mb8]}>
        Choose how you want to import your wallet
      </RNText>

      <View>
        <Card style={{ marginBottom: 16 }}>
          <Pressable
            onPress={() => handleMethodSelection('seed')}
            style={styles.pressablePadding}
          >
            <View style={[styles.rowCenter, commonStyles.mb3]}>
              <View style={[styles.iconContainer, styles.iconPrimary]}>
                <Ionicons name="key-outline" size={24} color="#06EBF1" />
              </View>
              <View style={commonStyles.flex1}>
                <RNText style={[typography.textLg, typography.jura600, typography.textWhite]}>
                  Seed Phrase
                </RNText>
                <RNText style={[typography.textSm, typography.jura400, typography.textColorPrimary]}>
                  Most Common
                </RNText>
              </View>
            </View>
            <RNText style={[typography.textSm, typography.jura400, typography.textGray300, commonStyles.mb4]}>
              Import your wallet using a 12 or 24 word recovery phrase. This is the most common backup method.
            </RNText>
            <View style={[styles.infoBox, styles.successBox]}>
              <RNText style={[typography.textXs, typography.jura400, typography.textGreen400]}>
                ✓ Secure ✓ Standard format ✓ Compatible with most wallets
              </RNText>
            </View>
          </Pressable>
        </Card>

        <Card>
          <Pressable
            onPress={() => handleMethodSelection('privateKey')}
            style={styles.pressablePadding}
          >
            <View style={[styles.rowCenter, commonStyles.mb3]}>
              <View style={[styles.iconContainer, styles.iconSecondary]}>
                <Ionicons name="finger-print-outline" size={24} color="#A40CFF" />
              </View>
              <View style={commonStyles.flex1}>
                <RNText style={[typography.textLg, typography.jura600, typography.textWhite]}>
                  Private Key
                </RNText>
                <RNText style={[typography.textSm, typography.jura400, typography.textGray400]}>
                  Advanced
                </RNText>
              </View>
            </View>
            <RNText style={[typography.textSm, typography.jura400, typography.textGray300, commonStyles.mb4]}>
              Import using a private key directly. This method is for advanced users who have exported their private key.
            </RNText>
            <View style={[styles.infoBox, styles.warningBox]}>
              <RNText style={[typography.textXs, typography.jura400, typography.textOrange400]}>
                ⚠️ Advanced users only ⚠️ Ensure private key is secure
              </RNText>
            </View>
          </Pressable>
        </Card>
      </View>

      <View style={commonStyles.mt8}>
        <Button
          title="Cancel"
          onPress={() => router.back()}
          variant="outline"
          style={styles.buttonFull}
        />
      </View>
    </ScrollView>
  );

  const renderSeedPhraseInput = () => (
    <ScrollView
      style={commonStyles.flex1}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <RNText style={[typography.h2, typography.audiowide, typography.textWhite, commonStyles.mb2, commonStyles.textCenter]}>
        Enter Seed Phrase
      </RNText>
      <RNText style={[typography.textBase, typography.jura400, typography.textGray400, commonStyles.textCenter, commonStyles.mb8]}>
        Enter your 12 or 24 word recovery phrase
      </RNText>

      <View style={commonStyles.mb6}>
        <SeedPhraseInput
          seedPhrase={seedPhrase}
          onSeedPhraseChange={setSeedPhrase}
          wordCount={12}
          editable={true}
        />

        {validationError && (
          <View style={[styles.infoBox, styles.errorBox, commonStyles.mt4]}>
            <View style={[styles.row, { alignItems: 'flex-start' }]}>
              <Ionicons name="alert-circle" size={20} color="#ef4444" style={{ marginTop: 2, marginRight: 12 }} />
              <RNText style={[typography.textSm, typography.jura400, typography.textRed400, commonStyles.flex1]}>
                {validationError}
              </RNText>
            </View>
          </View>
        )}
      </View>

      <View style={styles.buttonRow}>
        <Button
          title="Back"
          onPress={() => setStep('method')}
          variant="outline"
          style={styles.buttonLeft}
        />
        <Button
          title="Continue"
          onPress={validateAndPreview}
          loading={loading}
          style={styles.buttonRight}
          disabled={seedPhrase.length < 12}
        />
      </View>
    </ScrollView>
  );

  const renderPrivateKeyInput = () => (
    <ScrollView
      style={commonStyles.flex1}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <RNText style={[typography.h2, typography.audiowide, typography.textWhite, commonStyles.mb2, commonStyles.textCenter]}>
        Enter Private Key
      </RNText>
      <RNText style={[typography.textBase, typography.jura400, typography.textGray400, commonStyles.textCenter, commonStyles.mb8]}>
        Enter your wallet&apos;s private key
      </RNText>

      <View style={commonStyles.mb6}>
        <Input
          label="Private Key"
          placeholder="Enter your private key..."
          value={privateKey}
          onChangeText={setPrivateKey}
          multiline
          numberOfLines={4}
          secureTextEntry
          style={commonStyles.mb4}
        />

        <View style={[styles.infoBox, styles.warningBox]}>
          <View style={[styles.row, { alignItems: 'flex-start' }]}>
            <Ionicons name="warning" size={20} color="#f59e0b" style={{ marginTop: 2, marginRight: 12 }} />
            <View style={commonStyles.flex1}>
              <RNText style={[typography.textSm, typography.jura500, typography.textOrange400, commonStyles.mb1]}>
                Security Warning
              </RNText>
              <RNText style={[typography.textSm, typography.jura400, typography.textOrange300]}>
                Never share your private key with anyone. Make sure you&apos;re in a secure environment.
              </RNText>
            </View>
          </View>
        </View>

        {validationError && (
          <View style={[styles.infoBox, styles.errorBox, commonStyles.mt4]}>
            <View style={[styles.row, { alignItems: 'flex-start' }]}>
              <Ionicons name="alert-circle" size={20} color="#ef4444" style={{ marginTop: 2, marginRight: 12 }} />
              <RNText style={[typography.textSm, typography.jura400, typography.textRed400, commonStyles.flex1]}>
                {validationError}
              </RNText>
            </View>
          </View>
        )}
      </View>

      <View style={styles.buttonRow}>
        <Button
          title="Back"
          onPress={() => setStep('method')}
          variant="outline"
          style={styles.buttonLeft}
        />
        <Button
          title="Continue"
          onPress={validateAndPreview}
          loading={loading}
          style={styles.buttonRight}
          disabled={!privateKey.trim()}
        />
      </View>
    </ScrollView>
  );

  const renderValidation = () => (
    <ScrollView
      style={commonStyles.flex1}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <RNText style={[typography.h2, typography.audiowide, typography.textWhite, commonStyles.mb2, commonStyles.textCenter]}>
        Wallet Preview
      </RNText>
      <RNText style={[typography.textBase, typography.jura400, typography.textGray400, commonStyles.textCenter, commonStyles.mb8]}>
        Verify this is the correct wallet
      </RNText>

      {walletPreview && (
        <Card style={{ marginBottom: 24 }}>
          <View style={commonStyles.p4}>
            <RNText style={[typography.textBase, typography.jura600, typography.textWhite, commonStyles.mb4]}>Wallet Information</RNText>

            <View>
              <View style={commonStyles.mb3}>
                <RNText style={[typography.textSm, typography.jura400, typography.textGray400, commonStyles.mb1]}>Address</RNText>
                <RNText style={[typography.textSm, typography.mono, typography.textWhite]}>{walletPreview.address}</RNText>
              </View>

              <View style={commonStyles.mb3}>
                <RNText style={[typography.textSm, typography.jura400, typography.textGray400, commonStyles.mb1]}>Public Key</RNText>
                <RNText style={[typography.textSm, typography.mono, typography.textWhite]}>{walletPreview.publicKey}</RNText>
              </View>

              <View>
                <RNText style={[typography.textSm, typography.jura400, typography.textGray400, commonStyles.mb1]}>Balance</RNText>
                <RNText style={[typography.textBase, typography.jura500, typography.textWhite]}>
                  {walletPreview.balance?.toFixed(4) || '0.0000'} SOL
                </RNText>
              </View>
            </View>
          </View>
        </Card>
      )}

      <View style={commonStyles.mb6}>
        <Input
          label="Wallet Name"
          placeholder="Enter wallet name"
          value={walletName}
          onChangeText={setWalletName}
          maxLength={32}
        />
      </View>

      <View style={styles.buttonRow}>
        <Button
          title="Back"
          onPress={() => setStep('input')}
          variant="outline"
          style={styles.buttonLeft}
        />
        <Button
          title="Import Wallet"
          onPress={handleImportWallet}
          loading={loading}
          style={styles.buttonRight}
          disabled={!walletName.trim()}
        />
      </View>
    </ScrollView>
  );

  const renderConfirmation = () => (
    <ScrollView
      style={commonStyles.flex1}
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.centered, commonStyles.mb8]}>
        <View style={styles.checkmark}>
          <Ionicons name="checkmark" size={40} color="#22c55e" />
        </View>
        <RNText style={[typography.h2, typography.audiowide, typography.textWhite, commonStyles.mb2, commonStyles.textCenter]}>
          Import Successful!
        </RNText>
        <RNText style={[typography.textBase, typography.jura400, typography.textGray400, commonStyles.textCenter]}>
          Your wallet has been imported successfully
        </RNText>
      </View>

      <Card variant="solid" style={{ marginBottom: 32, backgroundColor: 'rgba(20, 83, 45, 0.2)', borderWidth: 1, borderColor: 'rgba(34, 197, 94, 0.3)' }}>
        <View style={commonStyles.p4}>
          <View style={[styles.row, { alignItems: 'flex-start' }]}>
            <Ionicons name="shield-checkmark" size={20} color="#22c55e" style={{ marginTop: 2, marginRight: 12 }} />
            <View style={commonStyles.flex1}>
              <RNText style={[typography.textSm, typography.jura500, typography.textGreen400, commonStyles.mb1]}>
                Important Reminder
              </RNText>
              <RNText style={[typography.textSm, typography.jura400, { color: theme.colors.green[400], opacity: 0.8 }]}>
                Make sure to securely back up this wallet&apos;s recovery information. You can view your seed phrase in wallet settings.
              </RNText>
            </View>
          </View>
        </View>
      </Card>

      <Button
        title="Done"
        onPress={() => router.back()}
        style={styles.buttonFull}
      />
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {step === 'method' && renderMethodSelection()}
        {step === 'input' && importMethod === 'seed' && renderSeedPhraseInput()}
        {step === 'input' && importMethod === 'privateKey' && renderPrivateKeyInput()}
        {step === 'validation' && renderValidation()}
        {step === 'confirmation' && renderConfirmation()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: theme.colors.black,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[6],
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Common layouts
  row: {
    flexDirection: 'row',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  centered: {
    alignItems: 'center',
  },

  // Pressable areas
  pressablePadding: {
    padding: theme.spacing[6],
  },

  // Icon containers
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing[4],
  },
  iconPrimary: {
    backgroundColor: theme.colors.primary,
    opacity: 0.2,
  },
  iconSecondary: {
    backgroundColor: theme.colors.secondary,
    opacity: 0.2,
  },
  checkmark: {
    width: 80,
    height: 80,
    backgroundColor: theme.colors.green[500],
    opacity: 0.2,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[4],
  },

  // Info boxes
  infoBox: {
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.lg,
    borderWidth: theme.borderWidth.default,
  },
  successBox: {
    backgroundColor: theme.colors.green[900],
    opacity: 0.2,
    borderColor: theme.colors.green[500],
  },
  warningBox: {
    backgroundColor: theme.colors.orange[900],
    opacity: 0.2,
    borderColor: theme.colors.orange[500],
  },
  errorBox: {
    backgroundColor: theme.colors.red[900],
    opacity: 0.2,
    borderColor: theme.colors.red[500],
  },

  // Button rows
  buttonRow: {
    flexDirection: 'row',
  },
  buttonLeft: {
    flex: 1,
    marginRight: theme.spacing[3],
  },
  buttonRight: {
    flex: 1,
  },
  buttonFull: {
    width: '100%',
  },
});
