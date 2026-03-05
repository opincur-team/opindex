import { create } from 'zustand';
import type { Token } from '@/src/types';

interface SwapState {
  // Selected tokens
  fromToken: Token | null;
  toToken: Token | null;
  
  // Amount inputs
  fromAmount: string;
  toAmount: string;
  
  // Settings
  slippage: number;
  
  // UI states
  isSwapping: boolean;
  showTokenSelect: 'from' | 'to' | null;
  showConfirmModal: boolean;
  
  // Recent pairs
  recentPairs: { from: Token; to: Token }[];
  
  // Actions
  setFromToken: (token: Token | null) => void;
  setToToken: (token: Token | null) => void;
  setFromAmount: (amount: string) => void;
  setToAmount: (amount: string) => void;
  setSlippage: (slippage: number) => void;
  setIsSwapping: (swapping: boolean) => void;
  setShowTokenSelect: (type: 'from' | 'to' | null) => void;
  setShowConfirmModal: (show: boolean) => void;
  swapTokens: () => void;
  addRecentPair: (from: Token, to: Token) => void;
  resetSwap: () => void;
}

export const useSwapStore = create<SwapState>((set, get) => ({
  fromToken: null,
  toToken: null,
  fromAmount: '',
  toAmount: '',
  slippage: 1, // 1% default
  isSwapping: false,
  showTokenSelect: null,
  showConfirmModal: false,
  recentPairs: [],

  setFromToken: (token) => set({ fromToken: token }),
  
  setToToken: (token) => set({ toToken: token }),
  
  setFromAmount: (amount) => set({ fromAmount: amount }),
  
  setToAmount: (amount) => set({ toAmount: amount }),
  
  setSlippage: (slippage) => set({ slippage }),
  
  setIsSwapping: (swapping) => set({ isSwapping: swapping }),
  
  setShowTokenSelect: (type) => set({ showTokenSelect: type }),
  
  setShowConfirmModal: (show) => set({ showConfirmModal: show }),
  
  swapTokens: () => {
    const { fromToken, toToken, fromAmount, toAmount } = get();
    set({
      fromToken: toToken,
      toToken: fromToken,
      fromAmount: toAmount,
      toAmount: fromAmount,
    });
  },
  
  addRecentPair: (from, to) => {
    const { recentPairs } = get();
    const newPair = { from, to };
    
    // Remove if already exists and add to front
    const filtered = recentPairs.filter(
      pair => !(pair.from.address === from.address && pair.to.address === to.address)
    );
    
    set({
      recentPairs: [newPair, ...filtered].slice(0, 10), // Keep only 10 recent pairs
    });
  },
  
  resetSwap: () => set({
    fromToken: null,
    toToken: null,
    fromAmount: '',
    toAmount: '',
    slippage: 1,
    isSwapping: false,
    showTokenSelect: null,
    showConfirmModal: false,
  }),
}));