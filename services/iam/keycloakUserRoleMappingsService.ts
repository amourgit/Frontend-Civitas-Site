// ============================================================
// services/iam/keycloakUserRoleMappingsService.ts
// Service complet — Gestion des Role Mappings Utilisateurs Keycloak Admin REST API v26
//
// Couvre TOUS les endpoints /admin/realms/{realm}/users/{user-id}/role-mappings/*
// selon la documentation officielle Keycloak 26.6.1
//
// Endpoints couverts — User Role Mappings : 11 au total
//
// ── ROLE MAPPINGS GLOBAUX ────────────────────────────────────
//   GET    /users/{user-id}/role-mappings                              → listAll()
//
// ── ROLE MAPPINGS REALM ───────────────────────────────────────
//   GET    /users/{user-id}/role-mappings/realm                        → listRealmRoles()
//   GET    /users/{user-id}/role-mappings/realm/available              → listAvailableRealmRoles()
//   GET    /users/{user-id}/role-mappings/realm/composite              → listCompositeRealmRoles()
//   POST   /users/{user-id}/role-mappings/realm                        → addRealmRoles()
//   DELETE /users/{user-id}/role-mappings/realm                        → removeRealmRoles()
//
// ── ROLE MAPPINGS CLIENT ──────────────────────────────────────
//   GET    /users/{user-id}/role-mappings/clients/{client-id}          → listClientRoles()
//   GET    /users/{user-id}/role-mappings/clients/{client-id}/available → listAvailableClientRoles()
//   GET    /users/{user-id}/role-mappings/clients/{client-id}/composite → listCompositeClientRoles()
//   POST   /users/{user-id}/role-mappings/clients/{client-id}          → addClientRoles()
//   DELETE /users/{user-id}/role-mappings/clients/{client-id}          → removeClientRoles()
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
  id:          z.string().optional(),
  name:        z.string().optional(),
  description: z.string().optional(),
  composite:   z.boolean().optional(),
  clientRole:  z.boolean().optional(),
  containerId: z.string().optional(),
  attributes:  z.record(z.array(z.string())).optional(),
}).passthrough();

const MappingsRepresentationSchema = z.object({
  realmMappings:  z.array(z.record(z.unknown())).optional(),
  clientMappings: z.record(z.unknown()).optional(),
}).passthrough();

export type RoleRepresentation      = z.infer<typeof RoleRepresentationSchema>;
export type MappingsRepresentation  = z.infer<typeof MappingsRepresentationSchema>;

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
  async delete<T>(url: string): Promise<T> {
    return httpClient.delete<T>(url);
  },
};

// ── Helper URL de base pour un utilisateur ───────────────────
function userBase(realm: string, userId: string): string {
  return `${adminBase(realm)}/users/${encodeURIComponent(userId)}/role-mappings`;
}

// ============================================================
// SERVICE PRINCIPAL
// ============================================================

export const keycloakUserRoleMappingsService = {

  // ─────────────────────────────────────────────────────────
  // 1. MAPPINGS GLOBAUX
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/users/{user-id}/role-mappings
   * Retourne tous les role-mappings (realm + clients) d'un utilisateur.
   */
  async listAll(
    userId: string,
    realm?: string
  ): Promise<MappingsRepresentation> {
    const data = await kc.get<unknown>(`${userBase(realm, userId)}`);
    return safe(MappingsRepresentationSchema, data);
  },

  // ─────────────────────────────────────────────────────────
  // 2. ROLE MAPPINGS REALM
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/users/{user-id}/role-mappings/realm
   * Retourne les rôles realm directement assignés à l'utilisateur.
   */
  async listRealmRoles(
    userId: string,
    realm?: string
  ): Promise<RoleRepresentation[]> {
    const data = await kc.get<unknown[]>(`${userBase(realm, userId)}/realm`);
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  /**
   * GET /admin/realms/{realm}/users/{user-id}/role-mappings/realm/available
   * Retourne les rôles realm disponibles (non encore assignés) à l'utilisateur.
   */
  async listAvailableRealmRoles(
    userId: string,
    realm?: string
  ): Promise<RoleRepresentation[]> {
    const data = await kc.get<unknown[]>(`${userBase(realm, userId)}/realm/available`);
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  /**
   * GET /admin/realms/{realm}/users/{user-id}/role-mappings/realm/composite
   * Retourne les rôles realm effectifs (incluant composites hérités) de l'utilisateur.
   */
  async listCompositeRealmRoles(
    userId: string,
    realm?: string
  ): Promise<RoleRepresentation[]> {
    const data = await kc.get<unknown[]>(`${userBase(realm, userId)}/realm/composite`);
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  /**
   * POST /admin/realms/{realm}/users/{user-id}/role-mappings/realm
   * Assigne des rôles realm à l'utilisateur.
   * Retourne 204 No Content.
   */
  async addRealmRoles(
    userId: string,
    roles: RoleRepresentation[],
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(`${userBase(realm, userId)}/realm`, roles);
  },

  /**
   * DELETE /admin/realms/{realm}/users/{user-id}/role-mappings/realm
   * Retire des rôles realm de l'utilisateur.
   * Retourne 204 No Content.
   */
  async removeRealmRoles(
    userId: string,
    roles: RoleRepresentation[],
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(`${userBase(realm, userId)}/realm`);
  },

  // ─────────────────────────────────────────────────────────
  // 3. ROLE MAPPINGS CLIENT
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/users/{user-id}/role-mappings/clients/{client-id}
   * Retourne les rôles d'un client directement assignés à l'utilisateur.
   * @param clientId  UUID du client
   */
  async listClientRoles(
    userId: string,
    clientId: string,
    realm?: string
  ): Promise<RoleRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${userBase(realm, userId)}/clients/${encodeURIComponent(clientId)}`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  /**
   * GET /admin/realms/{realm}/users/{user-id}/role-mappings/clients/{client-id}/available
   * Retourne les rôles d'un client disponibles (non encore assignés) à l'utilisateur.
   */
  async listAvailableClientRoles(
    userId: string,
    clientId: string,
    realm?: string
  ): Promise<RoleRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${userBase(realm, userId)}/clients/${encodeURIComponent(clientId)}/available`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  /**
   * GET /admin/realms/{realm}/users/{user-id}/role-mappings/clients/{client-id}/composite
   * Retourne les rôles effectifs (incluant composites) d'un client pour l'utilisateur.
   */
  async listCompositeClientRoles(
    userId: string,
    clientId: string,
    realm?: string
  ): Promise<RoleRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${userBase(realm, userId)}/clients/${encodeURIComponent(clientId)}/composite`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  /**
   * POST /admin/realms/{realm}/users/{user-id}/role-mappings/clients/{client-id}
   * Assigne des rôles client à l'utilisateur.
   * Retourne 204 No Content.
   */
  async addClientRoles(
    userId: string,
    clientId: string,
    roles: RoleRepresentation[],
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${userBase(realm, userId)}/clients/${encodeURIComponent(clientId)}`,
      roles
    );
  },

  /**
   * DELETE /admin/realms/{realm}/users/{user-id}/role-mappings/clients/{client-id}
   * Retire des rôles client de l'utilisateur.
   * Retourne 204 No Content.
   */
  async removeClientRoles(
    userId: string,
    clientId: string,
    roles: RoleRepresentation[],
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${userBase(realm, userId)}/clients/${encodeURIComponent(clientId)}`
    );
  },

  // ─────────────────────────────────────────────────────────
  // 4. UTILITAIRES COMPOSÉS
  // ─────────────────────────────────────────────────────────

  /**
   * Vérifie si un utilisateur possède un rôle realm spécifique (par nom).
   */
  async hasRealmRole(
    userId: string,
    roleName: string,
    realm?: string
  ): Promise<boolean> {
    const roles = await keycloakUserRoleMappingsService.listRealmRoles(userId, realm);
    return roles.some((r) => r.name === roleName);
  },

  /**
   * Retourne tous les noms de rôles realm effectifs (incluant composites) de l'utilisateur.
   */
  async getEffectiveRealmRoleNames(
    userId: string,
    realm?: string
  ): Promise<string[]> {
    const roles = await keycloakUserRoleMappingsService.listCompositeRealmRoles(userId, realm);
    return roles.map((r) => r.name ?? '').filter(Boolean);
  },
};

// ── Export par défaut ────────────────────────────────────────
export default keycloakUserRoleMappingsService;
