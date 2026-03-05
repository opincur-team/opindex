import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { tokenService, PopularTokens } from '@/src/services/tokenService';

/**
 * Fetch available token categories
 */
export function useTokenCategories() {
  return useQuery({
    queryKey: ['tokenCategories'],
    queryFn: () => tokenService.getTokenCategories(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Fetch popular tokens by category with pagination
 */
export function usePopularTokens(
  category: string,
  page: number = 1,
  limit: number = 10
) {
  return useQuery({
    queryKey: ['popularTokens', category, page, limit],
    queryFn: () => tokenService.getTokensByCategory(category, page, limit),
    enabled: !!category,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Infinite scroll version for popular tokens
 */
export function useInfinitePopularTokens(
  category: string,
  limit: number = 10
) {
  return useInfiniteQuery({
    queryKey: ['popularTokensInfinite', category, limit],
    queryFn: ({ pageParam = 1 }) =>
      tokenService.getTokensByCategory(category, pageParam, limit),
    getNextPageParam: (lastPage: PopularTokens) => {
      // Safety check: ensure lastPage and pagination exist
      if (!lastPage || !lastPage.pagination) {
        return undefined;
      }
      if (lastPage.pagination.hasNext) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    enabled: !!category && category !== 'all', // Disable for 'all' category
    staleTime: 1000 * 60 * 5, // 5 minutes
    initialPageParam: 1,
  });
}
