// ============================================================
// lib/models/iam/keycloak-client.model.ts
// Schémas Zod — Module Clients Keycloak Admin REST API v26
// Source: Keycloak Admin REST API (26.6.1)
// Endpoints: /admin/realms/{realm}/clients/*
//            /admin/realms/{realm}/clients-initial-access/*
// ============================================================

import { z } from 'zod';

// ────────────────────────────────────────────────────────────
// PRIMITIVES PARTAGÉES
// ────────────────────────────────────────────────────────────

/**
 * RoleRepresentation — partagée avec le module groupes.
 * Réexportée ici pour que keycloakClientsService soit autonome.
 */
export const RoleRepresentationSchema = z.object({
  id:                 z.string().optional(),
  name:               z.string().optional(),
  description:        z.string().optional(),
  scopeParamRequired: z.boolean().optional(),
  composite:          z.boolean().optional(),
  composites:         z.record(z.unknown()).optional(),
  clientRole:         z.boolean().optional(),
  containerId:        z.string().optional(),
  attributes:         z.record(z.array(z.string())).optional(),
}).passthrough();
export type RoleRepresentation = z.infer<typeof RoleRepresentationSchema>;

/**
 * ProtocolMapperRepresentation — mappers de protocole d'un client.
 */
export const ProtocolMapperRepresentationSchema = z.object({
  id:              z.string().optional(),
  name:            z.string().optional(),
  protocol:        z.string().optional(),   // 'openid-connect' | 'saml'
  protocolMapper:  z.string().optional(),   // type de mapper (ex: 'oidc-usermodel-property-mapper')
  consentRequired: z.boolean().optional(),
  config:          z.record(z.string()).optional(),
}).passthrough();
export type ProtocolMapperRepresentation = z.infer<typeof ProtocolMapperRepresentationSchema>;

/**
 * ClientScopeRepresentation — scope client (default ou optional).
 */
export const ClientScopeRepresentationSchema = z.object({
  id:              z.string().optional(),
  name:            z.string().optional(),
  description:     z.string().optional(),
  protocol:        z.string().optional(),
  attributes:      z.record(z.string()).optional(),
  protocolMappers: z.array(ProtocolMapperRepresentationSchema).optional(),
}).passthrough();
export type ClientScopeRepresentation = z.infer<typeof ClientScopeRepresentationSchema>;

/**
 * CredentialRepresentation — secret client (type: 'Secret').
 */
export const CredentialRepresentationSchema = z.object({
  id:             z.string().optional(),
  type:           z.string().optional(),
  userLabel:      z.string().optional(),
  createdDate:    z.number().optional(),       // Long int64
  secretData:     z.string().optional(),
  credentialData: z.string().optional(),
  priority:       z.number().int().optional(), // int32
  value:          z.string().optional(),
  temporary:      z.boolean().optional(),
}).passthrough();
export type CredentialRepresentation = z.infer<typeof CredentialRepresentationSchema>;

/**
 * CertificateRepresentation — certificat client (JWT auth, etc.).
 */
export const CertificateRepresentationSchema = z.object({
  privateKey:   z.string().optional(),
  publicKey:    z.string().optional(),
  certificate:  z.string().optional(),
  kid:          z.string().optional(),
}).passthrough();
export type CertificateRepresentation = z.infer<typeof CertificateRepresentationSchema>;

/**
 * ManagementPermissionReference — fine-grained authorization.
 */
export const ManagementPermissionReferenceSchema = z.object({
  enabled:          z.boolean().optional(),
  resource:         z.string().optional(),
  scopePermissions: z.record(z.string()).optional(),
}).passthrough();
export type ManagementPermissionReference = z.infer<typeof ManagementPermissionReferenceSchema>;

/**
 * GlobalRequestResult — résultat des opérations cluster (push-revocation, test-nodes).
 */
export const GlobalRequestResultSchema = z.object({
  successRequests: z.number().int().optional(),
  failedRequests:  z.number().int().optional(),
}).passthrough();
export type GlobalRequestResult = z.infer<typeof GlobalRequestResultSchema>;

/**
 * UserSessionRepresentation — sessions utilisateur actives / offline.
 */
export const UserSessionRepresentationSchema = z.object({
  id:            z.string().optional(),
  username:      z.string().optional(),
  userId:        z.string().optional(),
  ipAddress:     z.string().optional(),
  start:         z.number().optional(),     // Long int64
  lastAccess:    z.number().optional(),     // Long int64
  rememberMe:    z.boolean().optional(),
  clients:       z.record(z.string()).optional(),
  transientUser: z.boolean().optional(),
}).passthrough();
export type UserSessionRepresentation = z.infer<typeof UserSessionRepresentationSchema>;

// ────────────────────────────────────────────────────────────
// AUTHORIZATION — RESOURCE SERVER
// ────────────────────────────────────────────────────────────

/**
 * ScopeRepresentation — scope d'autorisation (authz).
 */
export const ScopeRepresentationSchema = z.object({
  id:          z.string().optional(),
  name:        z.string().optional(),
  displayName: z.string().optional(),
  iconUri:     z.string().optional(),
  policies:    z.array(z.lazy(() => PolicyRepresentationSchema)).optional(),
  resources:   z.array(z.lazy(() => ResourceRepresentationSchema)).optional(),
}).passthrough();
export type ScopeRepresentation = z.infer<typeof ScopeRepresentationSchema>;

/**
 * ResourceRepresentationOwner — propriétaire d'une ressource authz.
 */
export const ResourceRepresentationOwnerSchema = z.object({
  id:   z.string().optional(),
  name: z.string().optional(),
}).passthrough();
export type ResourceRepresentationOwner = z.infer<typeof ResourceRepresentationOwnerSchema>;

/**
 * ResourceRepresentation — ressource authz.
 */
export const ResourceRepresentationSchema: z.ZodType<ResourceRepresentation> = z.lazy(() =>
  z.object({
    _id:         z.string().optional(),
    name:        z.string().optional(),
    displayName: z.string().optional(),
    type:        z.string().optional(),
    uris:        z.array(z.string()).optional(),
    icon_uri:    z.string().optional(),
    owner:       ResourceRepresentationOwnerSchema.optional(),
    ownerManagedAccess: z.boolean().optional(),
    attributes:  z.record(z.array(z.string())).optional(),
    scopes:      z.array(ScopeRepresentationSchema).optional(),
    typedScopes: z.array(ScopeRepresentationSchema).optional(),
  }).passthrough()
);

export interface ResourceRepresentation {
  _id?:         string;
  name?:        string;
  displayName?: string;
  type?:        string;
  uris?:        string[];
  icon_uri?:    string;
  owner?:       ResourceRepresentationOwner;
  ownerManagedAccess?: boolean;
  attributes?:  Record<string, string[]>;
  scopes?:      ScopeRepresentation[];
  typedScopes?: ScopeRepresentation[];
  [key: string]: unknown;
}

/**
 * AbstractPolicyRepresentation / PolicyRepresentation
 * Couvre tous les types de politique (role, js, time, user, aggregated, etc.).
 */
export const PolicyRepresentationSchema: z.ZodType<PolicyRepresentation> = z.lazy(() =>
  z.object({
    id:               z.string().optional(),
    name:             z.string().optional(),
    description:      z.string().optional(),
    type:             z.string().optional(),  // 'role' | 'js' | 'time' | 'user' | 'aggregated' | 'scope' | 'resource' | 'client' | 'group' | 'regex'
    policies:         z.array(z.string()).optional(),  // IDs des sous-politiques
    resources:        z.array(z.string()).optional(),  // IDs des ressources
    scopes:           z.array(z.string()).optional(),  // IDs des scopes
    logic:            z.enum(['POSITIVE', 'NEGATIVE']).optional(),
    decisionStrategy: z.enum(['UNANIMOUS', 'AFFIRMATIVE', 'CONSENSUS']).optional(),
    owner:            z.string().optional(),
    resourcesData:    z.array(ResourceRepresentationSchema).optional(),
    scopesData:       z.array(ScopeRepresentationSchema).optional(),
    config:           z.record(z.string()).optional(),
    permission:       z.boolean().optional(),
  }).passthrough()
);

export interface PolicyRepresentation {
  id?:               string;
  name?:             string;
  description?:      string;
  type?:             string;
  policies?:         string[];
  resources?:        string[];
  scopes?:           string[];
  logic?:            'POSITIVE' | 'NEGATIVE';
  decisionStrategy?: 'UNANIMOUS' | 'AFFIRMATIVE' | 'CONSENSUS';
  owner?:            string;
  resourcesData?:    ResourceRepresentation[];
  scopesData?:       ScopeRepresentation[];
  config?:           Record<string, string>;
  permission?:       boolean;
  [key: string]:     unknown;
}

/**
 * PolicyProviderRepresentation — fournisseur de politique.
 */
export const PolicyProviderRepresentationSchema = z.object({
  type:  z.string().optional(),
  name:  z.string().optional(),
  group: z.string().optional(),
}).passthrough();
export type PolicyProviderRepresentation = z.infer<typeof PolicyProviderRepresentationSchema>;

/**
 * ResourceServerRepresentation — configuration du serveur de ressources authz.
 */
export const ResourceServerRepresentationSchema = z.object({
  id:                  z.string().optional(),
  clientId:            z.string().optional(),
  name:                z.string().optional(),
  allowRemoteResourceManagement: z.boolean().optional(),
  policyEnforcementMode: z.enum(['ENFORCING', 'PERMISSIVE', 'DISABLED']).optional(),
  resources:           z.array(ResourceRepresentationSchema).optional(),
  policies:            z.array(PolicyRepresentationSchema).optional(),
  scopes:              z.array(ScopeRepresentationSchema).optional(),
  decisionStrategy:    z.enum(['UNANIMOUS', 'AFFIRMATIVE', 'CONSENSUS']).optional(),
}).passthrough();
export type ResourceServerRepresentation = z.infer<typeof ResourceServerRepresentationSchema>;

/**
 * PolicyEvaluationRequest — corps de POST .../permission/evaluate et .../policy/evaluate.
 */
export const PolicyEvaluationRequestSchema = z.object({
  roleIds:       z.array(z.string()).optional(),
  clientId:      z.string().optional(),
  userId:        z.string().optional(),
  context:       z.record(z.unknown()).optional(),
  resources:     z.array(ResourceRepresentationSchema).optional(),
  entitlements:  z.boolean().optional(),
}).passthrough();
export type PolicyEvaluationRequest = z.infer<typeof PolicyEvaluationRequestSchema>;

/**
 * PolicyEvaluationResponse — réponse de POST .../evaluate.
 */
export const PolicyEvaluationResponseSchema = z.object({
  results:    z.array(z.record(z.unknown())).optional(),
  entitlements: z.boolean().optional(),
  status:     z.string().optional(),
}).passthrough();
export type PolicyEvaluationResponse = z.infer<typeof PolicyEvaluationResponseSchema>;

// ────────────────────────────────────────────────────────────
// CLIENT INITIAL ACCESS
// ────────────────────────────────────────────────────────────

/**
 * ClientInitialAccessPresentation — token d'accès initial (enregistrement client dynamique).
 */
export const ClientInitialAccessPresentationSchema = z.object({
  id:             z.string().optional(),
  token:          z.string().optional(),
  timestamp:      z.number().int().optional(),  // epoch seconds
  expiration:     z.number().int().optional(),  // secondes depuis timestamp
  count:          z.number().int().optional(),  // utilisations restantes
  remainingCount: z.number().int().optional(),
}).passthrough();
export type ClientInitialAccessPresentation = z.infer<typeof ClientInitialAccessPresentationSchema>;

/**
 * ClientInitialAccessCreatePresentation — payload de création d'un token d'accès initial.
 */
export const ClientInitialAccessCreatePresentationSchema = z.object({
  expiration: z.number().int().optional(),  // durée de vie en secondes
  count:      z.number().int().optional(),  // nombre d'utilisations autorisées
}).passthrough();
export type ClientInitialAccessCreatePresentation = z.infer<typeof ClientInitialAccessCreatePresentationSchema>;

// ────────────────────────────────────────────────────────────
// REPRÉSENTATION PRINCIPALE CLIENT
// ────────────────────────────────────────────────────────────

/**
 * ClientRepresentation — modèle principal d'un client Keycloak.
 * Couvre tous les champs retournés par GET /clients et GET /clients/{uuid}.
 */
export const ClientRepresentationSchema = z.object({
  // Identité
  id:                            z.string().optional(),   // UUID interne (pas le clientId !)
  clientId:                      z.string().optional(),   // Identifiant textuel unique
  name:                          z.string().optional(),
  description:                   z.string().optional(),
  type:                          z.string().optional(),   // 'public' | 'confidential' | 'bearer-only' (KC 26)

  // URLs & Redirections
  rootUrl:                       z.string().optional(),
  adminUrl:                      z.string().optional(),
  baseUrl:                       z.string().optional(),
  redirectUris:                  z.array(z.string()).optional(),
  webOrigins:                    z.array(z.string()).optional(),

  // Protocole
  protocol:                      z.string().optional(),  // 'openid-connect' | 'saml'
  protocolMappers:               z.array(ProtocolMapperRepresentationSchema).optional(),

  // Flags d'accès
  enabled:                       z.boolean().optional(),
  alwaysDisplayInConsole:        z.boolean().optional(),
  publicClient:                  z.boolean().optional(),
  bearerOnly:                    z.boolean().optional(),
  consentRequired:               z.boolean().optional(),
  standardFlowEnabled:           z.boolean().optional(),
  implicitFlowEnabled:           z.boolean().optional(),
  directAccessGrantsEnabled:     z.boolean().optional(),
  serviceAccountsEnabled:        z.boolean().optional(),
  // ── IMPORTANT: Keycloak 26 ClientRepresentation officielle ──
  // Champs directs reconnus (source: openapi.json + PDF REST API 30/04/2026)
  // Le Device Authorization Grant n'est PAS un champ direct.
  // Il est géré via attributes["oauth2.device.authorization.grant.enabled"]
  // Ref: https://github.com/keycloak/keycloak/issues/25649
  surrogateAuthRequired:                 z.boolean().optional(),
  bearerOnly:                            z.boolean().optional(),
  consentRequired:                       z.boolean().optional(),
  directGrantsOnly:                      z.boolean().optional(),
  notBefore:                             z.number().optional(),
  nodeReRegistrationTimeout:             z.number().optional(),
  registrationAccessToken:               z.string().optional(),
  defaultRoles:                          z.array(z.string()).optional(),
  origin:                                z.string().optional(),
  clientTemplate:                        z.string().optional(),
  useTemplateConfig:                     z.boolean().optional(),
  useTemplateScope:                      z.boolean().optional(),
  useTemplateMappers:                    z.boolean().optional(),
  authorizationServicesEnabled:  z.boolean().optional(),
  frontchannelLogout:            z.boolean().optional(),
  fullScopeAllowed:              z.boolean().optional(),
  surrogateAuthRequired:         z.boolean().optional(),

  // Tokens
  notBefore:                     z.number().int().optional(),
  nodeReRegistrationTimeout:     z.number().int().optional(),

  // Credentials & Secrets
  secret:                        z.string().optional(),
  registrationAccessToken:       z.string().optional(),
  clientAuthenticatorType:       z.string().optional(),  // 'client-secret' | 'client-jwt' | etc.

  // Scopes
  defaultClientScopes:           z.array(z.string()).optional(),
  optionalClientScopes:          z.array(z.string()).optional(),

  // Roles
  defaultRoles:                  z.array(z.string()).optional(),

  // Attributs
  attributes:                    z.record(z.string()).optional(),

  // Cluster
  registeredNodes:               z.record(z.number().int()).optional(),  // Map<String, Integer>

  // Authorization
  authorizationSettings:         ResourceServerRepresentationSchema.optional(),

  // Accès admin
  access:                        z.record(z.boolean()).optional(),

  // Divers
  origin:                        z.string().optional(),
}).passthrough();
export type ClientRepresentation = z.infer<typeof ClientRepresentationSchema>;

// ────────────────────────────────────────────────────────────
// SCHÉMAS DE COLLECTIONS
// ────────────────────────────────────────────────────────────

export const ClientListSchema                     = z.array(ClientRepresentationSchema);
export const ClientScopeListSchema                = z.array(ClientScopeRepresentationSchema);
export const ProtocolMapperListSchema             = z.array(ProtocolMapperRepresentationSchema);
export const RoleListSchema                       = z.array(RoleRepresentationSchema);
export const UserSessionListSchema                = z.array(UserSessionRepresentationSchema);
export const PolicyListSchema                     = z.array(PolicyRepresentationSchema);
export const ResourceListSchema                   = z.array(ResourceRepresentationSchema);
export const ScopeListSchema                      = z.array(ScopeRepresentationSchema);
export const PolicyProviderListSchema             = z.array(PolicyProviderRepresentationSchema);
export const ClientInitialAccessListSchema        = z.array(ClientInitialAccessPresentationSchema);

/** Map<String, Long> → { count: N } */
export const CountSchema = z.object({ count: z.number().int() }).passthrough();
export type Count = z.infer<typeof CountSchema>;

// ────────────────────────────────────────────────────────────
// EVALUATE SCOPES
// ────────────────────────────────────────────────────────────

/**
 * ProtocolMapperEvaluationRepresentation — retourné par evaluate-scopes/protocol-mappers.
 */
export const ProtocolMapperEvaluationRepresentationSchema = z.object({
  mapperId:          z.string().optional(),
  mapperName:        z.string().optional(),
  containerId:       z.string().optional(),
  containerName:     z.string().optional(),
  containerType:     z.string().optional(),
  protocolMapper:    z.string().optional(),
}).passthrough();
export type ProtocolMapperEvaluationRepresentation = z.infer<typeof ProtocolMapperEvaluationRepresentationSchema>;

// ────────────────────────────────────────────────────────────
// KEYSTORE CONFIG (Certificats)
// ────────────────────────────────────────────────────────────

/**
 * KeyStoreConfig — config pour télécharger/générer un keystore.
 */
export const KeyStoreConfigSchema = z.object({
  format:           z.string().optional(),     // 'JKS' | 'PKCS12'
  keyAlias:         z.string().optional(),
  keyPassword:      z.string().optional(),
  realmAlias:       z.string().optional(),
  realmCertificate: z.boolean().optional(),
  storePassword:    z.string().optional(),
}).passthrough();
export type KeyStoreConfig = z.infer<typeof KeyStoreConfigSchema>;

// ────────────────────────────────────────────────────────────
// PAYLOADS D'ENTRÉE (input validation)
// ────────────────────────────────────────────────────────────

/**
 * CreateClientPayload — POST /admin/realms/{realm}/clients
 * clientId est obligatoire et doit être unique dans le realm.
 */
export const CreateClientPayloadSchema = z.object({
  clientId:                      z.string().min(1, 'Le clientId est obligatoire'),
  name:                          z.string().optional(),
  description:                   z.string().optional(),
  type:                          z.string().optional(),
  protocol:                      z.string().optional().default('openid-connect'),
  enabled:                       z.boolean().optional().default(true),
  publicClient:                  z.boolean().optional(),
  bearerOnly:                    z.boolean().optional(),
  consentRequired:               z.boolean().optional(),
  standardFlowEnabled:           z.boolean().optional(),
  implicitFlowEnabled:           z.boolean().optional(),
  directAccessGrantsEnabled:     z.boolean().optional(),
  serviceAccountsEnabled:                    z.boolean().optional(),
  authorizationServicesEnabled:              z.boolean().optional(),
  // Device Authorization Grant → géré via attributes, pas champ direct
  // attributes["oauth2.device.authorization.grant.enabled"] = "true"/"false"
  alwaysDisplayInConsole:                    z.boolean().optional(),
  frontchannelLogout:                        z.boolean().optional(),
  fullScopeAllowed:                          z.boolean().optional(),
  rootUrl:                                   z.string().optional(),
  adminUrl:                                  z.string().optional(),
  baseUrl:                                   z.string().optional(),
  redirectUris:                              z.array(z.string()).optional(),
  webOrigins:                                z.array(z.string()).optional(),
  clientAuthenticatorType:                   z.string().optional(),
  secret:                                    z.string().optional(),
  defaultClientScopes:                       z.array(z.string()).optional(),
  optionalClientScopes:                      z.array(z.string()).optional(),
  attributes:                                z.record(z.string()).optional(),
  authenticationFlowBindingOverrides:        z.record(z.string()).optional(),
});
export type CreateClientPayload = z.infer<typeof CreateClientPayloadSchema>;

/**
 * UpdateClientPayload — PUT /admin/realms/{realm}/clients/{client-uuid}
 * Tous les champs sont optionnels. id est recommandé pour cohérence.
 */
export const UpdateClientPayloadSchema = CreateClientPayloadSchema.partial().extend({
  id: z.string().optional(),
});
export type UpdateClientPayload = z.infer<typeof UpdateClientPayloadSchema>;

/**
 * CreateRolePayload — POST /admin/realms/{realm}/clients/{uuid}/roles
 */
export const CreateRolePayloadSchema = z.object({
  name:        z.string().min(1, 'Le nom du rôle est obligatoire'),
  description: z.string().optional(),
  composite:   z.boolean().optional(),
  clientRole:  z.boolean().optional().default(true),
  attributes:  z.record(z.array(z.string())).optional(),
});
export type CreateRolePayload = z.infer<typeof CreateRolePayloadSchema>;

/**
 * UpdateRolePayload — PUT /admin/realms/{realm}/clients/{uuid}/roles/{role-name}
 */
export const UpdateRolePayloadSchema = CreateRolePayloadSchema.partial().extend({
  id: z.string().optional(),
});
export type UpdateRolePayload = z.infer<typeof UpdateRolePayloadSchema>;

/**
 * CreateProtocolMapperPayload — POST .../protocol-mappers/models
 */
export const CreateProtocolMapperPayloadSchema = z.object({
  name:            z.string().min(1, 'Le nom du mapper est obligatoire'),
  protocol:        z.string().min(1),
  protocolMapper:  z.string().min(1),
  consentRequired: z.boolean().optional(),
  config:          z.record(z.string()).optional(),
});
export type CreateProtocolMapperPayload = z.infer<typeof CreateProtocolMapperPayloadSchema>;

/**
 * UpdateProtocolMapperPayload — PUT .../protocol-mappers/models/{id}
 */
export const UpdateProtocolMapperPayloadSchema = CreateProtocolMapperPayloadSchema.partial().extend({
  id: z.string().optional(),
});
export type UpdateProtocolMapperPayload = z.infer<typeof UpdateProtocolMapperPayloadSchema>;

// ────────────────────────────────────────────────────────────
// FILTRES / QUERY PARAMS
// ────────────────────────────────────────────────────────────

/**
 * ClientsListFilters — Query params pour GET /admin/realms/{realm}/clients
 */
export const ClientsListFiltersSchema = z.object({
  /** Filtre par clientId (textuel) */
  clientId:     z.string().optional(),
  /** Pagination — index du premier élément */
  first:        z.number().int().min(0).optional(),
  /** Pagination — nombre maximum de résultats */
  max:          z.number().int().min(1).optional(),
  /** Recherche par attributs : format "key:value" */
  q:            z.string().optional(),
  /** Si true, recherche par clientId au lieu de filtre exact */
  search:       z.boolean().optional(),
  /** Si true, n'inclut que les clients visibles par l'admin courant */
  viewableOnly: z.boolean().optional(),
}).strict();
export type ClientsListFilters = z.infer<typeof ClientsListFiltersSchema>;

/**
 * ClientRolesFilters — Query params pour GET .../roles
 */
export const ClientRolesFiltersSchema = z.object({
  briefRepresentation: z.boolean().optional(),
  first:               z.number().int().min(0).optional(),
  max:                 z.number().int().min(1).optional(),
  search:              z.string().optional(),
}).strict();
export type ClientRolesFilters = z.infer<typeof ClientRolesFiltersSchema>;

/**
 * ClientRoleUsersFilters — Query params pour GET .../roles/{role-name}/users et /groups
 */
export const ClientRoleUsersFiltersSchema = z.object({
  briefRepresentation: z.boolean().optional(),
  first:               z.number().int().min(0).optional(),
  max:                 z.number().int().min(1).optional(),
}).strict();
export type ClientRoleUsersFilters = z.infer<typeof ClientRoleUsersFiltersSchema>;

/**
 * SessionFilters — Query params pour GET .../user-sessions et offline-sessions
 */
export const SessionFiltersSchema = z.object({
  first: z.number().int().min(0).optional(),
  max:   z.number().int().min(1).optional(),
}).strict();
export type SessionFilters = z.infer<typeof SessionFiltersSchema>;

/**
 * EvaluateScopesFilters — Query params pour generate-example-*
 */
export const EvaluateScopesFiltersSchema = z.object({
  userId:   z.string().optional(),
  scope:    z.string().optional(),
  audience: z.string().optional(),
}).strict();
export type EvaluateScopesFilters = z.infer<typeof EvaluateScopesFiltersSchema>;

/**
 * AuthzResourceFilters — Query params pour GET .../authz/resource-server/resource
 */
export const AuthzResourceFiltersSchema = z.object({
  id:           z.string().optional(),
  deep:         z.boolean().optional(),
  exactName:    z.boolean().optional(),
  first:        z.number().int().min(0).optional(),
  matchingUri:  z.boolean().optional(),
  max:          z.number().int().min(1).optional(),
  name:         z.string().optional(),
  owner:        z.string().optional(),
  scope:        z.string().optional(),
  type:         z.string().optional(),
  uri:          z.string().optional(),
}).strict();
export type AuthzResourceFilters = z.infer<typeof AuthzResourceFiltersSchema>;

/**
 * AuthzPolicyFilters — Query params pour GET .../authz/resource-server/policy|permission
 */
export const AuthzPolicyFiltersSchema = z.object({
  fields:       z.string().optional(),
  first:        z.number().int().min(0).optional(),
  max:          z.number().int().min(1).optional(),
  name:         z.string().optional(),
  owner:        z.string().optional(),
  permission:   z.boolean().optional(),
  policyId:     z.string().optional(),
  resource:     z.string().optional(),
  resourceType: z.string().optional(),
  scope:        z.string().optional(),
  type:         z.string().optional(),
}).strict();
export type AuthzPolicyFilters = z.infer<typeof AuthzPolicyFiltersSchema>;

/**
 * AuthzScopeFilters — Query params pour GET .../authz/resource-server/scope
 */
export const AuthzScopeFiltersSchema = z.object({
  deep:  z.boolean().optional(),
  first: z.number().int().min(0).optional(),
  max:   z.number().int().min(1).optional(),
  name:  z.string().optional(),
}).strict();
export type AuthzScopeFilters = z.infer<typeof AuthzScopeFiltersSchema>;
