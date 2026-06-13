// types/update.types.ts
import { z } from 'zod';
import { BaseRequestConfig, RetryConfig } from './http.types';

export interface BaseUpdateConfig extends BaseRequestConfig {
  resourceId: string | number;
  optimisticUpdate?: boolean;
  conflictResolution?: 'client' | 'server' | 'merge';
  etag?: string;
  lastModified?: string;
  retry?: RetryConfig;
  fallback?: unknown;
}

export interface PutRequestConfig<TRequest, TResponse> extends BaseUpdateConfig {
  body: TRequest;
  bodySchema?: z.ZodSchema<TRequest>;
  responseSchema: z.ZodSchema<TResponse>;
  transform?: (data: unknown) => TResponse;
  validateRequest?: boolean;
  replaceStrategy?: 'full' | 'merge';
}

export interface PatchRequestConfig<TRequest, TResponse> extends BaseUpdateConfig {
  patches: TRequest;
  patchSchema?: z.ZodSchema<TRequest>;
  responseSchema: z.ZodSchema<TResponse>;
  transform?: (data: unknown) => TResponse;
  validatePatches?: boolean;
  patchFormat?: 'json-patch' | 'merge-patch' | 'custom';
}

export interface BulkUpdateConfig<TRequest, TResponse> extends BaseRequestConfig {
  updates: Array<{
    id: string | number;
    data: TRequest;
    method?: 'PUT' | 'PATCH';
  }>;
  bodySchema?: z.ZodSchema<TRequest>;
  responseSchema: z.ZodSchema<TResponse>;
  batchSize?: number;
  concurrent?: boolean;
  stopOnError?: boolean;
  onProgress?: (completed: number, total: number, errors: Error[]) => void;
}

export interface ConflictResolutionStrategy {
  onConflict: (
    clientData: unknown,
    serverData: unknown,
    conflictInfo: ConflictInfo
  ) => Promise<unknown>;
}

export interface ConflictInfo {
  endpoint: string;
  resourceId: string | number;
  clientEtag?: string;
  serverEtag?: string;
  conflictFields?: string[];
}

export interface JsonPatchOperation {
  op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';
  path: string;
  value?: any;
  from?: string;
}

export interface OptimisticUpdateMetadata {
  id: string;
  resourceId: string | number;
  originalData: unknown;
  optimisticData: unknown;
  timestamp: number;
  rollbackFn: () => void;
}