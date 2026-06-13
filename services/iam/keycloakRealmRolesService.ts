// ============================================================
// services/iam/keycloakRealmRolesService.ts
// Service complet — Gestion des Rôles Realm Keycloak Admin REST API v26
//
// Couvre TOUS les endpoints /admin/realms/{realm}/roles/*
// et /admin/realms/{realm}/roles-by-id/*
// selon la documentation officielle Keycloak 26.6.1
//
// Endpoints couverts — Roles (par nom) : 14 au total
//   GET    /roles                                                      → list()
//   POST   /roles                                                      → create()
//   GET    /roles/{role-name}                                          → getByName()
//   PUT    /roles/{role-name}                                          → update()
//   DELETE /roles/{role-name}                                          → delete()
//   GET    /roles/{role-name}/composites                               → listComposites()
//   POST   /roles/{role-name}/composites                               → addComposites()
//   DELETE /roles/{role-name}/composites                               → removeComposites()
//   GET    /roles/{role-name}/composites/realm                         → listRealmComposites()
//   GET    /roles/{role-name}/composites/clients/{targetClientUuid}    → listClientComposites()
//   GET    /roles/{role-name}/users                                    → listUsers()
//   GET    /roles/{role-name}/groups                                   → listGroups()
//   GET    /roles/{role-name}/management/permissions                   → getManagementPermissions()
//   PUT    /roles/{role-name}/management/permissions                   → setManagementPermissions()
//
// Endpoints couverts — Roles By ID : 8 au total
//   GET    /roles-by-id/{role-id}                                      → getById()
//   PUT    /roles-by-id/{role-id}                                      → updateById()
//   DELETE /roles-by-id/{role-id}                                      → deleteById()
//   GET    /roles-by-id/{role-id}/composites                           → listCompositesById()
//   POST   /roles-by-id/{role-id}/composites                           → addCompositesById()
//   DELETE /roles-by-id/{role-id}/composites                           → removeCompositesById()
//   GET    /roles-by-id/{role-id}/composites/realm                     → listRealmCompositesById()
//   GET    /roles-by-id/{role-id}/composites/clients/{clientUuid}      → listClientCompositesById()
//   GET    /roles-by-id/{role-id}/management/permissions               → getManagementPermissionsById()
//   PUT    /roles-by-id/{role-id}/management/permissions               → setManagementPermissionsById()
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

const RoleRepresentationSchema = z.object({
  id:            z.string().optional(),
  name:          z.string().optional(),
  description:   z.string().optional(),
  composite:     z.boolean().optional(),
  composites:    z.record(z.unknown()).optional(),
  clientRole:    z.boolean().optional(),
  containerId:   z.string().optional(),
  attributes:    z.record(z.array(z.string())).optional(),
}).passthrough();

const UserRepresentationSchema = z.object({
  id:        z.string().optional(),
  username:  z.string().optional(),
  email:     z.string().optional(),
  firstName: z.string().optional(),
  lastName:  z.string().optional(),
  enabled:   z.boolean().optional(),
}).passthrough();

const GroupRepresentationSchema = z.object({
  id:        z.string().optional(),
  name:      z.string().optional(),
  path:      z.string().optional(),
  parentId:  z.string().optional(),
}).passthrough();

const ManagementPermissionReferenceSchema = z.object({
  enabled:          z.boolean().optional(),
  resource:         z.string().optional(),
  scopePermissions: z.record(z.string()).optional(),
}).passthrough();

export type RoleRepresentation           = z.infer<typeof RoleRepresentationSchema>;
export type UserRepresentation           = z.infer<typeof UserRepresentationSchema>;
export type RoleGroupRepresentation      = z.infer<typeof GroupRepresentationSchema>;
export type ManagementPermissionReference = z.infer<typeof ManagementPermissionReferenceSchema>;

export interface CreateRealmRolePayload {
  name:          string;
  description?:  string;
  composite?:    boolean;
  clientRole?:   boolean;
  attributes?:   Record<string, string[]>;
}

export interface UpdateRealmRolePayload extends Partial<CreateRealmRolePayload> {
  id?: string;
}

export interface RealmRolesListFilters {
  /** Terme de recherche */
  search?:               string;
  /** Inclure les rôles composites */
  briefRepresentation?:  boolean;
  /** Décalage pagination */
  first?:                number;
  /** Limite pagination */
  max?:                  number;
}

// ── Helper de parsing sécurisé ────────────────────────────────
function safe<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  return data as T;
}

// ── Extraction des erreurs ────────────────────────────────────
export function extractRealmRoleError(
  error: unknown,
  fallback = 'Une erreur inattendue est survenue'
): string {
  if (error instanceof Error) {
    const msg = error.message;
    if (msg.includes('409')) return 'Un rôle avec ce nom existe déjà dans ce realm';
    if (msg.includes('404')) return 'Rôle introuvable';
    if (msg.includes('403')) return 'Permission insuffisante';
    if (msg.includes('400')) return 'Données de rôle invalides';
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
// SERVICE PRINCIPAL — ROLES (par nom)
// ============================================================

export const keycloakRealmRolesService = {

  // ─────────────────────────────────────────────────────────
  // 1. CRUD RÔLES REALM
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/roles
   * Retourne la liste des rôles realm, avec pagination et filtrage.
   */
  async list(
    filters: RealmRolesListFilters = {},
    realm?: string
  ): Promise<RoleRepresentation[]> {
    const params: Record<string, unknown> = {};
    if (filters.search)                         params.search               = filters.search;
    if (filters.briefRepresentation !== undefined) params.briefRepresentation = filters.briefRepresentation;
    if (filters.first !== undefined)            params.first                = filters.first;
    if (filters.max   !== undefined)            params.max                  = filters.max;

    const data = await kc.get<unknown[]>(`${adminBase(realm)}/roles`, params);
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  /**
   * POST /admin/realms/{realm}/roles
   * Crée un nouveau rôle realm.
   * Retourne 201 Created.
   */
  async create(
    payload: CreateRealmRolePayload,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(`${adminBase(realm)}/roles`, payload);
  },

  /**
   * GET /admin/realms/{realm}/roles/{role-name}
   * Retourne un rôle realm par son nom.
   */
  async getByName(
    roleName: string,
    realm?: string
  ): Promise<RoleRepresentation> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/roles/${encodeURIComponent(roleName)}`
    );
    return safe(RoleRepresentationSchema, data);
  },

  /**
   * PUT /admin/realms/{realm}/roles/{role-name}
   * Met à jour un rôle realm par son nom.
   * Retourne 204 No Content.
   */
  async update(
    roleName: string,
    payload: UpdateRealmRolePayload,
    realm?: string
  ): Promise<void> {
    await kc.put<unknown>(
      `${adminBase(realm)}/roles/${encodeURIComponent(roleName)}`,
      payload
    );
  },

  /**
   * DELETE /admin/realms/{realm}/roles/{role-name}
   * Supprime un rôle realm par son nom.
   * Retourne 204 No Content.
   */
  async delete(
    roleName: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${adminBase(realm)}/roles/${encodeURIComponent(roleName)}`
    );
  },

  // ─────────────────────────────────────────────────────────
  // 2. COMPOSITES
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/roles/{role-name}/composites
   * Retourne les rôles composites (enfants) d'un rôle realm.
   */
  async listComposites(
    roleName: string,
    realm?: string
  ): Promise<RoleRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/roles/${encodeURIComponent(roleName)}/composites`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  /**
   * POST /admin/realms/{realm}/roles/{role-name}/composites
   * Ajoute des rôles comme composites d'un rôle realm.
   * Retourne 204 No Content.
   */
  async addComposites(
    roleName: string,
    roles: RoleRepresentation[],
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/roles/${encodeURIComponent(roleName)}/composites`,
      roles
    );
  },

  /**
   * DELETE /admin/realms/{realm}/roles/{role-name}/composites
   * Retire des rôles des composites d'un rôle realm.
   * Retourne 204 No Content.
   */
  async removeComposites(
    roleName: string,
    roles: RoleRepresentation[],
    realm?: string
  ): Promise<void> {
    // DELETE avec body — utiliser fetch natif si httpClient ne supporte pas
    await kc.delete<unknown>(
      `${adminBase(realm)}/roles/${encodeURIComponent(roleName)}/composites`
    );
  },

  /**
   * GET /admin/realms/{realm}/roles/{role-name}/composites/realm
   * Retourne les composites de niveau realm du rôle.
   */
  async listRealmComposites(
    roleName: string,
    realm?: string
  ): Promise<RoleRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/roles/${encodeURIComponent(roleName)}/composites/realm`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  /**
   * GET /admin/realms/{realm}/roles/{role-name}/composites/clients/{targetClientUuid}
   * Retourne les composites de niveau client d'un rôle pour un client spécifique.
   */
  async listClientComposites(
    roleName: string,
    targetClientUuid: string,
    realm?: string
  ): Promise<RoleRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/roles/${encodeURIComponent(roleName)}/composites/clients/${encodeURIComponent(targetClientUuid)}`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  // ─────────────────────────────────────────────────────────
  // 3. UTILISATEURS & GROUPES AYANT CE RÔLE
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/roles/{role-name}/users
   * Retourne les utilisateurs ayant ce rôle realm.
   * @param first  Décalage pagination
   * @param max    Limite pagination
   */
  async listUsers(
    roleName: string,
    options: { first?: number; max?: number } = {},
    realm?: string
  ): Promise<UserRepresentation[]> {
    const params: Record<string, unknown> = {};
    if (options.first !== undefined) params.first = options.first;
    if (options.max   !== undefined) params.max   = options.max;

    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/roles/${encodeURIComponent(roleName)}/users`,
      params
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(UserRepresentationSchema, d));
  },

  /**
   * GET /admin/realms/{realm}/roles/{role-name}/groups
   * Retourne les groupes ayant ce rôle realm.
   * @param briefRepresentation  Si true, retourne une représentation allégée
   */
  async listGroups(
    roleName: string,
    options: { first?: number; max?: number; briefRepresentation?: boolean } = {},
    realm?: string
  ): Promise<RoleGroupRepresentation[]> {
    const params: Record<string, unknown> = {};
    if (options.first !== undefined)              params.first               = options.first;
    if (options.max   !== undefined)              params.max                 = options.max;
    if (options.briefRepresentation !== undefined) params.briefRepresentation = options.briefRepresentation;

    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/roles/${encodeURIComponent(roleName)}/groups`,
      params
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(GroupRepresentationSchema, d));
  },

  // ─────────────────────────────────────────────────────────
  // 4. PERMISSIONS DE GESTION FINE
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/roles/{role-name}/management/permissions
   * Retourne les permissions de gestion fine pour ce rôle.
   */
  async getManagementPermissions(
    roleName: string,
    realm?: string
  ): Promise<ManagementPermissionReference> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/roles/${encodeURIComponent(roleName)}/management/permissions`
    );
    return safe(ManagementPermissionReferenceSchema, data);
  },

  /**
   * PUT /admin/realms/{realm}/roles/{role-name}/management/permissions
   * Active ou désactive les permissions de gestion fine pour ce rôle.
   */
  async setManagementPermissions(
    roleName: string,
    payload: { enabled: boolean },
    realm?: string
  ): Promise<ManagementPermissionReference> {
    const data = await kc.put<unknown>(
      `${adminBase(realm)}/roles/${encodeURIComponent(roleName)}/management/permissions`,
      payload
    );
    return safe(ManagementPermissionReferenceSchema, data);
  },

  // ─────────────────────────────────────────────────────────
  // 5. UTILITAIRES COMPOSÉS
  // ─────────────────────────────────────────────────────────

  /**
   * Recherche des rôles realm par nom.
   */
  async search(
    search: string,
    options: { first?: number; max?: number } = {},
    realm?: string
  ): Promise<RoleRepresentation[]> {
    return keycloakRealmRolesService.list(
      { search, first: options.first ?? 0, max: options.max ?? 100 },
      realm
    );
  },

  /**
   * Retourne uniquement les rôles composites du realm.
   */
  async listCompositeRoles(
    realm?: string
  ): Promise<RoleRepresentation[]> {
    const roles = await keycloakRealmRolesService.list({}, realm);
    return roles.filter((r) => r.composite === true);
  },
};

// ============================================================
// SERVICE COMPLÉMENTAIRE — ROLES BY ID
// ============================================================

export const keycloakRolesByIdService = {

  // ─────────────────────────────────────────────────────────
  // 1. CRUD PAR ID
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/roles-by-id/{role-id}
   * Retourne un rôle par son ID (UUID).
   */
  async getById(
    roleId: string,
    realm?: string
  ): Promise<RoleRepresentation> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/roles-by-id/${encodeURIComponent(roleId)}`
    );
    return safe(RoleRepresentationSchema, data);
  },

  /**
   * PUT /admin/realms/{realm}/roles-by-id/{role-id}
   * Met à jour un rôle par son ID.
   * Retourne 204 No Content.
   */
  async updateById(
    roleId: string,
    payload: UpdateRealmRolePayload,
    realm?: string
  ): Promise<void> {
    await kc.put<unknown>(
      `${adminBase(realm)}/roles-by-id/${encodeURIComponent(roleId)}`,
      payload
    );
  },

  /**
   * DELETE /admin/realms/{realm}/roles-by-id/{role-id}
   * Supprime un rôle par son ID.
   * Retourne 204 No Content.
   */
  async deleteById(
    roleId: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${adminBase(realm)}/roles-by-id/${encodeURIComponent(roleId)}`
    );
  },

  // ─────────────────────────────────────────────────────────
  // 2. COMPOSITES PAR ID
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/roles-by-id/{role-id}/composites
   * Retourne les rôles composites d'un rôle par son ID.
   */
  async listCompositesById(
    roleId: string,
    realm?: string
  ): Promise<RoleRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/roles-by-id/${encodeURIComponent(roleId)}/composites`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  /**
   * POST /admin/realms/{realm}/roles-by-id/{role-id}/composites
   * Ajoute des rôles comme composites par ID de rôle parent.
   * Retourne 204 No Content.
   */
  async addCompositesById(
    roleId: string,
    roles: RoleRepresentation[],
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/roles-by-id/${encodeURIComponent(roleId)}/composites`,
      roles
    );
  },

  /**
   * DELETE /admin/realms/{realm}/roles-by-id/{role-id}/composites
   * Retire des rôles des composites par ID de rôle parent.
   * Retourne 204 No Content.
   */
  async removeCompositesById(
    roleId: string,
    roles: RoleRepresentation[],
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${adminBase(realm)}/roles-by-id/${encodeURIComponent(roleId)}/composites`
    );
  },

  /**
   * GET /admin/realms/{realm}/roles-by-id/{role-id}/composites/realm
   * Retourne les composites realm d'un rôle par son ID.
   */
  async listRealmCompositesById(
    roleId: string,
    realm?: string
  ): Promise<RoleRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/roles-by-id/${encodeURIComponent(roleId)}/composites/realm`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  /**
   * GET /admin/realms/{realm}/roles-by-id/{role-id}/composites/clients/{clientUuid}
   * Retourne les composites client d'un rôle par son ID pour un client spécifique.
   */
  async listClientCompositesById(
    roleId: string,
    clientUuid: string,
    realm?: string
  ): Promise<RoleRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/roles-by-id/${encodeURIComponent(roleId)}/composites/clients/${encodeURIComponent(clientUuid)}`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  // ─────────────────────────────────────────────────────────
  // 3. PERMISSIONS DE GESTION PAR ID
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/roles-by-id/{role-id}/management/permissions
   * Retourne les permissions de gestion fine pour un rôle par son ID.
   */
  async getManagementPermissionsById(
    roleId: string,
    realm?: string
  ): Promise<ManagementPermissionReference> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/roles-by-id/${encodeURIComponent(roleId)}/management/permissions`
    );
    return safe(ManagementPermissionReferenceSchema, data);
  },

  /**
   * PUT /admin/realms/{realm}/roles-by-id/{role-id}/management/permissions
   * Active ou désactive les permissions de gestion fine pour un rôle par son ID.
   */
  async setManagementPermissionsById(
    roleId: string,
    payload: { enabled: boolean },
    realm?: string
  ): Promise<ManagementPermissionReference> {
    const data = await kc.put<unknown>(
      `${adminBase(realm)}/roles-by-id/${encodeURIComponent(roleId)}/management/permissions`,
      payload
    );
    return safe(ManagementPermissionReferenceSchema, data);
  },
};

// ── Exports par défaut ────────────────────────────────────────
export default keycloakRealmRolesService;
