import React, { useState, useEffect } from 'react';
import { View, Text as RNText, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/src/components/ui';
import { walletService } from '@/src/services/walletService';

export default function BiometricSetupScreen() {
  const router = useRouter();
  const [biometricCapability, setBiometricCapability] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    loadBiometricCapability();
  }, []);

  const loadBiometricCapability = async () => {
    try {
      const capability = await walletService.getBiometricCapability();
      setBiometricCapability(capability);
    } catch (error) {
      console.error('Failed to load biometric capability:', error);
    }
  };

  const handleEnableBiometric = async () => {
    setIsLoading(true);
    try {
      const success = await walletService.setupBiometric();
      if (success) {
        setIsEnabled(true);
        Alert.alert(
          'Biometric Setup Complete',
          'You can now use biometric authentication to unlock your wallet.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert(
          'Setup Failed',
          'Failed to enable biometric authentication. Please try again.'
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'An error occurred while setting up biometric authentication.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Biometric Setup',
      'You can enable biometric authentication later in settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Skip', onPress: () => router.back() }
      ]
    );
  };

  const getBiometricIcon = () => {
    if (!biometricCapability) return 'finger-print';
    
    const types = biometricCapability.supportedTypes || [];
    if (types.includes(2)) return 'face-recognition'; // Face ID
    if (types.includes(1)) return 'finger-print'; // Touch ID
    return 'lock-closed';
  };

  const getBiometricText = () => {
    if (!biometricCapability) return 'Biometric Authentication';
    
    const types = biometricCapability.supportedTypes || [];
    if (types.includes(2)) return 'Face ID';
    if (types.includes(1)) return 'Touch ID';
    return 'Biometric Authentication';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <RNText style={styles.title}>
          Setup Security
        </RNText>
        <RNText style={styles.subtitle}>
          Enable biometric authentication for secure and convenient wallet access
        </RNText>

        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons 
              name={getBiometricIcon()} 
              size={64} 
              color="#06EBF1" 
            />
          </View>
        </View>

        <View style={styles.card}>
          <RNText style={styles.cardTitle}>
            🔐 {getBiometricText()}
          </RNText>
          
          {biometricCapability && (
            <>
              <RNText style={styles.infoItem}>
                • Hardware available: {biometricCapability.hasHardware ? '✅ Yes' : '❌ No'}
              </RNText>
              <RNText style={styles.infoItem}>
                • Biometrics enrolled: {biometricCapability.isEnrolled ? '✅ Yes' : '❌ No'}
              </RNText>
              <RNText style={[styles.infoItem, { marginBottom: 0 }]}>
                • Status: {biometricCapability.isAvailable ? '✅ Ready to use' : '❌ Not available'}
              </RNText>
            </>
          )}
        </View>

        {biometricCapability?.isAvailable ? (
          <View style={styles.benefitsCard}>
            <RNText style={styles.benefitsTitle}>
              ✨ Benefits
            </RNText>
            <RNText style={styles.benefitItem}>
              • Quick and secure wallet access
            </RNText>
            <RNText style={styles.benefitItem}>
              • No need to remember PINs
            </RNText>
            <RNText style={[styles.benefitItem, { marginBottom: 0 }]}>
              • Enhanced security protection
            </RNText>
          </View>
        ) : (
          <View style={styles.warningCard}>
            <RNText style={styles.warningTitle}>
              ⚠️ Biometric Not Available
            </RNText>
            <RNText style={styles.warningText}>
              {!biometricCapability?.hasHardware 
                ? 'Your device does not support biometric authentication.'
                : 'Please set up biometric authentication in your device settings first.'
              }
            </RNText>
          </View>
        )}

        <View style={styles.buttonContainer}>
          {biometricCapability?.isAvailable ? (
            <Button 
              title={isLoading ? 'Setting up...' : `Enable ${getBiometricText()}`}
              onPress={handleEnableBiometric}
              disabled={isLoading || isEnabled}
            />
          ) : null}
          
          <Button 
            title={biometricCapability?.isAvailable ? 'Skip for Now' : 'Continue'}
            onPress={handleSkip}
            variant="outline"
          />
        </View>

        {isEnabled && (
          <View style={styles.successCard}>
            <RNText style={styles.successText}>
              ✅ Biometric authentication has been enabled successfully!
            </RNText>
          </View>
        )}
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
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    backgroundColor: 'rgba(6, 235, 241, 0.2)',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(6, 235, 241, 0.3)',
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
  benefitsCard: {
    backgroundColor: 'rgba(6, 235, 241, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(6, 235, 241, 0.3)',
  },
  benefitsTitle: {
    color: '#06EBF1',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  benefitItem: {
    color: '#06EBF1',
    fontSize: 14,
    marginBottom: 6,
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
  successCard: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.3)',
  },
  successText: {
    color: '#00FF88',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});