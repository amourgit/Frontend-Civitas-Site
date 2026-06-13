// ============================================================
// services/iam/index.ts — Exports du module IAM (Keycloak Admin REST API v26)
// ============================================================

// ── Services IAM locaux ──────────────────────────────────────
export { authService, profilService }           from './authService';
export { profilsService, extractProfilError }   from './profilsService';
export { rolesService, extractRoleError }       from './rolesService';
export { permissionsService, extractPermError } from './permissionsService';

// ── Keycloak Admin REST API — Utilisateurs ──────────────────
export {
  keycloakUsersService,
  extractKeycloakUserError,
  default as keycloakUsersServiceDefault,
} from './keycloakUsersService';

// ── Keycloak Admin REST API — Groupes ───────────────────────
export {
  keycloakGroupsService,
  extractKeycloakGroupError,
  default as keycloakGroupsServiceDefault,
} from './keycloakGroupsService';

// ── Adaptateur Keycloak → Profil (composants) ───────────────
export {
  profilsKeycloakAdapter,
  keycloakUserToProfil,
  loadProfilDetail,
} from './keycloakProfilsAdapter';

// ── Keycloak Admin REST API — Clients ───────────────────────
export {
  keycloakClientsService,
  extractKeycloakClientError,
  default as keycloakClientsServiceDefault,
} from './keycloakClientsService';

// ── Keycloak Admin REST API — Realms ────────────────────────
export {
  keycloakRealmsService,
  extractKeycloakRealmError,
  default as keycloakRealmsServiceDefault,
} from './keycloakRealmsService';

// ── Keycloak Admin REST API — Détection d'attaques (Brute Force) ──
export {
  keycloakAttackDetectionService,
  extractAttackDetectionError,
  default as keycloakAttackDetectionServiceDefault,
} from './keycloakAttackDetectionService';

// ── Keycloak Admin REST API — Authentification (Flows, Required Actions) ──
export {
  keycloakAuthenticationService,
  extractAuthenticationError,
  default as keycloakAuthenticationServiceDefault,
} from './keycloakAuthenticationService';

// ── Keycloak Admin REST API — Certificats Client ─────────────
export {
  keycloakClientCertificatesService,
  extractClientCertificateError,
  default as keycloakClientCertificatesServiceDefault,
} from './keycloakClientCertificatesService';

// ── Keycloak Admin REST API — Accès Initial Client ───────────
export {
  keycloakClientInitialAccessService,
  extractClientInitialAccessError,
  default as keycloakClientInitialAccessServiceDefault,
} from './keycloakClientInitialAccessService';

// ── Keycloak Admin REST API — Client Scopes (globaux) ────────
export {
  keycloakClientScopesService,
  extractClientScopeError,
  default as keycloakClientScopesServiceDefault,
} from './keycloakClientScopesService';

// ── Keycloak Admin REST API — Composants ─────────────────────
export {
  keycloakComponentsService,
  extractComponentError,
  COMPONENT_PROVIDER_TYPES,
  default as keycloakComponentsServiceDefault,
} from './keycloakComponentsService';

// ── Keycloak Admin REST API — Identity Providers ─────────────
export {
  keycloakIdentityProvidersService,
  extractIdentityProviderError,
  default as keycloakIdentityProvidersServiceDefault,
} from './keycloakIdentityProvidersService';

// ── Keycloak Admin REST API — Clés Cryptographiques ──────────
export {
  keycloakKeysService,
  default as keycloakKeysServiceDefault,
} from './keycloakKeysService';

// ── Keycloak Admin REST API — Organisations ──────────────────
export {
  keycloakOrganizationsService,
  extractOrganizationError,
  default as keycloakOrganizationsServiceDefault,
} from './keycloakOrganizationsService';

// ── Keycloak Admin REST API — Rôles Realm (par nom) ──────────
export {
  keycloakRealmRolesService,
  keycloakRolesByIdService,
  extractRealmRoleError,
  default as keycloakRealmRolesServiceDefault,
} from './keycloakRealmRolesService';

// ── Keycloak Admin REST API — Role Mappings Utilisateurs ─────
export {
  keycloakUserRoleMappingsService,
  default as keycloakUserRoleMappingsServiceDefault,
} from './keycloakUserRoleMappingsService';

// ── Keycloak Admin REST API — Workflows ──────────────────────
export {
  keycloakWorkflowsService,
  extractWorkflowError,
  default as keycloakWorkflowsServiceDefault,
} from './keycloakWorkflowsService';

// ── Keycloak Admin REST API — Fine-Grained Authorization (Authz) ──
export {
  keycloakAuthorizationService,
  extractAuthorizationError,
  default as keycloakAuthorizationServiceDefault,
} from './keycloakAuthorizationService';
