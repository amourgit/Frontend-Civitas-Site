// ============================================================
// services/iam/keycloakAuthorizationService.ts
// Service complet — Fine-Grained Authorization (Authz) Keycloak Admin REST API v26
//
// Couvre TOUS les endpoints /admin/realms/{realm}/clients/{uuid}/authz/*
// selon la documentation officielle Keycloak 26.6.1
//
// Endpoints couverts (32 au total) :
//
// ── RESOURCE SERVER ──────────────────────────────────────────
//   GET    /authz/resource-server                                      → getResourceServer()
//   PUT    /authz/resource-server                                      → updateResourceServer()
//   POST   /authz/resource-server/import                               → importResourceServer()
//
// ── PERMISSIONS ──────────────────────────────────────────────
//   GET    /authz/resource-server/permission                           → listPermissions()
//   POST   /authz/resource-server/permission                           → createPermission()
//   GET    /authz/resource-server/permission/providers                 → listPermissionProviders()
//   GET    /authz/resource-server/permission/search                    → searchPermission()
//   POST   /authz/resource-server/permission/evaluate                  → evaluatePermission()
//
// ── POLICIES ─────────────────────────────────────────────────
//   GET    /authz/resource-server/policy                               → listPolicies()
//   POST   /authz/resource-server/policy                               → createPolicy()
//   GET    /authz/resource-server/policy/providers                     → listPolicyProviders()
//   GET    /authz/resource-server/policy/search                        → searchPolicy()
//   POST   /authz/resource-server/policy/evaluate                      → evaluatePolicy()
//
// ── RESSOURCES ───────────────────────────────────────────────
//   GET    /authz/resource-server/resource                             → listResources()
//   POST   /authz/resource-server/resource                             → createResource()
//   GET    /authz/resource-server/resource/search                      → searchResource()
//   GET    /authz/resource-server/resource/{resource-id}               → getResource()
//   PUT    /authz/resource-server/resource/{resource-id}               → updateResource()
//   DELETE /authz/resource-server/resource/{resource-id}               → deleteResource()
//   GET    /authz/resource-server/resource/{resource-id}/attributes    → getResourceAttributes()
//   GET    /authz/resource-server/resource/{resource-id}/permissions   → listResourcePermissions()
//   GET    /authz/resource-server/resource/{resource-id}/scopes        → listResourceScopes()
//
// ── SCOPES ───────────────────────────────────────────────────
//   GET    /authz/resource-server/scope                                → listScopes()
//   POST   /authz/resource-server/scope                                → createScope()
//   GET    /authz/resource-server/scope/search                         → searchScope()
//   GET    /authz/resource-server/scope/{scope-id}                     → getScope()
//   PUT    /authz/resource-server/scope/{scope-id}                     → updateScope()
//   DELETE /authz/resource-server/scope/{scope-id}                     → deleteScope()
//   GET    /authz/resource-server/scope/{scope-id}/permissions         → listScopePermissions()
//   GET    /authz/resource-server/scope/{scope-id}/resources           → listScopeResources()
//
// ── SETTINGS ────────────────────────────────────────────────
//   GET    /authz/resource-server/settings                                    → getResourceServerSettings()
//
// Authentification : Bearer token via httpClient (tokenManager)
// Base URL         : NEXT_PUBLIC_KEYCLOAK_URL + /admin/realms/{realm}
// ============================================================

import { z }          from 'zod';
import { httpClient } from '@/lib/http-client';
import { adminBase as _adminBaseResolver } from './_realmHelper';

// ── URL de base Keycloak ──────────────────────────────────────

/**
 * Retourne l'URL Admin REST API — realm extrait dynamiquement du sous-domaine.
 */
function adminBase(realm?: string): string {
  return _adminBaseResolver(realm);
}

function authzBase(realm: string, clientUuid: string): string {
  return `${adminBase(realm)}/clients/${encodeURIComponent(clientUuid)}/authz/resource-server`;
}

// ── Schémas Zod ───────────────────────────────────────────────

const ResourceServerRepresentationSchema = z.object({
  id:                    z.string().optional(),
  clientId:              z.string().optional(),
  name:                  z.string().optional(),
  allowRemoteResourceManagement: z.boolean().optional(),
  policyEnforcementMode: z.string().optional(),
  resources:             z.array(z.record(z.unknown())).optional(),
  policies:              z.array(z.record(z.unknown())).optional(),
  scopes:                z.array(z.record(z.unknown())).optional(),
  decisionStrategy:      z.string().optional(),
}).passthrough();

const ResourceRepresentationSchema = z.object({
  _id:         z.string().optional(),
  name:        z.string().optional(),
  uris:        z.array(z.string()).optional(),
  type:        z.string().optional(),
  scopes:      z.array(z.record(z.unknown())).optional(),
  attributes:  z.record(z.array(z.string())).optional(),
  displayName: z.string().optional(),
  ownerManagedAccess: z.boolean().optional(),
  owner:       z.record(z.unknown()).optional(),
}).passthrough();

const ScopeRepresentationSchema = z.object({
  id:          z.string().optional(),
  name:        z.string().optional(),
  displayName: z.string().optional(),
  iconUri:     z.string().optional(),
  policies:    z.array(z.record(z.unknown())).optional(),
  resources:   z.array(z.record(z.unknown())).optional(),
}).passthrough();

const PolicyRepresentationSchema = z.object({
  id:               z.string().optional(),
  name:             z.string().optional(),
  description:      z.string().optional(),
  type:             z.string().optional(),
  logic:            z.string().optional(),
  decisionStrategy: z.string().optional(),
  config:           z.record(z.string()).optional(),
  resources:        z.array(z.string()).optional(),
  scopes:           z.array(z.string()).optional(),
  policies:         z.array(z.string()).optional(),
}).passthrough();

const PolicyEvaluationResponseSchema = z.object({
  results:  z.array(z.record(z.unknown())).optional(),
  entitlements: z.boolean().optional(),
  status:   z.string().optional(),
  rpt:      z.record(z.unknown()).optional(),
}).passthrough();

export type ResourceServerRepresentation = z.infer<typeof ResourceServerRepresentationSchema>;
export type ResourceRepresentation       = z.infer<typeof ResourceRepresentationSchema>;
export type ScopeRepresentation          = z.infer<typeof ScopeRepresentationSchema>;
export type PolicyRepresentation         = z.infer<typeof PolicyRepresentationSchema>;
export type PolicyEvaluationResponse     = z.infer<typeof PolicyEvaluationResponseSchema>;

// Payloads
export interface CreateResourcePayload {
  name:         string;
  uris?:        string[];
  type?:        string;
  scopes?:      Array<{ name: string }>;
  attributes?:  Record<string, string[]>;
  displayName?: string;
  ownerManagedAccess?: boolean;
}

export interface CreateScopePayload {
  name:         string;
  displayName?: string;
  iconUri?:     string;
}

export interface CreatePolicyPayload {
  name:             string;
  type:             string;
  description?:     string;
  logic?:           'POSITIVE' | 'NEGATIVE';
  decisionStrategy?: 'UNANIMOUS' | 'AFFIRMATIVE' | 'CONSENSUS';
  config?:          Record<string, string>;
  resources?:       string[];
  scopes?:          string[];
  policies?:        string[];
}

export interface PolicyEvaluationRequest {
  resources?:       Array<{ id?: string; name?: string }>;
  context?:         Record<string, unknown>;
  userId?:          string;
  roleIds?:         string[];
  clientId?:        string;
  entitlements?:    boolean;
}

export interface AuthzListFilters {
  first?:  number;
  max?:    number;
  name?:   string;
  type?:   string;
}

// ── Helper de parsing sécurisé ────────────────────────────────
function safe<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  return data as T;
}

// ── Extraction des erreurs ────────────────────────────────────
export function extractAuthorizationError(
  error: unknown,
  fallback = 'Une erreur inattendue est survenue'
): string {
  if (error instanceof Error) {
    const msg = error.message;
    if (msg.includes('409')) return 'Une ressource ou politique avec ce nom existe déjà';
    if (msg.includes('404')) return 'Ressource, scope ou politique introuvable';
    if (msg.includes('403')) return 'Permission insuffisante ou fine-grained authorization non activée';
    if (msg.includes('400')) return 'Configuration invalide';
    return msg || fallback;
  }
  return fallback;
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

// ============================================================
// SERVICE PRINCIPAL
// ============================================================

export const keycloakAuthorizationService = {

  // ─────────────────────────────────────────────────────────
  // 1. RESOURCE SERVER
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/clients/{uuid}/authz/resource-server
   * Retourne la configuration du resource server d'un client.
   * Nécessite que le client ait "Authorization Enabled" activé.
   */
  async getResourceServer(
    clientUuid: string,
    realm?: string
  ): Promise<ResourceServerRepresentation> {
    const data = await kc.get<unknown>(authzBase(realm, clientUuid));
    return safe(ResourceServerRepresentationSchema, data);
  },

  /**
   * PUT /admin/realms/{realm}/clients/{uuid}/authz/resource-server
   * Met à jour la configuration du resource server.
   * Retourne 204 No Content.
   */
  async updateResourceServer(
    clientUuid: string,
    payload: Partial<ResourceServerRepresentation>,
    realm?: string
  ): Promise<void> {
    await kc.put<unknown>(authzBase(realm, clientUuid), payload);
  },

  /**
   * POST /admin/realms/{realm}/clients/{uuid}/authz/resource-server/import
   * Importe une configuration complète de resource server (ressources, politiques, scopes).
   * Retourne 204 No Content.
   */
  async importResourceServer(
    clientUuid: string,
    payload: ResourceServerRepresentation,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(`${authzBase(realm, clientUuid)}/import`, payload);
  },

  // ─────────────────────────────────────────────────────────
  // 2. PERMISSIONS
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/clients/{uuid}/authz/resource-server/permission
   * Retourne la liste des permissions du resource server.
   */
  async listPermissions(
    clientUuid: string,
    filters: AuthzListFilters = {},
    realm?: string
  ): Promise<PolicyRepresentation[]> {
    const params: Record<string, unknown> = {};
    if (filters.first !== undefined) params.first = filters.first;
    if (filters.max   !== undefined) params.max   = filters.max;
    if (filters.name)                params.name  = filters.name;
    if (filters.type)                params.type  = filters.type;

    const data = await kc.get<unknown[]>(`${authzBase(realm, clientUuid)}/permission`, params);
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(PolicyRepresentationSchema, d));
  },

  /**
   * POST /admin/realms/{realm}/clients/{uuid}/authz/resource-server/permission
   * Crée une nouvelle permission.
   * Le type dans le payload détermine le type de permission (resource, scope, etc.).
   * Retourne 201 Created.
   */
  async createPermission(
    clientUuid: string,
    payload: CreatePolicyPayload,
    realm?: string
  ): Promise<PolicyRepresentation> {
    const data = await kc.post<unknown>(`${authzBase(realm, clientUuid)}/permission`, payload);
    return safe(PolicyRepresentationSchema, data);
  },

  /**
   * GET /admin/realms/{realm}/clients/{uuid}/authz/resource-server/permission/providers
   * Retourne les types de permissions disponibles.
   */
  async listPermissionProviders(
    clientUuid: string,
    realm?: string
  ): Promise<unknown[]> {
    const data = await kc.get<unknown[]>(`${authzBase(realm, clientUuid)}/permission/providers`);
    return Array.isArray(data) ? data : [];
  },

  /**
   * GET /admin/realms/{realm}/clients/{uuid}/authz/resource-server/permission/search
   * Recherche des permissions par nom.
   */
  async searchPermission(
    clientUuid: string,
    name: string,
    realm?: string
  ): Promise<PolicyRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${authzBase(realm, clientUuid)}/permission/search`,
      { name }
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(PolicyRepresentationSchema, d));
  },

  /**
   * POST /admin/realms/{realm}/clients/{uuid}/authz/resource-server/permission/evaluate
   * Évalue les permissions pour une requête donnée.
   * Retourne le résultat de l'évaluation.
   */
  async evaluatePermission(
    clientUuid: string,
    request: PolicyEvaluationRequest,
    realm?: string
  ): Promise<PolicyEvaluationResponse> {
    const data = await kc.post<unknown>(`${authzBase(realm, clientUuid)}/permission/evaluate`, request);
    return safe(PolicyEvaluationResponseSchema, data);
  },

  // ─────────────────────────────────────────────────────────
  // 3. POLICIES
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/clients/{uuid}/authz/resource-server/policy
   * Retourne la liste des politiques du resource server.
   */
  async listPolicies(
    clientUuid: string,
    filters: AuthzListFilters & { permission?: boolean } = {},
    realm?: string
  ): Promise<PolicyRepresentation[]> {
    const params: Record<string, unknown> = {};
    if (filters.first      !== undefined) params.first      = filters.first;
    if (filters.max        !== undefined) params.max        = filters.max;
    if (filters.name)                     params.name       = filters.name;
    if (filters.type)                     params.type       = filters.type;
    if (filters.permission !== undefined) params.permission = filters.permission;

    const data = await kc.get<unknown[]>(`${authzBase(realm, clientUuid)}/policy`, params);
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(PolicyRepresentationSchema, d));
  },

  /**
   * POST /admin/realms/{realm}/clients/{uuid}/authz/resource-server/policy
   * Crée une nouvelle politique.
   * Retourne 201 Created.
   */
  async createPolicy(
    clientUuid: string,
    payload: CreatePolicyPayload,
    realm?: string
  ): Promise<PolicyRepresentation> {
    const data = await kc.post<unknown>(`${authzBase(realm, clientUuid)}/policy`, payload);
    return safe(PolicyRepresentationSchema, data);
  },

  /**
   * GET /admin/realms/{realm}/clients/{uuid}/authz/resource-server/policy/providers
   * Retourne les types de politiques disponibles.
   */
  async listPolicyProviders(
    clientUuid: string,
    realm?: string
  ): Promise<unknown[]> {
    const data = await kc.get<unknown[]>(`${authzBase(realm, clientUuid)}/policy/providers`);
    return Array.isArray(data) ? data : [];
  },

  /**
   * GET /admin/realms/{realm}/clients/{uuid}/authz/resource-server/policy/search
   * Recherche des politiques par nom.
   */
  async searchPolicy(
    clientUuid: string,
    name: string,
    realm?: string
  ): Promise<PolicyRepresentation> {
    const data = await kc.get<unknown>(
      `${authzBase(realm, clientUuid)}/policy/search`,
      { name }
    );
    return safe(PolicyRepresentationSchema, data);
  },

  /**
   * POST /admin/realms/{realm}/clients/{uuid}/authz/resource-server/policy/evaluate
   * Évalue les politiques pour une requête donnée.
   */
  async evaluatePolicy(
    clientUuid: string,
    request: PolicyEvaluationRequest,
    realm?: string
  ): Promise<PolicyEvaluationResponse> {
    const data = await kc.post<unknown>(`${authzBase(realm, clientUuid)}/policy/evaluate`, request);
    return safe(PolicyEvaluationResponseSchema, data);
  },

  // ─────────────────────────────────────────────────────────
  // 4. RESSOURCES
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/clients/{uuid}/authz/resource-server/resource
   * Retourne la liste des ressources du resource server.
   */
  async listResources(
    clientUuid: string,
    filters: AuthzListFilters & { uri?: string; owner?: string; type?: string; scope?: string } = {},
    realm?: string
  ): Promise<ResourceRepresentation[]> {
    const params: Record<string, unknown> = {};
    if (filters.first !== undefined) params.first = filters.first;
    if (filters.max   !== undefined) params.max   = filters.max;
    if (filters.name)                params.name  = filters.name;
    if (filters.uri)                 params.uri   = filters.uri;
    if (filters.owner)               params.owner = filters.owner;
    if (filters.type)                params.type  = filters.type;
    if (filters.scope)               params.scope = filters.scope;

    const data = await kc.get<unknown[]>(`${authzBase(realm, clientUuid)}/resource`, params);
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(ResourceRepresentationSchema, d));
  },

  /**
   * POST /admin/realms/{realm}/clients/{uuid}/authz/resource-server/resource
   * Crée une nouvelle ressource.
   * Retourne 201 Created avec la ressource créée.
   */
  async createResource(
    clientUuid: string,
    payload: CreateResourcePayload,
    realm?: string
  ): Promise<ResourceRepresentation> {
    const data = await kc.post<unknown>(`${authzBase(realm, clientUuid)}/resource`, payload);
    return safe(ResourceRepresentationSchema, data);
  },

  /**
   * GET /admin/realms/{realm}/clients/{uuid}/authz/resource-server/resource/search
   * Recherche des ressources par nom.
   */
  async searchResource(
    clientUuid: string,
    name: string,
    realm?: string
  ): Promise<ResourceRepresentation> {
    const data = await kc.get<unknown>(
      `${authzBase(realm, clientUuid)}/resource/search`,
      { name }
    );
    return safe(ResourceRepresentationSchema, data);
  },

  /**
   * GET /admin/realms/{realm}/clients/{uuid}/authz/resource-server/resource/{resource-id}
   * Retourne les détails d'une ressource par son ID.
   */
  async getResource(
    clientUuid: string,
    resourceId: string,
    realm?: string
  ): Promise<ResourceRepresentation> {
    const data = await kc.get<unknown>(
      `${authzBase(realm, clientUuid)}/resource/${encodeURIComponent(resourceId)}`
    );
    return safe(ResourceRepresentationSchema, data);
  },

  /**
   * PUT /admin/realms/{realm}/clients/{uuid}/authz/resource-server/resource/{resource-id}
   * Met à jour une ressource existante.
   * Retourne 204 No Content.
   */
  async updateResource(
    clientUuid: string,
    resourceId: string,
    payload: Partial<ResourceRepresentation>,
    realm?: string
  ): Promise<void> {
    await kc.put<unknown>(
      `${authzBase(realm, clientUuid)}/resource/${encodeURIComponent(resourceId)}`,
      payload
    );
  },

  /**
   * DELETE /admin/realms/{realm}/clients/{uuid}/authz/resource-server/resource/{resource-id}
   * Supprime une ressource.
   * Retourne 204 No Content.
   */
  async deleteResource(
    clientUuid: string,
    resourceId: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${authzBase(realm, clientUuid)}/resource/${encodeURIComponent(resourceId)}`
    );
  },

  /**
   * GET /admin/realms/{realm}/clients/{uuid}/authz/resource-server/resource/{resource-id}/attributes
   * Retourne les attributs d'une ressource.
   */
  async getResourceAttributes(
    clientUuid: string,
    resourceId: string,
    realm?: string
  ): Promise<Record<string, string[]>> {
    const data = await kc.get<unknown>(
      `${authzBase(realm, clientUuid)}/resource/${encodeURIComponent(resourceId)}/attributes`
    );
    return (data as Record<string, string[]>) ?? {};
  },

  /**
   * GET /admin/realms/{realm}/clients/{uuid}/authz/resource-server/resource/{resource-id}/permissions
   * Retourne les permissions associées à une ressource.
   */
  async listResourcePermissions(
    clientUuid: string,
    resourceId: string,
    realm?: string
  ): Promise<PolicyRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${authzBase(realm, clientUuid)}/resource/${encodeURIComponent(resourceId)}/permissions`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(PolicyRepresentationSchema, d));
  },

  /**
   * GET /admin/realms/{realm}/clients/{uuid}/authz/resource-server/resource/{resource-id}/scopes
   * Retourne les scopes associés à une ressource.
   */
  async listResourceScopes(
    clientUuid: string,
    resourceId: string,
    realm?: string
  ): Promise<ScopeRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${authzBase(realm, clientUuid)}/resource/${encodeURIComponent(resourceId)}/scopes`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(ScopeRepresentationSchema, d));
  },

  // ─────────────────────────────────────────────────────────
  // 5. SCOPES D'AUTORISATION
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/clients/{uuid}/authz/resource-server/scope
   * Retourne la liste des scopes d'autorisation.
   */
  async listScopes(
    clientUuid: string,
    filters: AuthzListFilters = {},
    realm?: string
  ): Promise<ScopeRepresentation[]> {
    const params: Record<string, unknown> = {};
    if (filters.first !== undefined) params.first = filters.first;
    if (filters.max   !== undefined) params.max   = filters.max;
    if (filters.name)                params.name  = filters.name;

    const data = await kc.get<unknown[]>(`${authzBase(realm, clientUuid)}/scope`, params);
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(ScopeRepresentationSchema, d));
  },

  /**
   * POST /admin/realms/{realm}/clients/{uuid}/authz/resource-server/scope
   * Crée un nouveau scope d'autorisation.
   * Retourne 201 Created.
   */
  async createScope(
    clientUuid: string,
    payload: CreateScopePayload,
    realm?: string
  ): Promise<ScopeRepresentation> {
    const data = await kc.post<unknown>(`${authzBase(realm, clientUuid)}/scope`, payload);
    return safe(ScopeRepresentationSchema, data);
  },

  /**
   * GET /admin/realms/{realm}/clients/{uuid}/authz/resource-server/scope/search
   * Recherche des scopes par nom.
   */
  async searchScope(
    clientUuid: string,
    name: string,
    realm?: string
  ): Promise<ScopeRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${authzBase(realm, clientUuid)}/scope/search`,
      { name }
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(ScopeRepresentationSchema, d));
  },

  /**
   * GET /admin/realms/{realm}/clients/{uuid}/authz/resource-server/scope/{scope-id}
   * Retourne les détails d'un scope par son ID.
   */
  async getScope(
    clientUuid: string,
    scopeId: string,
    realm?: string
  ): Promise<ScopeRepresentation> {
    const data = await kc.get<unknown>(
      `${authzBase(realm, clientUuid)}/scope/${encodeURIComponent(scopeId)}`
    );
    return safe(ScopeRepresentationSchema, data);
  },

  /**
   * PUT /admin/realms/{realm}/clients/{uuid}/authz/resource-server/scope/{scope-id}
   * Met à jour un scope existant.
   * Retourne 204 No Content.
   */
  async updateScope(
    clientUuid: string,
    scopeId: string,
    payload: Partial<ScopeRepresentation>,
    realm?: string
  ): Promise<void> {
    await kc.put<unknown>(
      `${authzBase(realm, clientUuid)}/scope/${encodeURIComponent(scopeId)}`,
      payload
    );
  },

  /**
   * DELETE /admin/realms/{realm}/clients/{uuid}/authz/resource-server/scope/{scope-id}
   * Supprime un scope.
   * Retourne 204 No Content.
   */
  async deleteScope(
    clientUuid: string,
    scopeId: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${authzBase(realm, clientUuid)}/scope/${encodeURIComponent(scopeId)}`
    );
  },

  /**
   * GET /admin/realms/{realm}/clients/{uuid}/authz/resource-server/scope/{scope-id}/permissions
   * Retourne les permissions associées à un scope.
   */
  async listScopePermissions(
    clientUuid: string,
    scopeId: string,
    realm?: string
  ): Promise<PolicyRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${authzBase(realm, clientUuid)}/scope/${encodeURIComponent(scopeId)}/permissions`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(PolicyRepresentationSchema, d));
  },

  /**
   * GET /admin/realms/{realm}/clients/{uuid}/authz/resource-server/scope/{scope-id}/resources
   * Retourne les ressources associées à un scope.
   */
  async listScopeResources(
    clientUuid: string,
    scopeId: string,
    realm?: string
  ): Promise<ResourceRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${authzBase(realm, clientUuid)}/scope/${encodeURIComponent(scopeId)}/resources`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(ResourceRepresentationSchema, d));
  },

  // ─────────────────────────────────────────────────────────
  // 6. SETTINGS (endpoint distinct de resource-server)
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/clients/{uuid}/authz/resource-server/settings
   * Retourne les paramètres du resource server (décision, enforcement, etc.)
   * Endpoint distinct de getResourceServer() — retourne les settings seuls.
   */
  async getResourceServerSettings(
    clientUuid: string,
    realm?: string
  ): Promise<ResourceServerRepresentation> {
    const data = await kc.get<unknown>(`${authzBase(realm, clientUuid)}/settings`);
    return safe(ResourceServerRepresentationSchema, data);
  },
};

// ── Export par défaut ────────────────────────────────────────
export default keycloakAuthorizationService;
