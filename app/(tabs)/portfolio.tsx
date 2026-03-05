import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text as RNText, Pressable, RefreshControl, Image, ActivityIndicator, ImageBackground, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePortfolio, useTransactions } from '@/src/hooks/queries';
import { walletService } from '@/src/services/walletService';
import { tokenService, TokenCategory, Token } from '@/src/services/tokenService';
import {BlurContainer} from "@/src/components/ui";
import {InnerContainer} from "@/src/components/ui/InnerContainer";
import {typography} from "@/src/styles/typography";
import {PortfolioItem} from "@/src/components/ui/PorfolioItem";
import { CustomDropdown, CustomDropdownItem } from "@/src/components/ui/CustomDropdown";
import { convertToBaseToken } from "@/src/utils/formatting";

const logoImage = require('../../assets/images/opindex-logo.png');
const bgImage = require('../../assets/images/bg.jpg');
const copyIcon = require('../../assets/images/icons/copy.png');
const scanIcon = require('../../assets/images/icons/scan.png');

const getIcon =  require('../../assets/images/icons/get.png');
const sendIcon =  require('../../assets/images/icons/send.png');
const swapIcon =  require('../../assets/images/icons/swap.png');

const BASE_TOKEN_STORAGE_KEY = 'opindex-base-token-selection';

// Priority token mint addresses (always visible, in this order)
const WSOL_MINT = 'So11111111111111111111111111111111111111112';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

export default function PortfolioScreen() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const { data: portfolio, isLoading, error, refetch } = usePortfolio(walletAddress);
  const { data: transactions, isLoading: isLoadingTransactions, error: transactionsError, refetch: refetchTransactions } = useTransactions(walletAddress);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<TokenCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CustomDropdownItem | null>({
    id: 'all',
    label: 'ALL TOKENS'
  });
  const [topTokens, setTopTokens] = useState<any[]>([]);
  const [selectedTopToken, setSelectedTopToken] = useState<CustomDropdownItem | null>(null);
  const [baseTokenPrice, setBaseTokenPrice] = useState<number | null>(null);
  const [categoryTokens, setCategoryTokens] = useState<Token[]>([]);
  const [isLoadingCategoryTokens, setIsLoadingCategoryTokens] = useState(false);

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

  // Load token categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await tokenService.getTokenCategories();
        setCategories(cats);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    loadCategories();
  }, []);

  // Fetch tokens by category when category changes
  useEffect(() => {
    if (!selectedCategory || selectedCategory.id === 'all') {
      setCategoryTokens([]);
      return;
    }

    const loadCategoryTokens = async () => {
      setIsLoadingCategoryTokens(true);
      try {
        const result = await tokenService.getTokensByCategory(
          selectedCategory.id,
          1,
          100
        );
        setCategoryTokens(result.tokens);
      } catch (error) {
        console.error('Failed to fetch category tokens:', error);
        setCategoryTokens([]);
      } finally {
        setIsLoadingCategoryTokens(false);
      }
    };

    loadCategoryTokens();
  }, [selectedCategory]);

  // Load top tokens on mount and restore saved base token selection
  useEffect(() => {
    const loadTopTokens = async () => {
      try {
        const tokens = await tokenService.getTopTokens(20);
        setTopTokens(tokens);

        // Try to load saved base token selection from AsyncStorage
        let savedSelection: CustomDropdownItem | null = null;
        try {
          const savedData = await AsyncStorage.getItem(BASE_TOKEN_STORAGE_KEY);
          if (savedData) {
            savedSelection = JSON.parse(savedData);
          }
        } catch (error) {
          console.warn('Failed to load saved base token selection:', error);
        }

        // Find the token to select (saved or USDC default)
        let tokenToSelect = null;
        if (savedSelection && savedSelection.id) {
          // Try to find the saved token in the loaded tokens
          tokenToSelect = tokens.find((t: any) =>
            (t.id && t.id === savedSelection.id) ||
            (t.address && t.address === savedSelection.id)
          );
        }

        // If no saved selection or token not found, default to USDC
        if (!tokenToSelect) {
          tokenToSelect = tokens.find((t: any) =>
            t.symbol?.toUpperCase() === 'USDC'
          );
        }

        // If USDC not found, use first token
        if (!tokenToSelect && tokens.length > 0) {
          tokenToSelect = tokens[0];
        }

        // Set the selected token and its price
        if (tokenToSelect) {
          const dropdownItem: CustomDropdownItem = {
            id: tokenToSelect.id || tokenToSelect.address || '',
            label: tokenToSelect.symbol,
            subLabel: tokenToSelect.name,
            imageUri: tokenToSelect.logoURI,
          };
          setSelectedTopToken(dropdownItem);

          // Extract USD price (can be in 'price' or 'usdPrice' field)
          const price = tokenToSelect.price || tokenToSelect.usdPrice || null;
          setBaseTokenPrice(price);
        }
      } catch (error) {
        console.error('Failed to load top tokens:', error);
      }
    };
    loadTopTokens();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchTransactions()]);
    setRefreshing(false);
  };

  const formatCurrency = (value: number) => {
    // Use base token conversion if a base token is selected
    return convertToBaseToken(
      value,
      baseTokenPrice,
      selectedTopToken?.label || null
    );
  };

  const formatNumber = (value: number, decimals: number = 2) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(decimals) + 'M';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(decimals) + 'K';
    }
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  // const formatTimeAgo = (date: Date) => {
  //   const now = new Date();
  //   const diffMs = now.getTime() - date.getTime();
  //   const diffMins = Math.floor(diffMs / (1000 * 60));
  //   const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  //   const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  //
  //   if (diffMins < 60) {
  //     return `${diffMins}m ago`;
  //   } else if (diffHours < 24) {
  //     return `${diffHours}h ago`;
  //   } else {
  //     return `${diffDays}d ago`;
  //   }
  // };

  const shortenAddress = (address: string) => {
    if (address.length <= 8) return address;
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const handleCopyAddress = async () => {
    if (walletAddress) {
      await Clipboard.setStringAsync(walletAddress);
      Alert.alert('Copied!', 'Wallet address copied to clipboard');
    }
  };

  const handleManageWallets = () => {
    router.push('/wallet/manage');
  }

  const handleBaseTokenChange = async (item: CustomDropdownItem) => {
    setSelectedTopToken(item);

    // Find the full token data to get the price
    const selectedToken = topTokens.find((t: any) =>
      (t.id && t.id === item.id) ||
      (t.address && t.address === item.id)
    );

    if (selectedToken) {
      // Extract USD price
      const price = selectedToken.price || selectedToken.usdPrice || null;
      setBaseTokenPrice(price);
    } else {
      setBaseTokenPrice(null);
    }

    // Save selection to AsyncStorage
    try {
      await AsyncStorage.setItem(BASE_TOKEN_STORAGE_KEY, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to save base token selection:', error);
    }
  };

  // Transform categories to dropdown items
  const categoryItems = React.useMemo<CustomDropdownItem[]>(() => {
    return [
      { id: 'all', label: 'ALL TOKENS' },
      ...(Array.isArray(categories) && categories.length > 0
        ? categories
            .filter(cat => cat?.categoryType && cat?.categoryName)
            .map(cat => ({
              id: String(cat.categoryType),
              label: String(cat.categoryName),
            }))
        : [])
    ];
  }, [categories]);

  // Transform top tokens to dropdown items
  const topTokenItems = React.useMemo<CustomDropdownItem[]>(() => {
    return Array.isArray(topTokens) && topTokens.length > 0
      ? topTokens
          .filter(token => token?.id && token?.symbol)
          .map(token => ({
            id: token.id || token.address || '',
            label: token.symbol,
            subLabel: token.name,
            imageUri: token.logoURI,
          }))
      : [];
  }, [topTokens]);

  // Filter portfolio tokens by selected category and ensure WSOL/USDC are always visible
  const filteredTokens = React.useMemo(() => {
    if (!portfolio?.tokens) return [];

    let tokens = [...portfolio.tokens];

    // Filter by category if needed
    if (selectedCategory && selectedCategory.id !== 'all' && categoryTokens.length > 0) {
      const categoryTokenAddresses = new Set(
        categoryTokens.map(t => (t.address || t.id || '').toLowerCase())
      );
      tokens = tokens.filter(token =>
        categoryTokenAddresses.has((token.mintAddress || '').toLowerCase())
      );
    }

    // Check if USDC exists in tokens, if not add placeholder
    const hasUsdc = tokens.some(t => t.mintAddress === USDC_MINT);
    if (!hasUsdc) {
      tokens.push({
        mintAddress: USDC_MINT,
        symbol: 'USDC',
        name: 'USD Coin',
        logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
        value: 0,
        balance: 0,
        change24h: 0,
        decimals: 6,
        price: 1, // USDC is pegged to $1
      });
    }

    // Sort: WSOL first, USDC second, then rest by value (descending)
    tokens.sort((a, b) => {
      if (a.mintAddress === WSOL_MINT) return -1;
      if (b.mintAddress === WSOL_MINT) return 1;
      if (a.mintAddress === USDC_MINT) return -1;
      if (b.mintAddress === USDC_MINT) return 1;
      // Sort remaining by value descending
      return (b.value || 0) - (a.value || 0);
    });

    return tokens;
  }, [portfolio?.tokens, selectedCategory, categoryTokens]);

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#06EBF1" />
          <RNText style={styles.loadingText}>Loading portfolio...</RNText>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={64} color="#ef4444" />
          <RNText style={styles.errorText}>Failed to load portfolio</RNText>
          <RNText style={styles.errorSubtext}>{error instanceof Error ? error.message : 'Please try again'}</RNText>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <RNText style={styles.retryButtonText}>Retry</RNText>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Empty state (no wallet or no data)
  if (!portfolio || !walletAddress) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="wallet-outline" size={64} color="#a0a0a0" />
          <RNText style={styles.emptyText}>No wallet connected</RNText>
          <RNText style={styles.emptySubtext}>Please set up your wallet first</RNText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <BlurContainer>
          <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10}}>
            <Image source={logoImage} style={{width: 130, height: 62, objectFit: 'contain'}}/>

              <InnerContainer style={{flex: 1, borderRadius: 25, padding: 0, alignItems: 'center', justifyContent: 'center', minHeight: 62,}}>
                <Pressable onPress={handleManageWallets}>
                  <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                    <RNText style={[typography.daysone, typography.textWhite, typography.textBase,]}>
                      {walletAddress ? shortenAddress(walletAddress) : 'No Wallet'}
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


        {/*Like a  Bank Card  View*/}
        <InnerContainer style={{
          marginTop: 10,
          backgroundColor: 'transparent',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}>
          <ImageBackground
            source={bgImage}
            style={{height: 180, width: '100%', padding: 0, overflow: 'hidden', borderRadius: 30}}
            imageStyle={{borderRadius: 20}}
            resizeMode="cover"
          >
            <View style={{padding: 10, display: 'flex',  flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
              <BlurContainer style={{width: 'auto'}} borderRadius={20}>
                <Pressable onPress={handleCopyAddress}>
                  <View  style={{display: 'flex',  flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }}>
                    <RNText style={[typography.jura400, typography.textWhite, typography.textBase,]}>
                      {walletAddress ? shortenAddress(walletAddress) : 'No Wallet'}
                    </RNText>
                    <Image source={copyIcon} style={{width: 15, height:15}}/>
                  </View>
                </Pressable>
              </BlurContainer>


              <BlurContainer style={{width: 'auto'} } borderRadius={20}>
                <Pressable onPress={() => router.push({ pathname: '/wallet/send', params: { startScan: 'true' } })}>
                  <View style={{minHeight: 30, minWidth: 30, display: 'flex',  flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Image source={scanIcon} style={{width: 20, height: 20}}></Image>
                  </View>
                </Pressable>
              </BlurContainer>
            </View>

            <View>
              <RNText style={[typography.daysone, typography.textWhite, typography.text2xl, styles.totalBalance, {textAlign: 'center', marginTop: 10}]}>
                {formatCurrency(portfolio.totalBalance)}
              </RNText>
            </View>

          </ImageBackground>
        </InnerContainer>


        {/*Button Row for Get, Send, Swap*/}
        <View style={{flexDirection: 'row', justifyContent: 'center', gap: 10,  marginBottom: 10, marginTop: 10}}>
          <Pressable onPress={() => router.push('/wallet/receive')}>
            <BlurContainer style={{width: 'auto'}}>
              <View style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 64, width: 64}}>
                <Image source={getIcon} style={{width: 32, height: 32, marginBottom: 4, objectFit: 'contain'}}/>
                <RNText style={[typography.daysone, typography.textWhite, typography.textSm, typography.uppercase]}>Get</RNText>
              </View>
            </BlurContainer>
          </Pressable>
          <Pressable onPress={() => router.push('/(tabs)/swap')}>
            <BlurContainer style={{width: 'auto'}}>
              <View style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 64, width: 64}}>
                <Image source={swapIcon} style={{width: 32, height: 32, marginBottom: 4, objectFit: 'contain'}}/>
                <RNText style={[typography.daysone, typography.textWhite, typography.textSm,typography.uppercase]}>Swap</RNText>
              </View>
            </BlurContainer>
          </Pressable>
          <Pressable onPress={() => router.push('/wallet/send')}>
            <BlurContainer style={{width: 'auto'}}>
              <View style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 64, width: 64}}>
                <Image source={sendIcon} style={{width: 32, height: 32, marginBottom: 4, objectFit: 'contain'}}/>
                <RNText style={[typography.daysone, typography.textWhite, typography.textSm, typography.uppercase]}>Send</RNText>
              </View>
            </BlurContainer>
          </Pressable>
        </View>


        {/* Portfolio Overview */}
        {/*<View style={styles.card}>*/}
        {/*  <RNText style={styles.cardTitle}>Portfolio Balance</RNText>*/}
        {/*  */}
        {/*  <View style={styles.balanceContainer}>*/}
        {/*    <View style={styles.changeContainer}>*/}
        {/*      <RNText style={[*/}
        {/*        styles.changeText,*/}
        {/*        { color: portfolio.changePercent24h >= 0 ? "#22c55e" : "#ef4444" }*/}
        {/*      ]}>*/}
        {/*        {portfolio.changePercent24h >= 0 ? '+' : ''}{portfolio.changePercent24h.toFixed(2)}%*/}
        {/*      </RNText>*/}
        {/*      <RNText style={styles.changeValue}>*/}
        {/*        ({portfolio.change24h >= 0 ? '+' : ''}{formatCurrency(portfolio.change24h)})*/}
        {/*      </RNText>*/}
        {/*    </View>*/}
        {/*  </View>*/}

        {/*  <View style={styles.portfolioStats}>*/}
        {/*    <View style={styles.statItem}>*/}
        {/*      <RNText style={styles.statLabel}>24h Change</RNText>*/}
        {/*      <RNText style={[*/}
        {/*        styles.statValue,*/}
        {/*        { color: portfolio.change24h >= 0 ? "#22c55e" : "#ef4444" }*/}
        {/*      ]}>*/}
        {/*        {formatCurrency(portfolio.change24h)}*/}
        {/*      </RNText>*/}
        {/*    </View>*/}
        {/*    <View style={styles.statItem}>*/}
        {/*      <RNText style={styles.statLabel}>Tokens</RNText>*/}
        {/*      <RNText style={styles.statValue}>{portfolio.tokens.length}</RNText>*/}
        {/*    </View>*/}
        {/*  </View>*/}
        {/*</View>*/}

        {/* Holdings */}
        <InnerContainer style={{padding: 10, backgroundColor: 'rgba(0, 0, 0, 0.1)',}}>


            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, gap: 10}}>

              {/*Top tokens*/}
              <CustomDropdown
                selectedItem={selectedTopToken}
                items={topTokenItems}
                onSelect={handleBaseTokenChange}
                placeholder="Select Token"
                showSearch={false}
                showIcon={true}
                hideButtonLabel={true}
                showSubLabel={true}
                dropdownWidth={250}
              />

              {/*tokens category*/}
              <CustomDropdown
                selectedItem={selectedCategory}
                items={categoryItems}
                onSelect={setSelectedCategory}
                placeholder="ALL TOKENS"
                showSearch={false}
                showIcon={false}
                dropdownWidth={250}
                minWidth={220}
                searchPlaceholder="Search categories"
              />

            </View>

          {/*User Assets*/}
          {filteredTokens.length > 0 ? (
            <View style={styles.tokensList}>
              {filteredTokens.map((token) => (
                <PortfolioItem
                  key={token.mintAddress}
                  token={token}
                  formatCurrency={formatCurrency}
                  formatNumber={formatNumber}
                  onSend={() => {
                    router.push({
                      pathname: '/wallet/send',
                      params: {
                        tokenMint: token.mintAddress,
                        tokenSymbol: token.symbol,
                      }
                    });
                  }}
                  onSwap={() => {
                    router.push({
                      pathname: '/(tabs)/swap',
                      params: {
                        inputTokenMint: token.mintAddress,
                        inputTokenSymbol: token.symbol,
                        inputTokenName: token.name,
                        inputTokenLogo: token.logo || '',
                        inputTokenDecimals: token.decimals.toString(),
                        inputTokenPrice: token.price?.toString() || '',
                      }
                    });
                  }}
                />
              ))}
            </View>
          ) : isLoadingCategoryTokens ? (
            <View style={{ padding: 32, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#06EBF1" />
              <RNText style={[typography.jura400, { color: '#a0a0a0', marginTop: 12 }]}>
                Loading category tokens...
              </RNText>
            </View>
          ) : (
            <View style={{ padding: 32, alignItems: 'center' }}>
              <RNText style={[typography.jura400, { color: '#a0a0a0' }]}>
                No tokens in {selectedCategory?.label} category
              </RNText>
            </View>
          )}
        </InnerContainer>


        {/* Performance Chart Placeholder - Temporarily hidden */}
        {/* <View style={styles.card}>
          <RNText style={styles.cardTitle}>Portfolio Performance</RNText>

          <View style={styles.chartPlaceholder}>
            <Ionicons name="trending-up" size={48} color="#06EBF1" />
            <RNText style={styles.chartPlaceholderText}>
              Chart Coming Soon
            </RNText>
            <RNText style={styles.chartPlaceholderSubtext}>
              Portfolio performance visualization will be available in a future update
            </RNText>
          </View>
        </View> */}

        {/* Recent Activity */}
        {/*<View style={styles.card}>*/}
        {/*  <View style={styles.cardHeader}>*/}
        {/*    <RNText style={styles.cardTitle}>Recent Activity</RNText>*/}
        {/*    <Pressable>*/}
        {/*      <RNText style={styles.viewAllText}>View All</RNText>*/}
        {/*    </Pressable>*/}
        {/*  </View>*/}

        {/*  {isLoadingTransactions ? (*/}
        {/*    <View style={styles.transactionsLoading}>*/}
        {/*      <ActivityIndicator size="small" color="#06EBF1" />*/}
        {/*      <RNText style={styles.transactionsLoadingText}>Loading transactions...</RNText>*/}
        {/*    </View>*/}
        {/*  ) : transactionsError ? (*/}
        {/*    <View style={styles.transactionsError}>*/}
        {/*      <Ionicons name="alert-circle-outline" size={32} color="#ef4444" />*/}
        {/*      <RNText style={styles.transactionsErrorText}>Failed to load transactions</RNText>*/}
        {/*    </View>*/}
        {/*  ) : !transactions || transactions.length === 0 ? (*/}
        {/*    <View style={styles.transactionsEmpty}>*/}
        {/*      <Ionicons name="receipt-outline" size={32} color="#a0a0a0" />*/}
        {/*      <RNText style={styles.transactionsEmptyText}>No recent transactions</RNText>*/}
        {/*    </View>*/}
        {/*  ) : (*/}
        {/*    <View style={styles.transactionsList}>*/}
        {/*      {transactions.map((tx) => (*/}
        {/*        <View key={tx.id} style={styles.transactionItem}>*/}
        {/*          <View style={styles.transactionIcon}>*/}
        {/*            <Ionicons*/}
        {/*              name={*/}
        {/*                tx.type === 'receive' ? 'arrow-down' :*/}
        {/*                tx.type === 'send' ? 'arrow-up' : 'swap-horizontal'*/}
        {/*              }*/}
        {/*              size={18}*/}
        {/*              color={*/}
        {/*                tx.type === 'receive' ? '#22c55e' :*/}
        {/*                tx.type === 'send' ? '#ef4444' : '#06EBF1'*/}
        {/*              }*/}
        {/*            />*/}
        {/*          </View>*/}

        {/*          <View style={styles.transactionInfo}>*/}
        {/*            <RNText style={styles.transactionType}>*/}
        {/*              {tx.type === 'receive' ? 'Received' :*/}
        {/*               tx.type === 'send' ? 'Sent' : 'Swapped'}*/}
        {/*            </RNText>*/}
        {/*            <RNText style={styles.transactionDetails}>*/}
        {/*              {tx.type === 'swap'*/}
        {/*                ? `${tx.fromAmount} ${tx.fromToken} → ${tx.toAmount} ${tx.toToken}`*/}
        {/*                : `${tx.amount} ${tx.token}`*/}
        {/*              }*/}
        {/*            </RNText>*/}
        {/*            <RNText style={styles.transactionAddress}>*/}
        {/*              {tx.type === 'send' && tx.destination*/}
        {/*                ? `To: ${shortenAddress(tx.destination)}`*/}
        {/*                : tx.type === 'receive'*/}
        {/*                ? `From: ${shortenAddress(tx.source)}`*/}
        {/*                : null*/}
        {/*              }*/}
        {/*            </RNText>*/}
        {/*          </View>*/}

        {/*          <View style={styles.transactionRight}>*/}
        {/*            <RNText style={styles.transactionTime}>*/}
        {/*              {formatTimeAgo(new Date(tx.timestamp))}*/}
        {/*            </RNText>*/}
        {/*            <Ionicons name="chevron-forward" size={14} color="#666" />*/}
        {/*          </View>*/}
        {/*        </View>*/}
        {/*      ))}*/}
        {/*    </View>*/}
        {/*  )}*/}
        {/*</View>*/}

        {/* Portfolio Breakdown */}
        {/*<View style={styles.card}>*/}
        {/*  <RNText style={styles.cardTitle}>Portfolio Breakdown</RNText>*/}
        {/*  */}
        {/*  <View style={styles.breakdownList}>*/}
        {/*    {portfolio.tokens.map((token) => {*/}
        {/*      // Calculate percentage with defensive checks*/}
        {/*      const percentage = (*/}
        {/*        token.value && portfolio.totalBalance && portfolio.totalBalance > 0*/}
        {/*          ? (token.value / portfolio.totalBalance) * 100*/}
        {/*          : 0*/}
        {/*      );*/}

        {/*      // Ensure percentage is a valid finite number*/}
        {/*      const displayPercentage = isFinite(percentage) ? percentage : 0;*/}

        {/*      return (*/}
        {/*        <View key={token.mintAddress} style={styles.breakdownItem}>*/}
        {/*          <View style={styles.breakdownLeft}>*/}
        {/*            <RNText style={styles.breakdownToken}>{token.symbol}</RNText>*/}
        {/*            <RNText style={styles.breakdownValue}>*/}
        {/*              {formatCurrency(token.value)}*/}
        {/*            </RNText>*/}
        {/*          </View>*/}

        {/*          <View style={styles.breakdownRight}>*/}
        {/*            <RNText style={styles.breakdownPercentage}>*/}
        {/*              {displayPercentage.toFixed(1)}%*/}
        {/*            </RNText>*/}
        {/*            <View style={styles.breakdownBar}>*/}
        {/*              <View*/}
        {/*                style={[*/}
        {/*                  styles.breakdownBarFill,*/}
        {/*                  { width: `${displayPercentage}%` }*/}
        {/*                ]}*/}
        {/*              />*/}
        {/*            </View>*/}
        {/*          </View>*/}
        {/*        </View>*/}
        {/*      );*/}
        {/*    })}*/}
        {/*  </View>*/}
        {/*</View>*/}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: 'rgba(23, 23, 23, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  totalBalance: {
    marginBottom: 8,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  changeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  changeValue: {
    color: '#a0a0a0',
    fontSize: 14,
  },
  portfolioStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#a0a0a0',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    color: '#a0a0a0',
    fontSize: 14,
  },
  tokensList: {
    gap: 10,
  },
  tokenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  tokenLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tokenIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(6, 235, 241, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tokenEmoji: {
    fontSize: 20,
  },
  tokenInfo: {
    flex: 1,
  },
  tokenSymbol: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  tokenName: {
    color: '#a0a0a0',
    fontSize: 12,
  },
  tokenRight: {
    alignItems: 'flex-end',
  },
  tokenValues: {
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  tokenValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  tokenBalance: {
    color: '#a0a0a0',
    fontSize: 12,
  },
  tokenChange: {
    alignItems: 'flex-end',
  },
  tokenChangeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  chartPlaceholder: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  chartPlaceholderText: {
    color: '#a0a0a0',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
  chartPlaceholderSubtext: {
    color: '#a0a0a0',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 250,
  },
  viewAllText: {
    color: '#06EBF1',
    fontSize: 14,
    fontWeight: '500',
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(60, 60, 60, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  transactionDetails: {
    color: '#a0a0a0',
    fontSize: 12,
  },
  transactionAddress: {
    color: '#666',
    fontSize: 11,
    marginTop: 2,
  },
  transactionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transactionTime: {
    color: '#a0a0a0',
    fontSize: 12,
  },
  transactionsLoading: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  transactionsLoadingText: {
    color: '#a0a0a0',
    fontSize: 14,
  },
  transactionsError: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  transactionsErrorText: {
    color: '#ef4444',
    fontSize: 14,
  },
  transactionsEmpty: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  transactionsEmptyText: {
    color: '#a0a0a0',
    fontSize: 14,
  },
  breakdownList: {
    gap: 16,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  breakdownLeft: {
    flex: 1,
  },
  breakdownToken: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  breakdownValue: {
    color: '#a0a0a0',
    fontSize: 12,
  },
  breakdownRight: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  breakdownPercentage: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  breakdownBar: {
    width: 60,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  breakdownBarFill: {
    height: '100%',
    backgroundColor: '#06EBF1',
    borderRadius: 2,
  },
  // Loading, error, and empty states
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#a0a0a0',
    fontSize: 16,
    marginTop: 16,
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubtext: {
    color: '#a0a0a0',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#06EBF1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#a0a0a0',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  tokenLogoImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});
