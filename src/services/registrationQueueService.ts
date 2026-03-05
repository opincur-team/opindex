import AsyncStorage from '@react-native-async-storage/async-storage';
import { walletRegistrationService } from './walletRegistrationService';

const QUEUE_STORAGE_KEY = 'wallet_registration_queue';
const MAX_RETRY_ATTEMPTS = 5;
const INITIAL_RETRY_DELAY = 1000; // 1 second

interface QueuedRegistration {
  publicAddress: string;
  attempts: number;
  lastAttempt?: number;
  addedAt: number;
}

class RegistrationQueueService {
  private isProcessing = false;

  /**
   * Add a wallet registration to the retry queue
   */
  async addToQueue(publicAddress: string): Promise<void> {
    try {
      const queue = await this.getQueue();

      // Check if already in queue
      const existing = queue.find(item => item.publicAddress === publicAddress);
      if (existing) {
        console.log('Wallet already in registration queue:', publicAddress);
        return;
      }

      // Add to queue
      queue.push({
        publicAddress,
        attempts: 0,
        addedAt: Date.now()
      });

      await this.saveQueue(queue);
      console.log('✓ Added wallet to registration queue:', publicAddress);

      // Try to process queue immediately
      this.processQueue();
    } catch (error) {
      console.error('Failed to add to registration queue:', error);
    }
  }

  /**
   * Remove a wallet from the registration queue
   */
  async removeFromQueue(publicAddress: string): Promise<void> {
    try {
      const queue = await this.getQueue();
      const filtered = queue.filter(item => item.publicAddress !== publicAddress);
      await this.saveQueue(filtered);
      console.log('✓ Removed wallet from registration queue:', publicAddress);
    } catch (error) {
      console.error('Failed to remove from registration queue:', error);
    }
  }

  /**
   * Process all pending registrations in the queue
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing) {
      console.log('Queue processing already in progress');
      return;
    }

    this.isProcessing = true;

    try {
      const queue = await this.getQueue();

      if (queue.length === 0) {
        console.log('Registration queue is empty');
        return;
      }

      console.log(`Processing ${queue.length} wallet registrations from queue...`);

      const updatedQueue: QueuedRegistration[] = [];

      for (const item of queue) {
        // Check if max retries exceeded
        if (item.attempts >= MAX_RETRY_ATTEMPTS) {
          console.warn(`Max retry attempts exceeded for wallet: ${item.publicAddress}`);
          continue; // Remove from queue by not adding to updatedQueue
        }

        // Check if should retry based on exponential backoff
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, item.attempts);
        const timeSinceLastAttempt = Date.now() - (item.lastAttempt || item.addedAt);

        if (item.lastAttempt && timeSinceLastAttempt < delay) {
          // Not ready for retry yet
          updatedQueue.push(item);
          continue;
        }

        // Attempt registration
        try {
          await walletRegistrationService.registerWallet(item.publicAddress);
          console.log('✅ Successfully registered wallet from queue:', item.publicAddress);
          // Don't add to updatedQueue (remove from queue)
        } catch (error: any) {
          console.warn(`Registration attempt ${item.attempts + 1} failed for ${item.publicAddress}:`, error.message);

          // Update attempt count and add back to queue
          updatedQueue.push({
            ...item,
            attempts: item.attempts + 1,
            lastAttempt: Date.now()
          });
        }
      }

      // Save updated queue
      await this.saveQueue(updatedQueue);

      if (updatedQueue.length === 0) {
        console.log('✅ All wallet registrations completed successfully');
      } else {
        console.log(`${updatedQueue.length} wallet registrations still pending`);
      }
    } catch (error) {
      console.error('Error processing registration queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Get the current registration queue
   */
  private async getQueue(): Promise<QueuedRegistration[]> {
    try {
      const queueJson = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      return queueJson ? JSON.parse(queueJson) : [];
    } catch (error) {
      console.error('Failed to get registration queue:', error);
      return [];
    }
  }

  /**
   * Save the registration queue
   */
  private async saveQueue(queue: QueuedRegistration[]): Promise<void> {
    try {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to save registration queue:', error);
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<{ total: number; pending: number; failedPermanently: number }> {
    const queue = await this.getQueue();
    const pending = queue.filter(item => item.attempts < MAX_RETRY_ATTEMPTS).length;
    const failedPermanently = queue.filter(item => item.attempts >= MAX_RETRY_ATTEMPTS).length;

    return {
      total: queue.length,
      pending,
      failedPermanently
    };
  }

  /**
   * Clear the entire registration queue
   */
  async clearQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(QUEUE_STORAGE_KEY);
      console.log('✓ Registration queue cleared');
    } catch (error) {
      console.error('Failed to clear registration queue:', error);
    }
  }
}

export const registrationQueueService = new RegistrationQueueService();
