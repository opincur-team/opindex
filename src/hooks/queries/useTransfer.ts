import { useMutation, useQuery } from '@tanstack/react-query';
import {
  transferService,
  ValidateTransferRequest,
  BuildTransferRequest,
  SubmitTransferRequest,
} from '@/src/services/transferService';
import { walletService } from '@/src/services/walletService';

/**
 * Hook to validate a transfer
 * Checks balance, validates addresses, and calculates fees
 */
export const useValidateTransfer = () => {
  return useMutation({
    mutationFn: async (request: ValidateTransferRequest) => {
      return await transferService.validateTransfer(request);
    },
  });
};

/**
 * Hook to build an unsigned transfer transaction
 */
export const useBuildTransfer = () => {
  return useMutation({
    mutationFn: async (request: BuildTransferRequest) => {
      return await transferService.buildTransfer(request);
    },
  });
};

/**
 * Hook to submit a signed transfer transaction
 */
export const useSubmitTransfer = () => {
  return useMutation({
    mutationFn: async (request: SubmitTransferRequest) => {
      return await transferService.submitTransfer(request);
    },
  });
};

/**
 * Hook to get transfer status
 * Can be used with polling for real-time updates
 */
export const useTransferStatus = (signature: string | null, enabled: boolean = false) => {
  return useQuery({
    queryKey: ['transfer-status', signature],
    queryFn: async () => {
      if (!signature) throw new Error('Signature is required');
      return await transferService.getTransferStatus(signature);
    },
    enabled: enabled && !!signature,
    refetchInterval: (query) => {
      const data = query.state.data;
      // Stop polling if confirmed, finalized, or failed
      if (data?.status === 'confirmed' || data?.status === 'finalized' || data?.status === 'failed') {
        return false;
      }
      // Poll every 2 seconds while pending
      return 2000;
    },
  });
};

/**
 * Complete transfer flow hook
 * Combines validate → build → sign → submit → wait for confirmation
 */
export const useCompleteTransfer = () => {
  const validateMutation = useValidateTransfer();
  const buildMutation = useBuildTransfer();
  const submitMutation = useSubmitTransfer();

  return useMutation({
    mutationFn: async (params: {
      fromAddress: string;
      toAddress: string;
      amount: number;
      tokenMint?: string;
      priorityFee?: number;
    }) => {
      try {
        // Step 1: Validate transfer
        console.log('Step 1: Validating transfer...');
        const validation = await transferService.validateTransfer({
          fromAddress: params.fromAddress,
          toAddress: params.toAddress,
          amount: params.amount,
          tokenMint: params.tokenMint,
        });

        if (!validation.valid) {
          throw new Error(validation.error || 'Validation failed');
        }

        // Step 2: Build transaction
        console.log('Step 2: Building transaction...');
        const buildResult = await transferService.buildTransfer({
          fromAddress: params.fromAddress,
          toAddress: params.toAddress,
          amount: params.amount,
          tokenMint: params.tokenMint,
          priorityFee: params.priorityFee,
        });

        // Step 3: Sign transaction with wallet
        console.log('Step 3: Signing transaction...');
        const hasAuth = await walletService.hasAuthenticationConfigured();
        if (hasAuth && !walletService.isWalletUnlocked()) {
          throw new Error('Wallet is locked. Please unlock first.');
        }

        // Sign the transaction using wallet service
        // Note: The walletService.signTransaction expects the transaction as a string
        // and returns { signature, signedTransaction }
        const signResult = await walletService.signTransaction(buildResult.transaction);

        // Step 4: Submit signed transaction
        console.log('Step 4: Submitting transaction...');
        const submitResult = await transferService.submitTransfer({
          signedTransaction: signResult.signedTransaction,
          requestId: buildResult.requestId,
        });

        // Step 5: Wait for confirmation
        console.log('Step 5: Waiting for confirmation...');
        const finalStatus = await transferService.waitForConfirmation(submitResult.signature);

        return {
          signature: submitResult.signature,
          status: finalStatus,
          validation,
          estimatedFee: buildResult.estimatedFee,
        };
      } catch (error) {
        console.error('Complete transfer error:', error);
        throw error;
      }
    },
  });
};
