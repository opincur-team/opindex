# Opindex Wallet

A non-custodial Solana wallet built with React Native and Expo. Swap tokens, manage your portfolio, launch tokens, and interact with liquidity pools — all from your mobile device.

## Features

- **Wallet Management** — Create, import, and manage multiple Solana wallets with BIP39 seed phrase support
- **Token Swaps** — Swap SPL tokens with real-time price charts and slippage controls
- **Portfolio Tracking** — View balances, token holdings, and transaction history at a glance
- **Launchpad** — Create and launch new tokens directly from the app
- **Liquidity Pools** — Browse, create, and manage liquidity pools
- **Send & Receive** — Transfer SOL and SPL tokens with QR code support and a saved recipients list
- **Biometric Auth** — Secure your wallet with Face ID / fingerprint via Expo SecureStore
- **Push Notifications** — Get notified about transactions and updates via Firebase Cloud Messaging

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native 0.81 + Expo SDK 54 |
| Navigation | Expo Router (file-based routing) |
| State | Zustand |
| Data Fetching | TanStack React Query |
| Blockchain | @solana/web3.js, tweetnacl, bip39 |
| Forms | React Hook Form + Zod |
| Storage | Expo SecureStore, AsyncStorage |
| Notifications | Firebase Cloud Messaging |

## Project Structure

```
app/                  # Screens (Expo Router file-based routing)
  (auth)/             #   Onboarding & wallet setup flow
  (tabs)/             #   Main tab screens (portfolio, swap, launchpad, settings)
  wallet/             #   Wallet management screens
  token/              #   Token details & creation
  pool/               #   Liquidity pool screens
src/
  components/         # Reusable UI and feature components
  hooks/              # Custom hooks (queries, common utilities)
  services/           # API clients and blockchain services
  stores/             # Zustand state stores
  styles/             # Shared styles and theme
  utils/              # Helpers and constants
  config/             # Environment and feature config
  context/            # React context providers
  providers/          # App-level providers
  types/              # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- iOS Simulator (macOS) or Android Emulator

### Install & Run

```bash
# Install dependencies
npm install

# Start the Expo dev server
npx expo start

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android
```

## License

This project is released as open source. See the repository for license details.
