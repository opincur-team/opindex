import React, { useMemo } from 'react';
import { View, Image, StyleSheet, Text as RNText } from 'react-native';
import { BlurContainer } from '@/src/components/ui';
import { typography } from '@/src/styles/typography';
import { Token } from '@/src/services/tokenService';

interface TokenChartProps {
  inputToken: Token | null;
  outputToken: Token | null;
}

export const TokenChart: React.FC<TokenChartProps> = ({
  inputToken,
  outputToken,
}) => {
  // Calculate the pair price (input token price in terms of output token)
  const tokenPrice = useMemo(() => {
    const inputTokenPrice = inputToken?.usdPrice || inputToken?.price;
    const outputTokenPrice = outputToken?.usdPrice || outputToken?.price;

    if (!inputTokenPrice || !outputTokenPrice) {
      return null;
    }

    return inputTokenPrice / outputTokenPrice;
  }, [inputToken, outputToken]);

  // Calculate 24h price change for the pair
  const tokenPriceChange = useMemo(() => {
    const inputTokenPrice = inputToken?.usdPrice || inputToken?.price;
    const outputTokenPrice = outputToken?.usdPrice || outputToken?.price;
    const inputChange = inputToken?.usdPrice24hChange || inputToken?.priceChange24h || 0;
    const outputChange = outputToken?.usdPrice24hChange || outputToken?.priceChange24h || 0;

    if (!inputTokenPrice || !outputTokenPrice) {
      return null;
    }

    // Calculate previous prices based on 24h change
    const inputTokenLastPrice = inputTokenPrice / (1 + inputChange / 100);
    const outputTokenLastPrice = outputTokenPrice / (1 + outputChange / 100);

    const currentPrice = inputTokenPrice / outputTokenPrice;
    const lastPrice = inputTokenLastPrice / outputTokenLastPrice;

    return ((currentPrice - lastPrice) / lastPrice) * 100;
  }, [inputToken, outputToken]);

  // Format price with appropriate decimals
  const formatPrice = (price: number): string => {
    if (price >= 1000) {
      return price.toFixed(2);
    } else if (price >= 1) {
      return price.toFixed(4);
    } else if (price >= 0.0001) {
      return price.toFixed(6);
    } else {
      return price.toExponential(4);
    }
  };

  // Don't render if tokens are not selected
  if (!inputToken || !outputToken) {
    return null;
  }

  const isPositiveChange = tokenPriceChange !== null && tokenPriceChange >= 0;

  return (
    <View style={styles.container}>

      {/*First row*/}
      <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10}}>
        <View style={styles.logosContainer}>
          {inputToken.logoURI && (
            <Image
              source={{ uri: inputToken.logoURI }}
              style={styles.tokenLogo}
              resizeMode="cover"
            />
          )}
          {outputToken.logoURI && (
            <Image
              source={{ uri: outputToken.logoURI }}
              style={[styles.tokenLogo, styles.overlappingLogo]}
              resizeMode="cover"
            />
          )}
        </View>


        {/* Pair Symbol - Top Right */}
        <View style={styles.symbolContainer}>
          <RNText style={[typography.daysone, typography.textWhite, styles.symbolText]}>
            {inputToken.symbol} / {outputToken.symbol}
          </RNText>
        </View>

      </View>

      {/*Second row*/}
      <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10}}>

        {/* Token Logos - Top Left */}
        <View style={styles.changeContainer}>
          {tokenPriceChange !== null ? (
            <RNText
              style={[
                typography.daysone,
                styles.changeText,
                { color: isPositiveChange ? '#22c55e' : '#ef4444' },
              ]}
            >
              {isPositiveChange ? '+' : ''}{tokenPriceChange.toFixed(2)}%
            </RNText>
          ) : (
            <RNText style={[typography.jura400, { color: '#666' }]}>--</RNText>
          )}
        </View>

        {/* Token Price - Bottom Right */}
        <View style={styles.priceContainer}>
          {tokenPrice !== null ? (
            <RNText style={[typography.daysone, typography.textWhite, styles.priceText, {textAlign: 'center'}]}>
              {formatPrice(tokenPrice)}
            </RNText>
          ) : (
            <RNText style={[typography.jura400, { color: '#666', textAlign: 'center' }]}>--</RNText>
          )}
        </View>


      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 0,
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  logosContainer: {
    minWidth: 80,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 0,
  },
  tokenLogo: {
    width: 28,
    height: 28,
    borderRadius: 16,
  },
  overlappingLogo: {
    marginLeft: 0,
    borderWidth: 0,
  },
  symbolContainer: {
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 0,
  },
  symbolText: {
    fontSize: 14,
  },
  changeContainer: {
    minWidth: 80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 0,
  },
  changeText: {
    fontSize: 16,
  },
  changeLabel: {
    color: '#666',
    fontSize: 12,
  },
  priceContainer: {
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 0,
  },
  priceText: {
    fontSize: 16,
  },
});
