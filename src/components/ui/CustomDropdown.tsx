import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text as RNText,
  Pressable,
  TextInput,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';
import { BlurContainer } from './BlurContainer';
import { InnerContainer } from './InnerContainer';
import { TokenIcon } from './TokenIcon';
import { typography } from '@/src/styles/typography';
import { Ionicons } from '@expo/vector-icons';


export interface CustomDropdownItem {
  id: string;
  label: string;        // Main text (e.g., token symbol)
  subLabel?: string;    // Secondary text (e.g., token name)
  imageUri?: string;    // Logo/icon URL
}

export interface CustomDropdownProps {
  selectedItem: CustomDropdownItem | null;
  items: CustomDropdownItem[];
  onSelect: (item: CustomDropdownItem) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  showSearch?: boolean;
  showIcon?: boolean;
  showSubLabel?: boolean;
  uppercaseText?: boolean;
  hideButtonLabel?: boolean;
  dropdownWidth?: number | 'auto';
  minWidth?: number;
  maxWidth?: number;
  alignContent?: 'left' | 'right';
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  selectedItem,
  items,
  onSelect,
  placeholder = 'Select',
  searchPlaceholder = 'Search',
  showSearch = true,
  showIcon = true,
  showSubLabel = true,
  uppercaseText = false,
  hideButtonLabel = false,
  dropdownWidth,
  minWidth = 140,
  maxWidth,
  alignContent = 'left',
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [buttonLayout, setButtonLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const buttonRef = useRef<View>(null);

  // Filter items based on search text
  const filteredItems = useMemo(() => {
    if (!searchText.trim()) {
      return items;
    }
    const search = searchText.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(search) ||
        (item.subLabel && item.subLabel.toLowerCase().includes(search))
    );
  }, [items, searchText]);

  const handleSelect = (item: CustomDropdownItem) => {
    onSelect(item);
    setShowDropdown(false);
    setSearchText('');
  };

  const handleClose = () => {
    setShowDropdown(false);
    setSearchText('');
  };

  return (
    <View style={styles.container}>
      {/* Selected Item Button */}
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
        style={[
          styles.selectedButton,
          { minWidth: hideButtonLabel && showIcon ? 70 : minWidth }
        ]}
      >
        <InnerContainer style={{ borderRadius: 25, padding: 0, backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
          <View style={styles.selectedContent}>
            {showIcon && selectedItem && (
              <TokenIcon
                logoURI={selectedItem.imageUri}
                symbol={selectedItem.label}
                size={35}
                placeholderBackground="rgba(6, 235, 241, 0.2)"
              />
            )}
            {!hideButtonLabel && (
              <RNText
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[
                  typography.daysone,
                  typography.textWhite,
                  typography.textSm,
                  uppercaseText && { textTransform: 'uppercase' },
                  styles.selectedLabel,
                  maxWidth ? { maxWidth } : undefined,
                ]}
              >
                {selectedItem?.label || placeholder}
              </RNText>
            )}
            <Ionicons
              name={showDropdown ? "chevron-up" : "chevron-down"}
              size={20}
              color="#fff"
            />
          </View>
        </InnerContainer>
      </Pressable>

      {/* Dropdown Modal Overlay */}
      {showDropdown && (
        <Modal transparent visible={showDropdown} animationType="fade">
          <Pressable
            style={styles.modalOverlay}
            onPress={handleClose}
          >
            <Pressable
              style={[
                styles.dropdownContainer,
                buttonLayout && (() => {
                  const calculatedWidth = dropdownWidth === 'auto'
                    ? buttonLayout.width
                    : (dropdownWidth || buttonLayout.width);

                  const leftPosition = alignContent === 'right'
                    ? buttonLayout.x + buttonLayout.width - calculatedWidth + 10
                    : buttonLayout.x - 10;

                  // const leftPosition = 300;
                  return {
                    position: 'absolute',
                    top: buttonLayout.y + buttonLayout.height,
                    left: leftPosition,
                    width: dropdownWidth === 'auto' ? undefined : calculatedWidth,
                    minWidth: dropdownWidth === 'auto' ? buttonLayout.width : undefined,
                  };
                })(),
                !showSearch && { paddingTop: 0 }
              ]}
              onPress={(e) => e.stopPropagation()}
            >
              {/* Search Input */}
              {showSearch && (
                <InnerContainer
                  style={{
                    marginBottom: 10,
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  }}
                >
                  <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#fff" />
                    <TextInput
                      value={searchText}
                      onChangeText={setSearchText}
                      placeholder={searchPlaceholder}
                      placeholderTextColor="#a0a0a0"
                      style={[
                        typography.jura400,
                        typography.textWhite,
                        styles.searchInput,
                      ]}
                    />
                  </View>
                </InnerContainer>
              )}

              {/* Dropdown List */}
              <BlurContainer fallbackBackground='rgba(20, 20, 20, 0.8)'>
                <ScrollView
                  style={styles.scrollView}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={true}
                >
                  {filteredItems.map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={() => handleSelect(item)}
                      style={({ pressed }) => [
                        styles.listItem,
                        pressed && styles.listItemPressed,
                      ]}
                    >
                      {showIcon && (
                        <TokenIcon
                          logoURI={item.imageUri}
                          symbol={item.label}
                          size={28}
                          placeholderBackground="rgba(6, 235, 241, 0.2)"
                        />
                      )}
                      <View style={[styles.listTextContainer, showIcon && { marginLeft: 12 }]}>
                        <RNText
                          style={[
                            typography.daysone,
                            typography.textWhite,
                            typography.textSm,
                            uppercaseText && { textTransform: 'uppercase' },
                          ]}
                        >
                          {item.label}
                        </RNText>
                        {showSubLabel && item.subLabel && (
                          <RNText
                            style={[
                              typography.jura400,
                              typography.textSm,
                              { color: '#a0a0a0' },
                            ]}
                            numberOfLines={1}
                          >
                            {item.subLabel}
                          </RNText>
                        )}
                      </View>
                    </Pressable>
                  ))}
                  {filteredItems.length === 0 && (
                    <View style={styles.emptyContainer}>
                      <RNText
                        style={[
                          typography.jura400,
                          typography.textWhite,
                          { color: '#a0a0a0' },
                        ]}
                      >
                        No items found
                      </RNText>
                    </View>
                  )}
                </ScrollView>

                {/*<InnerContainer*/}
                {/*  style={{*/}
                {/*    backgroundColor: 'rgba(0, 0, 0, 0.4)',*/}
                {/*    maxHeight: 224,*/}
                {/*  }}*/}
                {/*>*/}
                {/*</InnerContainer>*/}

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
    minHeight: 56,
    gap: 4,
  },
  selectedLabel: {
    flex: 1,
  },
  selectedIcon: {
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    padding: 0,
  },
  scrollView: {
    maxHeight: 204,
  },
  scrollContent: {
    padding: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  listItemPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  listIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  listIconPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(6, 235, 241, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listIconText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  listTextContainer: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
});
