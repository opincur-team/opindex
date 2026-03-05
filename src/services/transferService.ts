import { apiClient } from './api';

// ==================== Types ====================
// Based on API documentation in .docs/send_tokens.md

export interface ValidateTransferRequest {
  fromAddress: string;
  toAddress: string;
  amount: number;
  tokenMint?: string; // undefined = SOL transfer
}

export interface ValidateTransferResponse {
  valid: boolean;
  balance: number;
  estimatedFee: number;
  requiresATA: boolean;
  error?: string;
}

export interface BuildTransferRequest {
  fromAddress: string;
  toAddress: string;
  amount: number;
  tokenMint?: string;
  priorityFee?: number; // microlamports (1-50000)
}

export interface BuildTransferResponse {
  transaction: string; // base64 encoded unsigned transaction
  requestId: string;
  estimatedFee: number;
}

export interface SubmitTransferRequest {
  signedTransaction: string; // base64 encoded signed transaction
  requestId?: string;
}

export interface SubmitTransferResponse {
  signature: string;
  status: string;
}

export interface TransferStatusResponse {
  signature: string;
  status: 'pending' | 'confirmed' | 'finalized' | 'failed';
  confirmations: number;
  error?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

// ==================== Service ====================

class TransferService {
  /**
   * Step 1: Validate a transfer before building the transaction
   * Checks balance, validates addresses, calculates fees
   */
  async validateTransfer(
    request: ValidateTransferRequest
  ): Promise<ValidateTransferResponse> {
    try {
      const axiosInstance = apiClient.getAxiosInstance();
      const response = await axiosInstance.post<ApiResponse<ValidateTransferResponse>>(
        '/api/wallet/transfer/validate',
        request
      );

      if (response.data.error || !response.data.data) {
        throw new Error(response.data.error || 'Validation failed');
      }

      return response.data.data;
    } catch (error) {
      console.error('Transfer validation error:', error);
      throw error;
    }
  }

  /**
   * Step 2: Build an unsigned transaction
   * Fetches blockhash, builds instructions, creates unsigned transaction
   */
  async buildTransfer(
    request: BuildTransferRequest
  ): Promise<BuildTransferResponse> {
    try {
      const axiosInstance = apiClient.getAxiosInstance();
      const response = await axiosInstance.post<ApiResponse<BuildTransferResponse>>(
        '/api/wallet/transfer/build',
        request
      );

      if (response.data.error || !response.data.data) {
        throw new Error(response.data.error || 'Failed to build transaction');
      }

      return response.data.data;
    } catch (error) {
      console.error('Build transfer error:', error);
      throw error;
    }
  }

  /**
   * Step 4: Submit signed transaction to blockchain
   * Sends to blockchain and returns signature
   */
  async submitTransfer(
    request: SubmitTransferRequest
  ): Promise<SubmitTransferResponse> {
    try {
      const axiosInstance = apiClient.getAxiosInstance();
      const response = await axiosInstance.post<ApiResponse<SubmitTransferResponse>>(
        '/api/wallet/transfer/submit',
        request
      );

      if (response.data.error || !response.data.data) {
        throw new Error(response.data.error || 'Failed to submit transaction');
      }

      return response.data.data;
    } catch (error) {
      console.error('Submit transfer error:', error);
      throw error;
    }
  }

  /**
   * Step 5: Get transfer status
   * Poll for confirmation status
   */
  async getTransferStatus(signature: string): Promise<TransferStatusResponse> {
    try {
      const axiosInstance = apiClient.getAxiosInstance();
      const response = await axiosInstance.get<ApiResponse<TransferStatusResponse>>(
        `/api/wallet/transfer/status/${signature}`
      );

      if (response.data.error || !response.data.data) {
        throw new Error(response.data.error || 'Failed to get status');
      }

      return response.data.data;
    } catch (error) {
      console.error('Get transfer status error:', error);
      throw error;
    }
  }

  /**
   * Helper: Wait for transaction confirmation
   * Polls the status endpoint until transaction is confirmed or failed
   */
  async waitForConfirmation(
    signature: string,
    maxAttempts: number = 30,
    intervalMs: number = 2000
  ): Promise<TransferStatusResponse> {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.getTransferStatus(signature);

      if (status.status === 'confirmed' || status.status === 'finalized') {
        return status;
      }

      if (status.status === 'failed') {
        throw new Error(`Transaction failed: ${status.error}`);
      }

      // Wait before next check
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error('Transaction confirmation timeout');
  }
}

// Create and export singleton instance
export const transferService = new TransferService();
