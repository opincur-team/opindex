import { apiClient } from './api';

// Types for transaction data
export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'swap';
  timestamp: string; // ISO date string
  signature: string;
  source: string;
  destination?: string;
  token: string;
  amount: number;
  // For swap type (future implementation)
  fromToken?: string;
  toToken?: string;
  fromAmount?: number;
  toAmount?: number;
}

export interface TransactionsResponse {
  data: Transaction[];
  status: number;
}

// Transactions Service
class TransactionsService {
  // Get transactions for a wallet address
  async getTransactions(address: string): Promise<Transaction[]> {
    const axiosInstance = apiClient.getAxiosInstance();
    const fullUrl = `${axiosInstance.defaults.baseURL}/api/wallet/transactions?address=${address}`;

    try {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📡 TRANSACTIONS API REQUEST');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔗 Full URL:', fullUrl);
      console.log('🔗 Base URL:', axiosInstance.defaults.baseURL);
      console.log('🔗 Endpoint:', '/api/wallet/transactions');
      console.log('🔗 Address:', address);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      const response = await axiosInstance.get<TransactionsResponse>('/api/wallet/transactions', {
        params: { address },
      });

      console.log('✅ Response Status:', response.status);

      // Defensive check for response structure
      if (!response.data) {
        throw new Error('No data in API response');
      }

      if (!response.data.data) {
        console.error('❌ Invalid response structure - missing data.data');
        throw new Error('Invalid response structure from API');
      }

      console.log('✅ Transactions data loaded successfully');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      return response.data.data;
    } catch (error) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('❌ TRANSACTIONS API FAILED');
      console.error('❌ URL:', fullUrl);
      if (error instanceof Error) {
        console.error('❌ Error:', error.message);
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      throw error;
    }
  }
}

// Create and export singleton instance
export const transactionsService = new TransactionsService();
