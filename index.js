// ============================================================================
// POLYFILLS SETUP - This file loads BEFORE everything else
// ============================================================================
// DO NOT MOVE THESE IMPORTS - They must be first to set up globals before
// any crypto libraries (ed25519-hd-key, bip39, etc.) try to use them

// 1. Crypto random values polyfill
import 'react-native-get-random-values';

// 2. Text encoding polyfill - required by @solana/web3.js
import 'text-encoding';

// 3. URL polyfill - required by @solana/web3.js for RPC endpoint parsing
import 'react-native-url-polyfill/auto';

// 4. Buffer polyfill - required by ed25519-hd-key, bip39, and other crypto libs
import { Buffer } from 'buffer';
global.Buffer = Buffer;

// 5. Process polyfill - required by some Node.js libraries
import process from 'process';
global.process = process;

// ============================================================================
// Now load the Expo Router entry point
// ============================================================================
// All polyfills are set up - safe to load the rest of the app
import 'expo-router/entry';
