import React from 'react';
import { Pressable, View, Image, Text as RNText, StyleSheet } from 'react-native';
import {InnerContainer} from "@/src/components/ui/InnerContainer";
import { BlurContainer } from "./BlurContainer";
import { Button } from '@/src/components/ui';
import {typography} from "@/src/styles/typography";
import { openSolscanToken } from '@/src/utils/browser';
const sendIcon =  require('../../../assets/images/icons/send.png');

interface Token {
  mintAddress: string;
  logo?: string;
  symbol: string;
  name: string;
  value: number;
  balance: number;
  change24h: number;
  decimals: number;
  url?: string
}

interface PortfolioItemProps {
  token: Token;
  formatCurrency: (value: number) => string;
  formatNumber: (value: number, decimals?: number) => string;
  onPress?: () => void;
  onSend?: () => void;
  onSwap?: () => void;
}

export const PortfolioItem: React.FC<PortfolioItemProps> = ({
  token,
  formatCurrency,
  formatNumber,
  onPress,
  onSend,
  onSwap,
}) => {
  return (
    <Pressable onPress={onPress} style={styles.tokenItem}>
      <BlurContainer>
        <View style={styles.tokenInfoRow}>
          <View style={styles.tokenIcon}>
            {token.logo ? (
              <Image
                source={{ uri: token.logo }}
                style={styles.tokenLogoImage}
                resizeMode="cover"
              />
            ) : (
              <RNText style={styles.tokenEmoji}>{token.symbol.charAt(0)}</RNText>
            )}
          </View>
          <View style={styles.tokenInfo}>
            <RNText style={[typography.daysone,  typography.textBase, typography.textWhite, styles.tokenName]}>{token.name}</RNText>
            <RNText style={[typography.jura400, typography.textWhite, typography.textBase, styles.tokenValue]}>
              {formatCurrency(token.value)}
            </RNText>

          </View>
          <View>
            <Pressable onPress={onSend} style={styles.sendButton}>
              <Image source={sendIcon} style={styles.sendButtonImage}/>
            </Pressable>
          </View>
        </View>


        <InnerContainer  style={{paddingHorizontal: 10, paddingVertical: 8, backgroundColor: 'rgba(0, 0, 0, 0.2)', marginTop: 10, borderRadius: 20}}>
            <View style={styles.tokenValues}>
              <RNText style={[typography.daysone,
                typography.textWhite, styles.tokenBalance]}>
                {token.symbol} {formatNumber(token.balance, Math.min(token.decimals, 6))}
              </RNText>
            </View>

            {/*<View style={styles.tokenChange}>*/}
            {/*  <RNText style={[*/}
            {/*    styles.tokenChangeText,*/}
            {/*    { color: token.change24h >= 0 ? "#22c55e" : "#ef4444" }*/}
            {/*  ]}>*/}
            {/*    {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%*/}
            {/*  </RNText>*/}
            {/*</View>*/}
        </InnerContainer>

        <View style={{ flexDirection: 'row', marginTop: 10, gap: 10 }}>
          {token.url && (
            <Button variant="primary" title=""
                    style={{paddingHorizontal: 14}}
                    onPress={()=>{}}
                    icon={require('../../../assets/images/icons/web.png')} />
          )}
          <View style={{flex: 1}}>
            <Button variant="primary" title="SOLSCAN"
                    style={{paddingHorizontal:  10, width: '100%'}}
                    onPress={() => openSolscanToken(token.mintAddress)} icon={require('../../../assets/images/icons/solscan.png')}/>
          </View>
          <View  style={{flex: 1}}>
            <Button variant="secondary" title="SWAP"
                    style={{paddingHorizontal:  10, width: '100%'}}
                    onPress={onSwap} icon={require('../../../assets/images/icons/swap.png')}/>
          </View>
        </View>
      </BlurContainer>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  tokenItem: {
  },
  tokenInfoRow: {
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
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
  },
  tokenSymbol: {
  },
  tokenName: {
  },
  tokenAmountRow: {
  },
  tokenValues: {
    padding: 10,
    alignItems: 'center',
  },
  tokenValue: {
  },
  tokenBalance: {
  },
  tokenChange: {
    alignItems: 'flex-end',
  },
  tokenChangeText: {
  },
  tokenLogoImage: {
    width: 40,
    height: 40,
    borderRadius: 20,

  },
  sendButton: {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonImage: {
    width: 20,
    height: 20,
  }


});
