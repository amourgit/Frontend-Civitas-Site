// ============================================================
// lib/models/iam/keycloak-realm.model.ts
// Schémas Zod — Module Realms Keycloak Admin REST API v26
// Source: Keycloak Admin REST API (26.6.1)
// Endpoints: /admin/realms, /admin/realms/{realm}/*
// ============================================================

import { z } from 'zod';

// ────────────────────────────────────────────────────────────
// PRIMITIVES PARTAGÉES
// ────────────────────────────────────────────────────────────

/**
 * AuthDetailsRepresentation — contexte d'auth d'un admin event.
 */
export const AuthDetailsRepresentationSchema = z.object({
  realmId:   z.string().optional(),
  realmName: z.string().optional(),
  clientId:  z.string().optional(),
  userId:    z.string().optional(),
  ipAddress: z.string().optional(),
  username:  z.string().optional(),
}).passthrough();
export type AuthDetailsRepresentation = z.infer<typeof AuthDetailsRepresentationSchema>;

/**
 * AdminEventRepresentation — événement d'administration du realm.
 * Retourné par GET /admin-events.
 */
export const AdminEventRepresentationSchema = z.object({
  id:              z.string().optional(),
  time:            z.number().optional(),           // Long int64 epoch ms
  realmId:         z.string().optional(),
  realmName:       z.string().optional(),
  authDetails:     AuthDetailsRepresentationSchema.optional(),
  operationType:   z.string().optional(),           // 'CREATE' | 'UPDATE' | 'DELETE' | 'ACTION'
  resourceType:    z.string().optional(),
  resourcePath:    z.string().optional(),
  representation:  z.string().optional(),           // JSON du changement
  error:           z.string().optional(),
  details:         z.record(z.string()).optional(),
}).passthrough();
export type AdminEventRepresentation = z.infer<typeof AdminEventRepresentationSchema>;

/**
 * EventRepresentation — événement utilisateur du realm.
 * Retourné par GET /events.
 */
export const EventRepresentationSchema = z.object({
  id:        z.string().optional(),
  time:      z.number().optional(),                 // Long int64 epoch ms
  type:      z.string().optional(),                 // ex: 'LOGIN', 'LOGOUT', 'REGISTER', 'LOGIN_ERROR'
  realmId:   z.string().optional(),
  clientId:  z.string().optional(),
  userId:    z.string().optional(),
  sessionId: z.string().optional(),
  ipAddress: z.string().optional(),
  error:     z.string().optional(),
  details:   z.record(z.string()).optional(),
}).passthrough();
export type EventRepresentation = z.infer<typeof EventRepresentationSchema>;

/**
 * RealmEventsConfigRepresentation — configuration du provider d'événements.
 * GET/PUT /events/config.
 */
export const RealmEventsConfigRepresentationSchema = z.object({
  eventsEnabled:           z.boolean().optional(),
  eventsExpiration:        z.number().optional(),   // Long int64 — durée de rétention en secondes
  eventsListeners:         z.array(z.string()).optional(),
  enabledEventTypes:       z.array(z.string()).optional(),
  adminEventsEnabled:      z.boolean().optional(),
  adminEventsDetailsEnabled: z.boolean().optional(),
}).passthrough();
export type RealmEventsConfigRepresentation = z.infer<typeof RealmEventsConfigRepresentationSchema>;

/**
 * KeyMetadataRepresentation — métadonnées d'une clé cryptographique du realm.
 */
export const KeyMetadataRepresentationSchema = z.object({
  providerId:       z.string().optional(),
  providerPriority: z.number().optional(),     // Long int64
  kid:              z.string().optional(),      // Key ID
  status:           z.string().optional(),      // 'ACTIVE' | 'PASSIVE' | 'DISABLED'
  type:             z.string().optional(),      // 'RSA' | 'EC' | 'OKP' | 'AES' | 'HMAC'
  algorithm:        z.string().optional(),      // 'RS256' | 'PS256' | 'ES256' | etc.
  publicKey:        z.string().optional(),
  certificate:      z.string().optional(),
  use:              z.enum(['SIG', 'ENC']).optional(),
  validTo:          z.number().optional(),      // Long int64 epoch ms
}).passthrough();
export type KeyMetadataRepresentation = z.infer<typeof KeyMetadataRepresentationSchema>;

/**
 * KeysMetadataRepresentation — ensemble des clés actives du realm.
 * Retourné par GET /keys.
 */
export const KeysMetadataRepresentationSchema = z.object({
  active: z.record(z.string()).optional(),                         // Map<algorithm, kid>
  keys:   z.array(KeyMetadataRepresentationSchema).optional(),
}).passthrough();
export type KeysMetadataRepresentation = z.infer<typeof KeysMetadataRepresentationSchema>;

/**
 * GlobalRequestResult — résultat d'opérations broadcast (logout-all, push-revocation).
 */
export const GlobalRequestResultSchema = z.object({
  successRequests: z.array(z.string()).optional(),
  failedRequests:  z.array(z.string()).optional(),
}).passthrough();
export type GlobalRequestResult = z.infer<typeof GlobalRequestResultSchema>;

/**
 * ManagementPermissionReference — fine-grained authorization.
 */
export const ManagementPermissionReferenceSchema = z.object({
  enabled:          z.boolean().optional(),
  resource:         z.string().optional(),
  scopePermissions: z.record(z.string()).optional(),
}).passthrough();
export type ManagementPermissionReference = z.infer<typeof ManagementPermissionReferenceSchema>;

// ────────────────────────────────────────────────────────────
// CLIENT POLICIES & PROFILES
// ────────────────────────────────────────────────────────────

export const ClientPolicyConditionRepresentationSchema = z.object({
  condition:         z.string().optional(),
  configuration:     z.record(z.unknown()).optional(),
}).passthrough();

export const ClientPolicyExecutorRepresentationSchema = z.object({
  executor:          z.string().optional(),
  configuration:     z.record(z.unknown()).optional(),
}).passthrough();

export const ClientProfileRepresentationSchema = z.object({
  name:        z.string().optional(),
  description: z.string().optional(),
  executors:   z.array(ClientPolicyExecutorRepresentationSchema).optional(),
}).passthrough();
export type ClientProfileRepresentation = z.infer<typeof ClientProfileRepresentationSchema>;

export const ClientPolicyRepresentationSchema = z.object({
  name:        z.string().optional(),
  description: z.string().optional(),
  enabled:     z.boolean().optional(),
  conditions:  z.array(ClientPolicyConditionRepresentationSchema).optional(),
  profiles:    z.array(z.string()).optional(),
}).passthrough();
export type ClientPolicyRepresentation = z.infer<typeof ClientPolicyRepresentationSchema>;

/**
 * ClientProfilesRepresentation — GET/PUT /client-policies/profiles.
 */
export const ClientProfilesRepresentationSchema = z.object({
  profiles:       z.array(ClientProfileRepresentationSchema).optional(),
  globalProfiles: z.array(ClientProfileRepresentationSchema).optional(),
}).passthrough();
export type ClientProfilesRepresentation = z.infer<typeof ClientProfilesRepresentationSchema>;

/**
 * ClientPoliciesRepresentation — GET/PUT /client-policies/policies.
 */
export const ClientPoliciesRepresentationSchema = z.object({
  policies:       z.array(ClientPolicyRepresentationSchema).optional(),
  globalPolicies: z.array(ClientPolicyRepresentationSchema).optional(),
}).passthrough();
export type ClientPoliciesRepresentation = z.infer<typeof ClientPoliciesRepresentationSchema>;

// ────────────────────────────────────────────────────────────
// CLIENT TYPES
// ────────────────────────────────────────────────────────────

export const ClientTypeRepresentationSchema = z.object({
  name:       z.string().optional(),
  provider:   z.string().optional(),
  parents:    z.array(z.string()).optional(),
  config:     z.record(z.unknown()).optional(),
  attributes: z.record(z.unknown()).optional(),
}).passthrough();
export type ClientTypeRepresentation = z.infer<typeof ClientTypeRepresentationSchema>;

/**
 * ClientTypesRepresentation — GET/PUT /client-types.
 */
export const ClientTypesRepresentationSchema = z.object({
  realmClientTypes:  z.array(ClientTypeRepresentationSchema).optional(),
  globalClientTypes: z.array(ClientTypeRepresentationSchema).optional(),
}).passthrough();
export type ClientTypesRepresentation = z.infer<typeof ClientTypesRepresentationSchema>;

// ────────────────────────────────────────────────────────────
// REPRÉSENTATION PRINCIPALE DU REALM
// ────────────────────────────────────────────────────────────

/**
 * RealmRepresentation — modèle complet d'un realm Keycloak 26.6.1.
 * Couvre TOUS les champs retournés par GET /admin/realms/{realm}.
 * Utilisé pour GET, POST (création), PUT (mise à jour).
 *
 * Note : les champs users, clients, roles etc. sont ignorés lors d'un PUT
 * (Keycloak ne met à jour que les attributs top-level du realm).
 */
export const RealmRepresentationSchema = z.object({

  // ── Identité ────────────────────────────────────────────
  id:                           z.string().optional(),   // UUID interne
  realm:                        z.string().optional(),   // Nom unique du realm
  displayName:                  z.string().optional(),
  displayNameHtml:              z.string().optional(),
  keycloakVersion:              z.string().optional(),

  // ── Tokens & Lifespans ──────────────────────────────────
  notBefore:                             z.number().int().optional(),  // int32
  defaultSignatureAlgorithm:             z.string().optional(),        // 'RS256' | 'PS256' | etc.
  revokeRefreshToken:                    z.boolean().optional(),
  refreshTokenMaxReuse:                  z.number().int().optional(),  // int32
  accessTokenLifespan:                   z.number().int().optional(),  // int32 secondes
  accessTokenLifespanForImplicitFlow:    z.number().int().optional(),  // int32 secondes
  ssoSessionIdleTimeout:                 z.number().int().optional(),  // int32 secondes
  ssoSessionMaxLifespan:                 z.number().int().optional(),  // int32 secondes
  ssoSessionIdleTimeoutRememberMe:       z.number().int().optional(),  // int32 secondes
  ssoSessionMaxLifespanRememberMe:       z.number().int().optional(),  // int32 secondes
  offlineSessionIdleTimeout:             z.number().int().optional(),  // int32 secondes
  offlineSessionMaxLifespanEnabled:      z.boolean().optional(),
  offlineSessionMaxLifespan:             z.number().int().optional(),  // int32 secondes
  clientSessionIdleTimeout:             z.number().int().optional(),  // int32 secondes
  clientSessionMaxLifespan:             z.number().int().optional(),  // int32 secondes
  clientOfflineSessionIdleTimeout:       z.number().int().optional(),  // int32 secondes
  clientOfflineSessionMaxLifespan:       z.number().int().optional(),  // int32 secondes
  accessCodeLifespan:                    z.number().int().optional(),  // int32 secondes
  accessCodeLifespanUserAction:          z.number().int().optional(),  // int32 secondes
  accessCodeLifespanLogin:               z.number().int().optional(),  // int32 secondes
  actionTokenGeneratedByAdminLifespan:   z.number().int().optional(),  // int32 secondes
  actionTokenGeneratedByUserLifespan:    z.number().int().optional(),  // int32 secondes
  oauth2DeviceCodeLifespan:              z.number().int().optional(),  // int32 secondes
  oauth2DevicePollingInterval:           z.number().int().optional(),  // int32 secondes

  // ── Général & Accès ─────────────────────────────────────
  enabled:                        z.boolean().optional(),
  sslRequired:                    z.string().optional(),  // 'none' | 'external' | 'all'
  registrationAllowed:            z.boolean().optional(),
  registrationEmailAsUsername:    z.boolean().optional(),
  rememberMe:                     z.boolean().optional(),
  verifyEmail:                    z.boolean().optional(),
  loginWithEmailAllowed:          z.boolean().optional(),
  duplicateEmailsAllowed:         z.boolean().optional(),
  resetPasswordAllowed:           z.boolean().optional(),
  editUsernameAllowed:            z.boolean().optional(),
  userManagedAccessAllowed:       z.boolean().optional(),
  organizationsEnabled:           z.boolean().optional(),
  adminPermissionsEnabled:        z.boolean().optional(),
  verifiableCredentialsEnabled:   z.boolean().optional(),
  scimApiEnabled:                 z.boolean().optional(),

  // ── Cache ────────────────────────────────────────────────
  userCacheEnabled:  z.boolean().optional(),
  realmCacheEnabled: z.boolean().optional(),

  // ── Brute Force Protection ──────────────────────────────
  bruteForceProtected:              z.boolean().optional(),
  permanentLockout:                 z.boolean().optional(),
  maxTemporaryLockouts:             z.number().int().optional(),  // int32
  bruteForceStrategy:               z.string().optional(),       // 'MULTIPLE_FAILURE' | 'LINEAR_LOCKOUT'
  maxFailureWaitSeconds:            z.number().int().optional(),  // int32
  minimumQuickLoginWaitSeconds:     z.number().int().optional(),  // int32
  waitIncrementSeconds:             z.number().int().optional(),  // int32
  quickLoginCheckMilliSeconds:      z.number().optional(),        // Long int64
  maxDeltaTimeSeconds:              z.number().int().optional(),  // int32
  failureFactor:                    z.number().int().optional(),  // int32
  maxSecondaryAuthFailures:         z.number().int().optional(),  // int32

  // ── Cryptographie ────────────────────────────────────────
  privateKey:  z.string().optional(),
  publicKey:   z.string().optional(),
  certificate: z.string().optional(),
  codeSecret:  z.string().optional(),

  // ── Password Policy ──────────────────────────────────────
  passwordPolicy: z.string().optional(),  // ex: "length(8) and digits(1)"

  // ── OTP ─────────────────────────────────────────────────
  otpPolicyType:            z.string().optional(),   // 'totp' | 'hotp'
  otpPolicyAlgorithm:       z.string().optional(),   // 'HmacSHA1' | 'HmacSHA256' | 'HmacSHA512'
  otpPolicyInitialCounter:  z.number().int().optional(),  // int32
  otpPolicyDigits:          z.number().int().optional(),  // int32
  otpPolicyLookAheadWindow: z.number().int().optional(),  // int32
  otpPolicyPeriod:          z.number().int().optional(),  // int32
  otpPolicyCodeReusable:    z.boolean().optional(),
  otpSupportedApplications: z.array(z.string()).optional(),

  // ── WebAuthn (standard) ──────────────────────────────────
  webAuthnPolicyRpEntityName:                      z.string().optional(),
  webAuthnPolicySignatureAlgorithms:               z.array(z.string()).optional(),
  webAuthnPolicyRpId:                              z.string().optional(),
  webAuthnPolicyAttestationConveyancePreference:   z.string().optional(),
  webAuthnPolicyAuthenticatorAttachment:           z.string().optional(),
  webAuthnPolicyRequireResidentKey:                z.string().optional(),
  webAuthnPolicyUserVerificationRequirement:       z.string().optional(),
  webAuthnPolicyCreateTimeout:                     z.number().int().optional(),  // int32
  webAuthnPolicyAvoidSameAuthenticatorRegister:    z.boolean().optional(),
  webAuthnPolicyAcceptableAaguids:                 z.array(z.string()).optional(),
  webAuthnPolicyExtraOrigins:                      z.array(z.string()).optional(),

  // ── WebAuthn Passwordless ────────────────────────────────
  webAuthnPolicyPasswordlessRpEntityName:                    z.string().optional(),
  webAuthnPolicyPasswordlessSignatureAlgorithms:             z.array(z.string()).optional(),
  webAuthnPolicyPasswordlessRpId:                            z.string().optional(),
  webAuthnPolicyPasswordlessAttestationConveyancePreference: z.string().optional(),
  webAuthnPolicyPasswordlessAuthenticatorAttachment:         z.string().optional(),
  webAuthnPolicyPasswordlessRequireResidentKey:              z.string().optional(),
  webAuthnPolicyPasswordlessUserVerificationRequirement:     z.string().optional(),
  webAuthnPolicyPasswordlessCreateTimeout:                   z.number().int().optional(),  // int32
  webAuthnPolicyPasswordlessAvoidSameAuthenticatorRegister:  z.boolean().optional(),
  webAuthnPolicyPasswordlessAcceptableAaguids:               z.array(z.string()).optional(),
  webAuthnPolicyPasswordlessExtraOrigins:                    z.array(z.string()).optional(),
  webAuthnPolicyPasswordlessPasskeysEnabled:                 z.boolean().optional(),

  // ── Thèmes ──────────────────────────────────────────────
  loginTheme:   z.string().optional(),
  accountTheme: z.string().optional(),
  adminTheme:   z.string().optional(),
  emailTheme:   z.string().optional(),

  // ── Internationalisation ────────────────────────────────
  internationalizationEnabled: z.boolean().optional(),
  supportedLocales:            z.array(z.string()).optional(),
  defaultLocale:               z.string().optional(),
  localizationTexts:           z.record(z.record(z.string())).optional(),

  // ── SMTP ─────────────────────────────────────────────────
  smtpServer: z.record(z.string()).optional(),   // Map<String,String> — host, port, auth, ssl, etc.

  // ── Browser Security Headers ─────────────────────────────
  browserSecurityHeaders: z.record(z.string()).optional(),

  // ── Événements ──────────────────────────────────────────
  eventsEnabled:             z.boolean().optional(),
  eventsExpiration:          z.number().optional(),        // Long int64
  eventsListeners:           z.array(z.string()).optional(),
  enabledEventTypes:         z.array(z.string()).optional(),
  adminEventsEnabled:        z.boolean().optional(),
  adminEventsDetailsEnabled: z.boolean().optional(),

  // ── Flux d'authentification ──────────────────────────────
  browserFlow:              z.string().optional(),
  registrationFlow:         z.string().optional(),
  directGrantFlow:          z.string().optional(),
  resetCredentialsFlow:     z.string().optional(),
  clientAuthenticationFlow: z.string().optional(),
  dockerAuthenticationFlow: z.string().optional(),
  firstBrokerLoginFlow:     z.string().optional(),

  // ── Scopes par défaut ────────────────────────────────────
  defaultDefaultClientScopes:   z.array(z.string()).optional(),
  defaultOptionalClientScopes:  z.array(z.string()).optional(),

  // ── Rôles & Groupes ─────────────────────────────────────
  defaultRoles:  z.array(z.string()).optional(),
  defaultGroups: z.array(z.string()).optional(),
  defaultRole:   z.record(z.unknown()).optional(),  // RoleRepresentation

  // ── Attributs custom ────────────────────────────────────
  attributes:    z.record(z.string()).optional(),

  // ── Client Policies ─────────────────────────────────────
  clientProfiles: ClientProfilesRepresentationSchema.optional(),
  clientPolicies: ClientPoliciesRepresentationSchema.optional(),

  // ── Credentials ─────────────────────────────────────────
  requiredCredentials:           z.array(z.string()).optional(),
  passwordCredentialGrantAllowed: z.boolean().optional(),

  // ── Données complètes (export/import) ───────────────────
  // Ces champs sont présents lors d'un export complet mais ignorés lors d'un PUT
  users:                z.array(z.record(z.unknown())).optional(),
  federatedUsers:       z.array(z.record(z.unknown())).optional(),
  clients:              z.array(z.record(z.unknown())).optional(),
  clientScopes:         z.array(z.record(z.unknown())).optional(),
  roles:                z.record(z.unknown()).optional(),            // RolesRepresentation
  groups:               z.array(z.record(z.unknown())).optional(),
  scopeMappings:        z.array(z.record(z.unknown())).optional(),
  clientScopeMappings:  z.record(z.unknown()).optional(),
  identityProviders:    z.array(z.record(z.unknown())).optional(),
  identityProviderMappers: z.array(z.record(z.unknown())).optional(),
  protocolMappers:      z.array(z.record(z.unknown())).optional(),
  components:           z.record(z.unknown()).optional(),
  authenticationFlows:  z.array(z.record(z.unknown())).optional(),
  authenticatorConfig:  z.array(z.record(z.unknown())).optional(),
  requiredActions:      z.array(z.record(z.unknown())).optional(),
  userFederationProviders: z.array(z.record(z.unknown())).optional(),
  userFederationMappers:   z.array(z.record(z.unknown())).optional(),
  organizations:        z.array(z.record(z.unknown())).optional(),
  adminPermissionsClient: z.record(z.unknown()).optional(),

  // ── Divers legacy ────────────────────────────────────────
  social:                              z.boolean().optional(),
  updateProfileOnInitialSocialLogin:   z.boolean().optional(),
  socialProviders:                     z.record(z.string()).optional(),
}).passthrough();
export type RealmRepresentation = z.infer<typeof RealmRepresentationSchema>;

// ────────────────────────────────────────────────────────────
// SCHÉMAS DE COLLECTIONS
// ────────────────────────────────────────────────────────────

export const RealmListSchema             = z.array(RealmRepresentationSchema);
export const AdminEventListSchema        = z.array(AdminEventRepresentationSchema);
export const EventListSchema             = z.array(EventRepresentationSchema);
export const KeyMetadataListSchema       = z.array(KeyMetadataRepresentationSchema);
export const LocaleListSchema            = z.array(z.string());
export const ClientSessionStatsSchema    = z.array(z.record(z.string()));
export const CredentialRegistratorsSchema= z.array(z.string());

// ────────────────────────────────────────────────────────────
// PAYLOADS D'ENTRÉE (input validation)
// ────────────────────────────────────────────────────────────

/**
 * CreateRealmPayload — POST /admin/realms
 * Importe/crée un realm complet. `realm` (nom) est obligatoire et doit être unique.
 */
export const CreateRealmPayloadSchema = z.object({
  realm:       z.string().min(1, 'Le nom du realm est obligatoire'),
  displayName: z.string().optional(),
  enabled:     z.boolean().optional().default(true),
  // Tous les autres champs de RealmRepresentation sont acceptés
}).passthrough();
export type CreateRealmPayload = z.infer<typeof CreateRealmPayloadSchema>;

/**
 * UpdateRealmPayload — PUT /admin/realms/{realm}
 * Met à jour les attributs top-level du realm.
 * Users, clients, rôles et groupes inclus dans le payload sont ignorés par Keycloak.
 */
export const UpdateRealmPayloadSchema = RealmRepresentationSchema;
export type UpdateRealmPayload = RealmRepresentation;

/**
 * UpdateEventsConfigPayload — PUT /admin/realms/{realm}/events/config
 */
export const UpdateEventsConfigPayloadSchema = RealmEventsConfigRepresentationSchema;
export type UpdateEventsConfigPayload = RealmEventsConfigRepresentation;

/**
 * LocalizationImportPayload — POST /admin/realms/{realm}/localization/{locale}
 * Corps = Map<String, String> (JSON object clé → traduction).
 */
export const LocalizationImportPayloadSchema = z.record(z.string());
export type LocalizationImportPayload = z.infer<typeof LocalizationImportPayloadSchema>;

/**
 * SmtpTestPayload — POST /admin/realms/{realm}/testSMTPConnection
 * Corps = Map<String, String> (config SMTP à tester).
 */
export const SmtpTestPayloadSchema = z.record(z.string());
export type SmtpTestPayload = z.infer<typeof SmtpTestPayloadSchema>;

// ────────────────────────────────────────────────────────────
// FILTRES / QUERY PARAMS
// ────────────────────────────────────────────────────────────

/**
 * AdminEventsFilters — Query params pour GET /admin/realms/{realm}/admin-events
 */
export const AdminEventsFiltersSchema = z.object({
  authClient:     z.string().optional(),
  authIpAddress:  z.string().optional(),
  authRealm:      z.string().optional(),
  authUser:       z.string().optional(),    // user id
  dateFrom:       z.string().optional(),    // yyyy-MM-dd ou epoch ms
  dateTo:         z.string().optional(),    // yyyy-MM-dd ou epoch ms
  direction:      z.enum(['asc', 'desc']).optional(),
  first:          z.number().int().min(0).optional(),
  max:            z.number().int().min(1).optional(),
  operationTypes: z.array(z.string()).optional(),
  resourcePath:   z.string().optional(),
  resourceTypes:  z.array(z.string()).optional(),
}).strict();
export type AdminEventsFilters = z.infer<typeof AdminEventsFiltersSchema>;

/**
 * EventsFilters — Query params pour GET /admin/realms/{realm}/events
 */
export const EventsFiltersSchema = z.object({
  client:     z.string().optional(),      // App ou oauth client name
  dateFrom:   z.string().optional(),      // yyyy-MM-dd ou epoch ms
  dateTo:     z.string().optional(),
  direction:  z.enum(['asc', 'desc']).optional(),
  first:      z.number().int().min(0).optional(),
  ipAddress:  z.string().optional(),
  max:        z.number().int().min(1).optional(),
  type:       z.array(z.string()).optional(),   // ex: ['LOGIN', 'LOGOUT']
  user:       z.string().optional(),           // user id
}).strict();
export type EventsFilters = z.infer<typeof EventsFiltersSchema>;

/**
 * PartialExportFilters — Query params pour POST /admin/realms/{realm}/partial-export
 */
export const PartialExportFiltersSchema = z.object({
  exportClients:          z.boolean().optional(),
  exportGroupsAndRoles:   z.boolean().optional(),
}).strict();
export type PartialExportFilters = z.infer<typeof PartialExportFiltersSchema>;

/**
 * LocalizationGetFilters — Query params pour GET /admin/realms/{realm}/localization/{locale}
 */
export const LocalizationGetFiltersSchema = z.object({
  useRealmDefaultLocaleFallback: z.boolean().optional(),
}).strict();
export type LocalizationGetFilters = z.infer<typeof LocalizationGetFiltersSchema>;

/**
 * SessionDeleteOptions — Query params pour DELETE /admin/realms/{realm}/sessions/{session}
 */
export const SessionDeleteOptionsSchema = z.object({
  isOffline: z.boolean().optional(),
}).strict();
export type SessionDeleteOptions = z.infer<typeof SessionDeleteOptionsSchema>;

/**
 * ClientPoliciesGetFilters — Query params pour GET /client-policies/policies|profiles
 */
export const ClientPoliciesGetFiltersSchema = z.object({
  'include-global-policies': z.boolean().optional(),
}).strict();
export type ClientPoliciesGetFilters = z.infer<typeof ClientPoliciesGetFiltersSchema>;

export const ClientProfilesGetFiltersSchema = z.object({
  'include-global-profiles': z.boolean().optional(),
}).strict();
export type ClientProfilesGetFilters = z.infer<typeof ClientProfilesGetFiltersSchema>;
