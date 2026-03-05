import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image, ImageBackground, Alert, ActivityIndicator, Pressable, Text as RNText  } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { CameraView, Camera } from 'expo-camera';
import { BlurContainer } from '@/src/components/ui/BlurContainer';
import { BlurContainerExpanded } from '@/src/components/ui/BlurContainerExpanded';
import { InnerContainer } from '@/src/components/ui/InnerContainer';
import { AddressInput } from '@/src/components/ui/AddressInput';
import { NumericKeypad } from '@/src/components/ui/NumericKeypad';
import { CustomDropdownTokens, TokenDropdownItem } from '@/src/components/ui/CustomDropdownTokens';
import { TransferConfirmationModal } from '@/src/components/transfer/ConfirmationModal';
import { RecipientListItem } from '@/src/components/recipients/RecipientListItem';
import { RecipientEditModal } from '@/src/components/recipients/RecipientEditModal';
import { usePortfolio, useCompleteTransfer } from '@/src/hooks/queries';
import { walletService } from '@/src/services/walletService';
import { formatAddress, isValidSolanaAddress } from '@/src/utils/addressValidator';
import { theme } from '@/src/styles/theme';
import { typography } from '@/src/styles/typography';
import { Recipient } from '@/src/types/recipient';
import * as recipientsService from '@/src/services/recipientsService';
import { sortRecipients, filterRecipients } from '@/src/utils/recipientHelpers';
import {Button} from "@/src/components/ui";
import {copyToClipboard} from "@/src/utils/formatting";
import * as Haptics from "expo-haptics";

const scanIcon = require('../../assets/images/icons/scan.png');
const sendIcon = require('../../assets/images/icons/send.png');
const closeIcon = require('../../assets/images/icons/close.png');
const backIcon = require('../../assets/images/icons/previous.png');
const copyIcon = require('../../assets/images/icons/copy.png');

type SendStep = 'select' | 'scan' | 'amount';

export default function SendScreen() {
  const params = useLocalSearchParams<{ startScan?: string; tokenMint?: string; tokenSymbol?: string }>();
  const [currentStep, setCurrentStep] = useState<SendStep>(
    params.startScan === 'true' ? 'scan' : 'select'
  );
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isValidAddress, setIsValidAddress] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const { data: portfolio, isLoading: isLoadingPortfolio } = usePortfolio(walletAddress);
  const completeTransfer = useCompleteTransfer();

  // Amount entry states
  const [amount, setAmount] = useState('0');
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TokenDropdownItem | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [estimatedFee, setEstimatedFee] = useState<number | undefined>();
  const [requiresATA, setRequiresATA] = useState<boolean>(false);

  // QR scanner states
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const scanningLockRef = useRef(false);

  // Recipients states
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState<Recipient | null>(null);


  const handleCopyAddress = async () => {
    await copyToClipboard(recipientAddress);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // Get wallet address on mount
  useEffect(() => {
    const loadWalletAddress = async () => {
      try {
        const walletInfo = await walletService.getWalletInfo();
        if (walletInfo?.address) {
          setWalletAddress(walletInfo.address);
        }
      } catch (error) {
        console.error('Failed to load wallet address:', error);
      }
    };
    loadWalletAddress();
  }, []);

  // Set default token when portfolio loads - prioritize tokenMint param
  useEffect(() => {
    if (portfolio?.tokens && portfolio.tokens.length > 0 && !selectedToken) {
      let tokenToSelect = portfolio.tokens[0]; // default to first token

      // If tokenMint param exists, try to find that token
      if (params.tokenMint) {
        const matchingToken = portfolio.tokens.find(
          t => t.mintAddress === params.tokenMint
        );
        if (matchingToken) {
          tokenToSelect = matchingToken;
        }
      }

      setSelectedToken({
        id: tokenToSelect.mintAddress,
        symbol: tokenToSelect.symbol,
        balance: tokenToSelect.balance,
        logo: tokenToSelect.logo,
        name: tokenToSelect.name,
      });
    }
  }, [portfolio, params.tokenMint]);

  // Handle QR scanner permissions
  useEffect(() => {
    if (currentStep === 'scan') {
      const getCameraPermissions = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      };
      getCameraPermissions();
    }
  }, [currentStep]);

  // Load recipients on mount
  useEffect(() => {
    loadRecipients();
  }, []);

  const loadRecipients = async () => {
    const allRecipients = await recipientsService.getRecipients();
    setRecipients(allRecipients);
  };

  const handleScanQR = () => {
    setCurrentStep('scan');
    setScanned(false);
  };

  const handleValidAddress = (address: string) => {
    setIsValidAddress(true);
  };

  const handleContinue = async () => {
    if (isValidAddress && recipientAddress) {
      // Update last used if this address is in recipients
      await recipientsService.updateLastUsed(recipientAddress);
      setCurrentStep('amount');
    }
  };

  const handleRecipientSelect = (recipient: Recipient) => {
    setRecipientAddress(recipient.address);
    setIsValidAddress(true);
  };

  // const handleAddToRecipients = () => {
  //   setEditingRecipient(null);
  //   setShowEditModal(true);
  // };

  const handleEditRecipient = (recipient: Recipient) => {
    setEditingRecipient(recipient);
    setShowEditModal(true);
  };

  const handleClose = () => {
    router.replace('/portfolio');
  }

  const handleSaveRecipient = async (name: string) => {
    try {
      if (editingRecipient) {
        // Update existing recipient
        await recipientsService.updateRecipient(editingRecipient.id, { name });
        Alert.alert('Success', 'Recipient updated successfully');
      } else {
        // Add new recipient
        await recipientsService.saveRecipient({
          address: recipientAddress,
          name,
          isFavorite: false,
        });
        Alert.alert('Success', 'Recipient added successfully');
      }
      await loadRecipients();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save recipient');
    }
  };

  const handleToggleFavorite = async (recipient: Recipient) => {
    try {
      await recipientsService.toggleFavorite(recipient.id);
      await loadRecipients();
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    // Check synchronous lock first to prevent race conditions
    if (scanningLockRef.current) return;
    if (scanned) return;

    // Set synchronous lock immediately
    scanningLockRef.current = true;
    setScanned(true);

    if (isValidSolanaAddress(data)) {
      setRecipientAddress(data);
      setIsValidAddress(true);
      setCurrentStep('select');
      // Reset lock after navigation
      scanningLockRef.current = false;
    } else {
      Alert.alert(
        'Invalid Address',
        'The scanned QR code does not contain a valid Solana address.',
        [
          {
            text: 'Try Again',
            onPress: () => {
              setScanned(false);
              scanningLockRef.current = false;
            },
          },
          {
            text: 'Cancel',
            onPress: () => {
              setCurrentStep('select');
              scanningLockRef.current = false;
            },
            style: 'cancel',
          },
        ]
      );
    }
  };

  const handleNumberPress = (num: string) => {
    setHasStartedTyping(true);

    if (amount === '0') {
      if (num === '0') {
        return;
      }
      setAmount(num);
    } else {
      setAmount(amount + num);
    }
  };

  const handleBackspace = () => {
    if (amount.length === 1) {
      setAmount('0');
      setHasStartedTyping(false);
    } else {
      setAmount(amount.slice(0, -1));
    }
  };

  const handleDecimalPress = () => {
    setHasStartedTyping(true);

    if (!amount.includes('.')) {
      if (amount === '0') {
        setAmount('0.');
      } else {
        setAmount(amount + '.');
      }
    }
  };

  const handleTokenSelect = (item: TokenDropdownItem) => {
    setSelectedToken(item);
    setAmount('0');
    setHasStartedTyping(false);
  };

  const getTokenDropdownItems = (): TokenDropdownItem[] => {
    if (!portfolio?.tokens) return [];

    return portfolio.tokens.map((token) => ({
      id: token.mintAddress,
      symbol: token.symbol,
      balance: token.balance,
      logo: token.logo,
      name: token.name,
    }));
  };

  const getSelectedTokenData = () => {
    if (!selectedToken || !portfolio?.tokens) return null;
    return portfolio.tokens.find((t) => t.mintAddress === selectedToken.id);
  };

  const handleSend = () => {
    const tokenData = getSelectedTokenData();
    if (!tokenData) {
      Alert.alert('Error', 'Please select a token');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (amountNum > tokenData.balance) {
      Alert.alert('Insufficient Balance', `You only have ${tokenData.balance} ${tokenData.symbol}`);
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmTransfer = async () => {
    if (!walletAddress || !recipientAddress || !selectedToken) return;

    const tokenData = getSelectedTokenData();
    if (!tokenData) return;

    const amountNum = parseFloat(amount);

    try {
      const hasAuth = await walletService.hasAuthenticationConfigured();
      if (hasAuth) {
        const isUnlocked = walletService.isWalletUnlocked();
        if (!isUnlocked) {
          const unlocked = await walletService.unlockWallet();
          if (!unlocked) {
            Alert.alert('Error', 'Failed to unlock wallet');
            return;
          }
        }
      }

      const result = await completeTransfer.mutateAsync({
        fromAddress: walletAddress,
        toAddress: recipientAddress,
        amount: amountNum,
        tokenMint: tokenData.symbol === 'SOL' ? undefined : tokenData.mintAddress,
      });

      setShowConfirmation(false);

      // Auto-save recipient after successful transfer
      try {
        const existingRecipient = await recipientsService.getRecipientByAddress(recipientAddress);

        if (existingRecipient) {
          // Update lastUsed timestamp
          await recipientsService.updateLastUsed(recipientAddress);
        } else {
          // Create new recipient without name
          await recipientsService.saveRecipient({
            address: recipientAddress,
            isFavorite: false,
          });
        }

        // Reload recipients list to update UI
        await loadRecipients();
      } catch (error) {
        console.error('Failed to auto-save recipient:', error);
        // Don't show error to user - this is background operation
      }

      Alert.alert(
        'Transfer Successful',
        `Successfully sent ${amount} ${tokenData.symbol} to ${formatAddress(recipientAddress)}`,
        [
          // {
          //   text: 'View Transaction',
          //   onPress: () => {
          //     console.log('Transaction signature:', result.signature);
          //   },
          // },
          {
            text: 'Done',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Transfer failed:', error);
      setShowConfirmation(false);
      Alert.alert(
        'Transfer Failed',
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    }
  };

  const handleBack = () => {
    if (currentStep === 'scan') {
      setCurrentStep('select');
    } else if (currentStep === 'amount') {
      setCurrentStep('select');
    } else {
      router.back();
    }
  };

  // const getTitle = () => {
  //   switch (currentStep) {
  //     case 'select':
  //       return 'SELECT RECIPIENT';
  //     case 'scan':
  //       return 'SCAN QR CODE';
  //     case 'amount':
  //       return 'SEND TO';
  //     default:
  //       return 'SEND';
  //   }
  // };

  // Render QR Scanner View
  const renderScanView = () => {
    if (hasPermission === null) {
      return (
        <View style={styles.messageContainer}>
          <RNText style={typography.textSecondary}>
            Requesting camera permission...
          </RNText>
        </View>
      );
    }

    if (hasPermission === false) {
      return (
        <View style={styles.messageContainer}>
          <RNText style={[typography.textPrimary, styles.messageTitle]}>
            No Camera Access
          </RNText>
          <RNText style={[typography.textSecondary, styles.messageText]}>
            Please enable camera permissions in your device settings to scan QR codes.
          </RNText>
          <TouchableOpacity style={styles.backButton} onPress={() => setCurrentStep('select')}>
            <RNText style={styles.backButtonText}>
              Go Back
            </RNText>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <InnerContainer style={{flex : 1, display: 'flex', padding: 10, flexDirection: 'column', backgroundColor: 'rgba(0,0,0,0.2)', marginHorizontal: 10 }}>

        <InnerContainer style={{padding: 10,}}>
          <View style={{marginBottom: 10 , flexDirection: 'row', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10}}>
            <Pressable onPress={handleBack}>
              <Image source={backIcon} style={{width: 18, height: 18}}/>
            </Pressable>

            <RNText style={[typography.daysone, typography.textBase, typography.textWhite]}>SCAN QR CODE</RNText>

            <Pressable onPress={handleClose}>
              <Image source={closeIcon} style={{width: 18, height: 18}}/>
            </Pressable>

          </View>
        </InnerContainer>

        <InnerContainer style={{ flex: 1, paddingVertical: 35, marginTop: 10}}>
          <View style={{ flex: 1, position: 'relative' }}>
            <CameraView
              style={styles.camera}
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ['qr'],
              }}
            />
            <View style={[styles.overlay, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }]}>
              <View style={styles.scanFrame}>
                <View style={[styles.corner, styles.cornerTopLeft]} />
                <View style={[styles.corner, styles.cornerTopRight]} />
                <View style={[styles.corner, styles.cornerBottomLeft]} />
                <View style={[styles.corner, styles.cornerBottomRight]} />
              </View>

              <RNText style={[styles.instructionText, typography.jura400]}>
                Position the QR code within the frame
              </RNText>
            </View>
          </View>


          {/*<View style={[{ flex: 1}]}>*/}

          {/*</View>*/}
        </InnerContainer>
        {/*<View style={{display: 'flex', flex: 1, padding: 10, flexDirection: 'column', }}>*/}


        {/*  */}


        {/*</View>*/}

      </InnerContainer>
    );
  };

  // Render Select Recipient View
  const renderSelectView = () => {
    return (
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <InnerContainer style={{backgroundColor: 'rgba(0,0,0,0.1)', padding: 10}}>
          <InnerContainer style={{padding: 10}}>

            <View style={{marginBottom: 10 , flexDirection: 'row', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10}}>
              <Pressable onPress={handleBack}>
                <Image source={backIcon} style={{width: 18, height: 18}}/>
              </Pressable>

              <RNText style={[typography.daysone, typography.textBase, typography.textWhite]}>SELECT RECIPIENT</RNText>

              <Pressable onPress={handleClose}>
                <Image source={closeIcon} style={{width: 18, height: 18}}/>
              </Pressable>

            </View>


            <TouchableOpacity
              style={styles.scanButton}
              onPress={handleScanQR}
              activeOpacity={0.8}
            >
              <InnerContainer style={{display: 'flex', alignItems: 'center', padding: 10, height: 200, width: 200, borderRadius: 40, justifyContent: 'center'}}>
                <View style={styles.scanFrameIcon}>
                  <Image source={scanIcon} style={styles.scanIcon} />
                </View>
                <RNText  style={[typography.daysone,  typography.textWhite, {textAlign: 'center'}]}>
                  SCAN ADDRESS
                </RNText>
              </InnerContainer>
            </TouchableOpacity>


            <InnerContainer style={styles.inputInner}>
              <Image source={sendIcon} style={styles.sendIcon}/>
              <View style={styles.addressWrapper}>
                <AddressInput
                  value={recipientAddress}
                  onChangeText={setRecipientAddress}
                  onValidAddress={handleValidAddress}
                  placeholder="INSERT ADDRESS"
                  userAddress={walletAddress || undefined}
                />
              </View>


            </InnerContainer>

            {isValidAddress && recipientAddress && (

              <Button title="Continue" onPress={handleContinue} variant="secondary" style={{marginTop: 10}}/>
            )}

          </InnerContainer>


          {/* Recipients List */}
          {recipients.length > 0 && (
            <View style={styles.recipientsSection}>
              {sortRecipients(filterRecipients(recipients, recipientAddress)).map((recipient) => (
                <RecipientListItem
                  key={recipient.id}
                  recipient={recipient}
                  onPress={() => handleRecipientSelect(recipient)}
                  onEdit={() => handleEditRecipient(recipient)}
                  onToggleFavorite={() => handleToggleFavorite(recipient)}
                />
              ))}
            </View>
          )}

        </InnerContainer>
      </ScrollView>
    );
  };

  // Render Amount Entry View
  const renderAmountView = () => {
    const tokenData = getSelectedTokenData();
    const amountNum = parseFloat(amount);
    const isValidAmount = !isNaN(amountNum) && amountNum > 0 && tokenData && amountNum <= tokenData.balance;

    if (isLoadingPortfolio) {
      return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.accent.cyan} />
            <RNText style={typography.textSecondary}>
              Loading portfolio...
            </RNText>
          </View>
      );
    }

    return (
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <InnerContainer style={{backgroundColor: 'rgba(0,0,0,0.2)', padding: 10 }}>

          <InnerContainer>
            <View style={{marginBottom: 0 , flexDirection: 'row', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 10, paddingHorizontal: 20}}>
              <Pressable onPress={handleBack}>
                <Image source={backIcon} style={{width: 18, height: 18}}/>
              </Pressable>

              <RNText style={[typography.daysone, typography.textBase, typography.textWhite]}>SEND TO</RNText>

              <Pressable onPress={handleClose}>
                <Image source={closeIcon} style={{width: 18, height: 18}}/>
              </Pressable>

            </View>

            <TouchableOpacity onPress={handleCopyAddress}>
              <InnerContainer style={{padding: 10, paddingVertical: 20, borderRadius: 20, display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10, marginBottom: 10, marginHorizontal: 10}}>

                <RNText style={[styles.addressText, typography.daysone]}>
                  {formatAddress(recipientAddress,  4, 4)}
                </RNText>

                <Image source={copyIcon} style={{width: 18, height: 18}}/>
              </InnerContainer>
            </TouchableOpacity>


            {/*<View style={styles.amountHeader}>*/}
            {/*  <RNText style={[typography.textPrimary, typography.daysone]}>*/}
            {/*    {formatAddress(recipientAddress, 6, 4)}*/}
            {/*  </RNText>*/}
            {/*</View>*/}

          </InnerContainer>




          <View style={{display: 'flex', alignItems: 'center', marginTop: 50, marginBottom: 50}}>
            <RNText style={[typography.daysone, typography.textWhite, typography.text3xl,  styles.amountDisplay]}>
              {amount} {selectedToken?.symbol || 'SOL'}
            </RNText>
          </View>


          <View style={{paddingHorizontal: 10}}>
            <CustomDropdownTokens
              tokens={getTokenDropdownItems()}
              selectedToken={selectedToken}
              onSelect={handleTokenSelect}
              placeholder="Select token"
            />
          </View>



          <InnerContainer>
            <NumericKeypad
              onNumberPress={handleNumberPress}
              onBackspace={handleBackspace}
              onDecimalPress={handleDecimalPress}
            />

            <View style={{padding: 10, paddingTop: 0}}>
              <Button title="SEND" onPress={handleSend} variant="secondary" disabled={!isValidAmount}/>
            </View>
          </InnerContainer>



          <TransferConfirmationModal
            visible={showConfirmation}
            onClose={() => setShowConfirmation(false)}
            onConfirm={handleConfirmTransfer}
            recipientAddress={recipientAddress}
            amount={amount}
            tokenSymbol={selectedToken?.symbol || 'SOL'}
            estimatedFee={estimatedFee}
            requiresATA={requiresATA}
            loading={completeTransfer.isPending}
          />

        </InnerContainer>
      </ScrollView>

    );
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right']}
    >
      {currentStep === 'select' && renderSelectView()}
      {currentStep === 'scan' && renderScanView()}
      {currentStep === 'amount' && renderAmountView()}

      <RecipientEditModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveRecipient}
        recipient={editingRecipient}
        address={recipientAddress}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  background: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 10,
    gap: 0,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  amountHeader: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 15,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  headerLabel: {
    marginBottom: 10,
  },
  // Select recipient styles
  scanInner: {
    padding: 10,
  },
  scanButton: {
    alignItems: 'center',
    gap: 10,
  },
  scanFrameIcon: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',

  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: theme.colors.accent.cyan,
    borderWidth: 3,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 16,
    borderColor: '#fff'
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 16,
    borderColor: '#fff'
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 16,
    borderColor: '#fff'
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 16,
    borderColor: '#fff'
  },
  scanIcon: {
    width: 130,
    height: 130,
    tintColor: '#fff',
  },
  inputContainer: {
    borderRadius: 20,
  },
  inputInner: {
    marginTop: 10,
    padding: 4,
    paddingHorizontal: 10,
    gap: 4,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 20,
  },
  inputLabel: {
    marginBottom: 0,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: theme.colors.accent.cyan,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginTop: 16,
    shadowColor: theme.colors.accent.cyan,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonText: {
  },
  // QR scanner styles
  messageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    gap: 10,
  },
  messageTitle: {
    marginTop: 10,
  },
  messageText: {
    textAlign: 'center',
  },
  backButton: {
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: theme.colors.accent.cyan,
    borderRadius: 8,
  },
  backButtonText: {
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  instructionText: {
    color: '#fff',
    marginTop: 40,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
  },
  // Amount entry styles
  amountContainer: {
    borderRadius: 20,
  },
  amountInner: {
    padding: 10,
    alignItems: 'center',
  },
  amountDisplay: {
    marginBottom: 10,
  },
  balanceText: {
  },
  tokenSelectorContainer: {
    borderRadius: 20,
  },
  tokenSelectorInner: {
    padding: 10,
  },
  sendButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 10,
    shadowColor: theme.colors.accent.cyan,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  sendButtonDisabled: {
    shadowOpacity: 0.2,
  },
  sendButtonGradient: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
  },
  // Recipients styles
  addRecipientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.accent.cyan,
    marginTop: 12,
  },
  addRecipientText: {
    fontSize: 14,
    fontWeight: '600',
  },
  recipientsSection: {
    marginTop: 10,
    gap: 10
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sendIcon: {
    width: 24,
    height: 24,
  },
  addressWrapper: {
    flex: 1,
  },

  addressText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },

});
