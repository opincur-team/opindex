import React from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, Text as RNText } from 'react-native';
import { Button } from '../ui/Button';
import { BlurContainer } from '../ui/BlurContainer';
import { BlurOverlay } from '../ui/BlurOverlay';
import { Ionicons } from '@expo/vector-icons';
import { formatAddress } from '@/src/utils/addressValidator';
import { theme } from '@/src/styles/theme';
import { typography } from '@/src/styles/typography';

interface TransferConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  recipientAddress: string;
  amount: string;
  tokenSymbol: string;
  estimatedFee?: number;
  requiresATA?: boolean;
  loading?: boolean;
}

export const TransferConfirmationModal: React.FC<TransferConfirmationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  recipientAddress,
  amount,
  tokenSymbol,
  estimatedFee,
  requiresATA,
  loading = false,
}) => {
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
              <RNText style={[typography.textPrimary, typography.daysone, typography.uppercase, {textAlign: 'center', flex: 1}]}>
                Confirm Transfer
              </RNText>
              <TouchableOpacity onPress={onClose} disabled={loading}>
                <Ionicons
                  name="close"
                  size={28}
                  color={theme.colors.white}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.details}>
              <View style={styles.detailRow}>
                <RNText style={[typography.textWhite, typography.jura400]}>
                  Recipient
                </RNText>
                <RNText style={[typography.textWhite, typography.daysone]}>
                  {formatAddress(recipientAddress, 6, 6)}
                </RNText>
              </View>

              <View style={styles.detailRow}>
                <RNText style={[typography.textWhite, typography.jura400]}>
                  Amount
                </RNText>
                <RNText style={[typography.daysone, styles.amountText]}>
                  {amount} {tokenSymbol}
                </RNText>
              </View>

              {estimatedFee !== undefined && (
                <View style={styles.detailRow}>
                  <RNText style={typography.textSecondary}>
                    Network Fee
                  </RNText>
                  <RNText style={typography.textPrimary}>
                    ~{estimatedFee.toFixed(6)} SOL
                  </RNText>
                </View>
              )}

              {requiresATA && (
                <View style={styles.warningBox}>
                  <Ionicons
                    name="information-circle"
                    size={20}
                    color={theme.colors.warning}
                  />
                  <RNText style={styles.warningText}>
                    Creating new token account: +0.002 SOL
                  </RNText>
                </View>
              )}
            </View>

            <View style={styles.actions}>
              <Button
                title={loading ? 'Processing...' : 'Confirm & Sign'}
                variant="secondary"
                onPress={onConfirm}
                disabled={loading}
                loading={loading}
                style={styles.button}
              />
              <Button
                title="Cancel"
                variant="outline"
                onPress={onClose}
                disabled={loading}
                style={styles.button}
              />
            </View>
          </View>
        </BlurContainer>
      </BlurOverlay>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
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
  details: {
    marginBottom: 10,
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  amountText: {
    color: theme.colors.white,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  warningText: {
    color: theme.colors.warning,
    flex: 1,
  },
  actions: {
    flexDirection: 'column',
    gap: 10,
  },
  button: {
    width: '100%',
  },
});
