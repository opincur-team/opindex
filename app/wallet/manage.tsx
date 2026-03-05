import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Alert,
  Pressable,
  StyleSheet,
  Text as RNText,
  Image,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';


import {BlurContainer, Button} from '@/src/components/ui';
import { walletService } from '@/src/services/walletService';
import {  copyToClipboard } from '@/src/utils/formatting';
import * as Haptics from 'expo-haptics';
import {typography} from "@/src/styles/typography";
import {InnerContainer} from "@/src/components/ui/InnerContainer";
import {formatAddress} from "@/src/utils/addressValidator";
import {ConfirmationModalDialog} from "@/src/components/ui/ConfirmationModalDialog";
import { SeedPhraseDisplay } from '@/src/components/common/SeedPhraseDisplay';
import { openUrl } from '@/src/utils/browser';



const closeIcon = require('../../assets/images/icons/close.png');
const backIcon = require('../../assets/images/icons/previous.png');
const copyIcon = require('../../assets/images/icons/copy.png');


export default function ReceiveScreen() {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState<string[]>([]);

  const handleBack = () => {
    router.back();
  };

  const handleClose = () => {
    router.replace('/portfolio');
  }


  useEffect(() => {
    loadWalletAddress();
  }, []);


  const loadWalletAddress = async () => {
    try {
      setLoading(true);
      const walletInfo = await walletService.getWalletInfo();
      if (walletInfo?.address) {
        setWalletAddress(walletInfo.address);
      }
    } catch (error) {
      console.error('Failed to load wallet address:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleCopyAddress = async () => {
    await copyToClipboard(walletAddress,);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDeleteWallet = () => {
    setShowDeleteConfirm(true);
  };

  const handleViewSeedPhrase = async () => {
    try {
      const exportedSeedPhrase = await walletService.exportWallet();
      setSeedPhrase(exportedSeedPhrase);
      setShowSeedPhrase(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to retrieve seed phrase.');
    }
  }

  const handleOpenTermsPage = () => {
    openUrl('https://opindex.io/wallet-terms');
  }

  const handleOpenPrivacyPage = () => {
    openUrl('https://opindex.io/wallet-privacy');
  }

  const confirmDeleteWallet = async () => {
    try {
      await walletService.deleteWallet();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(auth)/onboarding');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete wallet. Please try again.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <RNText style={styles.loadingText}>Loading...</RNText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>

        <BlurContainer>
          <InnerContainer style={{padding: 10}}>
            <View style={{marginBottom: 10 , flexDirection: 'row', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10}}>
              <Pressable onPress={handleBack}>
                <Image source={backIcon} style={{width: 18, height: 18}}/>
              </Pressable>

              <RNText style={[typography.daysone, typography.textBase, typography.textWhite]}>MY WALLETS</RNText>

              <Pressable onPress={handleClose}>
                <Image source={closeIcon} style={{width: 18, height: 18}}/>
              </Pressable>

            </View>


            <TouchableOpacity onPress={handleCopyAddress}>
              <InnerContainer style={{padding: 10, paddingVertical: 20, borderRadius: 20, display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10}}>

                <RNText style={[styles.addressText, typography.daysone]}>
                  {formatAddress(walletAddress,  4, 4)}
                </RNText>

                <Image source={copyIcon} style={{width: 18, height: 18}}/>
              </InnerContainer>
            </TouchableOpacity>

            <View style={{display: 'flex', gap: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10}}>

              <View style={{width: '48%'}}>
                <Button title="VIEW SEED"
                        style={{padding: 20}}
                        onPress={handleViewSeedPhrase}
                        variant="primary" size="sm"/>
              </View>


              <View style={{width: '48%'}}>
                <Button title='DELETE WALLET' onPress={handleDeleteWallet}
                        variant="danger" style={{padding: 20}} size="sm"/>
              </View>

            </View>



          </InnerContainer>
          <InnerContainer style={{padding: 10, marginTop: 10, display: "flex", gap: 10}}>
            <Button title="TERMS OF CONDITIONS"  onPress={handleOpenTermsPage} variant="primary"/>
            <Button title="PRIVACY POLICY" onPress={handleOpenPrivacyPage} variant="primary" />
          </InnerContainer>
        </BlurContainer>
      </ScrollView>

      <ConfirmationModalDialog
        visible={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Wallet"
        actions={
          <View style={{ gap: 10 }}>
            <Button
              title="Delete Wallet"
              variant="danger"
              onPress={confirmDeleteWallet}
            />
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => setShowDeleteConfirm(false)}
            />
          </View>
        }
      >
        <RNText style={[typography.daysone, typography.textWhite, { textAlign: 'left', paddingHorizontal: 20, marginBottom: 10}]}>
          Are you sure you want to delete your wallet? Once deleted, it can only be restored using your seed phrase. Make sure you have it saved in a secure place.
        </RNText>

      </ConfirmationModalDialog>

      <ConfirmationModalDialog
        visible={showSeedPhrase}
        onClose={() => {
          setShowSeedPhrase(false);
          setSeedPhrase([]);
        }}
        title="Your Seed Phrase"
        actions={
          <Button
            title="Close"
            variant="outline"
            onPress={() => {
              setShowSeedPhrase(false);
              setSeedPhrase([]);
            }}
          />
        }
      >
        <SeedPhraseDisplay
          seedPhrase={seedPhrase}
          isBlurred={true}
          showCopyButton={true}
        />
      </ConfirmationModalDialog>
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
    paddingHorizontal: 10,
    paddingVertical: 10,
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
  qrContainer: {
    alignItems: 'center',
    marginVertical: 0,
    marginTop: 10,
  },
  qrCodeWrapper: {
    backgroundColor: 'rgba(0,0,0, 0)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrPlaceholderText: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
  },
  paymentRequestInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  paymentAmount: {
    color: '#06EBF1',
    fontSize: 18,
    fontWeight: '600',
  },
  paymentLabel: {
    color: '#a0a0a0',
    fontSize: 14,
    marginTop: 4,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  actionButton: {
    flex: 1,
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchButtonText: {
    color: '#06EBF1',
    fontSize: 14,
    marginRight: 8,
  },
  addressContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  addressText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  clearButtonText: {
    color: '#ef4444',
    fontSize: 14,
  },
  tokenSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    color: '#a0a0a0',
    fontSize: 14,
    marginBottom: 12,
    fontWeight: '500',
  },
  tokenScrollContainer: {
    gap: 12,
  },
  tokenButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  tokenButtonSelected: {
    backgroundColor: 'rgba(6, 235, 241, 0.2)',
    borderColor: 'rgba(6, 235, 241, 0.5)',
  },
  tokenButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  tokenButtonTextSelected: {
    color: '#06EBF1',
  },
  amountSection: {
    marginTop: 16,
  },
  amountCurrencyText: {
    color: '#a0a0a0',
    fontSize: 14,
  },
  instructionsContainer: {
    marginTop: 12,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 24,
    height: 24,
    backgroundColor: 'rgba(6, 235, 241, 0.2)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: '#06EBF1',
    fontSize: 12,
    fontWeight: '600',
  },
  instructionText: {
    color: '#d1d5db',
    fontSize: 14,
    flex: 1,
    lineHeight: 18,
  },
  backButton: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },

});
