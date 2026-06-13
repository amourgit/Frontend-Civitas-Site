// ==========================================
// index.ts - Exports principaux
// ==========================================


// Types
export type { 
    BaseRequestConfig, 
    ApiResponse, 
    RetryConfig,
    ConflictInfo,
    DeletedResourceInfo
} from './types/common.types';
  
// Erreurs
export { 
  ApiError,
  ValidationError, 
  NetworkError,
  ConflictError,
  ConcurrencyError,
  DeleteError,
  DependencyError,
  PermissionDeniedError,
  ProtectedResourceError
} from './errors';
  
// Utilitaires
export { RequestSanitizer } from './utils/requestSanitizer';
export { UrlBuilder } from './utils/urlBuilder';

// Services de base
export { BaseHttpService } from './services/base/BaseHttpService';

// Services principaux
export { GetService } from './services/GetService';
export { PostService } from './services/PostService';
export { UpdateService } from './services/UpdateService';
export { DeleteService } from './services/DeleteService';

// Factory
export { HttpServiceFactory } from './services/HttpServiceFactory';

// ── RealmResolver — Extraction dynamique du realm (sous-domaine → Keycloak) ──
export {
  resolveRealm,
  resolveRealmFromRequest,
  getCurrentRealm,
  getRealm,
  getAdminBase,
  getOidcBase,
  extractSubdomain,
  clearRealmCache,
} from '../lib/realm-resolver';
export type { ResolvedRealm } from '../lib/realm-resolver';






// ── SubdomainResolver — Extraction multi-niveaux de sous-domaines ──
export {
  resolveSubdomains,
  getSubdomainAt,
  getSubdomainsList,
  getTopSubdomain,
  getAllSubdomainsMap,
  useSubdomains,
} from '../lib/subdomain-resolver';
export type { SubdomainResolution, SubdomainResolverOptions } from '../lib/subdomain-resolver';
