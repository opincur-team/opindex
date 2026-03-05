import { apiClient } from './api';

// Types for portfolio data
export interface PortfolioToken {
  mintAddress: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: number;
  price: number;
  value: number;
  change24h: number;
  logo: string;
}

export interface PortfolioData {
  totalBalance: number;
  change24h: number;
  changePercent24h: number;
  tokens: PortfolioToken[];
}

export interface PortfolioResponse {
  data: PortfolioData;
  status: number;
}

// Portfolio Service
class PortfolioService {
  // Get portfolio data for a wallet address
  async getPortfolioData(address: string): Promise<PortfolioData> {
    const axiosInstance = apiClient.getAxiosInstance();

    try {
      const response = await axiosInstance.get<PortfolioResponse>('/api/wallet/tokens', {
        params: { address },
      });

      // Defensive check for response structure
      if (!response.data) {
        throw new Error('No data in API response');
      }

      if (!response.data.data) {
        throw new Error('Invalid response structure from API');
      }

      return response.data.data;
    } catch (error) {
      throw error;
    }
  }
}

// Create and export singleton instance
export const portfolioService = new PortfolioService();
