import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Alert,
  Share,
  Pressable,
  StyleSheet,
  Text as RNText,
  Image,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import QRCode from 'react-native-qrcode-svg';
import {BlurContainer, Button, Input} from '@/src/components/ui';
import { walletService } from '@/src/services/walletService';
import { WalletSwitcherModal, type WalletAccount } from '@/src/components/wallet';
import {  copyToClipboard } from '@/src/utils/formatting';
import * as Haptics from 'expo-haptics';
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';
import {typography} from "@/src/styles/typography";
import {InnerContainer} from "@/src/components/ui/InnerContainer";
import {formatAddress} from "@/src/utils/addressValidator";


const POPULAR_TOKENS = [
  { symbol: 'SOL', name: 'Solana', address: 'So11111111111111111111111111111111111111112' },
  { symbol: 'USDC', name: 'USD Coin', address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
  { symbol: 'USDT', name: 'Tether USD', address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' },
  { symbol: 'BONK', name: 'Bonk', address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' },
];

const closeIcon = require('../../assets/images/icons/close.png');
const backIcon = require('../../assets/images/icons/previous.png');
const copyIcon = require('../../assets/images/icons/copy.png');


export default function ReceiveScreen() {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [requestAmount, setRequestAmount] = useState<string>('');
  const [showWalletSwitcher, setShowWalletSwitcher] = useState(false);
  const [qrValue, setQrValue] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const qrRef = React.useRef<any>(null);

  const handleBack = () => {
      router.back();
  };

  const handleClose = () => {
    router.replace('/portfolio');
  }


  useEffect(() => {
    loadWalletAddress();
  }, []);

  useEffect(() => {
    generateQRValue();
  }, [walletAddress, selectedToken, requestAmount]);

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

  const generateQRValue = () => {
    if (!walletAddress) {
      setQrValue('');
      return;
    }

    if (selectedToken && requestAmount) {
      // Create a payment request URL (this would depend on the wallet protocol)
      const paymentRequest = {
        recipient: walletAddress,
        amount: requestAmount,
        token: selectedToken.address,
        label: `Request ${requestAmount} ${selectedToken.symbol}`,
      };
      setQrValue(`solana:${walletAddress}?amount=${requestAmount}&token=${selectedToken.address}`);
    } else {
      setQrValue(walletAddress);
    }
  };

  const handleCopyAddress = async () => {
    await copyToClipboard(walletAddress, 'Address copied to clipboard');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleShareAddress = async () => {
    try {
      const message = `My wallet address: ${walletAddress}`;
      await Share.share({
        message,
        title: 'Share Wallet Address',
      });
    } catch (error) {
      console.error('Failed to share address:', error);
    }
  };

  const handleSaveQRCode = async () => {
    try {
      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to save images');
        return;
      }

      // Capture QR code as image
      if (qrRef.current) {
        const uri = await captureRef(qrRef.current, {
          format: 'png',
          quality: 1,
        });
        
        // Save to photo library
        await MediaLibrary.saveToLibraryAsync(uri);
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Success', 'QR code saved to photos');
      }
    } catch (error) {
      console.error('Failed to save QR code:', error);
      Alert.alert('Error', 'Failed to save QR code');
    }
  };

  const handleTokenSelect = (token: any) => {
    setSelectedToken(token);
  };

  const handleClearRequest = () => {
    setSelectedToken(null);
    setRequestAmount('');
  };

  const handleWalletSelect = (wallet: WalletAccount) => {
    setWalletAddress(wallet.address);
    setShowWalletSwitcher(false);
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

              <RNText style={[typography.daysone, typography.textBase, typography.textWhite]}>MY WALLET</RNText>

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
          </InnerContainer>

          {/* QR Code Card */}
          <View style={styles.qrContainer}>
            <View
              ref={qrRef}
              style={styles.qrCodeWrapper}
            >
              {qrValue ? (
                <QRCode
                  value={qrValue}
                  size={200}
                  color="white"
                  backgroundColor="rgba(0,0,0, 0.01)"
                />
              ) : (
                <View style={styles.qrPlaceholder}>
                  <RNText style={styles.qrPlaceholderText}>
                    Loading QR Code...
                  </RNText>
                </View>
              )}
            </View>

            {/*{selectedToken && requestAmount && (*/}
            {/*  <View style={styles.paymentRequestInfo}>*/}
            {/*    <RNText style={styles.paymentAmount}>*/}
            {/*      {requestAmount} {selectedToken.symbol}*/}
            {/*    </RNText>*/}
            {/*    <RNText style={styles.paymentLabel}>*/}
            {/*      Payment Request*/}
            {/*    </RNText>*/}
            {/*  </View>*/}
            {/*)}*/}

            <InnerContainer style={{padding: 10}}>
              <View style={{paddingHorizontal: 30, paddingBottom: 10}}>
                <RNText style={[typography.jura400,
                  typography.textWhite, {textTransform: 'uppercase', textAlign: 'center', paddingVertical: 5}]}>Your Solana address
                  Use this address to receive tokens and collectibles in Solana.</RNText>
              </View>
              <View style={styles.actionButtonsRow}>



                <Button
                  title="Share"
                  onPress={handleShareAddress}
                  variant="primary"
                  style={styles.actionButton}
                />
                {/*<Button*/}
                {/*  title="Save"*/}
                {/*  onPress={handleSaveQRCode}*/}
                {/*  variant="outline"*/}
                {/*  style={styles.actionButton}*/}
                {/*/>*/}
              </View>

            </InnerContainer>

          </View>

          {/* Wallet Address */}
          {/*<View style={styles.card}>*/}
          {/*  <View style={styles.cardHeader}>*/}
          {/*    <RNText style={styles.cardTitle}>Wallet Address</RNText>*/}
          {/*    <Pressable onPress={() => setShowWalletSwitcher(true)} style={styles.switchButton}>*/}
          {/*      <RNText style={styles.switchButtonText}>Switch</RNText>*/}
          {/*      <Ionicons name="chevron-down" size={16} color="#06EBF1" />*/}
          {/*    </Pressable>*/}
          {/*  </View>*/}

          {/*  <Pressable*/}
          {/*    onPress={handleCopyAddress}*/}
          {/*    style={styles.addressContainer}*/}
          {/*  >*/}
          {/*    <RNText style={styles.addressText}>*/}
          {/*      {formatAddress(walletAddress, 12)}*/}
          {/*    </RNText>*/}
          {/*  </Pressable>*/}
          {/*</View>*/}

          {/* Request Specific Amount */}
          {/*<View style={styles.card}>*/}
          {/*  <View style={styles.cardHeader}>*/}
          {/*    <RNText style={styles.cardTitle}>Request Amount</RNText>*/}
          {/*    {(selectedToken || requestAmount) && (*/}
          {/*      <Pressable onPress={handleClearRequest}>*/}
          {/*        <RNText style={styles.clearButtonText}>Clear</RNText>*/}
          {/*      </Pressable>*/}
          {/*    )}*/}
          {/*  </View>*/}

            {/* Token Selection */}
            {/*<View style={styles.tokenSection}>*/}
            {/*  <RNText style={styles.sectionLabel}>Select Token</RNText>*/}
            {/*  <ScrollView*/}
            {/*    horizontal*/}
            {/*    showsHorizontalScrollIndicator={false}*/}
            {/*    contentContainerStyle={styles.tokenScrollContainer}*/}
            {/*  >*/}
            {/*    {POPULAR_TOKENS.map((token) => (*/}
            {/*      <Pressable*/}
            {/*        key={token.address}*/}
            {/*        onPress={() => handleTokenSelect(token)}*/}
            {/*        style={[*/}
            {/*          styles.tokenButton,*/}
            {/*          selectedToken?.address === token.address && styles.tokenButtonSelected*/}
            {/*        ]}*/}
            {/*      >*/}
            {/*        <RNText style={[*/}
            {/*          styles.tokenButtonText,*/}
            {/*          selectedToken?.address === token.address && styles.tokenButtonTextSelected*/}
            {/*        ]}>*/}
            {/*          {token.symbol}*/}
            {/*        </RNText>*/}
            {/*      </Pressable>*/}
            {/*    ))}*/}
            {/*  </ScrollView>*/}
            {/*</View>*/}

            {/* Amount Input */}
          {/*  {selectedToken && (*/}
          {/*    <View style={styles.amountSection}>*/}
          {/*      <Input*/}
          {/*        label="Amount"*/}
          {/*        placeholder="0.00"*/}
          {/*        value={requestAmount}*/}
          {/*        onChangeText={setRequestAmount}*/}
          {/*        keyboardType="numeric"*/}
          {/*        rightIcon={*/}
          {/*          <RNText style={styles.amountCurrencyText}>*/}
          {/*            {selectedToken.symbol}*/}
          {/*          </RNText>*/}
          {/*        }*/}
          {/*      />*/}
          {/*    </View>*/}
          {/*  )}*/}
          {/*</View>*/}

          {/* Instructions */}
          {/*<View style={styles.card}>*/}
          {/*  <RNText style={styles.cardTitle}>How to Receive</RNText>*/}

          {/*  <View style={styles.instructionsContainer}>*/}
          {/*    <View style={styles.instructionRow}>*/}
          {/*      <View style={styles.stepNumber}>*/}
          {/*        <RNText style={styles.stepNumberText}>1</RNText>*/}
          {/*      </View>*/}
          {/*      <RNText style={styles.instructionText}>*/}
          {/*        Share your wallet address or QR code with the sender*/}
          {/*      </RNText>*/}
          {/*    </View>*/}

          {/*    <View style={styles.instructionRow}>*/}
          {/*      <View style={styles.stepNumber}>*/}
          {/*        <RNText style={styles.stepNumberText}>2</RNText>*/}
          {/*      </View>*/}
          {/*      <RNText style={styles.instructionText}>*/}
          {/*        Wait for the transaction to be confirmed on the blockchain*/}
          {/*      </RNText>*/}
          {/*    </View>*/}

          {/*    <View style={styles.instructionRow}>*/}
          {/*      <View style={styles.stepNumber}>*/}
          {/*        <RNText style={styles.stepNumberText}>3</RNText>*/}
          {/*      </View>*/}
          {/*      <RNText style={styles.instructionText}>*/}
          {/*        Tokens will appear in your wallet automatically*/}
          {/*      </RNText>*/}
          {/*    </View>*/}
          {/*  </View>*/}
          {/*</View>*/}

        </BlurContainer>




      </ScrollView>

      {/* Wallet Switcher Modal */}
      {/*<WalletSwitcherModal*/}
      {/*  visible={showWalletSwitcher}*/}
      {/*  onClose={() => setShowWalletSwitcher(false)}*/}
      {/*  onSelectWallet={handleWalletSelect}*/}
      {/*  onAddWallet={() => router.push('/wallet/create')}*/}
      {/*  wallets={mockWallets}*/}
      {/*  currentWallet={mockWallets.find(w => w.address === walletAddress)}*/}
      {/*/>*/}
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
