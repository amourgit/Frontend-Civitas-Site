// ============================================================
// lib/models/iam/keycloak-user.model.ts
// Schémas Zod — Module Utilisateurs Keycloak Admin REST API v26
// Source: Keycloak Admin REST API (26.6.1)
// Endpoints: /admin/realms/{realm}/users/*
// ============================================================

import { z } from 'zod';

// ── Credential Representation ────────────────────────────────
export const CredentialRepresentationSchema = z.object({
  id:             z.string().optional(),
  type:           z.string().optional(),
  userLabel:      z.string().optional(),
  createdDate:    z.number().optional(),          // Long (int64)
  secretData:     z.string().optional(),
  credentialData: z.string().optional(),
  priority:       z.number().int().optional(),    // int32
  value:          z.string().optional(),
  temporary:      z.boolean().optional(),
  device:         z.string().optional(),
  hashedSaltedValue: z.string().optional(),
  salt:           z.string().optional(),
  hashIterations: z.number().int().optional(),
  counter:        z.number().int().optional(),
  algorithm:      z.string().optional(),
  digits:         z.number().int().optional(),
  period:         z.number().int().optional(),
  config:         z.record(z.unknown()).optional(),
  federationLink: z.string().optional(),
}).passthrough();
export type CredentialRepresentation = z.infer<typeof CredentialRepresentationSchema>;

// ── Federated Identity Representation ───────────────────────
export const FederatedIdentityRepresentationSchema = z.object({
  identityProvider: z.string().optional(),
  userId:           z.string().optional(),
  userName:         z.string().optional(),
}).passthrough();
export type FederatedIdentityRepresentation = z.infer<typeof FederatedIdentityRepresentationSchema>;

// ── User Consent Representation ──────────────────────────────
export const UserConsentRepresentationSchema = z.object({
  clientId:             z.string().optional(),
  grantedClientScopes:  z.array(z.string()).optional(),
  createdDate:          z.number().optional(),   // Long int64
  lastUpdatedDate:      z.number().optional(),   // Long int64
  grantedRealmRoles:    z.array(z.string()).optional(),
}).passthrough();
export type UserConsentRepresentation = z.infer<typeof UserConsentRepresentationSchema>;

// ── Social Link Representation ───────────────────────────────
export const SocialLinkRepresentationSchema = z.object({
  socialProvider: z.string().optional(),
  socialUserId:   z.string().optional(),
  socialUsername: z.string().optional(),
}).passthrough();
export type SocialLinkRepresentation = z.infer<typeof SocialLinkRepresentationSchema>;

// ── User Profile Attribute Metadata ─────────────────────────
export const UserProfileAttributeGroupMetadataSchema = z.object({
  name:               z.string().optional(),
  displayHeader:      z.string().optional(),
  displayDescription: z.string().optional(),
  annotations:        z.record(z.unknown()).optional(),
}).passthrough();

export const UserProfileAttributeMetadataSchema = z.object({
  name:         z.string().optional(),
  displayName:  z.string().optional(),
  required:     z.boolean().optional(),
  readOnly:     z.boolean().optional(),
  annotations:  z.record(z.unknown()).optional(),
  validators:   z.record(z.record(z.unknown())).optional(),
  group:        z.string().optional(),
  multivalued:  z.boolean().optional(),
  defaultValue: z.string().optional(),
}).passthrough();

export const UserProfileMetadataSchema = z.object({
  attributes: z.array(UserProfileAttributeMetadataSchema).optional(),
  groups:     z.array(UserProfileAttributeGroupMetadataSchema).optional(),
}).passthrough();
export type UserProfileMetadata = z.infer<typeof UserProfileMetadataSchema>;

// ── User Representation (principal) ─────────────────────────
// GET /admin/realms/{realm}/users/{user-id}
// POST /admin/realms/{realm}/users (body)
// PUT  /admin/realms/{realm}/users/{user-id} (body)
export const UserRepresentationSchema = z.object({
  id:                       z.string().optional(),
  username:                 z.string().optional(),
  firstName:                z.string().optional(),
  lastName:                 z.string().optional(),
  email:                    z.string().email().optional().or(z.literal('')),
  emailVerified:            z.boolean().optional(),
  attributes:               z.record(z.array(z.string())).optional(),
  userProfileMetadata:      UserProfileMetadataSchema.optional(),
  enabled:                  z.boolean().optional(),
  self:                     z.string().optional(),
  origin:                   z.string().optional(),
  createdTimestamp:         z.number().optional(),    // Long int64
  totp:                     z.boolean().optional(),
  federationLink:           z.string().optional(),
  serviceAccountClientId:   z.string().optional(),
  credentials:              z.array(CredentialRepresentationSchema).optional(),
  disableableCredentialTypes: z.array(z.string()).optional(),
  requiredActions:          z.array(z.string()).optional(),
  federatedIdentities:      z.array(FederatedIdentityRepresentationSchema).optional(),
  realmRoles:               z.array(z.string()).optional(),
  clientRoles:              z.record(z.array(z.unknown())).optional(),
  clientConsents:           z.array(UserConsentRepresentationSchema).optional(),
  notBefore:                z.number().int().optional(),
  applicationRoles:         z.record(z.array(z.unknown())).optional(),
  socialLinks:              z.array(SocialLinkRepresentationSchema).optional(),
  groups:                   z.array(z.string()).optional(),
  access:                   z.record(z.boolean()).optional(),
}).passthrough();
export type UserRepresentation = z.infer<typeof UserRepresentationSchema>;

// ── User Session Representation ──────────────────────────────
// GET /admin/realms/{realm}/users/{user-id}/sessions
// GET /admin/realms/{realm}/users/{user-id}/offline-sessions/{clientUuid}
export const UserSessionRepresentationSchema = z.object({
  id:            z.string().optional(),
  username:      z.string().optional(),
  userId:        z.string().optional(),
  ipAddress:     z.string().optional(),
  start:         z.number().optional(),    // Long int64
  lastAccess:    z.number().optional(),    // Long int64
  rememberMe:    z.boolean().optional(),
  clients:       z.record(z.string()).optional(),
  transientUser: z.boolean().optional(),
}).passthrough();
export type UserSessionRepresentation = z.infer<typeof UserSessionRepresentationSchema>;

// ── Group Representation (pour user groups) ──────────────────
export const GroupRepresentationSchema = z.object({
  id:            z.string().optional(),
  name:          z.string().optional(),
  description:   z.string().optional(),
  path:          z.string().optional(),
  parentId:      z.string().optional(),
  subGroupCount: z.number().optional(),
  subGroups:     z.array(z.lazy(() => GroupRepresentationSchema)).optional(),
  attributes:    z.record(z.array(z.unknown())).optional(),
  realmRoles:    z.array(z.string()).optional(),
  clientRoles:   z.record(z.array(z.unknown())).optional(),
  access:        z.record(z.boolean()).optional(),
}).passthrough();
export type GroupRepresentation = z.infer<typeof GroupRepresentationSchema>;

// ── UP Config (User Profile Config) ─────────────────────────
export const UPAttributePermissionsSchema = z.object({
  view: z.array(z.string()).optional(),
  edit: z.array(z.string()).optional(),
}).passthrough();

export const UPAttributeRequiredSchema = z.object({
  roles:  z.array(z.string()).optional(),
  scopes: z.array(z.string()).optional(),
}).passthrough();

export const UPAttributeSelectorSchema = z.object({
  scopes: z.array(z.string()).optional(),
}).passthrough();

export const UPAttributeSchema = z.object({
  name:         z.string().optional(),
  displayName:  z.string().optional(),
  validations:  z.record(z.record(z.unknown())).optional(),
  annotations:  z.record(z.unknown()).optional(),
  required:     UPAttributeRequiredSchema.optional(),
  permissions:  UPAttributePermissionsSchema.optional(),
  selector:     UPAttributeSelectorSchema.optional(),
  group:        z.string().optional(),
  multivalued:  z.boolean().optional(),
  defaultValue: z.string().optional(),
}).passthrough();
export type UPAttribute = z.infer<typeof UPAttributeSchema>;

export const UPGroupSchema = z.object({
  name:               z.string().optional(),
  displayHeader:      z.string().optional(),
  displayDescription: z.string().optional(),
  annotations:        z.record(z.unknown()).optional(),
}).passthrough();

export const UPConfigSchema = z.object({
  attributes:               z.array(UPAttributeSchema).optional(),
  groups:                   z.array(UPGroupSchema).optional(),
  unmanagedAttributePolicy: z.string().optional(),
}).passthrough();
export type UPConfig = z.infer<typeof UPConfigSchema>;

// ── Schémas de création / mise à jour ───────────────────────

/**
 * Payload pour créer un utilisateur Keycloak.
 * POST /admin/realms/{realm}/users
 */
export const CreateUserPayloadSchema = z.object({
  username:       z.string().min(1, 'Le nom d\'utilisateur est requis'),
  firstName:      z.string().optional(),
  lastName:       z.string().optional(),
  email:          z.string().email('Email invalide').optional().or(z.literal('')),
  emailVerified:  z.boolean().optional().default(false),
  enabled:        z.boolean().optional().default(true),
  attributes:     z.record(z.array(z.string())).optional(),
  credentials:    z.array(CredentialRepresentationSchema).optional(),
  requiredActions: z.array(z.string()).optional(),
  groups:         z.array(z.string()).optional(),
  realmRoles:     z.array(z.string()).optional(),
  clientRoles:    z.record(z.array(z.string())).optional(),
});
export type CreateUserPayload = z.infer<typeof CreateUserPayloadSchema>;

/**
 * Payload pour modifier un utilisateur Keycloak.
 * PUT /admin/realms/{realm}/users/{user-id}
 */
export const UpdateUserPayloadSchema = z.object({
  username:       z.string().min(1).optional(),
  firstName:      z.string().optional(),
  lastName:       z.string().optional(),
  email:          z.string().email().optional().or(z.literal('')),
  emailVerified:  z.boolean().optional(),
  enabled:        z.boolean().optional(),
  attributes:     z.record(z.array(z.string())).optional(),
  requiredActions: z.array(z.string()).optional(),
  notBefore:      z.number().int().optional(),
}).passthrough();
export type UpdateUserPayload = z.infer<typeof UpdateUserPayloadSchema>;

/**
 * Payload pour reset password.
 * PUT /admin/realms/{realm}/users/{user-id}/reset-password
 */
export const ResetPasswordPayloadSchema = z.object({
  type:      z.string().default('password'),
  value:     z.string().min(1, 'Le mot de passe est requis'),
  temporary: z.boolean().optional().default(false),
});
export type ResetPasswordPayload = z.infer<typeof ResetPasswordPayloadSchema>;

/**
 * Payload pour execute-actions-email.
 * PUT /admin/realms/{realm}/users/{user-id}/execute-actions-email
 */
export const ExecuteActionsEmailPayloadSchema = z.object({
  actions:      z.array(z.string()).min(1, 'Au moins une action requise'),
  client_id:    z.string().optional(),
  redirect_uri: z.string().url().optional().or(z.literal('')),
  lifespan:     z.number().int().positive().optional(),
});
export type ExecuteActionsEmailPayload = z.infer<typeof ExecuteActionsEmailPayloadSchema>;

// ── Filtres de liste des utilisateurs ───────────────────────
// GET /admin/realms/{realm}/users
// GET /admin/realms/{realm}/users/count
export const UsersListFiltersSchema = z.object({
  briefRepresentation: z.boolean().optional(),
  createdAfter:        z.string().optional(),   // ISO-8601 ou epoch ms
  createdBefore:       z.string().optional(),
  email:               z.string().optional(),
  emailVerified:       z.boolean().optional(),
  enabled:             z.boolean().optional(),
  exact:               z.boolean().optional(),
  first:               z.number().int().min(0).optional(),
  firstName:           z.string().optional(),
  idpAlias:            z.string().optional(),
  idpUserId:           z.string().optional(),
  lastName:            z.string().optional(),
  max:                 z.number().int().min(1).max(2000).optional(),
  q:                   z.string().optional(),   // custom attrs: "key1:val1 key2:val2"
  search:              z.string().optional(),
  username:            z.string().optional(),
});
export type UsersListFilters = z.infer<typeof UsersListFiltersSchema>;

// ── Required Actions disponibles ────────────────────────────
export const REQUIRED_ACTIONS = [
  'VERIFY_EMAIL',
  'UPDATE_PROFILE',
  'CONFIGURE_TOTP',
  'UPDATE_PASSWORD',
  'TERMS_AND_CONDITIONS',
  'UPDATE_USER_LOCALE',
  'webauthn-register',
  'webauthn-register-passwordless',
  'delete-account',
  'VERIFY_PROFILE',
] as const;
export type RequiredAction = typeof REQUIRED_ACTIONS[number];

// ── Réponses schémas ─────────────────────────────────────────
export const UserListSchema        = z.array(UserRepresentationSchema);
export const UserCountSchema       = z.number().int().nonnegative();
export const CredentialListSchema  = z.array(CredentialRepresentationSchema);
export const SessionListSchema     = z.array(UserSessionRepresentationSchema);
export const GroupListSchema       = z.array(GroupRepresentationSchema);
export const GroupCountSchema      = z.object({ count: z.number() }).passthrough();
export const StringListSchema      = z.array(z.string());
export const UnmanagedAttrsSchema  = z.record(z.array(z.string()));
export const ImpersonationSchema   = z.record(z.unknown());

export type UserList       = z.infer<typeof UserListSchema>;
export type SessionList    = z.infer<typeof SessionListSchema>;
export type GroupList      = z.infer<typeof GroupListSchema>;
