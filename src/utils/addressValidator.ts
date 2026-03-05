import bs58 from 'bs58';

/**
 * Validates a Solana address
 * Solana addresses are base58 encoded and typically 32-44 characters
 */
export const isValidSolanaAddress = (address: string): boolean => {
  if (!address || typeof address !== 'string') {
    return false;
  }

  // Trim whitespace
  address = address.trim();

  // Check length (Solana addresses are typically 32-44 characters)
  if (address.length < 32 || address.length > 44) {
    return false;
  }

  try {
    // Try to decode as base58
    const decoded = bs58.decode(address);

    // Solana public keys should be exactly 32 bytes
    if (decoded.length !== 32) {
      return false;
    }

    return true;
  } catch (error) {
    // If decoding fails, it's not a valid base58 string
    return false;
  }
};

/**
 * Formats a Solana address for display (shortened)
 * Example: "7xKX...9abc"
 */
export const formatAddress = (address: string, startChars: number = 4, endChars: number = 4): string => {
  if (!address || address.length <= startChars + endChars) {
    return address;
  }

  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

/**
 * Validates and formats an address input
 */
export const validateAndFormatAddress = (input: string): {
  isValid: boolean;
  formatted: string;
  error?: string;
} => {
  const trimmed = input.trim();

  if (!trimmed) {
    return {
      isValid: false,
      formatted: '',
      error: 'Address is required',
    };
  }

  if (!isValidSolanaAddress(trimmed)) {
    return {
      isValid: false,
      formatted: trimmed,
      error: 'Invalid Solana address',
    };
  }

  return {
    isValid: true,
    formatted: trimmed,
  };
};
