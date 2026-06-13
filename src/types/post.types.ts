// types/post.types.ts
import { BaseRequestConfig } from "./http.types";
import { z } from "zod";
import { RetryConfig } from "./http.types";


export interface PostRequestConfig<TRequest, TResponse> extends BaseRequestConfig {
    body: TRequest;
    bodySchema?: z.ZodSchema<TRequest>;
    responseSchema: z.ZodSchema<TResponse>;
    transform?: (data: unknown) => TResponse;
    validateRequest?: boolean;
    optimisticUpdate?: boolean;
    idempotencyKey?: string;
    retry?: RetryConfig;
    onProgress?: (progress: ProgressEvent) => void;
    fallback?: TResponse;
  }
  
  export interface FileUploadConfig<TResponse> extends Omit<BaseRequestConfig, 'headers'> {
    files: File[] | FileList;
    fieldName?: string;
    additionalFields?: Record<string, string | number | boolean>;
    responseSchema: z.ZodSchema<TResponse>;
    maxFileSize?: number;
    allowedTypes?: string[];
    onProgress?: (progress: ProgressEvent) => void;
    retry?: RetryConfig;
  }
  
  export interface BatchRequestConfig<TRequest, TResponse> extends BaseRequestConfig {
    requests: TRequest[];
    bodySchema?: z.ZodSchema<TRequest>;
    responseSchema: z.ZodSchema<TResponse>;
    batchSize?: number;
    concurrent?: boolean;
    stopOnError?: boolean;
    onBatchProgress?: (completed: number, total: number) => void;
  }