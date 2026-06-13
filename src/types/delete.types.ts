// types/delete.types.ts
import { z } from 'zod';
import { BaseRequestConfig, RetryConfig } from './http.types';

export interface BaseDeleteConfig extends BaseRequestConfig {
  resourceId?: string | number;
  confirmationToken?: string;
  cascade?: boolean;
  softDelete?: boolean;
  reason?: string;
  retry?: RetryConfig;
}

export interface DeleteRequestConfig<TResponse = void> extends BaseDeleteConfig {
  responseSchema?: z.ZodSchema<TResponse>;
  transform?: (data: unknown) => TResponse;
  optimisticDelete?: boolean;
  forceDelete?: boolean;
  backupBeforeDelete?: boolean;
  dependencies?: string[];
}

export interface BulkDeleteConfig<TResponse = void> extends BaseRequestConfig {
  resourceIds: Array<string | number>;
  responseSchema?: z.ZodSchema<TResponse>;
  batchSize?: number;
  concurrent?: boolean;
  stopOnError?: boolean;
  cascade?: boolean;
  softDelete?: boolean;
  onProgress?: (completed: number, total: number, errors: Error[]) => void;
  confirmationTokens?: Map<string | number, string>;
}

export interface ConditionalDeleteConfig<TResponse = void> extends BaseDeleteConfig {
  conditions: Record<string, unknown>;
  conditionsSchema?: z.ZodSchema<Record<string, unknown>>;
  responseSchema?: z.ZodSchema<TResponse>;
  dryRun?: boolean;
  maxItems?: number;
}

export interface ScheduledDeleteConfig extends BaseDeleteConfig {
  scheduledFor: Date | string;
  timezone?: string;
  recurring?: {
    pattern: 'daily' | 'weekly' | 'monthly' | 'custom';
    interval?: number;
    endDate?: Date;
  };
  notifyBeforeDelete?: {
    intervals: number[]; // en minutes
    recipients?: string[];
  };
}

export interface DeleteConfirmation {
  token: string;
  expiresAt: Date;
  resourceInfo: {
    id: string | number;
    type: string;
    name?: string;
    dependenciesCount?: number;
  };
  warnings?: string[];
}

export interface RestoreConfig<TResponse = void> extends BaseRequestConfig {
  resourceId: string | number;
  responseSchema?: z.ZodSchema<TResponse>;
  restorePoint?: string;
  cascadeRestore?: boolean;
}

export interface DeletedResourceInfo {
  id: string | number;
  type: string;
  deletedAt: Date;
  deletedBy?: string;
  reason?: string;
  canRestore: boolean;
  restoreUntil?: Date;
  backupLocation?: string;
  dependencies?: Array<{
    id: string | number;
    type: string;
    status: 'deleted' | 'preserved' | 'cascade_deleted';
  }>;
}

export interface OptimisticDeleteMetadata {
  id: string;
  resourceId: string | number;
  originalData: unknown;
  timestamp: number;
  softDelete: boolean;
  rollbackFn: () => Promise<void>;
  restoreFn: () => Promise<void>;
}