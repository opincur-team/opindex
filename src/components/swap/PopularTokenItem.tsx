import React, { useMemo } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Text as RNText,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { Token } from '@/src/services/tokenService';
import { typography } from '@/src/styles/typography';
import { useFavoriteTokens, useToggleFavorite } from '@/src/hooks/queries/useFavorites';
import { openSolscanToken } from '@/src/utils/browser';
import {BlurContainer, Button} from "@/src/components/ui";
import { TokenIcon } from "@/src/components/ui/TokenIcon";

interface PopularTokenItemProps {
  token: Token;
  inputToken: Token | null;
  onSelectAsOutput: (token: Token) => void;
  userAddress: string;
}

const  starIcon = require('../../../assets/images/icons/star.png');
const starFilledIcon = require('../../../assets/images/icons/star-o.png');

export const PopularTokenItem: React.FC<PopularTokenItemProps> = ({
  token,
  inputToken,
  onSelectAsOutput,
  userAddress,
}) => {
  // Fetch favorites to check if this token is favorited
  const { data: favorites = [] } = useFavoriteTokens(userAddress);
  const { toggleFavorite, isLoading: isTogglingFavorite } = useToggleFavorite();

  // Check if token is favorited
  const isFavorite = useMemo(() => {
    const address = (token.address || token.id || '').toLowerCase();
    return favorites.some(f => (f.address || f.id || '').toLowerCase() === address);
  }, [favorites, token]);

  // Calculate price quote in terms of input token
  const quoteLabel = useMemo(() => {
    if (!inputToken || !token.usdPrice || !inputToken.usdPrice) {
      return token.usdPrice ? `$${token.usdPrice.toFixed(6)}` : '-';
    }

    const ratio = token.usdPrice / inputToken.usdPrice;
    return `${ratio.toFixed(6)} ${inputToken.symbol}`;
  }, [token, inputToken]);

  // Handle favorite toggle
  const handleToggleFavorite = async (e: any) => {
    e.stopPropagation();
    const address = token.address || token.id || '';
    if (address && userAddress) {
      await toggleFavorite(userAddress, address, isFavorite);
    }
  };

  // Handle Solscan link
  const handleSolscan = async () => {
    const address = token.address || token.id || '';
    if (address) {
      await openSolscanToken(address);
    }
  };

  // Handle website link
  const handleWebsite = async () => {
    if (token.url) {
      await Linking.openURL(token.url);
    }
  };

  // Handle swap button
  const handleToSwap = () => {
    onSelectAsOutput(token);
  };

  return (
    <BlurContainer style={{marginBottom: 10}}>
      <View style={styles.container}>
        <View style={styles.topRow}>
          {/* Token Info */}
          <View style={styles.tokenInfo}>
            <TokenIcon logoURI={token.logoURI} symbol={token.symbol} size={40} />

            <View style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
              <RNText style={[typography.daysone, typography.textWhite, styles.tokenName, {textAlign: 'center'}]}>
                {token.name}
              </RNText>

              <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center'}}>

                {/* Quote Price */}
                <RNText style={[typography.jura400, typography.textWhite, styles.quoteText]}>
                  {quoteLabel}
                </RNText>

              </View>
            </View>
          </View>



          {/* Favorite Star */}
          <Pressable
            onPress={handleToggleFavorite}
            disabled={isTogglingFavorite || !userAddress}
            hitSlop={10}
            style={styles.favoriteButton}
          >
            <Image source={isFavorite ? starFilledIcon : starIcon} style={{width: 18, height: 18}} contentFit="contain" />
          </Pressable>
        </View>

        {/* Action Buttons Row */}
        <View style={styles.actionsRow}>
          {/* Website Button (conditional) */}
          {token.url && (
            <Button variant="primary" title=""
                    style={{paddingHorizontal: 14}}
                    onPress={handleWebsite}
                    icon={require('../../../assets/images/icons/web.png')} />
          )}

          {/* Solscan Button */}
          <View style={{flex: 1}}>
            <Button variant="primary" title="SOLSCAN"
                    style={{paddingHorizontal:  10, width: '100%'}}
                    onPress={() => handleSolscan()} icon={require('../../../assets/images/icons/solscan.png')}/>
          </View>
          {/* To Swap Button */}
          <View  style={{flex: 1}}>
            <Button variant="secondary" title="SWAP"
                    style={{paddingHorizontal:  10, width: '100%'}}
                    onPress={handleToSwap} icon={require('../../../assets/images/icons/swap.png')}/>
          </View>
        </View>
      </View>
    </BlurContainer>

  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 30,
    padding: 0,
    marginBottom: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  tokenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  tokenIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  tokenIconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tokenText: {
    flex: 1,
  },
  tokenName: {
    fontSize: 12,
    marginBottom: 2,
  },
  tokenSymbol: {
  },
  quoteContainer: {
    alignItems: 'flex-end',
  },
  quoteText: {
    fontSize: 12,
  },
  favoriteButton: {
    padding: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  webButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexButton: {
    flex: 1,
  },
  gradientButton: {
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
