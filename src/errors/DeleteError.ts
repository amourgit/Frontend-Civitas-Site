// errors/DeleteError.ts
import { ApiError } from "../errors/ApiError";
import { DeletedResourceInfo } from "../types/delete.types";


export class DeleteError extends ApiError {
    constructor(
      message: string,
      public resourceId?: string | number,
      public deleteInfo?: DeletedResourceInfo
    ) {
      super(message, 409, 'DELETE_ERROR');
      this.name = 'DeleteError';
    }
  }
  
  export class DependencyError extends DeleteError {
    constructor(
      message: string,
      public resourceId: string | number,
      public dependencies: Array<{ id: string | number; type: string; name?: string }>,
      public suggestedAction: 'cascade' | 'remove_dependencies' | 'soft_delete'
    ) {
      super(message, resourceId);
      this.name = 'DependencyError';
    }
  }
  
  export class PermissionDeniedError extends DeleteError {
    constructor(
      message: string,
      public resourceId: string | number,
      public requiredPermissions: string[]
    ) {
      super(message, resourceId);
      this.name = 'PermissionDeniedError';
      this.status = 403;
    }
  }
  
  export class ProtectedResourceError extends DeleteError {
    constructor(
      message: string,
      public resourceId: string | number,
      public protectionReason: 'system' | 'business_critical' | 'user_defined' | 'regulatory',
      public overrideRequired?: boolean
    ) {
      super(message, resourceId);
      this.name = 'ProtectedResourceError';
      this.status = 422;
    }
  }