# API Client and Services

This directory contains all API client implementations and service layers for the Opindex Wallet mobile app.

## Architecture

The API layer follows a service-oriented architecture with the following components:

- **API Client** (`api.ts`) - Base HTTP client with interceptors
- **Service Classes** - Domain-specific API wrappers
- **Environment Configuration** - Environment-specific settings
- **Type Definitions** - TypeScript interfaces for API data

## Services Overview

### 1. API Client (`api.ts`)

The core HTTP client built on Axios with the following features:

- **Request/Response Interceptors** - Automatic token handling, logging, error handling
- **Retry Logic** - Automatic retries for network failures
- **Error Normalization** - Consistent error handling across the app
- **Authentication** - Bearer token management
- **File Upload Support** - Multipart form data handling

```typescript
import { apiClient } from '@/src/services';

// Basic usage
const data = await apiClient.get('/api/endpoint');
const result = await apiClient.post('/api/endpoint', requestData);

// With authentication
apiClient.setAuthToken('your-jwt-token');
```

### 2. Token Service (`tokenService.ts`)

Handles all token-related API operations:

- **Swap Operations** - Get quotes, execute swaps
- **Token Search** - Search and discover tokens
- **Balance Management** - User token balances
- **Price Data** - Historical prices and market data
- **Favorites** - Manage favorite tokens

```typescript
import { tokenService } from '@/src/services';

// Get swap quote
const quote = await tokenService.getSwapQuote(
  'token-a-address',
  'token-b-address',
  '1000000', // amount in smallest units
  1 // 1% slippage
);

// Get user balances
const balances = await tokenService.getUserBalances('user-wallet-address');

// Search tokens
const searchResults = await tokenService.searchTokens('SOL');
```

### 3. Launchpad Service (`launchpadService.ts`)

Manages token creation and liquidity pool operations:

- **Token Creation** - Create new SPL tokens
- **Pool Management** - Create and manage liquidity pools
- **Liquidity Operations** - Add/remove liquidity
- **Transaction Building** - Generate unsigned transactions
- **Metadata Management** - Update token social metadata

```typescript
import { launchpadService } from '@/src/services';

// Create new token
const token = await launchpadService.createToken({
  name: 'My Token',
  symbol: 'MTK',
  decimals: 9,
  totalSupply: '1000000000',
  initialMint: '500000000',
  description: 'A sample token'
});

// Get user's tokens
const userTokens = await launchpadService.getUserTokens('user-wallet-address');

// Create pool
const poolTx = await launchpadService.createPoolTransactions({
  tokenA: 'token-a-address',
  tokenB: 'token-b-address',
  poolType: 'CPMM',
  initialLiquidityA: '1000000',
  initialLiquidityB: '2000000'
});
```

### 4. Wallet Service (`walletService.ts`)

Handles wallet operations and security:

- **Wallet Creation** - Generate new wallets
- **Import/Export** - Mnemonic phrase handling
- **Authentication** - Biometric and PIN authentication
- **Transaction Signing** - Sign transactions with private keys
- **Security Settings** - Auto-lock, biometric setup

```typescript
import { walletService } from '@/src/services';

// Create new wallet
const newWallet = await walletService.createWallet();
console.log('Mnemonic:', newWallet.mnemonic);

// Unlock wallet
const unlocked = await walletService.unlockWallet('1234'); // PIN
// or
const unlocked = await walletService.unlockWallet(); // Biometric

// Sign transaction
if (unlocked) {
  const signed = await walletService.signTransaction('transaction-data');
}
```

### 5. Notification Service (`notificationService.ts`)

Manages push notifications:

- **Push Notifications** - FCM integration
- **Preferences** - Notification settings
- **Price Alerts** - Custom price alerts
- **Local Notifications** - In-app notifications

```typescript
import { notificationService } from '@/src/services';

// Initialize (done automatically on app start)
await notificationService.initialize();

// Create price alert
const alert = await notificationService.createPriceAlert(
  'token-address',
  'SOL',
  100, // target price
  'above' // condition
);

// Update preferences
await notificationService.updatePreferences({
  transactionAlerts: true,
  priceAlerts: true,
  soundEnabled: false
});
```

## Environment Configuration

The API client automatically configures itself based on the current environment:

```typescript
// Development
API_BASE_URL = 'https://api-dev.opindex.com'

// Staging  
API_BASE_URL = 'https://api-staging.opindex.com'

// Production
API_BASE_URL = 'https://api.opindex.com'
```

Environment is determined by:
1. Expo release channel
2. Environment variable in `app.json`
3. `__DEV__` flag (development vs production)

## Error Handling

All services use consistent error handling:

```typescript
import { handleApiError } from '@/src/services';

try {
  const result = await tokenService.getSwapQuote(/* ... */);
} catch (error) {
  const userMessage = handleApiError(error);
  Alert.alert('Error', userMessage);
}
```

Common error types:
- `NETWORK_ERROR` - No internet connection
- `TIMEOUT` - Request timed out
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `SERVER_ERROR` - Internal server error

## Usage with React Query

Services integrate seamlessly with TanStack Query:

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { tokenService } from '@/src/services';

// Query example
function useTokenBalances(address: string) {
  return useQuery({
    queryKey: ['balances', address],
    queryFn: () => tokenService.getUserBalances(address),
    staleTime: 30000, // 30 seconds
  });
}

// Mutation example
function useSwapMutation() {
  return useMutation({
    mutationFn: (request) => tokenService.executeSwap(request),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries(['balances']);
    },
  });
}
```

## Initialization

Services are automatically initialized in the app's root layout:

```typescript
// app/_layout.tsx
import { initializeServices } from '@/src/services';

useEffect(() => {
  initializeServices();
}, []);
```

This ensures:
- Environment configuration is loaded
- API client is configured
- Push notifications are set up
- Authentication tokens are restored

## Security Considerations

- **Private Keys** - Never sent over the network, stored in Secure Store
- **Authentication** - JWT tokens with automatic refresh
- **Biometric Auth** - Uses device biometric capabilities
- **Network Security** - HTTPS only, certificate pinning recommended
- **Request Signing** - Sensitive operations require transaction signing

## Testing

Mock implementations are available for testing:

```typescript
// In tests
jest.mock('@/src/services', () => ({
  tokenService: {
    getSwapQuote: jest.fn().mockResolvedValue(mockQuote),
    getUserBalances: jest.fn().mockResolvedValue(mockBalances),
  },
}));
```

## Development Tips

1. **Logging** - Enable detailed logging in development mode
2. **Network Tab** - Use React Native Debugger to inspect requests
3. **Error Simulation** - Use network conditions to test error handling
4. **Token Management** - Store auth tokens in Secure Store, not AsyncStorage
5. **Offline Support** - Handle network errors gracefully with retry logic