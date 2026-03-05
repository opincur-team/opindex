import { apiClient } from './api';

export interface WalletRegistrationRequest {
  publicAddress: string;
}

export interface WalletRegistrationResponse {
  success: boolean;
  walletId?: string;
  message?: string;
}

class WalletRegistrationService {
  /**
   * Register a wallet with the backend
   * @param publicAddress - The Solana wallet address
   * @returns Registration response
   */
  async registerWallet(publicAddress: string): Promise<WalletRegistrationResponse> {
    try {
      const response = await apiClient.post<WalletRegistrationResponse>(
        '/api/wallet/register',
        { publicAddress }
      );
      return response;
    } catch (error: any) {
      // Handle 409 Conflict (wallet already registered) as success
      if (error.status === 409 || error.response?.status === 409) {
        console.log('✓ Wallet already registered:', publicAddress);
        return {
          success: true,
          message: 'Wallet already registered'
        };
      }
      throw error;
    }
  }

  /**
   * Check if a wallet is registered with the backend
   * @param address - The Solana wallet address
   */
  async getWalletStatus(address: string): Promise<any> {
    try {
      return await apiClient.get(`/api/wallet/status/${address}`);
    } catch (error) {
      console.error('Failed to get wallet status:', error);
      throw error;
    }
  }

  /**
   * Update wallet metadata
   * @param address - The Solana wallet address
   * @param metadata - Metadata to update
   */
  async updateWalletMetadata(address: string, metadata: any): Promise<any> {
    try {
      return await apiClient.put(`/api/wallet/${address}/metadata`, metadata);
    } catch (error) {
      console.error('Failed to update wallet metadata:', error);
      throw error;
    }
  }
}

export const walletRegistrationService = new WalletRegistrationService();
