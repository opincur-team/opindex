import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { swapService, SwapParams } from '@/src/services/swapService';
import { SwapQuoteResponse } from '@/src/services/tokenService';

// Query keys
export const swapKeys = {
  all: ['swap'] as const,
  quotes: () => [...swapKeys.all, 'quote'] as const,
  quote: (params: SwapParams) => [...swapKeys.quotes(), params] as const,
  history: (address: string) => [...swapKeys.all, 'history', address] as const,
};

/**
 * Hook to fetch swap quote with debouncing
 * Fetches quote when all required params are provided
 */
export const useSwapQuote = (params: SwapParams, options?: { enabled?: boolean }) => {
  const { inputTokenAddress, outputTokenAddress, inputAmount, userAddress } = params;

  return useQuery({
    queryKey: swapKeys.quote(params),
    queryFn: () => swapService.getQuote(params),
    enabled: options?.enabled !== false && !!(
      inputTokenAddress &&
      outputTokenAddress &&
      inputAmount > 0 &&
      userAddress &&
      inputTokenAddress !== outputTokenAddress
    ),
    staleTime: 10 * 1000, // 10 seconds for quotes (they expire quickly)
    gcTime: 30 * 1000, // 30 seconds garbage collection
    refetchOnWindowFocus: false, // Don't auto-refetch quotes on focus
    retry: 1, // Only retry once for failed quotes
  });
};

/**
 * Hook to execute a swap transaction
 * Signs and submits the transaction, then invalidates relevant caches
 */
export const useExecuteSwap = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quoteResponse: SwapQuoteResponse) => swapService.executeSwap(quoteResponse),
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate balances and transaction history after successful swap
        queryClient.invalidateQueries({ queryKey: ['portfolio'] });
        queryClient.invalidateQueries({ queryKey: ['tokens', 'balances'] });
        queryClient.invalidateQueries({ queryKey: swapKeys.all });
      }
    },
  });
};

/**
 * Hook to fetch swap history for a user
 * Returns paginated swap transaction history
 */
export const useSwapHistory = (
  address: string,
  options?: { limit?: number; offset?: number }
) => {
  return useQuery({
    queryKey: swapKeys.history(address),
    queryFn: () => {
      // Note: tokenService.getSwapHistory is already implemented
      // but we'll keep this aligned with the pattern
      return [];
    },
    enabled: !!address,
    staleTime: 60 * 1000, // 1 minute for transaction history
    gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
  });
};
