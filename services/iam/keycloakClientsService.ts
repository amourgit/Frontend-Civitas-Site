// ============================================================
// services/iam/keycloakClientsService.ts
// Service complet — Gestion des Clients Keycloak Admin REST API v26
//
// Couvre TOUS les endpoints /admin/realms/{realm}/clients/*
// et /admin/realms/{realm}/clients-initial-access/*
// selon la documentation officielle Keycloak 26.6.1
//
// Endpoints couverts (88 au total) :
//
// ── CRUD CLIENT ──────────────────────────────────────────────
//   GET    /clients                                           → list()
//   POST   /clients                                           → create()
//   GET    /clients/{uuid}                                    → getById()
//   PUT    /clients/{uuid}                                    → update()
//   DELETE /clients/{uuid}                                    → delete()
//
// ── SECRET CLIENT ────────────────────────────────────────────
//   GET    /clients/{uuid}/client-secret                      → getSecret()
//   POST   /clients/{uuid}/client-secret                      → regenerateSecret()
//   GET    /clients/{uuid}/client-secret/rotated              → getRotatedSecret()
//   DELETE /clients/{uuid}/client-secret/rotated              → invalidateRotatedSecret()
//
// ── REGISTRATION ACCESS TOKEN ─────────────────────────────
//   POST   /clients/{uuid}/registration-access-token          → regenerateRegistrationToken()
//
// ── INSTALLATION / CONFIGURATION ─────────────────────────────
//   GET    /clients/{uuid}/installation/providers/{id}        → getInstallationProvider()
//
// ── MANAGEMENT PERMISSIONS ───────────────────────────────────
//   GET    /clients/{uuid}/management/permissions             → getManagementPermissions()
//   PUT    /clients/{uuid}/management/permissions             → setManagementPermissions()
//
// ── SCOPES CLIENT (DEFAULT & OPTIONAL) ───────────────────────
//   GET    /clients/{uuid}/default-client-scopes              → listDefaultClientScopes()
//   PUT    /clients/{uuid}/default-client-scopes/{scopeId}    → addDefaultClientScope()
//   DELETE /clients/{uuid}/default-client-scopes/{scopeId}    → removeDefaultClientScope()
//   GET    /clients/{uuid}/optional-client-scopes             → listOptionalClientScopes()
//   PUT    /clients/{uuid}/optional-client-scopes/{scopeId}   → addOptionalClientScope()
//   DELETE /clients/{uuid}/optional-client-scopes/{scopeId}   → removeOptionalClientScope()
//
// ── EVALUATE SCOPES ──────────────────────────────────────────
//   GET    /clients/{uuid}/evaluate-scopes/generate-example-access-token → generateExampleAccessToken()
//   GET    /clients/{uuid}/evaluate-scopes/generate-example-id-token     → generateExampleIdToken()
//   GET    /clients/{uuid}/evaluate-scopes/generate-example-userinfo     → generateExampleUserinfo()
//   GET    /clients/{uuid}/evaluate-scopes/protocol-mappers              → listEvaluatedProtocolMappers()
//   GET    /clients/{uuid}/evaluate-scopes/scope-mappings/{roleContainerId}/granted     → getGrantedScopeMappings()
//   GET    /clients/{uuid}/evaluate-scopes/scope-mappings/{roleContainerId}/not-granted → getNotGrantedScopeMappings()
//
// ── PROTOCOL MAPPERS ─────────────────────────────────────────
//   GET    /clients/{uuid}/protocol-mappers/models            → listProtocolMappers()
//   GET    /clients/{uuid}/protocol-mappers/models/{id}       → getProtocolMapper()
//   POST   /clients/{uuid}/protocol-mappers/models            → createProtocolMapper()
//   PUT    /clients/{uuid}/protocol-mappers/models/{id}       → updateProtocolMapper()
//   DELETE /clients/{uuid}/protocol-mappers/models/{id}       → deleteProtocolMapper()
//   POST   /clients/{uuid}/protocol-mappers/add-models        → createProtocolMappers()
//   GET    /clients/{uuid}/protocol-mappers/protocol/{proto}  → listProtocolMappersByProtocol()
//
// ── SCOPE MAPPINGS ───────────────────────────────────────────
//   GET    /clients/{uuid}/scope-mappings                     → listScopeMappings()
//   GET    /clients/{uuid}/scope-mappings/realm               → listRealmScopeMappings()
//   GET    /clients/{uuid}/scope-mappings/realm/available     → listAvailableRealmScopeMappings()
//   GET    /clients/{uuid}/scope-mappings/realm/composite     → listCompositeRealmScopeMappings()
//   POST   /clients/{uuid}/scope-mappings/realm               → addRealmScopeMappings()
//   DELETE /clients/{uuid}/scope-mappings/realm               → removeRealmScopeMappings()
//   GET    /clients/{uuid}/scope-mappings/clients/{client}    → listClientScopeMappings()
//   GET    /clients/{uuid}/scope-mappings/clients/{client}/available  → listAvailableClientScopeMappings()
//   GET    /clients/{uuid}/scope-mappings/clients/{client}/composite  → listCompositeClientScopeMappings()
//   POST   /clients/{uuid}/scope-mappings/clients/{client}    → addClientScopeMappings()
//   DELETE /clients/{uuid}/scope-mappings/clients/{client}    → removeClientScopeMappings()
//
// ── ROLES CLIENT ─────────────────────────────────────────────
//   GET    /clients/{uuid}/roles                              → listRoles()
//   POST   /clients/{uuid}/roles                              → createRole()
//   GET    /clients/{uuid}/roles/{role-name}                  → getRole()
//   PUT    /clients/{uuid}/roles/{role-name}                  → updateRole()
//   DELETE /clients/{uuid}/roles/{role-name}                  → deleteRole()
//   GET    /clients/{uuid}/roles/{role-name}/composites       → listRoleComposites()
//   POST   /clients/{uuid}/roles/{role-name}/composites       → addRoleComposites()
//   DELETE /clients/{uuid}/roles/{role-name}/composites       → removeRoleComposites()
//   GET    /clients/{uuid}/roles/{role-name}/composites/realm                   → listRoleRealmComposites()
//   GET    /clients/{uuid}/roles/{role-name}/composites/clients/{targetUuid}    → listRoleClientComposites()
//   GET    /clients/{uuid}/roles/{role-name}/users            → listRoleUsers()
//   GET    /clients/{uuid}/roles/{role-name}/groups           → listRoleGroups()
//   GET    /clients/{uuid}/roles/{role-name}/management/permissions → getRoleManagementPermissions()
//   PUT    /clients/{uuid}/roles/{role-name}/management/permissions → setRoleManagementPermissions()
//
// ── SESSIONS ────────────────────────────────────────────────
//   GET    /clients/{uuid}/user-sessions                      → listUserSessions()
//   GET    /clients/{uuid}/session-count                      → getSessionCount()
//   GET    /clients/{uuid}/offline-sessions                   → listOfflineSessions()
//   GET    /clients/{uuid}/offline-session-count              → getOfflineSessionCount()
//
// ── SERVICE ACCOUNT ──────────────────────────────────────────
//   GET    /clients/{uuid}/service-account-user               → getServiceAccountUser()
//
// ── CLUSTER NODES ────────────────────────────────────────────
//   POST   /clients/{uuid}/nodes                              → registerNode()
//   DELETE /clients/{uuid}/nodes/{node}                       → unregisterNode()
//   GET    /clients/{uuid}/test-nodes-available               → testNodesAvailable()
//
// ── PUSH REVOCATION ──────────────────────────────────────────
//   POST   /clients/{uuid}/push-revocation                    → pushRevocation()
//
// ── CERTIFICATS ──────────────────────────────────────────────
//   GET    /clients/{uuid}/certificates/{attr}                → getCertificate()
//   POST   /clients/{uuid}/certificates/{attr}/generate       → generateCertificate()
//   POST   /clients/{uuid}/certificates/{attr}/generate-and-download → generateAndDownloadCertificate()
//   POST   /clients/{uuid}/certificates/{attr}/download       → downloadCertificate()
//   POST   /clients/{uuid}/certificates/{attr}/upload         → uploadCertificate()
//   POST   /clients/{uuid}/certificates/{attr}/upload-certificate → uploadCertificateOnly()
//
// ── AUTHORIZATION (RESOURCE SERVER) ──────────────────────────
//   GET    /clients/{uuid}/authz/resource-server              → getResourceServer()
//   PUT    /clients/{uuid}/authz/resource-server              → updateResourceServer()
//   POST   /clients/{uuid}/authz/resource-server/import       → importResourceServer()
//   GET    /clients/{uuid}/authz/resource-server/settings     → getResourceServerSettings()
//   GET    /clients/{uuid}/authz/resource-server/resource     → listResources()
//   POST   /clients/{uuid}/authz/resource-server/resource     → createResource()
//   GET    /clients/{uuid}/authz/resource-server/resource/search → searchResource()
//   GET    /clients/{uuid}/authz/resource-server/resource/{id}  → getResource()
//   PUT    /clients/{uuid}/authz/resource-server/resource/{id}  → updateResource()
//   DELETE /clients/{uuid}/authz/resource-server/resource/{id}  → deleteResource()
//   GET    /clients/{uuid}/authz/resource-server/resource/{id}/attributes → getResourceAttributes()
//   GET    /clients/{uuid}/authz/resource-server/resource/{id}/permissions → listResourcePermissions()
//   GET    /clients/{uuid}/authz/resource-server/resource/{id}/scopes      → listResourceScopes()
//   GET    /clients/{uuid}/authz/resource-server/scope        → listScopes()
//   POST   /clients/{uuid}/authz/resource-server/scope        → createScope()
//   GET    /clients/{uuid}/authz/resource-server/scope/search → searchScope()
//   GET    /clients/{uuid}/authz/resource-server/scope/{id}   → getScope()
//   PUT    /clients/{uuid}/authz/resource-server/scope/{id}   → updateScope()
//   DELETE /clients/{uuid}/authz/resource-server/scope/{id}   → deleteScope()
//   GET    /clients/{uuid}/authz/resource-server/scope/{id}/permissions → listScopePermissions()
//   GET    /clients/{uuid}/authz/resource-server/scope/{id}/resources    → listScopeResources()
//   GET    /clients/{uuid}/authz/resource-server/policy       → listPolicies()
//   POST   /clients/{uuid}/authz/resource-server/policy       → createPolicy()
//   GET    /clients/{uuid}/authz/resource-server/policy/search → searchPolicy()
//   GET    /clients/{uuid}/authz/resource-server/policy/providers → listPolicyProviders()
//   POST   /clients/{uuid}/authz/resource-server/policy/evaluate → evaluatePolicy()
//   GET    /clients/{uuid}/authz/resource-server/permission   → listPermissions()
//   POST   /clients/{uuid}/authz/resource-server/permission   → createPermission()
//   GET    /clients/{uuid}/authz/resource-server/permission/search   → searchPermission()
//   GET    /clients/{uuid}/authz/resource-server/permission/providers → listPermissionProviders()
//   POST   /clients/{uuid}/authz/resource-server/permission/evaluate  → evaluatePermission()
//
// ── CLIENT INITIAL ACCESS ─────────────────────────────────────
//   GET    /clients-initial-access                            → listInitialAccess()
//   POST   /clients-initial-access                            → createInitialAccess()
//   DELETE /clients-initial-access/{id}                       → deleteInitialAccess()
//
// Authentification : Bearer token via httpClient (tokenManager)
// Base URL         : NEXT_PUBLIC_KEYCLOAK_URL + /admin/realms/{realm}
// ============================================================

import { z }          from 'zod';
import { httpClient } from '@/lib/http-client';
import { adminBase as _adminBaseResolver } from './_realmHelper';
import {
  // Schémas
  ClientRepresentationSchema,
  ClientListSchema,
  ClientScopeListSchema,
  ProtocolMapperListSchema,
  ProtocolMapperRepresentationSchema,
  RoleRepresentationSchema,
  RoleListSchema,
  UserSessionListSchema,
  UserSessionRepresentationSchema,
  PolicyListSchema,
  PolicyRepresentationSchema,
  ResourceListSchema,
  ResourceRepresentationSchema,
  ScopeListSchema,
  ScopeRepresentationSchema,
  PolicyProviderListSchema,
  ResourceServerRepresentationSchema,
  ClientInitialAccessListSchema,
  ClientInitialAccessPresentationSchema,
  ManagementPermissionReferenceSchema,
  CertificateRepresentationSchema,
  CredentialRepresentationSchema,
  GlobalRequestResultSchema,
  CountSchema,
  ProtocolMapperEvaluationRepresentationSchema,
  // Types
  type ClientRepresentation,
  type ClientScopeRepresentation,
  type ProtocolMapperRepresentation,
  type RoleRepresentation,
  type UserSessionRepresentation,
  type PolicyRepresentation,
  type ResourceRepresentation,
  type ScopeRepresentation,
  type PolicyProviderRepresentation,
  type ResourceServerRepresentation,
  type ClientInitialAccessPresentation,
  type ClientInitialAccessCreatePresentation,
  type ManagementPermissionReference,
  type CertificateRepresentation,
  type CredentialRepresentation,
  type GlobalRequestResult,
  type PolicyEvaluationRequest,
  type PolicyEvaluationResponse,
  type KeyStoreConfig,
  type CreateClientPayload,
  type UpdateClientPayload,
  type CreateRolePayload,
  type UpdateRolePayload,
  type CreateProtocolMapperPayload,
  type UpdateProtocolMapperPayload,
  type ClientsListFilters,
  type ClientRolesFilters,
  type ClientRoleUsersFilters,
  type SessionFilters,
  type EvaluateScopesFilters,
  type AuthzResourceFilters,
  type AuthzPolicyFilters,
  type AuthzScopeFilters,
} from '@/lib/models/iam/keycloak-client.model';

// ── URL de base Keycloak ──────────────────────────────────────

/**
 * Retourne l'URL Admin REST API — realm extrait dynamiquement du sous-domaine.
 */
function adminBase(realm?: string): string {
  return _adminBaseResolver(realm);
}

// ── Helper de parsing sécurisé ────────────────────────────────
function safe<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  return data as T;
}

// ── Wrapper interne ───────────────────────────────────────────
const kc = {
  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    return httpClient.get<T>(url, params);
  },
  async post<T>(url: string, body: unknown): Promise<T> {
    return httpClient.post<T>(url, body);
  },
  async put<T>(url: string, body: unknown): Promise<T> {
    return httpClient.put<T>(url, body);
  },
  async delete<T>(url: string): Promise<T> {
    return httpClient.delete<T>(url);
  },
};

/** DELETE avec body (scope-mappings, role composites). */
async function deleteWithBody(url: string, body: unknown): Promise<void> {
  const res = await httpClient.fetch(url, {
    method: 'DELETE',
    body:   JSON.stringify(body),
  });
  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(typeof err.detail === 'string' ? err.detail : res.statusText);
  }
}

// ── Extraction des erreurs Keycloak ──────────────────────────
export function extractKeycloakClientError(
  error: unknown,
  fallback = 'Une erreur inattendue est survenue'
): string {
  if (error instanceof Error) {
    const msg = error.message;
    if (msg.includes('409') || msg.toLowerCase().includes('exists'))
      return 'Un client avec ce clientId existe déjà dans ce realm';
    if (msg.includes('404'))
      return 'Client introuvable';
    if (msg.includes('403'))
      return 'Permission insuffisante pour effectuer cette action sur les clients';
    if (msg.includes('400'))
      return 'Données invalides — vérifiez les champs du client';
    if (msg.includes('500'))
      return 'Erreur interne du serveur Keycloak';
    return msg || fallback;
  }
  return fallback;
}

// ============================================================
// SERVICE PRINCIPAL
// ============================================================

export const keycloakClientsService = {

  // ─────────────────────────────────────────────────────────
  // 1. CRUD CLIENT
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/clients
   * Retourne la liste des clients du realm.
   * Les clients inaccessibles (problème de stockage) sont silencieusement omis.
   */
  async list(
    filters: ClientsListFilters = {},
    realm?: string
  ): Promise<ClientRepresentation[]> {
    const params: Record<string, unknown> = {};
    if (filters.clientId)                  params.clientId     = filters.clientId;
    if (filters.first     !== undefined)   params.first        = filters.first;
    if (filters.max       !== undefined)   params.max          = filters.max;
    if (filters.q)                         params.q            = filters.q;
    if (filters.search    !== undefined)   params.search       = filters.search;
    if (filters.viewableOnly !== undefined) params.viewableOnly = filters.viewableOnly;

    const data = await kc.get<unknown[]>(`${adminBase(realm)}/clients`, params);
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(ClientRepresentationSchema, d));
  },

  /**
   * POST /admin/realms/{realm}/clients
   * Crée un nouveau client. clientId doit être unique dans le realm.
   * Retourne 201 Created avec Location header.
   */
  async create(
    payload: CreateClientPayload,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(`${adminBase(realm)}/clients`, payload);
  },

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}
   * Retourne la représentation complète d'un client.
   * @param clientUuid  UUID interne du client (pas le clientId textuel !).
   */
  async getById(
    clientUuid: string,
    realm?: string
  ): Promise<ClientRepresentation> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}`
    );
    return safe(ClientRepresentationSchema, data);
  },

  /**
   * PUT /admin/realms/{realm}/clients/{client-uuid}
   * Met à jour la configuration d'un client existant.
   * Retourne 204 No Content.
   */
  async update(
    clientUuid: string,
    payload: UpdateClientPayload,
    realm?: string
  ): Promise<void> {
    await kc.put<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}`,
      payload
    );
  },

  /**
   * DELETE /admin/realms/{realm}/clients/{client-uuid}
   * Supprime définitivement un client.
   * Retourne 204 No Content.
   */
  async delete(
    clientUuid: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}`
    );
  },

  // ─────────────────────────────────────────────────────────
  // 2. SECRET CLIENT
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/client-secret
   * Retourne le secret actuel du client (confidential clients seulement).
   */
  async getSecret(
    clientUuid: string,
    realm?: string
  ): Promise<CredentialRepresentation> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/client-secret`
    );
    return safe(CredentialRepresentationSchema, data);
  },

  /**
   * POST /admin/realms/{realm}/clients/{client-uuid}/client-secret
   * Génère un nouveau secret pour le client (invalide le précédent).
   * L'ancien secret devient le "rotated secret" pendant une période de transition.
   */
  async regenerateSecret(
    clientUuid: string,
    realm?: string
  ): Promise<CredentialRepresentation> {
    const data = await kc.post<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/client-secret`,
      {}
    );
    return safe(CredentialRepresentationSchema, data);
  },

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/client-secret/rotated
   * Retourne l'ancien secret (rotated) encore valide pendant la transition.
   */
  async getRotatedSecret(
    clientUuid: string,
    realm?: string
  ): Promise<CredentialRepresentation> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/client-secret/rotated`
    );
    return safe(CredentialRepresentationSchema, data);
  },

  /**
   * DELETE /admin/realms/{realm}/clients/{client-uuid}/client-secret/rotated
   * Invalide immédiatement le secret rotatif (avant l'expiration automatique).
   */
  async invalidateRotatedSecret(
    clientUuid: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/client-secret/rotated`
    );
  },

  // ─────────────────────────────────────────────────────────
  // 3. REGISTRATION ACCESS TOKEN
  // ─────────────────────────────────────────────────────────

  /**
   * POST /admin/realms/{realm}/clients/{client-uuid}/registration-access-token
   * Génère un nouveau registration access token pour le client.
   * Utilisé pour l'enregistrement dynamique de clients (RFC 7592).
   */
  async regenerateRegistrationToken(
    clientUuid: string,
    realm?: string
  ): Promise<ClientRepresentation> {
    const data = await kc.post<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/registration-access-token`,
      {}
    );
    return safe(ClientRepresentationSchema, data);
  },

  // ─────────────────────────────────────────────────────────
  // 4. INSTALLATION / CONFIGURATION
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/installation/providers/{providerId}
   * Retourne la configuration d'installation pour un provider donné.
   * Ex: 'keycloak-oidc-jboss-subsystem', 'keycloak-saml', etc.
   */
  async getInstallationProvider(
    clientUuid: string,
    providerId: string,
    realm?: string
  ): Promise<unknown> {
    return kc.get<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/installation/providers/${encodeURIComponent(providerId)}`
    );
  },

  // ─────────────────────────────────────────────────────────
  // 5. MANAGEMENT PERMISSIONS (FINE-GRAINED)
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/management/permissions
   * Indique si les permissions fine-grained sont activées pour ce client.
   */
  async getManagementPermissions(
    clientUuid: string,
    realm?: string
  ): Promise<ManagementPermissionReference> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/management/permissions`
    );
    return safe(ManagementPermissionReferenceSchema, data);
  },

  /**
   * PUT /admin/realms/{realm}/clients/{client-uuid}/management/permissions
   * Active ou désactive les permissions fine-grained pour ce client.
   */
  async setManagementPermissions(
    clientUuid: string,
    payload: { enabled: boolean },
    realm?: string
  ): Promise<ManagementPermissionReference> {
    const data = await kc.put<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/management/permissions`,
      payload
    );
    return safe(ManagementPermissionReferenceSchema, data);
  },

  // ─────────────────────────────────────────────────────────
  // 6. SCOPES CLIENT (DEFAULT & OPTIONAL)
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/default-client-scopes
   * Retourne les scopes par défaut du client (seulement name et id).
   */
  async listDefaultClientScopes(
    clientUuid: string,
    realm?: string
  ): Promise<ClientScopeRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/default-client-scopes`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(ClientScopeListSchema.element, d));
  },

  /**
   * PUT /admin/realms/{realm}/clients/{client-uuid}/default-client-scopes/{clientScopeId}
   * Ajoute un scope par défaut au client.
   * Retourne 204 No Content.
   */
  async addDefaultClientScope(
    clientUuid: string,
    clientScopeId: string,
    realm?: string
  ): Promise<void> {
    await kc.put<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/default-client-scopes/${encodeURIComponent(clientScopeId)}`,
      {}
    );
  },

  /**
   * DELETE /admin/realms/{realm}/clients/{client-uuid}/default-client-scopes/{clientScopeId}
   * Retire un scope par défaut du client.
   * Retourne 204 No Content.
   */
  async removeDefaultClientScope(
    clientUuid: string,
    clientScopeId: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/default-client-scopes/${encodeURIComponent(clientScopeId)}`
    );
  },

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/optional-client-scopes
   * Retourne les scopes optionnels du client (seulement name et id).
   */
  async listOptionalClientScopes(
    clientUuid: string,
    realm?: string
  ): Promise<ClientScopeRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/optional-client-scopes`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(ClientScopeListSchema.element, d));
  },

  /**
   * PUT /admin/realms/{realm}/clients/{client-uuid}/optional-client-scopes/{clientScopeId}
   * Ajoute un scope optionnel au client.
   * Retourne 204 No Content.
   */
  async addOptionalClientScope(
    clientUuid: string,
    clientScopeId: string,
    realm?: string
  ): Promise<void> {
    await kc.put<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/optional-client-scopes/${encodeURIComponent(clientScopeId)}`,
      {}
    );
  },

  /**
   * DELETE /admin/realms/{realm}/clients/{client-uuid}/optional-client-scopes/{clientScopeId}
   * Retire un scope optionnel du client.
   * Retourne 204 No Content.
   */
  async removeOptionalClientScope(
    clientUuid: string,
    clientScopeId: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/optional-client-scopes/${encodeURIComponent(clientScopeId)}`
    );
  },

  // ─────────────────────────────────────────────────────────
  // 7. EVALUATE SCOPES
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/evaluate-scopes/generate-example-access-token
   * Génère un exemple de payload access token (JWT) pour le client.
   */
  async generateExampleAccessToken(
    clientUuid: string,
    filters: EvaluateScopesFilters = {},
    realm?: string
  ): Promise<unknown> {
    const params: Record<string, unknown> = {};
    if (filters.userId)   params.userId   = filters.userId;
    if (filters.scope)    params.scope    = filters.scope;
    if (filters.audience) params.audience = filters.audience;

    return kc.get<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/evaluate-scopes/generate-example-access-token`,
      params
    );
  },

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/evaluate-scopes/generate-example-id-token
   * Génère un exemple de payload ID token pour le client.
   */
  async generateExampleIdToken(
    clientUuid: string,
    filters: EvaluateScopesFilters = {},
    realm?: string
  ): Promise<unknown> {
    const params: Record<string, unknown> = {};
    if (filters.userId)   params.userId   = filters.userId;
    if (filters.scope)    params.scope    = filters.scope;
    if (filters.audience) params.audience = filters.audience;

    return kc.get<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/evaluate-scopes/generate-example-id-token`,
      params
    );
  },

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/evaluate-scopes/generate-example-userinfo
   * Génère un exemple de payload userinfo pour le client.
   */
  async generateExampleUserinfo(
    clientUuid: string,
    filters: Pick<EvaluateScopesFilters, 'userId' | 'scope'> = {},
    realm?: string
  ): Promise<unknown> {
    const params: Record<string, unknown> = {};
    if (filters.userId) params.userId = filters.userId;
    if (filters.scope)  params.scope  = filters.scope;

    return kc.get<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/evaluate-scopes/generate-example-userinfo`,
      params
    );
  },

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/evaluate-scopes/protocol-mappers
   * Retourne tous les protocol mappers actifs lors de la génération de tokens pour ce client
   * (mappers directs + mappers des scopes liés).
   */
  async listEvaluatedProtocolMappers(
    clientUuid: string,
    scope?: string,
    realm?: string
  ): Promise<unknown[]> {
    const params: Record<string, unknown> = {};
    if (scope) params.scope = scope;

    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/evaluate-scopes/protocol-mappers`,
      params
    );
    return Array.isArray(data) ? data : [];
  },

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/evaluate-scopes/scope-mappings/{roleContainerId}/granted
   * Retourne les roles effectivement accordés au client via ses scope mappings.
   * @param roleContainerId  realm name OU UUID d'un client.
   */
  async getGrantedScopeMappings(
    clientUuid: string,
    roleContainerId: string,
    scope?: string,
    realm?: string
  ): Promise<RoleRepresentation[]> {
    const params: Record<string, unknown> = {};
    if (scope) params.scope = scope;

    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/evaluate-scopes/scope-mappings/${encodeURIComponent(roleContainerId)}/granted`,
      params
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/evaluate-scopes/scope-mappings/{roleContainerId}/not-granted
   * Retourne les roles du container que le client n'a PAS en scope.
   * @param roleContainerId  realm name OU UUID d'un client.
   */
  async getNotGrantedScopeMappings(
    clientUuid: string,
    roleContainerId: string,
    scope?: string,
    realm?: string
  ): Promise<RoleRepresentation[]> {
    const params: Record<string, unknown> = {};
    if (scope) params.scope = scope;

    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/evaluate-scopes/scope-mappings/${encodeURIComponent(roleContainerId)}/not-granted`,
      params
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  // ─────────────────────────────────────────────────────────
  // 8. PROTOCOL MAPPERS
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models
   * Retourne tous les protocol mappers du client.
   */
  async listProtocolMappers(
    clientUuid: string,
    realm?: string
  ): Promise<ProtocolMapperRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/protocol-mappers/models`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(ProtocolMapperRepresentationSchema, d));
  },

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models/{id}
   * Retourne un protocol mapper par son ID.
   */
  async getProtocolMapper(
    clientUuid: string,
    mapperId: string,
    realm?: string
  ): Promise<ProtocolMapperRepresentation> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/protocol-mappers/models/${encodeURIComponent(mapperId)}`
    );
    return safe(ProtocolMapperRepresentationSchema, data);
  },

  /**
   * POST /admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models
   * Crée un nouveau protocol mapper pour le client.
   * Retourne 201 Created.
   */
  async createProtocolMapper(
    clientUuid: string,
    payload: CreateProtocolMapperPayload,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/protocol-mappers/models`,
      payload
    );
  },

  /**
   * PUT /admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models/{id}
   * Met à jour un protocol mapper existant.
   * Retourne 204 No Content.
   */
  async updateProtocolMapper(
    clientUuid: string,
    mapperId: string,
    payload: UpdateProtocolMapperPayload,
    realm?: string
  ): Promise<void> {
    await kc.put<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/protocol-mappers/models/${encodeURIComponent(mapperId)}`,
      payload
    );
  },

  /**
   * DELETE /admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models/{id}
   * Supprime un protocol mapper.
   * Retourne 204 No Content.
   */
  async deleteProtocolMapper(
    clientUuid: string,
    mapperId: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/protocol-mappers/models/${encodeURIComponent(mapperId)}`
    );
  },

  /**
   * POST /admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/add-models
   * Crée plusieurs protocol mappers en une seule requête (batch).
   * Retourne 204 No Content.
   */
  async createProtocolMappers(
    clientUuid: string,
    mappers: CreateProtocolMapperPayload[],
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/protocol-mappers/add-models`,
      mappers
    );
  },

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/protocol/{protocol}
   * Retourne les protocol mappers filtrés par protocole.
   * @param protocol  ex: 'openid-connect' | 'saml'
   */
  async listProtocolMappersByProtocol(
    clientUuid: string,
    protocol: string,
    realm?: string
  ): Promise<ProtocolMapperRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/protocol-mappers/protocol/${encodeURIComponent(protocol)}`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(ProtocolMapperRepresentationSchema, d));
  },

  // ─────────────────────────────────────────────────────────
  // 9. SCOPE MAPPINGS
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/scope-mappings
   * Retourne tous les scope mappings du client (realm + clients).
   */
  async listScopeMappings(
    clientUuid: string,
    realm?: string
  ): Promise<unknown> {
    return kc.get<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/scope-mappings`
    );
  },

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/scope-mappings/realm
   * Retourne les realm scope mappings du client.
   */
  async listRealmScopeMappings(
    clientUuid: string,
    realm?: string
  ): Promise<RoleRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/scope-mappings/realm`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/scope-mappings/realm/available
   * Retourne les realm roles disponibles pour être ajoutés comme scope mappings.
   */
  async listAvailableRealmScopeMappings(
    clientUuid: string,
    realm?: string
  ): Promise<RoleRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/scope-mappings/realm/available`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/scope-mappings/realm/composite
   * Retourne les realm scope mappings effectifs (résolution des composites).
   */
  async listCompositeRealmScopeMappings(
    clientUuid: string,
    realm?: string
  ): Promise<RoleRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/scope-mappings/realm/composite`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  /**
   * POST /admin/realms/{realm}/clients/{client-uuid}/scope-mappings/realm
   * Ajoute des realm roles comme scope mappings du client.
   * Retourne 204 No Content.
   */
  async addRealmScopeMappings(
    clientUuid: string,
    roles: RoleRepresentation[],
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/scope-mappings/realm`,
      roles
    );
  },

  /**
   * DELETE /admin/realms/{realm}/clients/{client-uuid}/scope-mappings/realm
   * Retire des realm roles des scope mappings du client.
   * Note: DELETE avec body.
   */
  async removeRealmScopeMappings(
    clientUuid: string,
    roles: RoleRepresentation[],
    realm?: string
  ): Promise<void> {
    await deleteWithBody(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/scope-mappings/realm`,
      roles
    );
  },

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/scope-mappings/clients/{client}
   * Retourne les client scope mappings du client pour un autre client.
   * @param targetClient  UUID du client cible.
   */
  async listClientScopeMappings(
    clientUuid: string,
    targetClient: string,
    realm?: string
  ): Promise<RoleRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/scope-mappings/clients/${encodeURIComponent(targetClient)}`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/scope-mappings/clients/{client}/available
   * Retourne les client roles disponibles pour être ajoutés comme scope mappings.
   */
  async listAvailableClientScopeMappings(
    clientUuid: string,
    targetClient: string,
    realm?: string
  ): Promise<RoleRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/scope-mappings/clients/${encodeURIComponent(targetClient)}/available`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/scope-mappings/clients/{client}/composite
   * Retourne les client scope mappings effectifs (résolution des composites).
   */
  async listCompositeClientScopeMappings(
    clientUuid: string,
    targetClient: string,
    realm?: string
  ): Promise<RoleRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/scope-mappings/clients/${encodeURIComponent(targetClient)}/composite`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  /**
   * POST /admin/realms/{realm}/clients/{client-uuid}/scope-mappings/clients/{client}
   * Ajoute des client roles comme scope mappings.
   * Retourne 204 No Content.
   */
  async addClientScopeMappings(
    clientUuid: string,
    targetClient: string,
    roles: RoleRepresentation[],
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/scope-mappings/clients/${encodeURIComponent(targetClient)}`,
      roles
    );
  },

  /**
   * DELETE /admin/realms/{realm}/clients/{client-uuid}/scope-mappings/clients/{client}
   * Retire des client roles des scope mappings.
   * Note: DELETE avec body.
   */
  async removeClientScopeMappings(
    clientUuid: string,
    targetClient: string,
    roles: RoleRepresentation[],
    realm?: string
  ): Promise<void> {
    await deleteWithBody(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/scope-mappings/clients/${encodeURIComponent(targetClient)}`,
      roles
    );
  },

  // ─────────────────────────────────────────────────────────
  // 10. ROLES CLIENT
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/roles
   * Retourne tous les rôles définis pour ce client.
   */
  async listRoles(
    clientUuid: string,
    filters: ClientRolesFilters = {},
    realm?: string
  ): Promise<RoleRepresentation[]> {
    const params: Record<string, unknown> = {};
    if (filters.briefRepresentation !== undefined) params.briefRepresentation = filters.briefRepresentation;
    if (filters.first !== undefined)  params.first  = filters.first;
    if (filters.max   !== undefined)  params.max    = filters.max;
    if (filters.search)               params.search = filters.search;

    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/roles`,
      params
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  /**
   * POST /admin/realms/{realm}/clients/{client-uuid}/roles
   * Crée un nouveau rôle pour le client.
   * Retourne 201 Created.
   */
  async createRole(
    clientUuid: string,
    payload: CreateRolePayload,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/roles`,
      payload
    );
  },

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/roles/{role-name}
   * Retourne un rôle par son nom (pas son ID !).
   */
  async getRole(
    clientUuid: string,
    roleName: string,
    realm?: string
  ): Promise<RoleRepresentation> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/roles/${encodeURIComponent(roleName)}`
    );
    return safe(RoleRepresentationSchema, data);
  },

  /**
   * PUT /admin/realms/{realm}/clients/{client-uuid}/roles/{role-name}
   * Met à jour un rôle par son nom.
   * Retourne 204 No Content.
   */
  async updateRole(
    clientUuid: string,
    roleName: string,
    payload: UpdateRolePayload,
    realm?: string
  ): Promise<void> {
    await kc.put<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/roles/${encodeURIComponent(roleName)}`,
      payload
    );
  },

  /**
   * DELETE /admin/realms/{realm}/clients/{client-uuid}/roles/{role-name}
   * Supprime un rôle par son nom.
   * Retourne 204 No Content.
   */
  async deleteRole(
    clientUuid: string,
    roleName: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/roles/${encodeURIComponent(roleName)}`
    );
  },

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/roles/{role-name}/composites
   * Retourne les rôles composites d'un rôle client.
   */
  async listRoleComposites(
    clientUuid: string,
    roleName: string,
    realm?: string
  ): Promise<RoleRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/roles/${encodeURIComponent(roleName)}/composites`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  /**
   * POST /admin/realms/{realm}/clients/{client-uuid}/roles/{role-name}/composites
   * Ajoute des rôles au composite d'un rôle client.
   * Retourne 204 No Content.
   */
  async addRoleComposites(
    clientUuid: string,
    roleName: string,
    roles: RoleRepresentation[],
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/roles/${encodeURIComponent(roleName)}/composites`,
      roles
    );
  },

  /**
   * DELETE /admin/realms/{realm}/clients/{client-uuid}/roles/{role-name}/composites
   * Retire des rôles du composite d'un rôle client.
   * Note: DELETE avec body.
   */
  async removeRoleComposites(
    clientUuid: string,
    roleName: string,
    roles: RoleRepresentation[],
    realm?: string
  ): Promise<void> {
    await deleteWithBody(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/roles/${encodeURIComponent(roleName)}/composites`,
      roles
    );
  },

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/roles/{role-name}/composites/realm
   * Retourne les realm roles dans le composite d'un rôle client.
   */
  async listRoleRealmComposites(
    clientUuid: string,
    roleName: string,
    realm?: string
  ): Promise<RoleRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/roles/${encodeURIComponent(roleName)}/composites/realm`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/roles/{role-name}/composites/clients/{targetClientUuid}
   * Retourne les client roles d'un client cible dans le composite d'un rôle.
   */
  async listRoleClientComposites(
    clientUuid: string,
    roleName: string,
    targetClientUuid: string,
    realm?: string
  ): Promise<RoleRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/roles/${encodeURIComponent(roleName)}/composites/clients/${encodeURIComponent(targetClientUuid)}`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/roles/{role-name}/users
   * Retourne les utilisateurs ayant ce rôle client.
   */
  async listRoleUsers(
    clientUuid: string,
    roleName: string,
    filters: ClientRoleUsersFilters = {},
    realm?: string
  ): Promise<unknown[]> {
    const params: Record<string, unknown> = {};
    if (filters.briefRepresentation !== undefined) params.briefRepresentation = filters.briefRepresentation;
    if (filters.first !== undefined) params.first = filters.first;
    if (filters.max   !== undefined) params.max   = filters.max;

    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/roles/${encodeURIComponent(roleName)}/users`,
      params
    );
    return Array.isArray(data) ? data : [];
  },

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/roles/{role-name}/groups
   * Retourne les groupes ayant ce rôle client.
   */
  async listRoleGroups(
    clientUuid: string,
    roleName: string,
    filters: ClientRoleUsersFilters = {},
    realm?: string
  ): Promise<unknown[]> {
    const params: Record<string, unknown> = {};
    if (filters.briefRepresentation !== undefined) params.briefRepresentation = filters.briefRepresentation;
    if (filters.first !== undefined) params.first = filters.first;
    if (filters.max   !== undefined) params.max   = filters.max;

    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/roles/${encodeURIComponent(roleName)}/groups`,
      params
    );
    return Array.isArray(data) ? data : [];
  },

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/roles/{role-name}/management/permissions
   * Indique si les permissions fine-grained sont activées pour ce rôle client.
   */
  async getRoleManagementPermissions(
    clientUuid: string,
    roleName: string,
    realm?: string
  ): Promise<ManagementPermissionReference> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/roles/${encodeURIComponent(roleName)}/management/permissions`
    );
    return safe(ManagementPermissionReferenceSchema, data);
  },

  /**
   * PUT /admin/realms/{realm}/clients/{client-uuid}/roles/{role-name}/management/permissions
   * Active ou désactive les permissions fine-grained pour ce rôle client.
   */
  async setRoleManagementPermissions(
    clientUuid: string,
    roleName: string,
    payload: { enabled: boolean },
    realm?: string
  ): Promise<ManagementPermissionReference> {
    const data = await kc.put<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/roles/${encodeURIComponent(roleName)}/management/permissions`,
      payload
    );
    return safe(ManagementPermissionReferenceSchema, data);
  },

  // ─────────────────────────────────────────────────────────
  // 11. SESSIONS
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/user-sessions
   * Retourne la liste des sessions utilisateur actives pour ce client.
   */
  async listUserSessions(
    clientUuid: string,
    filters: SessionFilters = {},
    realm?: string
  ): Promise<UserSessionRepresentation[]> {
    const params: Record<string, unknown> = {};
    if (filters.first !== undefined) params.first = filters.first;
    if (filters.max   !== undefined) params.max   = filters.max;

    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/user-sessions`,
      params
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(UserSessionRepresentationSchema, d));
  },

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/session-count
   * Retourne le nombre de sessions actives pour ce client. → { count: N }
   */
  async getSessionCount(
    clientUuid: string,
    realm?: string
  ): Promise<number> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/session-count`
    );
    const parsed = safe(CountSchema, data);
    return (parsed as { count?: number }).count ?? 0;
  },

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/offline-sessions
   * Retourne la liste des sessions offline pour ce client.
   */
  async listOfflineSessions(
    clientUuid: string,
    filters: SessionFilters = {},
    realm?: string
  ): Promise<UserSessionRepresentation[]> {
    const params: Record<string, unknown> = {};
    if (filters.first !== undefined) params.first = filters.first;
    if (filters.max   !== undefined) params.max   = filters.max;

    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/offline-sessions`,
      params
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(UserSessionRepresentationSchema, d));
  },

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/offline-session-count
   * Retourne le nombre de sessions offline pour ce client. → { count: N }
   */
  async getOfflineSessionCount(
    clientUuid: string,
    realm?: string
  ): Promise<number> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/offline-session-count`
    );
    const parsed = safe(CountSchema, data);
    return (parsed as { count?: number }).count ?? 0;
  },

  // ─────────────────────────────────────────────────────────
  // 12. SERVICE ACCOUNT
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/service-account-user
   * Retourne l'utilisateur dédié au service account du client.
   * Disponible uniquement si serviceAccountsEnabled = true.
   */
  async getServiceAccountUser(
    clientUuid: string,
    realm?: string
  ): Promise<unknown> {
    return kc.get<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/service-account-user`
    );
  },

  // ─────────────────────────────────────────────────────────
  // 13. CLUSTER NODES
  // ─────────────────────────────────────────────────────────

  /**
   * POST /admin/realms/{realm}/clients/{client-uuid}/nodes
   * Enregistre manuellement un nœud de cluster auprès du client.
   * Normalement géré automatiquement par l'adapter.
   * @param formattedNode  Map<String, String> du nœud à enregistrer.
   */
  async registerNode(
    clientUuid: string,
    formattedNode: Record<string, string>,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/nodes`,
      formattedNode
    );
  },

  /**
   * DELETE /admin/realms/{realm}/clients/{client-uuid}/nodes/{node}
   * Désenregistre un nœud de cluster du client.
   * @param node  Nom/adresse du nœud à supprimer.
   */
  async unregisterNode(
    clientUuid: string,
    node: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/nodes/${encodeURIComponent(node)}`
    );
  },

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/test-nodes-available
   * Envoie un ping à tous les nœuds de cluster enregistrés et retourne le résultat.
   */
  async testNodesAvailable(
    clientUuid: string,
    realm?: string
  ): Promise<GlobalRequestResult> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/test-nodes-available`
    );
    return safe(GlobalRequestResultSchema, data);
  },

  // ─────────────────────────────────────────────────────────
  // 14. PUSH REVOCATION
  // ─────────────────────────────────────────────────────────

  /**
   * POST /admin/realms/{realm}/clients/{client-uuid}/push-revocation
   * Pousse la politique de révocation du client vers son adminUrl.
   * Les tokens émis avant la date de révocation seront rejetés.
   */
  async pushRevocation(
    clientUuid: string,
    realm?: string
  ): Promise<GlobalRequestResult> {
    const data = await kc.post<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/push-revocation`,
      {}
    );
    return safe(GlobalRequestResultSchema, data);
  },

  // ─────────────────────────────────────────────────────────
  // 15. CERTIFICATS
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/certificates/{attr}
   * Retourne les informations du certificat pour un attribut donné.
   * @param attr  ex: 'jwt.credential' | 'saml.signing' | etc.
   */
  async getCertificate(
    clientUuid: string,
    attr: string,
    realm?: string
  ): Promise<CertificateRepresentation> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/certificates/${encodeURIComponent(attr)}`
    );
    return safe(CertificateRepresentationSchema, data);
  },

  /**
   * POST /admin/realms/{realm}/clients/{client-uuid}/certificates/{attr}/generate
   * Génère une nouvelle paire de clés et un certificat auto-signé.
   * Retourne le CertificateRepresentation du certificat généré.
   */
  async generateCertificate(
    clientUuid: string,
    attr: string,
    realm?: string
  ): Promise<CertificateRepresentation> {
    const data = await kc.post<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/certificates/${encodeURIComponent(attr)}/generate`,
      {}
    );
    return safe(CertificateRepresentationSchema, data);
  },

  /**
   * POST /admin/realms/{realm}/clients/{client-uuid}/certificates/{attr}/generate-and-download
   * Génère une paire de clés + certificat et retourne le fichier keystore.
   * La clé privée n'est PAS stockée dans Keycloak — uniquement le certificat public.
   * @param config  KeyStoreConfig (format, passwords, etc.).
   * Retourne le fichier binaire (Blob).
   */
  async generateAndDownloadCertificate(
    clientUuid: string,
    attr: string,
    config: KeyStoreConfig,
    realm?: string
  ): Promise<Blob> {
    const res = await httpClient.fetch(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/certificates/${encodeURIComponent(attr)}/generate-and-download`,
      {
        method: 'POST',
        body:   JSON.stringify(config),
      }
    );
    if (!res.ok) throw new Error(`Erreur téléchargement certificat: ${res.statusText}`);
    return res.blob();
  },

  /**
   * POST /admin/realms/{realm}/clients/{client-uuid}/certificates/{attr}/download
   * Télécharge le keystore (certificat + clé privée existants).
   * @param config  KeyStoreConfig.
   * Retourne le fichier binaire (Blob).
   */
  async downloadCertificate(
    clientUuid: string,
    attr: string,
    config: KeyStoreConfig,
    realm?: string
  ): Promise<Blob> {
    const res = await httpClient.fetch(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/certificates/${encodeURIComponent(attr)}/download`,
      {
        method: 'POST',
        body:   JSON.stringify(config),
      }
    );
    if (!res.ok) throw new Error(`Erreur téléchargement keystore: ${res.statusText}`);
    return res.blob();
  },

  /**
   * POST /admin/realms/{realm}/clients/{client-uuid}/certificates/{attr}/upload
   * Upload un certificat ET la clé privée (format multipart).
   */
  async uploadCertificate(
    clientUuid: string,
    attr: string,
    formData: FormData,
    realm?: string
  ): Promise<CertificateRepresentation> {
    const res = await httpClient.fetch(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/certificates/${encodeURIComponent(attr)}/upload`,
      { method: 'POST', body: formData }
    );
    if (!res.ok) throw new Error(`Erreur upload certificat: ${res.statusText}`);
    const data = await res.json();
    return safe(CertificateRepresentationSchema, data);
  },

  /**
   * POST /admin/realms/{realm}/clients/{client-uuid}/certificates/{attr}/upload-certificate
   * Upload uniquement le certificat public (sans la clé privée).
   */
  async uploadCertificateOnly(
    clientUuid: string,
    attr: string,
    formData: FormData,
    realm?: string
  ): Promise<CertificateRepresentation> {
    const res = await httpClient.fetch(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/certificates/${encodeURIComponent(attr)}/upload-certificate`,
      { method: 'POST', body: formData }
    );
    if (!res.ok) throw new Error(`Erreur upload certificat: ${res.statusText}`);
    const data = await res.json();
    return safe(CertificateRepresentationSchema, data);
  },

  // ─────────────────────────────────────────────────────────
  // 16. AUTHORIZATION — RESOURCE SERVER
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server
   * Retourne la configuration du serveur de ressources authz.
   */
  async getResourceServer(
    clientUuid: string,
    realm?: string
  ): Promise<ResourceServerRepresentation> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/authz/resource-server`
    );
    return safe(ResourceServerRepresentationSchema, data);
  },

  /**
   * PUT /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server
   * Met à jour la configuration du serveur de ressources authz.
   */
  async updateResourceServer(
    clientUuid: string,
    payload: ResourceServerRepresentation,
    realm?: string
  ): Promise<void> {
    await kc.put<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/authz/resource-server`,
      payload
    );
  },

  /**
   * POST /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/import
   * Importe une configuration complète de resource server (JSON).
   */
  async importResourceServer(
    clientUuid: string,
    config: ResourceServerRepresentation,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/authz/resource-server/import`,
      config
    );
  },

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/settings
   * Retourne les paramètres du resource server (alias de getResourceServer, autre endpoint).
   */
  async getResourceServerSettings(
    clientUuid: string,
    realm?: string
  ): Promise<ResourceServerRepresentation> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/authz/resource-server/settings`
    );
    return safe(ResourceServerRepresentationSchema, data);
  },

  // ── Resources ──────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource
   * Retourne la liste des ressources authz du client.
   */
  async listResources(
    clientUuid: string,
    filters: AuthzResourceFilters = {},
    realm?: string
  ): Promise<ResourceRepresentation[]> {
    const params: Record<string, unknown> = { ...filters };
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/authz/resource-server/resource`,
      params
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(ResourceRepresentationSchema, d));
  },

  /**
   * POST /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource
   * Crée une nouvelle ressource authz.
   */
  async createResource(
    clientUuid: string,
    payload: Partial<ResourceRepresentation>,
    realm?: string
  ): Promise<ResourceRepresentation> {
    const data = await kc.post<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/authz/resource-server/resource`,
      payload
    );
    return safe(ResourceRepresentationSchema, data);
  },

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/search
   * Recherche une ressource par nom.
   */
  async searchResource(
    clientUuid: string,
    name: string,
    realm?: string
  ): Promise<ResourceRepresentation> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/authz/resource-server/resource/search`,
      { name }
    );
    return safe(ResourceRepresentationSchema, data);
  },

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}
   * Retourne une ressource par son ID.
   */
  async getResource(
    clientUuid: string,
    resourceId: string,
    realm?: string
  ): Promise<ResourceRepresentation> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/authz/resource-server/resource/${encodeURIComponent(resourceId)}`
    );
    return safe(ResourceRepresentationSchema, data);
  },

  /**
   * PUT /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}
   * Met à jour une ressource authz.
   */
  async updateResource(
    clientUuid: string,
    resourceId: string,
    payload: Partial<ResourceRepresentation>,
    realm?: string
  ): Promise<void> {
    await kc.put<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/authz/resource-server/resource/${encodeURIComponent(resourceId)}`,
      payload
    );
  },

  /**
   * DELETE /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}
   * Supprime une ressource authz.
   */
  async deleteResource(
    clientUuid: string,
    resourceId: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/authz/resource-server/resource/${encodeURIComponent(resourceId)}`
    );
  },

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}/attributes
   * Retourne les attributs d'une ressource authz.
   */
  async getResourceAttributes(
    clientUuid: string,
    resourceId: string,
    realm?: string
  ): Promise<unknown> {
    return kc.get<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/authz/resource-server/resource/${encodeURIComponent(resourceId)}/attributes`
    );
  },

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}/permissions
   * Retourne les permissions associées à une ressource.
   */
  async listResourcePermissions(
    clientUuid: string,
    resourceId: string,
    realm?: string
  ): Promise<PolicyRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/authz/resource-server/resource/${encodeURIComponent(resourceId)}/permissions`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(PolicyRepresentationSchema, d));
  },

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}/scopes
   * Retourne les scopes associés à une ressource.
   */
  async listResourceScopes(
    clientUuid: string,
    resourceId: string,
    realm?: string
  ): Promise<ScopeRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/authz/resource-server/resource/${encodeURIComponent(resourceId)}/scopes`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(ScopeRepresentationSchema, d));
  },

  // ── Scopes authz ───────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope
   * Retourne la liste des scopes authz.
   */
  async listScopes(
    clientUuid: string,
    filters: AuthzScopeFilters = {},
    realm?: string
  ): Promise<ScopeRepresentation[]> {
    const params: Record<string, unknown> = { ...filters };
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/authz/resource-server/scope`,
      params
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(ScopeRepresentationSchema, d));
  },

  /**
   * POST /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope
   * Crée un nouveau scope authz.
   */
  async createScope(
    clientUuid: string,
    payload: Partial<ScopeRepresentation>,
    realm?: string
  ): Promise<ScopeRepresentation> {
    const data = await kc.post<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/authz/resource-server/scope`,
      payload
    );
    return safe(ScopeRepresentationSchema, data);
  },

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope/search
   * Recherche un scope par nom.
   */
  async searchScope(
    clientUuid: string,
    name: string,
    realm?: string
  ): Promise<ScopeRepresentation> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/authz/resource-server/scope/search`,
      { name }
    );
    return safe(ScopeRepresentationSchema, data);
  },

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope/{scope-id}
   * Retourne un scope authz par son ID.
   */
  async getScope(
    clientUuid: string,
    scopeId: string,
    realm?: string
  ): Promise<ScopeRepresentation> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/authz/resource-server/scope/${encodeURIComponent(scopeId)}`
    );
    return safe(ScopeRepresentationSchema, data);
  },

  /**
   * PUT /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope/{scope-id}
   * Met à jour un scope authz.
   */
  async updateScope(
    clientUuid: string,
    scopeId: string,
    payload: Partial<ScopeRepresentation>,
    realm?: string
  ): Promise<void> {
    await kc.put<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/authz/resource-server/scope/${encodeURIComponent(scopeId)}`,
      payload
    );
  },

  /**
   * DELETE /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope/{scope-id}
   * Supprime un scope authz.
   */
  async deleteScope(
    clientUuid: string,
    scopeId: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/authz/resource-server/scope/${encodeURIComponent(scopeId)}`
    );
  },

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope/{scope-id}/permissions
   * Retourne les permissions utilisant ce scope.
   */
  async listScopePermissions(
    clientUuid: string,
    scopeId: string,
    realm?: string
  ): Promise<PolicyRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/authz/resource-server/scope/${encodeURIComponent(scopeId)}/permissions`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(PolicyRepresentationSchema, d));
  },

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope/{scope-id}/resources
   * Retourne les ressources associées à ce scope.
   */
  async listScopeResources(
    clientUuid: string,
    scopeId: string,
    realm?: string
  ): Promise<ResourceRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/authz/resource-server/scope/${encodeURIComponent(scopeId)}/resources`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(ResourceRepresentationSchema, d));
  },

  // ── Policies ───────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/policy
   * Retourne la liste des politiques authz.
   */
  async listPolicies(
    clientUuid: string,
    filters: AuthzPolicyFilters = {},
    realm?: string
  ): Promise<PolicyRepresentation[]> {
    const params: Record<string, unknown> = { ...filters };
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/authz/resource-server/policy`,
      params
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(PolicyRepresentationSchema, d));
  },

  /**
   * POST /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/policy
   * Crée une nouvelle politique authz.
   */
  async createPolicy(
    clientUuid: string,
    payload: Partial<PolicyRepresentation>,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/authz/resource-server/policy`,
      payload
    );
  },

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/policy/search
   * Recherche une politique par nom.
   */
  async searchPolicy(
    clientUuid: string,
    name: string,
    fields?: string,
    realm?: string
  ): Promise<PolicyRepresentation> {
    const params: Record<string, unknown> = { name };
    if (fields) params.fields = fields;
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/authz/resource-server/policy/search`,
      params
    );
    return safe(PolicyRepresentationSchema, data);
  },

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/policy/providers
   * Retourne les fournisseurs de politique disponibles.
   */
  async listPolicyProviders(
    clientUuid: string,
    realm?: string
  ): Promise<PolicyProviderRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/authz/resource-server/policy/providers`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(PolicyProviderListSchema.element, d));
  },

  /**
   * POST /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/policy/evaluate
   * Évalue une politique authz pour un contexte donné.
   */
  async evaluatePolicy(
    clientUuid: string,
    request: PolicyEvaluationRequest,
    realm?: string
  ): Promise<PolicyEvaluationResponse> {
    const data = await kc.post<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/authz/resource-server/policy/evaluate`,
      request
    );
    return data as PolicyEvaluationResponse;
  },

  // ── Permissions ────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/permission
   * Retourne la liste des permissions authz (sous-type de politique).
   */
  async listPermissions(
    clientUuid: string,
    filters: AuthzPolicyFilters = {},
    realm?: string
  ): Promise<PolicyRepresentation[]> {
    const params: Record<string, unknown> = { ...filters };
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/authz/resource-server/permission`,
      params
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(PolicyRepresentationSchema, d));
  },

  /**
   * POST /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/permission
   * Crée une nouvelle permission authz.
   */
  async createPermission(
    clientUuid: string,
    payload: Partial<PolicyRepresentation>,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/authz/resource-server/permission`,
      payload
    );
  },

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/permission/search
   * Recherche une permission par nom.
   */
  async searchPermission(
    clientUuid: string,
    name: string,
    fields?: string,
    realm?: string
  ): Promise<PolicyRepresentation> {
    const params: Record<string, unknown> = { name };
    if (fields) params.fields = fields;
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/authz/resource-server/permission/search`,
      params
    );
    return safe(PolicyRepresentationSchema, data);
  },

  /**
   * GET /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/permission/providers
   * Retourne les fournisseurs de permission disponibles.
   */
  async listPermissionProviders(
    clientUuid: string,
    realm?: string
  ): Promise<PolicyProviderRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/authz/resource-server/permission/providers`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(PolicyProviderListSchema.element, d));
  },

  /**
   * POST /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/permission/evaluate
   * Évalue une permission authz pour un contexte donné.
   */
  async evaluatePermission(
    clientUuid: string,
    request: PolicyEvaluationRequest,
    realm?: string
  ): Promise<PolicyEvaluationResponse> {
    const data = await kc.post<unknown>(
      `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/authz/resource-server/permission/evaluate`,
      request
    );
    return data as PolicyEvaluationResponse;
  },

  // ─────────────────────────────────────────────────────────
  // 17. CLIENT INITIAL ACCESS
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/clients-initial-access
   * Retourne la liste des tokens d'accès initial du realm.
   * Utilisés pour l'enregistrement dynamique de clients (RFC 7591).
   */
  async listInitialAccess(
    realm?: string
  ): Promise<ClientInitialAccessPresentation[]> {
    const data = await kc.get<unknown[]>(`${adminBase(realm)}/clients-initial-access`);
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(ClientInitialAccessPresentationSchema, d));
  },

  /**
   * POST /admin/realms/{realm}/clients-initial-access
   * Crée un nouveau token d'accès initial.
   * @param payload  expiration (secondes) et count (nombre d'utilisations).
   */
  async createInitialAccess(
    payload: ClientInitialAccessCreatePresentation,
    realm?: string
  ): Promise<ClientInitialAccessPresentation> {
    const data = await kc.post<unknown>(
      `${adminBase(realm)}/clients-initial-access`,
      payload
    );
    return safe(ClientInitialAccessPresentationSchema, data);
  },

  /**
   * DELETE /admin/realms/{realm}/clients-initial-access/{id}
   * Supprime un token d'accès initial.
   * Retourne 204 No Content.
   */
  async deleteInitialAccess(
    tokenId: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${adminBase(realm)}/clients-initial-access/${encodeURIComponent(tokenId)}`
    );
  },

  // ─────────────────────────────────────────────────────────
  // 18. MÉTHODES UTILITAIRES COMPOSÉES
  // ─────────────────────────────────────────────────────────

  /**
   * Recherche paginée de clients par clientId (recherche partielle).
   */
  async search(
    query: string,
    options: { first?: number; max?: number } = {},
    realm?: string
  ): Promise<ClientRepresentation[]> {
    return keycloakClientsService.list(
      {
        clientId: query,
        search:   true,
        first:    options.first ?? 0,
        max:      options.max   ?? 50,
      },
      realm
    );
  },

  /**
   * Récupère un client par son clientId textuel exact.
   * Retourne null si non trouvé.
   */
  async findByClientId(
    clientId: string,
    realm?: string
  ): Promise<ClientRepresentation | null> {
    const clients = await keycloakClientsService.list(
      { clientId, search: false, max: 1 },
      realm
    );
    return clients.find((c) => c.clientId === clientId) ?? null;
  },

  /**
   * Active ou désactive un client en une seule opération.
   */
  async setEnabled(
    clientUuid: string,
    enabled: boolean,
    realm?: string
  ): Promise<void> {
    return keycloakClientsService.update(clientUuid, { enabled }, realm);
  },

  /**
   * Retourne le nombre total de sessions (actives + offline) pour un client.
   */
  async getTotalSessionCount(
    clientUuid: string,
    realm?: string
  ): Promise<{ active: number; offline: number; total: number }> {
    const [active, offline] = await Promise.all([
      keycloakClientsService.getSessionCount(clientUuid, realm),
      keycloakClientsService.getOfflineSessionCount(clientUuid, realm),
    ]);
    return { active, offline, total: active + offline };
  },

  /**
   * Vérifie si un client existe par son UUID.
   */
  async exists(
    clientUuid: string,
    realm?: string
  ): Promise<boolean> {
    try {
      await keycloakClientsService.getById(clientUuid, realm);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Copie la configuration d'un client vers un nouveau clientId.
   * Utile pour créer des clients similaires rapidement.
   * @param sourceUuid   UUID du client source.
   * @param newClientId  clientId du nouveau client.
   */
  async cloneClient(
    sourceUuid: string,
    newClientId: string,
    realm?: string
  ): Promise<void> {
    const source = await keycloakClientsService.getById(sourceUuid, realm);
    // Supprime les champs d'identité pour le nouveau client
    const { id: _id, clientId: _cid, secret: _s, registrationAccessToken: _r, ...rest } = source;
    await keycloakClientsService.create(
      { ...rest, clientId: newClientId } as CreateClientPayload,
      realm
    );
  },
};

// ── Export par défaut ────────────────────────────────────────
export default keycloakClientsService;
