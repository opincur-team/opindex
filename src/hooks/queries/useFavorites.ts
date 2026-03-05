import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tokenService, FavoriteToken } from '@/src/services/tokenService';

// Query keys
export const favoritesKeys = {
  all: ['favorites'] as const,
  byAddress: (address: string) => [...favoritesKeys.all, address] as const,
};

/**
 * Hook to fetch user's favorite tokens
 */
export const useFavoriteTokens = (userAddress: string) => {
  return useQuery({
    queryKey: favoritesKeys.byAddress(userAddress),
    queryFn: () => tokenService.getFavoriteTokens(userAddress),
    enabled: !!userAddress,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to toggle favorite status of a token
 */
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  const addFavorite = useMutation({
    mutationFn: ({ userAddress, tokenAddress }: { userAddress: string; tokenAddress: string }) =>
      tokenService.addFavoriteToken(userAddress, tokenAddress),
    onSuccess: (_, variables) => {
      // Invalidate favorites cache
      queryClient.invalidateQueries({ queryKey: favoritesKeys.byAddress(variables.userAddress) });
    },
  });

  const removeFavorite = useMutation({
    mutationFn: ({ userAddress, tokenId }: { userAddress: string; tokenId: string }) =>
      tokenService.removeFavoriteToken(userAddress, tokenId),
    onSuccess: (_, variables) => {
      // Invalidate favorites cache
      queryClient.invalidateQueries({ queryKey: favoritesKeys.byAddress(variables.userAddress) });
    },
  });

  const toggleFavorite = async (
    userAddress: string,
    tokenAddress: string,
    isFavorite: boolean
  ): Promise<void> => {
    if (isFavorite) {
      await removeFavorite.mutateAsync({ userAddress, tokenId: tokenAddress });
    } else {
      await addFavorite.mutateAsync({ userAddress, tokenAddress });
    }
  };

  return {
    toggleFavorite,
    isLoading: addFavorite.isPending || removeFavorite.isPending,
  };
};
