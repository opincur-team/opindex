import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Pool, UserPosition } from '@/src/types';

interface AddLiquidityParams {
  poolId: string;
  tokenAAmount: string;
  tokenBAmount: string;
  slippage: number;
}

interface RemoveLiquidityParams {
  poolId: string;
  percentage: number;
  slippage: number;
}

// Mock API functions - replace with actual API calls
const fetchPools = async (): Promise<Pool[]> => {
  // TODO: Replace with actual API call
  return [];
};

const fetchPool = async (poolId: string): Promise<Pool> => {
  // TODO: Replace with actual API call
  throw new Error('Not implemented');
};

const fetchUserPositions = async (address: string): Promise<UserPosition[]> => {
  // TODO: Replace with actual API call
  return [];
};

const addLiquidity = async (params: AddLiquidityParams): Promise<void> => {
  // TODO: Replace with actual API call
  throw new Error('Not implemented');
};

const removeLiquidity = async (params: RemoveLiquidityParams): Promise<void> => {
  // TODO: Replace with actual API call
  throw new Error('Not implemented');
};

const fetchPoolTransactions = async (poolId: string) => {
  // TODO: Replace with actual API call
  return [];
};

// Query keys
export const poolKeys = {
  all: ['pools'] as const,
  lists: () => [...poolKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...poolKeys.lists(), filters] as const,
  details: () => [...poolKeys.all, 'detail'] as const,
  detail: (id: string) => [...poolKeys.details(), id] as const,
  userPositions: (address: string) => [...poolKeys.all, 'positions', address] as const,
  transactions: (poolId: string) => [...poolKeys.all, 'transactions', poolId] as const,
};

// Hooks
export const usePools = (filters?: Record<string, any>) => {
  return useQuery({
    queryKey: poolKeys.list(filters || {}),
    queryFn: fetchPools,
    staleTime: 2 * 60 * 1000, // 2 minutes for pool data
  });
};

export const usePool = (poolId: string) => {
  return useQuery({
    queryKey: poolKeys.detail(poolId),
    queryFn: () => fetchPool(poolId),
    enabled: !!poolId,
    staleTime: 30 * 1000, // 30 seconds for individual pool
  });
};

export const useUserPositions = (address: string) => {
  return useQuery({
    queryKey: poolKeys.userPositions(address),
    queryFn: () => fetchUserPositions(address),
    enabled: !!address,
    staleTime: 60 * 1000, // 1 minute for positions
  });
};

export const usePoolTransactions = (poolId: string) => {
  return useQuery({
    queryKey: poolKeys.transactions(poolId),
    queryFn: () => fetchPoolTransactions(poolId),
    enabled: !!poolId,
    staleTime: 30 * 1000, // 30 seconds for transactions
  });
};

export const useAddLiquidity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addLiquidity,
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: poolKeys.detail(variables.poolId) });
      queryClient.invalidateQueries({ queryKey: poolKeys.all });
      queryClient.invalidateQueries({ queryKey: ['tokens', 'balances'] });
    },
  });
};

export const useRemoveLiquidity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: removeLiquidity,
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: poolKeys.detail(variables.poolId) });
      queryClient.invalidateQueries({ queryKey: poolKeys.all });
      queryClient.invalidateQueries({ queryKey: ['tokens', 'balances'] });
    },
  });
};