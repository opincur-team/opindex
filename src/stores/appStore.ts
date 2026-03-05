import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppSettings, WalletInfo } from '@/src/types';

interface AppState {
  // Wallet connection state
  wallet: WalletInfo | null;
  
  // App settings
  settings: AppSettings;
  
  // UI state
  isOnboarded: boolean;
  activeModal: string | null;
  
  // Actions
  setWallet: (wallet: WalletInfo | null) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setOnboarded: (onboarded: boolean) => void;
  setActiveModal: (modal: string | null) => void;
  resetApp: () => void;
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  language: 'en',
  currency: 'USD',
  notifications: {
    transactionAlerts: true,
    priceAlerts: true,
    marketing: false,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
  },
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      wallet: null,
      settings: defaultSettings,
      isOnboarded: false,
      activeModal: null,

      setWallet: (wallet) => set({ wallet }),

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      setOnboarded: (onboarded) => set({ isOnboarded: onboarded }),

      setActiveModal: (modal) => set({ activeModal: modal }),

      resetApp: () =>
        set({
          wallet: null,
          settings: defaultSettings,
          isOnboarded: false,
          activeModal: null,
        }),
    }),
    {
      name: 'opindex-app-store',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist these fields
      partialize: (state) => ({
        wallet: state.wallet,
        settings: state.settings,
        isOnboarded: state.isOnboarded,
      }),
    }
  )
);