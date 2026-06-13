export interface BaseRequestConfig {
    endpoint: string;
    params?: Record<string, unknown>;
    headers?: HeadersInit;
    timeout?: number;
    requireAuth?: boolean;
    sanitize?: boolean;
  }
  
  export interface ApiResponse<T> {
    data: T;
    status: number;
    headers: Headers;
    cached?: boolean;
  }
  
  export interface RetryConfig {
    attempts: number;
    delay: number;
    exponentialBackoff?: boolean;
  }