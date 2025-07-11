import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { AmadeusToken, AmadeusErrorResponse } from '@/types/amadeus';

export class AmadeusService {
  private client: AxiosInstance;
  private token: string | null = null;
  private tokenExpiry: number = 0;
  private readonly baseURL: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor() {
    this.baseURL = process.env.AMADEUS_API_BASE_URL || 'https://test.api.amadeus.com';
    this.apiKey = process.env.AMADEUS_API_KEY || 'or0w1VtGUvX5fSrWyciH4GkD33Y0D9k7';
    this.apiSecret = process.env.AMADEUS_API_SECRET || 'rJwUstHFrQipHRnN';
    console.log('Initializing AmadeusService with base URL:', this.baseURL);
    console.log('Using Amadeus API Key:', this.apiKey);
    console.log('Using Amadeus API Secret:', this.apiSecret ?
        '******' : 'Not provided');

    if (!this.apiKey || !this.apiSecret) {
      throw new Error('Amadeus API credentials are required');
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        // Skip token for auth endpoint
        if (!config.url?.includes('/oauth2/token')) {
          await this.ensureValidToken();
          if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Handle token expiration
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          this.token = null;
          this.tokenExpiry = 0;

          try {
            await this.ensureValidToken();
            if (this.token) {
              originalRequest.headers.Authorization = `Bearer ${this.token}`;
              return this.client.request(originalRequest);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
          }
        }

        // Format Amadeus API errors
        if (error.response?.data?.errors) {
          const amadeusError = error.response.data as AmadeusErrorResponse;
          console.error('Amadeus API Error Details:', {
            status: error.response.status,
            statusText: error.response.statusText,
            errors: amadeusError.errors,
            url: error.config?.url,
            method: error.config?.method,
            params: error.config?.params
          });
          const formattedError = new Error(
            amadeusError.errors.map(e => e.detail).join('; ')
          );
          formattedError.name = 'AmadeusAPIError';
          throw formattedError;
        }

        // Log other types of errors
        console.error('Amadeus Service Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
          method: error.config?.method
        });

        throw error;
      }
    );
  }

  private async getAccessToken(): Promise<AmadeusToken> {
    try {
      const response = await axios.post<AmadeusToken>(
        `${this.baseURL}/v1/security/oauth2/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.apiKey,
          client_secret: this.apiSecret,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 10000,
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to get Amadeus access token:', error);
      throw new Error('Authentication with Amadeus API failed');
    }
  }

  private async ensureValidToken(): Promise<void> {
    const now = Date.now();
    const buffer = 5 * 60 * 1000; // 5 minute buffer

    if (this.token && now < this.tokenExpiry - buffer) {
      return;
    }

    try {
      const tokenData = await this.getAccessToken();
      this.token = tokenData.access_token;
      this.tokenExpiry = now + (tokenData.expires_in * 1000);
      console.log('Amadeus token refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh Amadeus token:', error);
      throw error;
    }
  }

  // Generic API request method
  async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    params?: any,
    data?: any,
    timeoutMs: number = 30000
  ): Promise<T> {
    try {
      const source = axios.CancelToken.source();
      
      // Create a timeout promise
      const timeout = new Promise<never>((_, reject) => {
        setTimeout(() => {
          source.cancel('Request timeout');
          reject(new Error(`Request timeout after ${timeoutMs/1000} seconds`));
        }, timeoutMs);
      });
      
      const config: any = {
        method,
        url: endpoint,
        cancelToken: source.token,
      };

      if (params) {
        config.params = params;
      }

      if (data) {
        config.data = data;
      }

      // Race between the request and the timeout
      const response: AxiosResponse<T> = await Promise.race([
        this.client.request(config),
        timeout
      ]) as AxiosResponse<T>;
      
      return response.data;
    } catch (error) {
      console.error(`Amadeus API request failed: ${method} ${endpoint}`, error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.ensureValidToken();
      return !!this.token;
    } catch (error) {
      return false;
    }
  }
}

// Singleton instance
export const amadeusService = new AmadeusService();
