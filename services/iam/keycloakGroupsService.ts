// ============================================================
// services/iam/keycloakGroupsService.ts
// Service complet — Gestion des Groupes Keycloak Admin REST API v26
//
// Couvre TOUS les endpoints /admin/realms/{realm}/groups/*
// selon la documentation officielle Keycloak 26.6.1
//
// Endpoints couverts (22 au total) :
//   GET    /groups                                                  → list()
//   GET    /groups/count                                            → count()
//   POST   /groups                                                  → create()
//   GET    /groups/{group-id}                                       → getById()
//   PUT    /groups/{group-id}                                       → update()
//   DELETE /groups/{group-id}                                       → delete()
//   GET    /groups/{group-id}/children                              → listChildren()
//   POST   /groups/{group-id}/children                              → createChild()
//   GET    /groups/{group-id}/members                               → listMembers()
//   GET    /groups/{group-id}/management/permissions                → getManagementPermissions()
//   PUT    /groups/{group-id}/management/permissions                → setManagementPermissions()
//   GET    /groups/{group-id}/role-mappings                         → listRoleMappings()
//   GET    /groups/{group-id}/role-mappings/realm                   → listRealmRoleMappings()
//   GET    /groups/{group-id}/role-mappings/realm/available         → listAvailableRealmRoles()
//   GET    /groups/{group-id}/role-mappings/realm/composite         → listCompositeRealmRoleMappings()
//   POST   /groups/{group-id}/role-mappings/realm                   → addRealmRoles()
//   DELETE /groups/{group-id}/role-mappings/realm                   → removeRealmRoles()
//   GET    /groups/{group-id}/role-mappings/clients/{client-id}     → listClientRoleMappings()
//   GET    /groups/{group-id}/role-mappings/clients/{client-id}/available  → listAvailableClientRoles()
//   GET    /groups/{group-id}/role-mappings/clients/{client-id}/composite  → listCompositeClientRoleMappings()
//   POST   /groups/{group-id}/role-mappings/clients/{client-id}     → addClientRoles()
//   DELETE /groups/{group-id}/role-mappings/clients/{client-id}     → removeClientRoles()
//
// Authentification : Bearer token via httpClient (tokenManager)
// Base URL         : NEXT_PUBLIC_KEYCLOAK_URL + /admin/realms/{realm}
// ============================================================

import { z }          from 'zod';
import { httpClient } from '@/lib/http-client';
import { adminBase as _adminBaseResolver } from './_realmHelper';
import {
  // Schémas
  GroupRepresentationSchema,
  GroupListSchema,
  GroupCountSchema,
  GroupMemberListSchema,
  RoleRepresentationSchema,
  RoleListSchema,
  RoleMappingRepresentationSchema,
  ManagementPermissionReferenceSchema,
  // Types
  type GroupRepresentation,
  type GroupList,
  type GroupCount,
  type GroupMemberRepresentation,
  type RoleRepresentation,
  type RoleMappingRepresentation,
  type ManagementPermissionReference,
  type CreateGroupPayload,
  type UpdateGroupPayload,
  type CreateChildGroupPayload,
  type ManagementPermissionPayload,
  type GroupsListFilters,
  type GroupsCountFilters,
  type GroupChildrenFilters,
  type GroupMembersFilters,
} from '@/lib/models/iam/keycloak-group.model';

// ── URL de base Keycloak ──────────────────────────────────────

/**
 * Construit le préfixe d'URL admin pour un realm donné.
 */
/**
 * Retourne l'URL Admin REST API — realm extrait dynamiquement du sous-domaine.
 */
function adminBase(realm?: string): string {
  return _adminBaseResolver(realm);
}

// ── Helper de parsing sécurisé (dégradé gracieux) ────────────
function safe<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  // Dégradé : retourne la donnée brute si l'hydratation Zod échoue
  return data as T;
}

// ── Wrapper interne vers httpClient (Bearer automatique) ─────
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

// ── Extraction des erreurs Keycloak ──────────────────────────
export function extractKeycloakGroupError(
  error: unknown,
  fallback = 'Une erreur inattendue est survenue'
): string {
  if (error instanceof Error) {
    const msg = error.message;
    if (msg.includes('409') || msg.toLowerCase().includes('exists'))
      return 'Un groupe avec ce nom existe déjà dans ce realm ou sous ce parent';
    if (msg.includes('404'))
      return 'Groupe introuvable';
    if (msg.includes('403'))
      return 'Permission insuffisante pour effectuer cette action sur les groupes';
    if (msg.includes('400'))
      return 'Données invalides — vérifiez les champs du groupe';
    if (msg.includes('500'))
      return 'Erreur interne du serveur Keycloak';
    return msg || fallback;
  }
  return fallback;
}

// ============================================================
// SERVICE PRINCIPAL
// ============================================================

export const keycloakGroupsService = {

  // ─────────────────────────────────────────────────────────
  // 1. LISTE & COMPTAGE
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/groups
   * Retourne la hiérarchie des groupes du realm.
   *
   * - Sans paramètre : retourne les groupes top-level sans leurs subGroups.
   * - Avec `search` ou `q` : remonte les subGroups correspondants.
   * - `populateHierarchy` (défaut: true) : inclut le subGroupCount.
   * - `briefRepresentation` (défaut: false) : retourne seulement id, name, path.
   */
  async list(
    filters: GroupsListFilters = {},
    realm?: string
  ): Promise<GroupRepresentation[]> {
    const params: Record<string, unknown> = {};

    if (filters.first               !== undefined) params.first               = filters.first;
    if (filters.max                 !== undefined) params.max                 = filters.max;
    if (filters.search)                            params.search               = filters.search;
    if (filters.exact               !== undefined) params.exact               = filters.exact;
    if (filters.q)                                 params.q                    = filters.q;
    if (filters.briefRepresentation !== undefined) params.briefRepresentation = filters.briefRepresentation;
    if (filters.populateHierarchy   !== undefined) params.populateHierarchy   = filters.populateHierarchy;

    const data = await kc.get<unknown[]>(`${adminBase(realm)}/groups`, params);
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(GroupRepresentationSchema, d));
  },

  /**
   * GET /admin/realms/{realm}/groups/count
   * Retourne le nombre de groupes du realm.
   * Paramètre `top` : si true, compte uniquement les groupes top-level.
   * Paramètre `search` : filtre par nom avant de compter.
   * Retourne Map<String, Long> → { count: N }
   */
  async count(
    filters: GroupsCountFilters = {},
    realm?: string
  ): Promise<number> {
    const params: Record<string, unknown> = {};
    if (filters.search) params.search = filters.search;
    if (filters.top !== undefined) params.top = filters.top;

    const data = await kc.get<unknown>(`${adminBase(realm)}/groups/count`, params);
    const parsed = safe(GroupCountSchema, data);
    return (parsed as { count?: number }).count ?? 0;
  },

  // ─────────────────────────────────────────────────────────
  // 2. CRUD GROUPE
  // ─────────────────────────────────────────────────────────

  /**
   * POST /admin/realms/{realm}/groups
   * Crée un groupe top-level dans le realm.
   * Si un groupe avec ce nom existe déjà → 409 Conflict.
   * Retourne 201 Created avec Location header pointant vers le nouveau groupe.
   */
  async create(
    payload: CreateGroupPayload,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(`${adminBase(realm)}/groups`, payload);
  },

  /**
   * GET /admin/realms/{realm}/groups/{group-id}
   * Retourne la représentation complète d'un groupe (avec subGroups, roles, etc.).
   */
  async getById(
    groupId: string,
    realm?: string
  ): Promise<GroupRepresentation> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/groups/${encodeURIComponent(groupId)}`
    );
    return safe(GroupRepresentationSchema, data);
  },

  /**
   * PUT /admin/realms/{realm}/groups/{group-id}
   * Met à jour un groupe existant. Les sous-groupes sont ignorés.
   * Retourne 204 No Content en cas de succès.
   */
  async update(
    groupId: string,
    payload: UpdateGroupPayload,
    realm?: string
  ): Promise<void> {
    await kc.put<unknown>(
      `${adminBase(realm)}/groups/${encodeURIComponent(groupId)}`,
      payload
    );
  },

  /**
   * DELETE /admin/realms/{realm}/groups/{group-id}
   * Supprime un groupe et tous ses sous-groupes de façon récursive.
   * Retourne 204 No Content.
   */
  async delete(
    groupId: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${adminBase(realm)}/groups/${encodeURIComponent(groupId)}`
    );
  },

  // ─────────────────────────────────────────────────────────
  // 3. SOUS-GROUPES (CHILDREN)
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/groups/{group-id}/children
   * Retourne la liste paginée des sous-groupes directs d'un groupe.
   * `populateHierarchy` (défaut: true) : inclut subGroupCount pour chaque résultat.
   * `briefRepresentation` (défaut: false) : retourne seulement id, name, path.
   */
  async listChildren(
    groupId: string,
    filters: GroupChildrenFilters = {},
    realm?: string
  ): Promise<GroupRepresentation[]> {
    const params: Record<string, unknown> = {};
    if (filters.first               !== undefined) params.first               = filters.first;
    if (filters.max                 !== undefined) params.max                 = filters.max;
    if (filters.briefRepresentation !== undefined) params.briefRepresentation = filters.briefRepresentation;
    if (filters.populateHierarchy   !== undefined) params.populateHierarchy   = filters.populateHierarchy;

    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/groups/${encodeURIComponent(groupId)}/children`,
      params
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(GroupRepresentationSchema, d));
  },

  /**
   * POST /admin/realms/{realm}/groups/{group-id}/children
   * Crée un sous-groupe ou déplace un groupe existant sous ce parent.
   * - Si `payload.id` est fourni → déplace le groupe existant.
   * - Si `payload.id` est absent → crée un nouveau sous-groupe.
   * Retourne 204 No Content si déplacement, 201 Created si création.
   */
  async createChild(
    parentGroupId: string,
    payload: CreateChildGroupPayload,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/groups/${encodeURIComponent(parentGroupId)}/children`,
      payload
    );
  },

  // ─────────────────────────────────────────────────────────
  // 4. MEMBRES DU GROUPE
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/groups/{group-id}/members
   * Retourne un flux paginé d'utilisateurs appartenant au groupe.
   * `briefRepresentation` (défaut: false) : retourne seulement id, username, email.
   * Note : n'inclut pas les membres hérités des sous-groupes.
   */
  async listMembers(
    groupId: string,
    filters: GroupMembersFilters = {},
    realm?: string
  ): Promise<GroupMemberRepresentation[]> {
    const params: Record<string, unknown> = {};
    if (filters.first               !== undefined) params.first               = filters.first;
    if (filters.max                 !== undefined) params.max                 = filters.max;
    if (filters.briefRepresentation !== undefined) params.briefRepresentation = filters.briefRepresentation;

    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/groups/${encodeURIComponent(groupId)}/members`,
      params
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(GroupMemberListSchema.element, d));
  },

  // ─────────────────────────────────────────────────────────
  // 5. PERMISSIONS DE GESTION (FINE-GRAINED AUTHORIZATION)
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/groups/{group-id}/management/permissions
   * Indique si les permissions d'autorisation fine-grained sont activées
   * pour ce groupe, et retourne une référence vers la ressource d'autorisation.
   */
  async getManagementPermissions(
    groupId: string,
    realm?: string
  ): Promise<ManagementPermissionReference> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/groups/${encodeURIComponent(groupId)}/management/permissions`
    );
    return safe(ManagementPermissionReferenceSchema, data);
  },

  /**
   * PUT /admin/realms/{realm}/groups/{group-id}/management/permissions
   * Active ou désactive les permissions d'autorisation fine-grained pour ce groupe.
   * Retourne la référence mise à jour (ManagementPermissionReference).
   */
  async setManagementPermissions(
    groupId: string,
    payload: ManagementPermissionPayload,
    realm?: string
  ): Promise<ManagementPermissionReference> {
    const data = await kc.put<unknown>(
      `${adminBase(realm)}/groups/${encodeURIComponent(groupId)}/management/permissions`,
      payload
    );
    return safe(ManagementPermissionReferenceSchema, data);
  },

  // ─────────────────────────────────────────────────────────
  // 6. ROLE MAPPINGS — VUE GLOBALE
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/groups/{group-id}/role-mappings
   * Retourne tous les role mappings (realm + clients) associés au groupe.
   * La structure retournée : { realmMappings: [...], clientMappings: { clientId: { mappings: [...] } } }
   */
  async listRoleMappings(
    groupId: string,
    realm?: string
  ): Promise<RoleMappingRepresentation> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/groups/${encodeURIComponent(groupId)}/role-mappings`
    );
    return safe(RoleMappingRepresentationSchema, data);
  },

  // ─────────────────────────────────────────────────────────
  // 7. REALM ROLE MAPPINGS
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/groups/{group-id}/role-mappings/realm
   * Retourne les realm roles directement assignés au groupe (non composites inclus).
   */
  async listRealmRoleMappings(
    groupId: string,
    realm?: string
  ): Promise<RoleRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/groups/${encodeURIComponent(groupId)}/role-mappings/realm`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  /**
   * GET /admin/realms/{realm}/groups/{group-id}/role-mappings/realm/available
   * Retourne les realm roles disponibles qui peuvent être ajoutés au groupe
   * (ceux qui ne lui sont pas encore assignés).
   */
  async listAvailableRealmRoles(
    groupId: string,
    realm?: string
  ): Promise<RoleRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/groups/${encodeURIComponent(groupId)}/role-mappings/realm/available`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  /**
   * GET /admin/realms/{realm}/groups/{group-id}/role-mappings/realm/composite
   * Retourne les realm roles effectifs du groupe en résolvant récursivement
   * les rôles composites. Inclut les rôles hérités.
   */
  async listCompositeRealmRoleMappings(
    groupId: string,
    realm?: string
  ): Promise<RoleRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/groups/${encodeURIComponent(groupId)}/role-mappings/realm/composite`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  /**
   * POST /admin/realms/{realm}/groups/{group-id}/role-mappings/realm
   * Assigne des realm roles au groupe.
   * @param roles  Tableau de RoleRepresentation (au minimum { id, name }).
   * Retourne 204 No Content.
   */
  async addRealmRoles(
    groupId: string,
    roles: RoleRepresentation[],
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/groups/${encodeURIComponent(groupId)}/role-mappings/realm`,
      roles
    );
  },

  /**
   * DELETE /admin/realms/{realm}/groups/{group-id}/role-mappings/realm
   * Retire des realm roles du groupe.
   * @param roles  Tableau de RoleRepresentation (au minimum { id, name }).
   * Note : Keycloak attend les rôles dans le body du DELETE.
   * httpClient.delete ne supporte pas le body — on passe par fetch direct.
   * Retourne 204 No Content.
   */
  async removeRealmRoles(
    groupId: string,
    roles: RoleRepresentation[],
    realm?: string
  ): Promise<void> {
    // DELETE avec body — nécessite fetch direct car httpClient.delete ne supporte pas le body
    const res = await httpClient.fetch(
      `${adminBase(realm)}/groups/${encodeURIComponent(groupId)}/role-mappings/realm`,
      {
        method: 'DELETE',
        body:   JSON.stringify(roles),
      }
    );
    if (!res.ok && res.status !== 204) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(
        typeof err.detail === 'string' ? err.detail : res.statusText
      );
    }
  },

  // ─────────────────────────────────────────────────────────
  // 8. CLIENT ROLE MAPPINGS
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/groups/{group-id}/role-mappings/clients/{client-id}
   * Retourne les client roles directement assignés au groupe pour un client donné.
   * @param clientId  UUID du client (pas le clientId textuel).
   */
  async listClientRoleMappings(
    groupId: string,
    clientId: string,
    realm?: string
  ): Promise<RoleRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/groups/${encodeURIComponent(groupId)}/role-mappings/clients/${encodeURIComponent(clientId)}`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  /**
   * GET /admin/realms/{realm}/groups/{group-id}/role-mappings/clients/{client-id}/available
   * Retourne les client roles disponibles (non encore assignés) pour ce client.
   * @param clientId  UUID du client.
   */
  async listAvailableClientRoles(
    groupId: string,
    clientId: string,
    realm?: string
  ): Promise<RoleRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/groups/${encodeURIComponent(groupId)}/role-mappings/clients/${encodeURIComponent(clientId)}/available`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  /**
   * GET /admin/realms/{realm}/groups/{group-id}/role-mappings/clients/{client-id}/composite
   * Retourne les client roles effectifs en résolvant récursivement les composites.
   * @param clientId  UUID du client.
   */
  async listCompositeClientRoleMappings(
    groupId: string,
    clientId: string,
    realm?: string
  ): Promise<RoleRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/groups/${encodeURIComponent(groupId)}/role-mappings/clients/${encodeURIComponent(clientId)}/composite`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  /**
   * POST /admin/realms/{realm}/groups/{group-id}/role-mappings/clients/{client-id}
   * Assigne des client roles au groupe pour un client donné.
   * @param clientId  UUID du client.
   * @param roles     Tableau de RoleRepresentation (au minimum { id, name }).
   * Retourne 204 No Content.
   */
  async addClientRoles(
    groupId: string,
    clientId: string,
    roles: RoleRepresentation[],
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/groups/${encodeURIComponent(groupId)}/role-mappings/clients/${encodeURIComponent(clientId)}`,
      roles
    );
  },

  /**
   * DELETE /admin/realms/{realm}/groups/{group-id}/role-mappings/clients/{client-id}
   * Retire des client roles du groupe pour un client donné.
   * @param clientId  UUID du client.
   * @param roles     Tableau de RoleRepresentation (au minimum { id, name }).
   * Note : DELETE avec body — utilise fetch direct.
   * Retourne 204 No Content.
   */
  async removeClientRoles(
    groupId: string,
    clientId: string,
    roles: RoleRepresentation[],
    realm?: string
  ): Promise<void> {
    const res = await httpClient.fetch(
      `${adminBase(realm)}/groups/${encodeURIComponent(groupId)}/role-mappings/clients/${encodeURIComponent(clientId)}`,
      {
        method: 'DELETE',
        body:   JSON.stringify(roles),
      }
    );
    if (!res.ok && res.status !== 204) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(
        typeof err.detail === 'string' ? err.detail : res.statusText
      );
    }
  },

  // ─────────────────────────────────────────────────────────
  // 9. MÉTHODES UTILITAIRES COMPOSÉES
  // ─────────────────────────────────────────────────────────

  /**
   * Recherche paginée de groupes avec valeurs par défaut raisonnables.
   * Utilise le paramètre `search` de Keycloak (recherche partielle sur le nom).
   */
  async search(
    query: string,
    options: { first?: number; max?: number; exact?: boolean } = {},
    realm?: string
  ): Promise<GroupRepresentation[]> {
    return keycloakGroupsService.list(
      {
        search: query,
        first:  options.first ?? 0,
        max:    options.max   ?? 50,
        exact:  options.exact ?? false,
      },
      realm
    );
  },

  /**
   * Recherche un groupe par son nom exact.
   * Retourne null si non trouvé.
   */
  async findByName(
    name: string,
    realm?: string
  ): Promise<GroupRepresentation | null> {
    const groups = await keycloakGroupsService.list(
      { search: name, exact: true, max: 1 },
      realm
    );
    return groups[0] ?? null;
  },

  /**
   * Recherche un groupe par son path complet (ex: "/parent/child").
   * Retourne null si non trouvé.
   * Utilise la recherche exacte et filtre côté client sur le path.
   */
  async findByPath(
    path: string,
    realm?: string
  ): Promise<GroupRepresentation | null> {
    // On extrait le nom du dernier segment pour la recherche
    const name = path.split('/').filter(Boolean).pop() ?? path;
    const groups = await keycloakGroupsService.list(
      { search: name, exact: true },
      realm
    );
    return groups.find((g) => g.path === path) ?? null;
  },

  /**
   * Retourne l'arbre de groupes complet jusqu'à une profondeur donnée.
   * Résout récursivement les sous-groupes via listChildren.
   * @param maxDepth  Profondeur maximale (défaut: 3 pour limiter les appels réseau).
   */
  async getTree(
    maxDepth: number = 3,
    realm?: string
  ): Promise<GroupRepresentation[]> {
    const roots = await keycloakGroupsService.list({}, realm);
    if (maxDepth <= 1) return roots;

    const resolveChildren = async (
      group: GroupRepresentation,
      depth: number
    ): Promise<GroupRepresentation> => {
      if (depth <= 0 || !group.id) return group;
      const children = await keycloakGroupsService.listChildren(group.id, {}, realm);
      const resolvedChildren = await Promise.all(
        children.map((child) => resolveChildren(child, depth - 1))
      );
      return { ...group, subGroups: resolvedChildren };
    };

    return Promise.all(roots.map((g) => resolveChildren(g, maxDepth - 1)));
  },

  /**
   * Assigne un realm role à un groupe en une seule opération.
   * Alias de addRealmRoles avec un seul rôle.
   */
  async assignRealmRole(
    groupId: string,
    role: RoleRepresentation,
    realm?: string
  ): Promise<void> {
    return keycloakGroupsService.addRealmRoles(groupId, [role], realm);
  },

  /**
   * Retire un realm role d'un groupe en une seule opération.
   * Alias de removeRealmRoles avec un seul rôle.
   */
  async unassignRealmRole(
    groupId: string,
    role: RoleRepresentation,
    realm?: string
  ): Promise<void> {
    return keycloakGroupsService.removeRealmRoles(groupId, [role], realm);
  },

  /**
   * Assigne un client role à un groupe en une seule opération.
   * Alias de addClientRoles avec un seul rôle.
   */
  async assignClientRole(
    groupId: string,
    clientId: string,
    role: RoleRepresentation,
    realm?: string
  ): Promise<void> {
    return keycloakGroupsService.addClientRoles(groupId, clientId, [role], realm);
  },

  /**
   * Retire un client role d'un groupe en une seule opération.
   * Alias de removeClientRoles avec un seul rôle.
   */
  async unassignClientRole(
    groupId: string,
    clientId: string,
    role: RoleRepresentation,
    realm?: string
  ): Promise<void> {
    return keycloakGroupsService.removeClientRoles(groupId, clientId, [role], realm);
  },

  /**
   * Déplace un groupe existant sous un nouveau parent.
   * Alias de createChild avec l'id du groupe à déplacer.
   */
  async moveToParent(
    groupId: string,
    newParentGroupId: string,
    realm?: string
  ): Promise<void> {
    // Récupère d'abord le groupe pour avoir son nom
    const group = await keycloakGroupsService.getById(groupId, realm);
    await keycloakGroupsService.createChild(
      newParentGroupId,
      { id: groupId, name: group.name ?? '' },
      realm
    );
  },

  /**
   * Retourne le nombre total de membres d'un groupe.
   * Effectue une requête avec max=0 et exploite la pagination.
   * @note Keycloak ne fournit pas d'endpoint /groups/{id}/members/count.
   *       On pagine avec max=1 et on récupère le total via une requête large.
   */
  async countMembers(
    groupId: string,
    realm?: string
  ): Promise<number> {
    // Keycloak n'a pas de /members/count → on récupère tous les membres (paginé par 1000)
    const members = await keycloakGroupsService.listMembers(
      groupId,
      { max: 1000, briefRepresentation: true },
      realm
    );
    return members.length;
  },

  /**
   * Vérifie si un utilisateur est membre direct d'un groupe.
   * @param userId  ID de l'utilisateur à rechercher.
   */
  async hasMember(
    groupId: string,
    userId: string,
    realm?: string
  ): Promise<boolean> {
    const members = await keycloakGroupsService.listMembers(
      groupId,
      { max: 1000, briefRepresentation: true },
      realm
    );
    return members.some((m) => m.id === userId);
  },
};

// ── Export par défaut ────────────────────────────────────────
export default keycloakGroupsService;
