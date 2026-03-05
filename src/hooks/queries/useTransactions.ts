import { useQuery } from '@tanstack/react-query';
import { transactionsService, type Transaction } from '@/src/services/transactionsService';

// Query keys
export const transactionsKeys = {
  all: ['transactions'] as const,
  byAddress: (address: string) => [...transactionsKeys.all, address] as const,
};

// Hook to fetch transactions data
export const useTransactions = (address: string | null | undefined) => {
  return useQuery({
    queryKey: transactionsKeys.byAddress(address || ''),
    queryFn: () => transactionsService.getTransactions(address!),
    enabled: !!address, // Only fetch if we have an address
    staleTime: 30 * 1000, // 30 seconds for recent transactions
    gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
  });
};
