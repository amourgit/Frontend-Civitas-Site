// ============================================================
// services/iam/keycloakIdentityProvidersService.ts
// Service complet — Gestion des Identity Providers Keycloak Admin REST API v26
//
// Couvre TOUS les endpoints /admin/realms/{realm}/identity-provider/*
// selon la documentation officielle Keycloak 26.6.1
//
// Endpoints couverts (16 au total) :
//
// ── CRUD IDENTITY PROVIDER ────────────────────────────────────
//   GET    /identity-provider/instances                               → list()
//   POST   /identity-provider/instances                               → create()
//   GET    /identity-provider/instances/{alias}                       → getByAlias()
//   PUT    /identity-provider/instances/{alias}                       → update()
//   DELETE /identity-provider/instances/{alias}                       → delete()
//   GET    /identity-provider/instances/{alias}/export                → export()
//   GET    /identity-provider/instances/{alias}/reload-keys           → reloadKeys()
//
// ── MANAGEMENT PERMISSIONS ───────────────────────────────────
//   GET    /identity-provider/instances/{alias}/management/permissions → getManagementPermissions()
//   PUT    /identity-provider/instances/{alias}/management/permissions → setManagementPermissions()
//
// ── MAPPERS ──────────────────────────────────────────────────
//   GET    /identity-provider/instances/{alias}/mapper-types           → listMapperTypes()
//   GET    /identity-provider/instances/{alias}/mappers                → listMappers()
//   POST   /identity-provider/instances/{alias}/mappers                → createMapper()
//   GET    /identity-provider/instances/{alias}/mappers/{id}           → getMapper()
//   PUT    /identity-provider/instances/{alias}/mappers/{id}           → updateMapper()
//   DELETE /identity-provider/instances/{alias}/mappers/{id}           → deleteMapper()
//
// ── CONFIGURATION PROVIDER ───────────────────────────────────
//   POST   /identity-provider/import-config                            → importConfig()
//   GET    /identity-provider/providers/{provider_id}                  → getProviderFactory()
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

// ── Schémas Zod ───────────────────────────────────────────────

const IdentityProviderRepresentationSchema = z.object({
  alias:                     z.string().optional(),
  displayName:               z.string().optional(),
  internalId:                z.string().optional(),
  providerId:                z.string().optional(),
  enabled:                   z.boolean().optional(),
  updateProfileFirstLogin:   z.string().optional(),
  updateProfileFirstLoginMode: z.string().optional(),
  trustEmail:                z.boolean().optional(),
  storeToken:                z.boolean().optional(),
  addReadTokenRoleOnCreate:  z.boolean().optional(),
  authenticateByDefault:     z.boolean().optional(),
  linkOnly:                  z.boolean().optional(),
  firstBrokerLoginFlowAlias: z.string().optional(),
  postBrokerLoginFlowAlias:  z.string().optional(),
  config:                    z.record(z.string()).optional(),
}).passthrough();

const IdentityProviderMapperRepresentationSchema = z.object({
  id:                    z.string().optional(),
  name:                  z.string().optional(),
  identityProviderAlias: z.string().optional(),
  identityProviderMapper: z.string().optional(),
  config:                z.record(z.string()).optional(),
}).passthrough();

const IdentityProviderMapperTypeRepresentationSchema = z.object({
  id:           z.string().optional(),
  name:         z.string().optional(),
  category:     z.string().optional(),
  helpText:     z.string().optional(),
  properties:   z.array(z.record(z.unknown())).optional(),
}).passthrough();

const ManagementPermissionReferenceSchema = z.object({
  enabled:                  z.boolean().optional(),
  resource:                 z.string().optional(),
  scopePermissions:         z.record(z.string()).optional(),
}).passthrough();

export type IdentityProviderRepresentation = z.infer<typeof IdentityProviderRepresentationSchema>;
export type IdentityProviderMapperRepresentation = z.infer<typeof IdentityProviderMapperRepresentationSchema>;
export type IdentityProviderMapperTypeRepresentation = z.infer<typeof IdentityProviderMapperTypeRepresentationSchema>;
export type ManagementPermissionReference = z.infer<typeof ManagementPermissionReferenceSchema>;

export interface CreateIdentityProviderPayload {
  alias:      string;
  providerId: string;
  enabled?:   boolean;
  config?:    Record<string, string>;
  displayName?: string;
  trustEmail?: boolean;
  storeToken?: boolean;
  firstBrokerLoginFlowAlias?: string;
}

export interface CreateMapperPayload {
  name:                   string;
  identityProviderAlias:  string;
  identityProviderMapper: string;
  config?:                Record<string, string>;
}

export interface IdentityProvidersListFilters {
  /** Filtrer par realm (peut être différent du realm courant) */
  realmOnly?: boolean;
  /** Nombre max de résultats */
  max?:       number;
  /** Décalage (pagination) */
  first?:     number;
  /** Terme de recherche */
  search?:    string;
}

// ── Helper de parsing sécurisé ────────────────────────────────
function safe<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  return data as T;
}

// ── Extraction des erreurs ────────────────────────────────────
export function extractIdentityProviderError(
  error: unknown,
  fallback = 'Une erreur inattendue est survenue'
): string {
  if (error instanceof Error) {
    const msg = error.message;
    if (msg.includes('409')) return 'Un Identity Provider avec cet alias existe déjà';
    if (msg.includes('404')) return 'Identity Provider introuvable';
    if (msg.includes('403')) return 'Permission insuffisante';
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

export const keycloakIdentityProvidersService = {

  // ─────────────────────────────────────────────────────────
  // 1. CRUD IDENTITY PROVIDER
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/identity-provider/instances
   * Retourne la liste de tous les Identity Providers du realm.
   */
  async list(
    filters: IdentityProvidersListFilters = {},
    realm?: string
  ): Promise<IdentityProviderRepresentation[]> {
    const params: Record<string, unknown> = {};
    if (filters.max !== undefined)   params.max    = filters.max;
    if (filters.first !== undefined) params.first  = filters.first;
    if (filters.search)              params.search = filters.search;

    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/identity-provider/instances`,
      params
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(IdentityProviderRepresentationSchema, d));
  },

  /**
   * POST /admin/realms/{realm}/identity-provider/instances
   * Crée un nouvel Identity Provider.
   * Retourne 201 Created.
   */
  async create(
    payload: CreateIdentityProviderPayload,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/identity-provider/instances`,
      payload
    );
  },

  /**
   * GET /admin/realms/{realm}/identity-provider/instances/{alias}
   * Retourne les détails d'un Identity Provider par son alias.
   */
  async getByAlias(
    alias: string,
    realm?: string
  ): Promise<IdentityProviderRepresentation> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/identity-provider/instances/${encodeURIComponent(alias)}`
    );
    return safe(IdentityProviderRepresentationSchema, data);
  },

  /**
   * PUT /admin/realms/{realm}/identity-provider/instances/{alias}
   * Met à jour un Identity Provider existant.
   * Retourne 204 No Content.
   */
  async update(
    alias: string,
    payload: Partial<IdentityProviderRepresentation>,
    realm?: string
  ): Promise<void> {
    await kc.put<unknown>(
      `${adminBase(realm)}/identity-provider/instances/${encodeURIComponent(alias)}`,
      payload
    );
  },

  /**
   * DELETE /admin/realms/{realm}/identity-provider/instances/{alias}
   * Supprime un Identity Provider.
   * Retourne 204 No Content.
   */
  async delete(
    alias: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${adminBase(realm)}/identity-provider/instances/${encodeURIComponent(alias)}`
    );
  },

  /**
   * GET /admin/realms/{realm}/identity-provider/instances/{alias}/export
   * Exporte la configuration d'un Identity Provider au format XML (SAML) ou JSON.
   * @param format  'json' ou 'xml' (pour SAML)
   */
  async export(
    alias: string,
    format: 'json' | 'xml' = 'json',
    realm?: string
  ): Promise<unknown> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/identity-provider/instances/${encodeURIComponent(alias)}/export`,
      { format }
    );
    return data;
  },

  /**
   * GET /admin/realms/{realm}/identity-provider/instances/{alias}/reload-keys
   * Recharge les clés d'un Identity Provider (ex: après rotation de clés JWKS).
   * Retourne un Map<String, String>.
   */
  async reloadKeys(
    alias: string,
    realm?: string
  ): Promise<Record<string, string>> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/identity-provider/instances/${encodeURIComponent(alias)}/reload-keys`
    );
    return (data as Record<string, string>) ?? {};
  },

  // ─────────────────────────────────────────────────────────
  // 2. MANAGEMENT PERMISSIONS
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/identity-provider/instances/{alias}/management/permissions
   * Retourne les permissions de gestion fine pour cet Identity Provider.
   */
  async getManagementPermissions(
    alias: string,
    realm?: string
  ): Promise<ManagementPermissionReference> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/identity-provider/instances/${encodeURIComponent(alias)}/management/permissions`
    );
    return safe(ManagementPermissionReferenceSchema, data);
  },

  /**
   * PUT /admin/realms/{realm}/identity-provider/instances/{alias}/management/permissions
   * Active ou désactive les permissions de gestion fine pour cet Identity Provider.
   * Retourne la référence mise à jour.
   */
  async setManagementPermissions(
    alias: string,
    payload: { enabled: boolean },
    realm?: string
  ): Promise<ManagementPermissionReference> {
    const data = await kc.put<unknown>(
      `${adminBase(realm)}/identity-provider/instances/${encodeURIComponent(alias)}/management/permissions`,
      payload
    );
    return safe(ManagementPermissionReferenceSchema, data);
  },

  // ─────────────────────────────────────────────────────────
  // 3. MAPPERS
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/identity-provider/instances/{alias}/mapper-types
   * Retourne les types de mappers disponibles pour cet Identity Provider.
   * Retourne Map<String, IdentityProviderMapperTypeRepresentation>.
   */
  async listMapperTypes(
    alias: string,
    realm?: string
  ): Promise<Record<string, IdentityProviderMapperTypeRepresentation>> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/identity-provider/instances/${encodeURIComponent(alias)}/mapper-types`
    );
    return (data as Record<string, IdentityProviderMapperTypeRepresentation>) ?? {};
  },

  /**
   * GET /admin/realms/{realm}/identity-provider/instances/{alias}/mappers
   * Retourne la liste des mappers configurés pour cet Identity Provider.
   */
  async listMappers(
    alias: string,
    realm?: string
  ): Promise<IdentityProviderMapperRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/identity-provider/instances/${encodeURIComponent(alias)}/mappers`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(IdentityProviderMapperRepresentationSchema, d));
  },

  /**
   * POST /admin/realms/{realm}/identity-provider/instances/{alias}/mappers
   * Crée un nouveau mapper pour cet Identity Provider.
   * Retourne 201 Created.
   */
  async createMapper(
    alias: string,
    payload: CreateMapperPayload,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/identity-provider/instances/${encodeURIComponent(alias)}/mappers`,
      payload
    );
  },

  /**
   * GET /admin/realms/{realm}/identity-provider/instances/{alias}/mappers/{id}
   * Retourne les détails d'un mapper spécifique.
   */
  async getMapper(
    alias: string,
    mapperId: string,
    realm?: string
  ): Promise<IdentityProviderMapperRepresentation> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/identity-provider/instances/${encodeURIComponent(alias)}/mappers/${encodeURIComponent(mapperId)}`
    );
    return safe(IdentityProviderMapperRepresentationSchema, data);
  },

  /**
   * PUT /admin/realms/{realm}/identity-provider/instances/{alias}/mappers/{id}
   * Met à jour un mapper existant.
   * Retourne 204 No Content.
   */
  async updateMapper(
    alias: string,
    mapperId: string,
    payload: Partial<IdentityProviderMapperRepresentation>,
    realm?: string
  ): Promise<void> {
    await kc.put<unknown>(
      `${adminBase(realm)}/identity-provider/instances/${encodeURIComponent(alias)}/mappers/${encodeURIComponent(mapperId)}`,
      payload
    );
  },

  /**
   * DELETE /admin/realms/{realm}/identity-provider/instances/{alias}/mappers/{id}
   * Supprime un mapper.
   * Retourne 204 No Content.
   */
  async deleteMapper(
    alias: string,
    mapperId: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${adminBase(realm)}/identity-provider/instances/${encodeURIComponent(alias)}/mappers/${encodeURIComponent(mapperId)}`
    );
  },

  // ─────────────────────────────────────────────────────────
  // 4. CONFIGURATION & IMPORT
  // ─────────────────────────────────────────────────────────

  /**
   * POST /admin/realms/{realm}/identity-provider/import-config
   * Importe la configuration d'un Identity Provider depuis un fichier
   * (ex: SAML metadata XML, OIDC discovery JSON).
   * Retourne une Map<String, String> avec la configuration parsée.
   */
  async importConfig(
    payload: FormData | Record<string, unknown>,
    realm?: string
  ): Promise<Record<string, string>> {
    const data = await kc.post<unknown>(
      `${adminBase(realm)}/identity-provider/import-config`,
      payload
    );
    return (data as Record<string, string>) ?? {};
  },

  /**
   * GET /admin/realms/{realm}/identity-provider/providers/{provider_id}
   * Retourne les informations sur le factory d'un type de provider spécifique.
   * ex: provider_id = 'google', 'github', 'saml', 'oidc'
   */
  async getProviderFactory(
    providerId: string,
    realm?: string
  ): Promise<unknown> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/identity-provider/providers/${encodeURIComponent(providerId)}`
    );
    return data;
  },

  // ─────────────────────────────────────────────────────────
  // 5. UTILITAIRES COMPOSÉS
  // ─────────────────────────────────────────────────────────

  /**
   * Active ou désactive un Identity Provider en une seule opération.
   */
  async setEnabled(
    alias: string,
    enabled: boolean,
    realm?: string
  ): Promise<void> {
    return keycloakIdentityProvidersService.update(alias, { enabled }, realm);
  },

  /**
   * Retourne les Identity Providers activés uniquement.
   */
  async listEnabled(
    realm?: string
  ): Promise<IdentityProviderRepresentation[]> {
    const providers = await keycloakIdentityProvidersService.list({}, realm);
    return providers.filter((p) => p.enabled === true);
  },
};

// ── Export par défaut ────────────────────────────────────────
export default keycloakIdentityProvidersService;
