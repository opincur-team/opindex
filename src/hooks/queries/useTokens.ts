import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Token, TokenBalance } from '@/src/types';

// Mock API functions - replace with actual API calls
const fetchTokens = async (): Promise<Token[]> => {
  // TODO: Replace with actual API call
  return [];
};

const fetchTokenBalances = async (address: string): Promise<TokenBalance[]> => {
  // TODO: Replace with actual API call
  return [];
};

const searchTokens = async (query: string): Promise<Token[]> => {
  // TODO: Replace with actual API call
  return [];
};

const addFavoriteToken = async ({ address, tokenId }: { address: string; tokenId: string }): Promise<void> => {
  // TODO: Replace with actual API call
};

const removeFavoriteToken = async ({ address, tokenId }: { address: string; tokenId: string }): Promise<void> => {
  // TODO: Replace with actual API call
};

// Query keys
export const tokenKeys = {
  all: ['tokens'] as const,
  lists: () => [...tokenKeys.all, 'list'] as const,
  list: (filters: string) => [...tokenKeys.lists(), { filters }] as const,
  details: () => [...tokenKeys.all, 'detail'] as const,
  detail: (id: string) => [...tokenKeys.details(), id] as const,
  balances: (address: string) => [...tokenKeys.all, 'balances', address] as const,
  search: (query: string) => [...tokenKeys.all, 'search', query] as const,
  favorites: (address: string) => [...tokenKeys.all, 'favorites', address] as const,
};

// Hooks
export const useTokens = () => {
  return useQuery({
    queryKey: tokenKeys.lists(),
    queryFn: fetchTokens,
    staleTime: 60 * 60 * 1000, // 1 hour for token metadata
  });
};

export const useTokenBalances = (address: string) => {
  return useQuery({
    queryKey: tokenKeys.balances(address),
    queryFn: () => fetchTokenBalances(address),
    enabled: !!address,
    staleTime: 30 * 1000, // 30 seconds for balances
  });
};

export const useTokenSearch = (query: string) => {
  return useQuery({
    queryKey: tokenKeys.search(query),
    queryFn: () => searchTokens(query),
    enabled: query.length > 2,
    staleTime: 5 * 60 * 1000, // 5 minutes for search results
  });
};

export const useAddFavoriteToken = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addFavoriteToken,
    onSuccess: (_, variables) => {
      // Invalidate favorites query
      queryClient.invalidateQueries({ 
        queryKey: tokenKeys.favorites(variables.address) 
      });
    },
  });
};

export const useRemoveFavoriteToken = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: removeFavoriteToken,
    onSuccess: (_, variables) => {
      // Invalidate favorites query
      queryClient.invalidateQueries({ 
        queryKey: tokenKeys.favorites(variables.address) 
      });
    },
  });
};