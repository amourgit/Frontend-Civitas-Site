// errors/UpdateError.ts
import { ApiError } from "../errors/ApiError";
import { ConflictInfo } from "../types/update.types";

export class ConflictError extends ApiError {
    constructor(
      message: string,
      public conflictInfo: ConflictInfo,
      public serverData?: unknown
    ) {
      super(message, 409, 'CONFLICT_ERROR');
      this.name = 'ConflictError';
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
    }
  }