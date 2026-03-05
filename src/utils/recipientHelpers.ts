import { Recipient } from '@/src/types/recipient';

/**
 * Format last used date to relative time string
 */
export const formatLastUsed = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffMins < 1) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffDays < 30) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  } else if (diffMonths < 12) {
    return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
  } else {
    return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
  }
};

/**
 * Sort recipients: favorites first, then by last used
 */
export const sortRecipients = (recipients: Recipient[]): Recipient[] => {
  return [...recipients].sort((a, b) => {
    // Favorites come first
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;

    // Then sort by last used (most recent first)
    return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
  });
};

/**
 * Filter recipients by search query (matches name or address)
 */
export const filterRecipients = (
  recipients: Recipient[],
  query: string
): Recipient[] => {
  if (!query.trim()) {
    return recipients;
  }

  const lowerQuery = query.toLowerCase();
  return recipients.filter(
    r =>
      r.name?.toLowerCase().includes(lowerQuery) ||
      r.address.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Get display name for recipient (name or formatted address)
 */
export const getRecipientDisplayName = (recipient: Recipient): string => {
  return recipient.name || 'SELECT A NAME';
};

/**
 * Validate recipient data
 */
export const validateRecipientName = (name: string): boolean => {
  return name.trim().length > 0 && name.trim().length <= 50;
};
