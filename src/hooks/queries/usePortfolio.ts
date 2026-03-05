import { useQuery } from '@tanstack/react-query';
import { portfolioService, type PortfolioData } from '@/src/services/portfolioService';

// Query keys
export const portfolioKeys = {
  all: ['portfolio'] as const,
  byAddress: (address: string) => [...portfolioKeys.all, address] as const,
};

// Hook to fetch portfolio data
export const usePortfolio = (address: string | null | undefined) => {
  return useQuery({
    queryKey: portfolioKeys.byAddress(address || ''),
    queryFn: () => portfolioService.getPortfolioData(address!),
    enabled: !!address, // Only fetch if we have an address
    staleTime: 30 * 1000, // 30 seconds for live balance updates
    gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
  });
};
