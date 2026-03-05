import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text as RNText,
  Alert,
  ActivityIndicator,
  TextInput,
  Image,
  NativeSyntheticEvent,
  NativeScrollEvent, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {router, useLocalSearchParams} from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {BlurContainer, Button} from '@/src/components/ui';
import { SwapTokenDropdown } from '@/src/components/swap/SwapTokenDropdown';
import { SwapConfirmationModal } from '@/src/components/swap/SwapConfirmationModal';
import { PopularTokensView, PopularTokensViewRef } from '@/src/components/swap/PopularTokensView';
import { TokenChart } from '@/src/components/swap/TokenChart';
import { walletService, WalletInfo } from '@/src/services/walletService';
import { tokenService, Token } from '@/src/services/tokenService';
import { swapService } from '@/src/services/swapService';
import { useSwapQuote, useExecuteSwap } from '@/src/hooks/queries/useSwap';
import { usePortfolio } from '@/src/hooks/queries';
import { formatAddress, parseAmount } from '@/src/utils/formatting';
import { typography } from '@/src/styles/typography';
import { InnerContainer } from '@/src/components/ui/InnerContainer';
import { useDebounce } from '@/src/hooks/common/useDebounce';
import { WALLET_CONFIG } from '@/src/config/environment';

const walletIcon = require('../../assets/images/icons/wallet.png');
const swapIcon = require('../../assets/images/icons/swap.png');
const logoImage = require('../../assets/images/opindex-logo.png');

export default function SwapScreen() {
  // Get navigation params for pre-filling input token
  const params = useLocalSearchParams<{
    inputTokenMint?: string;
    inputTokenSymbol?: string;
    inputTokenName?: string;
    inputTokenLogo?: string;
    inputTokenDecimals?: string;
    inputTokenPrice?: string;
  }>();

  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [inputToken, setInputToken] = useState<Token | null>(null);
  const [outputToken, setOutputToken] = useState<Token | null>(null);
  const [inputAmount, setInputAmount] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Ref for scrolling to swap form
  const scrollViewRef = useRef<ScrollView>(null);

  // Ref for PopularTokensView to call loadMore
  const popularTokensRef = useRef<PopularTokensViewRef>(null);

  // Ref to track if initial token setup is done (to prevent resetting output token on input change)
  const initialSetupDoneRef = useRef(false);

  // Fetch portfolio for balances
  const { data: portfolio } = usePortfolio(walletInfo?.address);

  // Debounce input amount for quote fetching (400ms delay)
  const debouncedInputAmount = useDebounce(inputAmount, 400);

  // Convert input amount to smallest units
  const inputAmountInSmallestUnits = useMemo(() => {
    if (!debouncedInputAmount || !inputToken) return 0;
    const amount = parseAmount(debouncedInputAmount);
    if (amount <= 0) return 0;
    return swapService.amountToSmallestUnits(amount, inputToken.decimals);
  }, [debouncedInputAmount, inputToken]);

  // Fetch swap quote
  const { data: quoteResponse, isLoading: isLoadingQuote } = useSwapQuote(
    {
      inputTokenAddress: inputToken?.address || inputToken?.id || '',
      outputTokenAddress: outputToken?.address || outputToken?.id || '',
      inputAmount: inputAmountInSmallestUnits,
      userAddress: walletInfo?.address || '',
    },
    {
      enabled: !!(
        inputToken &&
        outputToken &&
        inputAmountInSmallestUnits > 0 &&
        walletInfo?.address
      ),
    }
  );

  // Execute swap mutation
  const executeSwap = useExecuteSwap();

  useEffect(() => {
    loadWalletInfo();
    loadTopTokens();
  }, []);

  // Set default tokens when tokens load - prioritize params from navigation
  useEffect(() => {
    if (tokens.length === 0) return; // Skip if no tokens loaded

    // Check if we have params to pre-fill input token from portfolio
    if (params.inputTokenMint && params.inputTokenSymbol) {
      // Only update if the input token doesn't match the params (avoid unnecessary updates)
      const currentTokenAddress = inputToken?.address || inputToken?.id;
      if (currentTokenAddress !== params.inputTokenMint) {
        // Try to find token in loaded tokens list (has complete data including price)
        let tokenToSet = tokens.find(t =>
          (t.address || t.id) === params.inputTokenMint
        );

        // Fallback: Create from params if not in top tokens list
        if (!tokenToSet) {
          tokenToSet = {
            address: params.inputTokenMint,
            symbol: params.inputTokenSymbol,
            name: params.inputTokenName || params.inputTokenSymbol,
            decimals: parseInt(params.inputTokenDecimals || '9'),
            logoURI: params.inputTokenLogo || undefined,
            id: params.inputTokenMint,
            price: params.inputTokenPrice ? parseFloat(params.inputTokenPrice) : undefined,
            usdPrice: params.inputTokenPrice ? parseFloat(params.inputTokenPrice) : undefined,
          };
        }

        setInputToken(tokenToSet);

        // Only set default output token on initial setup, not when user changes input
        if (!initialSetupDoneRef.current) {
          if (tokenToSet.symbol === 'USDC') {
            const sol = tokens.find(t => t.symbol === 'SOL');
            if (sol) setOutputToken(sol);
          } else {
            const usdc = tokens.find(t => t.symbol === 'USDC');
            if (usdc) setOutputToken(usdc);
          }
          initialSetupDoneRef.current = true;
        }
      }
    } else if (!inputToken) {
      // Only set defaults if no token selected and no params
      const sol = tokens.find(t => t.symbol === 'SOL');
      const usdc = tokens.find(t => t.symbol === 'USDC');
      if (sol) setInputToken(sol);
      if (!initialSetupDoneRef.current && usdc) {
        setOutputToken(usdc);
        initialSetupDoneRef.current = true;
      }
    }
  }, [tokens, params.inputTokenMint, params.inputTokenSymbol, inputToken]);

  const loadWalletInfo = async () => {
    try {
      const info = await walletService.getWalletInfo();
      setWalletInfo(info);
    } catch (error) {
      console.error('Failed to load wallet info:', error);
    }
  };

  const loadTopTokens = async () => {
    try {
      const topTokens = await tokenService.getTopTokens(50);
      setTokens(topTokens);
    } catch (error) {
      console.error('Failed to load tokens:', error);
      Alert.alert('Error', 'Failed to load tokens');
    }
  };

  const handleSwapDirection = () => {
    // Reverse tokens
    const temp = inputToken;
    setInputToken(outputToken);
    setOutputToken(temp);
    setInputAmount('');
  };

  const handleManageWallets = () => {
    router.push('/wallet/manage');
  }


  const handleMaxAmount = () => {
    if (!inputToken || !portfolio) return;

    const balance = portfolio.tokens.find(
      t => t.mintAddress === (inputToken.address || inputToken.id)
    )?.balance || 0;

    // If SOL, deduct fee reserve for transaction fees
    const maxAmount = inputToken.symbol === 'SOL'
      ? Math.max(0, balance - WALLET_CONFIG.SOL_FEE_RESERVE)
      : balance;

    setInputAmount(maxAmount.toString());
  };

  const handleSwapClick = () => {
    if (!quoteResponse || !quoteResponse.data || quoteResponse.data.errorMessage) {
      Alert.alert('Error', quoteResponse?.data?.errorMessage || 'No quote available');
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmSwap = async () => {
    if (!quoteResponse) return;

    try {
      const result = await executeSwap.mutateAsync(quoteResponse);

      if (result.success) {
        Alert.alert('Success', 'Swap completed successfully!');
        setShowConfirmModal(false);
        setInputAmount('');
      } else {
        Alert.alert('Swap Failed', result.error || 'Unknown error occurred');
      }
    } catch (error: any) {
      console.error('Swap execution error:', error);
      Alert.alert('Error', error.message || 'Failed to execute swap');
    }
  };

  // Calculate output amount from quote
  const outputAmount = useMemo(() => {
    if (!quoteResponse?.data || quoteResponse.data.errorMessage) return '';
    if (!outputToken) return '';

    const calculated = swapService.smallestUnitsToAmount(
      quoteResponse.data.outAmount,
      outputToken.decimals
    );

    return calculated.toFixed(6);
  }, [quoteResponse, outputToken]);

  // Get input token balance
  const inputTokenBalance = useMemo(() => {
    if (!inputToken || !portfolio) return 0;
    return portfolio.tokens.find(
      t => t.mintAddress === (inputToken.address || inputToken.id)
    )?.balance || 0;
  }, [inputToken, portfolio]);

  // Get output token balance
  const outputTokenBalance = useMemo(() => {
    if (!outputToken || !portfolio) return 0;
    return portfolio.tokens.find(
      t => t.mintAddress === (outputToken.address || outputToken.id)
    )?.balance || 0;
  }, [outputToken, portfolio]);

  // Check if swap is possible
  const canSwap = !!(
    inputToken &&
    outputToken &&
    inputAmount &&
    parseAmount(inputAmount) > 0 &&
    quoteResponse &&
    quoteResponse.data &&
    !quoteResponse.data.errorMessage &&
    !isLoadingQuote
  );

  const insufficientBalance = useMemo(() => {
    if (!inputAmount || !inputToken) return false;
    return parseAmount(inputAmount) > inputTokenBalance;
  }, [inputAmount, inputToken, inputTokenBalance]);

  // Handle token selection from popular tokens
  const handleSelectFromPopular = (token: Token) => {
    setOutputToken(token);
    // Scroll to top to show swap form
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  // Handle scroll to detect when near bottom for infinite scroll
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 200; // Trigger when 200px from bottom
    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

    if (isCloseToBottom) {
      popularTokensRef.current?.loadMore();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        onScroll={handleScroll}
        scrollEventThrottle={100}
      >
        {/* Header */}

        <View style={[styles.scrollContent, {marginBottom: 10}]}>
          <BlurContainer>
            <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10}}>
              <Image source={logoImage} style={{width: 130, height: 62, objectFit: 'contain'}}/>
              <InnerContainer style={{flex: 1, borderRadius: 25, padding: 0, alignItems: 'center', justifyContent: 'center', minHeight: 62,}}>

                <Pressable onPress={handleManageWallets}>
                  <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                    <RNText style={[typography.daysone, typography.textWhite, typography.textBase,]}>
                      {formatAddress(walletInfo?.address || '' , 4)}
                    </RNText>
                    <Ionicons
                      name="chevron-down"
                      size={20}
                      color="#fff"
                    />
                  </View>

                </Pressable>

              </InnerContainer>
            </View>
          </BlurContainer>
        </View>

        {/* Token Price Chart */}
        <TokenChart inputToken={inputToken} outputToken={outputToken} />

        {/*<View style={styles.header}>*/}
        {/*  <View>*/}
        {/*    <RNText style={[typography.daysone, typography.textWhite, typography.text2xl]}>*/}
        {/*      Swap Tokens*/}
        {/*    </RNText>*/}
        {/*  </View>*/}

        {/*  {walletInfo && (*/}
        {/*    <Pressable*/}
        {/*      onPress={() => router.push('/wallet/manage')}*/}
        {/*      style={styles.walletButton}*/}
        {/*    >*/}
        {/*      <Ionicons name="wallet" size={16} color="#06EBF1" />*/}
        {/*      <RNText style={[typography.jura400, typography.textWhite, { marginLeft: 8 }]}>*/}
        {/*        {formatAddress(walletInfo.address, 4)}*/}
        {/*      </RNText>*/}
        {/*    </Pressable>*/}
        {/*  )}*/}
        {/*</View>*/}

        <View style={[styles.scrollContent, {paddingBottom: 90}]}>
          <InnerContainer style={{backgroundColor: 'rgba(0, 0, 0, 0.1)',padding: 0, marginTop: 10}}>

            {/* Swap Cards Container with floating button */}
            <View style={{position: 'relative'}}>
              {/* Swap Card */}
              <View style={{padding: 10, paddingBottom: 0}}>
                <InnerContainer style={styles.swapCard}>
                  <View>
                    <View style={styles.tokenHeader}>
                      <RNText style={[typography.daysone, typography.textWhite]}>FROM</RNText>

                      <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4}}>
                        <Image source={walletIcon} style={{width: 16, height: 16}} />
                        <RNText style={[typography.daysone, typography.textXs, typography.textWhite]}>
                          {inputTokenBalance.toFixed(4)}
                        </RNText>
                        <Button title='MAX' variant='primary' onPress={handleMaxAmount} style={{padding: 4}} size='sm'/>
                      </View>
                    </View>
                  </View>
                  {/* Input Token */}
                  <View style={styles.tokenSection}>

                    <View style={styles.tokenInputRow}>
                      <SwapTokenDropdown
                        selectedToken={inputToken}
                        tokens={tokens}
                        onSelect={(token) => {
                          setInputToken(token);
                          setInputAmount('');
                        }}
                        userAddress={walletInfo?.address || ''}
                        placeholder="Select Token"
                        balance={inputTokenBalance}
                      />

                      <View style={styles.amountInputContainer}>
                        <View style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flex: 1}}>
                          <TextInput
                            style={[typography.daysone, typography.textWhite, styles.amountInput]}
                            placeholder="0.0"
                            placeholderTextColor="#fff"
                            keyboardType="decimal-pad"
                            value={inputAmount}
                            onChangeText={setInputAmount}
                          />

                          <View>
                            {/* Show actual price in USD */}
                            {inputAmount && inputToken && (inputToken.usdPrice || inputToken.price) ? (
                              <RNText style={[typography.jura400, typography.textWhite]}>
                                ${(parseAmount(inputAmount) * (inputToken.usdPrice || 0)).toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </RNText>
                            ) : null}
                          </View>
                        </View>
                      </View>
                    </View>

                    {insufficientBalance && (
                      <RNText style={[typography.jura400, { color: '#ef4444', fontSize: 12, marginTop: 4 }]}>
                        Insufficient balance
                      </RNText>
                    )}
                  </View>
                </InnerContainer>
              </View>

              {/*Change Swap Direction Button - floating on top */}
              <View style={styles.swapArrowContainer}>
                <Button title='' icon={swapIcon} onPress={handleSwapDirection} style={{padding: 8}} size='lg'/>
              </View>

            {/* Output Token */}
            <View style={{padding: 10, paddingTop: 10}}>
              <InnerContainer style={styles.swapCard}>
                <View>
                  <View style={styles.tokenHeader}>
                    <RNText style={[typography.daysone, typography.textWhite]}>TO</RNText>

                    <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4}}>
                      <Image source={walletIcon} style={{width: 16, height: 16}} />
                      <RNText style={[typography.daysone, typography.textXs, typography.textWhite]}>
                        {outputTokenBalance.toFixed(4)}
                      </RNText>
                    </View>
                  </View>

                </View>

                {/* Swap Direction Button */}

                {/* Output Token */}
                <View style={styles.tokenSection}>

                  <View style={styles.tokenInputRow}>
                    <SwapTokenDropdown
                      selectedToken={outputToken}
                      tokens={tokens}
                      onSelect={setOutputToken}
                      userAddress={walletInfo?.address || ''}
                      placeholder="Select Token"
                    />

                    <View style={styles.amountInputContainer}>
                      {isLoadingQuote ? (
                        <ActivityIndicator size="small" color="#06EBF1" />
                      ) : (
                      <View style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flex: 1}}>
                          <RNText style={[typography.daysone, typography.textWhite, styles.outputAmount]}>
                            {outputAmount || '0.0'}
                          </RNText>


                          {/*Show  actual price in USD*/}
                          {outputAmount && outputToken && (outputToken.usdPrice || outputToken.price) ? (
                            <RNText style={[typography.jura400, typography.textWhite]}>
                              ${(parseFloat(outputAmount) * (outputToken.usdPrice || outputToken.price || 0)).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </RNText>
                          ) : null}
                        </View>
                      )}
                    </View>
                  </View>
                </View>

              </InnerContainer>
            </View>
            </View>{/* End of Swap Cards Container */}

            {/* Quote Details */}
            {quoteResponse && quoteResponse.data && !quoteResponse.data.errorMessage && (
              <View style={styles.quoteDetails}>
                <View style={styles.quoteRow}>
                  <RNText style={[typography.jura400, typography.textWhite]}>
                    Price Impact
                  </RNText>
                  <RNText style={[typography.jura400, {
                    color: quoteResponse.data.priceImpact > 5
                      ? '#ef4444'
                      : quoteResponse.data.priceImpact > 1
                        ? '#f59e0b'
                        : '#10b981'
                  }]}>
                    {quoteResponse.data.priceImpact.toFixed(2)}%
                  </RNText>
                </View>

                <View style={styles.quoteRow}>
                  <RNText style={[typography.jura400, typography.textWhite]}>
                    Minimum Received
                  </RNText>
                  <RNText style={[typography.jura400, typography.textWhite]}>
                    {swapService.smallestUnitsToAmount(
                      quoteResponse.data.otherAmountThreshold,
                      outputToken?.decimals || 0
                    ).toFixed(6)} {outputToken?.symbol}
                  </RNText>
                </View>

                <View style={styles.quoteRow}>
                  <RNText style={[typography.jura400, typography.textWhite]}>
                    Network Fee
                  </RNText>
                  <RNText style={[typography.jura400, typography.textWhite]}>
                    ~${(quoteResponse.data.prioritizationFeeLamports / 1e9 * (inputToken?.usdPrice || 0)).toFixed(4)}
                  </RNText>
                </View>
              </View>
            )}

            {/* Error Message */}
            {quoteResponse?.data?.errorMessage && (
              <View style={styles.errorContainer}>
                <Ionicons name="warning" size={16} color="#ef4444" />
                <RNText style={[typography.jura400, typography.textWhite, {  marginLeft: 8, flex: 1 }]}>
                  {quoteResponse.data.errorMessage}
                </RNText>
              </View>
            )}


            {/* Swap Button */}
            <View style={{ paddingHorizontal: 10,  display: 'flex',
              flexDirection: 'row', alignItems: 'center',justifyContent: 'center',
              flex: 1, marginBottom: 10}}>
              <Button
                variant='secondary'
                title={
                  !walletInfo
                    ? 'Connect Wallet'
                    : insufficientBalance
                      ? 'Insufficient Balance'
                      : isLoadingQuote
                        ? 'Fetching Quote...'
                        : 'Swap'
                }
                onPress={handleSwapClick}
                disabled={!canSwap || insufficientBalance}
                loading={isLoadingQuote}
                style={{ minWidth: 200 }}
              />
            </View>


          </InnerContainer>

          {/* Popular Tokens View */}
          {walletInfo && (
            <PopularTokensView
              ref={popularTokensRef}
              inputToken={inputToken}
              tokens={tokens}
              onSelectInputToken={setInputToken}
              onSelectOutputToken={handleSelectFromPopular}
              userAddress={walletInfo.address}
              onSwapFocusRequest={() => scrollViewRef.current?.scrollTo({ y: 0, animated: true })}
            />
          )}

        </View>
      </ScrollView>

      {/* Confirmation Modal */}
      {inputToken && outputToken && quoteResponse && (
        <SwapConfirmationModal
          visible={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmSwap}
          inputToken={inputToken}
          outputToken={outputToken}
          inputAmount={inputToken ? swapService.smallestUnitsToAmount(inputAmountInSmallestUnits, inputToken.decimals) : 0}
          quote={quoteResponse}
          isExecuting={executeSwap.isPending}
        />
      )}
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
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  swapCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 0
  },
  tokenSection: {
    paddingHorizontal: 10,
    paddingBottom: 10
  },
  tokenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    minHeight: 40
  },
  tokenInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  amountInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 60,
    marginRight: 0
  },
  amountInput: {
    fontSize: 20,
    textAlign: 'right',
  },
  outputAmount: {
    fontSize: 20,
    textAlign: 'right',
  },
  maxButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(6, 235, 241, 0.2)',
    borderRadius: 6,
    marginLeft: 8,
  },
  swapArrowContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    transform: [{ translateY: -20 }],
    alignItems: 'center',
    zIndex: 10,
  },
  swapArrowButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(6, 235, 241, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#06EBF1',
  },
  quoteDetails: {
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 30
  },
  quoteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 0,
    paddingBottom: 6
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
});
