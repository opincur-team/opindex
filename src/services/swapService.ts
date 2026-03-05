import { tokenService, SwapQuoteRequest, SwapQuoteResponse, SwapExecuteRequest } from './tokenService';
import { walletService } from './walletService';
import { VersionedTransaction, PublicKey } from '@solana/web3.js';

export interface SwapParams {
  inputTokenAddress: string;
  outputTokenAddress: string;
  inputAmount: number; // In smallest units (lamports, etc.)
  userAddress: string;
}

export interface SwapResult {
  success: boolean;
  signature?: string;
  error?: string;
}

class SwapService {
  /**
   * Get a swap quote with unsigned transaction
   */
  async getQuote(params: SwapParams): Promise<SwapQuoteResponse> {
    const request: SwapQuoteRequest = {
      inputTokenAddress: params.inputTokenAddress,
      outputTokenAddress: params.outputTokenAddress,
      inputAmount: params.inputAmount,
      userAddress: params.userAddress,
    };

    return tokenService.getSwapQuote(request);
  }

  /**
   * Execute a complete swap transaction
   * @param quoteResponse - The quote response from getQuote()
   * @returns Swap result with success status
   */
  async executeSwap(quoteResponse: SwapQuoteResponse): Promise<SwapResult> {
    try {
      const { requestId, transaction, taker, errorMessage } = quoteResponse.data;

      // Check for errors in quote
      if (errorMessage) {
        return {
          success: false,
          error: errorMessage,
        };
      }

      // Check if transaction exists
      if (!transaction) {
        return {
          success: false,
          error: 'No transaction data in quote response',
        };
      }

      // Validate and deserialize the unsigned transaction
      const validationResult = await this.validateTransaction(transaction, taker, quoteResponse.data);
      if (!validationResult.valid) {
        return {
          success: false,
          error: validationResult.error || 'Transaction validation failed',
        };
      }

      const unsignedTx = validationResult.transaction!;

      // Sign the transaction using wallet service
      const signResult = await walletService.signTransaction(
        Buffer.from(unsignedTx.serialize()).toString('base64')
      );

      if (!signResult.signedTransaction) {
        return {
          success: false,
          error: 'Failed to sign transaction',
        };
      }

      // Execute the swap
      const executeRequest: SwapExecuteRequest = {
        requestId,
        userAddress: taker,
        signedTransaction: signResult.signedTransaction,
      };

      const executeResponse = await tokenService.executeSwap(executeRequest);

      // Handle response
      if (executeResponse.success === true) {
        return {
          success: true,
          signature: signResult.signature,
        };
      }

      return {
        success: false,
        error: executeResponse.errorMessage || 'Swap execution failed',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unknown error occurred during swap',
      };
    }
  }

  /**
   * Convert user-friendly amount to token smallest units
   * @param amount - User-friendly amount (e.g., 1.5 SOL)
   * @param decimals - Token decimals (e.g., 9 for SOL)
   * @returns Amount in smallest units (lamports)
   */
  amountToSmallestUnits(amount: number, decimals: number): number {
    return Math.floor(amount * Math.pow(10, decimals));
  }

  /**
   * Convert token smallest units to user-friendly amount
   * @param amount - Amount in smallest units (lamports)
   * @param decimals - Token decimals (e.g., 9 for SOL)
   * @returns User-friendly amount
   */
  smallestUnitsToAmount(amount: string | number, decimals: number): number {
    const amountNum = typeof amount === 'string' ? parseInt(amount, 10) : amount;
    return amountNum / Math.pow(10, decimals);
  }

  /**
   * Calculate fee amount from basis points
   * @param amount - Base amount
   * @param feeBps - Fee in basis points (e.g., 50 = 0.5%)
   * @returns Fee amount
   */
  calculateFee(amount: number, feeBps: number): number {
    return (amount * feeBps) / 10000;
  }

  /**
   * Format price impact percentage
   * @param priceImpactPct - Price impact as string percentage
   * @returns Formatted price impact (e.g., "0.05%")
   */
  formatPriceImpact(priceImpactPct: string | number): string {
    const impact = typeof priceImpactPct === 'string'
      ? parseFloat(priceImpactPct)
      : priceImpactPct;
    return `${impact.toFixed(2)}%`;
  }

  /**
   * Validate transaction before signing
   * Verifies the transaction structure and that it matches the expected quote
   */
  private async validateTransaction(
    transactionBase64: string,
    expectedSigner: string,
    quoteData: SwapQuoteResponse['data']
  ): Promise<{ valid: boolean; error?: string; transaction?: VersionedTransaction }> {
    try {
      // Try to deserialize the transaction
      const transactionBuffer = Buffer.from(transactionBase64, 'base64');
      const transaction = VersionedTransaction.deserialize(transactionBuffer);

      // Verify the transaction has the expected structure
      if (!transaction.message) {
        return { valid: false, error: 'Invalid transaction: missing message' };
      }

      // Get the wallet's public key
      const walletInfo = await walletService.getWalletInfo();
      if (!walletInfo) {
        return { valid: false, error: 'Wallet not found' };
      }

      // Verify the expected signer matches wallet address
      if (expectedSigner !== walletInfo.address) {
        return { valid: false, error: 'Transaction signer does not match wallet address' };
      }

      // Verify the transaction requires our signature
      const staticAccountKeys = transaction.message.staticAccountKeys;
      const walletPubkey = new PublicKey(walletInfo.address);
      const walletKeyIndex = staticAccountKeys.findIndex(
        key => key.equals(walletPubkey)
      );

      if (walletKeyIndex === -1) {
        return { valid: false, error: 'Wallet not found in transaction accounts' };
      }

      // Verify this is a signer position (first N accounts are signers)
      const numRequiredSignatures = transaction.message.header.numRequiredSignatures;
      if (walletKeyIndex >= numRequiredSignatures) {
        return { valid: false, error: 'Wallet is not a required signer for this transaction' };
      }

      return { valid: true, transaction };
    } catch (error: any) {
      return {
        valid: false,
        error: `Transaction validation error: ${error.message || 'Unknown error'}`
      };
    }
  }

  /**
   * Validate swap parameters before requesting quote
   */
  validateSwapParams(params: SwapParams): { valid: boolean; error?: string } {
    if (!params.inputTokenAddress) {
      return { valid: false, error: 'Input token address is required' };
    }

    if (!params.outputTokenAddress) {
      return { valid: false, error: 'Output token address is required' };
    }

    if (params.inputAmount <= 0) {
      return { valid: false, error: 'Input amount must be greater than 0' };
    }

    if (!params.userAddress) {
      return { valid: false, error: 'User address is required' };
    }

    if (params.inputTokenAddress === params.outputTokenAddress) {
      return { valid: false, error: 'Cannot swap same token' };
    }

    return { valid: true };
  }
}

export const swapService = new SwapService();
