import { apiClient } from './api';

// Types for token data
export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  verified?: boolean;
  price?: number;
  priceChange24h?: number;
  volume24h?: number;
  marketCap?: number;
  id?: string; // Alias for address, used by API responses
  usdPrice?: number; // Alias for price
  usdPrice24hChange?: number; // Alias for priceChange24h
  url?: string; // Token website URL
}

export interface TokenCategory {
  categoryType: string;
  categoryName: string;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PopularTokens {
  categoryType: string;
  categoryName: string;
  tokens: Token[];
  pagination: PaginationInfo;
}

export interface TokenBalance {
  token: Token;
  balance: string;
  usdValue?: number;
}

export interface SwapQuoteRequest {
  inputTokenAddress: string;
  outputTokenAddress: string;
  inputAmount: number;
  userAddress: string;
}

export interface SwapQuoteResponse {
  data: {
    mode: string;
    inputMint: string;
    outputMint: string;
    inAmount: string;
    outAmount: string;
    otherAmountThreshold: string;
    swapMode: string;
    slippageBps: number;
    priceImpactPct: string;
    routePlan: Array<{
      swapInfo: {
        ammKey: string;
        label: string;
        inputMint: string;
        outputMint: string;
        inAmount: string;
        outAmount: string;
        feeAmount: string;
        feeMint: string;
      };
      percent: number;
    }>;
    feeMint: string;
    feeBps: number;
    swapType: string;
    router: string;
    gasless: boolean;
    requestId: string;
    taker: string;
    transaction: string;
    prioritizationFeeLamports: number;
    inUsdValue: number;
    outUsdValue: number;
    priceImpact: number;
    swapUsdValue: number;
    totalTime: number;
    errorMessage?: string;
  };
}

export interface SwapExecuteRequest {
  requestId: string;
  userAddress: string;
  signedTransaction: string;
}

export interface SwapExecuteResponse {
  success?: boolean;
  errorMessage?: string;
  errorCode?: number;
}

export interface ShortTokenInfo {
  id: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
}

export interface SwapOrder {
  id: string;
  userAddress: string;
  inputTokenAddress: string;
  inputToken?: ShortTokenInfo;
  outputTokenAddress: string;
  outputToken?: ShortTokenInfo;
  inputAmount: string;
  outputAmount: string;
  createdAt: Date;
}

export interface TokenSearchResult {
  tokens: Token[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface FavoriteToken {
  token: Token;
  addedAt: number;
}

// Token Data Service
class TokenService {
  // Get swap quote
  async getSwapQuote(request: SwapQuoteRequest): Promise<SwapQuoteResponse> {
    const response = await apiClient.post('/api/token-data/get-order', request);

    // apiClient.post already unwraps response.data.data
    // So 'response' is the actual quote data object
    // Just wrap it in the expected {data: ...} format
    return {
      data: response
    };
  }

  // Execute swap transaction
  async executeSwap(request: SwapExecuteRequest): Promise<SwapExecuteResponse> {
    const result = await apiClient.post('/api/token-data/execute-order', request);

    // API returns just `true` for success, wrap it in expected format
    if (result === true) {
      return { success: true };
    }

    // If result is already an object, return as-is
    return result as SwapExecuteResponse;
  }

  // Search tokens
  async searchTokens(
    query: string,
    limit: number = 20,
    cursor?: string
  ): Promise<TokenSearchResult> {
    try {
      // Use raw axios instance because API returns {data: [], status: 200}
      // instead of the expected {data: {data: []}} structure
      const response = await apiClient.getAxiosInstance().get('/api/token-data/search', {
        params: {
          token: query,
          limit,
          cursor,
        },
      });

      // Extract array from response.data.data or response.data
      const tokens = response.data.data || response.data || [];

      return {
        tokens: Array.isArray(tokens) ? tokens : [],
        hasMore: Array.isArray(tokens) && tokens.length >= limit,
        nextCursor: undefined,
      };
    } catch (error) {
      console.error('Failed to search tokens:', error);
      return {
        tokens: [],
        hasMore: false,
        nextCursor: undefined,
      };
    }
  }

  // Get top/popular tokens
  async getTopTokens(limit: number = 50): Promise<Token[]> {
    try {
      // Use raw axios instance because API returns {data: [], status: 200}
      // instead of the expected {data: {data: []}} structure
      const response = await apiClient.getAxiosInstance().get('/api/token-data/top-tokens', {
        params: { limit },
      });
      const tokens = response.data.data || response.data || [];
      return Array.isArray(tokens) ? tokens : [];
    } catch (error) {
      console.error('Failed to fetch top tokens:', error);
      return [];
    }
  }

  // Get user token balances
  async getUserBalances(address: string): Promise<TokenBalance[]> {
    return apiClient.get(`/api/token-data/balance`, {
      params: { address },
    });
  }

  // Get user swap history
  async getSwapHistory(
    address: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<SwapOrder[]> {
    return apiClient.get(`/api/token-data/${address}/history`, {
      params: { limit, offset },
    });
  }

  // Get user favorite tokens
  async getFavoriteTokens(address: string): Promise<Token[]> {
    return apiClient.get(`/api/token-data/${address}/favorites`);
  }

  // Add token to favorites
  async addFavoriteToken(address: string, tokenAddress: string): Promise<void> {
    return apiClient.post(`/api/token-data/${address}/favorites`, {
      tokenId: tokenAddress,
    });
  }

  // Remove token from favorites
  async removeFavoriteToken(address: string, tokenId: string): Promise<void> {
    return apiClient.delete(`/api/token-data/${address}/favorites/${tokenId}`);
  }

  // Get token categories
  async getTokenCategories(): Promise<TokenCategory[]> {
    try {
      // Use raw axios instance because API returns {data: [], status: 200}
      // instead of the expected {data: {data: []}} structure
      const response = await apiClient.getAxiosInstance().get('/api/token-data/token-categories');
      const categories = response.data.data || response.data || [];
      return Array.isArray(categories) ? categories : [];
    } catch (error) {
      console.error('Failed to fetch token categories:', error);
      return [];
    }
  }

  // Get tokens by category
  async getTokensByCategory(
    category: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PopularTokens> {
    try {
      // Use raw axios instance because API returns {data: {...}, status: 200}
      // instead of the expected {data: {data: {...}}} structure
      const response = await apiClient.getAxiosInstance().get('/api/token-data/popular-tokens', {
        params: { category, page, limit },
      });
      const data = response.data.data || response.data;
      return data as PopularTokens;
    } catch (error) {
      console.error('Failed to fetch tokens by category:', error);
      throw error;
    }
  }

  // Get token details
  async getTokenDetails(address: string): Promise<Token> {
    return apiClient.get(`/api/token-data/token/${address}`);
  }

  // Get token price history for charts
  async getTokenPriceHistory(
    address: string,
    interval: '1h' | '1d' | '1w' | '1m',
    limit: number = 100
  ): Promise<{ timestamp: number; price: number; volume?: number }[]> {
    return apiClient.get(`/api/market/charts/${address}`, {
      params: { interval, limit },
    });
  }

  // Get token statistics
  async getTokenStats(address: string): Promise<{
    price: number;
    priceChange24h: number;
    volume24h: number;
    marketCap: number;
    holders: number;
    allTimeHigh: number;
    allTimeLow: number;
  }> {
    return apiClient.get(`/api/market/stats/${address}`);
  }

  // Get trending tokens
  async getTrendingTokens(period: '1h' | '24h' | '7d' = '24h'): Promise<Token[]> {
    return apiClient.get('/api/analytics/trending', {
      params: { period },
    });
  }
}

// Create and export singleton instance
export const tokenService = new TokenService();