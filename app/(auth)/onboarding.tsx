import { Button, BlurContainer } from '@/src/components/ui';
import { useAppStore } from '@/src/stores/appStore';
import * as Haptics from 'expo-haptics';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState, useEffect } from 'react';
import { walletService } from '@/src/services/walletService';
import {
  Dimensions,
  ScrollView,
  View,
  StyleSheet,
  Text as RNText,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography } from '@/src/styles/typography';
import {InnerContainer} from "@/src/components/ui/InnerContainer";
import {LogoImage} from "@/src/components/ui/LogoImage";
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

const logoImage = require('../../assets/images/opindex-logo.png');
const logoImageS = require('../../assets/images/opindex-logo-s.png');
const wallet = require('../../assets/images/wallet.png');

const { width } = Dimensions.get('window');

const FEATURES = [
  {
    id: 'swap',
    icon: 'swap-horizontal' as const,
    title: 'Token Swapping',
    description: 'Swap tokens instantly with the best rates powered by Jupiter aggregator',
    gradient: ['#06EBF1', '#A40CFF'],
  },
  {
    id: 'launchpad',
    icon: 'rocket' as const,
    title: 'Token Creation',
    description: 'Create and launch your own tokens on Solana with our intuitive launchpad',
    gradient: ['#A40CFF', '#06EBF1'],
  },
  {
    id: 'liquidity',
    icon: 'water' as const,
    title: 'Liquidity Management',
    description: 'Provide liquidity and earn fees from trading pairs',
    gradient: ['#06EBF1', '#00FF88'],
  },
  {
    id: 'wallet',
    icon: 'wallet' as const,
    title: 'Self-Custody Wallet',
    description: 'Your keys, your crypto. Full control with military-grade security',
    gradient: ['#00FF88', '#06EBF1'],
  },
];

// Create endless scroll array with duplicates
const ENDLESS_FEATURES = [...FEATURES, ...FEATURES, ...FEATURES];

export default function OnboardingScreen() {
  const { fromWalletSetup } = useLocalSearchParams<{ fromWalletSetup?: string }>();
  const [currentIndex, setCurrentIndex] = useState(FEATURES.length);
  const scrollViewRef = useRef<ScrollView>(null);
  const { setOnboarded } = useAppStore();
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [isCheckingWallet, setIsCheckingWallet] = useState(true);

  // Check if wallet already exists and auto-skip onboarding
  useEffect(() => {
    // Skip auto-redirect if user explicitly came back from wallet setup
    if (fromWalletSetup === 'true') {
      setIsCheckingWallet(false);
      return;
    }

    const checkWallet = async () => {
      try {
        const hasWallet = await walletService.hasWallet();
        if (hasWallet) {
          setOnboarded(true);
          router.replace('/(tabs)/portfolio');
        } else {
          setIsCheckingWallet(false);
        }
      } catch (error) {
        console.error('Error checking wallet:', error);
        setIsCheckingWallet(false);
      }
    };
    checkWallet();
  }, [fromWalletSetup]);

  useEffect(() => {
    // Initialize position to middle set
    scrollViewRef.current?.scrollTo({
      x: FEATURES.length * width,
      animated: false,
    });

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const nextIndex = prevIndex + 1;
        scrollViewRef.current?.scrollTo({
          x: nextIndex * width,
          animated: true,
        });
        return nextIndex;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleScroll = (event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollX / width);
    
    setCurrentIndex(index);
    
    // Reset position when reaching end or beginning
    if (index >= ENDLESS_FEATURES.length - FEATURES.length) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: FEATURES.length * width,
          animated: false,
        });
        setCurrentIndex(FEATURES.length);
      }, 100);
    } else if (index < FEATURES.length) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: (ENDLESS_FEATURES.length - FEATURES.length * 2) * width,
          animated: false,
        });
        setCurrentIndex(ENDLESS_FEATURES.length - FEATURES.length * 2);
      }, 100);
    }
  };

  const goToSlide = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * width,
      animated: true,
    });
    setCurrentIndex(index);
    void Haptics.selectionAsync();
  };

  const handleCreateWallet = async () => {
    setIsCreatingWallet(true);
    // Small delay to ensure loading UI appears
    await new Promise(resolve => setTimeout(resolve, 50));
    // Don't set onboarded yet - only after wallet is verified and stored
    router.replace({ pathname: '/(auth)/wallet-setup', params: { mode: 'create' } });
    // Loading state will clear naturally when screen unmounts
  };

  const handleImportWallet = () => {
    // Don't set onboarded yet - only after wallet is successfully imported
    router.replace({ pathname: '/(auth)/wallet-setup', params: { mode: 'import' } });
  };


  // Show loading screen while checking wallet
  if (isCheckingWallet) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.checkingWalletContainer}>
          <LogoImage />
          <ActivityIndicator size="large" color="#06EBF1" style={{ marginTop: 20 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <Animated.ScrollView
        entering={FadeIn.duration(400)}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingTop: 50, paddingHorizontal: 24, marginBottom: 20 }}>
          <View style={{ alignItems: 'center' }}>

            <LogoImage/>

            <BlurContainer
              style={{
                marginBottom: 10,
                marginTop: -40,
              }}
            >
              <View style={{padding: 16}}>
                <RNText style={[
                  typography.textXl,
                  typography.daysone,
                  typography.textWhite,
                  { textAlign: 'center' }
                ]}>
                  WELCOME TO WEB 3.0
                </RNText>
              </View>
            </BlurContainer>

            <BlurContainer >
              <View style={{flexDirection: 'column', gap: 10}}>
                <InnerContainer>
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
                    <Image source={logoImageS} style={{width: 64, height: 64}} />
                    <RNText style={[
                      typography.textLg,
                      typography.daysone,
                      typography.textWhite,
                      { textAlign: 'center' }
                    ]}>OPINDEX WALLET</RNText>
                  </View>
                  <View style={{padding: 10}}>
                    <Button
                      variant='secondary'
                      title="Create Wallet"
                      onPress={handleCreateWallet}
                      style={{ width: '100%' }}
                    />
                  </View>
                </InnerContainer>

                <InnerContainer>
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
                    <Image source={wallet} style={{width: 64, height: 64}} />
                    <RNText style={[
                      typography.textLg,
                      typography.daysone,
                      typography.textWhite,
                      { textAlign: 'center' }
                    ]}>EXISTING WALLET</RNText>
                  </View>
                  <View style={{padding: 10}}>
                    <Button
                      variant='primary'
                      title="Import Wallet"
                      onPress={handleImportWallet}
                      style={{ width: '100%' }}
                    />
                  </View>
                </InnerContainer>
              </View>

            </BlurContainer>


          </View>
        </View>
      </Animated.ScrollView>

      {/* Full Screen Loading Overlay */}
      {isCreatingWallet && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.loadingOverlay}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#06EBF1" />
            <RNText style={styles.loadingText}>Setting up your wallet...</RNText>
          </View>
        </Animated.View>
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
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  checkingWalletContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  logoStyle: {
    width: '100%',
    height: undefined,
    aspectRatio: 2.07,         // width:height ratio (adjust to your logo)
    alignSelf: 'center',
    resizeMode: 'contain',
  }

});


{/* Feature Carousel */}
{/*<View style={{ height: 220, marginBottom: 12 }}>*/}
{/*  <ScrollView*/}
{/*    ref={scrollViewRef}*/}
{/*    horizontal*/}
{/*    pagingEnabled*/}
{/*    showsHorizontalScrollIndicator={false}*/}
{/*    onScroll={handleScroll}*/}
{/*    scrollEventThrottle={16}*/}
{/*    decelerationRate="normal"*/}
{/*    snapToInterval={width}*/}
{/*    snapToAlignment="start"*/}
{/*  >*/}
{/*    {ENDLESS_FEATURES.map((feature, index) => (*/}
{/*      <View key={`${feature.id}-${index}`} style={{*/}
{/*        width,*/}
{/*        paddingHorizontal: 24,*/}
{/*        justifyContent: 'center',*/}
{/*        alignItems: 'center'*/}
{/*      }}>*/}
{/*        <View style={{*/}
{/*          backgroundColor: 'transparent',*/}
{/*          borderRadius: 16,*/}
{/*          padding: 20,*/}
{/*          borderWidth: 2,*/}
{/*          borderColor: 'rgba(255, 255, 255, 0.2)',*/}
{/*          width: '100%',*/}
{/*          maxWidth: width - 48*/}
{/*        }}>*/}
{/*          <View style={{ alignItems: 'center' }}>*/}
{/*            <View style={{*/}
{/*              width: 60,*/}
{/*              height: 60,*/}
{/*              backgroundColor: 'rgba(6, 235, 241, 0.2)',*/}
{/*              borderRadius: 30,*/}
{/*              alignItems: 'center',*/}
{/*              justifyContent: 'center',*/}
{/*              marginBottom: 16*/}
{/*            }}>*/}
{/*              <Ionicons name={feature.icon} size={36} color="#06EBF1" />*/}
{/*            </View>*/}

{/*            <RNText style={{*/}
{/*              color: 'white',*/}
{/*              fontSize: 18,*/}
{/*              fontWeight: 'bold',*/}
{/*              textAlign: 'center',*/}
{/*              marginBottom: 12*/}
{/*            }}>*/}
{/*              {feature.title}*/}
{/*            </RNText>*/}

{/*            <RNText style={{*/}
{/*              color: '#a0a0a0',*/}
{/*              fontSize: 13,*/}
{/*              textAlign: 'center',*/}
{/*              lineHeight: 18*/}
{/*            }}>*/}
{/*              {feature.description}*/}
{/*            </RNText>*/}
{/*          </View>*/}
{/*        </View>*/}
{/*      </View>*/}
{/*    ))}*/}
{/*  </ScrollView>*/}
{/*</View>*/}

{/* Pagination Dots */}
{/*<View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16 }}>*/}
{/*  {FEATURES.map((_, index) => (*/}
{/*    <Pressable*/}
{/*      key={index}*/}
{/*      onPress={() => goToSlide(currentIndex - (currentIndex % FEATURES.length) + index)}*/}
{/*      style={{*/}
{/*        marginHorizontal: 4,*/}
{/*        borderRadius: 4,*/}
{/*        backgroundColor: currentIndex % FEATURES.length === index ? '#06EBF1' : '#666',*/}
{/*        width: currentIndex % FEATURES.length === index ? 20 : 8,*/}
{/*        height: 8,*/}
{/*      }}*/}
{/*    />*/}
{/*  ))}*/}
{/*</View>*/}
