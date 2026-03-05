import React, { useState, useRef } from 'react';
import {
  View,
  Text as RNText,
  Pressable,
  ScrollView,
  Image,
  StyleSheet,
  Modal,
} from 'react-native';
import { BlurContainer } from './BlurContainer';
import { InnerContainer } from './InnerContainer';
import { typography } from '@/src/styles/typography';
import { Ionicons } from '@expo/vector-icons';

export interface TokenDropdownItem {
  id: string;          // Token mint address
  symbol: string;      // Token symbol (e.g., "SOL", "USDC")
  balance: number;     // Available balance
  logo?: string;       // Token logo URL
  name?: string;       // Full token name (optional)
}

export interface CustomDropdownTokensProps {
  selectedToken: TokenDropdownItem | null;
  tokens: TokenDropdownItem[];
  onSelect: (token: TokenDropdownItem) => void;
  placeholder?: string;
  showIcon?: boolean;
  uppercaseText?: boolean;
  minWidth?: number;
}

export const CustomDropdownTokens: React.FC<CustomDropdownTokensProps> = ({
  selectedToken,
  tokens,
  onSelect,
  placeholder = 'Select Token',
  showIcon = true,
  uppercaseText = false,
  minWidth = 140,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [buttonLayout, setButtonLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const buttonRef = useRef<View>(null);

  const handleSelect = (token: TokenDropdownItem) => {
    onSelect(token);
    setShowDropdown(false);
  };

  const handleClose = () => {
    setShowDropdown(false);
  };

  return (
    <View style={styles.container}>
      {/* Selected Token Button */}
      <Pressable
        ref={buttonRef}
        onPress={() => {
          if (buttonRef.current) {
            buttonRef.current.measureInWindow((x, y, width, height) => {
              setButtonLayout({ x, y, width, height });
              setShowDropdown(!showDropdown);
            });
          }
        }}
        style={[styles.selectedButton, { minWidth }]}
      >
        <InnerContainer style={{ borderRadius: 20, padding: 0 }}>
          <View style={styles.selectedContent}>
            {showIcon && selectedToken?.logo && (
              <Image
                source={{ uri: selectedToken.logo }}
                style={styles.tokenIcon}
                resizeMode="contain"
              />
            )}
            {showIcon && !selectedToken?.logo && selectedToken && (
              <View style={styles.placeholderIcon}>
                <RNText style={styles.placeholderText}>
                  {selectedToken.symbol.charAt(0) || '?'}
                </RNText>
              </View>
            )}
            <View style={styles.selectedTextContainer}>
              <RNText
                style={[
                  typography.daysone,
                  typography.textWhite,
                  typography.textSm,
                  uppercaseText && { textTransform: 'uppercase' },
                ]}
              >
                {selectedToken?.symbol || placeholder}
              </RNText>
              {selectedToken && (
                <RNText
                  style={[
                    typography.daysone,
                    typography.textWhite,
                    typography.textSm,
                  ]}
                >
                  {selectedToken.balance.toFixed(4)}
                </RNText>
              )}
            </View>
            <Ionicons
              name={showDropdown ? "chevron-up" : "chevron-down"}
              size={20}
              color="#fff"
            />
          </View>
        </InnerContainer>
      </Pressable>

      {/* Dropdown Modal */}
      {showDropdown && (
        <Modal transparent visible={showDropdown} animationType="fade">
          <Pressable
            style={styles.modalOverlay}
            onPress={handleClose}
          >
            <Pressable
              style={[
                styles.dropdownContainer,
                buttonLayout && {
                  position: 'absolute',
                  top: buttonLayout.y + buttonLayout.height - 15,
                  left: buttonLayout.x - 10,
                  width: buttonLayout.width + 20,
                },
              ]}
              onPress={(e) => e.stopPropagation()}
            >
              <BlurContainer>
                <ScrollView
                  style={styles.scrollView}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={true}
                >
                  {tokens.map((token) => (
                    <Pressable
                      key={token.id}
                      onPress={() => handleSelect(token)}
                      style={({ pressed }) => [
                        styles.tokenItem,
                        pressed && styles.tokenItemPressed,
                        selectedToken?.id === token.id && styles.tokenItemSelected,
                      ]}
                    >
                      {showIcon && token.logo && (
                        <Image
                          source={{ uri: token.logo }}
                          style={styles.tokenIconSmall}
                          resizeMode="contain"
                        />
                      )}
                      {showIcon && !token.logo && (
                        <View style={styles.tokenIconPlaceholder}>
                          <RNText style={styles.tokenIconText}>
                            {token.symbol.charAt(0)}
                          </RNText>
                        </View>
                      )}
                      <View style={styles.tokenInfo}>
                        <RNText
                          style={[
                            typography.daysone,
                            typography.textWhite,
                            typography.textSm,
                            uppercaseText && { textTransform: 'uppercase' },
                          ]}
                        >
                          {token.symbol}
                        </RNText>
                        {token.name && (
                          <RNText
                            style={[
                              typography.jura400,
                              { fontSize: 11, color: '#a0a0a0' },
                            ]}
                            numberOfLines={1}
                          >
                            {token.name}
                          </RNText>
                        )}
                      </View>
                      <View style={styles.tokenBalance}>
                        <RNText
                          style={[
                            typography.jura400,
                            typography.textSm,
                            { color: '#fff', textAlign: 'right' },
                          ]}
                        >
                          {token.balance.toFixed(4)}
                        </RNText>
                        <RNText
                          style={[
                            typography.jura400,
                            { fontSize: 11, color: '#a0a0a0', textAlign: 'right' },
                          ]}
                        >
                          available
                        </RNText>
                      </View>
                    </Pressable>
                  ))}
                  {tokens.length === 0 && (
                    <View style={styles.emptyContainer}>
                      <RNText
                        style={[
                          typography.jura400,
                          typography.textWhite,
                          { color: '#a0a0a0' },
                        ]}
                      >
                        No tokens available
                      </RNText>
                    </View>
                  )}
                </ScrollView>
              </BlurContainer>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  selectedButton: {
    height: 60,
  },
  selectedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  selectedLabel: {
    flex: 1,
  },
  selectedTextContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  tokenIcon: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
  },
  placeholderIcon: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'rgba(6, 235, 241, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdownContainer: {
    maxWidth: 400,
    padding: 10,
  },
  scrollView: {
    maxHeight: 300,
  },
  scrollContent: {
    padding: 8,
  },
  tokenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 18,
    gap: 12,
  },
  tokenItemPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tokenItemSelected: {
    backgroundColor: 'rgba(6, 235, 241, 0.1)',
  },
  tokenIconSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  tokenIconPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(6, 235, 241, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenIconText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  tokenInfo: {
    flex: 1,
    gap: 2,
  },
  tokenBalance: {
    alignItems: 'flex-end',
    gap: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
});
