import React, { useState, useEffect, useMemo, useImperativeHandle, forwardRef, useRef, useCallback } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Text as RNText,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { InnerContainer } from '../ui/InnerContainer';
import { typography } from '@/src/styles/typography';
import { Token } from '@/src/services/tokenService';
import { useTokenCategories, useInfinitePopularTokens } from '@/src/hooks/queries/usePopularTokens';
import { useFavoriteTokens } from '@/src/hooks/queries/useFavorites';
import { PopularTokenItem } from './PopularTokenItem';
import { CustomDropdown, CustomDropdownItem } from "@/src/components/ui/CustomDropdown";

interface PopularTokensViewProps {
  inputToken: Token | null;
  tokens: Token[];
  onSelectInputToken: (token: Token) => void;
  onSelectOutputToken: (token: Token) => void;
  userAddress: string;
  onSwapFocusRequest?: () => void;
}

// Ref type for parent to call loadMore
export interface PopularTokensViewRef {
  loadMore: () => void;
}

const starIcon = require('../../../assets/images/icons/star.png');
const starFilledIcon = require('../../../assets/images/icons/star-o.png');


export const PopularTokensView = forwardRef<PopularTokensViewRef, PopularTokensViewProps>(({
  inputToken,
  tokens,
  onSelectInputToken,
  onSelectOutputToken,
  userAddress,
  onSwapFocusRequest,
}, ref) => {
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CustomDropdownItem | null>({
    id: 'all',
    label: 'ALL TOKENS'
  });

  // Ref to prevent duplicate pagination calls
  const isLoadingMoreRef = useRef(false);

  // Fetch categories
  const { data: categories = [], isLoading: isLoadingCategories } = useTokenCategories();

  // Fetch favorites
  const { data: favoritesData = [] } = useFavoriteTokens(userAddress);

  // Set initial category when categories load
  useEffect(() => {
    if (categories.length > 0 && (!selectedCategory || selectedCategory.id === 'all')) {
      setSelectedCategory({
        id: String(categories[0].categoryType),
        label: String(categories[0].categoryName),
      });
    }
  }, [categories]);

  // Fetch popular tokens with infinite scroll
  const {
    data: popularTokensData,
    isLoading: isLoadingTokens,
    isFetching: isFetchingTokens,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfinitePopularTokens(selectedCategory?.id || '', 10);

  // Flatten paginated data
  const popularTokens = useMemo(() => {
    // If 'all' category is selected, use the top tokens from parent
    if (selectedCategory?.id === 'all') {
      return tokens;
    }
    // Otherwise use the category-filtered tokens from API
    if (!popularTokensData) return [];
    return popularTokensData.pages.flatMap(page => page.tokens);
  }, [popularTokensData, selectedCategory, tokens]);

  // Get favorite tokens with full Token objects
  const favoriteTokens = useMemo(() => {
    return favoritesData.filter((token): token is Token => token !== null && token !== undefined);
  }, [favoritesData]);

  // Determine which tokens to display
  const displayTokens = showFavorites ? favoriteTokens : popularTokens;

  // Transform categories to dropdown items
  const categoryItems = useMemo<CustomDropdownItem[]>(() => {
    return [
      ...(Array.isArray(categories) && categories.length > 0
        ? categories
            .filter(cat => cat?.categoryType && cat?.categoryName)
            .map(cat => ({
              id: String(cat.categoryType),
              label: String(cat.categoryName),
            }))
        : [])
    ];
  }, [categories]);

  // Transform tokens to dropdown items
  const tokenDropdownItems = useMemo<CustomDropdownItem[]>(() => {
    return tokens
      .filter(token => token?.id || token?.address)
      .map(token => ({
        id: token.id || token.address || '',
        label: token.symbol,
        subLabel: token.name,
        imageUri: token.logoURI,
      }));
  }, [tokens]);

  // Transform selected input token to dropdown item
  const selectedTokenItem = useMemo<CustomDropdownItem | null>(() => {
    if (!inputToken) return null;
    return {
      id: inputToken.id || inputToken.address || '',
      label: inputToken.symbol,
      subLabel: inputToken.name,
      imageUri: inputToken.logoURI,
    };
  }, [inputToken]);

  // Handle category selection (not used anymore, CustomDropdown handles it directly)
  // const handleCategorySelect = (item: CustomDropdownItem) => {
  //   setSelectedCategory(item);
  // };

  // Handle input token selection from dropdown
  const handleInputTokenSelect = (item: CustomDropdownItem) => {
    // Find the full Token object from the id
    const selectedToken = tokens.find(t =>
      (t.id && t.id === item.id) ||
      (t.address && t.address === item.id)
    );

    if (selectedToken) {
      onSelectInputToken(selectedToken);
    }
  };

  // Handle output token selection
  const handleSelectToken = (token: Token) => {
    onSelectOutputToken(token);
    onSwapFocusRequest?.();
  };

  // Reset loading ref when category changes
  useEffect(() => {
    isLoadingMoreRef.current = false;
  }, [selectedCategory?.id]);

  // Handle load more for infinite scroll
  const handleLoadMore = () => {
    // Prevent duplicate calls using ref
    if (isLoadingMoreRef.current) {
      return;
    }

    // Don't paginate for 'all' category (uses parent tokens) or favorites
    if (showFavorites || selectedCategory?.id === 'all') {
      return;
    }

    if (hasNextPage && !isFetchingNextPage) {
      isLoadingMoreRef.current = true;
      fetchNextPage().finally(() => {
        isLoadingMoreRef.current = false;
      });
    }
  };

  // Expose loadMore to parent via ref
  useImperativeHandle(ref, () => ({
    loadMore: handleLoadMore,
  }));

  // Render header
  const renderHeader = () => (
    <View style={styles.header}>
      {/* Favorites Toggle */}
      <Pressable
        onPress={() => setShowFavorites(!showFavorites)}
        style={[
          styles.headerButton,
        ]}
      >
        <Image source={showFavorites ? starFilledIcon : starIcon} style={{width: 25, height: 25}} contentFit="contain" />
      </Pressable>

      {/* Input Token Display */}
      <View>
        <CustomDropdown
          selectedItem={selectedTokenItem}
          items={tokenDropdownItems}
          onSelect={handleInputTokenSelect}
          placeholder="Select Token"
          showSearch={false}
          showIcon={true}
          hideButtonLabel={true}
          showSubLabel={true}
          dropdownWidth={250}
        />
      </View>


      {/*<View style={styles.inputTokenDisplay}>*/}
      {/*  {renderInputTokenIcon(inputToken)}*/}
      {/*  <RNText style={[typography.daysone, typography.textWhite, styles.inputTokenText]}>*/}
      {/*    {inputToken?.symbol || 'Select Input'}*/}
      {/*  </RNText>*/}
      {/*</View>*/}

      {/* Category Dropdown */}
      <CustomDropdown
        selectedItem={selectedCategory}
        items={categoryItems}
        onSelect={setSelectedCategory}
        placeholder="ALL TOKENS"
        showSearch={false}
        showIcon={false}
        dropdownWidth={250}
        minWidth={170}
        alignContent='right'
        searchPlaceholder="SEARCH TOKENS"
      />

    </View>
  );

  // Render loading state
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#06EBF1" />
      <RNText style={[typography.jura400, typography.textWhite, styles.loadingText]}>
        Loading tokens...
      </RNText>
    </View>
  );

  // Render empty state
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <RNText style={[typography.jura400, typography.textWhite, styles.emptyText]}>
        {showFavorites ? 'No favorite tokens yet' : 'No tokens found'}
      </RNText>
    </View>
  );

  // Render footer (pagination loading)
  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" color="#06EBF1" />
      </View>
    );
  };

  return (
    <InnerContainer style={styles.container}>
      {renderHeader()}

      <View style={styles.listContainer}>
        {isLoadingCategories || (isLoadingTokens && !showFavorites && displayTokens.length === 0) ? (
          renderLoading()
        ) : displayTokens.length === 0 ? (
          renderEmpty()
        ) : (
          <View style={styles.listContent}>
            {displayTokens.map((item, index) => (
              <View key={item.address || item.id || index.toString()}>
                <PopularTokenItem
                  token={item}
                  inputToken={inputToken}
                  onSelectAsOutput={handleSelectToken}
                  userAddress={userAddress}
                />
              </View>
            ))}
            {renderFooter()}
          </View>
        )}
      </View>
    </InnerContainer>
  );
});

PopularTokensView.displayName = 'PopularTokensView';

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    padding: 10,
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  headerButton: {
    width: 57,
    height: 57,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  headerButtonActive: {
    backgroundColor: 'rgba(6, 235, 241, 0.2)',
    borderWidth: 1,
    borderColor: '#06EBF1',
  },
  inputTokenDisplay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 50,
  },
  inputTokenIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputTokenIconPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputTokenText: {
    fontSize: 14,
  },
  categoryButtonText: {
    fontSize: 12,
  },
  dropdownOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dropdownContent: {
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  dropdownContainer: {
    padding: 12,
    maxHeight: 300,
  },
  dropdownScroll: {
    flexGrow: 0,
  },
  categoryItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryItemActive: {
    backgroundColor: 'rgba(6, 235, 241, 0.2)',
  },
  categoryItemPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  categoryItemText: {
    fontSize: 14,
  },
  listContainer: {
    flex: 1,
    minHeight: 200,
  },
  listContent: {
    paddingBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
  },
  footerLoading: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
