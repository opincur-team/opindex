import React from 'react';
import {View, Modal, StyleSheet, Text as RNText, Image, TouchableOpacity,} from 'react-native';
import { BlurContainer } from '../ui/BlurContainer';
import { InnerContainer } from '../ui/InnerContainer';
import { BlurOverlay } from '../ui/BlurOverlay';
import { Button } from '../ui';
import { typography } from '@/src/styles/typography';
import { Token } from '@/src/services/tokenService';
import { SwapQuoteResponse } from '@/src/services/tokenService';
import { swapService } from '@/src/services/swapService';
import { Ionicons } from '@expo/vector-icons';
import {theme} from "@/src/styles/theme";

interface SwapConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  inputToken: Token;
  outputToken: Token;
  inputAmount: number;
  quote: SwapQuoteResponse | null;
  isExecuting?: boolean;
}

const swapIcon = require('../../../assets/images/icons/swap.png');

export const SwapConfirmationModal: React.FC<SwapConfirmationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  inputToken,
  outputToken,
  inputAmount,
  quote,
  isExecuting = false,
}) => {
  if (!quote || !quote.data) return null;

  const { data } = quote;
  const outputAmount = swapService.smallestUnitsToAmount(data.outAmount, outputToken.decimals);
  const minimumReceived = swapService.smallestUnitsToAmount(data.otherAmountThreshold, outputToken.decimals);
  const priceImpact = data.priceImpact;
  // Network fee is in lamports (SOL), convert to SOL with 9 decimals
  const networkFeeSol = swapService.smallestUnitsToAmount(data.prioritizationFeeLamports, 9);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurOverlay>
        <BlurContainer style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <RNText style={[typography.textPrimary, typography.daysone, typography.uppercase, {textAlign: 'center', flex: 1, marginRight: -40}]}>
                Confirm Swap
              </RNText>
              <TouchableOpacity onPress={onClose}>
                <Ionicons
                  name="close"
                  size={28}
                  color={theme.colors.white}
                />
              </TouchableOpacity>
            </View>

            {/* Token Swap Visual */}
            <View style={styles.swapVisual}>
              <View style={styles.tokenRow}>
                {inputToken.logoURI && (
                  <Image source={{ uri: inputToken.logoURI }} style={styles.tokenIcon} />
                )}
                <View style={styles.tokenInfo}>
                  <RNText style={[typography.daysone, typography.textWhite, typography.textSm]}>
                    {inputToken.symbol}
                  </RNText>
                  <RNText style={[typography.jura400, typography.textWhite, typography.textBase]}>
                    {inputAmount.toFixed(6)}
                  </RNText>
                </View>
              </View>


              <View style={{display: 'flex', alignItems: 'center', marginVertical: 10,}}>
                <Image source={swapIcon} style={{width: 24, height: 24,}}/>
              </View>


              <View style={[styles.tokenRow, {paddingBottom: 10,}]}>
                {outputToken.logoURI && (
                  <Image source={{ uri: outputToken.logoURI }} style={styles.tokenIcon} />
                )}
                <View style={styles.tokenInfo}>
                  <RNText style={[typography.daysone, typography.textWhite, typography.textSm]}>
                    {outputToken.symbol}
                  </RNText>
                  <RNText style={[typography.jura400, typography.textWhite, typography.textBase]}>
                    {outputAmount.toFixed(6)}
                  </RNText>
                </View>
              </View>
            </View>

            {/* Details */}
            <InnerContainer style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <RNText style={[typography.jura400, typography.textWhite]}>
                  Price Impact
                </RNText>
                <RNText style={[typography.jura400, typography.textWhite, {
                  color: priceImpact > 5 ? '#ef4444' : priceImpact > 1 ? '#f59e0b' : '#10b981'
                }]}>
                  {priceImpact.toFixed(2)}%
                </RNText>
              </View>

              <View style={styles.detailRow}>
                <RNText style={[typography.jura400, typography.textWhite]}>
                  Minimum Received
                </RNText>
                <RNText style={[typography.jura400, typography.textWhite]}>
                  {minimumReceived.toFixed(6)} {outputToken.symbol}
                </RNText>
              </View>

              <View style={styles.detailRow}>
                <RNText style={[typography.jura400, typography.textWhite]}>
                  Slippage Tolerance
                </RNText>
                <RNText style={[typography.jura400, typography.textWhite]}>
                  {(data.slippageBps / 100).toFixed(2)}%
                </RNText>
              </View>

              <View style={styles.detailRow}>
                <RNText style={[typography.jura400, typography.textWhite]}>
                  Network Fee
                </RNText>
                <RNText style={[typography.jura400, typography.textWhite]}>
                  {networkFeeSol.toFixed(6)} SOL
                </RNText>
              </View>

              {data.routePlan && data.routePlan.length > 0 && (
                <View style={styles.detailRow}>
                  <RNText style={[typography.jura400, typography.textWhite]}>
                    Route
                  </RNText>
                  <RNText style={[typography.jura400, typography.textWhite]}>
                    {data.routePlan.map(r => r.swapInfo.label).join(' → ')}
                  </RNText>
                </View>
              )}
            </InnerContainer>

            {/* Warning for high price impact */}
            {priceImpact > 5 && (
              <View style={styles.warningContainer}>
                <Ionicons name="warning" size={16} color="#f59e0b" />
                <RNText style={[typography.jura400, { color: '#f59e0b', marginLeft: 8, flex: 1 }]}>
                  High price impact! Consider swapping a smaller amount.
                </RNText>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actions}>
              <Button
                title={isExecuting ? "Swapping..." : "Confirm Swap"}
                variant="secondary"
                onPress={onConfirm}
                loading={isExecuting}
                disabled={isExecuting}
                style={{ flex: 1, minWidth: 220 }}
              />
            </View>

          </View>
        </BlurContainer>
      </BlurOverlay>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    borderRadius: 30,
  },
  modalContent: {
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  swapVisual: {
    marginBottom: 10,
  },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 25,
  },
  tokenIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  tokenInfo: {
    flex: 1,
    alignItems: 'center',
    marginLeft: -40,
  },
  detailsContainer: {
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f59e0b',
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
});
