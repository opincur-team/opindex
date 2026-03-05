import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipient, CreateRecipientInput, UpdateRecipientInput } from '@/src/types/recipient';

const STORAGE_KEY = '@wallet_recipients';

/**
 * Generate a unique ID for a recipient
 */
const generateId = (): string => {
  return `recipient_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Get all recipients from storage
 */
export const getRecipients = async (): Promise<Recipient[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) {
      return [];
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to get recipients:', error);
    return [];
  }
};

/**
 * Save a new recipient
 */
export const saveRecipient = async (input: CreateRecipientInput): Promise<Recipient> => {
  try {
    const recipients = await getRecipients();

    // Check if recipient with this address already exists
    const existing = recipients.find(r => r.address === input.address);
    if (existing) {
      throw new Error('Recipient with this address already exists');
    }

    const newRecipient: Recipient = {
      id: generateId(),
      address: input.address,
      name: input.name,
      isFavorite: input.isFavorite ?? false,
      lastUsed: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    recipients.push(newRecipient);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(recipients));

    return newRecipient;
  } catch (error) {
    console.error('Failed to save recipient:', error);
    throw error;
  }
};

/**
 * Update an existing recipient
 */
export const updateRecipient = async (
  id: string,
  updates: UpdateRecipientInput
): Promise<Recipient | null> => {
  try {
    const recipients = await getRecipients();
    const index = recipients.findIndex(r => r.id === id);

    if (index === -1) {
      return null;
    }

    recipients[index] = {
      ...recipients[index],
      ...updates,
    };

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(recipients));
    return recipients[index];
  } catch (error) {
    console.error('Failed to update recipient:', error);
    throw error;
  }
};

/**
 * Delete a recipient
 */
export const deleteRecipient = async (id: string): Promise<boolean> => {
  try {
    const recipients = await getRecipients();
    const filtered = recipients.filter(r => r.id !== id);

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Failed to delete recipient:', error);
    return false;
  }
};

/**
 * Toggle favorite status
 */
export const toggleFavorite = async (id: string): Promise<Recipient | null> => {
  try {
    const recipients = await getRecipients();
    const index = recipients.findIndex(r => r.id === id);

    if (index === -1) {
      return null;
    }

    recipients[index].isFavorite = !recipients[index].isFavorite;

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(recipients));
    return recipients[index];
  } catch (error) {
    console.error('Failed to toggle favorite:', error);
    throw error;
  }
};

/**
 * Update last used timestamp
 */
export const updateLastUsed = async (address: string): Promise<void> => {
  try {
    const recipients = await getRecipients();
    const index = recipients.findIndex(r => r.address === address);

    if (index !== -1) {
      recipients[index].lastUsed = new Date().toISOString();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(recipients));
    }
  } catch (error) {
    console.error('Failed to update last used:', error);
  }
};

/**
 * Get recipient by address
 */
export const getRecipientByAddress = async (address: string): Promise<Recipient | null> => {
  try {
    const recipients = await getRecipients();
    return recipients.find(r => r.address === address) || null;
  } catch (error) {
    console.error('Failed to get recipient by address:', error);
    return null;
  }
};

/**
 * Clear all recipients (for testing/debugging)
 */
export const clearAllRecipients = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear recipients:', error);
  }
};
