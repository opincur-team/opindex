// Core types for the application

export interface Token {
  id: string;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  verified?: boolean;
}

export interface TokenBalance {
  token: Token;
  balance: string;
  usdValue?: number;
}

export interface SwapQuote {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  rate: number;
  priceImpact: number;
  slippage: number;
  fee: number;
}

export interface Transaction {
  id: string;
  type: 'swap' | 'token-creation' | 'liquidity-add' | 'liquidity-remove' | 'transfer';
  status: 'pending' | 'completed' | 'failed';
  fromToken?: Token;
  toToken?: Token;
  fromAmount?: string;
  toAmount?: string;
  timestamp: number;
  hash?: string;
}

export interface Pool {
  id: string;
  type: 'CLMM' | 'CPMM';
  tokenA: Token;
  tokenB: Token;
  liquidity: string;
  volume24h: number;
  fees24h: number;
  apy?: number;
}

export interface UserPosition {
  pool: Pool;
  liquidity: string;
  share: number;
  feesEarned: number;
}

export interface WalletInfo {
  address: string;
  publicKey: string;
  isConnected: boolean;
}

export interface NotificationPreferences {
  transactionAlerts: boolean;
  priceAlerts: boolean;
  marketing: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  currency: string;
  notifications: NotificationPreferences;
}