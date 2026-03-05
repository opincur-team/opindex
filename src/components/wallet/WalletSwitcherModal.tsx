import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Modal } from '@/src/components/ui/Modal';
import { Text } from '@/src/components/ui/Text';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { formatAddress, formatCurrency , copyToClipboard } from '@/src/utils/formatting';
import * as Haptics from 'expo-haptics';
import { theme } from '@/src/styles/theme';
import { commonStyles } from '@/src/styles/common';
import { typography } from '@/src/styles/typography';

export interface WalletAccount {
  id: string;
  name: string;
  address: string;
  derivationPath: string;
  balance: number;
  isActive: boolean;
  lastUsed?: Date;
}

interface WalletSwitcherModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectWallet: (wallet: WalletAccount) => void;
  onAddWallet: () => void;
  wallets: WalletAccount[];
  currentWallet?: WalletAccount;
  loading?: boolean;
}

export const WalletSwitcherModal: React.FC<WalletSwitcherModalProps> = ({
  visible,
  onClose,
  onSelectWallet,
  onAddWallet,
  wallets,
  currentWallet,
  loading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredWallets, setFilteredWallets] = useState<WalletAccount[]>(wallets);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredWallets(wallets);
    } else {
      const filtered = wallets.filter(
        (wallet) =>
          wallet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          wallet.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredWallets(filtered);
    }
  }, [searchQuery, wallets]);

  const handleSelectWallet = (wallet: WalletAccount) => {
    onSelectWallet(wallet);
    onClose();
  };

  const handleCopyAddress = async (address: string) => {
    await copyToClipboard(address, 'Address copied to clipboard');
    Haptics.selectionAsync();
  };

  const sortedWallets = [...filteredWallets].sort((a, b) => {
    // Active wallet first
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    
    // Then by last used (most recent first)
    if (a.lastUsed && b.lastUsed) {
      return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
    }
    if (a.lastUsed && !b.lastUsed) return -1;
    if (!a.lastUsed && b.lastUsed) return 1;
    
    // Finally by name
    return a.name.localeCompare(b.name);
  });

  const renderWalletItem = ({ item: wallet }: { item: WalletAccount }) => (
    <TouchableOpacity
      onPress={() => handleSelectWallet(wallet)}
      style={styles.walletItemContainer}
    >
      <Card style={wallet.isActive ? styles.cardActive : styles.cardInactive}>
        <View style={commonStyles.p4}>
          <View style={[styles.row, styles.rowBetween, commonStyles.mb3]}>
            <View style={[styles.row, commonStyles.flex1]}>
              <View style={commonStyles.mr3}>
                {wallet.isActive ? (
                  <View style={[styles.iconBadge, styles.iconBadgeActive]}>
                    <Ionicons name="checkmark" size={18} color={theme.colors.primary} />
                  </View>
                ) : (
                  <View style={[styles.iconBadge, styles.iconBadgeInactive]}>
                    <Ionicons name="wallet-outline" size={18} color="#666" />
                  </View>
                )}
              </View>
              <View style={commonStyles.flex1}>
                <View style={styles.row}>
                  <Text
                    font="jura"
                    size="base"
                    color="white"
                    style={[typography.jura600, commonStyles.flex1]}
                  >
                    {wallet.name}
                  </Text>
                  {wallet.isActive && (
                    <View style={[styles.activeBadge, commonStyles.ml2]}>
                      <Text size="xs" color="primary" font="jura" style={typography.jura500}>
                        Active
                      </Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => handleCopyAddress(wallet.address)}
                  style={[styles.row, commonStyles.mt1]}
                >
                  <Text size="sm" style={[typography.mono, typography.textGray400]}>
                    {formatAddress(wallet.address, 6)}
                  </Text>
                  <Ionicons
                    name="copy-outline"
                    size={14}
                    color="#666"
                    style={{ marginLeft: 6 }}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={[styles.row, styles.rowBetween]}>
            <View>
              <Text size="xs" color="secondary" font="jura" style={typography.jura300}>
                Balance
              </Text>
              <Text size="sm" color="white" font="jura" style={typography.jura500}>
                {formatCurrency(wallet.balance)}
              </Text>
            </View>
            <View style={styles.alignEnd}>
              <Text size="xs" color="secondary" font="jura" style={typography.jura300}>
                Account
              </Text>
              <Text size="sm" font="jura" style={[typography.jura400, typography.textGray300]}>
                {wallet.derivationPath.split('/')[3]?.replace("'", '') || '0'}
              </Text>
            </View>
          </View>

          {wallet.lastUsed && !wallet.isActive && (
            <View style={[commonStyles.mt2, commonStyles.pt2, styles.borderTop]}>
              <Text size="xs" font="jura" style={[typography.jura300, typography.textGray500]}>
                Last used: {wallet.lastUsed.toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Switch Wallet"
      size="lg"
      animationType="slide"
    >
      <View style={commonStyles.flex1}>
        {/* Search Input */}
        <View style={commonStyles.mb4}>
          <Input
            placeholder="Search wallets..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<Ionicons name="search-outline" size={18} color="#666" />}
            style={styles.searchInput}
          />
        </View>

        {/* Wallet List */}
        {loading ? (
          <View style={styles.centerContainer}>
            <Text color="secondary">Loading wallets...</Text>
          </View>
        ) : sortedWallets.length === 0 ? (
          <View style={[styles.centerContainer, commonStyles.px4]}>
            <Ionicons name="wallet-outline" size={48} color="#666" />
            <Text
              color="secondary"
              align="center"
              style={[commonStyles.mt4, commonStyles.mb2]}
            >
              {searchQuery ? 'No wallets found' : 'No wallets available'}
            </Text>
            <Text
              size="sm"
              align="center"
              style={[typography.textGray500, commonStyles.mb6]}
            >
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Create your first wallet to get started'
              }
            </Text>
          </View>
        ) : (
          <FlatList
            data={sortedWallets}
            renderItem={renderWalletItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}

        {/* Add Wallet Button */}
        <View style={styles.addButtonContainer}>
          <Button
            title="Add New Wallet"
            onPress={() => {
              onAddWallet();
              onClose();
            }}
            variant="outline"
            leftIcon="add"
            style={styles.fullWidth}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Wallet item container
  walletItemContainer: {
    marginBottom: 12,
  },

  // Card styles
  cardActive: {
    borderColor: `${theme.colors.primary}80`, // primary/50
    backgroundColor: `${theme.colors.primary}1A`, // primary/10
  },
  cardInactive: {
    borderColor: theme.colors.border.light,
  },

  // Layout styles
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    justifyContent: 'space-between',
  },
  alignEnd: {
    alignItems: 'flex-end',
  },

  // Icon badge
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadgeActive: {
    backgroundColor: `${theme.colors.primary}33`, // primary/20
  },
  iconBadgeInactive: {
    backgroundColor: 'rgba(102, 102, 102, 0.3)', // gray-600/30
  },

  // Active badge
  activeBadge: {
    backgroundColor: `${theme.colors.primary}33`, // primary/20
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.md,
  },

  // Border
  borderTop: {
    borderTopWidth: theme.borderWidth.default,
    borderTopColor: 'rgba(255, 255, 255, 0.05)', // border-white/5
  },

  // Search input
  searchInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // bg-black/40
  },

  // Center container (for loading/empty states)
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Add button container
  addButtonContainer: {
    marginTop: theme.spacing[4],
    paddingTop: theme.spacing[4],
    borderTopWidth: theme.borderWidth.default,
    borderTopColor: theme.colors.border.light,
  },

  // Full width
  fullWidth: {
    width: '100%',
  },
});