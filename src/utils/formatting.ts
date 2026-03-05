import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

export const formatAddress = (address: string, chars: number = 8): string => {
  if (!address) return '';
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

export const formatCurrency = (
  value: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Convert USD value to base token and format
 * @param usdValue - Value in USD
 * @param baseTokenPrice - Base token's USD price (e.g., SOL price = 45.5)
 * @param baseTokenSymbol - Base token symbol (e.g., 'SOL', 'USDC')
 * @param decimals - Number of decimal places to display (default: 3)
 * @returns Formatted string like "0.456 SOL" or falls back to USD if conversion not possible
 */
export const convertToBaseToken = (
  usdValue: number,
  baseTokenPrice: number | null | undefined,
  baseTokenSymbol: string | null | undefined,
  decimals: number = 3
): string => {
  // Fallback to USD if base token price is not available
  if (!baseTokenPrice || baseTokenPrice <= 0 || !baseTokenSymbol) {
    return formatCurrency(usdValue, 'USD', 'en-US');
  }

  // Calculate converted value
  const convertedValue = usdValue / baseTokenPrice;

  // Format with configured decimals
  const formattedAmount = convertedValue.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${formattedAmount} ${baseTokenSymbol}`;
};

export const formatTokenAmount = (
  amount: string | number, 
  decimals: number = 6,
  showFullAmount: boolean = false
): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return '0';
  
  if (showFullAmount) {
    return numAmount.toLocaleString('en-US', { 
      maximumFractionDigits: decimals 
    });
  }
  
  // Format large numbers with K, M, B suffixes
  if (numAmount >= 1e9) {
    return (numAmount / 1e9).toFixed(2) + 'B';
  } else if (numAmount >= 1e6) {
    return (numAmount / 1e6).toFixed(2) + 'M';
  } else if (numAmount >= 1e3) {
    return (numAmount / 1e3).toFixed(2) + 'K';
  }
  
  return numAmount.toLocaleString('en-US', { 
    maximumFractionDigits: Math.min(decimals, 6) 
  });
};

export const formatPercentage = (
  value: number, 
  decimals: number = 2,
  showSign: boolean = true
): string => {
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await Clipboard.setStringAsync(text);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    return true;
  } catch {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    return false;
  }
};

export const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInHours * 60);
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
};

export const formatTransactionHash = (hash: string, chars: number = 6): string => {
  if (!hash) return '';
  if (hash.length <= chars * 2) return hash;
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

export const formatLargeNumber = (num: number): string => {
  if (num >= 1e12) {
    return (num / 1e12).toFixed(2) + 'T';
  } else if (num >= 1e9) {
    return (num / 1e9).toFixed(2) + 'B';
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(2) + 'M';
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(2) + 'K';
  }
  return num.toString();
};

export const isValidAddress = (address: string): boolean => {
  // Basic Solana address validation
  const base58Regex = /^[A-HJ-NP-Z1-9]+$/;
  return base58Regex.test(address) && address.length >= 32 && address.length <= 44;
};

/**
 * Sanitize and validate amount input for token transfers/swaps
 * Handles locale differences (comma vs dot decimal separator)
 * @param input - Raw user input string
 * @param maxDecimals - Maximum decimal places allowed (default: 9 for SOL)
 * @param maxValue - Maximum allowed value (default: 1 trillion to prevent overflow)
 * @returns Sanitized amount or null if invalid
 */
export const sanitizeAmount = (
  input: string,
  maxDecimals: number = 9,
  maxValue: number = 1e12
): { value: number | null; sanitized: string; error?: string } => {
  if (!input || input.trim() === '') {
    return { value: null, sanitized: '', error: undefined };
  }

  // Normalize input: replace comma with dot for decimal separator
  let sanitized = input.trim().replace(',', '.');

  // Remove any non-numeric characters except dot
  sanitized = sanitized.replace(/[^\d.]/g, '');

  // Handle multiple dots - keep only the first one
  const parts = sanitized.split('.');
  if (parts.length > 2) {
    sanitized = parts[0] + '.' + parts.slice(1).join('');
  }

  // Limit decimal places
  if (parts.length === 2 && parts[1].length > maxDecimals) {
    sanitized = parts[0] + '.' + parts[1].slice(0, maxDecimals);
  }

  // Parse the value
  const value = parseFloat(sanitized);

  // Validate the parsed value
  if (isNaN(value)) {
    return { value: null, sanitized, error: 'Invalid number format' };
  }

  if (value < 0) {
    return { value: null, sanitized, error: 'Amount cannot be negative' };
  }

  if (value > maxValue) {
    return { value: null, sanitized, error: 'Amount exceeds maximum allowed' };
  }

  // Check for scientific notation in original input (potential attack)
  if (/[eE]/.test(input)) {
    return { value: null, sanitized, error: 'Scientific notation not allowed' };
  }

  return { value, sanitized, error: undefined };
};

/**
 * Parse amount with locale support (comma or dot as decimal separator)
 * Simple version for quick parsing without full validation
 */
export const parseAmount = (input: string): number => {
  if (!input) return 0;
  const normalized = input.replace(',', '.');
  const parsed = parseFloat(normalized);
  return isNaN(parsed) || parsed < 0 ? 0 : parsed;
};