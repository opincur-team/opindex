import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';

// SSL Certificate Pinning Configuration
// =====================================
// To enable SSL pinning for production:
// 1. Install: npm install react-native-ssl-pinning
// 2. Get certificate hash: openssl s_client -connect api.opindex.io:443 | openssl x509 -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl enc -base64
// 3. Add the hash to SSL_PINS below
// 4. Set SSL_PINNING_ENABLED = true
// 5. Replace axios calls with ssl-pinning fetch in the client
//
// WARNING: When certificate is renewed, app will stop working until pins are updated!
// Always include backup pins and have a certificate rotation strategy.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _SSL_PINS: Record<string, string[]> = {
  'api.opindex.io': [
    // Add certificate pins here when ready for production
  ],
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _SSL_PINNING_ENABLED = false;

// Extend Axios config types to include metadata
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  metadata?: {
    startTime: number;
  };
  _retry?: boolean;
}

// API Configuration
// Note: baseURL will be set by configureApiForEnvironment() from environment.ts
const API_CONFIG = {
  baseURL: '', // Will be configured at runtime from environment.ts
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};

// Request/Response interfaces
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
}

class ApiClient {
  private readonly client: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': `OpindexWallet/${Platform.OS}`,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: ExtendedAxiosRequestConfig) => {
        // Add authentication token if available
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }

        // Add request timestamp for debugging
        config.metadata = { startTime: Date.now() };

        // Log requests in development
        if (__DEV__) {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            data: config.data,
            params: config.params,
          });
        }

        return config;
      },
      (error: AxiosError) => {
        if (__DEV__) {
          console.error('❌ Request Error:', error);
        }
        return Promise.reject(this.normalizeError(error));
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Calculate response time
        const extendedConfig = response.config as ExtendedAxiosRequestConfig;
        const responseTime = Date.now() - (extendedConfig.metadata?.startTime || Date.now());

        // Log responses in development
        if (__DEV__) {
          console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            status: response.status,
            responseTime: `${responseTime}ms`,
            data: response.data,
          });
        }

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as ExtendedAxiosRequestConfig;

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          this.clearAuthToken();
          // Optionally trigger re-authentication flow
          // await this.refreshToken();
          return this.client(originalRequest);
        }

        // Handle network errors with retry
        if (!error.response && !originalRequest._retry) {
          return this.retryRequest(originalRequest, error);
        }

        // Handle 5xx server errors with retry
        const status = error.response?.status;
        if (status && status >= 500 && status < 600 && !originalRequest._retry) {
          return this.retryRequest(originalRequest, error);
        }

        // Log errors in development
        if (__DEV__) {
          console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
            status: error.response?.status,
            message: error.message,
          });
        }

        return Promise.reject(this.normalizeError(error));
      }
    );
  }

  private async retryRequest(
    originalRequest: ExtendedAxiosRequestConfig,
    error: AxiosError
  ): Promise<AxiosResponse> {
    originalRequest._retry = true;

    for (let i = 0; i < API_CONFIG.retryAttempts; i++) {
      try {
        await this.delay(API_CONFIG.retryDelay * (i + 1));
        return await this.client(originalRequest);
      } catch (retryError) {
        if (i === API_CONFIG.retryAttempts - 1) {
          throw this.normalizeError(retryError as AxiosError);
        }
      }
    }

    throw this.normalizeError(error);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private normalizeError(error: AxiosError): ApiError {
    const apiError: ApiError = {
      message: 'An unexpected error occurred',
      status: error.response?.status,
    };

    if (error.response?.data) {
      const responseData = error.response.data as any;
      // Sanitize error messages - use user-friendly messages instead of raw server errors
      apiError.message = this.sanitizeErrorMessage(
        responseData.message || responseData.error,
        error.response.status
      );
      apiError.code = responseData.code;
      // Don't expose raw details to users - could leak implementation info
    } else if (error.request) {
      apiError.message = 'Network error. Please check your connection.';
      apiError.code = 'NETWORK_ERROR';
    } else {
      apiError.message = 'Request failed. Please try again.';
      apiError.code = 'REQUEST_ERROR';
    }

    return apiError;
  }

  /**
   * Sanitize server error messages to prevent information leakage
   * Maps technical errors to user-friendly messages
   */
  private sanitizeErrorMessage(serverMessage: string | undefined, status?: number): string {
    // Map of known safe error messages that can be shown to users
    const safeMessages: Record<string, string> = {
      'insufficient balance': 'Insufficient balance for this transaction',
      'insufficient funds': 'Insufficient funds for this transaction',
      'invalid address': 'Invalid wallet address',
      'invalid amount': 'Invalid amount specified',
      'transaction failed': 'Transaction failed. Please try again.',
      'slippage exceeded': 'Price changed too much. Please try again.',
      'rate limit': 'Too many requests. Please wait a moment.',
      'wallet not found': 'Wallet not found',
      'token not found': 'Token not found',
    };

    // Check if server message contains any safe keywords
    if (serverMessage) {
      const lowerMessage = serverMessage.toLowerCase();
      for (const [keyword, safeMessage] of Object.entries(safeMessages)) {
        if (lowerMessage.includes(keyword)) {
          return safeMessage;
        }
      }
    }

    // Return generic messages based on status code
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Authentication required. Please log in again.';
      case 403:
        return 'Access denied.';
      case 404:
        return 'Resource not found.';
      case 429:
        return 'Too many requests. Please wait a moment.';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'Server error. Please try again later.';
      default:
        return 'An error occurred. Please try again.';
    }
  }

  // Authentication methods
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  clearAuthToken(): void {
    this.authToken = null;
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  // Generic HTTP methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data.data;
  }

  // File upload method
  async uploadFile<T = any>(
    url: string,
    file: FormData,
    config?: AxiosRequestConfig & { onUploadProgress?: (progressEvent: any) => void }
  ): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, file, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/health');
      return true;
    } catch {
      return false;
    }
  }

  // Update base URL (for different environments)
  setBaseURL(baseURL: string): void {
    this.client.defaults.baseURL = baseURL;
  }

  // Get raw axios instance for special cases
  getAxiosInstance(): AxiosInstance {
    return this.client;
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();

// Export types for use in services
export type { AxiosRequestConfig, AxiosResponse };

// Utility function to handle API responses in components
export const handleApiError = (error: ApiError): string => {
  switch (error.code) {
    case 'NETWORK_ERROR':
      return 'Please check your internet connection and try again.';
    case 'TIMEOUT':
      return 'Request timed out. Please try again.';
    case 'UNAUTHORIZED':
      return 'Session expired. Please log in again.';
    case 'FORBIDDEN':
      return 'You do not have permission to perform this action.';
    case 'NOT_FOUND':
      return 'The requested resource was not found.';
    case 'SERVER_ERROR':
      return 'Server error. Please try again later.';
    default:
      return error.message || 'An unexpected error occurred.';
  }
};

// Environment configuration helper
// Note: This is called from environment.ts with the apiBaseUrl from the environment config
export const configureApiForEnvironment = (baseURL: string) => {
  apiClient.setBaseURL(baseURL);
};
