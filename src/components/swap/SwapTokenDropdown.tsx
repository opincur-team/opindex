import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Modal,
  Pressable,
  StyleSheet,
  Text as RNText,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { BlurContainer } from '../ui/BlurContainer';
import { InnerContainer } from '../ui/InnerContainer';
import { TokenIcon } from '../ui/TokenIcon';
import { typography } from '@/src/styles/typography';
import { Token, tokenService } from '@/src/services/tokenService';
import { useFavoriteTokens, useToggleFavorite } from '@/src/hooks/queries/useFavorites';
import { useDebounce } from '@/src/hooks/common/useDebounce';
import { openSolscanToken } from '@/src/utils/browser';

interface SwapTokenDropdownProps {
  selectedToken: Token | null;
  tokens: Token[];
  onSelect: (token: Token) => void;
  userAddress: string;
  placeholder?: string;
  balance?: number;
}

const CHERVON_SIZE = 20;
const starIcon = require('../../../assets/images/icons/star.png');
const starFilledIcon = require('../../../assets/images/icons/star-o.png');
const openWebIcon =    require('../../../assets/images/icons/share-2.png');

export const SwapTokenDropdown: React.FC<SwapTokenDropdownProps> = ({
  selectedToken,
  tokens,
  onSelect,
  userAddress,
  placeholder = 'Select Token',
  balance,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Token[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [buttonLayout, setButtonLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Ref for button to measure position
  const buttonRef = useRef<View>(null);

  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 400);

  // Fetch favorites
  const { data: favorites = [] } = useFavoriteTokens(userAddress);
  const { toggleFavorite, isLoading: isTogglingFavorite } = useToggleFavorite();

  // Create a set of favorite token addresses for quick lookup
  const favoriteAddresses = useMemo(() => {
    return new Set(favorites.map(f => (f.address || f.id || '').toLowerCase()));
  }, [favorites]);

  // Check if a token is favorited
  const isFavorite = (token: Token) => {
    const address = (token.address || token.id || '').toLowerCase();
    return favoriteAddresses.has(address);
  };

  // Handle favorite toggle
  const handleToggleFavorite = async (token: Token, e: any) => {
    e.stopPropagation();
    const address = token.address || token.id || '';
    await toggleFavorite(userAddress, address, isFavorite(token));
  };

  // Handle external link
  const handleExternalLink = async (token: Token, e: any) => {
    e.stopPropagation();
    const address = token.address || token.id || '';
    if (address) {
      await openSolscanToken(address);
    }
  };

  // External search when query length >= 3
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearch.length >= 3) {
        setIsSearching(true);
        try {
          const results = await tokenService.searchTokens(debouncedSearch);
          if (results && results.tokens) {
            setSearchResults(results.tokens);
          } else {
            setSearchResults([]);
          }
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    };

    performSearch();
  }, [debouncedSearch]);

  // Filter and organize tokens
  const { favoriteTokens, regularTokens } = useMemo(() => {
    let filtered: Token[];

    if (searchQuery.length >= 3) {
      // Use API search results directly without additional filtering
      // The API already filtered based on the search query
      filtered = searchResults;
    } else {
      // For short queries (< 3 chars), use initial tokens with client-side filter
      filtered = tokens.filter(token => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
          token.symbol.toLowerCase().includes(query) ||
          token.name?.toLowerCase().includes(query)
        );
      });
    }

    // Get all favorites from API (not just those in tokens prop)
    let allFavorites = favorites.filter((token): token is Token =>
      token !== null && token !== undefined
    );

    // Apply search filter to favorites if searching
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      allFavorites = allFavorites.filter(token =>
        token.symbol.toLowerCase().includes(query) ||
        token.name?.toLowerCase().includes(query)
      );
    }

    // Regular tokens = filtered tokens that are NOT favorites
    const regs = filtered.filter(token => !isFavorite(token));

    return { favoriteTokens: allFavorites, regularTokens: regs };
  }, [tokens, searchResults, searchQuery, favoriteAddresses, favorites]);

  // Measure button position when opening modal
  const handleOpenModal = () => {
    buttonRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setButtonLayout({ x: pageX, y: pageY, width, height });
      setSearchQuery('');
      setIsOpen(true);
    });
  };

  // Handle token selection
  const handleSelect = (token: Token) => {
    onSelect(token);
    setIsOpen(false);
    setSearchQuery('');
  };

  // Render token row in list
  const renderTokenRow = (token: Token) => {
    const isSelected = selectedToken?.address === token.address || selectedToken?.id === token.id;
    const tokenIsFav = isFavorite(token);

    const currentStarIcon = tokenIsFav ? starFilledIcon : starIcon;
    // const currentStarIcon = openWebIcon;

    return (
      <Pressable
        key={token.address || token.id}
        style={({ pressed }) => [
          styles.tokenRow,
          isSelected && styles.selectedRow,
          pressed && styles.pressedRow,
        ]}
        onPress={() => handleSelect(token)}
      >
        <View style={styles.tokenRowLeft}>
          <TokenIcon logoURI={token.logoURI} symbol={token.symbol} size={40} />
          <View style={styles.tokenRowInfo}>
            <RNText style={[typography.daysone, typography.textWhite, styles.tokenRowSymbol]}>
              {token.symbol}
            </RNText>
            {token.name && (
              <RNText style={[typography.daysone, styles.tokenRowName, typography.textWhite, typography.textXs]}>
                {token.name}
              </RNText>
            )}
          </View>
        </View>

        <View style={styles.tokenRowRight}>
          <Pressable
            onPress={(e) => handleToggleFavorite(token, e)}
            disabled={isTogglingFavorite}
            hitSlop={10}
            style={styles.iconButton}
          >
            <Image source={currentStarIcon} style={{width: 18, height: 18}} contentFit="contain" />
          </Pressable>

          <Pressable
            onPress={(e) => handleExternalLink(token, e)}
            hitSlop={10}
            style={styles.iconButton}
          >
            <Image source={openWebIcon} style={{width: 18, height: 18}} contentFit="contain" />
          </Pressable>
        </View>
      </Pressable>
    );
  };

  return (
    <View ref={buttonRef} collapsable={false}>
      {/* Collapsed State */}
      <Pressable onPress={handleOpenModal}>
        <InnerContainer style={styles.collapsedContainer}>
          {selectedToken ? (
            <>
              <TokenIcon logoURI={selectedToken.logoURI} symbol={selectedToken.symbol} size={40} />
              <View style={styles.collapsedInfo}>
                <RNText style={[typography.daysone, typography.textWhite]} numberOfLines={1}
                        ellipsizeMode="tail">
                  {selectedToken.symbol}
                </RNText>
              </View>
              <Ionicons name="chevron-down" size={CHERVON_SIZE} color="#fff" />
            </>
          ) : (
            <>
              <RNText style={[typography.daysone, typography.textWhite]}>
                {placeholder}
              </RNText>
              <Ionicons name="chevron-down" size={CHERVON_SIZE} color="#fff" />
            </>
          )}
        </InnerContainer>
      </Pressable>

      {/* Expanded State - Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsOpen(false)}>
          <Pressable
            style={[
              styles.modalContent,
              { top: buttonLayout.y }
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <BlurContainer style={{padding: 0}} fallbackBackground='rgba(20, 20, 20, 0.8)' borderRadius={25}>
              <View style={[styles.expandedContainer]}>


                <View style={{display: 'flex', flexDirection: 'row', marginBottom: 10,
                  justifyContent: 'space-between', alignItems: 'center', gap: 10}}>
                  {/*Selecte Token*/}
                  <Pressable onPress={() => setIsOpen(false)}>
                    <InnerContainer style={styles.collapsedContainer}>
                      {selectedToken ? (
                        <>
                          <TokenIcon logoURI={selectedToken.logoURI} symbol={selectedToken.symbol} size={40} />
                          <View style={styles.collapsedInfo}>
                            <RNText style={[typography.daysone, typography.textWhite]} numberOfLines={1}
                                    ellipsizeMode="tail">
                              {selectedToken.symbol}
                            </RNText>
                          </View>
                          <Ionicons name="chevron-up" size={CHERVON_SIZE} color="#fff" />
                        </>
                      ) : (
                        <>
                          <RNText style={[typography.daysone, { color: '#666' }]}>
                            {placeholder}
                          </RNText>
                          <Ionicons name="chevron-up" size={CHERVON_SIZE} color="#666" />
                        </>
                      )}
                    </InnerContainer>
                  </Pressable>


                  {/* Search Bar */}
                  <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#a0a0a0" style={styles.searchIcon} />
                    <TextInput
                      style={[typography.daysone, styles.searchInput]}
                      placeholder="Search"
                      placeholderTextColor="#666"
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {isSearching && (
                      <ActivityIndicator size="small" color="#06EBF1" style={styles.searchSpinner} />
                    )}
                  </View>

                </View>


                {/* Token List */}
                <ScrollView style={styles.tokenList} showsVerticalScrollIndicator={false}>
                  {/* Favorite Tokens Section */}
                  {favoriteTokens.length > 0 && (
                    <View style={styles.section}>
                      <RNText style={[typography.jura400, styles.sectionTitle, typography.textWhite,{marginLeft: 10}  ]}>
                        FAVORITES
                      </RNText>
                      {favoriteTokens.map(renderTokenRow)}
                    </View>
                  )}

                  {/* Regular Tokens Section */}
                  {regularTokens.length > 0 && (
                    <View style={styles.section}>
                      {favoriteTokens.length > 0 && (
                        <RNText style={[typography.jura400, styles.sectionTitle, typography.textWhite, {marginLeft: 10}]}>
                          ALL TOKENS
                        </RNText>
                      )}
                      {regularTokens.map(renderTokenRow)}
                    </View>
                  )}

                  {/* No Results */}
                  {!isSearching && favoriteTokens.length === 0 && regularTokens.length === 0 && (
                    <View style={styles.noResults}>
                      <RNText style={[typography.jura400, typography.textWhite]}>
                        No tokens found
                      </RNText>
                    </View>
                  )}
                </ScrollView>
              </View>
            </BlurContainer>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // Collapsed State
  collapsedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
    paddingHorizontal: 8,
    height: 60,
    width: 150,
    gap: 10,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  collapsedInfo: {
    flex: 1,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  modalContent: {
    position: 'absolute',
    width: '100%',
    paddingHorizontal: 30,
    maxHeight: '50%',
  },

  // Expanded State
  expandedContainer: {
    padding: 0,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 0,
    width: '50%',
    minWidth: 120,
    height: 60,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',fontSize: 16,
  },
  searchSpinner: {
    marginLeft: 10,
  },

  // Token List
  tokenList: {
    maxHeight: 400,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    marginBottom: 10,
  },

  // Token Row
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginBottom: 10,
  },
  selectedRow: {
  },
  pressedRow: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  tokenRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  tokenRowInfo: {
    flex: 1,
  },
  tokenRowSymbol: {
    fontSize: 16,
  },
  tokenRowName: {
    marginTop: 2,
  },
  tokenRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    padding: 4,
  },

  // Token Icon
  tokenIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tokenIconPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // No Results
  noResults: {
    padding: 32,
    alignItems: 'center',
  },
});
