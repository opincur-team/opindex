import { apiClient } from './api';

// Types for launchpad functionality
export interface CreateTokenRequest {
  name: string;
  symbol: string;
  decimals: number;
  description?: string;
  totalSupply: string;
  initialMint: string;
  mintAuthority?: string;
  freezeAuthority?: string;
  imageFile?: FormData;
  socialLinks?: {
    website?: string;
    twitter?: string;
    telegram?: string;
    discord?: string;
  };
}

export interface LaunchpadToken {
  id: string;
  mint: string;
  name: string;
  symbol: string;
  decimals: number;
  description?: string;
  totalSupply: string;
  currentSupply: string;
  mintAuthority?: string;
  freezeAuthority?: string;
  imageUrl?: string;
  socialLinks?: {
    website?: string;
    twitter?: string;
    telegram?: string;
    discord?: string;
  };
  creator: string;
  createdAt: number;
  verified: boolean;
  hasPool: boolean;
  poolAddress?: string;
}

export interface PoolCreationRequest {
  tokenA: string;
  tokenB: string;
  poolType: 'CLMM' | 'CPMM';
  initialPriceX64?: string;
  tickSpacing?: number;
  feeRate?: number;
  openBookMarketId?: string;
  initialLiquidityA: string;
  initialLiquidityB: string;
  priceRangeMin?: number;
  priceRangeMax?: number;
}

export interface LiquidityPosition {
  id: string;
  poolAddress: string;
  tokenA: {
    mint: string;
    symbol: string;
    amount: string;
  };
  tokenB: {
    mint: string;
    symbol: string;
    amount: string;
  };
  lpTokens: string;
  shareOfPool: number;
  feesEarned: {
    tokenA: string;
    tokenB: string;
  };
  poolType: 'CLMM' | 'CPMM';
  priceRange?: {
    min: number;
    max: number;
  };
  createdAt: number;
}

export interface TransactionRequest {
  transaction: string;
  userAddress: string;
}

export interface TransactionResponse {
  signature: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface PoolFeeConfig {
  feeRates: number[];
  defaultFeeRate: number;
  tickSpacings: number[];
  defaultTickSpacing: number;
}

// Launchpad Service
class LaunchpadService {
  // Create new token
  async createToken(request: CreateTokenRequest): Promise<LaunchpadToken> {
    const formData = new FormData();
    
    // Add basic token data
    formData.append('name', request.name);
    formData.append('symbol', request.symbol);
    formData.append('decimals', request.decimals.toString());
    formData.append('totalSupply', request.totalSupply);
    formData.append('initialMint', request.initialMint);
    
    if (request.description) {
      formData.append('description', request.description);
    }
    
    if (request.mintAuthority) {
      formData.append('mintAuthority', request.mintAuthority);
    }
    
    if (request.freezeAuthority) {
      formData.append('freezeAuthority', request.freezeAuthority);
    }
    
    if (request.socialLinks) {
      formData.append('socialLinks', JSON.stringify(request.socialLinks));
    }
    
    // Add image file if provided
    if (request.imageFile) {
      // The imageFile is already a FormData, append its contents
      formData.append('image', request.imageFile as any);
    }

    return apiClient.post('/api/launchpad/create-token', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Get all tokens (with pagination and filters)
  async getTokens(
    filters?: {
      creator?: string;
      verified?: boolean;
      hasPool?: boolean;
      search?: string;
    },
    limit: number = 20,
    offset: number = 0
  ): Promise<{
    tokens: LaunchpadToken[];
    total: number;
    hasMore: boolean;
  }> {
    return apiClient.get('/api/launchpad/tokens', {
      params: {
        ...filters,
        limit,
        offset,
      },
    });
  }

  // Get token details by ID
  async getTokenById(id: string): Promise<LaunchpadToken> {
    return apiClient.get(`/api/launchpad/tokens/${id}`);
  }

  // Get user's created tokens
  async getUserTokens(userAddress: string): Promise<LaunchpadToken[]> {
    return apiClient.get('/api/launchpad/tokens', {
      params: {
        creator: userAddress,
      },
    });
  }

  // Mint additional supply transaction
  async createMintSupplyTransaction(
    tokenMint: string,
    amount: string,
    destinationAddress: string
  ): Promise<string> {
    return apiClient.post('/api/launchpad/mint-supply-tx', {
      tokenMint,
      amount,
      destinationAddress,
    });
  }

  // Disable mint authority transaction
  async createDisableMintTransaction(tokenMint: string): Promise<string> {
    return apiClient.post('/api/launchpad/disable-mint-tx', {
      tokenMint,
    });
  }

  // Create pool transactions
  async createPoolTransactions(request: PoolCreationRequest): Promise<string[]> {
    return apiClient.post('/api/launchpad/create-pool-txs', request);
  }

  // Add liquidity transaction
  async createAddLiquidityTransaction(
    poolAddress: string,
    tokenAAmount: string,
    tokenBAmount: string,
    slippage: number = 1
  ): Promise<string> {
    return apiClient.post('/api/launchpad/add-liquidity-tx', {
      poolAddress,
      tokenAAmount,
      tokenBAmount,
      slippage,
    });
  }

  // Remove liquidity transaction
  async createRemoveLiquidityTransaction(
    poolAddress: string,
    lpTokenAmount: string,
    slippage: number = 1
  ): Promise<string> {
    return apiClient.post('/api/launchpad/remove-liquidity-tx', {
      poolAddress,
      lpTokenAmount,
      slippage,
    });
  }

  // Burn LP tokens transaction
  async createBurnLPTokensTransaction(
    lpTokenMint: string,
    amount: string
  ): Promise<string> {
    return apiClient.post('/api/launchpad/burn-lp-tokens-tx', {
      lpTokenMint,
      amount,
    });
  }

  // Submit signed transaction
  async submitSignedTransaction(request: TransactionRequest): Promise<TransactionResponse> {
    return apiClient.post('/api/launchpad/send-signed-transaction', request);
  }

  // Get pool fee configuration
  async getPoolFeeConfig(): Promise<PoolFeeConfig> {
    return apiClient.get('/api/launchpad/pool-fee-config');
  }

  // Update token social metadata
  async updateTokenMetadata(
    tokenMint: string,
    metadata: {
      website?: string;
      twitter?: string;
      telegram?: string;
      discord?: string;
      description?: string;
    }
  ): Promise<void> {
    return apiClient.post(`/api/launchpad/token/${tokenMint}/social-metadata`, metadata);
  }

  // Get user's liquidity positions
  async getUserLiquidityPositions(userAddress: string): Promise<LiquidityPosition[]> {
    return apiClient.get(`/api/pools/user/${userAddress}`);
  }

  // Get pool details
  async getPoolDetails(poolId: string): Promise<{
    id: string;
    tokenA: {
      mint: string;
      symbol: string;
      name: string;
      reserve: string;
    };
    tokenB: {
      mint: string;
      symbol: string;
      name: string;
      reserve: string;
    };
    poolType: 'CLMM' | 'CPMM';
    feeRate: number;
    tvl: number;
    volume24h: number;
    fees24h: number;
    apy: number;
    totalLP: string;
  }> {
    return apiClient.get(`/api/pools/${poolId}`);
  }

  // Get pool transactions
  async getPoolTransactions(
    poolId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{
    id: string;
    type: 'swap' | 'add_liquidity' | 'remove_liquidity';
    user: string;
    tokenA: {
      symbol: string;
      amount: string;
    };
    tokenB: {
      symbol: string;
      amount: string;
    };
    timestamp: number;
    txHash: string;
  }[]> {
    return apiClient.get(`/api/pools/${poolId}/transactions`, {
      params: { limit, offset },
    });
  }

  // Get pool analytics
  async getPoolAnalytics(
    poolId: string,
    period: '24h' | '7d' | '30d' = '24h'
  ): Promise<{
    volume: { timestamp: number; value: number }[];
    tvl: { timestamp: number; value: number }[];
    fees: { timestamp: number; value: number }[];
    swapCount: number;
    uniqueUsers: number;
  }> {
    return apiClient.get(`/api/pools/${poolId}/analytics`, {
      params: { period },
    });
  }

  // Get trading volume statistics
  async getTradingVolume(period: '24h' | '7d' | '30d' = '24h'): Promise<{
    totalVolume: number;
    volumeChange: number;
    topPools: {
      id: string;
      tokenA: string;
      tokenB: string;
      volume: number;
    }[];
  }> {
    return apiClient.get('/api/analytics/volume', {
      params: { period },
    });
  }

  // Get total value locked
  async getTotalValueLocked(): Promise<{
    totalTVL: number;
    tvlChange24h: number;
    poolsCount: number;
    breakdown: {
      poolType: 'CLMM' | 'CPMM';
      tvl: number;
      percentage: number;
    }[];
  }> {
    return apiClient.get('/api/analytics/tvl');
  }
}

// Create and export singleton instance
export const launchpadService = new LaunchpadService();