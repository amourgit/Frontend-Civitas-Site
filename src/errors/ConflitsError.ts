import { ApiError } from "./ApiError";

export interface ConflictInfo {
    endpoint: string;
    resourceId: string | number;
    clientEtag?: string;
    serverEtag?: string;
    conflictFields?: string[];
  }
  
  export class ConflictError extends ApiError {
    constructor(
      message: string,
      public conflictInfo: ConflictInfo,
      public serverData?: unknown
    ) {
      super(message, 409, 'CONFLICT_ERROR');
      this.name = 'ConflictError';
      Object.setPrototypeOf(this, ConflictError.prototype);
    }
  }
  
  export class ConcurrencyError extends ApiError {
    constructor(
      message: string,
      public resourceId: string | number,
      public expectedVersion?: string,
      public actualVersion?: string
    ) {
      super(message, 409, 'CONCURRENCY_ERROR');
      this.name = 'ConcurrencyError';
      Object.setPrototypeOf(this, ConcurrencyError.prototype);
    }
  }